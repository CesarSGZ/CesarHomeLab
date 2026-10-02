# TRD-01 · Agent Office

Owner-only Mission Control module at `/control/#trading`. All trades are local simulations; no API endpoint can submit an IBKR order. No real broker account balances or holdings are imported.

## Runtime

Pages Functions check the owner capability and CSRF before forwarding requests through the private `TRADING_SERVICE` service binding. `cesar-trading-lab` has no public Worker URL. Its cron runs every five minutes even when the browser is closed. D1 stores the real-data paper ledger, events, proposals, a mutation lease and API spend. Quote messages from the local bridge trigger additional cycles; the lease serializes state transitions. Quotes use a separate table so incoming prices remain available during model calls.

The initial catalogue contains NASDAQ, NYSE and AMEX instruments from the Nasdaq screener, captured with a timestamp. It is refreshed daily where the provider permits access. Explicit filters select ordinary shares, exclude special securities, and prioritize $100M–$2B market caps with a secondary range through $5B. Catalogue prices are never used as executable quotes. New listing data, capitalization and access coverage depend on the provider; outages preserve the last complete catalogue and are recorded.

The explorer scans ten future earnings dates per cycle, rotating through a 45-day window. Calendar dates remain estimated until the owner supplies evidence from a primary source. The first version discovers earnings automatically; other catalysts and fundamental evidence enter through the event form. Model inputs use supplied evidence only; linked pages are not automatically retrieved. There is no SEC ingestion, historical backtest or benchmark yet.

## Agents and controls

Santi discovers with deterministic data queries; Pedro analyses and María reviews independently via Responses API structured outputs; Erea executes deterministic paper orders; Augusto audits closed trades via Responses API. The website starts in real-data mode with an empty EUR 10,000 ledger. Synthetic demo controls and API activation are disabled; legacy demo history is discarded on schema upgrade. Synthetic data exists only as explicitly seeded unit-test fixtures. Characters and tasks reflect the configured runtime, not five continuously running model processes.

Global pause stops entries while the operator still processes exits. Pausing the operator or disabling all automatic cycles also stops automatic exits. No daily entry quota is filled. Defaults: maximum two entries per US session, twenty positions, 0.35% planned capital risk per trade, tiered EUR lots up to available cash, 2% daily loss threshold. Real-time, recent, non-crossed bid/ask quotes and sufficient session traded volume are required. USD stock contracts must be found in IBKR; this does not verify account-specific purchasing permissions. Prices execute with spread, adverse slippage and commission. Gap stops execute at the observed bid, not the planned stop. This first simulator does not implement corporate actions, dividends, order-book depth or limit-order queues.

## EUR allocation and office

New entries use a EUR 500 total budget including commission, increasing to EUR 750 at EUR 15,000 equity and EUR 1,000 at EUR 20,000 (then +250 per further 5,000). The tier decreases when equity falls. Existing positions are not resized. Whole-share quantities leave unused cash; no position is required to fill a quota. Plans exceeding the permitted stop risk are rejected, rather than silently shrinking the requested lot. USD security prices remain separate from EUR accounting. A timestamped daily ECB EUR/USD reference rate converts valuations, purchase cost and exit proceeds; it is informational, not executable FX. Missing or more-than-seven-day-old FX blocks execution. FX changes are reflected in EUR results.

The detailed canvas office has a glass office for César, coffee and lounge area, five desks and interactive character/desk hit targets. Accessible HTML buttons expose tasks, queue and recorded results. An expanded dialog supports inspection at higher resolution. Characters move to their desks only for a recorded working status and wait by the coffee area otherwise. Reduced motion is respected.

## Credentials

OpenAI keys are submitted over authenticated HTTPS, encrypted with AES-GCM in D1 and never returned. `TRADING_ENCRYPTION_SECRET` is generated once by the deployment workflow and preserved across deployments. Do not rotate or remove it without migrating encrypted secrets. The $3 default daily inference budget reserves a conservative maximum before each request and records billed input/output tokens. Failed requests with unknown usage retain their reservation. Prices are configurable in code; the initial standard short-context rates are taken from https://developers.openai.com/api/docs/pricing. Data subscriptions, hosting and taxes are outside that inference counter.

## Local IBKR bridge

Download `control/ibkr-bridge.mjs` and `control/ibkr-bridge.env.example` after signing in. Save the example as `ibkr-bridge.env` next to the script, add the pairing token generated in Connections, and set `IBKR_CA_CERT` to the PEM certificate trusted for the local Client Portal Gateway. Node 22+ is required. Run `node ibkr-bridge.mjs`. Keep the process and Gateway running, and authenticate the Gateway through IBKR's supported flow. The bridge only performs allowlisted GET requests to HTTPS localhost; TLS verification stays enabled. It sends contract IDs and snapshots to the authenticated bridge endpoint every 30 seconds. Delayed data is not eligible for simulated entry. IBKR sessions and market-data entitlements must be provided by the user; this repository contains neither passwords nor login automation.

The bridge token is shown once, stored only as an encrypted SHA-256 verifier, and can be renewed to revoke the previous bridge. Never commit `ibkr-bridge.env` or certificates. This is a local simulated ledger, not IBKR's paper account.

Official IBKR references: https://www.interactivebrokers.com/docs/web-api/trading/market-data/top-of-book-snapshots and https://www.interactivebrokers.com/docs/web-api/authentication/cpgw/client-portal-gateway-faq.

## Deployment and verification

The backend is provisioned through the existing authorised local Cloudflare OAuth session. The normal Pages workflow remains responsible for the website and its service binding; it does not need D1 administration permissions. An optional manual `deploy-trading.yml` workflow applies the idempotent migration, deploys the Worker, and initializes its encryption secret if missing. That optional workflow requires a separate `CLOUDFLARE_TRADING_API_TOKEN` with D1 and Worker permissions. Alternatively use local authorised Wrangler for backend updates. Tests: `node --test tests/*.test.mjs`. Check the public endpoint rejects unauthorized callers; signed-in owner verification is a separate check.
