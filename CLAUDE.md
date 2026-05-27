# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Boligvælger" (Danish for "home selector") is a tiny static site that overlays clickable polygons on a site-plan image using Leaflet. Each polygon represents a housing unit and shows status (LEDIG = available / RESERVERET = reserved / UDLEJET = rented), opening a modal with details and CTA links. It is designed to be dropped into a host site (WordPress, Webflow, etc.) as an `<iframe>`. UI strings are Danish.

There is no build system, package manager, linter, or test suite. Leaflet 1.9.4 is loaded from unpkg via CDN; everything else is plain HTML/CSS/ES-module JS.

## Running locally

Because `script.js` is an ES module that uses a JSON import (`import units from './data/units.json' assert { type: 'json' }`), opening `index.html` directly via `file://` does **not** work reliably — serve over HTTP instead:

```
python3 -m http.server 8000
# then open http://localhost:8000/
```

The README claims double-clicking `index.html` works; in practice the module + JSON-import requires a server.

Note on JSON imports: the `assert { type: 'json' }` syntax in `script.js` is the old form; current browsers prefer `with { type: 'json' }`. If the import fails in a modern Chromium, that's why.

## Current repo layout vs. what the code expects (important)

`script.js` and `index.html` reference paths that don't currently exist in this repo:

- `script.js` line 2 imports `./data/units.json` — **`data/units.json` is not present**.
- `script.js` line 14 loads `./assets/plan.png` — **the file is at `plan.png` in the root, not under `assets/`**.

So out-of-the-box the page will fail to load. Any task that involves actually running the demo needs to either:
1. Create `data/units.json` (schema below) and move/copy `plan.png` to `assets/plan.png`, **or**
2. Update the two paths in `script.js` to match the current flat layout.

Pick option 1 if you're aligning with the README; option 2 if the user wants the existing flat layout to work as-is. Ask if unclear.

## Data model (`data/units.json`)

Array of unit objects. Coordinates are **image pixel coordinates in `[y, x]` order** (origin top-left), not lat/lng — this is because the map uses `L.CRS.Simple` with image-pixel bounds (`imgWidth = 1398`, `imgHeight = 908` in `script.js`). If `plan.png` is replaced with a different image, update those two constants.

```json
{
  "id": "B1",
  "label": "1",
  "status": "LEDIG|RESERVERET|UDLEJET",
  "rooms": 4,
  "size": 98,
  "desc": "optional",
  "more_url": "https://...",
  "cta_url": "https://...",
  "coords": [[y, x], [y, x], ...]
}
```

## Architecture notes

- **Coordinate system**: `L.CRS.Simple` + an `L.imageOverlay` with bounds `[[0,0],[imgHeight,imgWidth]]` makes Leaflet treat the plan image as a flat pixel canvas. Polygon `coords` are in that same `[y, x]` pixel space.
- **Styling by status**: `polygonFromUnit` applies a CSS class `poly-<STATUS>` (uppercased). Colors live in `styles.css` under `--green / --amber / --red` and the `.poly-LEDIG/.poly-RESERVERET/.poly-UDLEJET/.poly-HOVER` rules — change status colors there, not in JS.
- **Modal**: a single `#modal` element in `index.html`, populated via `innerHTML` on click. Toggled by setting `aria-hidden`. Closed by the × button or by clicking the backdrop (target check on `#modal`). ESC-to-close is listed as a future improvement in the README and is not implemented.
- **Embedding**: intended usage is `<iframe src="/boligvaelger/<project>/index.html">` on the host site. Keep the page self-contained and avoid assuming a parent document.

## Conventions

- UI text is Danish; keep new strings Danish unless the user asks otherwise.
- Status values are uppercase (`LEDIG`, `RESERVERET`, `UDLEJET`) and are used directly to build CSS class names — don't lowercase them or introduce new statuses without adding matching `.poly-<STATUS>` CSS.
- Polygon coords are `[y, x]` (Leaflet `CRS.Simple` convention), **not** `[x, y]`. Easy to get wrong.
