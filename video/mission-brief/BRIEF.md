---
workflow: general-video
flow: automation
storyboard: no
message: "César connects complex systems with clear decisions — and has the trajectory to prove it."
destination: portfolio website (cesar-solla.pages.dev), embedded player
aspect: "16:9"
language: en
audience: recruiters and hiring managers landing on the portfolio
length: 40s
---

## Intent
Short, highly dynamic English brief that summarises César's profile so a recruiter is impressed in under a minute —
confident, never arrogant. Concept: the career as a flight, read off avionics instruments (matches the site's
"Flight Deck" redesign): pre-flight → take-off → climb (flight log) → cruise (disciplines) → descent (credentials) → landing (CTA).

## Assets
- Portrait, company logos and flags copied from the site's `assets/`.
- Fonts: Archivo (variable, condensed↔expanded) + DM Mono, bundled locally.

## Notes
- User request (ES): "corto, con mucho dinamismo, donde se muestre mi perfil y lo que soy capaz de hacer … sin soberbia".
- No narration.

## v2 (2026-10-07)
- Re-cut as a product launch for a candidate: flash-word open, name drop, spec sheet with count-ups,
  fast-learner role flicker, breakdown on the three disciplines, "features" drop, verified traits, end card.
- Audio: original 120 BPM track synthesised by `audio/make-music.mjs` (no samples), mixed with Pixabay-licensed
  SFX by `audio/mix.mjs` to -14 LUFS. Rebuild: `node audio/make-music.mjs && node audio/mix.mjs <sfx-dir>`.
