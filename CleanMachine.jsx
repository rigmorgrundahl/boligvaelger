// The Clean Machine — Reference JSX
//
// SYNC STATE: this file reflects v3 (mode + profile rename). It does NOT
// yet include v4 additions: streaks, pace toggle, Duolingo-style juice
// (depth-shadow buttons, +XP floats, encouragement microcopy, milestone
// confetti), PWA manifest + service worker, mid-clean timer sheet.
//
// `index.html` at the repo root is the canonical, runnable source of
// truth. When porting this file into a Vite/Next project, prefer
// re-syncing from index.html rather than building on top of this v3
// snapshot.

import React, { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// SETTINGS PERSISTENCE
// ============================================================
const SETTINGS_KEY = "cm.settings.v1";

const DEFAULT_SETTINGS = {
  dwelling: "flat",
  bedrooms: 1,
  bathrooms: 1,
  sqm: 65,
  extras: {
    stairs: false, garden: false, garage: false,
    balcony: false, mudroom: false, laundryRoom: false
  },
  profile: "friendly",
  name: "",
  supplies: {
    allPurpose: true, vanish: true, toiletCleaner: true,
    cloths: true, mop: true, vacuum: true
  },
  setupComplete: false,
  runCount: 0,
  lastCompletedAt: 0
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    const profileMap = { beginner: "guided", casual: "friendly", pro: "brief", teen: "playful", houseguest: "preGuests" };
    if (profileMap[parsed.profile]) parsed.profile = profileMap[parsed.profile];
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      extras: { ...DEFAULT_SETTINGS.extras, ...(parsed.extras || {}) },
      supplies: { ...DEFAULT_SETTINGS.supplies, ...(parsed.supplies || {}) }
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

// ============================================================
// MODES
// ============================================================
const MODES = {
  quickie:  { id: "quickie",  label: "The Quickie",       color: "#D4A24E", emoji: "⚡",
              blurb: "speed run, the essentials",
              base: 30,  cap: 60,  roomBonus: 2,  bathBonus: 3,  mood: "energetic" },
  deepDive: { id: "deepDive", label: "The Deep Dive",     color: "#7E8BBE", emoji: "💜",
              blurb: "everything that matters",
              base: 120, cap: 240, roomBonus: 10, bathBonus: 12, mood: "focused" },
  shebang:  { id: "shebang",  label: "The Whole Shebang", color: "#B56B8A", emoji: "🌹",
              blurb: "every corner, every detail",
              base: 240, cap: 360, roomBonus: 18, bathBonus: 22, mood: "long-mix" }
};
const MODE_ORDER = ["quickie", "deepDive", "shebang"];

// ============================================================
// STEPS (unified library)
// ============================================================
const STEPS = [
  { id: "trash-first", emoji: "🗑️", illustration: "trash", room: "Kitchen + Bathroom", title: "Trash First",
    body: { quickie: "Grab a bag. Empty every bin. Collect any bottles and cans for pant. Tie it up by the front door." },
    tip: "The bathroom bin is always the forgotten one.",
    visibleIn: ["quickie"] },
  { id: "strip-beds", emoji: "🛏️", illustration: "bed", room: "Bedrooms", title: "Strip the Beds",
    body: {
      deepDive: "Strip bedding AND mattress protectors. Gather all towels. Start the wash at 60°C with Vanish — runs while you clean.",
      shebang:  "Strip bedding AND mattress protectors. Gather all towels. Start the wash at 60°C with Vanish — it needs to be done by the time you finish."
    },
    tip: "Get this running first so the laundry's ready when you are.",
    requires: ["vanish"], visibleIn: ["deepDive", "shebang"],
    skipFor: s => s.bedrooms === 0 },
  { id: "tidy-up", emoji: "🧺", illustration: "tidy", room: "Whole place", title: "Tidy Up",
    body: { quickie: "Everything back where it lives. Bedside stuff in drawers, pillows in their spots, shoes by the door, remotes on the table, chargers tucked away. Refill water bottles." },
    tip: "Clothes lying around? Fold them away or hide them in the dryer — no judgement.",
    visibleIn: ["quickie"] },
  { id: "declutter-trash", emoji: "🧹", illustration: "tidy", room: "Whole place", title: "Declutter & Trash",
    body: {
      deepDive: "Visible clutter out. Rubbish bagged. Pant collected. Then open drawers and cabinets — pull out anything that's drifted in there.",
      shebang:  "Visible clutter out. Rubbish bagged. Pant collected. Open every drawer and cabinet — pull out anything forgotten. Everything back where it lives."
    },
    tip: "If it's been sitting out for a week, it doesn't live there.",
    visibleIn: ["deepDive", "shebang"] },
  { id: "fridge-reset", emoji: "🧊", illustration: "fridge", room: "Kitchen", title: "Restock the Fridge",
    body: {
      deepDive: "Refill water bottles. Toss anything past it. Wipe down the fridge shelves. Canned food stays.",
      shebang:  "Refill water bottles. Toss anything past it. Wipe down every shelf AND the drawers. Canned food stays."
    },
    tip: "If it's smelling, it's not staying.",
    requires: ["cloths"], visibleIn: ["deepDive", "shebang"] },
  { id: "oven-appliances", emoji: "🔥", illustration: "oven", room: "Kitchen", title: "Oven & Appliances",
    body: { shebang: "Spray oven cleaner inside, leave it to sit 20 minutes. While it works: wipe the hob, kettle, microwave, hood. Wipe cabinet fronts. Come back and scrub the oven." },
    tip: "Hit the oven first — it needs the time.",
    requires: ["allPurpose", "cloths"], visibleIn: ["shebang"] },
  { id: "wipe-surfaces", emoji: "🧽", illustration: "wipe", room: "All rooms", title: "Wipe Surfaces",
    body: {
      quickie:  "Wet cloth with a bit of soap. All surfaces — tables, counters, windowsills. Then a dry tea towel pass. Start kitchen, end bathroom.",
      deepDive: "Bucket + Ajax. Every surface, room by room. Full appliance wipe: microwave, kettle, hood, hob. Tea towel dry. Glass cleaner on mirrors.",
      shebang:  "Bucket + Ajax. Every surface in order. Then door frame tops, skirting boards, lampshade tops. Dust the lampshades. Glass cleaner on mirrors."
    },
    tip: "Mirrors, light switches, door handles. The ones that get touched daily.",
    requires: ["allPurpose", "cloths"], visibleIn: ["quickie", "deepDive", "shebang"] },
  { id: "bathroom", emoji: "🚽", illustration: "droplet", room: "Bathroom", title: "Toilet & Shower",
    body: {
      quickie:  "Squirt cleaner in the bowl. Clear any hair from the shower. Let the cleaner sit. Toss all used cloths and tea towels in the wash.",
      deepDive: "Toilet cleaner in the bowl. Sponge sink + toilet exterior. Scrub the bowl thoroughly. Scrub the tile grout. Dry-wipe to a shine.",
      shebang:  "Toilet cleaner in the bowl. Sponge sink + toilet exterior. Scrub the bowl. Scrub the grout. Descale the shower head. Dry-wipe to a shine."
    },
    tip: "A dry wipe at the end makes the bathroom look 10x better.",
    requires: ["toiletCleaner", "cloths"], visibleIn: ["quickie", "deepDive", "shebang"] },
  { id: "stairs", emoji: "🪜", illustration: "stairs", room: "Stairs", title: "Stairs Vacuum",
    body: {
      quickie:  "Hoover the stairs top to bottom. Don't skip the edges where dust gathers.",
      deepDive: "Hoover the stairs top to bottom. Switch to the nozzle for the edges and the riser corners.",
      shebang:  "Hoover the stairs top to bottom. Nozzle on the edges and corners. Wipe the banister with a damp cloth."
    },
    tip: "Top to bottom — dust falls down, work with it.",
    requires: ["vacuum"], requiresExtra: "stairs",
    visibleIn: ["quickie", "deepDive", "shebang"] },
  { id: "vacuum", emoji: "🌀", illustration: "swirl", room: "All rooms", title: "Vacuum",
    body: {
      quickie:  "Every room, fast. Don't move furniture. Hit every floor, carpet, and rug you can see.",
      deepDive: "All floors, carpets, rugs. Switch to the nozzle for baseboards. Corners, edges, behind doors.",
      shebang:  "All floors, carpets, rugs. Nozzle on baseboards and corners. Under the sofa, under the bed. Upholstery brush on the couch cushions."
    },
    tip: "Speed over perfection. If it looks clean from standing height, you're good.",
    requires: ["vacuum"], visibleIn: ["quickie", "deepDive", "shebang"] },
  { id: "mudroom", emoji: "🥾", illustration: "mudroom", room: "Mudroom", title: "Mudroom Reset",
    body: {
      deepDive: "Boots lined up. Coats on hooks. Sweep AND mop. Wipe the bench.",
      shebang:  "Boots lined up. Coats on hooks. Sweep, mop, wipe the bench. Knock down any cobwebs in the corners."
    },
    tip: "Anything not currently in use goes in the cupboard.",
    requiresExtra: "mudroom", visibleIn: ["deepDive", "shebang"] },
  { id: "mop-floors", emoji: "💧", illustration: "mop", room: "Hard floors", title: "Mop Floors",
    body: {
      deepDive: "Warm water + wood floor treatment. Bedrooms → living → kitchen → bathroom. Kitchen and bathroom last. Get the corners.",
      shebang:  "Warm water + wood floor treatment. Two passes on the high-traffic floors. Kitchen and bathroom last."
    },
    tip: "Always finish with the room nearest the door so you don't walk on wet floors.",
    requires: ["mop"], visibleIn: ["deepDive", "shebang"] },
  { id: "windows-details", emoji: "🪟", illustration: "windows", room: "Whole place", title: "Windows & Details",
    body: { shebang: "Window glass on the inside, every room. Wipe down the blinds. Dust light bulbs and fixtures. Wipe the remotes and the light switches." },
    tip: "The details are what people notice without knowing why.",
    requires: ["cloths"], visibleIn: ["shebang"] },
  { id: "garden", emoji: "🍃", illustration: "garden", room: "Outdoors", title: "Garden / Terrace",
    body: {
      deepDive: "Sweep the terrace. Wipe down outdoor furniture. Clear pots and plant trays of debris.",
      shebang:  "Sweep terrace. Wipe outdoor furniture. Tidy pots and trays. Hose down the surface if it's grimy."
    },
    tip: "Outdoor dust travels indoors. Worth doing.",
    requiresExtra: "garden", visibleIn: ["deepDive", "shebang"] },
  { id: "garage", emoji: "🚗", illustration: "garage", room: "Garage", title: "Garage Sweep",
    body: {
      deepDive: "Sweep the garage floor. Knock down cobwebs. Anything that doesn't belong here goes.",
      shebang:  "Sweep the garage floor end to end. Knock down cobwebs in the corners. Bin anything that doesn't live here."
    },
    tip: "Cobwebs love garage corners. Look up.",
    requiresExtra: "garage", visibleIn: ["deepDive", "shebang"] },
  { id: "balcony", emoji: "🌿", illustration: "balcony", room: "Balcony", title: "Balcony",
    body: {
      quickie:  "Quick sweep. Wipe the railing.",
      deepDive: "Sweep. Wipe railing. Wipe down outdoor furniture and any plant trays.",
      shebang:  "Sweep. Wipe railing. Outdoor furniture wiped. Plant trays sorted. Hose the surface if needed."
    },
    tip: "Easy win. Five minutes max in The Quickie.",
    requiresExtra: "balcony", visibleIn: ["quickie", "deepDive", "shebang"] },
  { id: "laundry-room", emoji: "🧺", illustration: "appliances", room: "Laundry room", title: "Laundry Room",
    body: {
      deepDive: "Wipe the washer, dryer, and surrounding shelves. Empty the lint trap. Sweep and mop.",
      shebang:  "Wipe the washer, dryer, shelves. Empty the lint trap. Sweep, mop, knock down cobwebs."
    },
    tip: "The lint trap. Always.",
    requiresExtra: "laundryRoom", visibleIn: ["deepDive", "shebang"] },
  { id: "make-bed-quickie", emoji: "🛏️", illustration: "bed", room: "Bedroom", title: "Make the Bed",
    body: { quickie: "Straighten the duvet, fluff the pillows. Two minutes — changes the whole room." },
    tip: "Pull the duvet tight from the far side first, then smooth toward you.",
    visibleIn: ["quickie"] },
  { id: "make-beds-laundry", emoji: "🛏️", illustration: "bed", room: "Bedrooms", title: "Beds & Laundry",
    body: {
      deepDive: "Wash → dryer. Mattress protectors back on. Fresh sheets, tucked tight at the corners. Pillows fluffed and aligned.",
      shebang:  "Wash → dryer. Mattress protectors back on. Fresh sheets with hospital corners. Pillows fluffed."
    },
    tip: "Tuck the bottom sheet hospital-style — corners at 45°.",
    visibleIn: ["deepDive", "shebang"] },
  { id: "finishing-touch", emoji: "🕯️", illustration: "candle", room: "Living room", title: "Finishing Touch",
    body: { quickie: "Light a candle if you're feeling cute." },
    tip: "Bonus round — not a requirement.",
    bonus: true, visibleIn: ["quickie"] },
  { id: "walkthrough", emoji: "🏁", illustration: "walkthrough", room: "Whole place", title: "Final Walkthrough",
    body: {
      deepDive: "Trash out. Final lap — look at every room like a guest would. Lock up.",
      shebang:  "Trash out. Final lap. Walk through every room like a guest checking in. Lock up."
    },
    tip: "Imagine you're the guest checking in.",
    visibleIn: ["deepDive", "shebang"] }
];

// ============================================================
// ENGINE
// ============================================================
function sizeBand(sqm) {
  if (sqm <= 50) return "S";
  if (sqm <= 110) return "M";
  return "L";
}

function estimateMinutes(modeId, s) {
  const m = MODES[modeId];
  const sqmFactor = 1 + 0.6 * (s.sqm - 60) / 60;
  let minutes = m.base * Math.max(0.6, Math.min(2.5, sqmFactor));
  minutes += Math.max(0, s.bedrooms - 1) * m.roomBonus;
  minutes += Math.max(0, s.bathrooms - 1) * m.bathBonus;
  const extrasBonusBase = modeId === "quickie" ? 4 : modeId === "deepDive" ? 10 : 15;
  for (const k of ["stairs", "garden", "garage", "balcony", "mudroom", "laundryRoom"]) {
    if (s.extras[k]) minutes += extrasBonusBase;
  }
  if (s.dwelling === "house") minutes *= 1.1;
  else if (s.dwelling === "townhouse") minutes *= 1.05;
  minutes = Math.min(m.cap, Math.max(m.base * 0.6, minutes));
  return Math.round(minutes / 5) * 5;
}

function isQuickieOver(modeId, s) {
  if (modeId !== "quickie") return false;
  const m = MODES.quickie;
  const sqmFactor = 1 + 0.6 * (s.sqm - 60) / 60;
  const raw = m.base * Math.max(0.6, Math.min(2.5, sqmFactor))
    + Math.max(0, s.bedrooms - 1) * m.roomBonus
    + Math.max(0, s.bathrooms - 1) * m.bathBonus;
  return raw > m.cap;
}

const PROFILES = {
  guided:    { label: "Guided",     blurb: "Walks you through, with the reasoning.",   tipDefault: true,  tone: "explain" },
  friendly:  { label: "Friendly",   blurb: "Default. Direct, warm, no fluff.",          tipDefault: false, tone: "default" },
  brief:     { label: "Brief",      blurb: "Just the commands, no extras.",             tipDefault: null,  tone: "short" },
  playful:   { label: "Playful",    blurb: "Snappier copy and a lighter vibe.",         tipDefault: false, tone: "playful" },
  preGuests: { label: "Pre-guests", blurb: "Quick refresh before company arrives.",     tipDefault: false, tone: "guest" }
};

function getBody(step, modeId, profile) {
  const raw = step.body && step.body[modeId];
  if (!raw) return null;
  const tone = (PROFILES[profile] && PROFILES[profile].tone) || "default";
  if (tone === "short") return raw.split(/(?<=\.)\s/)[0];
  return raw;
}

function applySupplyAdaptation(body, step, settings) {
  if (!body) return body;
  if (step.requires && step.requires.includes("vanish") && !settings.supplies.vanish) {
    body = body.replace(/with Vanish/g, "— any stain treatment you've got");
  }
  if (step.requires && step.requires.includes("allPurpose") && !settings.supplies.allPurpose) {
    body = body.replace(/\+ Ajax/g, "+ dish soap").replace(/with Ajax/g, "with dish soap and water");
  }
  return body;
}

function missingSupplies(step, settings) {
  if (!step.requires) return [];
  return step.requires.filter(r => !settings.supplies[r]);
}

function shouldSkipStep(step, modeId, settings) {
  if (step.skipFor && step.skipFor(settings)) return true;
  if (step.requiresExtra && !settings.extras[step.requiresExtra]) return true;
  if (step.requires && step.requires.includes("vacuum") && !settings.supplies.vacuum) return true;
  if (step.requires && step.requires.includes("mop") && !settings.supplies.mop) return true;
  if (settings.profile === "preGuests") {
    if (["oven-appliances", "windows-details", "garage", "mop-floors"].includes(step.id)) return true;
  }
  if (settings.bedrooms === 0 && ["strip-beds", "make-beds-laundry", "make-bed-quickie"].includes(step.id)) return true;
  return false;
}

function getVisibleSteps(modeId, settings) {
  return STEPS.filter(st => st.visibleIn.includes(modeId) && !shouldSkipStep(st, modeId, settings));
}

function materialize(step, modeId, settings) {
  let body = getBody(step, modeId, settings.profile);
  body = applySupplyAdaptation(body, step, settings);
  if (body && settings.bedrooms > 1) {
    body = body.replace(/the bed\b/g, "the beds")
               .replace(/all the bedding/g, `bedding from all ${settings.bedrooms} beds`);
  }
  return {
    id: step.id,
    emoji: step.emoji,
    illustration: step.illustration,
    room: step.room,
    title: step.title,
    body,
    tip: step.tip,
    bonus: !!step.bonus,
    missing: missingSupplies(step, settings)
  };
}

function modeMissingSupplies(modeId, settings) {
  const visible = getVisibleSteps(modeId, settings);
  const set = new Set();
  for (const st of visible) for (const k of missingSupplies(st, settings)) set.add(k);
  return [...set];
}

const SUPPLY_LABELS = {
  allPurpose: "All-purpose cleaner",
  vanish: "Vanish (stain remover)",
  toiletCleaner: "Toilet cleaner",
  cloths: "Microfibre cloths",
  mop: "Mop",
  vacuum: "Vacuum"
};
const EXTRA_LABELS = {
  stairs: "Stairs",
  garden: "Garden / terrace",
  garage: "Garage",
  balcony: "Balcony",
  mudroom: "Mudroom / entryway",
  laundryRoom: "Laundry room"
};

function fmtTime(s) {
  if (s < 0) s = 0;
  const m = Math.floor(s / 60), r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

// ============================================================
// ILLUSTRATIONS
// Note: index.html holds the full implementations of all 18 kinds.
// This reference file imports the same JSX-style structure.
// See index.html for the SMIL <animate> definitions.
// ============================================================
function Illustration({ kind, color }) {
  // Identical to index.html's switch. Trimmed here for brevity —
  // copy the full implementation from index.html when porting.
  const common = { width: 140, height: 90, viewBox: "0 0 140 90", fill: "none" };
  // Each `kind` in {trash, tidy, wipe, droplet, swirl, bed, candle,
  //                  oven, windows, appliances, mop, fridge, details,
  //                  walkthrough, stairs, garden, garage, balcony, mudroom}
  // renders inline SVG with SMIL animations. See index.html.
  return <svg {...common} />;
}

// ============================================================
// SHARED UI
// ============================================================
function TimerChip({ secondsLeft, running, onToggle, color }) {
  const expired = secondsLeft <= 0;
  const cls = "timer-chip" + (expired ? " expired" : "") + (running ? " running" : " paused");
  return (
    <button className={cls} onClick={onToggle} aria-label={running ? "Pause timer" : "Resume timer"}>
      <span className="timer-dot" style={{ background: color }} />
      <span className="timer-text">{fmtTime(secondsLeft)}</span>
    </button>
  );
}

function ProgressBar({ total, index, color }) {
  return (
    <div className="progress">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i}
          className={"seg" + (i <= index ? " on" : "")}
          style={i <= index ? { background: color } : undefined} />
      ))}
    </div>
  );
}

function SlideToStart({ color, onComplete }) {
  const trackRef = useRef(null);
  const [thumbX, setThumbX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const stateRef = useRef({ startX: 0, startThumb: 0, maxX: 0, fired: false });

  const begin = useCallback((clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - 56 - 8);
    stateRef.current = { startX: clientX, startThumb: thumbX, maxX, fired: false };
    setDragging(true);
  }, [thumbX]);
  const move = useCallback((clientX) => {
    const s = stateRef.current;
    if (s.fired) return;
    let nx = s.startThumb + (clientX - s.startX);
    if (nx < 0) nx = 0;
    if (nx > s.maxX) nx = s.maxX;
    setThumbX(nx);
  }, []);
  const end = useCallback(() => {
    const s = stateRef.current;
    setDragging(false);
    if (thumbX >= s.maxX * 0.85 && !s.fired) {
      s.fired = true;
      setThumbX(s.maxX);
      setTimeout(() => onComplete(), 160);
    } else {
      setThumbX(0);
    }
  }, [thumbX, onComplete]);

  useEffect(() => {
    if (!dragging) return;
    const onMM = e => move(e.clientX);
    const onMU = () => end();
    const onTM = e => { if (e.touches[0]) move(e.touches[0].clientX); };
    const onTE = () => end();
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", onMU);
    window.addEventListener("touchmove", onTM, { passive: true });
    window.addEventListener("touchend", onTE);
    return () => {
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", onMU);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend", onTE);
    };
  }, [dragging, move, end]);

  const maxX = stateRef.current.maxX;
  const pct = maxX ? thumbX / maxX : 0;
  return (
    <div className="slide-track" ref={trackRef} style={{ borderColor: color }}>
      <div className="slide-fill" style={{ width: `${pct * 100}%`, background: color }} />
      <div className="slide-hint" style={{ opacity: 1 - pct }}>Slide to start →</div>
      <div className="slide-thumb"
        style={{
          transform: `translateX(${thumbX}px)`,
          transition: dragging ? "none" : "transform 0.3s ease",
          background: color
        }}
        onMouseDown={e => { e.preventDefault(); begin(e.clientX); }}
        onTouchStart={e => { if (e.touches[0]) begin(e.touches[0].clientX); }}>
        <span>→</span>
      </div>
    </div>
  );
}

// ============================================================
// SETUP FLOW
// ============================================================
const SETUP_STEPS = ["welcome", "dwelling", "bedrooms", "bathrooms", "size", "extras", "profile", "name", "supplies", "done"];

function Setup({ initial, onComplete }) {
  const [draft, setDraft] = useState(initial);
  const [step, setStep] = useState(0);

  const patch = p => setDraft({ ...draft, ...p });
  const patchExtras = p => setDraft({ ...draft, extras: { ...draft.extras, ...p } });
  const patchSupplies = p => setDraft({ ...draft, supplies: { ...draft.supplies, ...p } });

  const next = () => {
    if (step + 1 >= SETUP_STEPS.length) { onComplete({ ...draft, setupComplete: true }); return; }
    setStep(step + 1);
  };
  const back = () => step > 0 && setStep(step - 1);

  const key = SETUP_STEPS[step];
  const nextLabel = key === "done" ? "Pick a mode →" : "Continue →";

  let content;
  if (key === "welcome") {
    content = (
      <div className="setup-step fade-up" key={key}>
        <div className="launch-emoji" style={{ textAlign: "center" }}>🧹</div>
        <h2>Welcome to The Clean Machine.</h2>
        <p className="lede">Tell us about your place. Takes 30 seconds. The app then knows exactly what to do — and when you're done.</p>
      </div>
    );
  } else if (key === "dwelling") {
    const rows = [
      ["flat", "🏢", "Flat / apartment", "Single floor. No outdoor area unless you've got a balcony."],
      ["house", "🏡", "House", "Multiple floors, outdoor space, possibly a garage."],
      ["townhouse", "🏘️", "Townhouse", "Multi-level but tight. Probably stairs, maybe a small garden."]
    ];
    content = (
      <div className="setup-step fade-up" key={key}>
        <h2>What kind of place?</h2>
        <p className="lede">Houses and flats need slightly different work.</p>
        <div className="big-card-grid">
          {rows.map(([id, e, t, b]) => {
            const selected = draft.dwelling === id;
            return (
              <button key={id} className={"big-card" + (selected ? " selected" : "")}
                onClick={() => {
                  const ex = { ...draft.extras };
                  if (id === "house") { ex.stairs = true; ex.garden = true; ex.balcony = false; }
                  else if (id === "townhouse") { ex.stairs = true; ex.garden = false; ex.balcony = false; }
                  else { ex.stairs = false; ex.garden = false; ex.balcony = true; }
                  setDraft({ ...draft, dwelling: id, extras: ex });
                }}>
                <div className="big-card-emoji">{e}</div>
                <div className="big-card-title">{t}</div>
                <div className="big-card-blurb">{b}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  } else if (key === "bedrooms") {
    content = (
      <div className="setup-step fade-up" key={key}>
        <h2>How many bedrooms?</h2>
        <p className="lede">0 if it's a studio.</p>
        <div className="stepper">
          <button onClick={() => patch({ bedrooms: Math.max(0, draft.bedrooms - 1) })}>−</button>
          <div className="stepper-value">{draft.bedrooms}</div>
          <button onClick={() => patch({ bedrooms: Math.min(6, draft.bedrooms + 1) })}>+</button>
        </div>
      </div>
    );
  } else if (key === "bathrooms") {
    content = (
      <div className="setup-step fade-up" key={key}>
        <h2>How many bathrooms?</h2>
        <p className="lede">Every extra bathroom adds a bathroom round.</p>
        <div className="stepper">
          <button onClick={() => patch({ bathrooms: Math.max(1, draft.bathrooms - 1) })}>−</button>
          <div className="stepper-value">{draft.bathrooms}</div>
          <button onClick={() => patch({ bathrooms: Math.min(4, draft.bathrooms + 1) })}>+</button>
        </div>
      </div>
    );
  } else if (key === "size") {
    content = (
      <div className="setup-step fade-up" key={key}>
        <h2>How big is it?</h2>
        <p className="lede">Square metres. Drives how much time each mode actually needs.</p>
        <div className="slider-wrap">
          <div className="sqm-row">
            <div><span className="sqm-value">{draft.sqm}</span><span className="sqm-unit"> m²</span></div>
            <div className="sqm-band">{sizeBand(draft.sqm)} place</div>
          </div>
          <input type="range" min={20} max={300} step={5} value={draft.sqm}
            onChange={e => patch({ sqm: parseInt(e.target.value, 10) })} />
        </div>
      </div>
    );
  } else if (key === "extras") {
    content = (
      <div className="setup-step fade-up" key={key}>
        <h2>Any of these?</h2>
        <p className="lede">Anything you tick gets its own step.</p>
        <div className="chip-grid">
          {Object.keys(EXTRA_LABELS).map(k => {
            const on = !!draft.extras[k];
            return (
              <button key={k} className={"chip" + (on ? " on" : "")}
                onClick={() => patchExtras({ [k]: !on })}>
                <span className="chip-mark">{on ? "✓" : ""}</span>
                {EXTRA_LABELS[k]}
              </button>
            );
          })}
        </div>
      </div>
    );
  } else if (key === "profile") {
    content = (
      <div className="setup-step fade-up" key={key}>
        <h2>Who's using the app?</h2>
        <p className="lede">Sets the tone. You can change this any time.</p>
        <div className="big-card-grid">
          {["guided", "friendly", "brief", "playful", "preGuests"].map(k => {
            const p = PROFILES[k];
            const selected = draft.profile === k;
            return (
              <button key={k} className={"big-card" + (selected ? " selected" : "")}
                onClick={() => patch({ profile: k })}>
                <div className="big-card-title">{p.label}</div>
                <div className="big-card-blurb">{p.blurb}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  } else if (key === "name") {
    content = (
      <div className="setup-step fade-up" key={key}>
        <h2>What should I call you?</h2>
        <p className="lede">Optional. Used to make the launch screen a bit more personal.</p>
        <input type="text" className="name-input" placeholder="Your name (skip to leave blank)"
          value={draft.name} maxLength={30}
          onChange={e => patch({ name: e.target.value })} />
      </div>
    );
  } else if (key === "supplies") {
    content = (
      <div className="setup-step fade-up" key={key}>
        <h2>What have you got?</h2>
        <p className="lede">Untick anything you don't own. We'll work around it.</p>
        <div className="chip-grid">
          {Object.keys(SUPPLY_LABELS).map(k => {
            const on = !!draft.supplies[k];
            return (
              <button key={k} className={"chip" + (on ? " on" : "")}
                onClick={() => patchSupplies({ [k]: !on })}>
                <span className="chip-mark">{on ? "✓" : ""}</span>
                {SUPPLY_LABELS[k]}
              </button>
            );
          })}
        </div>
      </div>
    );
  } else if (key === "done") {
    const greeting = draft.name ? `You're set, ${draft.name}.` : "You're set.";
    content = (
      <div className="setup-step fade-up" key={key}>
        <div className="launch-emoji" style={{ textAlign: "center" }}>✨</div>
        <h2>{greeting}</h2>
        <p className="lede">Pick a mode and I'll walk you through it.</p>
      </div>
    );
  }

  return (
    <div className="screen setup">
      <div className="setup-progress">
        {SETUP_STEPS.map((_, i) => <span key={i} className={"seg" + (i <= step ? " on" : "")} />)}
      </div>
      {content}
      <div className="setup-foot">
        {step > 0 && <button className="setup-back" onClick={back}>← Back</button>}
        {key === "name" && <button className="setup-skip" onClick={() => { patch({ name: "" }); next(); }}>Skip</button>}
        <button className="setup-next" onClick={next}>{nextLabel}</button>
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS SCREEN
// ============================================================
function SettingsScreen({ initial, onSave, onCancel }) {
  const [draft, setDraft] = useState(initial);
  const patch = p => setDraft({ ...draft, ...p });
  const patchExtras = p => setDraft({ ...draft, extras: { ...draft.extras, ...p } });
  const patchSupplies = p => setDraft({ ...draft, supplies: { ...draft.supplies, ...p } });

  return (
    <div className="screen settings fade-up">
      <div className="header">
        <button className="back" onClick={onCancel}>← Back</button>
        <h2>Settings</h2>
      </div>

      <div className="section">
        <div className="section-label">Place</div>
        <div className="big-card-grid">
          {[["flat", "Flat / apartment"], ["house", "House"], ["townhouse", "Townhouse"]].map(([id, t]) => (
            <button key={id} className={"big-card" + (draft.dwelling === id ? " selected" : "")}
              onClick={() => patch({ dwelling: id })}>
              <div className="big-card-title">{t}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-label">Rooms</div>
        <div className="stepper">
          <button onClick={() => patch({ bedrooms: Math.max(0, draft.bedrooms - 1) })}>−</button>
          <div className="stepper-value">{draft.bedrooms} bed{draft.bedrooms === 1 ? "" : "s"}</div>
          <button onClick={() => patch({ bedrooms: Math.min(6, draft.bedrooms + 1) })}>+</button>
        </div>
        <div className="stepper">
          <button onClick={() => patch({ bathrooms: Math.max(1, draft.bathrooms - 1) })}>−</button>
          <div className="stepper-value">{draft.bathrooms} bath{draft.bathrooms === 1 ? "" : "s"}</div>
          <button onClick={() => patch({ bathrooms: Math.min(4, draft.bathrooms + 1) })}>+</button>
        </div>
      </div>

      <div className="section">
        <div className="section-label">Size</div>
        <div className="sqm-row">
          <div><span className="sqm-value">{draft.sqm}</span><span className="sqm-unit"> m²</span></div>
          <div className="sqm-band">{sizeBand(draft.sqm)} place</div>
        </div>
        <input type="range" min={20} max={300} step={5} value={draft.sqm}
          onChange={e => patch({ sqm: parseInt(e.target.value, 10) })} />
      </div>

      <div className="section">
        <div className="section-label">Extras</div>
        <div className="chip-grid">
          {Object.keys(EXTRA_LABELS).map(k => {
            const on = !!draft.extras[k];
            return (
              <button key={k} className={"chip" + (on ? " on" : "")}
                onClick={() => patchExtras({ [k]: !on })}>
                <span className="chip-mark">{on ? "✓" : ""}</span>{EXTRA_LABELS[k]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="section">
        <div className="section-label">Profile</div>
        <div className="big-card-grid">
          {["guided", "friendly", "brief", "playful", "preGuests"].map(k => (
            <button key={k} className={"big-card" + (draft.profile === k ? " selected" : "")}
              onClick={() => patch({ profile: k })}>
              <div className="big-card-title">{PROFILES[k].label}</div>
              <div className="big-card-blurb">{PROFILES[k].blurb}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-label">Name</div>
        <input type="text" className="name-input" placeholder="Your name (optional)"
          value={draft.name} maxLength={30}
          onChange={e => patch({ name: e.target.value })} />
      </div>

      <div className="section">
        <div className="section-label">Supplies</div>
        <div className="chip-grid">
          {Object.keys(SUPPLY_LABELS).map(k => {
            const on = !!draft.supplies[k];
            return (
              <button key={k} className={"chip" + (on ? " on" : "")}
                onClick={() => patchSupplies({ [k]: !on })}>
                <span className="chip-mark">{on ? "✓" : ""}</span>{SUPPLY_LABELS[k]}
              </button>
            );
          })}
        </div>
      </div>

      <button className="primary-btn save-btn" style={{ background: "#E8E4DC" }} onClick={() => onSave(draft)}>Save</button>
    </div>
  );
}

// ============================================================
// MODE PICKER
// ============================================================
function ModePicker({ settings, onSelect, onOpenSettings }) {
  const visibleModes = MODE_ORDER.filter(id => !(settings.profile === "preGuests" && id === "shebang"));
  const greeting = settings.name ? `Right, ${settings.name}.` : "Pick your pace.";
  return (
    <div className="screen mode-picker fade-up">
      <div className="top-row">
        <div />
        <button className="gear-btn" onClick={onOpenSettings} aria-label="Settings">⚙</button>
      </div>
      <header className="hero">
        <h1>The Clean Machine</h1>
        <p className="sub">{greeting} The app tells you what to do — no thinking required.</p>
      </header>
      <div className="mode-list">
        {visibleModes.map(id => {
          const m = MODES[id];
          const mins = estimateMinutes(id, settings);
          const steps = getVisibleSteps(id, settings).length;
          return (
            <button key={id} className="mode-card" style={{ borderColor: m.color }}
              onClick={() => onSelect(id)}>
              <div className="mode-card-top">
                <span className="mode-label" style={{ color: m.color }}>{m.label}</span>
                <span className="mode-duration">~{mins} min · {steps} steps</span>
              </div>
              <span className="mode-blurb">{m.blurb}</span>
              <span className="mode-arrow" style={{ color: m.color }}>→</span>
            </button>
          );
        })}
      </div>
      <footer className="picker-foot">No accounts. No ads. Just clean.</footer>
    </div>
  );
}

// ============================================================
// LAUNCH
// ============================================================
function ModeLaunch({ mode, settings, onStart, onBack }) {
  const steps = getVisibleSteps(mode.id, settings).length;
  const mins = estimateMinutes(mode.id, settings);
  const capped = isQuickieOver(mode.id, settings);
  const missing = modeMissingSupplies(mode.id, settings);
  const address = settings.name ? `Right, ${settings.name}. ` : "";

  return (
    <div className="screen launch fade-up">
      <button className="back" onClick={onBack}>← Back</button>
      <div className="launch-body">
        <div className="launch-emoji">{mode.emoji}</div>
        <h2>{address}{steps} steps. {mins} minutes. <span style={{ color: mode.color }}>You got this.</span></h2>
        <div className="launch-time" style={{ color: mode.color }}>{fmtTime(mins * 60)}</div>
        {capped && <p className="launch-cap">Quickie maxes out at {mode.cap} min. For a place this size, Standard is more realistic.</p>}
        {missing.length > 0 && (
          <div className="pre-warn" style={{ borderColor: mode.color }}>
            <div className="pre-warn-title" style={{ color: mode.color }}>Heads up — adapted because you're missing:</div>
            <ul>{missing.map(k => <li key={k}>{SUPPLY_LABELS[k]}</li>)}</ul>
          </div>
        )}
        <SlideToStart color={mode.color} onComplete={onStart} />
        <p className="launch-foot">Drag the thumb across to begin.</p>
      </div>
    </div>
  );
}

// ============================================================
// TASK CARD
// ============================================================
function TaskCard({ step, stepIndex, total, color, animKey, settings, secondsLeft, timerRunning, onToggleTimer, onNext }) {
  const isLast = stepIndex === total - 1;
  const profile = PROFILES[settings.profile] || PROFILES.friendly;
  const tipEnabled = profile.tone !== "short";
  const tipDefaultOpen = profile.tipDefault === true;
  const [expandedTip, setExpandedTip] = useState(tipDefaultOpen);

  useEffect(() => { setExpandedTip(tipDefaultOpen); }, [step.id, tipDefaultOpen]);

  return (
    <div className="screen task-card-screen">
      <div className="task-top">
        <ProgressBar total={total} index={stepIndex} color={color} />
        <TimerChip color={color} secondsLeft={secondsLeft} running={timerRunning} onToggle={onToggleTimer} />
      </div>
      <div key={animKey} className="task-card fade-up">
        <span className="room-tag" style={{ borderColor: color, color }}>{step.room}</span>
        <div className="big-emoji" aria-hidden="true">{step.emoji}</div>
        <Illustration kind={step.illustration} color={color} />
        {step.bonus && <span className="bonus-tag" style={{ borderColor: color, color }}>bonus round</span>}
        <h2 className="step-title">{step.title}</h2>
        <p className="step-body">{step.body}</p>
        {step.missing && step.missing.length > 0 && (
          <div className="supply-warn" style={{ borderColor: color }}>
            <span className="supply-warn-strong" style={{ color }}>Missing: </span>
            {step.missing.map(k => SUPPLY_LABELS[k]).join(", ")}. Adapted accordingly.
          </div>
        )}
        {tipEnabled && (
          <button className={"tip-pill" + (expandedTip ? " open" : "")}
            onClick={() => setExpandedTip(!expandedTip)}
            style={{ borderColor: color }}>
            <span style={{ color }}>💡 Tip</span>
            {expandedTip && <span className="tip-body"> — {step.tip}</span>}
          </button>
        )}
      </div>
      <button className="primary-btn" style={{ background: color }} onClick={onNext}>
        {isLast ? "Finish ✓" : "Done →"}
      </button>
    </div>
  );
}

// ============================================================
// DONE SCREEN
// ============================================================
function DoneScreen({ settings, mode, stepCount, minutesUsed, onRestart }) {
  const name = settings.name;
  const profile = settings.profile;
  let headline, subline;
  if (profile === "playful") {
    headline = name ? `Top form, ${name} 💪` : "Top form 💪";
    subline = `That's a wrap on ${mode.label}.`;
  } else if (profile === "brief") {
    headline = "Solid run.";
    subline = `${mode.label} complete.`;
  } else if (profile === "preGuests") {
    headline = "Ready for the next guest.";
    subline = "Place looks fresh.";
  } else if (profile === "guided") {
    headline = name ? `Brilliant, ${name}.` : "Brilliant.";
    subline = `You ran a full ${mode.label} from start to finish.`;
  } else {
    headline = name ? `Nice work, ${name}.` : "Done.";
    subline = `You ran ${mode.label} from start to finish.`;
  }

  return (
    <div className="screen done-screen fade-up">
      <div className="done-emoji">✨</div>
      <h2>{headline}</h2>
      <p>{subline} Enjoy the place.</p>
      <div className="done-stats">
        <div className="stat-chip"><span className="stat-value" style={{ color: mode.color }}>{stepCount}</span><span className="stat-label">steps</span></div>
        <div className="stat-chip"><span className="stat-value" style={{ color: mode.color }}>{minutesUsed}</span><span className="stat-label">minutes</span></div>
        <div className="stat-chip"><span className="stat-value" style={{ color: mode.color }}>{settings.sqm}</span><span className="stat-label">m² done</span></div>
      </div>
      <button className="primary-btn" style={{ background: mode.color }} onClick={onRestart}>Pick another mode</button>
    </div>
  );
}

// ============================================================
// APP
// ============================================================
export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [phase, setPhase] = useState("picker");  // setup | picker | settings | launch | running | done
  const [mode, setMode] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const startedAt = useRef(0);
  const initialSeconds = useRef(0);

  useEffect(() => {
    if (!settings.setupComplete) setPhase("setup");
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning, secondsLeft]);

  const persist = s => { setSettings(s); saveSettings(s); };

  const selectMode = id => {
    const m = MODES[id];
    const mins = estimateMinutes(id, settings);
    initialSeconds.current = mins * 60;
    setMode(m);
    setSecondsLeft(mins * 60);
    setTimerRunning(false);
    setStepIndex(0);
    setAnimKey(k => k + 1);
    setPhase("launch");
  };
  const backToPicker = () => { setPhase("picker"); setMode(null); setTimerRunning(false); };
  const startRun = () => { setPhase("running"); setTimerRunning(true); startedAt.current = Date.now(); };
  const next = () => {
    const visible = getVisibleSteps(mode.id, settings);
    setAnimKey(k => k + 1);
    if (stepIndex + 1 >= visible.length) {
      setPhase("done");
      setTimerRunning(false);
      persist({ ...settings, runCount: (settings.runCount || 0) + 1, lastCompletedAt: Date.now() });
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  if (phase === "setup") return <Setup initial={settings} onComplete={s => { persist(s); setPhase("picker"); }} />;
  if (phase === "settings") return <SettingsScreen initial={settings} onSave={s => { persist(s); setPhase("picker"); }} onCancel={() => setPhase("picker")} />;
  if (phase === "picker" || !mode) return <ModePicker settings={settings} onSelect={selectMode} onOpenSettings={() => setPhase("settings")} />;
  if (phase === "launch") return <ModeLaunch mode={mode} settings={settings} onStart={startRun} onBack={backToPicker} />;
  if (phase === "done") {
    const minutesUsed = Math.max(0, Math.round((initialSeconds.current - secondsLeft) / 60));
    const visibleNow = getVisibleSteps(mode.id, settings);
    return <DoneScreen mode={mode} settings={settings} stepCount={visibleNow.length} minutesUsed={minutesUsed} onRestart={backToPicker} />;
  }

  const visible = getVisibleSteps(mode.id, settings);
  const step = visible[stepIndex];
  if (!step) {
    const minutesUsed = Math.max(0, Math.round((initialSeconds.current - secondsLeft) / 60));
    return <DoneScreen mode={mode} settings={settings} stepCount={visible.length} minutesUsed={minutesUsed} onRestart={backToPicker} />;
  }
  const materialized = materialize(step, mode.id, settings);
  return (
    <TaskCard
      step={materialized}
      stepIndex={stepIndex}
      total={visible.length}
      color={mode.color}
      animKey={animKey}
      settings={settings}
      secondsLeft={secondsLeft}
      timerRunning={timerRunning}
      onToggleTimer={() => setTimerRunning(v => !v)}
      onNext={next}
    />
  );
}
