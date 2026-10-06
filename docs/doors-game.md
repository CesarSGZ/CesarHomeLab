# Juego de las Puertas

Shared, authenticated multiplayer party game at `/control/#doors`.
Every existing/future Mission Control account receives `doors:play`. This does **not**
grant access to training, trading, GitHub, thermal data or Minecraft operations.

## Play

1. Create a lobby, copy its invitation, and gather 3–12 distinct accounts.
2. All players mark themselves ready; the host starts.
3. Each living player receives a private role and creates a scenario/weapon door, in turn.
4. Server-side dice assign visible rewards to some doors. Players choose in turn; doors are not exclusive.
5. Existing weapon cards can be played. The door creators then assign secret enemies.
6. A sealed-enemy window permits Spy and Bait, followed by public reveal and enemy/mutation cards.
7. The group discusses in room chat and votes secretly on each combat. A majority against loses one life.
8. Living players receive their chosen door reward after resolution. The two last living players win.

The rulebook inside the game documents necessary digital clarifications: tie handling,
rotating first player, scalable deck composition, 15-second reaction windows,
one reflection per action, immediate two-survivor victory, and reward timing.
The local prompt generator is creative inspiration, **not an AI combat judge**.

## Architecture

- `control/doors-catalog.js`: public roles, all 12 card definitions, creative prompts.
- `functions/_lib/doors-engine.js`: authoritative transitions, secret redaction, card effects and votes.
- `functions/control/api/doors/[[path]].js`: session/CSRF checks, lobby listing, room actions and persistence.
- `control/doors.js` / `doors.css`: responsive, keyboard-accessible animated tabletop and chat.
- `doors_rooms` in existing Cloudflare D1: room state plus an optimistic revision.

Clients poll visible rooms every three seconds (and can manually refresh). Writes use
the current revision and an atomic conditional update; conflicts never overwrite another action.
Every API snapshot is individually redacted. Unauthenticated users see no rooms;
nonmembers can see only lobby title, participant names and invitation code, never game secrets.
Votes are disclosed only when their ballot finishes. Chat/input are displayed as escaped text.
Rooms do not depend on any local PC, browser bridge, model API or third-party game service.
Temporary disconnection does not discard membership: log in again and resume the same room.
If an absent player cannot return, the host can explicitly close the match and create another.

## Deployment and checks

The main deployment workflow runs regression tests, idempotently creates the D1 table
using `migrations/0012_doors_game.sql`, and then publishes Pages.

```sh
node --test tests/doors.test.mjs
node --test tests/*.test.mjs
pnpm dlx wrangler@4.124.0 pages functions build
```

Tests cover full rounds, all card types, secret boundaries, deaths/rewards, wins,
scalable roles, auth/CSRF, membership and stale-version conflicts using real SQLite.
