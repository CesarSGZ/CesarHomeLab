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
- AI Chat uses the existing private session; only CesarVapor has access. OpenAI keys stay server-side.

## Local development

## Private AI Chat

The AI Chat tab is owner-only and reuses the existing HomeLab session; it is not
a ChatGPT login proxy. Configure a project API key in the private connection
form, or use the optional OPENAI_API_KEY server secret. The form requires the
existing TOKEN_ENCRYPTION_SECRET. ChatGPT subscriptions and history are not used.
Keys are encrypted with AES-GCM and never returned by the configuration API.
Only same-origin requests with a valid CSRF token can change settings or send messages.

Migration 0007 was applied to the production D1 database before the first chat
deployment. For a new environment, apply migrations/0007_private_chat.sql with
Wrangler before publishing. The deployment workflow runs the isolated chat tests.
History is stored per owner in D1; conversations can be deleted from the UI.
Requests send only the most recent 20 messages within a 40,000-character budget
to the Responses API with store:false. There are no browsing, file or server tools.
The initial model is GPT-5 mini, with a 4,000-output-token cap and a 30-request
hourly safety limit. Also set an OpenAI project budget; these limits are not
a monetary spending guarantee.

Retired marketplace UI, integrations and endpoints have been removed. Historical
migrations and existing database records are retained for migration continuity;
they are not read or operated by the portal. External seller accounts and listings
have not been modified.

Run isolated backend tests with: node --test tests/chat.test.mjs

### Frontend development

The frontend has no compilation step. Open `index.html` directly or serve the
repository with a local static server. Use `.dev.vars.example` as the list of
optional local environment variables; never commit `.dev.vars`.
