# César Solla — Mission Brief (GSAP)

16:9 · 1920×1080 · 30 fps · 61 s · 120 BPM. 100 % code: HTML + GSAP for picture, Node for the music.
Published in the hero of the portfolio (`assets/brief/mission-brief.mp4`).

| Cut (on the bar) | Scene |
|---|---|
| 0 s | **Ignition**: radar, target lock, data bus and IMU lock on with the beat, converge → name, *Aerospace Systems Engineer*, "I connect complex systems with clear decisions." |
| 8 s | A pulse becomes an aircraft → **Three disciplines** as holographic panels (Programme Execution · Systems Engineering · Data & Automation) |
| 14 s | **Leadership** can come from any position, over a network of people |
| 18 s | **Trajectory** in 3D: grid fly-over → chase camera, one role every bar (EY, Deloitte, Airbus BI, Eurodrone, A330 MRTT PMO) → crane-up |
| 32 s | **Credentials** ring: PMP, MSc, BSc, Salesforce, Cambridge C1 |
| 38 s | **Five languages** on a wireframe globe |
| 44 s | **Capabilities**: three per discipline, one per beat, each with its evidence |
| 53 s | "And yes, obviously… I can use AI too." |
| 56 s | Orbit-ring logo → **Ready for the next mission.** |

## Motion system

- **Laser-scan reveal**: a light blade sweeps each headline; glyphs ignite as it passes — stretched, over-exposed and
  RGB-split — then snap into place. Serif keywords bloom like ink and get a hand-drawn swash.
- **CRT exit**: glyphs collapse into bright scan lines from the centre out.
- **Holographic panels** open from a single scan line; small labels type on.
- Every cut gets an anamorphic lens streak and a scan band. A persistent HUD frame shows section, timecode and progress.

## How it renders

- `index.html` holds one **paused** GSAP timeline. `window.seek(t)` moves it and redraws the canvases as pure functions
  of `t`. No clock-driven animation; all randomness comes from a seeded PRNG.
- `capture.mjs` serves the folder and screenshots every 1/60 s with 6 headless Chromium pages → `frames/`
  (`--stills a,b,c` for review shots, `--range a,b` to re-capture part of the timeline).
- `render.mjs` blends frame pairs (60 → 30 fps motion blur), adds highlight bloom and fine grain, muxes the music and
  writes a bitrate-capped web cut + poster.
- `audio/music.mjs` synthesises the 120 BPM synthwave cue with impacts on every cut.

```bash
npm install
npm run all        # music → 3660 frames → renders/
npm run stills     # review stills → snapshots/
```

Live preview: serve the folder and open `index.html#play`, or `index.html#t=21.3` to inspect one instant.
