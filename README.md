# Furnace → Wafer section

React + TypeScript + Tailwind + framer-motion. Dark industrial style (`#09090B`, accent `#38BDF8`).

## Live site

Every push to `main` is built and published to GitHub Pages by `.github/workflows/deploy.yml`.

## Run the demo

```bash
npm install
npm run dev
```

## Use in your site

Copy into your project:

- `src/components/fab/` — the section and its parts
- `src/data/processSteps.ts` — all texts, clips, countries and sites
- `src/data/worldPaths.ts` — world map shapes (Natural Earth 110m, public domain; regenerate with `npm run gen:map`)
- `src/lib/pcbPath.ts` — PCB routing (straight runs + 45° diagonals)
- `public/videos/*.mp4`, `public/posters/*.jpg` — the clips
- the `colors` / `fontFamily` entries from `tailwind.config.js`, and `.vignette` / `.tech-grid` from `src/index.css`

Chapter numbers live only in `src/data/chapters.ts` (00 Prologue, 01 Spruce Pine, 02 Smelting, 03 Wafer line, 04 Lithography). The first scroll at the top plays the film on its own up to the opening question.

Then place `<IntroScrollFilm />` at the top of the page and `<BakingToFabSection />` right after it.

### Prologue (`src/components/intro/IntroScrollFilm.tsx`)

Scroll-to-play film from the Blender render (`full_preview_v1.mp4`, 514 frames, 960×540) packed into 4×4 WebP atlases in `public/intro/`. Scroll drives the frame on a canvas: card zooms out → pause with the question → sand dissolve → Spruce Pine → pause with marker and caption → blur into the furnace film. To swap in a higher-resolution render, rebuild the atlases:

```bash
ffmpeg -i render.mp4 -vf "tile=4x4" -c:v libwebp -quality 62 public/intro/atlas%02d.webp
```

and update `FW`, `FH`, `FRAMES`, `CARD`, `END` at the top of the component.

| Component | Role |
| --- | --- |
| `BakingToFabSection` | Section wrapper: smelting text above the film, chapter heading, atmosphere |
| `MeltingVideo` | Stage 1 — full-screen furnace film, edges fade into the page, text over the darkened bottom |
| `FireToCircuitLine` | Scroll-drawn PCB connector that cools from molten orange to circuit blue |
| `CircuitProcessMap` | Stage 2 — vertical PCB trace (45° jogs) in a sticky "camera"; `useScroll` draws the current, it pauses at each of the 5 via pads; the trace runs on to the bottom edge of the section |
| `ui/Caption` | The one caption style for every chapter (kicker, masked headline, body, spec row) |
| `ui/ScrambleText` | Digital decode effect for kickers and spec values |
| `lib/useGuidedScroll` | Inside the films (`data-guide` zones) one downward gesture plays to the next stop; scrolling up stays manual |
| `lib/useMagneticScroll` | Elsewhere, the page settles onto nearby story points (`data-snap`) in the direction you were scrolling |
| `ui/ChapterRail` | Fixed chapter index on the right; numbers come from `src/data/chapters.ts` |
| `RevealText` | Headline words rise out of a mask on enter |
| `StagePreviewCard` | Large glass card beside the resting pad: autoplay clip, text, facts; hover glow + scale + "Details" badge; click opens the lightbox |
| `StageLightbox` | Large player, full text, facts, prev/next, keyboard (Esc, ←, →) |
| `MiniWorldMap` | Map zoomed to the stage's sites, countries highlighted |

## Clips

Cut (with permission) from SK siltron, "300mm Silicon Wafer Manufacturing Process", and ABC Science, "How Silicon Is Made". 1280×720, H.264, no audio.

| File | Source | Time |
| --- | --- | --- |
| melting.mp4 | ABC Science | 0:36–0:40, 1:07–1:15, 2:21–2:25, 2:32–2:35, 3:30–3:39 (0.6 s crossfades) |
| step-1.mp4 | SK siltron | 0:04–0:14 |
| step-2.mp4 | SK siltron | 0:15–0:24 |
| step-3.mp4 | SK siltron | 0:42–0:49, 0:59–1:01, 1:04–1:06 |
| step-4.mp4 | SK siltron | 1:14–1:20, 2:06–2:07, 1:32–1:35 |
| step-5.mp4 | SK siltron | 3:24–3:27, 3:27–3:32, 3:55–3:58 |

Mobile layout is not included yet. Tune pause length (`HOLD`), station spacing (`GAP`) and scroll length in `CircuitProcessMap.tsx`.
