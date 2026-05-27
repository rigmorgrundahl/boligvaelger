# The Clean Machine

A mobile-first, single-screen cleaning guide for people who find tidying overwhelming because they don't have a system. No accounts. No ads. The app tells you what to do next.

## Run it

Open `index.html` in any modern browser. No build step, no server required — it loads React 18 from a CDN and runs from there. Drop the file on any web host or open it locally with a double-click.

## Modes

| Mode | Time | Layout |
| --- | --- | --- |
| ⚡ The Quickie | 30 min | Full-screen one-task-per-screen with countdown timer and slide-to-start |
| 🌿 Standard | ~1.5 hrs | Checklist with room tags |
| 💜 Thorough | ~2.5 hrs | Checklist, every corner attended |
| 🌹 Deep Clean | ~4 hrs | Checklist, every detail incl. oven, windows, baseboards |

## Files

- `index.html` — self-contained app (React from CDN, all CSS and JS inline). This is the runnable artifact.
- `CleanMachine.jsx` — the same component as a JSX source reference. Drop into a Vite/Next project to use as a normal React component.

## Design

- Dark theme, warm off-white text
- Bricolage Grotesque (headings) + Karla (body) from Google Fonts
- One accent colour per mode
- 480px max width, optimised for phone use

## Roadmap to a native app

The HTML version is the prototype. To ship as a real mobile app:

1. Wrap `index.html` in **Capacitor** (`npx cap init`, copy the file into `www/`, build to iOS and Android). Fastest path; the existing code works unchanged.
2. Or port `CleanMachine.jsx` to **React Native** via Expo. The state and data structure carry over; the SVG illustrations need swapping to `react-native-svg`, and the slide-to-start gesture needs `react-native-gesture-handler`.
