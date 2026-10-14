# ServerCesar agent and guardian

Two scheduled tasks on ServerCesar, both outbound-only (no open port):

| Task | Runs as | Job |
| --- | --- | --- |
| `ServerCesar Agent` | SYSTEM, at boot (+ revived every 5 min) | Keeps the Parsec and Tailscale services running, starts the guardian if it is missing, posts the PC + app health to `POST /api/agent/servercesar` every 30 s, and executes the only command Mission Control can send: `reboot` (`shutdown /r /f /t 20`). |
| `ServerCesar Guardian` | SERVERCESAR, at logon, unelevated (+ revived every 5 min) | Keeps Claude, ChatGPT, Parsec and Tailscale open in the desktop session, relaunches them when they close or hang, restarts Claude/ChatGPT at 05:00 when an update is staged, and writes their state to `state\apps.json`. |

"Signed in" is decided by the presence of each app's own session file (Claude
`config.json` token cache, `~/.codex/auth.json`, Parsec `user.bin`) and by
`tailscale status` (`BackendState = Running`). No credential is read out or sent.

A Wake-on-LAN packet can only power the PC on; restarting it needs this agent,
which is why the reboot button is only enabled while the agent reports in.

## Install / update

```powershell
# first install (as Administrator); the token file is deleted afterwards
.\install.ps1 -TokenFile C:\path\to\token.txt
# update scripts, keep the stored token
.\install.ps1
```

The token is the GitHub secret `SERVERCESAR_AGENT_TOKEN`, copied to Cloudflare
Pages by `.github/workflows/servercesar-secrets.yml`. On the PC it is stored
encrypted with machine-scoped DPAPI in `C:\ProgramData\ServerCesar\agent-token.enc`.

Logs: `C:\ProgramData\ServerCesar\logs\agent.log` and `state\guardian.log`.
