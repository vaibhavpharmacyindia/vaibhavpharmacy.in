// ═══════════════════════════════════════════════════════════════
//  DRUG INTERACTION CHECKER
// ═══════════════════════════════════════════════════════════════
// Checks for known drug-drug interactions, contraindications,
// and common allergy warnings.
//
// Severity levels:
//   "severe"   → Do NOT take together — risk of serious harm
//   "moderate" → Caution — doctor should monitor
//   "mild"     → Minor interaction — usually okay with awareness

const interactions = [
  // ── Severe Interactions ─────────────────────────────────────
  {
    drugs: ["metformin", "ciprofloxacin"],
    severity: "severe",
    description: {
      en: "Ciprofloxacin can cause dangerous blood sugar swings (both high and low) when taken with Metformin. Blood sugar must be closely monitored.",
      hi: "Ciprofloxacin के साथ Metformin लेने से खतरनाक तरीके से शुगर बढ़ या घट सकती है। शुगर की नजदीकी निगरानी जरूरी है।",
    },
  },
  {
    drugs: ["ibuprofen", "diclofenac"],
    severity: "severe",
    description: {
      en: "Never take two NSAIDs together! Ibuprofen + Diclofenac greatly increases risk of stomach bleeding and kidney damage.",
      hi: "दो NSAID दवाइयां कभी साथ न लें! Ibuprofen + Diclofenac से पेट में खून और किडनी खराब होने का खतरा बहुत बढ़ जाता है।",
    },
  },
  {
    drugs: ["atorvastatin", "azithromycin"],
    severity: "severe",
    description: {
      en: "Azithromycin can increase Atorvastatin levels in blood, raising risk of muscle damage (rhabdomyolysis). Doctor should monitor.",
      hi: "Azithromycin से Atorvastatin का असर बढ़ सकता है, जिससे मांसपेशियों को नुकसान का खतरा है। डॉक्टर की निगरानी जरूरी।",
    },
  },

  // ── Moderate Interactions ───────────────────────────────────
  {
    drugs: ["amlodipine", "metformin"],
    severity: "moderate",
    description: {
      en: "Amlodipine may slightly reduce Metformin effectiveness. Monitor blood sugar levels more frequently.",
      hi: "Amlodipine से Metformin का असर थोड़ा कम हो सकता है। शुगर ज्यादा बार चेक करें।",
    },
  },
  {
    drugs: ["omeprazole", "metformin"],
    severity: "moderate",
    description: {
      en: "Long-term Omeprazole use may reduce Vitamin B12 absorption, which is already a concern with Metformin. Get B12 levels checked.",
      hi: "लंबे समय तक Omeprazole लेने से Vitamin B12 कम हो सकता है, जो Metformin से भी होता है। B12 चेक कराएं।",
    },
  },
  {
    drugs: ["ciprofloxacin", "pantoprazole"],
    severity: "moderate",
    description: {
      en: "Pantoprazole may reduce Ciprofloxacin absorption. Take Ciprofloxacin 2 hours before or 6 hours after Pantoprazole.",
      hi: "Pantoprazole से Ciprofloxacin का असर कम हो सकता है। Ciprofloxacin को Pantoprazole से 2 घंटे पहले या 6 घंटे बाद लें।",
    },
  },
  {
    drugs: ["telmisartan", "ibuprofen"],
    severity: "moderate",
    description: {
      en: "Ibuprofen can reduce Telmisartan's blood pressure lowering effect and increase kidney risk. Avoid long-term use together.",
      hi: "Ibuprofen से Telmisartan का BP कम करने का असर घट सकता है और किडनी पर खतरा बढ़ सकता है। साथ में लंबे समय तक न लें।",
    },
  },
  {
    drugs: ["telmisartan", "diclofenac"],
    severity: "moderate",
    description: {
      en: "Diclofenac can reduce Telmisartan's BP-lowering effect and increase kidney risk. Use the lowest dose for shortest time.",
      hi: "Diclofenac से Telmisartan का BP कम करने का असर घट सकता है। सबसे कम डोज, सबसे कम दिन लें।",
    },
  },
  {
    drugs: ["amlodipine", "atorvastatin"],
    severity: "moderate",
    description: {
      en: "Amlodipine can increase Atorvastatin levels. Use Atorvastatin max 20mg when combined. Report any muscle pain.",
      hi: "Amlodipine से Atorvastatin का असर बढ़ सकता है। साथ में Atorvastatin 20mg से ज्यादा न लें। मांसपेशियों में दर्द हो तो बताएं।",
    },
  },
  {
    drugs: ["glimepiride", "ciprofloxacin"],
    severity: "moderate",
    description: {
      en: "Ciprofloxacin can increase the blood sugar lowering effect of Glimepiride, risking hypoglycemia. Monitor closely.",
      hi: "Ciprofloxacin से Glimepiride का शुगर कम करने का असर बढ़ सकता है। शुगर नजदीकी से चेक करें।",
    },
  },
  {
    drugs: ["cetirizine", "domperidone"],
    severity: "moderate",
    description: {
      en: "Both can cause drowsiness. Taking together increases sedation. Avoid driving or operating machinery.",
      hi: "दोनों से नींद आ सकती है। साथ लेने से और ज्यादा नींद आएगी। गाड़ी न चलाएं।",
    },
  },

  // ── Mild Interactions ───────────────────────────────────────
  {
    drugs: ["paracetamol", "cetirizine"],
    severity: "mild",
    description: {
      en: "Generally safe together. Cetirizine may slightly increase drowsiness.",
      hi: "साथ में आमतौर पर सुरक्षित है। Cetirizine से थोड़ी नींद आ सकती है।",
    },
  },
  {
    drugs: ["amoxicillin", "paracetamol"],
    severity: "mild",
    description: {
      en: "Safe to take together. No significant interaction.",
      hi: "साथ लेना सुरक्षित है। कोई खास इंटरैक्शन नहीं।",
    },
  },
  {
    drugs: ["pantoprazole", "domperidone"],
    severity: "mild",
    description: {
      en: "Commonly prescribed together (Pan-D). Generally safe.",
      hi: "आमतौर पर साथ में दी जाती हैं (Pan-D)। सामान्यतः सुरक्षित।",
    },
  },
];

// ─── Check interactions for a list of medicines ───────────────
function checkInteractions(medicineNames, lang = "en") {
  const normalised = medicineNames.map((n) => n.toLowerCase().trim());
  const found = [];

  for (const interaction of interactions) {
    const [drugA, drugB] = interaction.drugs;
    const hasA = normalised.some((n) => n.includes(drugA) || drugA.includes(n));
    const hasB = normalised.some((n) => n.includes(drugB) || drugB.includes(n));

    if (hasA && hasB) {
      found.push({
        drugs: interaction.drugs,
        severity: interaction.severity,
        description: interaction.description[lang] || interaction.description.en,
      });
    }
  }

  // Sort: severe first, then moderate, then mild
  const order = { severe: 0, moderate: 1, mild: 2 };
  found.sort((a, b) => order[a.severity] - order[b.severity]);

  return found;
}

// ─── Format interaction report ────────────────────────────────
function formatInteractionReport(results, lang = "en") {
  if (results.length === 0) return null;

  const icons = { severe: "🔴", moderate: "🟡", mild: "🟢" };
  const labels = {
    severe: lang === "hi" ? "गंभीर" : "SEVERE",
    moderate: lang === "hi" ? "सावधानी" : "CAUTION",
    mild: lang === "hi" ? "हल्का" : "MILD",
  };

  let msg = lang === "hi"
    ? "⚠️ *दवाई इंटरैक्शन चेतावनी*\n\n"
    : "⚠️ *DRUG INTERACTION WARNING*\n\n";

  for (const r of results) {
    msg += `${icons[r.severity]} *${labels[r.severity]}*: ${r.drugs[0]} + ${r.drugs[1]}\n`;
    msg += `${r.description}\n\n`;
  }

  msg += "━━━━━━━━━━━━━━━━━━━━━\n";
  msg += lang === "hi"
    ? "_यह सिर्फ जानकारी के लिए है। कृपया अपने डॉक्टर या फार्मासिस्ट से सलाह लें।_"
    : "_This is for awareness only. Always consult your doctor or pharmacist before making changes._";

  return msg;
}

module.exports = { checkInteractions, formatInteractionReport };
