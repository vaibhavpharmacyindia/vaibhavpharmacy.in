// ═══════════════════════════════════════════════════════════════
//  MEDICINE DATABASE — Vaibhav Pharmacy
// ═══════════════════════════════════════════════════════════════
// 50+ commonly prescribed medicines in India with:
//   - Multiple brand names & aliases
//   - Generic alternatives with approximate MRP
//   - Usage in English & Hindi
//   - Dosage, side effects, precautions
//   - Food timing
//
// DISCLAIMER: Information is for general awareness only.
// Always follow your doctor's prescription.
// ═══════════════════════════════════════════════════════════════

const medicines = {
  // ─────────────────────────────────────────────────────────────
  //  PAIN & FEVER
  // ─────────────────────────────────────────────────────────────
  paracetamol: {
    names: ["paracetamol", "crocin", "dolo", "dolo 650", "calpol", "p 650", "pacimol", "pyrigesic", "metacin"],
    generic: "Paracetamol",
    category: "Pain & Fever",
    usage: "Used to reduce fever and relieve mild to moderate pain such as headache, toothache, body ache.",
    usageHi: "बुखार कम करने और हल्के से मध्यम दर्द जैसे सिरदर्द, दांत दर्द, शरीर दर्द में काम आती है।",
    dosage: "Adults: 500-650mg every 4-6 hours. Max 4g/day.\nChildren: As per weight — consult doctor.",
    sideEffects: "Generally safe. Rare: skin rash, liver issues with overdose.",
    precautions: "Do not exceed 4g/day. Avoid alcohol. Not for liver disease patients.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Dolo 650", brand: true, price: 30 },
      { name: "Crocin 650", brand: true, price: 25 },
      { name: "Paracetamol 650mg (Generic)", brand: false, price: 10 },
      { name: "Calpol 500mg", brand: true, price: 20 },
    ],
  },

  ibuprofen: {
    names: ["ibuprofen", "brufen", "combiflam", "ibugesic", "ibuprofen 400"],
    generic: "Ibuprofen",
    category: "Pain & Inflammation",
    usage: "Used for pain relief, inflammation, and fever. Effective for joint pain, menstrual cramps, dental pain.",
    usageHi: "दर्द, सूजन और बुखार में। जोड़ों के दर्द, मासिक धर्म के दर्द, दांत के दर्द में असरदार।",
    dosage: "Adults: 200-400mg every 6-8 hours with food. Max 1200mg/day.",
    sideEffects: "Stomach irritation, nausea, headache. Rare: stomach ulcer with long use.",
    precautions: "Take with food. Avoid in asthma, kidney disease, or stomach ulcers. Not with blood thinners.",
    foodTiming: "Always take after food.",
    alternatives: [
      { name: "Brufen 400", brand: true, price: 35 },
      { name: "Combiflam", brand: true, price: 40 },
      { name: "Ibuprofen 400mg (Generic)", brand: false, price: 12 },
    ],
  },

  diclofenac: {
    names: ["diclofenac", "voveran", "voltaren", "dicloran", "dynapar", "reactin"],
    generic: "Diclofenac",
    category: "Pain & Inflammation",
    usage: "Strong anti-inflammatory painkiller for joint pain, back pain, post-surgery pain.",
    usageHi: "मजबूत सूजन-रोधी दर्द निवारक। जोड़ों का दर्द, कमर दर्द, ऑपरेशन के बाद दर्द में।",
    dosage: "Adults: 50mg 2-3 times/day with food.",
    sideEffects: "Stomach pain, nausea, dizziness. Long use may affect kidneys.",
    precautions: "Take with food. Avoid in heart disease, kidney issues, stomach ulcers.",
    foodTiming: "Always take after food.",
    alternatives: [
      { name: "Voveran 50", brand: true, price: 45 },
      { name: "Diclofenac 50mg (Generic)", brand: false, price: 8 },
    ],
  },

  "aceclofenac": {
    names: ["aceclofenac", "hifenac", "zerodol", "ace proxyvon", "aceclo"],
    generic: "Aceclofenac",
    category: "Pain & Inflammation",
    usage: "Anti-inflammatory for arthritis, joint pain, back pain. Gentler on stomach than Diclofenac.",
    usageHi: "गठिया, जोड़ों का दर्द, कमर दर्द। Diclofenac से पेट पर कम असर।",
    dosage: "Adults: 100mg twice daily after food.",
    sideEffects: "Stomach pain, nausea, dizziness.",
    precautions: "Take after food. Avoid long-term use. Not with blood thinners.",
    foodTiming: "Always take after food.",
    alternatives: [
      { name: "Zerodol 100", brand: true, price: 65 },
      { name: "Hifenac 100", brand: true, price: 55 },
      { name: "Aceclofenac 100mg (Generic)", brand: false, price: 15 },
    ],
  },

  tramadol: {
    names: ["tramadol", "ultracet", "contramal", "tramazac"],
    generic: "Tramadol",
    category: "Strong Painkiller",
    usage: "Moderate to severe pain. Often combined with Paracetamol (Ultracet).",
    usageHi: "मध्यम से तेज दर्द। अक्सर Paracetamol के साथ दी जाती है (Ultracet)।",
    dosage: "Adults: 50-100mg every 4-6 hours. Max 400mg/day. Doctor prescribed only.",
    sideEffects: "Nausea, dizziness, drowsiness, constipation. Risk of dependency.",
    precautions: "Prescription only. Do not drive. Avoid alcohol. Can cause dependency with long use.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Ultracet", brand: true, price: 85 },
      { name: "Tramadol 50mg (Generic)", brand: false, price: 25 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  ANTIBIOTICS
  // ─────────────────────────────────────────────────────────────
  amoxicillin: {
    names: ["amoxicillin", "amoxyclav", "augmentin", "mox", "novamox", "clavam", "amoxicillin clavulanate"],
    generic: "Amoxicillin",
    category: "Antibiotic",
    usage: "Treats bacterial infections: throat, ear, UTI, skin, dental infections.",
    usageHi: "बैक्टीरियल संक्रमण: गले, कान, UTI, त्वचा, दांत के संक्रमण में।",
    dosage: "Adults: 250-500mg every 8 hours for 5-7 days.\nComplete the full course.",
    sideEffects: "Diarrhea, nausea, skin rash. Rare: allergic reaction.",
    precautions: "Complete full course. Inform doctor if penicillin allergy. Take at fixed intervals.",
    foodTiming: "Can be taken with or without food. Take at evenly spaced intervals.",
    alternatives: [
      { name: "Augmentin 625", brand: true, price: 210 },
      { name: "Mox 500", brand: true, price: 85 },
      { name: "Amoxicillin 500mg (Generic)", brand: false, price: 35 },
    ],
  },

  azithromycin: {
    names: ["azithromycin", "azee", "zithromax", "azicip", "azilide", "azithral"],
    generic: "Azithromycin",
    category: "Antibiotic",
    usage: "Respiratory infections, skin infections, ear infections, STIs.",
    usageHi: "सांस की नली का संक्रमण, त्वचा संक्रमण, कान संक्रमण।",
    dosage: "Adults: 500mg day 1, then 250mg for 4 days. OR 500mg daily for 3 days.",
    sideEffects: "Nausea, diarrhea, stomach pain, headache.",
    precautions: "Complete full course. Best on empty stomach.",
    foodTiming: "Best on empty stomach (1 hr before or 2 hrs after food).",
    alternatives: [
      { name: "Azee 500", brand: true, price: 100 },
      { name: "Azithral 500", brand: true, price: 90 },
      { name: "Azithromycin 500mg (Generic)", brand: false, price: 30 },
    ],
  },

  ciprofloxacin: {
    names: ["ciprofloxacin", "ciplox", "cipro", "cifran"],
    generic: "Ciprofloxacin",
    category: "Antibiotic",
    usage: "UTI, respiratory, bone/joint, gastro infections.",
    usageHi: "UTI, सांस, हड्डी/जोड़, पेट के संक्रमण।",
    dosage: "Adults: 250-500mg every 12 hours for 7-14 days.",
    sideEffects: "Nausea, diarrhea, dizziness. Rare: tendon problems.",
    precautions: "Drink plenty of water. Avoid dairy 2 hrs before/after. Avoid sunlight.",
    foodTiming: "Can take with or without food. Avoid dairy near dose time.",
    alternatives: [
      { name: "Ciplox 500", brand: true, price: 80 },
      { name: "Cifran 500", brand: true, price: 75 },
      { name: "Ciprofloxacin 500mg (Generic)", brand: false, price: 20 },
    ],
  },

  cefixime: {
    names: ["cefixime", "zifi", "taxim o", "cefix", "mahacef"],
    generic: "Cefixime",
    category: "Antibiotic",
    usage: "UTI, typhoid, respiratory tract infections, gonorrhea.",
    usageHi: "UTI, टाइफाइड, सांस की नली का संक्रमण।",
    dosage: "Adults: 200mg twice daily for 5-14 days.",
    sideEffects: "Diarrhea, nausea, stomach pain.",
    precautions: "Complete full course. Take at regular intervals.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Zifi 200", brand: true, price: 120 },
      { name: "Taxim-O 200", brand: true, price: 140 },
      { name: "Cefixime 200mg (Generic)", brand: false, price: 40 },
    ],
  },

  "levofloxacin": {
    names: ["levofloxacin", "levoflox", "levomac", "tavanic", "glevo"],
    generic: "Levofloxacin",
    category: "Antibiotic",
    usage: "Pneumonia, sinusitis, UTI, skin infections. Stronger fluoroquinolone.",
    usageHi: "निमोनिया, साइनसाइटिस, UTI, त्वचा संक्रमण। मजबूत एंटीबायोटिक।",
    dosage: "Adults: 500-750mg once daily for 5-14 days.",
    sideEffects: "Nausea, headache, dizziness. Rare: tendon rupture, nerve damage.",
    precautions: "Stay hydrated. Avoid sunlight. Complete full course.",
    foodTiming: "Can take with or without food. Take at same time daily.",
    alternatives: [
      { name: "Levoflox 500", brand: true, price: 90 },
      { name: "Glevo 500", brand: true, price: 85 },
      { name: "Levofloxacin 500mg (Generic)", brand: false, price: 25 },
    ],
  },

  metronidazole: {
    names: ["metronidazole", "flagyl", "metrogyl", "metro"],
    generic: "Metronidazole",
    category: "Antibiotic / Antiparasitic",
    usage: "Stomach infections, dental infections, amoebic dysentery, bacterial vaginosis.",
    usageHi: "पेट संक्रमण, दांत संक्रमण, अमीबिक पेचिश।",
    dosage: "Adults: 400mg three times daily for 5-7 days.",
    sideEffects: "Nausea, metallic taste, dark urine.",
    precautions: "STRICTLY avoid alcohol (can cause severe vomiting). Complete full course.",
    foodTiming: "Take with or after food.",
    alternatives: [
      { name: "Flagyl 400", brand: true, price: 25 },
      { name: "Metrogyl 400", brand: true, price: 20 },
      { name: "Metronidazole 400mg (Generic)", brand: false, price: 8 },
    ],
  },

  doxycycline: {
    names: ["doxycycline", "doxt", "doxy", "doxicip"],
    generic: "Doxycycline",
    category: "Antibiotic",
    usage: "Acne, respiratory infections, UTI, malaria prevention, Lyme disease.",
    usageHi: "मुहांसे, सांस का संक्रमण, UTI, मलेरिया रोकथाम।",
    dosage: "Adults: 100mg twice daily on day 1, then 100mg once daily.",
    sideEffects: "Nausea, sun sensitivity, stomach upset.",
    precautions: "Avoid sunlight exposure. Don't lie down for 30 min after taking. No dairy near dose.",
    foodTiming: "Take with food and a full glass of water.",
    alternatives: [
      { name: "Doxt-SL 100", brand: true, price: 60 },
      { name: "Doxycycline 100mg (Generic)", brand: false, price: 15 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  STOMACH & DIGESTION
  // ─────────────────────────────────────────────────────────────
  omeprazole: {
    names: ["omeprazole", "omez", "prilosec", "ocid"],
    generic: "Omeprazole",
    category: "Antacid / PPI",
    usage: "Reduces stomach acid. Acidity, GERD, stomach ulcers, heartburn.",
    usageHi: "पेट का एसिड कम करती है। एसिडिटी, GERD, अल्सर, सीने की जलन।",
    dosage: "Adults: 20mg once daily before breakfast for 2-8 weeks.",
    sideEffects: "Headache, nausea, diarrhea. Long-term: low magnesium, B12 deficiency.",
    precautions: "Take 30 min before meals. Not for long-term without doctor advice.",
    foodTiming: "Take 30 minutes BEFORE breakfast on empty stomach.",
    alternatives: [
      { name: "Omez 20", brand: true, price: 75 },
      { name: "Omeprazole 20mg (Generic)", brand: false, price: 15 },
    ],
  },

  pantoprazole: {
    names: ["pantoprazole", "pantop", "pan", "pan d", "pan 40", "pantocid"],
    generic: "Pantoprazole",
    category: "Antacid / PPI",
    usage: "Reduces stomach acid. Acidity, GERD, peptic ulcers.",
    usageHi: "पेट का एसिड कम करती है। एसिडिटी, GERD, पेप्टिक अल्सर।",
    dosage: "Adults: 40mg once daily before breakfast.",
    sideEffects: "Headache, nausea, gas. Long-term: bone weakness.",
    precautions: "Take before meals. Swallow whole — do not crush or chew.",
    foodTiming: "Take 30-60 minutes BEFORE food, preferably morning.",
    alternatives: [
      { name: "Pan 40", brand: true, price: 85 },
      { name: "Pantocid 40", brand: true, price: 90 },
      { name: "Pantoprazole 40mg (Generic)", brand: false, price: 18 },
    ],
  },

  domperidone: {
    names: ["domperidone", "domstal", "vomistop", "domperi"],
    generic: "Domperidone",
    category: "Anti-nausea",
    usage: "Relieves nausea, vomiting, bloating, feeling of fullness.",
    usageHi: "मतली, उल्टी, पेट फूलना, भारीपन में राहत।",
    dosage: "Adults: 10mg 3 times/day, 15-30 min before meals.",
    sideEffects: "Dry mouth, headache. Rare: irregular heartbeat.",
    precautions: "Take before meals. Not for long-term use.",
    foodTiming: "Take 15-30 minutes BEFORE food.",
    alternatives: [
      { name: "Domstal 10", brand: true, price: 35 },
      { name: "Domperidone 10mg (Generic)", brand: false, price: 8 },
    ],
  },

  ranitidine: {
    names: ["ranitidine", "rantac", "zinetac", "aciloc"],
    generic: "Ranitidine",
    category: "Antacid / H2 Blocker",
    usage: "Acidity, GERD, stomach ulcers. Milder acid reducer than PPIs.",
    usageHi: "एसिडिटी, GERD, अल्सर। PPI से हल्की एसिड कम करने वाली।",
    dosage: "Adults: 150mg twice daily or 300mg at bedtime.",
    sideEffects: "Headache, constipation, dizziness.",
    precautions: "Available OTC but consult doctor for long-term use.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Rantac 150", brand: true, price: 30 },
      { name: "Aciloc 150", brand: true, price: 35 },
      { name: "Ranitidine 150mg (Generic)", brand: false, price: 10 },
    ],
  },

  ondansetron: {
    names: ["ondansetron", "emeset", "ondem", "vomikind"],
    generic: "Ondansetron",
    category: "Anti-nausea",
    usage: "Prevents and treats nausea/vomiting from chemotherapy, surgery, or illness.",
    usageHi: "कीमोथेरेपी, सर्जरी या बीमारी से होने वाली मतली/उल्टी रोकती है।",
    dosage: "Adults: 4-8mg every 8 hours as needed.",
    sideEffects: "Headache, constipation, fatigue.",
    precautions: "Use as prescribed. Not for long-term daily use.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Emeset 4", brand: true, price: 40 },
      { name: "Ondem 4", brand: true, price: 35 },
      { name: "Ondansetron 4mg (Generic)", brand: false, price: 12 },
    ],
  },

  "rabeprazole": {
    names: ["rabeprazole", "razo", "rablet", "rabeloc", "happi"],
    generic: "Rabeprazole",
    category: "Antacid / PPI",
    usage: "Acidity, GERD, peptic ulcers. Works faster than Omeprazole.",
    usageHi: "एसिडिटी, GERD, पेप्टिक अल्सर। Omeprazole से तेज असर।",
    dosage: "Adults: 20mg once daily before breakfast.",
    sideEffects: "Headache, diarrhea, stomach pain.",
    precautions: "Take before food. Do not crush tablets.",
    foodTiming: "Take 30 minutes BEFORE breakfast.",
    alternatives: [
      { name: "Razo 20", brand: true, price: 95 },
      { name: "Rablet 20", brand: true, price: 80 },
      { name: "Rabeprazole 20mg (Generic)", brand: false, price: 20 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  DIABETES
  // ─────────────────────────────────────────────────────────────
  metformin: {
    names: ["metformin", "glycomet", "glucophage", "obimet", "glycomet gp"],
    generic: "Metformin",
    category: "Diabetes",
    usage: "Controls blood sugar in Type 2 diabetes. Also used in PCOS.",
    usageHi: "टाइप 2 डायबिटीज में ब्लड शुगर कंट्रोल करती है। PCOS में भी।",
    dosage: "Adults: Start 500mg once/twice daily. Max 2000mg/day.",
    sideEffects: "Nausea, diarrhea, stomach upset (usually temporary). Rare: lactic acidosis.",
    precautions: "Take with food. Check blood sugar regularly. Avoid excess alcohol.",
    foodTiming: "Always take WITH food or immediately after food.",
    alternatives: [
      { name: "Glycomet 500", brand: true, price: 30 },
      { name: "Glucophage 500", brand: true, price: 35 },
      { name: "Metformin 500mg (Generic)", brand: false, price: 8 },
    ],
  },

  glimepiride: {
    names: ["glimepiride", "amaryl", "glimisave", "glimy"],
    generic: "Glimepiride",
    category: "Diabetes",
    usage: "Lowers blood sugar by helping pancreas produce more insulin.",
    usageHi: "पैंक्रियास से ज्यादा इंसुलिन बनाकर शुगर कम करती है।",
    dosage: "Adults: 1-4mg once daily with breakfast.",
    sideEffects: "Low blood sugar (hypoglycemia), weight gain, nausea.",
    precautions: "Take with breakfast. Carry glucose tablets. Regular blood tests.",
    foodTiming: "Take WITH breakfast.",
    alternatives: [
      { name: "Amaryl 2", brand: true, price: 110 },
      { name: "Glimisave 2", brand: true, price: 60 },
      { name: "Glimepiride 2mg (Generic)", brand: false, price: 20 },
    ],
  },

  sitagliptin: {
    names: ["sitagliptin", "januvia", "istavel", "zita"],
    generic: "Sitagliptin",
    category: "Diabetes",
    usage: "Type 2 diabetes. Works by increasing incretin hormones that help control blood sugar.",
    usageHi: "टाइप 2 डायबिटीज। इंक्रेटिन हॉर्मोन बढ़ाकर शुगर कंट्रोल करती है।",
    dosage: "Adults: 100mg once daily.",
    sideEffects: "Headache, stuffy nose. Rare: pancreatitis.",
    precautions: "Regular blood sugar monitoring. Report severe stomach pain.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Januvia 100", brand: true, price: 550 },
      { name: "Istavel 100", brand: true, price: 350 },
      { name: "Sitagliptin 100mg (Generic)", brand: false, price: 120 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  BLOOD PRESSURE & HEART
  // ─────────────────────────────────────────────────────────────
  amlodipine: {
    names: ["amlodipine", "amlong", "norvasc", "amlopress", "amlokind"],
    generic: "Amlodipine",
    category: "Blood Pressure",
    usage: "Lowers high blood pressure and treats chest pain (angina).",
    usageHi: "हाई BP कम करती है और सीने में दर्द (एंजाइना) का इलाज।",
    dosage: "Adults: 2.5-10mg once daily.",
    sideEffects: "Swollen ankles, headache, dizziness, flushing.",
    precautions: "Take at the same time daily. Do not stop suddenly. Avoid grapefruit.",
    foodTiming: "Can be taken with or without food. Same time each day.",
    alternatives: [
      { name: "Amlong 5", brand: true, price: 40 },
      { name: "Amlodipine 5mg (Generic)", brand: false, price: 10 },
    ],
  },

  telmisartan: {
    names: ["telmisartan", "telma", "micardis", "telvas", "telsartan"],
    generic: "Telmisartan",
    category: "Blood Pressure",
    usage: "High blood pressure. Protects kidneys in diabetics.",
    usageHi: "हाई BP। डायबिटीज में किडनी की सुरक्षा।",
    dosage: "Adults: 20-80mg once daily.",
    sideEffects: "Dizziness, back pain, diarrhea. Rare: high potassium.",
    precautions: "Take regularly at same time. Do not stop suddenly. Avoid in pregnancy.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Telma 40", brand: true, price: 110 },
      { name: "Telmisartan 40mg (Generic)", brand: false, price: 25 },
    ],
  },

  atorvastatin: {
    names: ["atorvastatin", "atorva", "lipitor", "atocor", "tonact"],
    generic: "Atorvastatin",
    category: "Cholesterol",
    usage: "Lowers cholesterol. Reduces risk of heart attack/stroke.",
    usageHi: "कोलेस्ट्रॉल कम करती है। हार्ट अटैक/स्ट्रोक का खतरा कम।",
    dosage: "Adults: 10-80mg once daily at night.",
    sideEffects: "Muscle pain, headache, nausea. Rare: liver issues.",
    precautions: "Take at night. Regular liver tests. Report unexplained muscle pain.",
    foodTiming: "Take at NIGHT (bedtime). With or without food.",
    alternatives: [
      { name: "Atorva 10", brand: true, price: 90 },
      { name: "Atorvastatin 10mg (Generic)", brand: false, price: 20 },
    ],
  },

  losartan: {
    names: ["losartan", "losar", "cozaar", "repace", "losacar"],
    generic: "Losartan",
    category: "Blood Pressure",
    usage: "High blood pressure. Protects kidneys, especially in diabetics.",
    usageHi: "हाई BP। किडनी की सुरक्षा, खासकर डायबिटीज में।",
    dosage: "Adults: 25-100mg once daily.",
    sideEffects: "Dizziness, fatigue, low blood pressure.",
    precautions: "Do not stop suddenly. Avoid in pregnancy. Stay hydrated.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Repace 50", brand: true, price: 80 },
      { name: "Losartan 50mg (Generic)", brand: false, price: 18 },
    ],
  },

  aspirin: {
    names: ["aspirin", "ecosprin", "disprin", "aspirin 75", "ecosprin 75"],
    generic: "Aspirin",
    category: "Blood Thinner / Heart",
    usage: "Low-dose: prevents heart attack/stroke. High-dose: pain/fever.",
    usageHi: "कम डोज: हार्ट अटैक/स्ट्रोक रोकता है। ज्यादा डोज: दर्द/बुखार।",
    dosage: "Heart protection: 75-150mg once daily.\nPain: 300-600mg every 4-6 hours.",
    sideEffects: "Stomach irritation, easy bruising, bleeding risk.",
    precautions: "Not for children under 16 (Reye's syndrome). Take with food. Avoid with blood thinners.",
    foodTiming: "Take after food to reduce stomach irritation.",
    alternatives: [
      { name: "Ecosprin 75", brand: true, price: 15 },
      { name: "Aspirin 75mg (Generic)", brand: false, price: 5 },
    ],
  },

  clopidogrel: {
    names: ["clopidogrel", "clopilet", "plavix", "clopitab"],
    generic: "Clopidogrel",
    category: "Blood Thinner / Heart",
    usage: "Prevents blood clots. Used after heart attack, stent placement, stroke.",
    usageHi: "खून के थक्के रोकता है। हार्ट अटैक, स्टेंट, स्ट्रोक के बाद।",
    dosage: "Adults: 75mg once daily.",
    sideEffects: "Easy bruising, nosebleeds, stomach upset.",
    precautions: "Do not stop without doctor advice. Inform before any surgery.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Clopilet 75", brand: true, price: 90 },
      { name: "Clopidogrel 75mg (Generic)", brand: false, price: 20 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  ALLERGY & RESPIRATORY
  // ─────────────────────────────────────────────────────────────
  cetirizine: {
    names: ["cetirizine", "cetzine", "zyrtec", "okacet", "alerid"],
    generic: "Cetirizine",
    category: "Antihistamine / Allergy",
    usage: "Allergy symptoms: sneezing, runny nose, itchy eyes, hives, skin allergy.",
    usageHi: "एलर्जी: छींक, नाक बहना, आंखों में खुजली, पित्ती, त्वचा एलर्जी।",
    dosage: "Adults: 10mg once daily.\nChildren 6-12: 5mg daily.",
    sideEffects: "Drowsiness, dry mouth, headache.",
    precautions: "May cause drowsiness — avoid driving. Avoid alcohol.",
    foodTiming: "Can be taken with or without food. Best at bedtime if drowsy.",
    alternatives: [
      { name: "Cetzine 10", brand: true, price: 25 },
      { name: "Okacet 10", brand: true, price: 20 },
      { name: "Cetirizine 10mg (Generic)", brand: false, price: 5 },
    ],
  },

  levocetirizine: {
    names: ["levocetirizine", "levocet", "xyzal", "vozet"],
    generic: "Levocetirizine",
    category: "Antihistamine / Allergy",
    usage: "Allergies, hay fever, hives. Less drowsy than Cetirizine.",
    usageHi: "एलर्जी, हे फीवर, पित्ती। Cetirizine से कम नींद।",
    dosage: "Adults: 5mg once daily at bedtime.",
    sideEffects: "Mild drowsiness, dry mouth, headache.",
    precautions: "Less drowsiness than cetirizine but still avoid driving initially.",
    foodTiming: "Can be taken with or without food. Best at bedtime.",
    alternatives: [
      { name: "Levocet 5", brand: true, price: 35 },
      { name: "Levocetirizine 5mg (Generic)", brand: false, price: 8 },
    ],
  },

  montelukast: {
    names: ["montelukast", "montair", "singulair", "montek"],
    generic: "Montelukast",
    category: "Allergy / Asthma",
    usage: "Prevents asthma attacks and seasonal allergies.",
    usageHi: "अस्थमा के दौरे और मौसमी एलर्जी रोकती है।",
    dosage: "Adults: 10mg once daily at bedtime.\nChildren 6-14: 5mg chewable.",
    sideEffects: "Headache, stomach pain. Rare: mood changes, vivid dreams.",
    precautions: "Take at bedtime. Not for acute attacks. Report mood changes.",
    foodTiming: "Take at BEDTIME. With or without food.",
    alternatives: [
      { name: "Montair 10", brand: true, price: 120 },
      { name: "Montek LC", brand: true, price: 150 },
      { name: "Montelukast 10mg (Generic)", brand: false, price: 30 },
    ],
  },

  "salbutamol": {
    names: ["salbutamol", "asthalin", "ventolin", "derihaler"],
    generic: "Salbutamol",
    category: "Asthma / Bronchodilator",
    usage: "Quick relief from asthma, wheezing, shortness of breath.",
    usageHi: "अस्थमा, सांस फूलना, सीटी बजने में तुरंत राहत।",
    dosage: "Inhaler: 1-2 puffs as needed, max 8 puffs/day.\nTablet: 2-4mg 3 times daily.",
    sideEffects: "Tremor, fast heartbeat, headache.",
    precautions: "Use inhaler technique properly. If needing it daily, see doctor.",
    foodTiming: "Inhaler: anytime. Tablet: with or without food.",
    alternatives: [
      { name: "Asthalin Inhaler", brand: true, price: 130 },
      { name: "Salbutamol Inhaler (Generic)", brand: false, price: 50 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  MENTAL HEALTH
  // ─────────────────────────────────────────────────────────────
  escitalopram: {
    names: ["escitalopram", "nexito", "cipralex", "stalopam", "rexipra"],
    generic: "Escitalopram",
    category: "Antidepressant / SSRI",
    usage: "Depression, anxiety, panic disorder, OCD.",
    usageHi: "डिप्रेशन, चिंता, पैनिक डिसऑर्डर, OCD।",
    dosage: "Adults: Start 5-10mg once daily. May increase to 20mg.",
    sideEffects: "Nausea, headache, sleep changes, weight changes.",
    precautions: "Do NOT stop suddenly — taper with doctor. Takes 2-4 weeks to work.",
    foodTiming: "Can be taken with or without food. Same time daily.",
    alternatives: [
      { name: "Nexito 10", brand: true, price: 110 },
      { name: "Escitalopram 10mg (Generic)", brand: false, price: 25 },
    ],
  },

  alprazolam: {
    names: ["alprazolam", "alprax", "xanax", "restyl"],
    generic: "Alprazolam",
    category: "Anti-anxiety / Benzodiazepine",
    usage: "Short-term relief of severe anxiety and panic attacks.",
    usageHi: "गंभीर चिंता और पैनिक अटैक में अल्पकालिक राहत।",
    dosage: "Adults: 0.25-0.5mg 2-3 times daily. Doctor prescribed only.",
    sideEffects: "Drowsiness, dizziness, memory issues. Dependency risk.",
    precautions: "Prescription only. Do NOT stop suddenly. Very addictive. Short-term use only.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Alprax 0.5", brand: true, price: 40 },
      { name: "Alprazolam 0.5mg (Generic)", brand: false, price: 10 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  THYROID
  // ─────────────────────────────────────────────────────────────
  levothyroxine: {
    names: ["levothyroxine", "thyronorm", "eltroxin", "thyrox", "lethyrox"],
    generic: "Levothyroxine",
    category: "Thyroid",
    usage: "Hypothyroidism (underactive thyroid). Replaces thyroid hormone.",
    usageHi: "हाइपोथायरॉइडिज्म (कम सक्रिय थायरॉइड)। थायरॉइड हॉर्मोन की कमी पूरी करती है।",
    dosage: "Adults: 25-200mcg once daily on empty stomach.",
    sideEffects: "Usually none at correct dose. Overdose: tremor, fast heart, weight loss.",
    precautions: "Take on empty stomach, 30-60 min before food. Regular TSH testing.",
    foodTiming: "Take EMPTY STOMACH, 30-60 minutes BEFORE breakfast. Avoid calcium/iron near dose.",
    alternatives: [
      { name: "Thyronorm 50mcg", brand: true, price: 110 },
      { name: "Eltroxin 50mcg", brand: true, price: 100 },
      { name: "Levothyroxine 50mcg (Generic)", brand: false, price: 30 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  SKIN & INFECTIONS
  // ─────────────────────────────────────────────────────────────
  fluconazole: {
    names: ["fluconazole", "forcan", "zocon", "flucos"],
    generic: "Fluconazole",
    category: "Antifungal",
    usage: "Fungal infections: thrush, ringworm, yeast infections, vaginal candidiasis.",
    usageHi: "फंगल संक्रमण: थ्रश, दाद, यीस्ट संक्रमण।",
    dosage: "Adults: 150mg single dose for vaginal thrush. 50-400mg/day for other infections.",
    sideEffects: "Nausea, headache, stomach pain, skin rash.",
    precautions: "Inform doctor of liver problems. Can interact with many medicines.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Forcan 150", brand: true, price: 50 },
      { name: "Fluconazole 150mg (Generic)", brand: false, price: 12 },
    ],
  },

  "clotrimazole": {
    names: ["clotrimazole", "candid", "canesten", "clotrin"],
    generic: "Clotrimazole",
    category: "Antifungal (Topical)",
    usage: "Skin fungal infections: ringworm, athlete's foot, jock itch, vaginal yeast.",
    usageHi: "त्वचा का फंगल संक्रमण: दाद, एथलीट फुट।",
    dosage: "Cream: Apply thin layer 2-3 times daily for 2-4 weeks.",
    sideEffects: "Mild burning, irritation at application site.",
    precautions: "Complete full course even if symptoms improve. Keep area clean and dry.",
    foodTiming: "Topical — not taken by mouth.",
    alternatives: [
      { name: "Candid Cream", brand: true, price: 85 },
      { name: "Clotrimazole Cream (Generic)", brand: false, price: 25 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  VITAMINS & SUPPLEMENTS
  // ─────────────────────────────────────────────────────────────
  "vitamin-d3": {
    names: ["vitamin d3", "cholecalciferol", "calcirol", "d3 must", "uprise d3", "d3"],
    generic: "Cholecalciferol (Vitamin D3)",
    category: "Vitamin Supplement",
    usage: "Treats Vitamin D deficiency. Supports bone health and immunity.",
    usageHi: "विटामिन D की कमी। हड्डियों की मजबूती और इम्यूनिटी।",
    dosage: "Varies: 1000-60000 IU as prescribed. Weekly sachets: 60000 IU.",
    sideEffects: "Generally safe. High doses: nausea, constipation, high calcium.",
    precautions: "Take as prescribed. Get blood levels checked periodically.",
    foodTiming: "Take WITH a meal containing fat for best absorption.",
    alternatives: [
      { name: "Uprise D3 60K", brand: true, price: 120 },
      { name: "Calcirol 60K", brand: true, price: 100 },
      { name: "Cholecalciferol 60K (Generic)", brand: false, price: 35 },
    ],
  },

  "vitamin-b12": {
    names: ["vitamin b12", "methylcobalamin", "mecobalamin", "methycobal", "nurokind", "b12"],
    generic: "Methylcobalamin (Vitamin B12)",
    category: "Vitamin Supplement",
    usage: "B12 deficiency, nerve damage, tingling/numbness in hands/feet.",
    usageHi: "B12 की कमी, नसों की क्षति, हाथ-पैर में सुन्नपन/झुनझुनी।",
    dosage: "Tablets: 500-1500mcg daily. Injections as prescribed.",
    sideEffects: "Generally safe. Rare: nausea, headache.",
    precautions: "Take regularly. Vegetarians at higher risk of deficiency.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Nurokind 1500", brand: true, price: 120 },
      { name: "Methycobal 500", brand: true, price: 80 },
      { name: "Methylcobalamin 1500mcg (Generic)", brand: false, price: 30 },
    ],
  },

  "calcium": {
    names: ["calcium", "shelcal", "celin", "calcimax", "calcium carbonate", "gemcal"],
    generic: "Calcium + Vitamin D3",
    category: "Bone Health Supplement",
    usage: "Calcium deficiency, osteoporosis prevention, bone strengthening.",
    usageHi: "कैल्शियम की कमी, ऑस्टियोपोरोसिस रोकथाम, हड्डियां मजबूत करना।",
    dosage: "Adults: 500-1000mg calcium daily (usually split into 2 doses).",
    sideEffects: "Constipation, gas, bloating.",
    precautions: "Do not take with iron supplements (separate by 2 hours). Stay hydrated.",
    foodTiming: "Take WITH food for better absorption. Evening dose preferred.",
    alternatives: [
      { name: "Shelcal 500", brand: true, price: 130 },
      { name: "Calcimax Forte", brand: true, price: 150 },
      { name: "Calcium + D3 (Generic)", brand: false, price: 40 },
    ],
  },

  "iron": {
    names: ["iron", "ferrous sulfate", "ferrous fumarate", "autrin", "orofer", "livogen", "fefol"],
    generic: "Ferrous Sulfate / Iron",
    category: "Iron Supplement",
    usage: "Iron deficiency anemia, weakness, fatigue, low hemoglobin.",
    usageHi: "आयरन की कमी से एनीमिया, कमजोरी, थकान, कम हीमोग्लोबिन।",
    dosage: "Adults: 60-200mg elemental iron daily (usually 1-2 tablets).",
    sideEffects: "Constipation, black stools, stomach upset, nausea.",
    precautions: "Take with Vitamin C for better absorption. Black stools are normal. Separate from calcium/antacids.",
    foodTiming: "Best on empty stomach. If upset, take with food (less absorption).",
    alternatives: [
      { name: "Autrin XT", brand: true, price: 75 },
      { name: "Orofer XT", brand: true, price: 90 },
      { name: "Ferrous Sulfate (Generic)", brand: false, price: 15 },
    ],
  },

  "folic-acid": {
    names: ["folic acid", "folvite", "folate", "fol"],
    generic: "Folic Acid",
    category: "Vitamin Supplement",
    usage: "Folic acid deficiency, pregnancy (prevents birth defects), anemia.",
    usageHi: "फोलिक एसिड की कमी, गर्भावस्था (जन्म दोष रोकता है), एनीमिया।",
    dosage: "Adults: 1-5mg daily. Pregnancy: 5mg daily.",
    sideEffects: "Generally safe. Rare: nausea, bloating.",
    precautions: "Essential before and during early pregnancy. Take as prescribed.",
    foodTiming: "Can be taken with or without food.",
    alternatives: [
      { name: "Folvite 5mg", brand: true, price: 20 },
      { name: "Folic Acid 5mg (Generic)", brand: false, price: 5 },
    ],
  },

  "multivitamin": {
    names: ["multivitamin", "becosules", "zincovit", "supradyn", "revital", "a to z"],
    generic: "Multivitamin",
    category: "General Supplement",
    usage: "General health, nutritional deficiencies, recovery from illness, energy.",
    usageHi: "सामान्य स्वास्थ्य, पोषण की कमी, बीमारी से रिकवरी, ऊर्जा।",
    dosage: "Adults: 1 tablet/capsule daily.",
    sideEffects: "Usually safe. May cause bright-colored urine, nausea.",
    precautions: "Don't exceed recommended dose. Not a substitute for balanced diet.",
    foodTiming: "Take WITH food for best absorption.",
    alternatives: [
      { name: "Becosules Z", brand: true, price: 30 },
      { name: "Zincovit", brand: true, price: 100 },
      { name: "Supradyn", brand: true, price: 25 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  MUSCLE RELAXANT
  // ─────────────────────────────────────────────────────────────
  "thiocolchicoside": {
    names: ["thiocolchicoside", "myoril", "muscoril"],
    generic: "Thiocolchicoside",
    category: "Muscle Relaxant",
    usage: "Muscle spasms, back pain, neck pain, stiffness.",
    usageHi: "मांसपेशियों की ऐंठन, कमर दर्द, गर्दन दर्द, अकड़न।",
    dosage: "Adults: 4-8mg twice daily for 5-7 days.",
    sideEffects: "Drowsiness, diarrhea, stomach upset.",
    precautions: "Short-term use only (max 7 days). Avoid driving.",
    foodTiming: "Take with or after food.",
    alternatives: [
      { name: "Myoril 4", brand: true, price: 65 },
      { name: "Thiocolchicoside 4mg (Generic)", brand: false, price: 18 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  EYE / ENT
  // ─────────────────────────────────────────────────────────────
  "moxifloxacin-eye": {
    names: ["moxifloxacin eye", "moxifloxacin drops", "vigamox", "moxicip", "milflox"],
    generic: "Moxifloxacin Eye Drops",
    category: "Eye Antibiotic",
    usage: "Bacterial eye infections, conjunctivitis, post-surgery infection prevention.",
    usageHi: "आंखों का बैक्टीरियल संक्रमण, कंजंक्टिवाइटिस, सर्जरी के बाद।",
    dosage: "1 drop in affected eye 3 times daily for 5-7 days.",
    sideEffects: "Mild burning, temporary blurred vision.",
    precautions: "Don't touch dropper to eye. Complete full course. Don't share.",
    foodTiming: "Eye drops — not taken by mouth.",
    alternatives: [
      { name: "Vigamox Eye Drops", brand: true, price: 180 },
      { name: "Moxicip Eye Drops", brand: true, price: 80 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
//  LOOKUP FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const { fuzzyFind, fuzzyFindAll } = require("../utils/fuzzyMatch");

// Build a flat list of all known names for fuzzy matching
function getAllNames() {
  const all = [];
  for (const [key, med] of Object.entries(medicines)) {
    for (const name of med.names) {
      all.push({ name, key });
    }
  }
  return all;
}
const allNameEntries = getAllNames();
const allNameStrings = allNameEntries.map((e) => e.name);

// ─── Exact match ──────────────────────────────────────────────
function findMedicine(query) {
  const q = query.toLowerCase().trim();

  for (const [key, med] of Object.entries(medicines)) {
    if (med.names.some((name) => q.includes(name) || name.includes(q))) {
      return { key, ...med };
    }
  }

  return null;
}

// ─── Fuzzy match (handles typos) ──────────────────────────────
function findMedicineFuzzy(query) {
  // Try exact first
  const exact = findMedicine(query);
  if (exact) return { result: exact, fuzzy: false, suggestions: [] };

  // Try fuzzy match
  const best = fuzzyFind(query, allNameStrings);
  if (best) {
    const entry = allNameEntries.find((e) => e.name === best.match);
    if (entry) {
      const med = medicines[entry.key];
      return {
        result: { key: entry.key, ...med },
        fuzzy: true,
        matchedName: best.match,
        suggestions: [],
      };
    }
  }

  // Return suggestions if nothing close enough
  const suggestions = fuzzyFindAll(query, allNameStrings, 3);
  return {
    result: null,
    fuzzy: false,
    suggestions: suggestions.map((s) => {
      const entry = allNameEntries.find((e) => e.name === s.match);
      return entry ? { name: s.match, key: entry.key } : null;
    }).filter(Boolean),
  };
}

// ─── Search multiple medicines from text ──────────────────────
function findMedicinesInText(text) {
  const found = [];
  const lowerText = text.toLowerCase();

  for (const [key, med] of Object.entries(medicines)) {
    for (const name of med.names) {
      if (lowerText.includes(name)) {
        found.push({ key, matchedName: name, ...med });
        break;
      }
    }
  }

  return found;
}

// ─── Get all category names ───────────────────────────────────
function getCategories() {
  const cats = new Set();
  for (const med of Object.values(medicines)) cats.add(med.category);
  return [...cats];
}

module.exports = {
  findMedicine,
  findMedicineFuzzy,
  findMedicinesInText,
  getCategories,
  medicines,
};
