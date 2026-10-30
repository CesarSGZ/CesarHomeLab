# Service inventory

| ID | Service | Host | Access | Source of truth | Current role |
| --- | --- | --- | --- | --- | --- |
| WEB-01 | Public portfolio | Cloudflare Pages | Public HTTPS | Repository root | Personal website |
| HUB-01 | Cesar HomeLab | Cloudflare Pages | Authenticated HTTPS | `control/` | Private service portal |
| DB-01 | Control database | Cloudflare D1 | Pages binding only | `migrations/` | Users, sessions and operational data |
| AGT-02 | ServerCesar agent + guardian | ServerCesar | Outbound HTTPS only; `SERVERCESAR_AGENT_TOKEN` | `server-agent/servercesar/` | Keeps Claude, ChatGPT, Parsec and Tailscale running, reports their health, remote reboot |
| LAB-01 | Terra Powerplant Lab | Cloudflare Pages | Owner portal | `control/data/` | Engineering experiment |
| GIT-01 | GitHub Galaxy | GitHub API + Cloudflare Pages | Owner portal | `control/galaxy-model.js` and authenticated read-only endpoint | Current architecture and source explorer |
| BTL-01 | Backtest Lab | GitHub Actions (Python) + Pages + D1 | Owner portal; runner token via the scoped D1 bridge | `backtest-lab/` and `control/backtest.js` | Weekly strategy backtests on the Spanish continuous market |

## Naming rule

New components should receive a stable service ID, a documented host and a
clear access boundary before they are added to the HomeLab portal.
