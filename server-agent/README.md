# Mission Control server agent

This Windows-only agent polls Cloudflare over outbound HTTPS. It never opens a
port and it cannot execute arbitrary commands. The only accepted command is
`restart`.

For a restart it identifies the configured Minecraft Java process, terminates
its complete process tree with Windows `taskkill /T /F`, removes a stale
launcher, runs the configured launch script and waits until both the expected
Java process and the local Minecraft port are available. It reports progress
and the final result to Mission Control.

## Server installation

1. Copy the complete `server-agent` folder to the Minecraft PC.
2. Run `setup-agent.ps1` and provide the server folder, launch script, unique
   Java command-line fragment, port and one-time agent token.
3. Run `mission-control-agent.ps1` interactively and verify that Mission Control
   reports the agent as online.
4. When verified, run `install-agent-task.ps1` as Administrator.

The scheduled task runs as `SYSTEM`, starts with Windows and is restarted if it
fails. The token is encrypted using machine-scoped Windows DPAPI and is only
decryptable on that computer. Do not copy `agent-token.enc` to another machine.

The hard stop can lose unsaved world data if Java is still responsive. It is
intended as recovery for a crashed or hung server, as requested.
