# César Solla González — Interactive Portfolio

Interactive, responsive portfolio presented as an aerospace mission-control experience.

## Live website

[cesar-solla.pages.dev](https://cesar-solla.pages.dev/)

## Development

The website is static and has no build step. Open `index.html` directly or serve this directory with any local static server.

Every push to the `main` branch is automatically deployed to Cloudflare Pages by the GitHub Actions workflow.

## Structure

- `index.html` — content and structure
- `styles.css`, `enhancements.css`, `trajectory.css`, `polish.css`, `mobile.css` — design, responsive layout and animations
- `script.js` — interactive effects, timeline and capability filtering
- `assets/` — public portfolio images
- `control/` — authenticated Mission Control, including the Terra Powerplant Lab
- `control/data/terra-thermal-summary.json` — generated thermal-model contract

## Terra Powerplant Lab data

The Mission Control module reads a static, versioned export produced by the
engineering repository. Refresh it with the Terra lab exporter before publishing
new measurements or model results; the UI does not duplicate engineering values
inside JavaScript.
