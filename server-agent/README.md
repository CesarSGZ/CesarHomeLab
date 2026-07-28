# Mission Control server agent

This Windows-only agent polls Cloudflare over outbound HTTPS. It never opens a
port and it cannot execute arbitrary commands. The only accepted command is
`restart`, which invokes one locally configured `.ps1` file without arguments.

## Server installation

1. Create and test a dedicated `restart-minecraft.ps1` on the Minecraft PC.
2. Run `setup-agent.ps1` as the same Windows user that owns the server process.
3. Run `mission-control-agent.ps1` interactively and verify that Mission Control
   reports the agent as online.
4. When verified, run `install-agent-task.ps1` as Administrator.

The agent token is encrypted using Windows DPAPI and is only decryptable by the
same Windows user on the same computer.
