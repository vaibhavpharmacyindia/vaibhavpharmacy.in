# Vaibhav Pharmacy WhatsApp Bot — Setup Guide

## What This Bot Does

A full-featured WhatsApp pharmacy assistant with:

- **Prescription Photo Reading** — OCR reads medicine names from prescription photos
- **44 Medicine Database** — Usage, dosage, side effects, food timing + Hindi descriptions
- **Drug Interaction Warnings** — Flags dangerous combinations (severe/moderate/mild)
- **Generic Alternatives + Prices** — Shows cheaper generic options with savings calculation
- **Adherence Tracking** — "Did you take it?" buttons after every reminder
- **Smart Refill Reminders** — Auto-reminds 2 days before medicine runs out
- **Hindi + English** — Full bilingual support, switchable mid-conversation
- **Fuzzy Matching** — Typos like "parasetamol" still match correctly
- **Talk to Pharmacist** — Human escalation flow
- **Session Management** — Auto-cleanup, dedup, returning user memory

---

## Quick Setup (5 minutes)

### Step 1: Create a Meta App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **Create App** → **Business** → Name it "Vaibhav Pharmacy Bot"
3. Add **WhatsApp** product and follow the wizard

### Step 2: Get Credentials
In Meta App Dashboard → WhatsApp → API Setup, copy:
- **Temporary Access Token**
- **Phone Number ID**
- **Business Account ID**

### Step 3: Configure & Run
```bash
cd vaibhav-pharmacy-whatsapp-bot
cp .env.example .env
# Edit .env with your credentials
npm install
npm start
```

### Step 4: Expose with ngrok
```bash
ngrok http 3000
```

### Step 5: Register Webhook
1. Meta Dashboard → WhatsApp → Configuration
2. Callback URL: `https://your-url.ngrok.io/webhook`
3. Verify Token: `vaibhav_pharmacy_verify_2024`
4. Subscribe to: `messages`

### Step 6: Test!
Send "Hi" to your WhatsApp test number.

---

## Customer Commands

| Send This | What Happens |
|---|---|
| Hi / Hello / नमस्ते | Welcome + Upload/Type choice |
| *Photo of prescription* | OCR reads it, shows info, checks interactions |
| Paracetamol | Medicine card with full details |
| Parasetamol (typo) | Fuzzy match → "Did you mean Paracetamol?" |
| alt paracetamol | Generic alternatives with prices |
| remind Crocin BD | Sets twice-daily reminder |
| reminders | Lists all with adherence % |
| stop reminder Crocin | Removes reminder |
| pharmacist | Connect to pharmacist |
| hindi / english | Switch language |
| menu | Main menu |

### Dosage Codes
| Code | Meaning | Reminder Times |
|---|---|---|
| OD | Once daily | 8:00 AM |
| BD | Twice daily | 8:00 AM, 8:00 PM |
| TDS | Three times | 8:00 AM, 2:00 PM, 8:00 PM |
| 1-0-1 | Morning & Night | 8:00 AM, 8:00 PM |
| HS | At bedtime | 10:00 PM |

---

## Key Features Explained

### Drug Interaction Checker
When a customer enters 2+ medicines, the bot automatically checks for known interactions:
- 🔴 **SEVERE** — Do not take together
- 🟡 **CAUTION** — Doctor should monitor
- 🟢 **MILD** — Usually okay

### Adherence Tracking
After each dose reminder, customer gets:
- ✅ **Took It** — Logged as taken
- ⏭️ **Skipped** — Logged as missed
- ⏰ **+15 min** — Snoozes and re-sends

View adherence rate anytime with "reminders" command.

### Smart Refill Reminders
If customer says "take for 7 days", the bot:
- Auto-expires the reminder after 7 days
- Sends a refill alert 2 days before it ends
- Offers one-tap reorder

### Hindi Support
Type "hindi" or tap the 🌐 button. All messages switch to Hindi including medicine descriptions, interaction warnings, and menu options.

---

## File Structure

```
vaibhav-pharmacy-whatsapp-bot/
├── .env.example
├── .gitignore
├── package.json
├── SETUP_GUIDE.md
└── src/
    ├── index.js                    # Express server
    ├── routes/
    │   └── webhook.js              # WhatsApp webhook handler
    ├── services/
    │   ├── whatsappApi.js          # WhatsApp Cloud API wrapper
    │   ├── messageHandler.js       # Main conversation engine
    │   ├── ocrService.js           # Tesseract prescription OCR
    │   ├── reminderService.js      # Reminders + adherence + refills
    │   └── interactionChecker.js   # Drug interaction database
    ├── data/
    │   └── medicineDatabase.js     # 44 medicines + alternatives + prices
    └── utils/
        ├── i18n.js                 # Hindi/English bilingual strings
        └── fuzzyMatch.js           # Levenshtein typo correction
```

---

## Production Checklist

1. **Permanent Token** — System User in Meta Business Suite
2. **Real Phone Number** — Register pharmacy number with WhatsApp Business
3. **Database** — Replace in-memory Maps with MongoDB/PostgreSQL
4. **Deploy** — Railway, Render, or DigitalOcean ($5/mo)
5. **Expand Medicines** — Add your full inventory to `medicineDatabase.js`
6. **Expand Interactions** — Add more drug pairs to `interactionChecker.js`
7. **Payment Integration** — Add Razorpay/PhonePe for medicine ordering
8. **Pharmacist Dashboard** — Build admin panel to see forwarded questions
