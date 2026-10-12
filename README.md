# Cesar HomeLab

Central repository for César's public portfolio, private HomeLab portal and the
small agents that connect cloud controls to services running on ServerCesar.

## Entry points

- Public portfolio: [cesar-solla.pages.dev](https://cesar-solla.pages.dev/)
- Private portal: [cesar-solla.pages.dev/control/](https://cesar-solla.pages.dev/control/)

## System map

| Area | Location | Runtime |
| --- | --- | --- |
| Public portfolio | `/` | Cloudflare Pages |
| Cesar HomeLab portal | `/control/` | Cloudflare Pages + Functions |
| Authentication and operational APIs | `/functions/` | Cloudflare Pages Functions |
| Users, sessions and operational data | `/migrations/` | Cloudflare D1 |
| Minecraft recovery agent | `/server-agent/` | ServerCesar / Windows |
| GitHub Galaxy | `/control/` | GitHub Actions + browser canvas |
| Thermal experiment | `/control/data/` and `/control/assets/thermal/` | Versioned static evidence |
| Backtest Lab (strategy backtests) | `/backtest-lab/` and `/control/backtest.js` | GitHub Actions (Python) + D1 |

The detailed boundaries and request flows are documented in
[`docs/architecture.md`](docs/architecture.md). The service inventory lives in
[`docs/services.md`](docs/services.md).

## Repository layout

```text
.
|-- control/         Private Cesar HomeLab frontend
|-- functions/       Cloudflare backend functions and API routes
|-- migrations/      D1 database schema history
|-- server-agent/    Restricted Minecraft recovery agent for Windows
|-- backtest-lab/    Python backtesting engine run by GitHub Actions (not in the Pages output)
|-- docs/            Architecture and service documentation
|-- assets/          Public portfolio assets
|-- index.html       Public portfolio entry point
|-- wrangler.jsonc   Cloudflare Pages and D1 configuration
`-- .github/         Automated production deployment
```

The public website source lives at the repository root, but Pages does not
serve the repository as-is: `scripts/build-pages-dist.mjs` copies an allowlist
(root `*.html`/`*.css`/`*.js`, `_headers`, `_routes.json`, `assets/` and
`control/`) into `dist/`, and only `dist/` is uploaded as static assets.
Everything else (`trading-worker/`, `migrations/`, `server-agent/`,
`backtest-lab/`, `video/`, docs, tests, config) stays out of the website.
Pages Functions are still bundled from `functions/` at the project root, so
their imports from `trading-worker/` and `control/` resolve at build time.
Runtime services and private data are not stored in GitHub.

## Deployment

Every push to `main` runs the GitHub Actions workflow in
`.github/workflows/deploy.yml`. Wrangler publishes `dist/` plus the bundled `functions/` to the
`cesar-solla` Cloudflare Pages project. Required tokens are GitHub Actions
secrets and are never committed.

The same workflow rebuilds the Gource-style GitHub Galaxy from every public
repository owned by `CesarSGZ`. A scheduled run repeats the discovery every 15
minutes so new repositories and external changes appear automatically.

## Security boundaries

- The GitHub repository contains source code, never real passwords or service tokens.
- Authentication data and sessions live in Cloudflare D1.
- The Minecraft agent accepts only the predefined `restart` command over outbound HTTPS.

## Local development

### Frontend development

The frontend has no compilation step. Open `index.html` directly or serve the
repository with a local static server. Never commit local secrets.
