# CesarPC remote ChatGPT browser

This is a **remote browser view**, not an unofficial ChatGPT API or a login proxy.
The owner signs into the dedicated visible Microsoft Edge window on CesarPC.
Do not copy a personal browser profile, authentication cookies or passwords.

## Components

- host.mjs uses a separate profile under the owner's LocalAppData and a local
  Playwright pipe. No browser debugging port is exposed.
- A local control page binds only to 127.0.0.1:18763. Open/paused actions require
  a per-process CSRF token and exact local origin.
- worker/ contains a separate Cloudflare Durable Object WebSocket relay.
  The host connects outbound with a dedicated secret. There are no router rules.
- The Pages /control/api/remote/connect endpoint authorises CesarVapor from the
  existing HomeLab session and forwards the connection with a different secret.
- Viewer leases expire after five minutes and reconnect through the portal,
  rechecking the current session and permissions. One viewer at a time.
- Frames and input are forwarded in memory, not persisted or logged by the app.
  Transport is TLS on both legs, not end-to-end encrypted against Cloudflare.

## Installation and maintenance

Deploy the relay with Wrangler using worker/wrangler.jsonc. Note its actual
workers.dev URL, then run install.ps1 -RelayUrl <that URL> on CesarPC.
The installer creates random host/viewer secrets, configures the cloud secrets,
restricts the local profile directory to the current Windows user and SYSTEM,
and attempts a limited interactive scheduled task at Windows login.
No Windows password is stored. Start the host manually with start-host.ps1
if task creation is unavailable.

For Google sign-in, run local-login.ps1 first. It stops the remote host and opens
the same dedicated profile in ordinary Edge with no automation attached. Sign in
manually, close that dedicated window, then run start-host.ps1 to resume sharing.
This uses normal browser authentication, not stealth flags or copied cookies.
Do not send credentials to Codex. Google or ChatGPT can still require fresh
authentication or decline a browser session; do not bypass those checks.
Keep CesarPC awake and its Windows user signed in. Browser capture while the
desktop is locked or the window minimised can depend on the graphics environment.
Closing that browser stops its view; reopen it from the local control page.

The relay is deployed separately from Pages because it owns a Durable Object.
Deploy it again with its Wrangler config when worker/ or protocol.mjs changes.
The main website retains its normal GitHub deployment and URL.

## Deliberate limits

Only validated mouse, text, limited navigation keys, resizing and ChatGPT-home
commands are accepted. No arbitrary CDP, JavaScript, URLs, shell commands or
filesystem actions can be supplied by a remote viewer. Right-click menus,
privileged keyboard shortcuts, file selection/downloads, microphone and system
clipboard synchronisation are not provided. Remote full-desktop access is absent.

Top-level navigation is restricted to ChatGPT. Authentication sites are allowed
only while no remote viewer is connected so login is performed locally. Basic
private-IP and local-resource requests are rejected, but the browser is not a
general-purpose hostile-site isolation container: it must remain dedicated to
the owner's ChatGPT usage. No anti-bot checks or authentication challenges are
bypassed. Renew sign-in locally if ChatGPT requests it.

Pause sharing from http://127.0.0.1:18763/. Closing the portal tab disconnects the
viewer; closing the dedicated browser stops sharing that page. To uninstall,
stop the host, remove its scheduled task and optionally delete its private profile
after explicitly deciding whether to sign out and discard the stored session.
Use trusted computers; whoever can operate your authenticated HomeLab view can
read and interact with your ChatGPT account.
