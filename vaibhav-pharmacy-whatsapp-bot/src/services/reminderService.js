const cron = require("node-cron");
const { getLang } = require("../utils/i18n");

// ═══════════════════════════════════════════════════════════════
//  REMINDER SERVICE — with Adherence Tracking & Refill Alerts
// ═══════════════════════════════════════════════════════════════
// In production, replace Maps with a real database (MongoDB, etc.)

const reminders = new Map();   // phone -> [Reminder]
const adherence = new Map();   // phone -> [AdherenceLog]
const snoozed = new Map();     // `${phone}_${medicine}` -> snoozeUntil timestamp

// ─── Dosage code → schedule mapping ───────────────────────────
const DOSAGE_SCHEDULES = {
  "od":    { label: "Once daily (morning)", labelHi: "दिन में 1 बार (सुबह)", cronTimes: ["08:00"] },
  "bd":    { label: "Twice daily", labelHi: "दिन में 2 बार", cronTimes: ["08:00", "20:00"] },
  "tds":   { label: "Three times daily", labelHi: "दिन में 3 बार", cronTimes: ["08:00", "14:00", "20:00"] },
  "qid":   { label: "Four times daily", labelHi: "दिन में 4 बार", cronTimes: ["08:00", "12:00", "16:00", "20:00"] },
  "hs":    { label: "At bedtime", labelHi: "सोने से पहले", cronTimes: ["22:00"] },
  "sos":   { label: "When needed", labelHi: "जरूरत पर", cronTimes: [] },
  "1-0-1": { label: "Morning & Night", labelHi: "सुबह और रात", cronTimes: ["08:00", "20:00"] },
  "1-1-1": { label: "Morning, Afternoon & Night", labelHi: "सुबह, दोपहर और रात", cronTimes: ["08:00", "14:00", "20:00"] },
  "1-0-0": { label: "Morning only", labelHi: "सिर्फ सुबह", cronTimes: ["08:00"] },
  "0-0-1": { label: "Night only", labelHi: "सिर्फ रात", cronTimes: ["20:00"] },
  "0-1-0": { label: "Afternoon only", labelHi: "सिर्फ दोपहर", cronTimes: ["14:00"] },
  "1-1-0": { label: "Morning & Afternoon", labelHi: "सुबह और दोपहर", cronTimes: ["08:00", "14:00"] },
  "0-1-1": { label: "Afternoon & Night", labelHi: "दोपहर और रात", cronTimes: ["14:00", "20:00"] },
};

// ─── Parse duration text to days ──────────────────────────────
function parseDurationDays(durationText) {
  if (!durationText) return null;
  const lower = durationText.toLowerCase().trim();
  if (lower === "ongoing" || lower === "हमेशा" || lower === "as directed" || lower === "skip") return null;

  const match = lower.match(/(\d+)\s*(day|days|दिन|week|weeks|हफ्त|month|months|महीन)/i);
  if (!match) return null;

  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith("week") || unit.startsWith("हफ्त")) return num * 7;
  if (unit.startsWith("month") || unit.startsWith("महीन")) return num * 30;
  return num;
}

// ─── Add a reminder ───────────────────────────────────────────
function addReminder(phone, medicine, dosageCode, durationText) {
  const code = dosageCode?.toLowerCase()?.replace(/\s/g, "") || "bd";
  const schedule = DOSAGE_SCHEDULES[code] || DOSAGE_SCHEDULES["bd"];
  const lang = getLang(phone);
  const schedLabel = lang === "hi" ? (schedule.labelHi || schedule.label) : schedule.label;

  if (!reminders.has(phone)) reminders.set(phone, []);

  const existing = reminders.get(phone);
  const alreadyExists = existing.some(
    (r) => r.medicine.toLowerCase() === medicine.toLowerCase()
  );
  if (alreadyExists) {
    return { success: false, message: `Reminder for ${medicine} already exists.` };
  }

  const durationDays = parseDurationDays(durationText);
  const endDate = durationDays
    ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    : null;
  const refillDate = durationDays && durationDays > 3
    ? new Date(Date.now() + (durationDays - 2) * 24 * 60 * 60 * 1000)
    : null;

  existing.push({
    medicine,
    dosageCode: code,
    schedule: schedLabel,
    cronTimes: schedule.cronTimes,
    active: true,
    durationDays,
    endDate: endDate?.toISOString() || null,
    refillDate: refillDate?.toISOString() || null,
    refillSent: false,
    createdAt: new Date().toISOString(),
  });

  let msg = `✅ ${lang === "hi" ? "रिमाइंडर सेट" : "Reminder set"}: *${medicine}*\n`;
  msg += `📋 ${lang === "hi" ? "शेड्यूल" : "Schedule"}: ${schedLabel}\n`;
  msg += `⏰ ${lang === "hi" ? "समय" : "Times"}: ${schedule.cronTimes.join(", ") || (lang === "hi" ? "जरूरत पर" : "As needed")}`;

  if (durationDays && endDate) {
    msg += `\n📅 ${lang === "hi" ? "अवधि" : "Duration"}: ${durationDays} ${lang === "hi" ? "दिन" : "days"}`;
    msg += ` (${lang === "hi" ? "समाप्ति" : "ends"}: ${endDate.toLocaleDateString("en-IN")})`;
  }

  return { success: true, message: msg };
}

// ─── Remove a reminder ────────────────────────────────────────
function removeReminder(phone, medicine) {
  if (!reminders.has(phone)) return { success: false, message: "No reminders found." };
  const list = reminders.get(phone);
  const idx = list.findIndex((r) => r.medicine.toLowerCase() === medicine.toLowerCase());
  if (idx === -1) return { success: false, message: `No reminder found for ${medicine}.` };
  list.splice(idx, 1);
  return { success: true, message: `Reminder for ${medicine} removed.` };
}

// ─── List all reminders ───────────────────────────────────────
function listReminders(phone) {
  const list = reminders.get(phone);
  const lang = getLang(phone);

  if (!list || list.length === 0) {
    return lang === "hi" ? "आपके कोई सक्रिय रिमाइंडर नहीं हैं।" : "You have no active reminders.";
  }

  let msg = lang === "hi" ? "💊 *आपके दवाई रिमाइंडर:*\n\n" : "💊 *Your Medicine Reminders:*\n\n";

  list.forEach((r, i) => {
    const status = r.active ? "🟢" : "🔴";
    msg += `${i + 1}. ${status} *${r.medicine}*\n`;
    msg += `   📋 ${r.schedule}\n`;
    msg += `   ⏰ ${r.cronTimes.join(", ") || "As needed"}\n`;

    if (r.endDate) {
      const end = new Date(r.endDate);
      const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000)));
      msg += `   📅 ${daysLeft} ${lang === "hi" ? "दिन बाकी" : "days remaining"}\n`;
    }

    const stats = getAdherenceStats(phone, r.medicine);
    if (stats.total > 0) {
      const pct = Math.round((stats.taken / stats.total) * 100);
      const bar = pct >= 80 ? "🟢" : pct >= 50 ? "🟡" : "🔴";
      msg += `   ${bar} ${lang === "hi" ? "अनुपालन" : "Adherence"}: ${pct}% (${stats.taken}/${stats.total})\n`;
    }
    msg += "\n";
  });

  return msg;
}

// ─── Get count of active reminders ────────────────────────────
function getReminderCount(phone) {
  const list = reminders.get(phone);
  return list ? list.filter((r) => r.active).length : 0;
}

// ═══════════════════════════════════════════════════════════════
//  ADHERENCE TRACKING
// ═══════════════════════════════════════════════════════════════

function recordAdherence(phone, medicine, status) {
  if (!adherence.has(phone)) adherence.set(phone, []);
  adherence.get(phone).push({
    medicine,
    status, // "taken", "skipped", "snoozed"
    timestamp: new Date().toISOString(),
  });
}

function getAdherenceStats(phone, medicine) {
  const logs = adherence.get(phone) || [];
  const medLogs = logs.filter((l) => l.medicine.toLowerCase() === medicine.toLowerCase());
  return {
    total: medLogs.filter((l) => l.status !== "snoozed").length,
    taken: medLogs.filter((l) => l.status === "taken").length,
    skipped: medLogs.filter((l) => l.status === "skipped").length,
  };
}

function snoozeReminder(phone, medicine) {
  const key = `${phone}_${medicine.toLowerCase()}`;
  snoozed.set(key, new Date(Date.now() + 15 * 60 * 1000));
  recordAdherence(phone, medicine, "snoozed");
}

// ═══════════════════════════════════════════════════════════════
//  SCHEDULER — runs every minute
// ═══════════════════════════════════════════════════════════════

let sendReminderFn = null;
function setSendReminderFn(fn) { sendReminderFn = fn; }

function checkAndSendReminders() {
  if (!sendReminderFn) return;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  for (const [phone, userReminders] of reminders) {
    for (const reminder of userReminders) {
      if (!reminder.active) continue;

      // Auto-expire reminders past their end date
      if (reminder.endDate && new Date(reminder.endDate) < now) {
        reminder.active = false;
        continue;
      }

      // Send refill reminder 2 days before end
      if (reminder.refillDate && !reminder.refillSent && new Date(reminder.refillDate) < now) {
        const daysLeft = Math.max(0, Math.ceil((new Date(reminder.endDate) - now) / (24 * 60 * 60 * 1000)));
        sendReminderFn(phone, reminder.medicine, "refill", daysLeft);
        reminder.refillSent = true;
      }

      // Send dose reminder at scheduled times
      if (reminder.cronTimes.includes(currentTime)) {
        const snoozeKey = `${phone}_${reminder.medicine.toLowerCase()}`;
        const snoozeUntil = snoozed.get(snoozeKey);
        if (snoozeUntil && snoozeUntil > now) continue;
        if (snoozeUntil) snoozed.delete(snoozeKey);

        sendReminderFn(phone, reminder.medicine, "dose", reminder.schedule);
      }
    }
  }

  // Fire snoozed reminders that are now due
  for (const [key, until] of snoozed) {
    if (until <= now) {
      const parts = key.split("_");
      const phone = parts[0];
      const medicine = parts.slice(1).join("_");
      sendReminderFn(phone, medicine, "dose_snoozed", "");
      snoozed.delete(key);
    }
  }
}

function startScheduler() {
  cron.schedule("* * * * *", () => checkAndSendReminders());
  console.log("⏰ Reminder scheduler started (checks every minute)");
}

module.exports = {
  addReminder,
  removeReminder,
  listReminders,
  getReminderCount,
  recordAdherence,
  getAdherenceStats,
  snoozeReminder,
  startScheduler,
  setSendReminderFn,
  DOSAGE_SCHEDULES,
  parseDurationDays,
};
