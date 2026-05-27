// The Clean Machine — single-component React app
// Mobile-first cleaning guide. Four modes: Quickie, Standard, Thorough, Deep Clean.
// Standalone JSX reference — runs identically to the inline build in index.html.

import React, { useState, useEffect, useRef, useCallback } from "react";

// ---------- Data ----------

const MODES = {
  quickie: {
    label: "The Quickie",
    duration: "30 min",
    blurb: "speed run, the essentials",
    color: "#D4A24E",
    layout: "card",
    timerSeconds: 30 * 60,
    steps: [
      {
        emoji: "🗑️",
        title: "Trash First",
        body: "Grab a bag. Empty all bins, collect any bottles and cans for pant. Tie it up by the front door.",
        tip: "Check the bathroom bin — always the forgotten one.",
        illustration: "trash",
      },
      {
        emoji: "🧺",
        title: "Tidy Up",
        body: "Everything back where it lives. Bedside items in drawers, pillows back in their spots, shoes by the door, remotes on the table, chargers tucked away. Refill water bottles and toss any expired food from the fridge.",
        tip: "Clothes lying around? Fold them away or hide them in the dryer — no judgement.",
        illustration: "tidy",
      },
      {
        emoji: "🧽",
        title: "Wipe Down",
        body: "Wet cloth with a bit of soap. All surfaces — tables, counters, windowsills. Then go over everything with a dry tea towel for a clean finish. Start kitchen, end bathroom.",
        tip: "Don't forget mirrors, light switches, and door handles.",
        illustration: "wipe",
      },
      {
        emoji: "🚽",
        title: "Toilet & Shower",
        body: "Squirt cleaner in the bowl. Clear any hair from the shower cabin. Let the cleaner sit while you move on. Toss all used cloths and tea towels in the washing machine — you're done with them.",
        tip: "A dry wipe after makes the bathroom look 10x better.",
        illustration: "droplet",
      },
      {
        emoji: "🌀",
        title: "Quick Vacuum",
        body: "Every room, but fast. Don't move furniture — just hit all the floors, carpets, and rugs you can see. Get the corners if they look dusty.",
        tip: "Speed over perfection. If it looks clean from standing height, you're good.",
        illustration: "swirl",
      },
      {
        emoji: "🛏️",
        title: "Make the Bed",
        body: "Straighten the duvet, fluff the pillows. Two minutes — changes the whole room.",
        tip: "Pull the duvet tight from the far side first, then smooth toward you.",
        illustration: "bed",
      },
      {
        emoji: "🕯️",
        title: "Finishing Touch",
        body: "Light a candle if you're feeling cute.",
        tip: "Bonus round — not a requirement.",
        illustration: "candle",
        bonus: true,
      },
    ],
  },

  standard: {
    label: "Standard",
    duration: "~1.5 hrs",
    blurb: "solid all-around clean",
    color: "#5B9E8F",
    layout: "checklist",
    steps: [
      {
        title: "Strip the Beds",
        room: "Bedrooms",
        tasks: [
          "Remove all bedding",
          "Gather towels from the bathroom",
          "Start the wash at 60°C with Vanish",
        ],
        tip: "Start here so the laundry runs in the background while you clean.",
      },
      {
        title: "Declutter & Trash",
        room: "Entire apartment",
        tasks: [
          "Remove visible clutter",
          "Throw out all rubbish",
          "Collect bottles and cans for pant",
          "Everything back to its spot",
        ],
      },
      {
        title: "Restock the Fridge",
        room: "Kitchen",
        tasks: [
          "Refill water bottles",
          "Toss perishables that are past it",
          "Canned food stays",
        ],
      },
      {
        title: "Wipe All Surfaces",
        room: "Bedrooms → Living → Kitchen → Bathroom",
        tasks: [
          "Bucket of warm water + Ajax",
          "Wipe every surface in order",
          "Dry with a tea towel",
          "Glass cleaner on mirrors",
        ],
        tip: "Don't forget mirrors, radiators, and tops of nightstands.",
      },
      {
        title: "Clean the Bathroom",
        room: "Bathroom",
        tasks: [
          "Fresh cloth, toilet cleaner in the bowl",
          "Sponge the sink and toilet exterior",
          "Scrub the toilet thoroughly",
          "Dry-wipe everything to a shine",
        ],
        tip: "Throw the bathroom cloth straight in the wash when you're done.",
      },
      {
        title: "Vacuum",
        room: "Entire apartment",
        tasks: [
          "All floors and carpets",
          "Corners and edges",
        ],
      },
      {
        title: "Mop Floors",
        room: "Bedrooms → Living → Kitchen → Bathroom",
        tasks: [
          "Warm water + wood floor treatment",
          "Mop in the same room order",
          "Kitchen and bathroom last",
        ],
      },
      {
        title: "Make Beds & Laundry",
        room: "Bedrooms",
        tasks: [
          "Transfer laundry to the dryer",
          "Put on fresh sheets",
          "Make beds neatly",
        ],
      },
      {
        title: "Final Walkthrough",
        room: "Entire apartment",
        tasks: [
          "Trash out via the chute",
          "Final lap — eyes open",
          "Lock up",
        ],
        tip: "Imagine you're the guest checking in.",
      },
    ],
  },

  thorough: {
    label: "Thorough",
    duration: "~2.5 hrs",
    blurb: "everything gets attention",
    color: "#7E8BBE",
    layout: "checklist",
    steps: [
      {
        title: "Strip the Beds",
        room: "Bedrooms",
        tasks: [
          "Remove all bedding",
          "Strip the mattress protectors too",
          "Gather towels from the bathroom",
          "Start the wash at 60°C with Vanish",
        ],
        tip: "Mattress protectors only get washed when you bother — today you bother.",
      },
      {
        title: "Declutter & Check Drawers",
        room: "Entire apartment",
        tasks: [
          "Remove visible clutter",
          "Throw out all rubbish",
          "Collect bottles and cans for pant",
          "Open drawers and cabinets — pull out anything forgotten",
          "Everything back to its spot",
        ],
      },
      {
        title: "Fridge Reset",
        room: "Kitchen",
        tasks: [
          "Refill water bottles",
          "Toss perishables that are past it",
          "Wipe down fridge shelves",
          "Canned food stays",
        ],
      },
      {
        title: "Surfaces & Appliances",
        room: "Bedrooms → Living → Kitchen → Bathroom",
        tasks: [
          "Bucket of warm water + Ajax",
          "Wipe every surface in order",
          "Full appliance wipe: microwave, kettle, hood, hob",
          "Dry with a tea towel",
          "Glass cleaner on mirrors",
        ],
        tip: "Don't skip the radiator tops, the top of the fridge, or behind the kettle.",
      },
      {
        title: "Deep Bathroom",
        room: "Bathroom",
        tasks: [
          "Fresh cloth, toilet cleaner in the bowl",
          "Sponge the sink and toilet exterior",
          "Scrub the toilet thoroughly",
          "Scrub the tile grout with a brush",
          "Dry-wipe everything to a shine",
        ],
        tip: "A grout brush makes the tiles look new again.",
      },
      {
        title: "Detailed Vacuum",
        room: "Entire apartment",
        tasks: [
          "All floors, carpets, and rugs",
          "Switch to the nozzle for baseboards",
          "Corners, edges, and behind doors",
        ],
      },
      {
        title: "Mop Floors",
        room: "Bedrooms → Living → Kitchen → Bathroom",
        tasks: [
          "Warm water + wood floor treatment",
          "Mop in the same room order",
          "Kitchen and bathroom last",
        ],
      },
      {
        title: "Hotel-Style Beds & Laundry",
        room: "Bedrooms",
        tasks: [
          "Transfer laundry to the dryer",
          "Mattress protectors back on",
          "Fresh sheets, tucked tight at the corners",
          "Pillows fluffed and aligned",
        ],
        tip: "Tuck the bottom sheet hospital-style — corners at 45°.",
      },
      {
        title: "Final Walkthrough",
        room: "Entire apartment",
        tasks: [
          "Trash out via the chute",
          "Final lap — eyes open",
          "Lock up",
        ],
        tip: "Imagine you're the guest checking in.",
      },
    ],
  },

  deep: {
    label: "Deep Clean",
    duration: "~4 hrs",
    blurb: "every corner, every detail",
    color: "#B56B8A",
    layout: "checklist",
    steps: [
      {
        title: "Strip the Beds",
        room: "Bedrooms",
        tasks: [
          "Remove all bedding",
          "Strip the mattress protectors too",
          "Gather towels from the bathroom",
          "Start the wash at 60°C with Vanish",
        ],
        tip: "Get this running first — it'll be done by the time you finish.",
      },
      {
        title: "Declutter & Check Everything",
        room: "Entire apartment",
        tasks: [
          "Remove visible clutter",
          "Throw out all rubbish",
          "Collect bottles and cans for pant",
          "Open every drawer and cabinet — pull out anything forgotten",
          "Everything back where it lives",
        ],
      },
      {
        title: "Oven & Kitchen Appliances",
        room: "Kitchen",
        tasks: [
          "Oven cleaner on the inside, leave to sit",
          "Wipe down the hob, kettle, microwave, hood",
          "Wipe cabinet fronts",
          "Come back and scrub the oven",
        ],
        tip: "Spray the oven first — it needs 20 minutes to do its job.",
      },
      {
        title: "Fridge Reset",
        room: "Kitchen",
        tasks: [
          "Refill water bottles",
          "Toss perishables that are past it",
          "Wipe down fridge shelves and drawers",
          "Canned food stays",
        ],
      },
      {
        title: "Surfaces & Details",
        room: "Bedrooms → Living → Kitchen → Bathroom",
        tasks: [
          "Bucket of warm water + Ajax",
          "Wipe every surface in order",
          "Door frame tops, skirting boards, lampshade tops",
          "Dust the lampshades",
          "Glass cleaner on mirrors",
        ],
        tip: "Run a finger along the top of a door frame. That's why we're here.",
      },
      {
        title: "Deep Bathroom",
        room: "Bathroom",
        tasks: [
          "Fresh cloth, toilet cleaner in the bowl",
          "Sponge the sink and toilet exterior",
          "Scrub the toilet thoroughly",
          "Scrub the tile grout with a brush",
          "Descale the shower head",
          "Dry-wipe everything to a shine",
        ],
      },
      {
        title: "Detailed Vacuum",
        room: "Entire apartment",
        tasks: [
          "All floors, carpets, and rugs",
          "Nozzle for baseboards and corners",
          "Under the sofa and under the bed",
          "Upholstery brush on couch cushions",
        ],
      },
      {
        title: "Mop Floors",
        room: "Bedrooms → Living → Kitchen → Bathroom",
        tasks: [
          "Warm water + wood floor treatment",
          "Mop in the same room order",
          "Kitchen and bathroom last",
        ],
      },
      {
        title: "Windows & Details",
        room: "Entire apartment",
        tasks: [
          "Window glass — inside, all rooms",
          "Wipe down blinds",
          "Dust light bulbs and fixtures",
          "Wipe down remotes and switches",
        ],
        tip: "The details are what people notice without knowing why.",
      },
      {
        title: "Hotel Beds & Walkthrough",
        room: "Entire apartment",
        tasks: [
          "Transfer laundry to the dryer",
          "Mattress protectors back on",
          "Fresh sheets, hotel corners",
          "Pillows fluffed",
          "Trash out via the chute",
          "Final lap and lock up",
        ],
      },
    ],
  },
};

const MODE_ORDER = ["quickie", "standard", "thorough", "deep"];

// ---------- Helpers ----------

function fmtTime(s) {
  if (s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

// ---------- Animated SVG illustrations (Quickie only) ----------

function Illustration({ kind, color }) {
  const stroke = color;
  const common = { width: 140, height: 90, viewBox: "0 0 140 90", fill: "none" };

  switch (kind) {
    case "trash":
      return (
        <svg {...common}>
          <g stroke={stroke} strokeWidth="2" strokeLinecap="round">
            <path d="M55 35 L55 75 Q55 80 60 80 L80 80 Q85 80 85 75 L85 35 Z" />
            <path d="M50 35 L90 35" />
            <path d="M65 30 L75 30" />
            <line x1="63" y1="45" x2="63" y2="70" opacity="0.5" />
            <line x1="70" y1="45" x2="70" y2="70" opacity="0.5" />
            <line x1="77" y1="45" x2="77" y2="70" opacity="0.5" />
            <g opacity="0.7">
              <circle cx="58" cy="22" r="1.5">
                <animate attributeName="cy" values="22;10;22" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="70" cy="20" r="1.5">
                <animate attributeName="cy" values="20;6;20" dur="2.6s" repeatCount="indefinite" begin="0.4s" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="2.6s" repeatCount="indefinite" begin="0.4s" />
              </circle>
              <circle cx="82" cy="22" r="1.5">
                <animate attributeName="cy" values="22;10;22" dur="2.4s" repeatCount="indefinite" begin="0.8s" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="2.4s" repeatCount="indefinite" begin="0.8s" />
              </circle>
            </g>
          </g>
        </svg>
      );

    case "tidy":
      return (
        <svg {...common}>
          <g stroke={stroke} strokeWidth="2" fill="none">
            <line x1="20" y1="65" x2="120" y2="65" opacity="0.4" />
            <rect x="40" y="48" width="16" height="16" rx="2">
              <animate attributeName="x" values="20;40;40;40;20" keyTimes="0;0.25;0.5;0.75;1" dur="3.6s" repeatCount="indefinite" />
            </rect>
            <rect x="62" y="48" width="16" height="16" rx="2">
              <animate attributeName="x" values="100;62;62;62;100" keyTimes="0;0.25;0.5;0.75;1" dur="3.6s" repeatCount="indefinite" />
            </rect>
            <rect x="84" y="48" width="16" height="16" rx="2">
              <animate attributeName="x" values="120;84;84;84;120" keyTimes="0;0.3;0.5;0.75;1" dur="3.6s" repeatCount="indefinite" begin="0.3s" />
            </rect>
          </g>
        </svg>
      );

    case "wipe":
      return (
        <svg {...common}>
          <g stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round">
            <line x1="20" y1="70" x2="120" y2="70" opacity="0.4" />
            <g>
              <rect x="58" y="42" width="24" height="16" rx="3" fill={stroke} fillOpacity="0.15">
                <animate attributeName="x" values="30;90;30" dur="2.4s" repeatCount="indefinite" />
              </rect>
              <path d="M35 60 Q40 56 45 60" opacity="0.5">
                <animate attributeName="d" values="M35 60 Q40 56 45 60;M85 60 Q90 56 95 60;M35 60 Q40 56 45 60" dur="2.4s" repeatCount="indefinite" />
              </path>
            </g>
          </g>
        </svg>
      );

    case "droplet":
      return (
        <svg {...common}>
          <g stroke={stroke} strokeWidth="2" fill="none">
            <path d="M50 68 Q50 78 60 78 L80 78 Q90 78 90 68 L88 50 L52 50 Z" />
            <ellipse cx="70" cy="72" rx="14" ry="3" opacity="0.5" />
            <g fill={stroke}>
              <path d="M70 20 Q66 28 66 32 Q66 36 70 36 Q74 36 74 32 Q74 28 70 20Z">
                <animateTransform attributeName="transform" type="translate" values="0 0; 0 28; 0 0" keyTimes="0;0.6;1" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;1;0;1" keyTimes="0;0.55;0.65;1" dur="2.2s" repeatCount="indefinite" />
              </path>
            </g>
          </g>
        </svg>
      );

    case "swirl":
      return (
        <svg {...common}>
          <g stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round">
            <g transform="translate(70 45)">
              <path d="M0 0 m -22 0 a 22 22 0 1 0 44 0 a 18 18 0 1 1 -36 0 a 14 14 0 1 0 28 0 a 10 10 0 1 1 -20 0">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3.6s" repeatCount="indefinite" />
              </path>
            </g>
          </g>
        </svg>
      );

    case "bed":
      return (
        <svg {...common}>
          <g stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round">
            <rect x="22" y="50" width="96" height="22" rx="3" />
            <line x1="22" y1="58" x2="118" y2="58" opacity="0.4" />
            <rect x="28" y="42" width="22" height="10" rx="2" fill={stroke} fillOpacity="0.2" />
            <path d="M55 64 Q70 60 85 64 T115 64" opacity="0.6">
              <animate attributeName="d" values="M55 68 Q70 62 85 68 T115 68;M55 64 Q70 64 85 64 T115 64;M55 68 Q70 62 85 68 T115 68" dur="3s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      );

    case "candle":
      return (
        <svg {...common}>
          <g stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round">
            <rect x="60" y="42" width="20" height="34" rx="2" />
            <line x1="70" y1="42" x2="70" y2="36" />
            <path d="M70 36 Q63 28 70 18 Q77 28 70 36Z" fill={stroke} fillOpacity="0.55" stroke="none">
              <animateTransform attributeName="transform" type="scale" additive="sum" values="1 1; 0.92 1.08; 1 1; 1.05 0.95; 1 1" keyTimes="0;0.25;0.5;0.75;1" dur="1.4s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.55;0.75;0.55;0.65;0.55" dur="1.4s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      );

    default:
      return null;
  }
}

// ---------- Slide-to-start ----------

function SlideToStart({ color, onComplete }) {
  const trackRef = useRef(null);
  const [thumbX, setThumbX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const stateRef = useRef({ startX: 0, startThumb: 0, maxX: 0, fired: false });

  const begin = useCallback((clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const thumbW = 56;
    const pad = 4;
    const maxX = Math.max(0, rect.width - thumbW - pad * 2);
    stateRef.current = { startX: clientX, startThumb: thumbX, maxX, fired: false };
    setDragging(true);
  }, [thumbX]);

  const move = useCallback((clientX) => {
    const { startX, startThumb, maxX, fired } = stateRef.current;
    if (fired) return;
    const delta = clientX - startX;
    let nx = startThumb + delta;
    if (nx < 0) nx = 0;
    if (nx > maxX) nx = maxX;
    setThumbX(nx);
  }, []);

  const end = useCallback(() => {
    const { maxX } = stateRef.current;
    setDragging(false);
    if (thumbX >= maxX * 0.85 && !stateRef.current.fired) {
      stateRef.current.fired = true;
      setThumbX(maxX);
      setTimeout(() => onComplete(), 160);
    } else {
      setThumbX(0);
    }
  }, [thumbX, onComplete]);

  useEffect(() => {
    if (!dragging) return;
    const onMM = (e) => move(e.clientX);
    const onMU = () => end();
    const onTM = (e) => { if (e.touches[0]) move(e.touches[0].clientX); };
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

  const pct = stateRef.current.maxX ? thumbX / stateRef.current.maxX : 0;

  return (
    <div className="slide-track" ref={trackRef} style={{ borderColor: color }}>
      <div className="slide-fill" style={{ width: `${pct * 100}%`, background: color }} />
      <div className="slide-hint" style={{ opacity: 1 - pct }}>Slide to start →</div>
      <div
        className="slide-thumb"
        style={{
          transform: `translateX(${thumbX}px)`,
          transition: dragging ? "none" : "transform 0.3s ease",
          background: color,
        }}
        onMouseDown={(e) => { e.preventDefault(); begin(e.clientX); }}
        onTouchStart={(e) => { if (e.touches[0]) begin(e.touches[0].clientX); }}
      >
        <span>→</span>
      </div>
    </div>
  );
}

// ---------- Screens ----------

function ModePicker({ onSelect }) {
  return (
    <div className="screen mode-picker">
      <header className="hero">
        <h1>The Clean Machine</h1>
        <p>Pick your pace. The app tells you what to do next — no thinking required.</p>
      </header>
      <div className="mode-list">
        {MODE_ORDER.map((id) => {
          const m = MODES[id];
          return (
            <button
              key={id}
              className="mode-card"
              style={{ borderColor: m.color }}
              onClick={() => onSelect(id)}
            >
              <div className="mode-card-top">
                <span className="mode-label" style={{ color: m.color }}>{m.label}</span>
                <span className="mode-duration">{m.duration}</span>
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

function QuickieLaunch({ color, onStart, onBack }) {
  return (
    <div className="screen quickie-launch fade-up">
      <button className="back" onClick={onBack}>← Back</button>
      <div className="launch-body">
        <div className="launch-emoji">⚡</div>
        <h2>7 steps. 30 minutes. <span style={{ color }}>You got this.</span></h2>
        <div className="launch-time" style={{ color }}>30:00</div>
        <SlideToStart color={color} onComplete={onStart} />
        <p className="launch-foot">Drag the thumb across to begin.</p>
      </div>
    </div>
  );
}

function TimerChip({ secondsLeft, running, onToggle }) {
  const expired = secondsLeft <= 0;
  return (
    <button
      className={"timer-chip" + (expired ? " expired" : "") + (running ? " running" : " paused")}
      onClick={onToggle}
      aria-label={running ? "Pause timer" : "Resume timer"}
    >
      <span className="timer-dot" />
      <span className="timer-text">{fmtTime(secondsLeft)}</span>
    </button>
  );
}

function ProgressBar({ total, index, color }) {
  return (
    <div className="progress">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={"seg" + (i <= index ? " on" : "")}
          style={i <= index ? { background: color } : undefined}
        />
      ))}
    </div>
  );
}

function QuickieStep({
  step, stepIndex, total, color, animKey, expandedTip, onToggleTip,
  secondsLeft, timerRunning, onToggleTimer, onNext,
}) {
  const isLast = stepIndex === total - 1;
  return (
    <div className="screen quickie-step">
      <div className="quickie-top">
        <ProgressBar total={total} index={stepIndex} color={color} />
        <TimerChip secondsLeft={secondsLeft} running={timerRunning} onToggle={onToggleTimer} />
      </div>

      <div key={animKey} className="quickie-card fade-up">
        <div className="big-emoji" aria-hidden="true">{step.emoji}</div>
        <Illustration kind={step.illustration} color={color} />
        {step.bonus && <span className="bonus-tag" style={{ borderColor: color, color }}>bonus round</span>}
        <h2 className="step-title">{step.title}</h2>
        <p className="step-body">{step.body}</p>

        <button
          className={"tip-pill" + (expandedTip ? " open" : "")}
          onClick={onToggleTip}
          style={{ borderColor: color }}
        >
          <span style={{ color }}>💡 Tip</span>
          {expandedTip && <span className="tip-body"> — {step.tip}</span>}
        </button>
      </div>

      <button className="primary-btn" style={{ background: color }} onClick={onNext}>
        {isLast ? "Finish ✓" : "Done →"}
      </button>
    </div>
  );
}

function ChecklistStep({
  step, stepIndex, total, color, animKey,
  checked, onToggleCheck, onNext,
}) {
  const isLast = stepIndex === total - 1;
  const pct = ((stepIndex) / total) * 100;
  return (
    <div className="screen checklist-step">
      <div className="checklist-top">
        <div className="bar"><div className="bar-fill" style={{ width: `${pct}%`, background: color }} /></div>
        <div className="step-counter">Step {stepIndex + 1} of {total}</div>
      </div>

      <div key={animKey} className="checklist-card fade-up">
        <span className="room-tag" style={{ borderColor: color, color }}>{step.room}</span>
        <h2 className="step-title">{step.title}</h2>
        <ul className="task-list">
          {step.tasks.map((t, i) => (
            <li key={i}>
              <button
                className={"checkbox" + (checked.has(i) ? " on" : "")}
                style={checked.has(i) ? { background: color, borderColor: color } : { borderColor: color }}
                onClick={() => onToggleCheck(i)}
                aria-label={checked.has(i) ? "Uncheck" : "Check"}
              >
                {checked.has(i) && <span>✓</span>}
              </button>
              <span className={"task" + (checked.has(i) ? " done" : "")}>{t}</span>
            </li>
          ))}
        </ul>
        {step.tip && (
          <div className="tip-box" style={{ borderColor: color }}>
            <span style={{ color }}>💡 </span>{step.tip}
          </div>
        )}
      </div>

      <button className="primary-btn" style={{ background: color }} onClick={onNext}>
        {isLast ? "Finish ✓" : "Next step →"}
      </button>
    </div>
  );
}

function DoneScreen({ mode, onRestart }) {
  return (
    <div className="screen done-screen fade-up">
      <div className="done-emoji">✨</div>
      <h2>Done.</h2>
      <p>You ran <span style={{ color: mode.color }}>{mode.label}</span> from start to finish. Enjoy the place.</p>
      <button className="primary-btn" style={{ background: mode.color }} onClick={onRestart}>Start over</button>
    </div>
  );
}

// ---------- App ----------

export default function App() {
  const [mode, setMode] = useState(null);
  const [phase, setPhase] = useState("running");
  const [stepIndex, setStepIndex] = useState(0);
  const [checks, setChecks] = useState({});
  const [expandedTip, setExpandedTip] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (!timerRunning) return;
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning, secondsLeft]);

  const current = mode ? MODES[mode] : null;

  const selectMode = useCallback((id) => {
    setMode(id);
    setStepIndex(0);
    setChecks({});
    setExpandedTip(false);
    setAnimKey((k) => k + 1);
    if (id === "quickie") {
      setPhase("launch");
      setSecondsLeft(MODES.quickie.timerSeconds);
      setTimerRunning(false);
    } else {
      setPhase("running");
    }
  }, []);

  const reset = useCallback(() => {
    setMode(null);
    setPhase("running");
    setStepIndex(0);
    setChecks({});
    setExpandedTip(false);
    setTimerRunning(false);
    setSecondsLeft(30 * 60);
  }, []);

  const startQuickie = useCallback(() => {
    setPhase("running");
    setStepIndex(0);
    setTimerRunning(true);
    setAnimKey((k) => k + 1);
  }, []);

  const next = useCallback(() => {
    if (!current) return;
    setExpandedTip(false);
    setAnimKey((k) => k + 1);
    if (stepIndex + 1 >= current.steps.length) {
      setPhase("done");
      setTimerRunning(false);
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [current, stepIndex]);

  const toggleCheck = useCallback((taskIdx) => {
    setChecks((prev) => {
      const set = new Set(prev[stepIndex] || []);
      if (set.has(taskIdx)) set.delete(taskIdx);
      else set.add(taskIdx);
      return { ...prev, [stepIndex]: set };
    });
  }, [stepIndex]);

  if (!mode) return <ModePicker onSelect={selectMode} />;

  if (mode === "quickie" && phase === "launch") {
    return <QuickieLaunch color={current.color} onStart={startQuickie} onBack={reset} />;
  }

  if (phase === "done") {
    return <DoneScreen mode={current} onRestart={reset} />;
  }

  const step = current.steps[stepIndex];
  const total = current.steps.length;

  if (current.layout === "card") {
    return (
      <QuickieStep
        step={step}
        stepIndex={stepIndex}
        total={total}
        color={current.color}
        animKey={animKey}
        expandedTip={expandedTip}
        onToggleTip={() => setExpandedTip((v) => !v)}
        secondsLeft={secondsLeft}
        timerRunning={timerRunning}
        onToggleTimer={() => setTimerRunning((v) => !v)}
        onNext={next}
      />
    );
  }

  return (
    <ChecklistStep
      step={step}
      stepIndex={stepIndex}
      total={total}
      color={current.color}
      animKey={animKey}
      checked={checks[stepIndex] || new Set()}
      onToggleCheck={toggleCheck}
      onNext={next}
    />
  );
}
