# The Clean Machine

A mobile-first, single-screen cleaning guide for whoever in the household is about to clean. The app removes the thinking — pick a mode and it walks you through what to do next, scaled to your actual home.

## Run it

Open `index.html` in any modern browser. No build step, no server required — React 18 loads from a CDN and the rest is inline.

## Install it on your phone

The app is a PWA (Progressive Web App). After you visit the deployed page on your phone:

- **iOS Safari**: tap Share → "Add to Home Screen"
- **Android Chrome / Edge**: tap the menu → "Install app" / "Add to Home Screen"

It launches in standalone mode (no browser chrome) and works offline after one online visit.

For App Store / Play Store distribution, the next step is a Capacitor wrapper (a separate, larger task that needs a Mac for iOS builds).

## Setup

The first time you open the app, a quick wizard asks:

- **Dwelling type** (flat / house / townhouse)
- **Bedrooms** + **bathrooms**
- **Size** in m² (drives realistic time estimates)
- **Extra spaces** (stairs, garden, garage, balcony, mudroom, laundry room — pre-checked based on dwelling)
- **Profile** — the style of guidance you want (see below)
- **Name** (optional, personalises the launch screen)
- **Cleaning supplies** you have on hand

Settings persist in `localStorage`. Edit them anytime from the gear icon on the mode picker.

## Modes

Every mode uses the same UX: a launch screen with a slide-to-start gesture, then one task per screen with countdown, animated SVG, and collapsible tip.

| Mode | Base time | Vibe |
| --- | --- | --- |
| ⚡ **The Quickie** | 30 min | speed run, the essentials |
| 💜 **The Deep Dive** | ~2 hrs | everything that matters, realistic but tight |
| 🌹 **The Whole Shebang** | ~4 hrs | every corner, every detail |

Time estimates and step counts scale to your setup: a 3-bedroom house with stairs and garden takes longer than a 1-bedroom flat. The Quickie has a 60-minute cap.

## Profiles

Profiles describe the *style of guidance* you want from the app — not the user. Same as setting screen-reader verbosity. Switch any time from the gear icon.

- **Guided** — Walks you through, with the reasoning. Tips open by default.
- **Friendly** — Default. Direct, warm, no fluff.
- **Brief** — Just the commands, no extras. Tip pill omitted.
- **Playful** — Snappier copy and a lighter vibe.
- **Pre-guests** — Quick refresh before company arrives. Hides The Whole Shebang.

## Game-feel

The app borrows a few cues from Duolingo to make consistent cleaning feel rewarding without being preachy:

- **🔥 Streak** — tracked across runs; visible on the mode picker and every task card. 8-day grace window before it resets.
- **+10 XP** floats up when you tap Done on a step; +50 bonus at the end. Cumulative XP visible in Settings → Stats.
- **Mid-step encouragement** — "Halfway. Nice pace.", "Last one — finish strong.", etc.
- **Milestone confetti** — small bursts at the halfway and finish points.
- **Done screen** — stats (steps, minutes, XP, this-month totals) and a streak banner. Confetti rains briefly.
- **Bouncy buttons** — depth-shadow that compresses on press.

Skipped on purpose: hearts / lives / punishment for skipping. The app is meant to *lower* activation energy, not raise it.

## Pace toggle

The countdown can stress people out — especially the audience the app is for. There are two ways to turn it off:

- **Permanent**: Settings → Pace → toggle "Show countdown timer".
- **Just this clean**: tap the timer chip → "Hide for this clean". A small "show timer" link brings it back.

## Files

- `index.html` — self-contained app (React from CDN, all CSS/JS inline). The runnable artifact.
- `manifest.webmanifest` — PWA manifest (name, icons, theme color).
- `sw.js` — service worker (offline support, cache-first for shell assets).
- `CleanMachine.jsx` — JSX reference. Currently reflects v3; v4 additions (streaks, PWA, pace toggle, juice) only live in `index.html`. Treat `index.html` as canonical.

## Design

- Dark theme, warm off-white text
- Bricolage Grotesque (headings) + Karla (body) from Google Fonts
- One accent colour per mode
- 480px max width, optimised for phone use

## Roadmap

- **Capacitor wrapper** — package as a native iOS/Android binary for the stores. Separate session, needs Mac for iOS.
- **Resume mid-clean** — persist current step so a phone interruption doesn't lose the run.
- **Spotify DJ** — `MODES[id].mood` field is reserved (energetic / focused / long-mix); maps to a per-mode playlist when integrated.
- **Achievements** — badges for first Deep Dive, 7-day streak, all profiles tried, etc.
- **Setup wizard collapse** — currently 10 screens, probably can land at 6.
