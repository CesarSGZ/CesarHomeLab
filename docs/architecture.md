# Cesar HomeLab architecture

## Purpose

Cesar HomeLab is the umbrella system. The public portfolio is its public-facing
site, while `/control/` is the authenticated portal for private services and
projects.

```text
GitHub main
    |
    | GitHub Actions + Wrangler
    v
Cloudflare Pages ---------------- Public portfolio
    |
    +-- Pages Functions ---------- Authentication and APIs
    |
    +-- D1 ----------------------- Users, sessions and operational state
    |
    +-- outbound command queue <-- ServerCesar Minecraft agent

```

## Boundaries

### GitHub

Stores versioned source code, deployment automation, database migrations and
agent installation scripts. It does not run Minecraft, Stirling PDF or the D1
database.

### Cloudflare

Hosts the portfolio and HomeLab portal. Pages Functions enforce authentication,
permissions and command validation. D1 stores application state. Secrets are
configured outside the repository.

### ServerCesar

Runs Minecraft. Its agent polls Cloudflare over outbound HTTPS and accepts
only a restricted restart order. Galaxy is read-only and never issues commands.

### Tailscale

Provides private device-to-device access for administration. The web-based
Minecraft command flow uses the agent's outbound HTTPS connection, not a
browser-to-Tailscale connection.

## Change workflow

1. Create an `agent/...` branch from `main`.
2. Make and validate one coherent change.
3. Push the branch and open a pull request.
4. Merge into `main`.
5. GitHub Actions deploys the exact merged commit to Cloudflare Pages.

## GitHub Galaxy data

Galaxy now explains the current CesarHomeLab architecture, not historical file
trees. `control/galaxy-model.js` defines the eight components, their curated
relationships and read-only guided explanations. Source-file lists come from
the current main commit and exclude retired features; file counts are not
service-health indicators. Historical migrations remain intact in Git.

`GET /control/api/github/status` requires the `github:read` capability. It reads
the fixed public repository's latest commits, the tree at that exact commit,
and the latest deploy-workflow result. It never writes to GitHub or runs a
deployment. Results are cached at the edge for 90 seconds. The view polls every
five minutes while visible and has a manual Refresh button. An optional
server-side `GITHUB_READ_TOKEN` can raise the public API quota; it is never sent
to the browser. API failures do not become success or live-health claims.

The deployment workflow rebuilds `control/data/github-galaxy.json` from its
checked-out HEAD on each deployment. If GitHub is unavailable, the interface
explicitly labels this as a saved deployment snapshot with its timestamp.

Verify the model and API with `node --test tests/github-galaxy.test.mjs`.
