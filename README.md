# Cesar HomeLab

Central repository for César's public portfolio, private HomeLab portal and the
small agents that connect cloud controls to services running on ServerCesar.

## Entry points

- Public portfolio: [cesar-solla.pages.dev](https://cesar-solla.pages.dev/)
- Private portal: [cesar-solla.pages.dev/control/](https://cesar-solla.pages.dev/control/)
- PDF workspace: available only inside the Tailscale network

## System map

| Area | Location | Runtime |
| --- | --- | --- |
| Public portfolio | `/` | Cloudflare Pages |
| Cesar HomeLab portal | `/control/` | Cloudflare Pages + Functions |
| Authentication and operational APIs | `/functions/` | Cloudflare Pages Functions |
| Users, sessions and operational data | `/migrations/` | Cloudflare D1 |
| Minecraft recovery agent | `/server-agent/` | ServerCesar / Windows |
| PDF Tools | linked from `/control/` | ServerCesar / Stirling PDF / Tailscale |
| GitHub Galaxy | `/control/` | GitHub Actions + browser canvas |
| Thermal experiment | `/control/data/` and `/control/assets/thermal/` | Versioned static evidence |

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
|-- docs/            Architecture and service documentation
|-- assets/          Public portfolio assets
|-- index.html       Public portfolio entry point
|-- wrangler.jsonc   Cloudflare Pages and D1 configuration
`-- .github/         Automated production deployment
```

The public website deliberately remains at the repository root because
Cloudflare Pages deploys the project without a build step. Runtime services and
private data are not stored in GitHub.

## Deployment

Every push to `main` runs the GitHub Actions workflow in
`.github/workflows/deploy.yml`. Wrangler publishes the repository to the
`cesar-solla` Cloudflare Pages project. Required tokens are GitHub Actions
secrets and are never committed.

The same workflow rebuilds the Gource-style GitHub Galaxy from every public
repository owned by `CesarSGZ`. A scheduled run repeats the discovery every 15
minutes so new repositories and external changes appear automatically.

## Security boundaries

- The GitHub repository contains source code, never real passwords or service tokens.
- Authentication data and sessions live in Cloudflare D1.
- The Minecraft agent accepts only the predefined `restart` command over outbound HTTPS.
- Stirling PDF is private to the Tailscale network and is not proxied through the public site.
- eBay and BigBuy integrations remain disabled until their Cloudflare secrets and explicit live switches are configured.

## Local development

The frontend has no compilation step. Open `index.html` directly or serve the
repository with a local static server. Use `.dev.vars.example` as the list of
optional local environment variables; never commit `.dev.vars`.
