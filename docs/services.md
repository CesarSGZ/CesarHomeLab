# Service inventory

| ID | Service | Host | Access | Source of truth | Current role |
| --- | --- | --- | --- | --- | --- |
| WEB-01 | Public portfolio | Cloudflare Pages | Public HTTPS | Repository root | Personal website |
| HUB-01 | Cesar HomeLab | Cloudflare Pages | Authenticated HTTPS | `control/` | Private service portal |
| DB-01 | Control database | Cloudflare D1 | Pages binding only | `migrations/` | Users, sessions and operational data |
| MC-01 | Minecraft | ServerCesar | Game port + restricted portal controls | Server filesystem | Shared game server |
| AGT-01 | Minecraft recovery agent | ServerCesar | Outbound HTTPS only | `server-agent/` | Status and crash recovery |
| AGT-02 | ServerCesar agent + guardian | ServerCesar | Outbound HTTPS only; `SERVERCESAR_AGENT_TOKEN` | `server-agent/servercesar/` | Keeps Claude, ChatGPT, Parsec and Tailscale running, reports their health, remote reboot |
| LAB-01 | Terra Powerplant Lab | Cloudflare Pages | Owner portal | `control/data/` | Engineering experiment |
| GIT-01 | GitHub Galaxy | GitHub API + Cloudflare Pages | Owner portal | `control/galaxy-model.js` and authenticated read-only endpoint | Current architecture and source explorer |
| AGN-01 | Agencia (Agent Office) | Cloudflare Pages + ServerCesar | Owner portal (`agency:manage`) | `control/agency/`, `functions/_lib/agency.js`, `agency-backend/` | Scarlett Storm agency office. Director (chat, directives) and Karma Farmer (one r/AskReddit question a day via the official Reddit API) run on ServerCesar as the user task `Scarlett Agency` and sync over outbound HTTPS with `AGENCY_AGENT_TOKEN`. OpenAI key: Pages secret `OPENAI_API_KEY` |
| BTL-01 | Backtest Lab | GitHub Actions (Python) + Pages + D1 | Owner portal; runner token via the scoped D1 bridge | `backtest-lab/` and `control/backtest.js` | Weekly strategy backtests on the Spanish continuous market |

## Naming rule

New components should receive a stable service ID, a documented host and a
clear access boundary before they are added to the HomeLab portal.
