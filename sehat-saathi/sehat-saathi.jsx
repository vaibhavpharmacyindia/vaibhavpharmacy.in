import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
//  SEHAT SAATHI — सेहत साथी
//  Gamified Medicine Reminder App by Vaibhav Pharmacy
// ═══════════════════════════════════════════════════════════════

// ── Gamification Constants ─────────────────────────────────────
const XP_TAKE_MED = 10;
const XP_STREAK_BONUS = 5;        // per consecutive day
const XP_PERFECT_DAY = 25;        // all meds taken in a day
const XP_ADD_MEDICINE = 15;
const LEVELS = [
  { level: 1, xp: 0, title: "Beginner", titleHi: "शुरुआत", emoji: "🌱" },
  { level: 2, xp: 50, title: "Health Starter", titleHi: "स्वास्थ्य शुरुआत", emoji: "🌿" },
  { level: 3, xp: 150, title: "Med Warrior", titleHi: "दवाई योद्धा", emoji: "💪" },
  { level: 4, xp: 300, title: "Wellness Pro", titleHi: "तंदुरुस्ती प्रो", emoji: "⭐" },
  { level: 5, xp: 500, title: "Health Champion", titleHi: "स्वास्थ्य चैंपियन", emoji: "🏆" },
  { level: 6, xp: 800, title: "Sehat Master", titleHi: "सेहत मास्टर", emoji: "👑" },
  { level: 7, xp: 1200, title: "Legendary", titleHi: "दिग्गज", emoji: "🌟" },
];
const BADGES = [
  { id: "first_med", icon: "💊", name: "First Step", desc: "Added your first medicine", condition: (s) => s.totalMedsAdded >= 1 },
  { id: "streak_3", icon: "🔥", name: "3-Day Streak", desc: "3 days without missing", condition: (s) => s.streak >= 3 },
  { id: "streak_7", icon: "🔥", name: "Week Warrior", desc: "7-day streak!", condition: (s) => s.streak >= 7 },
  { id: "streak_30", icon: "🏅", name: "Monthly Master", desc: "30-day streak!", condition: (s) => s.streak >= 30 },
  { id: "perfect_day_1", icon: "✨", name: "Perfect Day", desc: "Took all meds on time", condition: (s) => s.perfectDays >= 1 },
  { id: "perfect_day_7", icon: "🌟", name: "Perfect Week", desc: "7 perfect days", condition: (s) => s.perfectDays >= 7 },
  { id: "xp_100", icon: "💎", name: "Century", desc: "Earned 100 XP", condition: (s) => s.xp >= 100 },
  { id: "xp_500", icon: "👑", name: "Half K", desc: "Earned 500 XP", condition: (s) => s.xp >= 500 },
  { id: "meds_5", icon: "📋", name: "Organized", desc: "Managing 5+ medicines", condition: (s) => s.totalMedsAdded >= 5 },
  { id: "adherence_90", icon: "🎯", name: "On Target", desc: "90%+ adherence rate", condition: (s) => s.adherenceRate >= 90 },
];

const FREQUENCY_OPTIONS = [
  { id: "od", label: "Once daily", labelHi: "दिन में 1 बार", times: ["08:00"], emoji: "1️⃣" },
  { id: "bd", label: "Twice daily", labelHi: "दिन में 2 बार", times: ["08:00", "20:00"], emoji: "2️⃣" },
  { id: "tds", label: "Three times", labelHi: "दिन में 3 बार", times: ["08:00", "14:00", "20:00"], emoji: "3️⃣" },
  { id: "hs", label: "At bedtime", labelHi: "सोने से पहले", times: ["22:00"], emoji: "🌙" },
  { id: "sos", label: "As needed", labelHi: "जरूरत पर", times: [], emoji: "🆘" },
];

const FOOD_OPTIONS = [
  { id: "before", label: "Before food", labelHi: "खाने से पहले", emoji: "🍽️" },
  { id: "after", label: "After food", labelHi: "खाने के बाद", emoji: "🍛" },
  { id: "any", label: "Anytime", labelHi: "कभी भी", emoji: "⏰" },
];

const MED_TYPES = [
  { id: "tablet", label: "Tablet", emoji: "💊" },
  { id: "capsule", label: "Capsule", emoji: "💊" },
  { id: "syrup", label: "Syrup", emoji: "🧴" },
  { id: "injection", label: "Injection", emoji: "💉" },
  { id: "drops", label: "Drops", emoji: "💧" },
  { id: "cream", label: "Cream", emoji: "🧴" },
  { id: "inhaler", label: "Inhaler", emoji: "🫁" },
];

// ── Helper ─────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const formatTime = (t) => { const [h, m] = t.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
const today = () => new Date().toISOString().split("T")[0];

// ── Persist to in-memory "database" (simulates local storage) ─
let DB = { medicines: [], logs: [], stats: { xp: 0, streak: 0, perfectDays: 0, totalMedsAdded: 0, adherenceRate: 100, totalTaken: 0, totalDue: 0 }, badges: [], userName: "" };

function getLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.xp) lvl = l; else break; }
  const nextLvl = LEVELS.find((l) => l.xp > xp);
  const progress = nextLvl ? (xp - lvl.xp) / (nextLvl.xp - lvl.xp) : 1;
  return { ...lvl, progress, nextXp: nextLvl?.xp || lvl.xp };
}

// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function SehatSaathi() {
  const [screen, setScreen] = useState("splash");
  const [medicines, setMedicines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(DB.stats);
  const [badges, setBadges] = useState([]);
  const [userName, setUserName] = useState("");
  const [toast, setToast] = useState(null);
  const [xpAnim, setXpAnim] = useState(null);
  const [newBadge, setNewBadge] = useState(null);
  const [activeReminders, setActiveReminders] = useState([]);
  const reminderInterval = useRef(null);

  // ── Toast notification ────────────────────────────────────
  const showToast = useCallback((msg, duration = 2500) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }, []);

  // ── XP animation ──────────────────────────────────────────
  const animateXP = useCallback((amount) => {
    setXpAnim(`+${amount} XP`);
    setTimeout(() => setXpAnim(null), 1500);
  }, []);

  // ── Check & award badges ──────────────────────────────────
  const checkBadges = useCallback((newStats) => {
    const earned = [];
    for (const badge of BADGES) {
      if (!badges.includes(badge.id) && badge.condition(newStats)) {
        earned.push(badge);
      }
    }
    if (earned.length > 0) {
      const newBadgeIds = [...badges, ...earned.map((b) => b.id)];
      setBadges(newBadgeIds);
      DB.badges = newBadgeIds;
      setNewBadge(earned[0]);
      setTimeout(() => setNewBadge(null), 3000);
    }
  }, [badges]);

  // ── Add XP ────────────────────────────────────────────────
  const addXP = useCallback((amount) => {
    setStats((prev) => {
      const newStats = { ...prev, xp: prev.xp + amount };
      DB.stats = newStats;
      setTimeout(() => checkBadges(newStats), 500);
      return newStats;
    });
    animateXP(amount);
  }, [animateXP, checkBadges]);

  // ── Add medicine ──────────────────────────────────────────
  const addMedicine = useCallback((med) => {
    const newMed = { ...med, id: uid(), createdAt: today() };
    const updated = [...medicines, newMed];
    setMedicines(updated);
    DB.medicines = updated;
    setStats((prev) => {
      const newStats = { ...prev, totalMedsAdded: prev.totalMedsAdded + 1 };
      DB.stats = newStats;
      return newStats;
    });
    addXP(XP_ADD_MEDICINE);
    showToast("💊 Medicine added! +15 XP");
  }, [medicines, addXP, showToast]);

  // ── Delete medicine ───────────────────────────────────────
  const deleteMedicine = useCallback((id) => {
    const updated = medicines.filter((m) => m.id !== id);
    setMedicines(updated);
    DB.medicines = updated;
    showToast("Medicine removed");
  }, [medicines, showToast]);

  // ── Mark dose taken / skipped ─────────────────────────────
  const markDose = useCallback((medId, time, status) => {
    const log = { medId, time, status, date: today(), timestamp: Date.now() };
    const updated = [...logs, log];
    setLogs(updated);
    DB.logs = updated;

    // Remove from active reminders
    setActiveReminders((prev) => prev.filter((r) => !(r.medId === medId && r.time === time)));

    if (status === "taken") {
      let xp = XP_TAKE_MED;
      const todayLogs = updated.filter((l) => l.date === today() && l.status === "taken");
      const todayDue = getTodayDoses(medicines);

      // Streak bonus
      xp += Math.min(stats.streak, 10) * XP_STREAK_BONUS;

      // Perfect day check
      if (todayLogs.length >= todayDue.length && todayDue.length > 0) {
        xp += XP_PERFECT_DAY;
        setStats((prev) => {
          const ns = { ...prev, perfectDays: prev.perfectDays + 1 };
          DB.stats = ns;
          return ns;
        });
        showToast("🌟 PERFECT DAY! +" + xp + " XP");
      } else {
        showToast("✅ Great job! +" + xp + " XP");
      }

      // Update adherence
      setStats((prev) => {
        const newTaken = prev.totalTaken + 1;
        const newDue = prev.totalDue + 1;
        const rate = Math.round((newTaken / newDue) * 100);
        const ns = { ...prev, totalTaken: newTaken, totalDue: newDue, adherenceRate: rate };
        DB.stats = ns;
        return ns;
      });

      addXP(xp);
    } else {
      setStats((prev) => {
        const newDue = prev.totalDue + 1;
        const rate = prev.totalDue > 0 ? Math.round((prev.totalTaken / newDue) * 100) : 0;
        const ns = { ...prev, totalDue: newDue, adherenceRate: rate };
        DB.stats = ns;
        return ns;
      });
      showToast("Dose skipped. Try not to miss next time!");
    }
  }, [logs, medicines, stats.streak, addXP, showToast]);

  // ── Get today's due doses ─────────────────────────────────
  function getTodayDoses(meds) {
    const doses = [];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const med of meds) {
      const freq = FREQUENCY_OPTIONS.find((f) => f.id === med.frequency);
      if (!freq) continue;
      for (const time of freq.times) {
        const [h, m] = time.split(":").map(Number);
        doses.push({ medId: med.id, medName: med.name, medType: med.type, time, timeMinutes: h * 60 + m, med });
      }
    }

    return doses.sort((a, b) => a.timeMinutes - b.timeMinutes);
  }

  // ── Check for due reminders ───────────────────────────────
  useEffect(() => {
    const check = () => {
      if (medicines.length === 0) return;
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const doses = getTodayDoses(medicines);
      const todayStr = today();

      for (const dose of doses) {
        const alreadyLogged = logs.some((l) => l.medId === dose.medId && l.time === dose.time && l.date === todayStr);
        const alreadyActive = activeReminders.some((r) => r.medId === dose.medId && r.time === dose.time);
        if (!alreadyLogged && !alreadyActive && dose.time === currentTime) {
          setActiveReminders((prev) => [...prev, { ...dose, triggeredAt: Date.now() }]);
          // Try browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`💊 Sehat Saathi`, { body: `Time to take ${dose.medName}!`, icon: "💊" });
          }
        }
      }
    };

    reminderInterval.current = setInterval(check, 30000);
    check(); // Run once immediately
    return () => clearInterval(reminderInterval.current);
  }, [medicines, logs, activeReminders]);

  // ── Request notification permission ───────────────────────
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ── Streak calculation ────────────────────────────────────
  useEffect(() => {
    let streak = 0;
    const d = new Date();
    for (let i = 1; i <= 365; i++) {
      d.setDate(d.getDate() - 1);
      const dateStr = d.toISOString().split("T")[0];
      const dayLogs = logs.filter((l) => l.date === dateStr);
      if (dayLogs.length > 0 && dayLogs.every((l) => l.status === "taken")) {
        streak++;
      } else if (dayLogs.length > 0) {
        break;
      } else {
        break;
      }
    }
    // If today has logs and all taken, add today
    const todayLogs = logs.filter((l) => l.date === today());
    if (todayLogs.length > 0 && todayLogs.every((l) => l.status === "taken")) streak++;

    setStats((prev) => {
      const ns = { ...prev, streak };
      DB.stats = ns;
      return ns;
    });
  }, [logs]);

  // ── Splash screen auto-advance ────────────────────────────
  useEffect(() => {
    if (screen === "splash") {
      setTimeout(() => setScreen(userName ? "home" : "onboarding"), 2000);
    }
  }, [screen, userName]);

  // ── Render ────────────────────────────────────────────────
  const level = getLevel(stats.xp);

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh", position: "relative",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      background: "linear-gradient(180deg, #e8f5e9 0%, #f1f8e9 50%, #fff 100%)",
      overflow: "hidden",
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: "#1b5e20", color: "#fff", padding: "12px 24px", borderRadius: 25,
          fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px rgba(27,94,32,0.3)",
          animation: "slideDown 0.3s ease",
        }}>
          {toast}
        </div>
      )}

      {/* XP Animation */}
      {xpAnim && (
        <div style={{
          position: "fixed", top: "40%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 9999,
          fontSize: 36, fontWeight: 900, color: "#ff6f00",
          textShadow: "0 2px 10px rgba(255,111,0,0.4)",
          animation: "floatUp 1.5s ease forwards", pointerEvents: "none",
        }}>
          {xpAnim}
        </div>
      )}

      {/* New Badge Popup */}
      {newBadge && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)", animation: "fadeIn 0.3s ease",
        }} onClick={() => setNewBadge(null)}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: "32px 40px", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "popIn 0.4s ease",
          }}>
            <div style={{ fontSize: 64 }}>{newBadge.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1b5e20", marginTop: 8 }}>New Badge!</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{newBadge.name}</div>
            <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>{newBadge.desc}</div>
          </div>
        </div>
      )}

      {/* Screens */}
      {screen === "splash" && <SplashScreen />}
      {screen === "onboarding" && <OnboardingScreen onComplete={(name) => { setUserName(name); DB.userName = name; setScreen("home"); }} />}
      {screen === "home" && (
        <HomeScreen
          userName={userName} stats={stats} level={level} medicines={medicines}
          logs={logs} activeReminders={activeReminders}
          onMarkDose={markDose} onNav={setScreen}
        />
      )}
      {screen === "add" && <AddMedicineScreen onAdd={(med) => { addMedicine(med); setScreen("home"); }} onBack={() => setScreen("home")} />}
      {screen === "medicines" && <MedicineListScreen medicines={medicines} onDelete={deleteMedicine} onBack={() => setScreen("home")} />}
      {screen === "badges" && <BadgesScreen badges={badges} stats={stats} onBack={() => setScreen("home")} />}
      {screen === "schedule" && <ScheduleScreen medicines={medicines} logs={logs} onBack={() => setScreen("home")} />}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDown { from { opacity:0; transform: translateX(-50%) translateY(-20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        @keyframes floatUp { 0% { opacity:1; transform: translate(-50%,-50%) scale(1); } 100% { opacity:0; transform: translate(-50%,-120%) scale(1.5); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes popIn { from { transform: scale(0.5); opacity:0; } to { transform: scale(1); opacity:1; } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SPLASH SCREEN
// ═══════════════════════════════════════════════════════════════
function SplashScreen() {
  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #43a047 100%)",
    }}>
      <div style={{ fontSize: 72, animation: "pulse 2s ease infinite" }}>💊</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginTop: 16, letterSpacing: 1 }}>Sehat Saathi</div>
      <div style={{ fontSize: 18, color: "#a5d6a7", marginTop: 4 }}>सेहत साथी</div>
      <div style={{ fontSize: 13, color: "#81c784", marginTop: 20 }}>by Vaibhav Pharmacy</div>
      <div style={{
        width: 120, height: 4, borderRadius: 2, marginTop: 32, overflow: "hidden", background: "rgba(255,255,255,0.2)",
      }}>
        <div style={{
          height: "100%", background: "#fff", borderRadius: 2, animation: "shimmer 1.5s linear infinite",
          backgroundImage: "linear-gradient(90deg, transparent, #fff, transparent)", backgroundSize: "200% 100%",
          width: "100%",
        }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ONBOARDING SCREEN
// ═══════════════════════════════════════════════════════════════
function OnboardingScreen({ onComplete }) {
  const [name, setName] = useState("");

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column", padding: "60px 24px 24px",
      background: "linear-gradient(180deg, #e8f5e9 0%, #fff 100%)",
    }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 56 }}>👋</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1b5e20", margin: "16px 0 4px" }}>Welcome to Sehat Saathi!</h1>
        <p style={{ fontSize: 16, color: "#558b2f", margin: 0 }}>सेहत साथी में आपका स्वागत है</p>
        <p style={{ fontSize: 14, color: "#777", marginTop: 12, lineHeight: 1.5 }}>
          Your personal health companion. Track medicines, earn XP, maintain streaks, and never miss a dose!
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 32, justifyContent: "center" }}>
        {[{ e: "🎮", t: "Earn XP" }, { e: "🔥", t: "Build Streaks" }, { e: "🏆", t: "Win Badges" }].map((item) => (
          <div key={item.t} style={{
            background: "#fff", borderRadius: 16, padding: "16px 14px", textAlign: "center", flex: 1,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e8f5e9",
          }}>
            <div style={{ fontSize: 28 }}>{item.e}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32", marginTop: 6 }}>{item.t}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto" }}>
        <label style={{ fontSize: 14, fontWeight: 700, color: "#1b5e20", marginBottom: 8, display: "block" }}>Your Name / आपका नाम</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          style={{
            width: "100%", padding: "16px 20px", fontSize: 16, borderRadius: 16,
            border: "2px solid #c8e6c9", outline: "none", background: "#fff",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "#43a047"}
          onBlur={(e) => e.target.style.borderColor = "#c8e6c9"}
        />
        <button
          onClick={() => name.trim() && onComplete(name.trim())}
          disabled={!name.trim()}
          style={{
            width: "100%", padding: "16px", marginTop: 16, fontSize: 18, fontWeight: 800,
            borderRadius: 16, border: "none", cursor: name.trim() ? "pointer" : "default",
            background: name.trim() ? "linear-gradient(135deg, #2e7d32, #43a047)" : "#c8e6c9",
            color: "#fff", boxShadow: name.trim() ? "0 4px 20px rgba(46,125,50,0.4)" : "none",
            transition: "all 0.3s",
          }}
        >
          Let's Go! 🚀
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HOME SCREEN — Dashboard
// ═══════════════════════════════════════════════════════════════
function HomeScreen({ userName, stats, level, medicines, logs, activeReminders, onMarkDose, onNav }) {
  const todayDoses = getTodayDoses(medicines);
  const todayStr = today();
  const doneCount = todayDoses.filter((d) => logs.some((l) => l.medId === d.medId && l.time === d.time && l.date === todayStr)).length;
  const progressPct = todayDoses.length > 0 ? Math.round((doneCount / todayDoses.length) * 100) : 0;

  function getTodayDoses(meds) {
    const doses = [];
    for (const med of meds) {
      const freq = FREQUENCY_OPTIONS.find((f) => f.id === med.frequency);
      if (!freq) continue;
      for (const time of freq.times) doses.push({ medId: med.id, medName: med.name, medType: med.type, time, med });
    }
    return doses;
  }

  return (
    <div style={{ paddingBottom: 90, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #388e3c 100%)",
        padding: "24px 20px 28px", borderRadius: "0 0 32px 32px",
        boxShadow: "0 4px 20px rgba(27,94,32,0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, color: "#a5d6a7" }}>Namaste 🙏</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginTop: 2 }}>{userName}</div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 20 }}>{level.emoji}</span>
            <div>
              <div style={{ fontSize: 11, color: "#a5d6a7" }}>Level {level.level}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{level.title}</div>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#c8e6c9" }}>
            <span>{stats.xp} XP</span>
            <span>{level.nextXp} XP</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 4, marginTop: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, transition: "width 0.5s ease",
              background: "linear-gradient(90deg, #66bb6a, #fdd835)",
              width: `${level.progress * 100}%`,
            }} />
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[
            { val: `${stats.streak}`, label: "Streak", emoji: "🔥" },
            { val: `${stats.adherenceRate}%`, label: "Adherence", emoji: "🎯" },
            { val: `${BADGES.filter((b) => DB.badges.includes(b.id)).length}`, label: "Badges", emoji: "🏅" },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20 }}>{s.emoji}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#a5d6a7" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Progress Ring */}
      <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e8f5e9" strokeWidth="8" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="#43a047" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPct / 100)}`}
              strokeLinecap="round" transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#1b5e20" }}>{progressPct}%</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1b5e20" }}>Today's Progress</div>
          <div style={{ fontSize: 14, color: "#666" }}>{doneCount} of {todayDoses.length} doses completed</div>
          {progressPct === 100 && todayDoses.length > 0 && (
            <div style={{ fontSize: 13, color: "#ff6f00", fontWeight: 700, marginTop: 2 }}>🌟 Perfect Day!</div>
          )}
        </div>
      </div>

      {/* Active Reminders (popup cards) */}
      {activeReminders.length > 0 && (
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e65100", marginBottom: 8 }}>⏰ Time to take:</div>
          {activeReminders.map((r) => (
            <div key={r.medId + r.time} style={{
              background: "linear-gradient(135deg, #fff3e0, #fff8e1)", borderRadius: 16,
              padding: 16, marginBottom: 10, border: "2px solid #ffcc02",
              boxShadow: "0 2px 12px rgba(255,152,0,0.15)", animation: "shake 0.5s ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#e65100" }}>
                    {MED_TYPES.find((t) => t.id === r.medType)?.emoji || "💊"} {r.medName}
                  </div>
                  <div style={{ fontSize: 13, color: "#bf360c", marginTop: 2 }}>Scheduled: {formatTime(r.time)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => onMarkDose(r.medId, r.time, "taken")} style={{
                  flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "#43a047", color: "#fff", fontWeight: 700, fontSize: 14,
                }}>
                  ✅ Took It
                </button>
                <button onClick={() => onMarkDose(r.medId, r.time, "skipped")} style={{
                  flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "#fff", color: "#e65100", fontWeight: 700, fontSize: 14,
                  border: "1px solid #ffcc80",
                }}>
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Schedule */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#1b5e20", marginBottom: 12 }}>📅 Today's Schedule</div>
        {todayDoses.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 16, padding: 32, textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 48 }}>💊</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#333", marginTop: 8 }}>No medicines added yet</div>
            <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>Tap + to add your first medicine and earn 15 XP!</div>
          </div>
        ) : (
          todayDoses.map((dose, i) => {
            const done = logs.some((l) => l.medId === dose.medId && l.time === dose.time && l.date === todayStr);
            const skipped = logs.some((l) => l.medId === dose.medId && l.time === dose.time && l.date === todayStr && l.status === "skipped");
            const now = new Date();
            const [h, m] = dose.time.split(":").map(Number);
            const isPast = now.getHours() * 60 + now.getMinutes() > h * 60 + m;
            const isCurrent = Math.abs(now.getHours() * 60 + now.getMinutes() - (h * 60 + m)) <= 30;

            return (
              <div key={dose.medId + dose.time} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                background: done ? "#e8f5e9" : skipped ? "#fff3e0" : isCurrent ? "#f1f8e9" : "#fff",
                borderRadius: 14, marginBottom: 8,
                boxShadow: isCurrent && !done ? "0 2px 12px rgba(46,125,50,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
                border: isCurrent && !done ? "2px solid #66bb6a" : "1px solid #f0f0f0",
                opacity: done ? 0.7 : 1, transition: "all 0.3s",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#888", width: 52, textAlign: "center" }}>
                  {formatTime(dose.time)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: done ? "#66bb6a" : "#333", textDecoration: done ? "line-through" : "none" }}>
                    {MED_TYPES.find((t) => t.id === dose.medType)?.emoji || "💊"} {dose.medName}
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {dose.med.dosageStrength} · {FOOD_OPTIONS.find((f) => f.id === dose.med.foodTiming)?.label || ""}
                  </div>
                </div>
                {done ? (
                  <div style={{ fontSize: 22 }}>{skipped ? "⏭️" : "✅"}</div>
                ) : (
                  <button onClick={() => onMarkDose(dose.medId, dose.time, "taken")} style={{
                    padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: "#43a047", color: "#fff", fontWeight: 700, fontSize: 13,
                  }}>
                    Take
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: "#fff", borderTop: "1px solid #e0e0e0",
        display: "flex", padding: "8px 4px 12px", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        zIndex: 100,
      }}>
        {[
          { id: "home", icon: "🏠", label: "Home" },
          { id: "medicines", icon: "💊", label: "Medicines" },
          { id: "add", icon: "➕", label: "Add", isMain: true },
          { id: "schedule", icon: "📅", label: "Schedule" },
          { id: "badges", icon: "🏆", label: "Badges" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => onNav(tab.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: tab.isMain ? "linear-gradient(135deg, #2e7d32, #43a047)" : "transparent",
            border: "none", cursor: "pointer", padding: tab.isMain ? "6px 0" : "4px 0",
            borderRadius: tab.isMain ? 16 : 0,
            marginTop: tab.isMain ? -20 : 0,
            boxShadow: tab.isMain ? "0 4px 16px rgba(46,125,50,0.4)" : "none",
          }}>
            <span style={{ fontSize: tab.isMain ? 24 : 22 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: tab.isMain ? "#fff" : "#888" }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ADD MEDICINE SCREEN
// ═══════════════════════════════════════════════════════════════
function AddMedicineScreen({ onAdd, onBack }) {
  const [step, setStep] = useState(0);
  const [med, setMed] = useState({ name: "", type: "tablet", dosageStrength: "", frequency: "bd", foodTiming: "after", duration: "" });

  const steps = [
    // Step 0: Name
    <div key="0">
      <div style={{ fontSize: 48, textAlign: "center" }}>💊</div>
      <h2 style={{ textAlign: "center", color: "#1b5e20", marginBottom: 4 }}>Medicine Name</h2>
      <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>दवाई का नाम लिखें</p>
      <input
        type="text" autoFocus value={med.name}
        onChange={(e) => setMed({ ...med, name: e.target.value })}
        placeholder="e.g. Paracetamol, Amoxicillin"
        style={{
          width: "100%", padding: "16px 20px", fontSize: 16, borderRadius: 16,
          border: "2px solid #c8e6c9", outline: "none", background: "#fff", marginTop: 16,
        }}
      />
    </div>,

    // Step 1: Type
    <div key="1">
      <h2 style={{ textAlign: "center", color: "#1b5e20", marginBottom: 4 }}>Medicine Type</h2>
      <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>दवाई का प्रकार चुनें</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        {MED_TYPES.map((t) => (
          <button key={t.id} onClick={() => setMed({ ...med, type: t.id })} style={{
            padding: "18px 12px", borderRadius: 16, border: med.type === t.id ? "2px solid #43a047" : "2px solid #e0e0e0",
            background: med.type === t.id ? "#e8f5e9" : "#fff", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 28 }}>{t.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: med.type === t.id ? "#2e7d32" : "#555" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Dosage
    <div key="2">
      <div style={{ fontSize: 48, textAlign: "center" }}>💪</div>
      <h2 style={{ textAlign: "center", color: "#1b5e20", marginBottom: 4 }}>Dosage Strength</h2>
      <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>डोज / ताकत</p>
      <input
        type="text" autoFocus value={med.dosageStrength}
        onChange={(e) => setMed({ ...med, dosageStrength: e.target.value })}
        placeholder="e.g. 500mg, 10ml, 5mg"
        style={{
          width: "100%", padding: "16px 20px", fontSize: 16, borderRadius: 16,
          border: "2px solid #c8e6c9", outline: "none", background: "#fff", marginTop: 16,
        }}
      />
    </div>,

    // Step 3: Frequency
    <div key="3">
      <h2 style={{ textAlign: "center", color: "#1b5e20", marginBottom: 4 }}>How Often?</h2>
      <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>कितनी बार लेनी है?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {FREQUENCY_OPTIONS.map((f) => (
          <button key={f.id} onClick={() => setMed({ ...med, frequency: f.id })} style={{
            padding: "16px 18px", borderRadius: 16,
            border: med.frequency === f.id ? "2px solid #43a047" : "2px solid #e8e8e8",
            background: med.frequency === f.id ? "#e8f5e9" : "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
            transition: "all 0.2s", textAlign: "left",
          }}>
            <span style={{ fontSize: 24 }}>{f.emoji}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: med.frequency === f.id ? "#2e7d32" : "#333" }}>{f.label}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{f.labelHi} {f.times.length > 0 ? `· ${f.times.map(formatTime).join(", ")}` : ""}</div>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 4: Food timing
    <div key="4">
      <h2 style={{ textAlign: "center", color: "#1b5e20", marginBottom: 4 }}>When to Take?</h2>
      <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>खाने से पहले या बाद में?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {FOOD_OPTIONS.map((f) => (
          <button key={f.id} onClick={() => setMed({ ...med, foodTiming: f.id })} style={{
            padding: "20px 18px", borderRadius: 16,
            border: med.foodTiming === f.id ? "2px solid #43a047" : "2px solid #e8e8e8",
            background: med.foodTiming === f.id ? "#e8f5e9" : "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 28 }}>{f.emoji}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: med.foodTiming === f.id ? "#2e7d32" : "#333" }}>{f.label}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{f.labelHi}</div>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 5: Duration
    <div key="5">
      <div style={{ fontSize: 48, textAlign: "center" }}>📅</div>
      <h2 style={{ textAlign: "center", color: "#1b5e20", marginBottom: 4 }}>Duration</h2>
      <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>कितने दिन लेनी है?</p>
      <input
        type="text" autoFocus value={med.duration}
        onChange={(e) => setMed({ ...med, duration: e.target.value })}
        placeholder="e.g. 5 days, 1 month, ongoing"
        style={{
          width: "100%", padding: "16px 20px", fontSize: 16, borderRadius: 16,
          border: "2px solid #c8e6c9", outline: "none", background: "#fff", marginTop: 16,
        }}
      />
      <p style={{ fontSize: 12, color: "#999", marginTop: 8, textAlign: "center" }}>Leave empty if ongoing</p>
    </div>,

    // Step 6: Review
    <div key="6">
      <div style={{ fontSize: 48, textAlign: "center" }}>✅</div>
      <h2 style={{ textAlign: "center", color: "#1b5e20", marginBottom: 16 }}>Review & Confirm</h2>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 20,
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #e8f5e9",
      }}>
        {[
          ["Medicine", med.name],
          ["Type", MED_TYPES.find((t) => t.id === med.type)?.emoji + " " + MED_TYPES.find((t) => t.id === med.type)?.label],
          ["Strength", med.dosageStrength || "Not specified"],
          ["Frequency", FREQUENCY_OPTIONS.find((f) => f.id === med.frequency)?.label],
          ["Food", FOOD_OPTIONS.find((f) => f.id === med.foodTiming)?.label],
          ["Duration", med.duration || "Ongoing"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
            <span style={{ fontSize: 14, color: "#888" }}>{k}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 16, padding: "12px 16px", background: "#e8f5e9", borderRadius: 14,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 24 }}>🎮</span>
        <span style={{ fontSize: 14, color: "#2e7d32", fontWeight: 600 }}>You'll earn +15 XP for adding this medicine!</span>
      </div>
    </div>,
  ];

  const canNext = step === 0 ? med.name.trim().length >= 2 : true;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      padding: "20px 20px 24px",
      background: "linear-gradient(180deg, #e8f5e9 0%, #fff 100%)",
    }}>
      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={step > 0 ? () => setStep(step - 1) : onBack} style={{
          background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 4,
        }}>
          ←
        </button>
        <div style={{ flex: 1, height: 6, background: "#e0e0e0", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, transition: "width 0.4s ease",
            background: "linear-gradient(90deg, #43a047, #66bb6a)",
            width: `${((step + 1) / steps.length) * 100}%`,
          }} />
        </div>
        <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>{step + 1}/{steps.length}</span>
      </div>

      {/* Current Step */}
      <div style={{ flex: 1 }}>{steps[step]}</div>

      {/* Next / Confirm button */}
      <button
        onClick={() => {
          if (step < steps.length - 1) setStep(step + 1);
          else onAdd(med);
        }}
        disabled={!canNext}
        style={{
          width: "100%", padding: "16px", marginTop: 24, fontSize: 17, fontWeight: 800,
          borderRadius: 16, border: "none", cursor: canNext ? "pointer" : "default",
          background: canNext ? "linear-gradient(135deg, #2e7d32, #43a047)" : "#c8e6c9",
          color: "#fff", boxShadow: canNext ? "0 4px 20px rgba(46,125,50,0.4)" : "none",
          transition: "all 0.3s",
        }}
      >
        {step === steps.length - 1 ? "Add Medicine 💊 +15 XP" : "Next →"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MEDICINE LIST SCREEN
// ═══════════════════════════════════════════════════════════════
function MedicineListScreen({ medicines, onDelete, onBack }) {
  return (
    <div style={{ minHeight: "100vh", padding: "20px 20px 40px", background: "linear-gradient(180deg, #e8f5e9 0%, #fff 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1b5e20", margin: 0 }}>My Medicines</h1>
        <span style={{ fontSize: 14, color: "#888", marginLeft: "auto" }}>{medicines.length} total</span>
      </div>

      {medicines.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 64 }}>📋</div>
          <div style={{ fontSize: 16, color: "#888", marginTop: 8 }}>No medicines added yet.</div>
        </div>
      ) : (
        medicines.map((med) => (
          <div key={med.id} style={{
            background: "#fff", borderRadius: 16, padding: 16, marginBottom: 10,
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#1b5e20" }}>
                  {MED_TYPES.find((t) => t.id === med.type)?.emoji} {med.name}
                </div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                  {med.dosageStrength && <span>{med.dosageStrength} · </span>}
                  {FREQUENCY_OPTIONS.find((f) => f.id === med.frequency)?.label} · {FOOD_OPTIONS.find((f) => f.id === med.foodTiming)?.label}
                </div>
                {med.duration && <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>📅 {med.duration}</div>}
              </div>
              <button onClick={() => onDelete(med.id)} style={{
                background: "#ffebee", border: "none", borderRadius: 10, padding: "6px 12px",
                cursor: "pointer", fontSize: 12, color: "#c62828", fontWeight: 700,
              }}>
                Remove
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {(FREQUENCY_OPTIONS.find((f) => f.id === med.frequency)?.times || []).map((t) => (
                <span key={t} style={{
                  background: "#e8f5e9", padding: "4px 10px", borderRadius: 8,
                  fontSize: 12, fontWeight: 600, color: "#2e7d32",
                }}>
                  ⏰ {formatTime(t)}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  BADGES SCREEN
// ═══════════════════════════════════════════════════════════════
function BadgesScreen({ badges: earnedBadges, stats, onBack }) {
  return (
    <div style={{ minHeight: "100vh", padding: "20px 20px 40px", background: "linear-gradient(180deg, #e8f5e9 0%, #fff 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1b5e20", margin: 0 }}>Badges & Achievements</h1>
      </div>

      <div style={{
        background: "linear-gradient(135deg, #1b5e20, #2e7d32)", borderRadius: 20, padding: 20,
        marginBottom: 20, color: "#fff", textAlign: "center",
      }}>
        <div style={{ fontSize: 14, color: "#a5d6a7" }}>Badges Earned</div>
        <div style={{ fontSize: 36, fontWeight: 900 }}>
          {earnedBadges.length} / {BADGES.length}
        </div>
        <div style={{
          height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3, marginTop: 12, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 3, background: "#fdd835",
            width: `${(earnedBadges.length / BADGES.length) * 100}%`, transition: "width 0.5s",
          }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {BADGES.map((badge) => {
          const earned = earnedBadges.includes(badge.id);
          return (
            <div key={badge.id} style={{
              background: earned ? "#fff" : "#f5f5f5", borderRadius: 16, padding: 16, textAlign: "center",
              boxShadow: earned ? "0 2px 12px rgba(46,125,50,0.1)" : "none",
              border: earned ? "2px solid #66bb6a" : "2px solid transparent",
              opacity: earned ? 1 : 0.5, transition: "all 0.3s",
            }}>
              <div style={{ fontSize: 36 }}>{earned ? badge.icon : "🔒"}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: earned ? "#1b5e20" : "#999", marginTop: 6 }}>
                {badge.name}
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{badge.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SCHEDULE SCREEN — Full day view
// ═══════════════════════════════════════════════════════════════
function ScheduleScreen({ medicines, logs, onBack }) {
  const todayStr = today();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const allDoses = [];

  for (const med of medicines) {
    const freq = FREQUENCY_OPTIONS.find((f) => f.id === med.frequency);
    if (!freq) continue;
    for (const time of freq.times) {
      const [h] = time.split(":").map(Number);
      const done = logs.some((l) => l.medId === med.id && l.time === time && l.date === todayStr);
      const status = done ? logs.find((l) => l.medId === med.id && l.time === time && l.date === todayStr)?.status : null;
      allDoses.push({ hour: h, time, med, done, status });
    }
  }

  const now = new Date().getHours();

  return (
    <div style={{ minHeight: "100vh", padding: "20px 20px 40px", background: "linear-gradient(180deg, #e8f5e9 0%, #fff 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1b5e20", margin: 0 }}>Day Schedule</h1>
      </div>

      {hours.filter((h) => h >= 6 && h <= 23).map((h) => {
        const dosesThisHour = allDoses.filter((d) => d.hour === h);
        const isNow = h === now;

        return (
          <div key={h} style={{ display: "flex", gap: 12, minHeight: dosesThisHour.length > 0 ? 60 : 28 }}>
            <div style={{
              width: 50, fontSize: 12, fontWeight: isNow ? 800 : 500,
              color: isNow ? "#43a047" : "#aaa", paddingTop: 4, textAlign: "right",
            }}>
              {`${h > 12 ? h - 12 : h || 12}${h >= 12 ? "PM" : "AM"}`}
            </div>
            <div style={{
              width: 2, background: isNow ? "#43a047" : "#e0e0e0", position: "relative", flexShrink: 0,
            }}>
              {isNow && <div style={{
                width: 10, height: 10, borderRadius: "50%", background: "#43a047",
                position: "absolute", top: 4, left: -4,
              }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: 8 }}>
              {dosesThisHour.map((dose) => (
                <div key={dose.med.id + dose.time} style={{
                  background: dose.done ? (dose.status === "taken" ? "#e8f5e9" : "#fff3e0") : "#fff",
                  borderRadius: 10, padding: "8px 12px", marginBottom: 4,
                  border: dose.done ? "1px solid #c8e6c9" : "1px solid #eee",
                  fontSize: 13, fontWeight: 600,
                  color: dose.done ? (dose.status === "taken" ? "#2e7d32" : "#e65100") : "#333",
                }}>
                  {dose.done ? (dose.status === "taken" ? "✅" : "⏭️") : "⬜"} {dose.med.name}
                  {dose.med.dosageStrength && <span style={{ color: "#999", fontWeight: 400 }}> · {dose.med.dosageStrength}</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
