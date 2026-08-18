# César Solla González — Interactive Portfolio

Interactive, responsive portfolio presented as an aerospace mission-control experience.

## Live website

[cesar-solla.pages.dev](https://cesar-solla.pages.dev/)

## Development

The website is static and has no build step. Open `index.html` directly or serve this directory with any local static server.

Every push to the `main` branch is automatically deployed to Cloudflare Pages by the GitHub Actions workflow.

## Structure

- `index.html` — content and structure
- `styles.css`, `enhancements.css`, `trajectory.css`, `polish.css`, `mobile.css` — design, responsive layout and animations
- `script.js` — interactive effects, timeline and capability filtering
- `assets/` — public portfolio images
- `control/` — authenticated Mission Control, including the Terra Powerplant Lab
- `control/data/terra-thermal-summary.json` — generated thermal-model contract
- `migrations/0003_ebay_store.sql` — original eBay Store data model
- `functions/_lib/marketplace-schema.js` — idempotent real-data bootstrap and financial reconciliation schema

## Terra Powerplant Lab data

The Mission Control module reads a static, versioned export produced by the
engineering repository. Refresh it with the Terra lab exporter before publishing
new measurements or model results; the UI does not duplicate engineering values
inside JavaScript.

## eBay Store MVP

The owner account (`cesarvapor`) has an eBay Store area in Mission Control. It is
deliberately in setup mode until its external connections are approved and configured:

- opportunities are ranked and require a manual approve/reject decision;
- approved products can generate local listing drafts;
- publishing is blocked server-side unless an eBay Sell API connection is marked
  as connected and both independent live-publishing switches are enabled;
- the marketplace bootstrap removes all illustrative opportunities,
  listings and orders; empty states show zero rather than synthetic commerce;
- orders come from eBay Fulfillment, while gross earnings and deductions come
  from eBay Finances. Supplier costs are manually confirmed in free BigBuy mode;
  only fully reconciled orders are included in realised P&L.

The BigBuy free-account path does not require a subscription or API key. An
authenticated owner can copy a product's SKU, EAN, distributor price, expected
sale price and stock into Mission Control. The server calculates fees, profit
and ROI and adds the result to the same approval queue. This path never places a
supplier order. The paid BigBuy API connector remains optional and disabled
when `BIGBUY_API_KEY` is absent.

Apply the migration with the same D1 migration process used for the existing
Mission Control database before deploying the feature. Do not store supplier or
eBay secrets in the repository; configure them in the Cloudflare secret store.

The production connection layer expects these Cloudflare secrets:

- `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET` and `EBAY_RUNAME`;
- `TOKEN_ENCRYPTION_SECRET` (at least 32 characters) for encrypted OAuth tokens;
- `BIGBUY_API_KEY` for catalogue, price and stock synchronisation.
- `EBAY_ADDRESS_LINE1`, `EBAY_CITY`, `EBAY_POSTAL_CODE` and optionally
  `EBAY_ADDRESS_LINE2` / `EBAY_PROVINCE` for the Inventory API location.
- `EBAY_LIVE_PUBLISHING=true` only after the seller account is fully verified.

Migration `0004_marketplace_connections.sql` adds encrypted OAuth token storage,
short-lived OAuth state, marketplace settings and sync-job history. Live eBay
publishing remains off until `live_publish_enabled` is explicitly changed from
`false` after policies and the seller payout account have been verified.
