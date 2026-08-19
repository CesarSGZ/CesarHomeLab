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

Private browser -- Tailscale --> ServerCesar Stirling PDF
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

Runs the actual workloads. The Minecraft agent polls Cloudflare over outbound
HTTPS and accepts only a restricted restart order. Stirling PDF listens on
localhost and Tailscale Serve provides the private HTTPS route.

### Tailscale

Provides private device-to-device access. The PDF service is available only to
devices authorised in the tailnet; it is not exposed with a router port forward.

## Change workflow

1. Create an `agent/...` branch from `main`.
2. Make and validate one coherent change.
3. Push the branch and open a pull request.
4. Merge into `main`.
5. GitHub Actions deploys the exact merged commit to Cloudflare Pages.

## GitHub Galaxy data

The deployment workflow rebuilds `control/data/github-galaxy.json` from real
Git history on every push to `main` and every 15 minutes. It discovers all
public repositories owned by `CesarSGZ`, clones their history temporarily and
exports repository, branch, commit, author and file-change data for the private
Gource-style visualisation. Future public repositories appear without a portal
code change.
