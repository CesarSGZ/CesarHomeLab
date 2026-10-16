# ServerCesar agent and guardian

Two scheduled tasks on ServerCesar, both outbound-only (no open port):

| Task | Runs as | Job |
| --- | --- | --- |
| `ServerCesar Agent` | SYSTEM, at boot (+ revived every 5 min) | Keeps the Parsec and Tailscale services running, starts the guardian if it is missing, posts the PC + app health to `POST /api/agent/servercesar` every 120 s, and executes the only commands Mission Control can send: `reboot` (`shutdown /r /f /t 20`) and `shutdown` (S3 suspend; currently disabled by the web). |
| `ServerCesar Guardian` | SERVERCESAR, at logon, unelevated (+ revived every 5 min) | Keeps Claude, ChatGPT, Parsec and Tailscale open in the desktop session, relaunches them when they close or hang, restarts Claude/ChatGPT at 05:00 when an update is staged, and writes their state to `state\apps.json`. |

The session-cache indicator reports the presence of each app's own session file (Claude
`config.json` token cache, `~/.codex/auth.json`, Parsec `user.bin`) and by
`tailscale status` (`BackendState = Running`). No credential is read out or sent.

A Wake-on-LAN packet can only power the PC on; restarting or shutting it down
needs this agent, which is why those buttons are only enabled while the agent
reports in. Wake-on-LAN recovery must be verified separately for S3, S4 and S5. The shutdown button remains disabled until recovery is verified; the current agent command suspends to S3 rather than shutting down to S5.

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

## Power-state evidence

A received UDP packet while Windows is awake confirms delivery only. It does not prove wake support. Agent 1.5 reports the most recent Windows Power-Troubleshooter event as `lastResume` (time, S3/S4, network/timer/other/unknown). The dashboard distinguishes a timer wake from network wake and does not count a later boot alone as proof of WOL. A missing heartbeat means no response, not a confirmed shutdown. Cached authentication files likewise do not prove that the service still accepts the session.

For sleep/hibernate testing, register and verify a WakeToRun safety task 6–10 minutes ahead before requesting the delayed external packet. Record the sleep entry and Windows wake cause afterward. WakeToRun is not a recovery mechanism for S5: test full shutdown only with an independent recovery path or someone available at the PC. Keep private network targets and credentials outside this repository.

On the Gigabyte X470 AORUS Gaming 7 WIFI, the board manual lists Power > Wake on LAN and ErP. Check Wake on LAN = Enabled and ErP = Disabled in person if network wake still fails. AC BACK = Always On is an optional recovery setting when using a managed power outlet; it does not itself provide remote power control.