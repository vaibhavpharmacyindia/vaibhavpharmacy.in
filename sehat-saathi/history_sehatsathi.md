# Sehat Saathi — सेहत साथी — Project History & Technical Reference

> **Purpose of this file:** This document contains everything an AI agent needs to understand, modify, build, and debug this project. Read this before making any changes.

---

## 1. Project Overview

**Sehat Saathi** (सेहत साथी = "Health Companion") is a gamified medicine reminder app built for **Vaibhav Pharmacy**. Users add medicines with dosage frequency, and the app sends reminders, tracks adherence, and rewards consistency with XP, levels, streaks, and badges.

- **Owner:** Vaibhav (Vaibhav Pharmacy)
- **Target:** Mobile-first (iOS + Android via PWA), also works on desktop browsers
- **Language:** Bilingual — English + Hindi labels throughout
- **Theme:** Vaibhav Pharmacy green (#1b5e20 primary)

---

## 2. Tech Stack & Architecture

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (functional components, hooks only) |
| Build | create-react-app (react-scripts 5.0.1) |
| Styling | Inline styles only (no CSS files, no Tailwind) |
| State | React useState/useEffect + mutable `DB` object synced to localStorage |
| Persistence | `window.localStorage` via `loadDB()` / `saveDB()` wrappers |
| Notifications | Browser Notification API (30-second interval check) |
| PWA | manifest.json + service-worker.js (cache-first) |
| Deployment | Standalone HTML file (React UMD + Babel standalone from CDN) |
| Icons | Generated PNG (green circle, white pharmacy cross) via Python PIL |

**Single-file architecture:** The entire app lives in one file: `src/App.js` (~1460 lines). All screens, constants, helpers, and state management are in this file.

---

## 3. File Structure

Everything lives in one flat folder:

```
sehat-saathi/
├── App.js                    # ★ THE ENTIRE APP — all screens and logic (~1460 lines)
├── index.js                  # React 18 createRoot + SW registration
├── index.html                # PWA meta tags, viewport-fit=cover
├── manifest.json             # standalone display, portrait, green theme
├── service-worker.js         # Simple cache-first strategy
├── package.json              # React 18.2.0, react-dom, react-scripts 5.0.1
├── icon-192.png              # Green circle + white pharmacy cross
├── icon-512.png
├── sehat-saathi-app.html     # ★ Standalone HTML (what the user actually opens)
├── sehat-saathi.jsx          # Legacy: earlier standalone JSX version (archived)
└── history.md                # This file
```

> **Note:** This project was flattened from a standard create-react-app structure (with `src/` and `public/` subdirs). To restore CRA structure for `npm start` / `react-scripts build`, move `App.js` and `index.js` into a `src/` folder, and move `index.html`, `manifest.json`, `service-worker.js`, and icon PNGs into a `public/` folder. Then run `npm install`.

---

## 4. How to Build & Run

### Standalone HTML (primary way the user uses the app)
The user opens `sehat-saathi-app.html` directly in their browser. This file:
- Loads React 18 UMD + Babel standalone from unpkg CDN
- Contains the full App.js code inline (with `import` replaced by `const { useState, ... } = React;` and `export default` removed)
- Transpiles JSX client-side via Babel
- **Requires internet on first load** (for CDN scripts)

### React dev server (for development only)
To restore the CRA project structure and run the dev server:
```bash
cd sehat-saathi
mkdir -p src public
cp App.js index.js src/
cp index.html manifest.json service-worker.js icon-192.png icon-512.png public/
npm install
npm start              # Starts at localhost:3000
```

### Production build
```bash
BUILD_PATH=/tmp/sehat-build npx react-scripts build
```
> ⚠️ **EPERM workaround:** Building to the default `build/` directory inside the project may fail with `EPERM: operation not permitted, unlink 'build/asset-manifest.json'`. Always build to an external temp directory using `BUILD_PATH`.

### Regenerating the standalone HTML
After modifying `App.js`, regenerate the HTML by:
1. Read `src/App.js`
2. Replace `import { useState, useEffect, useCallback, useRef } from "react";` with `const { useState, useEffect, useCallback, useRef } = React;`
3. Replace `export default function SehatSaathi` with `function SehatSaathi`
4. Wrap in the HTML template (see existing `sehat-saathi-app.html` for the template structure including CDN scripts, loading spinner, and error handlers)
5. Write to `../sehat-saathi-app.html`

---

## 5. App Screens & Navigation

The app uses a simple `screen` state string for navigation (no router):

| Screen ID | Component | Description |
|-----------|-----------|-------------|
| `"splash"` | `SplashScreen` | Auto-advances after 2 seconds to onboarding or home |
| `"onboarding"` | `OnboardingScreen` | First-time only — collects user's name |
| `"home"` | `HomeScreen` | Dashboard — progress ring, stats, today's dose cards, bottom nav |
| `"add"` | `AddMedicineScreen` | Single-page form with review confirmation step |
| `"medicines"` | `MedicineListScreen` | List of all medicines with delete (has confirmation dialog) |
| `"badges"` | `BadgesScreen` | 2-column grid of all 10 badges (locked/unlocked) |
| `"schedule"` | `ScheduleScreen` | Full-day timeline view of all doses |

**Bottom navigation bar** (on HomeScreen): Home, Meds, Add (+), Schedule, Badges

---

## 6. Data Model

### localStorage structure
```javascript
const STORAGE_KEY = "sehat_saathi_data";
// Stored as JSON under this key:
{
  medicines: [...],   // Array of medicine objects
  logs: [...],        // Array of dose log entries
  stats: {
    xp: 0,
    streak: 0,
    perfectDays: 0,
    totalMedsAdded: 0,
    adherenceRate: 100,
    totalTaken: 0,
    totalDue: 0
  },
  badges: [],         // Array of badge ID strings
  userName: ""
}
```

### Medicine object
```javascript
{
  id: "lxyz1234",         // uid() — timestamp + random
  name: "Paracetamol",
  type: "tablet",          // One of: tablet, capsule, syrup, injection, drops, cream, inhaler
  frequency: "bd",         // One of: od, bd, tds, qds, hs, prn, q6h, q8h, q12h, eod, weekly, stat
  foodTiming: "after",     // One of: before, after, any
  duration: "7 days",      // Free text or empty string (= "Ongoing")
  createdAt: "2026-03-19"  // ISO date string (used for EOD/QW scheduling)
}
```

### Dose log entry
```javascript
{
  medId: "lxyz1234",
  time: "08:00",
  status: "taken",         // "taken" or "skipped"
  date: "2026-03-19",      // ISO date string
  timestamp: 1710840000000 // Date.now()
}
```

### Persistence pattern
The app uses a **dual system** — React state + a mutable `DB` object:
```javascript
let DB = loadDB();                    // Module-level mutable object
const [medicines, setMedicines] = useState(DB.medicines);  // React state initialized from DB

// On every mutation:
const updated = [...medicines, newMed];
setMedicines(updated);                // Update React state
DB.medicines = updated; saveDB(DB);   // Sync to localStorage
```
> ⚠️ **Important:** Every `DB.xxx = yyy` mutation MUST be followed by `saveDB(DB)` or data will be lost on refresh.

---

## 7. Frequency System

Frequencies use standard medical abbreviations. Grouped in the UI as "Common" and "Others":

### Common
| ID | Code | Label | Default Times |
|----|------|-------|---------------|
| od | OD | Once a day | 08:00 |
| bd | BD | Twice a day | 08:00, 20:00 |
| tds | TDS | Three times a day | 08:00, 14:00, 20:00 |
| qds | QDS | Four times a day | 06:00, 12:00, 18:00, 22:00 |
| hs | HS | At bedtime | 22:00 |
| prn | SOS | As needed | (no fixed times) |

### Others
| ID | Code | Label | Default Times |
|----|------|-------|---------------|
| q6h | Q6H | Every 6 hours | 06:00, 12:00, 18:00, 00:00 |
| q8h | Q8H | Every 8 hours | 06:00, 14:00, 22:00 |
| q12h | Q12H | Every 12 hours | 08:00, 20:00 |
| eod | EOD | Every other day | 08:00 (skips alternating days based on createdAt) |
| weekly | QW | Once a week | 08:00 (only on same weekday as createdAt) |
| stat | STAT | Immediately / once | (no fixed times) |

**Meal timing** is a separate field (before food, after food, anytime) — NOT part of frequency. Earlier versions had AC/PC/OM/ON as frequency options, but these were removed as redundant.

### EOD/QW scheduling logic
The `getTodayDoses()` function skips doses based on:
- **EOD:** Compares day-of-year difference from `createdAt`; shows only on even-difference days
- **QW:** Compares current day-of-week against `createdAt` day-of-week

---

## 8. Gamification System

### XP Rewards
| Action | XP |
|--------|-----|
| Take a dose | 10 |
| Streak bonus (per streak day, max 10) | 5 per day |
| Perfect day (all doses taken) | 25 |
| Add a medicine | 15 |

### Levels (7 total)
| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Beginner / शुरुआत 🌱 |
| 2 | 50 | Health Starter / स्वास्थ्य शुरुआत 🌿 |
| 3 | 150 | Med Warrior / दवाई योद्धा 💪 |
| 4 | 300 | Wellness Pro / तंदुरुस्ती प्रो ⭐ |
| 5 | 500 | Health Champion / स्वास्थ्य चैंपियन 🏆 |
| 6 | 800 | Sehat Master / सेहत मास्टर 👑 |
| 7 | 1200 | Legendary / दिग्गज 🌟 |

### Badges (10 total)
first_med, streak_3, streak_7, streak_30, perfect_day_1, perfect_day_7, xp_100, xp_500, meds_5, adherence_90

### Streak calculation
- Iterates backwards through dates checking logs
- Days with all logs "taken" increment streak
- Days with any "skipped" log break the streak
- Days with zero logs are **skipped** (don't break the streak — handles days before app install or no meds due)

---

## 9. Visual Design

### Color palette
- Primary dark: `#0d3311`, `#1b5e20`
- Primary mid: `#2e7d32`, `#388e3c`, `#43a047`
- Primary light: `#66bb6a`, `#81c784`, `#a5d6a7`, `#c8e6c9`, `#e8f5e9`
- Accent orange: `#ff6d00`, `#ff9800`, `#e65100`
- Accent gold: `#f9a825`, `#fdd835`
- Background: `#f5f7f5` (screens), `#fff` (cards)

### CSS animations (defined in `<style>` block inside the component)
- `slideDown` — toast notifications
- `floatUp` — XP gain animation
- `fadeIn` — overlay backgrounds
- `popIn` — modal/badge popup scale
- `pulse` — splash screen logo
- `shimmer` — loading bar effect
- `shake` — active reminder cards

### Visual elements
- **Progress ring:** 120px SVG circle with gradient stroke (green to light green)
- **Stat cards:** Floating white card with inline SVG icons (flame, ring gauge, medal)
- **Dose cards:** Left-border color coding (green=current, orange=skipped, grey=upcoming)
- **Headers:** Dark green gradient with decorative transparent circles
- **Badge grid:** 2-column grid with lock/unlock states

---

## 10. Known Limitations & Future Improvements

### Current limitations
- **No custom time editing:** Users cannot change the default dose times (e.g., 08:00 for OD) — they're fixed per frequency code
- **No backend/cloud sync:** All data is localStorage only — lost if browser data is cleared
- **No medicine editing:** Once added, medicines can only be deleted, not edited
- **Standalone HTML uses Babel standalone:** ~500KB+ download on first load, client-side transpilation is slow
- **Notification reliability:** Browser notifications only work if the page is open; no background push notifications
- **SOS/STAT frequencies:** These have no scheduled times, so they never appear in the schedule or home screen dose list

### Potential improvements
- Custom dose time editing per medicine
- Medicine edit functionality (change frequency, food timing, etc.)
- Cloud sync / user accounts
- Export adherence reports as PDF
- Dark mode
- Proper build pipeline instead of Babel standalone for the HTML version
- Push notifications via service worker
- Medicine interaction warnings
- Refill reminders based on duration

---

## 11. Bug Fix History

### Bugs found and fixed (latest session)
1. **Duplicate `getTodayDoses` function** — Was defined at both module level and inside HomeScreen. The inner one lacked `timeMinutes` and sorting. Fixed: removed inner duplicate.
2. **EOD/QW showed doses every day** — `getTodayDoses` had no day-skipping logic. Fixed: added alternating-day and weekday checks based on `createdAt`.
3. **Multiple `setStats` calls in `markDose`** — Two separate `setStats` calls (perfectDays + adherence) could overwrite each other via stale closures. Fixed: combined into single update.
4. **`checkBadges` stale closure** — Referenced `badges` state from closure that could be outdated. Fixed: uses `badgesRef` (useRef) that stays in sync.
5. **HomeScreen badges count read from mutable `DB`** — Used `DB.badges.includes()` instead of React state. Fixed: passes `badges` as prop to HomeScreen.
6. **`formatTime` edge case** — Cleaned up 12-hour format logic for robustness.
7. **Streak broke on empty days** — Days with no logs (before app install or no meds due) incorrectly broke the streak. Fixed: `continue` instead of `break` on empty days.
8. **No delete confirmation** — Medicines could be accidentally deleted with one tap. Fixed: added modal confirmation dialog.
9. **Delete button too subtle** — Tiny grey "✕" was easy to miss. Fixed: replaced with visible red trash icon button.
10. **Adherence rate division edge case** — Fixed potential divide-by-zero in skip path.

### Earlier design changes
- Removed multi-step wizard for adding medicines → replaced with single-page form + review confirmation
- Removed AC (before food), PC (after food), OM (morning), ON (night) from frequency options — these were redundant with the separate Food Timing selector
- Reorganized frequency options into "Common" and "Others" groups
- Removed dosage strength screen entirely
- Major infographic overhaul: added SVG icons, gradient progress rings, floating stat cards, color-coded timeline

---

## 12. Critical Code Patterns for AI Agents

### When adding new state
```javascript
// 1. Add to DEFAULT_DB
const DEFAULT_DB = { ..., newField: defaultValue };

// 2. Add useState in SehatSaathi component
const [newField, setNewField] = useState(DB.newField);

// 3. On every mutation, sync to DB and save
setNewField(updated);
DB.newField = updated; saveDB(DB);
```

### When adding new screens
1. Add a new screen ID string to the `screen` state
2. Add conditional render in the main return: `{screen === "newscreen" && <NewScreen ... />}`
3. Add navigation button in bottom nav or relevant screen

### When modifying the standalone HTML
Always regenerate `sehat-saathi-app.html` after changing `App.js`. The process:
1. Read `App.js`
2. Replace the import statement with React global destructuring
3. Remove `export default`
4. Embed in the HTML template
5. Write to `../sehat-saathi-app.html`

> ⚠️ **Do NOT use Python f-strings** to generate the HTML if the JS code contains `{` and `}`. Use string concatenation or `.format()` with care, or write the template parts separately and concatenate with `+`.

### When adding new badges
Add to the `BADGES` array with: `{ id, icon, name, desc, condition: (stats) => boolean }`

### When adding new frequency options
1. Add to `FREQUENCY_OPTIONS` array with: `{ id, code, label, labelHi, times, emoji }`
2. Add the ID to the appropriate group in `AddMedicineScreen`'s `freqGroups`
3. If it has special scheduling logic (like EOD/QW), add handling in `getTodayDoses()`
