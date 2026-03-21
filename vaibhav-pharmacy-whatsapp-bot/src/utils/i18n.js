// ═══════════════════════════════════════════════════════════════
//  BILINGUAL SUPPORT — English + Hindi
// ═══════════════════════════════════════════════════════════════
// Every user-facing string lives here so the bot can instantly
// switch between languages mid-conversation.

const strings = {
  en: {
    // ── Welcome & Menu ────────────────────────────────────────
    welcome: (name, pharmacy) =>
      `Namaste ${name}! 🙏\n\nWelcome to *${pharmacy}*.\nI'm your pharmacy assistant. I can help you understand your medicines, set reminders, check drug interactions, and even order refills.\n\nHow would you like to share your medicines?`,
    welcomeBack: (name, pharmacy, reminderCount) =>
      `Welcome back, ${name}! 🙏\n\n*${pharmacy}* is here to help.${reminderCount > 0 ? `\n\nYou have *${reminderCount} active reminder(s)*.` : ""}\n\nWhat would you like to do today?`,
    chooseMethod: "Choose how to share your prescription:",
    btnUpload: "📷 Upload Photo",
    btnType: "⌨️ Type Medicines",
    btnQuickLookup: "💊 Quick Lookup",
    mainMenuPrompt: "Choose an option:",
    btnMyMedicines: "📋 My Medicines",
    btnMedicineInfo: "💊 Medicine Info",
    btnMyReminders: "⏰ My Reminders",
    btnOrderMeds: "🛒 Order Medicines",
    btnTalkPharmacist: "👨‍⚕️ Talk to Pharmacist",
    btnLanguage: "🌐 हिंदी",
    btnMainMenu: "↩️ Main Menu",

    // ── Upload flow ───────────────────────────────────────────
    uploadPrompt: "📷 Great! Please *send a photo* of your prescription now.\n\n*Tips for best results:*\n• Good lighting, no shadows\n• Keep the paper flat\n• Include all medicine names in the frame\n\n_Type *cancel* anytime to go back._",
    uploadWaiting: "I'm waiting for a *photo* of your prescription. 📷\n\nPlease send the image, or type *cancel* to go back.",
    uploadProcessing: "📷 Got your prescription! Analyzing it now... This may take a moment.",
    uploadFailed: "Sorry, I couldn't download the image. Please try sending it again.",
    uploadUnreadable: "I couldn't read the prescription clearly. 😕\n\n*Tips for a better photo:*\n• Good lighting, no shadows\n• Keep the paper flat\n• Capture the full prescription\n• Try a closer shot of the medicine names\n\nOr type *menu* and choose *Type Medicines* to enter them manually!",

    // ── Typing flow ───────────────────────────────────────────
    typingStart: (num) => `💊 *Medicine ${num}*\nPlease type the *medicine name*:`,
    typingStartFirst: "💊 Let's add your medicines one by one.\n\n*Medicine 1 of ?*\nPlease type the *medicine name*:\n\n_Example: Paracetamol, Amoxicillin, Pan 40_\n\n_Type *cancel* anytime to go back._",
    typingTooShort: "That seems too short. Please type the *full medicine name*:",
    typingRecognised: (name) => `✅ I recognise *${name}*! I have detailed info on this medicine.`,
    typingFormPrompt: (name) => `What form is *${name}*?`,
    btnTablet: "💊 Tablet",
    btnCapsule: "💊 Capsule",
    btnSyrup: "🧴 Syrup/Liquid",
    typingDosagePrompt: "What is the *dosage/strength*?\n\n_Example: 500mg, 250mg, 10ml, 5mg_\n\nType *skip* if not mentioned.",
    typingFreqPrompt: (name) => `How often do you take *${name}*?`,
    btnOD: "OD (1x/day)",
    btnBD: "BD (2x/day)",
    btnTDS: "TDS (3x/day)",
    typingDurationPrompt: (name) => `How long do you need to take *${name}*?\n\n_Example: 5 days, 7 days, 1 month, ongoing_\n\nType *skip* if not mentioned.`,
    typingFoodPrompt: (name) => `When should *${name}* be taken relative to food?`,
    btnBeforeFood: "Before Food",
    btnAfterFood: "After Food",
    btnAnyTime: "Any Time",
    typingAdded: (name, count) => `✅ *${name}* added! (${count} medicine${count > 1 ? "s" : ""} so far)\n\nWould you like to add another medicine?`,
    btnAddMore: "Add Another",
    btnDoneReview: "Done, Review All",

    // ── Verification ──────────────────────────────────────────
    verifyHeader: "📋 *Please verify your medicines:*\n",
    verifyFooter: "\n*Is everything correct?*",
    btnCorrect: "✅ Yes, Correct",
    btnEdit: "✏️ Edit",
    btnStartOver: "🔄 Start Over",
    editPickPrompt: (lines) => `Which medicine do you want to edit? Type the *number*:\n\n${lines}\n\nOr type *remove 2* to delete medicine #2.`,
    editFieldPrompt: (name, med) =>
      `Editing *${name}*. Which field?\n\n1. Name (${med.name})\n2. Type (${med.type})\n3. Strength (${med.dosageStrength})\n4. Frequency (${med.frequencyLabel})\n5. Duration (${med.duration})\n6. Food timing (${med.foodTiming})\n\nType the *number* of the field to change:`,
    editUpdated: (name, field, val) => `✏️ Updated *${name}*'s ${field} to: *${val}*`,
    removedMedicine: (name) => `🗑️ Removed *${name}*.`,
    noMedsLeft: "No medicines left. Let's start fresh!\n\n*Medicine 1*\nType the *medicine name*:",
    startingOver: "🔄 Starting over!\n\n*Medicine 1*\nPlease type the *medicine name*:",
    verified: "Your medicines have been confirmed! Would you like to set dosage reminders?",
    btnSetReminders: "Set Reminders",
    btnInfoOnly: "Info Only",
    infoOnlyDone: (pharmacy) => `Got it! Your medicine information is above. 📋\n\nType *menu* anytime for more options.\n\n— ${pharmacy}`,

    // ── Reminders ─────────────────────────────────────────────
    remindersSet: "✅ *Reminders Set:*\n\n",
    reminderMsg: (med, schedule, pharmacy) =>
      `⏰ *Medicine Reminder*\n\n💊 Time to take: *${med}*\n📋 Schedule: ${schedule}\n\nDid you take it?`,
    btnTookIt: "✅ Took It",
    btnSkipped: "⏭️ Skipped",
    btnSnooze: "⏰ +15 min",
    adherenceRecorded: (med) => `Great! ✅ *${med}* marked as taken. Keep it up! 💪`,
    adherenceSkipped: (med) => `Noted. You skipped *${med}* this time. Try not to miss the next dose.`,
    adherenceSnoozed: (med) => `⏰ Got it! I'll remind you about *${med}* in 15 minutes.`,

    // ── Drug Interactions ─────────────────────────────────────
    interactionWarning: "⚠️ *DRUG INTERACTION WARNING*",
    interactionNone: "✅ No known interactions found between your medicines.",
    interactionDisclaimer: "\n_This is for awareness only. Please consult your doctor or pharmacist._",

    // ── Alternatives ──────────────────────────────────────────
    alternativesHeader: (name) => `💊 *Generic Alternatives for ${name}:*\n`,
    noAlternatives: (name) => `No alternatives found for ${name} in our database.`,

    // ── Ordering ──────────────────────────────────────────────
    orderConfirm: (items, total) =>
      `🛒 *Your Order Summary:*\n\n${items}\n\n*Estimated Total: ₹${total}*\n\nWould you like to place this order?`,
    btnPlaceOrder: "✅ Place Order",
    btnModifyOrder: "✏️ Modify",
    orderPlaced: (orderId) =>
      `✅ *Order Placed!*\n\n🆔 Order ID: #${orderId}\n📦 Your medicines will be ready for pickup/delivery.\n\nWe'll notify you when it's ready!`,
    orderNotAvailable: "🛒 Online ordering is coming soon! For now, please visit the pharmacy or call us to order.\n\nType *pharmacist* to connect with our team.",

    // ── Pharmacist Escalation ─────────────────────────────────
    pharmacistConnect: (pharmacy, phone) =>
      `👨‍⚕️ *Connect with ${pharmacy}*\n\nOur pharmacist is available to help you!\n\n📞 Call: ${phone}\n⏰ Hours: 9 AM - 9 PM\n\nYou can also type your question here and we'll forward it to our pharmacist.`,
    pharmacistForwarded: "📨 Your message has been forwarded to our pharmacist. They'll get back to you shortly!",

    // ── Refill Reminder ───────────────────────────────────────
    refillReminder: (med, daysLeft) =>
      `🔄 *Refill Reminder*\n\n💊 *${med}* — only *${daysLeft} day(s)* of supply remaining.\n\nWould you like to reorder?`,
    btnReorder: "🛒 Reorder",
    btnDismiss: "Dismiss",

    // ── General ───────────────────────────────────────────────
    noThanks: (pharmacy) => `No problem! Type *menu* anytime you need help. Stay healthy! 💚\n\n— ${pharmacy}`,
    error: (pharmacy) => `Oops! Something went wrong. Please try again or visit ${pharmacy} directly for help.`,
    unsupportedType: "Sorry, I can only process text messages and prescription photos right now. 📝📷",
    fallback: "I couldn't understand that.\n\nYou can:\n• Send a *photo of your prescription* 📷\n• Type a *medicine name* (e.g., \"Paracetamol\")\n• Type *menu* for all options",
    medNotFound: (name, pharmacy) => `I don't have info on "${name}" yet.\n\nTry: Paracetamol, Amoxicillin, Omeprazole, Cetirizine, Metformin.\n\nOr visit *${pharmacy}* for expert advice!`,
    disclaimer: "⚠️ _Always follow your doctor's prescription. This is general information only._",
    languageSwitched: "Language switched to *English* 🇬🇧",
  },

  hi: {
    welcome: (name, pharmacy) =>
      `नमस्ते ${name}! 🙏\n\n*${pharmacy}* में आपका स्वागत है।\nमैं आपका फार्मेसी सहायक हूं। मैं आपकी दवाइयों को समझने, रिमाइंडर सेट करने, और दवाइयों की जानकारी देने में मदद कर सकता हूं।\n\nआप अपनी दवाइयां कैसे बताना चाहेंगे?`,
    welcomeBack: (name, pharmacy, reminderCount) =>
      `फिर से स्वागत है, ${name}! 🙏\n\n*${pharmacy}* आपकी मदद के लिए है।${reminderCount > 0 ? `\n\nआपके *${reminderCount} सक्रिय रिमाइंडर* हैं।` : ""}\n\nआज मैं आपकी क्या मदद कर सकता हूं?`,
    chooseMethod: "अपना प्रिस्क्रिप्शन कैसे शेयर करें:",
    btnUpload: "📷 फोटो भेजें",
    btnType: "⌨️ दवाई लिखें",
    btnQuickLookup: "💊 दवाई खोजें",
    mainMenuPrompt: "एक विकल्प चुनें:",
    btnMyMedicines: "📋 मेरी दवाइयां",
    btnMedicineInfo: "💊 दवाई जानकारी",
    btnMyReminders: "⏰ मेरे रिमाइंडर",
    btnOrderMeds: "🛒 दवाई ऑर्डर करें",
    btnTalkPharmacist: "👨‍⚕️ फार्मासिस्ट से बात",
    btnLanguage: "🌐 English",
    btnMainMenu: "↩️ मुख्य मेनू",

    uploadPrompt: "📷 बढ़िया! अब अपने *प्रिस्क्रिप्शन की फोटो* भेजें।\n\n*अच्छी फोटो के लिए:*\n• अच्छी रोशनी, कोई छाया नहीं\n• कागज सपाट रखें\n• सभी दवाई के नाम फ्रेम में हों\n\n_कभी भी *cancel* लिखकर वापस जाएं।_",
    uploadWaiting: "मैं आपके प्रिस्क्रिप्शन की *फोटो* का इंतजार कर रहा हूं। 📷\n\nकृपया फोटो भेजें, या *cancel* लिखकर वापस जाएं।",
    uploadProcessing: "📷 आपका प्रिस्क्रिप्शन मिल गया! अभी पढ़ रहा हूं... कुछ समय लगेगा।",
    uploadFailed: "माफ करें, फोटो डाउनलोड नहीं हो पाई। कृपया दोबारा भेजें।",
    uploadUnreadable: "प्रिस्क्रिप्शन ठीक से पढ़ नहीं पाया। 😕\n\n*अच्छी फोटो के लिए:*\n• अच्छी रोशनी\n• कागज सपाट रखें\n• दवाई के नाम साफ दिखें\n\nया *menu* लिखकर *दवाई लिखें* चुनें!",

    typingStart: (num) => `💊 *दवाई ${num}*\nकृपया *दवाई का नाम* लिखें:`,
    typingStartFirst: "💊 चलिए एक-एक करके दवाइयां जोड़ते हैं।\n\n*दवाई 1*\nकृपया *दवाई का नाम* लिखें:\n\n_उदाहरण: Paracetamol, Amoxicillin, Pan 40_\n\n_कभी भी *cancel* लिखकर वापस जाएं।_",
    typingTooShort: "यह बहुत छोटा है। कृपया *पूरा दवाई का नाम* लिखें:",
    typingRecognised: (name) => `✅ मैंने *${name}* पहचान लिया! इसकी पूरी जानकारी मेरे पास है।`,
    typingFormPrompt: (name) => `*${name}* किस रूप में है?`,
    btnTablet: "💊 गोली",
    btnCapsule: "💊 कैप्सूल",
    btnSyrup: "🧴 सिरप",
    typingDosagePrompt: "*डोज/ताकत* क्या है?\n\n_उदाहरण: 500mg, 250mg, 10ml_\n\nअगर नहीं पता तो *skip* लिखें।",
    typingFreqPrompt: (name) => `*${name}* कितनी बार लेनी है?`,
    btnOD: "दिन में 1 बार",
    btnBD: "दिन में 2 बार",
    btnTDS: "दिन में 3 बार",
    typingDurationPrompt: (name) => `*${name}* कितने दिन लेनी है?\n\n_उदाहरण: 5 दिन, 7 दिन, 1 महीना, हमेशा_\n\nअगर नहीं पता तो *skip* लिखें।`,
    typingFoodPrompt: (name) => `*${name}* खाने से पहले लेनी है या बाद में?`,
    btnBeforeFood: "खाने से पहले",
    btnAfterFood: "खाने के बाद",
    btnAnyTime: "कभी भी",
    typingAdded: (name, count) => `✅ *${name}* जोड़ दी! (अभी तक ${count} दवाई${count > 1 ? "यां" : ""})\n\nक्या एक और दवाई जोड़नी है?`,
    btnAddMore: "और जोड़ें",
    btnDoneReview: "हो गया, जांचें",

    verifyHeader: "📋 *कृपया अपनी दवाइयां जांचें:*\n",
    verifyFooter: "\n*क्या सब सही है?*",
    btnCorrect: "✅ हां, सही है",
    btnEdit: "✏️ बदलें",
    btnStartOver: "🔄 शुरू से",
    editPickPrompt: (lines) => `कौन सी दवाई बदलनी है? *नंबर* लिखें:\n\n${lines}\n\nया *remove 2* लिखकर दवाई #2 हटाएं।`,
    editFieldPrompt: (name, med) =>
      `*${name}* में बदलाव। कौन सा फील्ड?\n\n1. नाम (${med.name})\n2. प्रकार (${med.type})\n3. ताकत (${med.dosageStrength})\n4. कितनी बार (${med.frequencyLabel})\n5. कितने दिन (${med.duration})\n6. खाने का समय (${med.foodTiming})\n\n*नंबर* लिखें:`,
    editUpdated: (name, field, val) => `✏️ *${name}* का ${field} बदलकर: *${val}* किया`,
    removedMedicine: (name) => `🗑️ *${name}* हटा दी।`,
    noMedsLeft: "कोई दवाई नहीं बची। शुरू से शुरू करते हैं!\n\n*दवाई 1*\n*दवाई का नाम* लिखें:",
    startingOver: "🔄 शुरू से शुरू!\n\n*दवाई 1*\nकृपया *दवाई का नाम* लिखें:",
    verified: "आपकी दवाइयां पक्की हो गईं! क्या आप रिमाइंडर सेट करना चाहेंगे?",
    btnSetReminders: "रिमाइंडर सेट करें",
    btnInfoOnly: "सिर्फ जानकारी",
    infoOnlyDone: (pharmacy) => `ठीक है! ऊपर दवाई की जानकारी है। 📋\n\nकभी भी *menu* लिखें।\n\n— ${pharmacy}`,

    remindersSet: "✅ *रिमाइंडर सेट:*\n\n",
    reminderMsg: (med, schedule, pharmacy) =>
      `⏰ *दवाई का रिमाइंडर*\n\n💊 अभी लेनी है: *${med}*\n📋 शेड्यूल: ${schedule}\n\nक्या आपने ले ली?`,
    btnTookIt: "✅ ले ली",
    btnSkipped: "⏭️ छोड़ दी",
    btnSnooze: "⏰ +15 मिनट",
    adherenceRecorded: (med) => `बहुत अच्छे! ✅ *${med}* ले ली। ऐसे ही जारी रखें! 💪`,
    adherenceSkipped: (med) => `ठीक है। आपने इस बार *${med}* छोड़ दी। अगली खुराक जरूर लें।`,
    adherenceSnoozed: (med) => `⏰ ठीक है! 15 मिनट बाद फिर याद दिलाऊंगा *${med}* के लिए।`,

    interactionWarning: "⚠️ *दवाई इंटरैक्शन चेतावनी*",
    interactionNone: "✅ आपकी दवाइयों में कोई ज्ञात इंटरैक्शन नहीं मिला।",
    interactionDisclaimer: "\n_यह सिर्फ जानकारी के लिए है। कृपया अपने डॉक्टर या फार्मासिस्ट से सलाह लें।_",

    alternativesHeader: (name) => `💊 *${name} के जेनेरिक विकल्प:*\n`,
    noAlternatives: (name) => `${name} के विकल्प हमारे डेटाबेस में नहीं हैं।`,

    orderConfirm: (items, total) =>
      `🛒 *आपके ऑर्डर का सारांश:*\n\n${items}\n\n*अनुमानित कुल: ₹${total}*\n\nक्या ऑर्डर देना चाहेंगे?`,
    btnPlaceOrder: "✅ ऑर्डर दें",
    btnModifyOrder: "✏️ बदलें",
    orderPlaced: (orderId) =>
      `✅ *ऑर्डर हो गया!*\n\n🆔 ऑर्डर ID: #${orderId}\n📦 आपकी दवाइयां जल्द तैयार होंगी।\n\nजब तैयार होंगी, हम बताएंगे!`,
    orderNotAvailable: "🛒 ऑनलाइन ऑर्डर जल्द आ रहा है! अभी के लिए, कृपया फार्मेसी पर आएं या कॉल करें।\n\n*pharmacist* लिखकर हमारी टीम से बात करें।",

    pharmacistConnect: (pharmacy, phone) =>
      `👨‍⚕️ *${pharmacy} से बात करें*\n\nहमारे फार्मासिस्ट आपकी मदद के लिए हैं!\n\n📞 कॉल: ${phone}\n⏰ समय: सुबह 9 - रात 9\n\nआप यहां भी अपना सवाल लिख सकते हैं, हम फार्मासिस्ट को भेज देंगे।`,
    pharmacistForwarded: "📨 आपका संदेश हमारे फार्मासिस्ट को भेज दिया है। वे जल्द जवाब देंगे!",

    refillReminder: (med, daysLeft) =>
      `🔄 *रीफिल रिमाइंडर*\n\n💊 *${med}* — केवल *${daysLeft} दिन* की दवाई बची है।\n\nक्या दोबारा ऑर्डर करना चाहेंगे?`,
    btnReorder: "🛒 दोबारा ऑर्डर",
    btnDismiss: "बाद में",

    noThanks: (pharmacy) => `कोई बात नहीं! कभी भी *menu* लिखें। स्वस्थ रहें! 💚\n\n— ${pharmacy}`,
    error: (pharmacy) => `कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें या ${pharmacy} पर आएं।`,
    unsupportedType: "माफ करें, अभी मैं सिर्फ टेक्स्ट और प्रिस्क्रिप्शन फोटो समझ सकता हूं। 📝📷",
    fallback: "मैं समझ नहीं पाया।\n\nआप कर सकते हैं:\n• प्रिस्क्रिप्शन की *फोटो* भेजें 📷\n• *दवाई का नाम* लिखें (जैसे: Paracetamol)\n• *menu* लिखें",
    medNotFound: (name, pharmacy) => `"${name}" की जानकारी अभी नहीं है।\n\nकोशिश करें: Paracetamol, Amoxicillin, Omeprazole, Cetirizine\n\nया *${pharmacy}* पर आएं!`,
    disclaimer: "⚠️ _हमेशा अपने डॉक्टर की सलाह मानें। यह सामान्य जानकारी है।_",
    languageSwitched: "भाषा *हिंदी* में बदल दी गई 🇮🇳",
  },
};

// ─── User language preference store ───────────────────────────
const userLang = new Map(); // phone -> "en" | "hi"

function getLang(phone) {
  return userLang.get(phone) || "en";
}

function setLang(phone, lang) {
  userLang.set(phone, lang);
}

function t(phone, key, ...args) {
  const lang = getLang(phone);
  const str = strings[lang]?.[key] || strings.en[key];
  if (typeof str === "function") return str(...args);
  return str;
}

module.exports = { t, getLang, setLang, strings };
