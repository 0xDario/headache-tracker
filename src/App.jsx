import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Turnstile } from "@marsidev/react-turnstile";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const PAIN_COLORS = {
  0: "#4ade80",
  1: "#6ee7b7",
  2: "#86efac",
  3: "#fde68a",
  4: "#fcd34d",
  5: "#fbbf24",
  6: "#fb923c",
  7: "#f87171",
  8: "#ef4444",
  9: "#dc2626",
  10: "#991b1b",
};

const PAIN_GRADIENTS = {
  0: "linear-gradient(135deg, #4ade80, #22c55e)",
  1: "linear-gradient(135deg, #6ee7b7, #34d399)",
  2: "linear-gradient(135deg, #86efac, #4ade80)",
  3: "linear-gradient(135deg, #fde68a, #fbbf24)",
  4: "linear-gradient(135deg, #fcd34d, #f59e0b)",
  5: "linear-gradient(135deg, #fbbf24, #f59e0b)",
  6: "linear-gradient(135deg, #fb923c, #f97316)",
  7: "linear-gradient(135deg, #f87171, #ef4444)",
  8: "linear-gradient(135deg, #ef4444, #dc2626)",
  9: "linear-gradient(135deg, #dc2626, #b91c1c)",
  10: "linear-gradient(135deg, #991b1b, #7f1d1d)",
};

const LOCATIONS = [
  "Forehead",
  "Temple (L)",
  "Temple (R)",
  "Both Temples",
  "Behind Eyes",
  "Crown",
  "Back of Head",
  "One Side",
  "Whole Head",
];
const TRIGGERS = [
  "Screen time",
  "Bright light",
  "Noise",
  "Stress",
  "Sleep",
  "Food/drink",
  "Exercise",
  "Weather",
  "Unknown",
];
const MEDS = [
  "None",
  "Advil",
  "Tylenol",
  "Naproxen",
  "Aspirin",
  "Prescription",
  "Other",
];

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function normalizeLocations(loc) {
  if (!loc) return [];
  if (Array.isArray(loc)) return loc;
  return [loc];
}

function normalizeMedications(entry) {
  if (entry.medications && Array.isArray(entry.medications))
    return entry.medications;
  if (entry.medication && entry.medication !== "None") {
    return [{ name: entry.medication, dosage: entry.dosage || "", time: "" }];
  }
  return [];
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

const emptyForm = () => ({
  date: today(),
  pain: 5,
  onset: "",
  duration: "",
  location: [],
  triggers: [],
  medications: [],
  relief: "",
  notes: "",
});

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: authError } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } })
          : await supabase.auth.signUp({ email, password, options: { captchaToken } });
      if (authError) throw authError;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setCaptchaToken(null);
      captchaRef.current?.reset();
    }
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
        background: "#FFF8F0",
        minHeight: "100dvh",
        color: "#2D1B00",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { background: #FFF8F0; }
        input, button { font-family: 'DM Sans', -apple-system, sans-serif; outline: none; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 36,
              fontWeight: 400,
              color: "#2D1B00",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 8,
            }}
          >
            Headache{" "}
            <span
              style={{
                fontStyle: "italic",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Tracker
            </span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(45,27,0,0.45)" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={{
                width: "100%",
                background: "rgba(45,27,0,0.03)",
                border: "1.5px solid rgba(45,27,0,0.1)",
                borderRadius: 14,
                color: "#2D1B00",
                padding: "14px 16px",
                fontSize: 15,
                WebkitAppearance: "none",
                minHeight: 48,
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              style={{
                width: "100%",
                background: "rgba(45,27,0,0.03)",
                border: "1.5px solid rgba(45,27,0,0.1)",
                borderRadius: 14,
                color: "#2D1B00",
                padding: "14px 16px",
                fontSize: 15,
                WebkitAppearance: "none",
                minHeight: 48,
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 16px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 12,
                color: "#f87171",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <Turnstile
              ref={captchaRef}
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
              options={{ theme: "light" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#09090b",
              border: "none",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading || !captchaToken ? "not-allowed" : "pointer",
              opacity: loading || !captchaToken ? 0.7 : 1,
              boxShadow: "0 4px 20px rgba(251,191,36,0.25)",
              letterSpacing: "0.02em",
            }}
          >
            {loading
              ? "..."
              : mode === "login"
                ? "Sign In"
                : "Sign Up"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 13,
            color: "rgba(45,27,0,0.45)",
          }}
        >
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#fbbf24",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeadacheTracker() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState("log");
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load entries when session exists
  useEffect(() => {
    if (!session) return;
    async function load() {
      const { data, error } = await supabase
        .from("headache_entries")
        .select("*")
        .order("date", { ascending: true });
      if (!error && data) setEntries(data);
    }
    load();
  }, [session]);

  if (authLoading) {
    return (
      <div
        style={{
          background: "#FFF8F0",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(45,27,0,0.4)",
          fontFamily: "'DM Sans', -apple-system, sans-serif",
          fontSize: 14,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  function toggleLocation(l) {
    setForm((f) => ({
      ...f,
      location: f.location.includes(l)
        ? f.location.filter((x) => x !== l)
        : [...f.location, l],
    }));
  }

  function toggleTrigger(t) {
    setForm((f) => ({
      ...f,
      triggers: f.triggers.includes(t)
        ? f.triggers.filter((x) => x !== t)
        : [...f.triggers, t],
    }));
  }

  function addMedication() {
    setForm((f) => ({
      ...f,
      medications: [...f.medications, { name: "Advil", dosage: "", time: "" }],
    }));
  }

  function updateMedication(index, field, value) {
    setForm((f) => ({
      ...f,
      medications: f.medications.map((m, i) =>
        i === index ? { ...m, [field]: value } : m,
      ),
    }));
  }

  function removeMedication(index) {
    setForm((f) => ({
      ...f,
      medications: f.medications.filter((_, i) => i !== index),
    }));
  }

  async function saveEntry() {
    setSaving(true);
    const payload = {
      date: form.date,
      pain: form.pain,
      onset: form.onset || null,
      duration: form.duration || null,
      location: form.location,
      triggers: form.triggers,
      medications: form.medications,
      relief: form.relief || null,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("headache_entries")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (!error && data) {
        setEntries((prev) =>
          prev
            .map((e) => (e.id === editingId ? data : e))
            .sort((a, b) => a.date.localeCompare(b.date)),
        );
      }
    } else {
      const { data, error } = await supabase
        .from("headache_entries")
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        setEntries((prev) =>
          [...prev, data].sort((a, b) => a.date.localeCompare(b.date)),
        );
      }
    }

    setSaving(false);
    setSaved(true);
    setEditingId(null);
    setForm(emptyForm());
    setTimeout(() => {
      setSaved(false);
      setView("history");
    }, 900);
  }

  function editEntry(entry) {
    setForm({
      date: entry.date,
      pain: entry.pain ?? 5,
      onset: entry.onset || "",
      duration: entry.duration || "",
      location: normalizeLocations(entry.location),
      triggers: entry.triggers || [],
      medications: normalizeMedications(entry),
      relief: entry.relief || "",
      notes: entry.notes || "",
    });
    setEditingId(entry.id);
    setView("log");
    setTimeout(() => {
      formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function deleteEntry(id) {
    const { error } = await supabase
      .from("headache_entries")
      .delete()
      .eq("id", id);
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    setDeleteConfirm(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setEntries([]);
    setSession(null);
  }

  const avgPain = entries
    .filter((e) => e.pain !== null && e.pain !== undefined)
    .reduce((s, e, _, a) => s + e.pain / a.length, 0);
  const maxEntry = [...entries].sort(
    (a, b) => (b.pain || 0) - (a.pain || 0),
  )[0];

  const streakDays = (() => {
    const sorted = [...entries].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    if (sorted.length === 0) return 0;
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date);
      const curr = new Date(sorted[i].date);
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) count++;
      else break;
    }
    return count;
  })();

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
        background: "#FFF8F0",
        minHeight: "100dvh",
        color: "#2D1B00",
        padding: 0,
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        html { background: #FFF8F0; }
        body { overscroll-behavior: none; }
        input, select, textarea, button { font-family: 'DM Sans', -apple-system, sans-serif; outline: none; }

        .ht-btn { cursor: pointer; border: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); -webkit-appearance: none; }
        .ht-btn:active { transform: scale(0.97); }

        .ht-chip {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 10px 16px; border-radius: 100px; font-size: 13px; font-weight: 500;
          cursor: pointer; border: 1.5px solid rgba(45,27,0,0.08);
          margin: 4px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none; -webkit-user-select: none;
          min-height: 42px;
        }
        .ht-chip.active {
          background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15));
          border-color: rgba(251,191,36,0.5); color: #b45309;
          box-shadow: 0 0 20px rgba(251,191,36,0.1), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .ht-chip:not(.active) { background: rgba(45,27,0,0.05); color: rgba(45,27,0,0.5); }
        .ht-chip:active { transform: scale(0.95); }

        .ht-card {
          background: #FFFFFF;
          border: 1px solid rgba(45,27,0,0.06);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 12px;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(45,27,0,0.04), 0 4px 12px rgba(45,27,0,0.03);
        }
        .ht-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(45,27,0,0.04), transparent);
        }

        .ht-input {
          background: rgba(45,27,0,0.03);
          border: 1.5px solid rgba(45,27,0,0.1);
          border-radius: 14px;
          color: #2D1B00;
          padding: 14px 16px;
          font-size: 15px;
          width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          min-height: 48px;
        }
        .ht-input:focus {
          border-color: rgba(251,191,36,0.4);
          box-shadow: 0 0 0 3px rgba(251,191,36,0.08);
        }
        .ht-input::placeholder { color: rgba(45,27,0,0.3); }

        select.ht-input { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(45,27,0,0.35)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }

        input[type=range] {
          -webkit-appearance: none; width: 100%; height: 6px;
          border-radius: 3px; outline: none;
          background: rgba(45,27,0,0.08);
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 28px; height: 28px;
          border-radius: 50%; cursor: pointer;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(45,27,0,0.1);
        }
        input[type=range]::-moz-range-thumb {
          width: 28px; height: 28px;
          border-radius: 50%; cursor: pointer;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .ht-label {
          font-size: 11px; color: rgba(45,27,0,0.45); text-transform: uppercase;
          letter-spacing: 0.12em; font-weight: 600; display: block; margin-bottom: 10px;
        }

        .ht-fade-in { animation: htFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes htFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .ht-slide-up { animation: htSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes htSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .ht-med-row { animation: htMedIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes htMedIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .ht-pulse { animation: htPulse 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes htPulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }

        .ht-nav-indicator {
          position: absolute; bottom: 0; height: 2px;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          border-radius: 2px 2px 0 0;
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ht-delete-overlay {
          position: absolute; inset: 0; z-index: 10;
          background: rgba(255,248,240,0.95); backdrop-filter: blur(8px);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          border-radius: 20px; animation: htFadeIn 0.2s ease;
        }

        ::-webkit-scrollbar { width: 0px; }

        @media (hover: hover) {
          .ht-chip:hover:not(.active) { border-color: rgba(45,27,0,0.15); color: rgba(45,27,0,0.65); }
          .ht-card:hover { border-color: rgba(45,27,0,0.1); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(251,191,36,0.06) 0%, transparent 100%)",
          padding: "env(safe-area-inset-top, 16px) 20px 0",
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "20px 0 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 32,
                  fontWeight: 400,
                  color: "#2D1B00",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                Headache
                <br />
                <span
                  style={{
                    fontStyle: "italic",
                    background:
                      "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Tracker
                </span>
              </h1>
            </div>
            <button
              className="ht-btn"
              onClick={handleLogout}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "rgba(45,27,0,0.03)",
                border: "1px solid rgba(45,27,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title="Sign out"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(45,27,0,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            {
              label: "Logged",
              value: entries.length,
              sub: entries.length === 1 ? "day" : "days",
              color: "#2D1B00",
            },
            {
              label: "Avg Pain",
              value: entries.filter((e) => e.pain).length
                ? avgPain.toFixed(1)
                : "—",
              sub: "/10",
              color: entries.filter((e) => e.pain).length
                ? PAIN_COLORS[Math.round(avgPain)]
                : "#555",
            },
            {
              label: "Streak",
              value: streakDays,
              sub: streakDays === 1 ? "day" : "days",
              color: "#fbbf24",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(45,27,0,0.06)",
                borderRadius: 16,
                padding: "14px 16px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(45,27,0,0.04), 0 4px 12px rgba(45,27,0,0.03)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(45,27,0,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: stat.color,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(45,27,0,0.3)",
                  marginTop: 2,
                }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "8px 20px 0",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "rgba(45,27,0,0.05)",
            borderRadius: 14,
            padding: 4,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 4,
              left: view === "log" ? 4 : "50%",
              width: "calc(50% - 4px)",
              height: "calc(100% - 8px)",
              background: "rgba(251,191,36,0.12)",
              border: "1px solid rgba(251,191,36,0.2)",
              borderRadius: 11,
              transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          {[
            ["log", editingId ? "Edit Entry" : "Log Entry"],
            ["history", "History"],
          ].map(([v, label]) => (
            <button
              key={v}
              className="ht-btn"
              onClick={() => {
                if (v === "log" && editingId) {
                  cancelEdit();
                }
                setView(v);
              }}
              style={{
                flex: 1,
                padding: "12px 0",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                background: "transparent",
                color:
                  view === v
                    ? "#b45309"
                    : "rgba(45,27,0,0.35)",
                position: "relative",
                zIndex: 1,
                borderRadius: 11,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        ref={formRef}
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "20px 20px calc(env(safe-area-inset-bottom, 20px) + 40px)",
        }}
      >
        {/* LOG / EDIT ENTRY */}
        {view === "log" && (
          <div className="ht-fade-in">
            {editingId && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  padding: "12px 16px",
                  background: "rgba(251,191,36,0.06)",
                  border: "1px solid rgba(251,191,36,0.15)",
                  borderRadius: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#fbbf24",
                      fontWeight: 500,
                    }}
                  >
                    Editing {formatDate(form.date)}
                  </span>
                </div>
                <button
                  className="ht-btn"
                  onClick={cancelEdit}
                  style={{
                    background: "rgba(45,27,0,0.06)",
                    color: "rgba(45,27,0,0.55)",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Date */}
            <div style={{ marginBottom: 24 }}>
              <label className="ht-label">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="ht-input"
              />
            </div>

            {/* Pain Level */}
            <div style={{ marginBottom: 28 }}>
              <label className="ht-label">
                Pain Level
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: PAIN_GRADIENTS[form.pain],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 4px 20px ${PAIN_COLORS[form.pain]}33`,
                    transition: "all 0.3s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: form.pain >= 8 ? "#fff" : "#09090b",
                    }}
                  >
                    {form.pain}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      color: PAIN_COLORS[form.pain],
                      fontWeight: 600,
                      marginBottom: 2,
                      transition: "color 0.3s",
                    }}
                  >
                    {form.pain <= 1
                      ? "Minimal"
                      : form.pain <= 3
                        ? "Mild"
                        : form.pain <= 5
                          ? "Moderate"
                          : form.pain <= 7
                            ? "Severe"
                            : form.pain <= 9
                              ? "Very Severe"
                              : "Worst Possible"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(45,27,0,0.35)",
                    }}
                  >
                    Slide to adjust
                  </div>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={form.pain}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pain: Number(e.target.value),
                  }))
                }
                style={{
                  background: `linear-gradient(to right, #4ade80, #fbbf24 50%, #dc2626)`,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "rgba(45,27,0,0.3)",
                  marginTop: 8,
                  fontWeight: 500,
                }}
              >
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Onset & Duration */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div>
                <label className="ht-label">Onset</label>
                <select
                  value={form.onset}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, onset: e.target.value }))
                  }
                  className="ht-input"
                  style={{
                    color: form.onset
                      ? "#2D1B00"
                      : "rgba(45,27,0,0.3)",
                  }}
                >
                  <option value="">Select</option>
                  {[
                    "Morning",
                    "Afternoon",
                    "Evening",
                    "Night",
                    "Woke up with it",
                  ].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ht-label">Duration</label>
                <select
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      duration: e.target.value,
                    }))
                  }
                  className="ht-input"
                  style={{
                    color: form.duration
                      ? "#2D1B00"
                      : "rgba(45,27,0,0.3)",
                  }}
                >
                  <option value="">Select</option>
                  {[
                    "< 1 hour",
                    "1-2 hours",
                    "2-4 hours",
                    "4-8 hours",
                    "8-12 hours",
                    "All day",
                    "All night",
                    "Multiple days",
                  ].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location - Multi-select */}
            <div style={{ marginBottom: 24 }}>
              <label className="ht-label">
                Location{" "}
                <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
                  — select all that apply
                </span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", margin: -4 }}>
                {LOCATIONS.map((l) => (
                  <span
                    key={l}
                    className={`ht-chip ${form.location.includes(l) ? "active" : ""}`}
                    onClick={() => toggleLocation(l)}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div style={{ marginBottom: 24 }}>
              <label className="ht-label">
                Triggers{" "}
                <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
                  — select all that apply
                </span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", margin: -4 }}>
                {TRIGGERS.map((t) => (
                  <span
                    key={t}
                    className={`ht-chip ${form.triggers.includes(t) ? "active" : ""}`}
                    onClick={() => toggleTrigger(t)}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div style={{ marginBottom: 24 }}>
              <label className="ht-label">Medications</label>
              {form.medications.map((med, i) => (
                <div
                  key={i}
                  className="ht-med-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: 8,
                    marginBottom: 8,
                    alignItems: "end",
                  }}
                >
                  <div>
                    {i === 0 && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(45,27,0,0.35)",
                          marginBottom: 4,
                          fontWeight: 500,
                        }}
                      >
                        Medication
                      </div>
                    )}
                    <select
                      value={med.name}
                      onChange={(e) =>
                        updateMedication(i, "name", e.target.value)
                      }
                      className="ht-input"
                      style={{ padding: "12px 14px", fontSize: 14 }}
                    >
                      {MEDS.filter((m) => m !== "None").map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    {i === 0 && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(45,27,0,0.35)",
                          marginBottom: 4,
                          fontWeight: 500,
                        }}
                      >
                        Dosage
                      </div>
                    )}
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) =>
                        updateMedication(i, "dosage", e.target.value)
                      }
                      placeholder="e.g. 200mg"
                      className="ht-input"
                      style={{ padding: "12px 14px", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    {i === 0 && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(45,27,0,0.35)",
                          marginBottom: 4,
                          fontWeight: 500,
                        }}
                      >
                        Time
                      </div>
                    )}
                    <input
                      type="time"
                      value={med.time || ""}
                      onChange={(e) =>
                        updateMedication(i, "time", e.target.value)
                      }
                      className="ht-input"
                      style={{ padding: "12px 14px", fontSize: 14 }}
                    />
                  </div>
                  <button
                    className="ht-btn"
                    onClick={() => removeMedication(i)}
                    style={{
                      width: 44,
                      height: 48,
                      borderRadius: 14,
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.15)",
                      color: "#ef4444",
                      fontSize: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                className="ht-btn"
                onClick={addMedication}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "rgba(45,27,0,0.02)",
                  border: "1.5px dashed rgba(45,27,0,0.12)",
                  borderRadius: 14,
                  color: "rgba(45,27,0,0.5)",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add medication
              </button>
            </div>

            {/* Relief */}
            <div style={{ marginBottom: 24 }}>
              <label className="ht-label">Relief</label>
              <select
                value={form.relief}
                onChange={(e) =>
                  setForm((f) => ({ ...f, relief: e.target.value }))
                }
                className="ht-input"
                style={{
                  color: form.relief
                    ? "#2D1B00"
                    : "rgba(45,27,0,0.3)",
                }}
              >
                <option value="">Select</option>
                {[
                  "Full relief",
                  "Partial relief",
                  "No relief",
                  "Made it worse",
                  "N/A",
                ].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 32 }}>
              <label className="ht-label">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Symptoms, what helped, how you felt..."
                rows={3}
                className="ht-input"
                style={{
                  resize: "vertical",
                  lineHeight: 1.6,
                  minHeight: 100,
                }}
              />
            </div>

            {/* Save Button */}
            <button
              className="ht-btn"
              onClick={saveEntry}
              disabled={saving}
              style={{
                width: "100%",
                padding: "18px",
                background: saved
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, #fbbf24, #f59e0b)",
                color: saved ? "#fff" : "#09090b",
                borderRadius: 16,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.02em",
                boxShadow: saved
                  ? "0 4px 20px rgba(34,197,94,0.3)"
                  : "0 4px 20px rgba(251,191,36,0.25)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saved
                ? "Saved"
                : saving
                  ? "Saving..."
                  : editingId
                    ? "Update Entry"
                    : "Save Entry"}
            </button>
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && (
          <div className="ht-fade-in">
            {entries.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "rgba(45,27,0,0.3)",
                  padding: "80px 0",
                  fontSize: 15,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    style={{ margin: "0 auto" }}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                No entries yet
              </div>
            )}
            {[...entries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((entry, idx) => {
                const entryLocations = normalizeLocations(entry.location);
                const entryMeds = normalizeMedications(entry);
                return (
                  <div
                    key={entry.id}
                    className="ht-card ht-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: "both" }}
                  >
                    {/* Delete confirmation overlay */}
                    {deleteConfirm === entry.id && (
                      <div className="ht-delete-overlay">
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#2D1B00",
                            marginBottom: 4,
                          }}
                        >
                          Delete this entry?
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "rgba(45,27,0,0.5)",
                            marginBottom: 20,
                          }}
                        >
                          {formatDate(entry.date)}
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            className="ht-btn"
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              padding: "10px 24px",
                              background: "rgba(45,27,0,0.06)",
                              border: "1px solid rgba(45,27,0,0.1)",
                              color: "rgba(45,27,0,0.65)",
                              borderRadius: 12,
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="ht-btn"
                            onClick={() => deleteEntry(entry.id)}
                            style={{
                              padding: "10px 24px",
                              background:
                                "linear-gradient(135deg, #ef4444, #dc2626)",
                              color: "#fff",
                              borderRadius: 12,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 14,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 15,
                            color: "#2D1B00",
                            fontWeight: 600,
                          }}
                        >
                          {formatDate(entry.date)}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {entry.pain !== null &&
                        entry.pain !== undefined ? (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 14,
                              background: PAIN_GRADIENTS[entry.pain],
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              boxShadow: `0 2px 12px ${PAIN_COLORS[entry.pain]}22`,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color:
                                  entry.pain >= 8
                                    ? "#fff"
                                    : "#09090b",
                                lineHeight: 1,
                              }}
                            >
                              {entry.pain}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              color: "rgba(45,27,0,0.3)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details grid */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginBottom: 12,
                      }}
                    >
                      {entry.onset && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "5px 10px",
                            borderRadius: 8,
                            background: "rgba(45,27,0,0.04)",
                            color: "rgba(45,27,0,0.55)",
                            fontWeight: 500,
                          }}
                        >
                          {entry.onset}
                        </span>
                      )}
                      {entry.duration && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "5px 10px",
                            borderRadius: 8,
                            background: "rgba(45,27,0,0.04)",
                            color: "rgba(45,27,0,0.55)",
                            fontWeight: 500,
                          }}
                        >
                          {entry.duration}
                        </span>
                      )}
                      {entry.relief && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "5px 10px",
                            borderRadius: 8,
                            background:
                              entry.relief === "Full relief"
                                ? "rgba(34,197,94,0.1)"
                                : entry.relief === "No relief" ||
                                    entry.relief === "Made it worse"
                                  ? "rgba(239,68,68,0.1)"
                                  : "rgba(251,191,36,0.08)",
                            color:
                              entry.relief === "Full relief"
                                ? "#4ade80"
                                : entry.relief === "No relief" ||
                                    entry.relief === "Made it worse"
                                  ? "#f87171"
                                  : "rgba(251,191,36,0.7)",
                            fontWeight: 500,
                          }}
                        >
                          {entry.relief}
                        </span>
                      )}
                    </div>

                    {/* Locations */}
                    {entryLocations.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            fontSize: 10,
                            color: "rgba(45,27,0,0.3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 600,
                            marginBottom: 6,
                          }}
                        >
                          Location
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                          }}
                        >
                          {entryLocations.map((l) => (
                            <span
                              key={l}
                              style={{
                                fontSize: 11,
                                padding: "4px 10px",
                                borderRadius: 8,
                                background: "rgba(139,92,246,0.1)",
                                color: "rgba(167,139,250,0.8)",
                                border:
                                  "1px solid rgba(139,92,246,0.15)",
                                fontWeight: 500,
                              }}
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medications */}
                    {entryMeds.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            fontSize: 10,
                            color: "rgba(45,27,0,0.3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 600,
                            marginBottom: 6,
                          }}
                        >
                          Medications
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          {entryMeds.map((med, mi) => (
                            <div
                              key={mi}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 12,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: 3,
                                  background:
                                    "rgba(56,189,248,0.5)",
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  color: "rgba(45,27,0,0.65)",
                                  fontWeight: 500,
                                }}
                              >
                                {med.name}
                              </span>
                              {med.dosage && (
                                <span
                                  style={{
                                    color: "rgba(45,27,0,0.4)",
                                  }}
                                >
                                  {med.dosage}
                                  {med.time ? ` at ${formatTime(med.time)}` : ""}
                                </span>
                              )}
                              {!med.dosage && med.time && (
                                <span
                                  style={{
                                    color: "rgba(45,27,0,0.4)",
                                  }}
                                >
                                  at {formatTime(med.time)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Triggers */}
                    {entry.triggers && entry.triggers.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            fontSize: 10,
                            color: "rgba(45,27,0,0.3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 600,
                            marginBottom: 6,
                          }}
                        >
                          Triggers
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                          }}
                        >
                          {entry.triggers.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: 11,
                                padding: "4px 10px",
                                borderRadius: 8,
                                background: "rgba(251,191,36,0.08)",
                                color: "rgba(251,191,36,0.7)",
                                border:
                                  "1px solid rgba(251,191,36,0.12)",
                                fontWeight: 500,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {entry.notes && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(45,27,0,0.5)",
                          borderTop:
                            "1px solid rgba(45,27,0,0.05)",
                          paddingTop: 12,
                          marginTop: 12,
                          lineHeight: 1.6,
                          fontStyle: "italic",
                        }}
                      >
                        {entry.notes}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop:
                          "1px solid rgba(45,27,0,0.05)",
                      }}
                    >
                      <button
                        className="ht-btn"
                        onClick={() => editEntry(entry)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "rgba(45,27,0,0.03)",
                          border: "1px solid rgba(45,27,0,0.08)",
                          color: "rgba(45,27,0,0.55)",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="ht-btn"
                        onClick={() => setDeleteConfirm(entry.id)}
                        style={{
                          padding: "10px 16px",
                          background: "rgba(239,68,68,0.06)",
                          border: "1px solid rgba(239,68,68,0.1)",
                          color: "rgba(239,68,68,0.6)",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
