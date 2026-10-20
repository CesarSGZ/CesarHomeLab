# ServerCesar agent and guardian

Two scheduled tasks on ServerCesar, both outbound-only (no open port):

| Task | Runs as | Job |
| --- | --- | --- |
| `ServerCesar Agent` | SYSTEM, at boot (+ revived every 5 min) | Keeps the Parsec and Tailscale services running, starts the guardian if it is missing, posts the PC + app health to `POST /api/agent/servercesar` every 120 s, and executes the only commands Mission Control can send: `reboot` (`shutdown /r /f /t 20`) and `shutdown` (full S5 shutdown after router preparation). |
| `ServerCesar Guardian` | SERVERCESAR, at logon, unelevated (+ revived every 5 min) | Keeps Claude, ChatGPT, Parsec and Tailscale open in the desktop session, relaunches them when they close or hang, restarts Claude/ChatGPT at 05:00 when an update is staged, and writes their state to `state\apps.json`. |

The session-cache indicator reports the presence of each app's own session file (Claude
`config.json` token cache, `~/.codex/auth.json`, Parsec `user.bin`) and by
`tailscale status` (`BackendState = Running`). No credential is read out or sent.

A Wake-on-LAN packet can only power the PC on; restarting or shutting it down
needs this agent, which is why those buttons are only enabled while the agent
reports in. Wake-on-LAN recovery must be verified separately for S3, S4 and S5. S5 recovery passed on 18 October 2026 and the shutdown button is enabled. Agent 1.5.1 implements full S5 shutdown and additionally requires the administrator-managed `s5-wake-verified.txt` marker in its protected root. The marker was created after that test.

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

Agent 1.5.1 runs `prepare-wake.ps1` before accepting a low-power command. It starts the separately configured `ServerCesar Router ARP` task and requires a new successful completion within 90 seconds; a missing task, failure or timeout cancels the transition. Router credentials and helper configuration stay outside the repository. This is necessary because the router can relearn a dynamic ARP entry after resume; a five-minute refresh is insufficient immediately before another transition.

On 18 October, two S4 tests with a freshly restored permanent ARP entry returned about 63–64 seconds after hibernation, well before the seven-minute rescue timer. Windows recorded S4 but no wake-source identity. A repeat without restoring ARP returned only by the rescue timer. These results support the preparation step, but do not establish S5 recovery or recovery after the router restarts while the PC is off. A subsequent S5 test issued full shutdown at 11:31:55 (Europe/Madrid); external GitHub workflow 39115678527 sent packets from 11:33:38 and Windows recorded a cold boot (Kernel-Boot event 27, BootType 0) at 11:34:08, with no wake-timer recovery. Full shutdown is now enabled, retaining the recent-route and immediate-router-preparation checks. A router restart while the PC is off remains an unverified recovery scenario.

A received UDP packet while Windows is awake confirms delivery only. It does not prove wake support. Agent 1.5 reports the most recent Windows Power-Troubleshooter event as `lastResume` (time, S3/S4, network/timer/other/unknown). The dashboard distinguishes a timer wake from network wake and does not count a later boot alone as proof of WOL. A missing heartbeat means no response, not a confirmed shutdown. Cached authentication files likewise do not prove that the service still accepts the session.

For sleep/hibernate testing, register and verify a WakeToRun safety task 6–10 minutes ahead before requesting the delayed external packet. Record the sleep entry and Windows wake cause afterward. WakeToRun is not a recovery mechanism for S5: test full shutdown only with an independent recovery path or someone available at the PC. Keep private network targets and credentials outside this repository.

On the Gigabyte X470 AORUS Gaming 7 WIFI, the board manual lists Power > Wake on LAN and ErP. Check Wake on LAN = Enabled and ErP = Disabled in person if network wake still fails. AC BACK = Always On is an optional recovery setting when using a managed power outlet; it does not itself provide remote power control.

## Recovery regression — 20 October 2026
The user could not wake the PC after the production shutdown on 18 October and required a physical power-on. Shutdown is disabled again and the local S5 verification marker revoked. On return, the Intel Ethernet adapter reports no physical link (Wi-Fi is connected), and router maintenance rejects a changed SSH host key. These observations do not establish when the link or router identity changed. Do not re-enable shutdown based only on the earlier short test; validate the current wired path, router identity, and delayed recovery first.


20 October, subsequent recovery: the owner reported the cable had been moved to a router port disabled by the ISP. Ethernet subsequently returned with the expected DHCP address and 1 Gbps link; packet delivery from the external relay and immediate router preparation passed. The gateway retained its hardware address after the ISP intervention; its replacement SSH key was pinned. At the owner's request shutdown was re-enabled without another S5 test. Agent 1.5.2 now additionally refuses shutdown if the physical adapter matching the private WOL MAC has no live link; Wi-Fi connectivity alone is insufficient. The previous cold-boot test remains the S5 evidence; long-delay and router-restart recovery have not been re-tested.

