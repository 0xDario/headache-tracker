import { useState, useEffect } from "react";

const PAIN_COLORS = {
  0: "#6ee7b7",
  1: "#a7f3d0",
  2: "#86efac",
  3: "#fde68a",
  4: "#fcd34d",
  5: "#fbbf24",
  6: "#fb923c",
  7: "#f87171",
  8: "#ef4444",
  9: "#dc2626",
  10: "#7f1d1d",
};

const LOCATIONS = ["Forehead", "Temple (L)", "Temple (R)", "Both Temples", "Behind Eyes", "Crown", "Back of Head", "One Side", "Whole Head"];
const TRIGGERS = ["Screen time", "Bright light", "Noise", "Stress", "Sleep", "Food/drink", "Exercise", "Weather", "Unknown"];
const MEDS = ["None", "Advil", "Tylenol", "Naproxen", "Aspirin", "Prescription", "Other"];

const INITIAL_ENTRIES = [
  {
    id: "2025-02-08",
    date: "2025-02-08",
    label: "Day 1 — Super Bowl Night",
    pain: 7,
    onset: "Evening",
    duration: "All night",
    location: "Whole Head",
    triggers: ["Unknown"],
    medication: "None",
    relief: "",
    notes: "First night of headache. Super Bowl Sunday.",
    logged: true,
  },
  {
    id: "2025-02-09",
    date: "2025-02-09",
    label: "Day 2 — Volleyball",
    pain: 6,
    onset: "Afternoon",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Exercise", "Food/drink"],
    medication: "None",
    relief: "No relief",
    notes: "Played volleyball. Felt dizzy during the game. Did not eat beforehand. Tired that night — napped when she got home.",
    logged: true,
  },
  {
    id: "2025-02-10",
    date: "2025-02-10",
    label: "Day 3 — Receding",
    pain: 4,
    onset: "Morning",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Food/drink"],
    medication: "None",
    relief: "Partial relief",
    notes: "Felt like it was receding — not as bad. Had alcohol.",
    logged: true,
  },
  {
    id: "2025-02-11",
    date: "2025-02-11",
    label: "Day 4 — Doctor Visit",
    pain: 5,
    onset: "Morning",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Unknown"],
    medication: "Naproxen",
    relief: "",
    notes: "Saw family doctor (not her usual doctor). Went out at night but did not drink because of the headache. Took at least 1 Naproxen.",
    logged: true,
  },
  {
    id: "2025-02-12",
    date: "2025-02-12",
    label: "Day 5 — Pasta Class",
    pain: 5,
    onset: "Afternoon",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Food/drink"],
    medication: "Naproxen",
    relief: "",
    notes: "Pasta making class. Had wine that night. Headache coming in and out throughout the day. Took 1 Naproxen.",
    logged: true,
  },
  {
    id: "2025-02-13",
    date: "2025-02-13",
    label: "Day 6 — Mild",
    pain: 3,
    onset: "Morning",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Unknown"],
    medication: "Naproxen",
    relief: "Partial relief",
    notes: "Mild headache. Severity not recalled. Took 2 Naproxen.",
    logged: true,
  },
  {
    id: "2025-02-14",
    date: "2025-02-14",
    label: "Day 7 — Valentine's Day, Mild",
    pain: 3,
    onset: "Morning",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Unknown"],
    medication: "Naproxen",
    relief: "",
    notes: "Headache mild throughout the day. Took 1 Naproxen.",
    logged: true,
  },
  {
    id: "2025-02-15",
    date: "2025-02-15",
    label: "Day 8 — Not Great",
    pain: 6,
    onset: "Morning",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Unknown"],
    medication: "Naproxen",
    relief: "",
    notes: "Not a good day. Was complaining to her mom about the headache. May have taken Naproxen (does not remember). Last confirmed day of Naproxen use.",
    logged: true,
  },
  {
    id: "2025-02-16",
    date: "2025-02-16",
    label: "Day 9 — Mild",
    pain: 3,
    onset: "Morning",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Unknown"],
    medication: "None",
    relief: "",
    notes: "Mild. No medication taken. Naproxen stopped.",
    logged: true,
  },
  {
    id: "2025-02-17",
    date: "2025-02-17",
    label: "Day 10 — Mild",
    pain: 3,
    onset: "Morning",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Unknown"],
    medication: "Tylenol",
    relief: "",
    notes: "Mild. Took 2x Extra Strength Tylenol.",
    logged: true,
  },
  {
    id: "2025-02-18",
    date: "2025-02-18",
    label: "Day 11 — Notably Worse",
    pain: 6,
    onset: "Morning",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Stress"],
    medication: "None",
    relief: "No relief",
    notes: "Headache notably worse. No medication taken. Increasing frustration that headache is not resolving after multiple weeks.",
    logged: true,
  },
  {
    id: "2025-02-19",
    date: "2025-02-19",
    label: "Day 12 — Worse",
    pain: 7,
    onset: "Morning",
    duration: "All day",
    location: "Whole Head",
    triggers: ["Stress"],
    medication: "Tylenol",
    relief: "",
    notes: "Same as yesterday or worse. Day 12 of continuous headache. Took 2x Extra Strength Tylenol at 5:30 PM. Relief TBD.",
    logged: true,
  },
];

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HeadacheTracker() {
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [view, setView] = useState("log"); // log | add | history
  const [form, setForm] = useState({
    date: today(),
    pain: 5,
    onset: "",
    duration: "",
    location: "",
    triggers: [],
    medication: "None",
    relief: "",
    notes: "",
  });
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await window.storage?.get("headache_entries");
        if (res && res.value) {
          const stored = JSON.parse(res.value);
          if (stored.length > 0) setEntries(stored);
        }
      } catch {}
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.storage?.set("headache_entries", JSON.stringify(entries)).catch(() => {});
  }, [entries, loaded]);

  function toggleTrigger(t) {
    setForm((f) => ({
      ...f,
      triggers: f.triggers.includes(t) ? f.triggers.filter((x) => x !== t) : [...f.triggers, t],
    }));
  }

  function saveEntry() {
    const entry = { ...form, id: form.date + "_" + Date.now(), logged: true };
    setEntries((prev) => {
      const updated = prev.filter((e) => e.date !== form.date);
      return [...updated, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); setView("history"); }, 900);
  }

  function deleteEntry(id) {
    if (window.confirm("Delete this entry?")) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }

  const avgPain = entries.filter(e => e.pain !== null && e.pain !== undefined).reduce((s, e, _, a) => s + e.pain / a.length, 0);
  const maxEntry = [...entries].sort((a, b) => (b.pain || 0) - (a.pain || 0))[0];

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#0f0f10", minHeight: "100vh", color: "#e8e0d5", padding: "0" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea { font-family: inherit; }
        .btn { cursor: pointer; border: none; transition: all 0.15s; }
        .btn:hover { opacity: 0.85; }
        .chip { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; cursor: pointer; border: 1px solid #333; margin: 3px; transition: all 0.15s; }
        .chip.active { background: #c0392b; border-color: #c0392b; color: white; }
        .chip:not(.active) { background: transparent; color: #888; }
        .chip:hover:not(.active) { border-color: #888; color: #ccc; }
        .pain-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; }
        input[type=range] { width: 100%; accent-color: #c0392b; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a1c; }
        ::-webkit-scrollbar-thumb { background: #333; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#141416", borderBottom: "1px solid #222", padding: "20px 24px 16px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", marginBottom: 4 }}>Patient Log</div>
        <h1 style={{ fontSize: 22, fontWeight: "normal", color: "#e8e0d5", letterSpacing: "-0.01em" }}>Headache Tracker</h1>
        <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Started Feb 8, 2025 &nbsp;·&nbsp; {entries.length} entries</div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#141416", borderBottom: "1px solid #1e1e20", padding: "14px 24px" }}>
        <div>
          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Days logged</div>
          <div style={{ fontSize: 20, color: "#e8e0d5", marginTop: 2 }}>{entries.length}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Avg pain</div>
          <div style={{ fontSize: 20, color: entries.filter(e=>e.pain).length ? PAIN_COLORS[Math.round(avgPain)] : "#555", marginTop: 2 }}>
            {entries.filter(e=>e.pain).length ? avgPain.toFixed(1) : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Peak pain</div>
          <div style={{ fontSize: 20, color: maxEntry?.pain ? PAIN_COLORS[maxEntry.pain] : "#555", marginTop: 2 }}>
            {maxEntry?.pain ?? "—"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e1e20", background: "#141416" }}>
        {[["log", "Add Entry"], ["history", "History"]].map(([v, label]) => (
          <button key={v} className="btn" onClick={() => setView(v)} style={{
            flex: 1, padding: "12px 0", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
            background: "transparent", color: view === v ? "#e8e0d5" : "#555",
            borderBottom: view === v ? "2px solid #c0392b" : "2px solid transparent",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 20px 80px" }}>

        {/* ADD ENTRY */}
        {view === "log" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ background: "#1a1a1c", border: "1px solid #2a2a2e", borderRadius: 6, color: "#e8e0d5", padding: "10px 12px", fontSize: 14, width: "100%" }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>
                Pain Level &nbsp;
                <span style={{ color: PAIN_COLORS[form.pain], fontSize: 18, fontWeight: "bold" }}>{form.pain}</span>
                <span style={{ color: "#555", fontSize: 11 }}>/10</span>
              </label>
              <input type="range" min={0} max={10} value={form.pain}
                onChange={e => setForm(f => ({ ...f, pain: Number(e.target.value) }))} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#444", marginTop: 4 }}>
                <span>None</span><span>Mild</span><span>Moderate</span><span>Severe</span><span>Worst</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>When did it start</label>
                <select value={form.onset} onChange={e => setForm(f => ({ ...f, onset: e.target.value }))}
                  style={{ background: "#1a1a1c", border: "1px solid #2a2a2e", borderRadius: 6, color: form.onset ? "#e8e0d5" : "#555", padding: "10px 12px", fontSize: 13, width: "100%" }}>
                  <option value="">Select</option>
                  {["Morning", "Afternoon", "Evening", "Night", "Woke up with it"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Duration</label>
                <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  style={{ background: "#1a1a1c", border: "1px solid #2a2a2e", borderRadius: 6, color: form.duration ? "#e8e0d5" : "#555", padding: "10px 12px", fontSize: 13, width: "100%" }}>
                  <option value="">Select</option>
                  {["< 1 hour", "1-2 hours", "2-4 hours", "4-8 hours", "8-12 hours", "All day", "All night", "Multiple days"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Location</label>
              <div>{LOCATIONS.map(l => (
                <span key={l} className={`chip ${form.location === l ? "active" : ""}`}
                  onClick={() => setForm(f => ({ ...f, location: f.location === l ? "" : l }))}>{l}</span>
              ))}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Triggers (select all that apply)</label>
              <div>{TRIGGERS.map(t => (
                <span key={t} className={`chip ${form.triggers.includes(t) ? "active" : ""}`}
                  onClick={() => toggleTrigger(t)}>{t}</span>
              ))}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Medication taken</label>
                <select value={form.medication} onChange={e => setForm(f => ({ ...f, medication: e.target.value }))}
                  style={{ background: "#1a1a1c", border: "1px solid #2a2a2e", borderRadius: 6, color: "#e8e0d5", padding: "10px 12px", fontSize: 13, width: "100%" }}>
                  {MEDS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Helped?</label>
                <select value={form.relief} onChange={e => setForm(f => ({ ...f, relief: e.target.value }))}
                  style={{ background: "#1a1a1c", border: "1px solid #2a2a2e", borderRadius: 6, color: form.relief ? "#e8e0d5" : "#555", padding: "10px 12px", fontSize: 13, width: "100%" }}>
                  <option value="">Select</option>
                  {["Full relief", "Partial relief", "No relief", "Made it worse", "N/A"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any other details — symptoms, what made it better or worse..."
                rows={3}
                style={{ background: "#1a1a1c", border: "1px solid #2a2a2e", borderRadius: 6, color: "#e8e0d5", padding: "10px 12px", fontSize: 13, width: "100%", resize: "vertical", lineHeight: 1.6 }} />
            </div>

            <button className="btn" onClick={saveEntry}
              style={{ width: "100%", padding: "14px", background: saved ? "#16a34a" : "#c0392b", color: "white", borderRadius: 8, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {saved ? "Saved" : "Save Entry"}
            </button>
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && (
          <div>
            {entries.length === 0 && (
              <div style={{ textAlign: "center", color: "#555", padding: "60px 0", fontSize: 14 }}>No entries yet.</div>
            )}
            {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(entry => (
              <div key={entry.id} style={{ background: "#141416", border: "1px solid #222", borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#e8e0d5", fontWeight: "bold" }}>{formatDate(entry.date)}</div>
                    {entry.label && <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{entry.label}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {entry.pain !== null && entry.pain !== undefined ? (
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 22, color: PAIN_COLORS[entry.pain], fontWeight: "bold" }}>{entry.pain}</span>
                        <span style={{ fontSize: 10, color: "#555" }}>/10</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: "#555" }}>pain not rated</span>
                    )}
                    <button className="btn" onClick={() => deleteEntry(entry.id)}
                      style={{ background: "transparent", color: "#444", fontSize: 16, padding: "2px 6px", borderRadius: 4 }}>×</button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: entry.notes ? 10 : 0, fontSize: 11 }}>
                  {entry.onset && <div><span style={{ color: "#555" }}>Onset: </span><span style={{ color: "#aaa" }}>{entry.onset}</span></div>}
                  {entry.duration && <div><span style={{ color: "#555" }}>Duration: </span><span style={{ color: "#aaa" }}>{entry.duration}</span></div>}
                  {entry.location && <div><span style={{ color: "#555" }}>Location: </span><span style={{ color: "#aaa" }}>{entry.location}</span></div>}
                  {entry.medication && entry.medication !== "None" && <div><span style={{ color: "#555" }}>Med: </span><span style={{ color: "#aaa" }}>{entry.medication}</span></div>}
                  {entry.relief && <div><span style={{ color: "#555" }}>Relief: </span><span style={{ color: "#aaa" }}>{entry.relief}</span></div>}
                </div>

                {entry.triggers && entry.triggers.length > 0 && (
                  <div style={{ marginBottom: entry.notes ? 8 : 0 }}>
                    {entry.triggers.map(t => (
                      <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: "#2a1a1a", color: "#c0392b", border: "1px solid #3a1a1a", marginRight: 4 }}>{t}</span>
                    ))}
                  </div>
                )}

                {entry.notes && (
                  <div style={{ fontSize: 12, color: "#888", borderTop: "1px solid #1e1e20", paddingTop: 8, marginTop: 8, lineHeight: 1.5, fontStyle: "italic" }}>{entry.notes}</div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}