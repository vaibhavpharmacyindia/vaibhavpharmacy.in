const whatsapp = require("./whatsappApi");
const ocrService = require("./ocrService");
const medicineDb = require("../data/medicineDatabase");
const reminderService = require("./reminderService");
const interactions = require("./interactionChecker");
const { t, getLang, setLang } = require("../utils/i18n");

const PHARMACY = process.env.PHARMACY_NAME || "Vaibhav Pharmacy";
const PHARMACY_PHONE = process.env.PHARMACY_PHONE || "+91XXXXXXXXXX";

// ═══════════════════════════════════════════════════════════════
//  STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════
const userState = new Map();     // phone → { stage, ... }
const userMemory = new Map();    // phone → { name, firstSeen, lastSeen }
const processedMsgIds = new Set(); // dedup set for message IDs (TTL'd below)

// Clean up stale sessions every 30 minutes
setInterval(() => {
  const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
  for (const [phone, state] of userState) {
    if (state._lastActivity && state._lastActivity < thirtyMinAgo) {
      userState.delete(phone);
    }
  }
  // Trim dedup set (keep last 1000)
  if (processedMsgIds.size > 1000) {
    const arr = [...processedMsgIds];
    arr.slice(0, arr.length - 500).forEach((id) => processedMsgIds.delete(id));
  }
}, 30 * 60 * 1000);

// ─── Register the reminder callback ──────────────────────────
reminderService.setSendReminderFn(async (phone, medicine, type, extra) => {
  const lang = getLang(phone);
  if (type === "dose" || type === "dose_snoozed") {
    const schedule = typeof extra === "string" ? extra : "";
    const msg = t(phone, "reminderMsg", medicine, schedule, PHARMACY);
    await whatsapp.sendText(phone, msg);
    await whatsapp.sendButtons(phone, lang === "hi" ? "क्या आपने दवाई ली?" : "Did you take it?", [
      { id: `adh_taken_${medicine}`, title: t(phone, "btnTookIt") },
      { id: `adh_skip_${medicine}`, title: t(phone, "btnSkipped") },
      { id: `adh_snooze_${medicine}`, title: t(phone, "btnSnooze") },
    ]);
  } else if (type === "refill") {
    const msg = t(phone, "refillReminder", medicine, extra);
    await whatsapp.sendText(phone, msg);
    await whatsapp.sendButtons(phone, lang === "hi" ? "क्या दोबारा ऑर्डर करें?" : "Would you like to reorder?", [
      { id: `reorder_${medicine}`, title: t(phone, "btnReorder") },
      { id: "dismiss_refill", title: t(phone, "btnDismiss") },
    ]);
  }
});

// ═══════════════════════════════════════════════════════════════
//  MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════
async function handleIncoming(message, phone, name) {
  // Dedup: skip if we've already processed this message
  if (message.id && processedMsgIds.has(message.id)) return;
  if (message.id) processedMsgIds.add(message.id);

  // Track user memory
  if (!userMemory.has(phone)) {
    userMemory.set(phone, { name, firstSeen: Date.now(), lastSeen: Date.now() });
  } else {
    const mem = userMemory.get(phone);
    mem.name = name;
    mem.lastSeen = Date.now();
  }

  // Touch activity timestamp on current state
  const state = userState.get(phone);
  if (state) state._lastActivity = Date.now();

  try {
    switch (message.type) {
      case "text":
        await handleTextMessage(message.text.body, phone, name);
        break;
      case "image":
        await handleImageMessage(message.image, phone, name);
        break;
      case "interactive":
        await handleInteractiveMessage(message.interactive, phone, name);
        break;
      default:
        await whatsapp.sendText(phone, t(phone, "unsupportedType"));
    }
  } catch (err) {
    console.error(`Error [${phone}]:`, err);
    await whatsapp.sendText(phone, t(phone, "error", PHARMACY));
  }
}

// ═══════════════════════════════════════════════════════════════
//  TEXT MESSAGES
// ═══════════════════════════════════════════════════════════════
async function handleTextMessage(text, phone, name) {
  const lower = text.toLowerCase().trim();
  const state = userState.get(phone);

  // If user is in a stateful flow, route there
  if (state) return handleStatefulMessage(text, lower, phone, name, state);

  // ── Language switch ─────────────────────────────────────────
  if (lower === "hindi" || lower === "हिंदी") {
    setLang(phone, "hi");
    await whatsapp.sendText(phone, "भाषा *हिंदी* में बदल दी गई 🇮🇳");
    return sendMainMenu(phone);
  }
  if (lower === "english" || lower === "अंग्रेजी") {
    setLang(phone, "en");
    await whatsapp.sendText(phone, "Language switched to *English* 🇬🇧");
    return sendMainMenu(phone);
  }

  // ── Greetings ───────────────────────────────────────────────
  if (matchesAny(lower, ["hi", "hello", "hey", "hii", "hiii", "namaste", "start", "नमस्ते", "हाय"])) {
    return sendWelcome(phone, name);
  }

  // ── Menu / Help ─────────────────────────────────────────────
  if (matchesAny(lower, ["menu", "help", "options", "?", "मेनू", "मदद"])) {
    return sendMainMenu(phone);
  }

  // ── Talk to pharmacist ──────────────────────────────────────
  if (matchesAny(lower, ["pharmacist", "talk", "call", "human", "फार्मासिस्ट"])) {
    return sendPharmacistConnect(phone);
  }

  // ── Reminder commands ───────────────────────────────────────
  if (matchesAny(lower, ["reminder", "reminders", "my reminders", "list reminders", "रिमाइंडर"])) {
    return whatsapp.sendText(phone, reminderService.listReminders(phone));
  }
  if (lower.startsWith("remind ") || lower.startsWith("set reminder")) {
    const parts = lower.replace(/^(remind|set reminder)\s+/i, "").trim();
    return handleQuickReminder(phone, parts);
  }
  if (lower.startsWith("stop reminder") || lower.startsWith("remove reminder")) {
    const med = lower.replace(/^(stop|remove) reminder\s+/i, "").trim();
    return whatsapp.sendText(phone, reminderService.removeReminder(phone, med).message);
  }

  // ── Medicine info ───────────────────────────────────────────
  if (lower.startsWith("medicine") || lower.startsWith("med ") || lower.startsWith("info ") || lower.startsWith("दवाई ")) {
    const query = lower.replace(/^(medicine|med|info|दवाई)\s+/i, "").trim();
    return sendMedicineInfo(phone, query);
  }

  // ── Alternatives ────────────────────────────────────────────
  if (lower.startsWith("alt ") || lower.startsWith("generic ") || lower.startsWith("alternative ")) {
    const query = lower.replace(/^(alt|generic|alternative)\s+/i, "").trim();
    return sendAlternatives(phone, query);
  }

  // ── Try finding medicine names in text ──────────────────────
  const foundMeds = medicineDb.findMedicinesInText(lower);
  if (foundMeds.length > 0) {
    for (const med of foundMeds) await sendMedicineCard(phone, med);
    await checkAndSendInteractions(phone, foundMeds.map((m) => m.generic || m.names[0]));
    return whatsapp.sendButtons(phone, getLang(phone) === "hi" ? "क्या करना चाहेंगे?" : "What would you like to do?", [
      { id: "set_reminder_yes", title: t(phone, "btnSetReminders") },
      { id: "main_menu", title: t(phone, "btnMainMenu") },
    ]);
  }

  // ── Single medicine (exact) ─────────────────────────────────
  const singleMed = medicineDb.findMedicine(lower);
  if (singleMed) {
    await sendMedicineCard(phone, singleMed);
    return whatsapp.sendButtons(phone, getLang(phone) === "hi" ? "क्या करना चाहेंगे?" : "What would you like to do?", [
      { id: `remind_${singleMed.key}`, title: t(phone, "btnSetReminders") },
      { id: `alt_${singleMed.key}`, title: "💊 Alternatives" },
      { id: "main_menu", title: t(phone, "btnMainMenu") },
    ]);
  }

  // ── Fuzzy match (typo correction) ──────────────────────────
  const fuzzy = medicineDb.findMedicineFuzzy(lower);
  if (fuzzy.result && fuzzy.fuzzy) {
    const lang = getLang(phone);
    await whatsapp.sendText(
      phone,
      lang === "hi"
        ? `क्या आपका मतलब *${fuzzy.matchedName}* है?`
        : `Did you mean *${fuzzy.matchedName}*?`
    );
    await sendMedicineCard(phone, fuzzy.result);
    return whatsapp.sendButtons(phone, lang === "hi" ? "क्या करना चाहेंगे?" : "What would you like to do?", [
      { id: `remind_${fuzzy.result.key}`, title: t(phone, "btnSetReminders") },
      { id: "main_menu", title: t(phone, "btnMainMenu") },
    ]);
  }

  if (fuzzy.suggestions.length > 0) {
    const lang = getLang(phone);
    const names = fuzzy.suggestions.map((s) => `• ${capitalise(s.name)}`).join("\n");
    return whatsapp.sendText(
      phone,
      (lang === "hi"
        ? `"${text}" नहीं मिला। क्या आपका मतलब इनमें से किसी से है?\n\n`
        : `Couldn't find "${text}". Did you mean one of these?\n\n`) +
      names +
      (lang === "hi" ? "\n\nसही नाम लिखें या *menu* लिखें।" : "\n\nType the correct name or *menu* for options.")
    );
  }

  // ── Fallback ────────────────────────────────────────────────
  await whatsapp.sendText(phone, t(phone, "fallback"));
}

// ═══════════════════════════════════════════════════════════════
//  IMAGE MESSAGES (OCR)
// ═══════════════════════════════════════════════════════════════
async function handleImageMessage(imageData, phone, name) {
  const state = userState.get(phone);
  if (state?.stage === "awaiting_prescription") userState.delete(phone);

  await whatsapp.sendText(phone, t(phone, "uploadProcessing"));

  const imageBuffer = await whatsapp.downloadMedia(imageData.id);
  if (!imageBuffer) return whatsapp.sendText(phone, t(phone, "uploadFailed"));

  const ocrText = await ocrService.extractTextFromImage(imageBuffer);
  if (!ocrText || ocrText.trim().length < 10) {
    return whatsapp.sendText(phone, t(phone, "uploadUnreadable"));
  }

  const parsedMeds = ocrService.parseMedicines(ocrText);
  if (parsedMeds.length === 0) {
    const lang = getLang(phone);
    return whatsapp.sendText(
      phone,
      `${lang === "hi" ? "मैंने यह पढ़ा" : "I read the following"}:\n\n_${ocrText.substring(0, 500)}_\n\n${lang === "hi" ? "दवाइयां पहचान नहीं पाया। *menu* → *दवाई लिखें* चुनें।" : "Couldn't identify medicines. Type *menu* → *Type Medicines*."}`
    );
  }

  const lang = getLang(phone);
  let response = `📋 *${lang === "hi" ? "प्रिस्क्रिप्शन विश्लेषण" : "Prescription Analysis"}*\n\n`;
  response += `${lang === "hi" ? "मिली" : "Found"} *${parsedMeds.length} ${lang === "hi" ? "दवाइयां" : "medicine(s)"}*:\n\n`;

  const matchedMeds = [];
  for (const parsed of parsedMeds) {
    response += `• *${parsed.type} ${parsed.name}*`;
    if (parsed.dosage) response += ` — ${parsed.dosage}`;
    response += "\n";
    const dbMatch = medicineDb.findMedicine(parsed.name);
    if (dbMatch) matchedMeds.push({ ...dbMatch, parsedDosage: parsed.dosage });
  }

  await whatsapp.sendText(phone, response);
  for (const med of matchedMeds) await sendMedicineCard(phone, med);

  // Check drug interactions
  if (matchedMeds.length > 1) {
    await checkAndSendInteractions(phone, matchedMeds.map((m) => m.generic || m.names[0]));
  }

  if (matchedMeds.length > 0) {
    userState.set(phone, { stage: "post_prescription", medicines: matchedMeds, _lastActivity: Date.now() });
    await whatsapp.sendButtons(
      phone,
      lang === "hi" ? "क्या इन दवाइयों के लिए रिमाइंडर सेट करें?" : "Would you like to set dosage reminders?",
      [
        { id: "set_all_reminders", title: t(phone, "btnSetReminders") },
        { id: "no_thanks", title: lang === "hi" ? "नहीं" : "No Thanks" },
      ]
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  INTERACTIVE (BUTTON) RESPONSES
// ═══════════════════════════════════════════════════════════════
async function handleInteractiveMessage(interactive, phone, name) {
  const buttonId = interactive.button_reply?.id || interactive.list_reply?.id || "";
  const lang = getLang(phone);

  // ── Global ──────────────────────────────────────────────────
  if (buttonId === "main_menu") { userState.delete(phone); return sendMainMenu(phone); }
  if (buttonId === "no_thanks" || buttonId === "dismiss_refill") {
    userState.delete(phone);
    return whatsapp.sendText(phone, t(phone, "noThanks", PHARMACY));
  }

  // ── Language toggle ─────────────────────────────────────────
  if (buttonId === "switch_lang") {
    const newLang = lang === "hi" ? "en" : "hi";
    setLang(phone, newLang);
    await whatsapp.sendText(phone, newLang === "hi" ? "भाषा *हिंदी* में बदल दी गई 🇮🇳" : "Language switched to *English* 🇬🇧");
    return sendMainMenu(phone);
  }

  // ── Adherence buttons ───────────────────────────────────────
  if (buttonId.startsWith("adh_taken_")) {
    const med = buttonId.replace("adh_taken_", "");
    reminderService.recordAdherence(phone, med, "taken");
    return whatsapp.sendText(phone, t(phone, "adherenceRecorded", med));
  }
  if (buttonId.startsWith("adh_skip_")) {
    const med = buttonId.replace("adh_skip_", "");
    reminderService.recordAdherence(phone, med, "skipped");
    return whatsapp.sendText(phone, t(phone, "adherenceSkipped", med));
  }
  if (buttonId.startsWith("adh_snooze_")) {
    const med = buttonId.replace("adh_snooze_", "");
    reminderService.snoozeReminder(phone, med);
    return whatsapp.sendText(phone, t(phone, "adherenceSnoozed", med));
  }

  // ── Reorder from refill reminder ────────────────────────────
  if (buttonId.startsWith("reorder_")) {
    const med = buttonId.replace("reorder_", "");
    return whatsapp.sendText(phone, t(phone, "orderNotAvailable"));
  }

  // ── Welcome choice ──────────────────────────────────────────
  if (buttonId === "choose_upload") {
    userState.set(phone, { stage: "awaiting_prescription", _lastActivity: Date.now() });
    return whatsapp.sendText(phone, t(phone, "uploadPrompt"));
  }
  if (buttonId === "choose_type") {
    userState.set(phone, { stage: "typing_name", medicines: [], current: {}, _lastActivity: Date.now() });
    return whatsapp.sendText(phone, t(phone, "typingStartFirst"));
  }

  // ── Medicine type buttons ───────────────────────────────────
  if (buttonId.startsWith("medtype_")) {
    const state = userState.get(phone);
    if (state?.stage === "typing_type") {
      state.current.type = buttonId.replace("medtype_", "");
      state.stage = "typing_dosage";
      state._lastActivity = Date.now();
      return whatsapp.sendText(phone, t(phone, "typingDosagePrompt"));
    }
  }

  // ── Frequency buttons ───────────────────────────────────────
  if (buttonId.startsWith("freq_")) {
    const state = userState.get(phone);
    if (state?.stage === "typing_frequency") {
      state.current.frequency = buttonId.replace("freq_", "");
      const sched = reminderService.DOSAGE_SCHEDULES[state.current.frequency];
      state.current.frequencyLabel = lang === "hi" ? (sched?.labelHi || sched?.label) : sched?.label || state.current.frequency;
      state.stage = "typing_duration";
      state._lastActivity = Date.now();
      return whatsapp.sendText(phone, t(phone, "typingDurationPrompt", state.current.name));
    }
  }

  // ── Food timing buttons ─────────────────────────────────────
  if (buttonId.startsWith("food_")) {
    const state = userState.get(phone);
    if (state?.stage === "typing_food") {
      const choice = buttonId.replace("food_", "");
      state.current.foodTiming = choice === "before"
        ? (lang === "hi" ? "खाने से पहले" : "Before food")
        : choice === "after"
          ? (lang === "hi" ? "खाने के बाद" : "After food")
          : (lang === "hi" ? "कभी भी" : "With or without food");
      state.medicines.push({ ...state.current });
      state.current = {};
      state.stage = "typing_more";
      state._lastActivity = Date.now();
      const count = state.medicines.length;
      return whatsapp.sendButtons(
        phone,
        t(phone, "typingAdded", state.medicines[count - 1].name, count),
        [
          { id: "add_more_yes", title: t(phone, "btnAddMore") },
          { id: "add_more_done", title: t(phone, "btnDoneReview") },
        ]
      );
    }
  }

  // ── Add more / done ─────────────────────────────────────────
  if (buttonId === "add_more_yes") {
    const state = userState.get(phone);
    if (state) {
      const num = (state.medicines?.length || 0) + 1;
      state.stage = "typing_name";
      state.current = {};
      state._lastActivity = Date.now();
      return whatsapp.sendText(phone, t(phone, "typingStart", num));
    }
  }
  if (buttonId === "add_more_done") {
    const state = userState.get(phone);
    if (state?.medicines?.length > 0) return sendVerificationSummary(phone, state);
  }

  // ── Verification ────────────────────────────────────────────
  if (buttonId === "verify_correct") {
    const state = userState.get(phone);
    if (state?.stage === "verify_medicines") {
      state.stage = "post_verify";

      // Show drug interactions
      const medNames = state.medicines.map((m) => m.dbMatch?.generic || m.name);
      if (medNames.length > 1) {
        await checkAndSendInteractions(phone, medNames);
      }

      // Show medicine cards for recognized ones
      for (const med of state.medicines) {
        if (med.dbMatch) await sendMedicineCard(phone, med.dbMatch);
      }

      return whatsapp.sendButtons(phone, t(phone, "verified"), [
        { id: "verified_set_reminders", title: t(phone, "btnSetReminders") },
        { id: "verified_info_only", title: t(phone, "btnInfoOnly") },
      ]);
    }
  }
  if (buttonId === "verify_edit") {
    const state = userState.get(phone);
    if (state?.stage === "verify_medicines") {
      state.stage = "edit_pick";
      state._lastActivity = Date.now();
      const lines = state.medicines.map((m, i) => `${i + 1}. ${m.name}`).join("\n");
      return whatsapp.sendText(phone, t(phone, "editPickPrompt", lines));
    }
  }
  if (buttonId === "verify_startover") {
    userState.set(phone, { stage: "typing_name", medicines: [], current: {}, _lastActivity: Date.now() });
    return whatsapp.sendText(phone, t(phone, "startingOver"));
  }

  // ── Post-verification set reminders ─────────────────────────
  if (buttonId === "verified_set_reminders") {
    const state = userState.get(phone);
    if (state?.medicines) {
      let msg = t(phone, "remindersSet");
      for (const med of state.medicines) {
        const freq = med.frequency || "bd";
        const dur = med.duration;
        const result = reminderService.addReminder(phone, med.name, freq, dur);
        msg += result.message + "\n\n";
      }
      userState.delete(phone);
      return whatsapp.sendText(phone, msg + (lang === "hi" ? "Type *reminders* देखने के लिए।" : "Type *reminders* to see all."));
    }
  }
  if (buttonId === "verified_info_only") {
    userState.delete(phone);
    return whatsapp.sendText(phone, t(phone, "infoOnlyDone", PHARMACY));
  }

  // ── OCR post-prescription ───────────────────────────────────
  if (buttonId === "set_all_reminders") {
    const state = userState.get(phone);
    if (state?.medicines) {
      let msg = t(phone, "remindersSet");
      for (const med of state.medicines) {
        const dosage = med.parsedDosage || "bd";
        const result = reminderService.addReminder(phone, med.names[0], dosage);
        msg += result.message + "\n\n";
      }
      userState.delete(phone);
      return whatsapp.sendText(phone, msg);
    }
  }

  if (buttonId === "set_reminder_yes") {
    userState.set(phone, { stage: "awaiting_reminder_medicine", _lastActivity: Date.now() });
    return whatsapp.sendText(phone, lang === "hi"
      ? "दवाई का नाम और शेड्यूल लिखें।\n\nउदाहरण: *Paracetamol BD*\n\nOD = दिन में 1 बार\nBD = दिन में 2 बार\nTDS = दिन में 3 बार"
      : "Type the medicine name and schedule.\n\nExample: *Paracetamol BD*\n\nOD = Once daily\nBD = Twice daily\nTDS = Three times");
  }

  // ── Single medicine reminder ────────────────────────────────
  if (buttonId.startsWith("remind_")) {
    const medKey = buttonId.replace("remind_", "");
    const med = medicineDb.medicines[medKey];
    if (med) {
      userState.set(phone, { stage: "awaiting_dosage", medicineKey: medKey, medicineName: med.names[0], _lastActivity: Date.now() });
      return whatsapp.sendButtons(phone, `${lang === "hi" ? "कितनी बार" : "Set reminder for"} *${med.names[0]}*${lang === "hi" ? " लेनी है?" : ". Choose frequency:"}`, [
        { id: "dose_bd", title: t(phone, "btnBD") },
        { id: "dose_od", title: t(phone, "btnOD") },
        { id: "dose_tds", title: t(phone, "btnTDS") },
      ]);
    }
  }

  if (buttonId.startsWith("dose_")) {
    const state = userState.get(phone);
    if (state?.stage === "awaiting_dosage") {
      const dosage = buttonId.replace("dose_", "");
      const result = reminderService.addReminder(phone, state.medicineName, dosage);
      userState.delete(phone);
      return whatsapp.sendText(phone, result.message);
    }
  }

  // ── Alternatives button ─────────────────────────────────────
  if (buttonId.startsWith("alt_")) {
    const medKey = buttonId.replace("alt_", "");
    const med = medicineDb.medicines[medKey];
    if (med) return sendAlternatives(phone, med.names[0]);
  }

  // ── Main menu options ───────────────────────────────────────
  if (buttonId === "opt_prescription") {
    return whatsapp.sendButtons(phone, t(phone, "chooseMethod"), [
      { id: "choose_upload", title: t(phone, "btnUpload") },
      { id: "choose_type", title: t(phone, "btnType") },
      { id: "main_menu", title: t(phone, "btnMainMenu") },
    ]);
  }
  if (buttonId === "opt_medicine") {
    return whatsapp.sendText(phone, lang === "hi"
      ? "💊 *दवाई का नाम* लिखें।\n\nउदाहरण: *Paracetamol*, *Amoxicillin*, *Pan 40*"
      : "💊 Type a *medicine name*.\n\nExample: *Paracetamol*, *Amoxicillin*, *Pan 40*");
  }
  if (buttonId === "opt_reminders") {
    return whatsapp.sendText(phone, reminderService.listReminders(phone));
  }
  if (buttonId === "opt_pharmacist") {
    return sendPharmacistConnect(phone);
  }
  if (buttonId === "opt_order") {
    return whatsapp.sendText(phone, t(phone, "orderNotAvailable"));
  }
}

// ═══════════════════════════════════════════════════════════════
//  STATEFUL MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════
async function handleStatefulMessage(originalText, lower, phone, name, state) {
  state._lastActivity = Date.now();

  if (matchesAny(lower, ["cancel", "exit", "back", "menu", "मेनू", "वापस"])) {
    userState.delete(phone);
    return sendMainMenu(phone);
  }

  if (state.stage === "awaiting_prescription") {
    return whatsapp.sendText(phone, t(phone, "uploadWaiting"));
  }

  // ── Pharmacist flow: forward message ────────────────────────
  if (state.stage === "pharmacist_chat") {
    userState.delete(phone);
    // In production, forward to pharmacist dashboard / WhatsApp group
    return whatsapp.sendText(phone, t(phone, "pharmacistForwarded"));
  }

  // ── TYPING FLOW ─────────────────────────────────────────────
  if (state.stage === "typing_name") {
    const medName = originalText.trim();
    if (medName.length < 2) return whatsapp.sendText(phone, t(phone, "typingTooShort"));

    state.current.name = capitalise(medName);
    const dbMatch = medicineDb.findMedicine(medName);
    if (dbMatch) {
      state.current.dbMatch = dbMatch;
      await whatsapp.sendText(phone, t(phone, "typingRecognised", state.current.name));
    }

    state.stage = "typing_type";
    return whatsapp.sendButtons(phone, t(phone, "typingFormPrompt", state.current.name), [
      { id: "medtype_Tablet", title: t(phone, "btnTablet") },
      { id: "medtype_Capsule", title: t(phone, "btnCapsule") },
      { id: "medtype_Syrup", title: t(phone, "btnSyrup") },
    ]);
  }

  if (state.stage === "typing_dosage") {
    state.current.dosageStrength = lower === "skip" ? "Not specified" : originalText.trim();
    state.stage = "typing_frequency";
    return whatsapp.sendButtons(phone, t(phone, "typingFreqPrompt", state.current.name), [
      { id: "freq_od", title: t(phone, "btnOD") },
      { id: "freq_bd", title: t(phone, "btnBD") },
      { id: "freq_tds", title: t(phone, "btnTDS") },
    ]);
  }

  if (state.stage === "typing_duration") {
    state.current.duration = lower === "skip" ? "As directed" : originalText.trim();
    state.stage = "typing_food";
    return whatsapp.sendButtons(phone, t(phone, "typingFoodPrompt", state.current.name), [
      { id: "food_before", title: t(phone, "btnBeforeFood") },
      { id: "food_after", title: t(phone, "btnAfterFood") },
      { id: "food_any", title: t(phone, "btnAnyTime") },
    ]);
  }

  // ── Edit flow ───────────────────────────────────────────────
  if (state.stage === "edit_pick") {
    if (lower.startsWith("remove")) {
      const num = parseInt(lower.replace("remove", "").trim());
      if (num >= 1 && num <= state.medicines.length) {
        const removed = state.medicines.splice(num - 1, 1)[0];
        await whatsapp.sendText(phone, t(phone, "removedMedicine", removed.name));
        if (state.medicines.length === 0) {
          userState.set(phone, { stage: "typing_name", medicines: [], current: {}, _lastActivity: Date.now() });
          return whatsapp.sendText(phone, t(phone, "noMedsLeft"));
        }
        return sendVerificationSummary(phone, state);
      }
    }
    const num = parseInt(lower);
    if (num >= 1 && num <= state.medicines.length) {
      state.editIndex = num - 1;
      state.stage = "edit_field";
      const med = state.medicines[state.editIndex];
      return whatsapp.sendText(phone, t(phone, "editFieldPrompt", med.name, med));
    }
    return whatsapp.sendText(phone, `Type 1-${state.medicines.length}:`);
  }

  if (state.stage === "edit_field") {
    const fieldMap = { "1": "name", "2": "type", "3": "dosageStrength", "4": "frequency", "5": "duration", "6": "foodTiming" };
    const fieldLabels = { "1": "Name", "2": "Type", "3": "Strength", "4": "Frequency", "5": "Duration", "6": "Food timing" };
    if (fieldMap[lower]) {
      state.editField = fieldMap[lower];
      state.editFieldLabel = fieldLabels[lower];
      state.stage = "edit_value";
      if (lower === "4") {
        return whatsapp.sendText(phone, getLang(phone) === "hi"
          ? "नई *कितनी बार* लिखें:\n\nOD, BD, TDS, 1-0-1, 1-1-1"
          : "Type the new *frequency*:\n\nOD, BD, TDS, 1-0-1, 1-1-1");
      }
      return whatsapp.sendText(phone, `Type the new *${state.editFieldLabel}*:`);
    }
    return whatsapp.sendText(phone, "Type 1-6:");
  }

  if (state.stage === "edit_value") {
    const med = state.medicines[state.editIndex];
    let newVal = originalText.trim();
    if (state.editField === "name") newVal = capitalise(newVal);
    if (state.editField === "frequency") {
      const code = newVal.toLowerCase().replace(/\s/g, "");
      const sched = reminderService.DOSAGE_SCHEDULES[code];
      med.frequency = code;
      med.frequencyLabel = sched ? (getLang(phone) === "hi" ? sched.labelHi : sched.label) : newVal;
    } else {
      med[state.editField] = newVal;
    }
    await whatsapp.sendText(phone, t(phone, "editUpdated", med.name, state.editFieldLabel, newVal));
    return sendVerificationSummary(phone, state);
  }

  if (state.stage === "awaiting_reminder_medicine") {
    return handleQuickReminder(phone, lower);
  }

  // Default: clear and reprocess
  userState.delete(phone);
  return handleTextMessage(originalText, phone, name);
}

// ═══════════════════════════════════════════════════════════════
//  VERIFICATION SUMMARY
// ═══════════════════════════════════════════════════════════════
async function sendVerificationSummary(phone, state) {
  state.stage = "verify_medicines";
  state._lastActivity = Date.now();
  const lang = getLang(phone);

  let msg = t(phone, "verifyHeader");
  msg += "━━━━━━━━━━━━━━━━━━━━━\n";

  state.medicines.forEach((med, i) => {
    msg += `\n*${i + 1}. ${med.name}*\n`;
    msg += `   ${lang === "hi" ? "प्रकार" : "Form"}: ${med.type}\n`;
    msg += `   ${lang === "hi" ? "ताकत" : "Strength"}: ${med.dosageStrength}\n`;
    msg += `   ${lang === "hi" ? "कितनी बार" : "Frequency"}: ${med.frequencyLabel}\n`;
    msg += `   ${lang === "hi" ? "कितने दिन" : "Duration"}: ${med.duration}\n`;
    msg += `   ${lang === "hi" ? "खाने का समय" : "Food"}: ${med.foodTiming}\n`;
  });

  msg += "\n━━━━━━━━━━━━━━━━━━━━━";
  msg += t(phone, "verifyFooter");

  await whatsapp.sendText(phone, msg);
  return whatsapp.sendButtons(phone, lang === "hi" ? "विकल्प चुनें:" : "Choose:", [
    { id: "verify_correct", title: t(phone, "btnCorrect") },
    { id: "verify_edit", title: t(phone, "btnEdit") },
    { id: "verify_startover", title: t(phone, "btnStartOver") },
  ]);
}

// ═══════════════════════════════════════════════════════════════
//  WELCOME & MENUS
// ═══════════════════════════════════════════════════════════════
async function sendWelcome(phone, name) {
  const mem = userMemory.get(phone);
  const isReturning = mem && (Date.now() - mem.firstSeen > 60000);
  const reminderCount = reminderService.getReminderCount(phone);

  const msg = isReturning
    ? t(phone, "welcomeBack", name, PHARMACY, reminderCount)
    : t(phone, "welcome", name, PHARMACY);

  await whatsapp.sendText(phone, msg);

  userState.set(phone, { stage: "awaiting_choice", _lastActivity: Date.now() });
  return whatsapp.sendButtons(phone, t(phone, "chooseMethod"), [
    { id: "choose_upload", title: t(phone, "btnUpload") },
    { id: "choose_type", title: t(phone, "btnType") },
    { id: "choose_quick", title: t(phone, "btnQuickLookup") },
  ]);
}

async function sendMainMenu(phone) {
  const lang = getLang(phone);
  // WhatsApp allows max 3 buttons per message, so we send two sets
  await whatsapp.sendButtons(phone, t(phone, "mainMenuPrompt"), [
    { id: "opt_prescription", title: t(phone, "btnMyMedicines") },
    { id: "opt_medicine", title: t(phone, "btnMedicineInfo") },
    { id: "opt_reminders", title: t(phone, "btnMyReminders") },
  ]);
  // Second row: order, pharmacist, language
  return whatsapp.sendButtons(
    phone,
    lang === "hi" ? "और विकल्प:" : "More options:",
    [
      { id: "opt_pharmacist", title: t(phone, "btnTalkPharmacist") },
      { id: "opt_order", title: t(phone, "btnOrderMeds") },
      { id: "switch_lang", title: t(phone, "btnLanguage") },
    ]
  );
}

// ═══════════════════════════════════════════════════════════════
//  MEDICINE INFO CARDS
// ═══════════════════════════════════════════════════════════════
async function sendMedicineCard(phone, med) {
  const lang = getLang(phone);
  const usage = (lang === "hi" && med.usageHi) ? med.usageHi : med.usage;

  const msg =
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `💊 *${(med.generic || med.names[0]).toUpperCase()}*\n` +
    `📂 ${lang === "hi" ? "श्रेणी" : "Category"}: ${med.category}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `*${lang === "hi" ? "किसलिए" : "What it's for"}:*\n${usage}\n\n` +
    `*${lang === "hi" ? "खुराक" : "Dosage"}:*\n${med.dosage}\n\n` +
    `*${lang === "hi" ? "कब लें" : "When to take"}:*\n${med.foodTiming}\n\n` +
    `*${lang === "hi" ? "दुष्प्रभाव" : "Side effects"}:*\n${med.sideEffects}\n\n` +
    `*${lang === "hi" ? "सावधानियां" : "Precautions"}:*\n${med.precautions}\n\n` +
    t(phone, "disclaimer") + "\n" +
    `━━━━━━━━━━━━━━━━━━━━━`;

  return whatsapp.sendText(phone, msg);
}

async function sendMedicineInfo(phone, query) {
  const lang = getLang(phone);
  if (!query) {
    return whatsapp.sendText(phone, lang === "hi"
      ? "'medicine' के बाद दवाई का नाम लिखें। उदाहरण: *medicine paracetamol*"
      : "Type a medicine name. Example: *medicine paracetamol*");
  }

  const fuzzy = medicineDb.findMedicineFuzzy(query);
  if (fuzzy.result) {
    if (fuzzy.fuzzy) {
      await whatsapp.sendText(phone, lang === "hi" ? `क्या आपका मतलब *${fuzzy.matchedName}* है?` : `Did you mean *${fuzzy.matchedName}*?`);
    }
    await sendMedicineCard(phone, fuzzy.result);
    return whatsapp.sendButtons(phone, lang === "hi" ? "क्या करें?" : "What would you like to do?", [
      { id: `remind_${fuzzy.result.key}`, title: t(phone, "btnSetReminders") },
      { id: `alt_${fuzzy.result.key}`, title: "💊 Alternatives" },
      { id: "main_menu", title: t(phone, "btnMainMenu") },
    ]);
  }

  return whatsapp.sendText(phone, t(phone, "medNotFound", query, PHARMACY));
}

// ═══════════════════════════════════════════════════════════════
//  ALTERNATIVES & PRICE COMPARISON
// ═══════════════════════════════════════════════════════════════
async function sendAlternatives(phone, query) {
  const lang = getLang(phone);
  const med = medicineDb.findMedicine(query);

  if (!med || !med.alternatives || med.alternatives.length === 0) {
    return whatsapp.sendText(phone, t(phone, "noAlternatives", query));
  }

  let msg = t(phone, "alternativesHeader", med.generic || med.names[0]);
  msg += "━━━━━━━━━━━━━━━━━━━━━\n\n";

  const brandAlts = med.alternatives.filter((a) => a.brand);
  const genericAlts = med.alternatives.filter((a) => !a.brand);

  if (genericAlts.length > 0) {
    msg += `🏷️ *${lang === "hi" ? "जेनेरिक (सस्ता)" : "Generic (Cheaper)"}:*\n`;
    for (const alt of genericAlts) {
      msg += `  • ${alt.name} — ₹${alt.price}\n`;
    }
    msg += "\n";
  }

  if (brandAlts.length > 0) {
    msg += `🏪 *${lang === "hi" ? "ब्रांड" : "Branded"}:*\n`;
    for (const alt of brandAlts) {
      msg += `  • ${alt.name} — ₹${alt.price}\n`;
    }
    msg += "\n";
  }

  if (genericAlts.length > 0 && brandAlts.length > 0) {
    const cheapest = genericAlts.reduce((a, b) => (a.price < b.price ? a : b));
    const expensive = brandAlts.reduce((a, b) => (a.price > b.price ? a : b));
    const savings = expensive.price - cheapest.price;
    if (savings > 0) {
      msg += `💰 *${lang === "hi" ? "बचत" : "You could save"}*: ₹${savings} ${lang === "hi" ? "प्रति स्ट्रिप" : "per strip"}\n`;
      msg += lang === "hi"
        ? "_जेनेरिक दवाइयां ब्रांडेड जितनी ही असरदार होती हैं।_\n"
        : "_Generic medicines are equally effective as branded ones._\n";
    }
  }

  msg += "\n━━━━━━━━━━━━━━━━━━━━━";
  msg += `\n${lang === "hi" ? "_कीमतें अनुमानित हैं और बदल सकती हैं।_" : "_Prices are approximate MRP and may vary._"}`;

  return whatsapp.sendText(phone, msg);
}

// ═══════════════════════════════════════════════════════════════
//  DRUG INTERACTION CHECK
// ═══════════════════════════════════════════════════════════════
async function checkAndSendInteractions(phone, medicineNames) {
  const lang = getLang(phone);
  const results = interactions.checkInteractions(medicineNames, lang);
  if (results.length > 0) {
    const report = interactions.formatInteractionReport(results, lang);
    if (report) await whatsapp.sendText(phone, report);
  }
}

// ═══════════════════════════════════════════════════════════════
//  PHARMACIST ESCALATION
// ═══════════════════════════════════════════════════════════════
async function sendPharmacistConnect(phone) {
  await whatsapp.sendText(phone, t(phone, "pharmacistConnect", PHARMACY, PHARMACY_PHONE));
  userState.set(phone, { stage: "pharmacist_chat", _lastActivity: Date.now() });
}

// ═══════════════════════════════════════════════════════════════
//  QUICK REMINDER
// ═══════════════════════════════════════════════════════════════
async function handleQuickReminder(phone, text) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 1) return whatsapp.sendText(phone, "Example: *Paracetamol BD*");

  const lastPart = parts[parts.length - 1].toLowerCase();
  const knownDosages = Object.keys(reminderService.DOSAGE_SCHEDULES);
  let medicineName, dosageCode;

  if (knownDosages.includes(lastPart)) {
    dosageCode = lastPart;
    medicineName = parts.slice(0, -1).join(" ");
  } else {
    medicineName = parts.join(" ");
    dosageCode = "bd";
  }

  if (!medicineName) return whatsapp.sendText(phone, "Example: *Paracetamol BD*");

  const result = reminderService.addReminder(phone, medicineName, dosageCode);
  userState.delete(phone);
  return whatsapp.sendText(phone, result.message);
}

// ═══════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════
function matchesAny(text, options) {
  return options.some((opt) => text === opt || text.startsWith(opt + " "));
}

function capitalise(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

module.exports = { handleIncoming };
