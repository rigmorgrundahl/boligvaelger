# The Clean Machine

A mobile-first, single-screen cleaning guide for whoever in the household is about to clean. The app removes the thinking — pick a mode and it walks you through what to do next, scaled to your actual home.

## Run it

Open `index.html` in any modern browser. No build step, no server required — React 18 loads from a CDN and the rest is inline.

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

Time estimates and step counts scale to your setup: a 3-bedroom house with stairs and garden takes longer than a 1-bedroom flat. The Quickie has a 60-minute cap — bigger places see a "consider The Deep Dive" hint.

## Profiles

Profiles describe the *style of guidance* you want from the app — not the user. Same as setting screen-reader verbosity. Switch any time from the gear icon.

- **Guided** — Walks you through, with the reasoning. Tips open by default.
- **Friendly** — Default. Direct, warm, no fluff.
- **Brief** — Just the commands, no extras. Tip pill omitted.
- **Playful** — Snappier copy and a lighter vibe.
- **Pre-guests** — Quick refresh before company arrives. Hides The Whole Shebang.

## Files

- `index.html` — self-contained app (React from CDN, all CSS/JS inline). The runnable artifact.
- `CleanMachine.jsx` — same component as JSX source reference. Drop into a Vite/Next project to use as a normal React component.

## Design

- Dark theme, warm off-white text
- Bricolage Grotesque (headings) + Karla (body) from Google Fonts
- One accent colour per mode
- 480px max width, optimised for phone use

## Roadmap

- Capacitor wrapper to ship as a native iOS/Android app
- Spotify DJ — `MODES[id].mood` field is already reserved (energetic / focused / long-mix); maps to a per-mode playlist when integrated
- Streaks + completion stats (`runCount` and `lastCompletedAt` already persisted)
- Optional resume-where-you-left-off mid-run
- Optional "hide the timer" toggle for users who find the countdown stressful
