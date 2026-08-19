# Service inventory

| ID | Service | Host | Access | Source of truth | Current role |
| --- | --- | --- | --- | --- | --- |
| WEB-01 | Public portfolio | Cloudflare Pages | Public HTTPS | Repository root | Personal website |
| HUB-01 | Cesar HomeLab | Cloudflare Pages | Authenticated HTTPS | `control/` | Private service portal |
| DB-01 | Control database | Cloudflare D1 | Pages binding only | `migrations/` | Users, sessions and operational data |
| MC-01 | Minecraft | ServerCesar | Game port + restricted portal controls | Server filesystem | Shared game server |
| AGT-01 | Minecraft recovery agent | ServerCesar | Outbound HTTPS only | `server-agent/` | Status and crash recovery |
| PDF-01 | Stirling PDF | ServerCesar | Tailscale HTTPS only | `C:\Homelab` on ServerCesar | Private PDF workshop |
| LAB-01 | Terra Powerplant Lab | Cloudflare Pages | Owner portal | `control/data/` | Engineering experiment |
| MKT-01 | eBay workspace | Cloudflare Pages + D1 | Owner portal | `functions/control/api/ebay/` | Marketplace operations |

## Naming rule

New components should receive a stable service ID, a documented host and a
clear access boundary before they are added to the HomeLab portal.
