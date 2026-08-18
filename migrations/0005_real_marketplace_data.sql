-- Production marketplace views contain only supplier/eBay sourced records.
-- The earlier seed remains useful for isolated development databases, but is
-- removed here so fresh and existing deployments converge on the same state.
DELETE FROM ebay_orders
WHERE id IN ('order-demo-01', 'order-demo-02', 'order-demo-03');

DELETE FROM ebay_listings
WHERE id IN ('listing-organiser', 'listing-stand');

DELETE FROM ebay_opportunities
WHERE id IN ('opp-heatpad', 'opp-dock', 'opp-lamp', 'opp-organiser', 'opp-stand');

DELETE FROM ebay_activity_log
WHERE entity_id IN (
  'order-demo-01', 'order-demo-02', 'order-demo-03',
  'listing-organiser', 'listing-stand',
  'opp-heatpad', 'opp-dock', 'opp-lamp', 'opp-organiser', 'opp-stand',
  'provider-manual-demo'
);

DELETE FROM ebay_providers WHERE id = 'provider-manual-demo';

UPDATE ebay_providers
SET notes = 'BigBuy free-account mode: real product data is entered manually; API access and supplier ordering remain disabled.'
WHERE id = 'provider-bigbuy-demo';

ALTER TABLE ebay_opportunities ADD COLUMN data_source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE ebay_opportunities ADD COLUMN source_reference TEXT;
ALTER TABLE ebay_opportunities ADD COLUMN verified_at INTEGER;

UPDATE ebay_opportunities
SET data_source = 'bigbuy_manual',
    source_reference = 'BigBuy SKU ' || supplier_sku,
    verified_at = updated_at
WHERE id LIKE 'bigbuy-manual-%';

ALTER TABLE ebay_orders ADD COLUMN data_source TEXT NOT NULL DEFAULT 'ebay_fulfillment_api';
ALTER TABLE ebay_orders ADD COLUMN financial_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (financial_status IN ('pending', 'reconciled'));
ALTER TABLE ebay_orders ADD COLUMN ebay_earnings_cents INTEGER;
ALTER TABLE ebay_orders ADD COLUMN refund_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ebay_orders ADD COLUMN payout_id TEXT;
ALTER TABLE ebay_orders ADD COLUMN last_synced_at INTEGER;
ALTER TABLE ebay_orders ADD COLUMN costs_confirmed_at INTEGER;

CREATE INDEX IF NOT EXISTS ebay_orders_financial_status_idx
ON ebay_orders(financial_status, costs_confirmed_at, ordered_at DESC);

CREATE TABLE IF NOT EXISTS ebay_financial_transactions (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  transaction_type TEXT NOT NULL,
  transaction_status TEXT,
  booking_entry TEXT,
  amount_cents INTEGER NOT NULL,
  fee_cents INTEGER NOT NULL DEFAULT 0,
  payout_id TEXT,
  currency TEXT NOT NULL DEFAULT 'EUR',
  transaction_at INTEGER,
  synced_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ebay_financial_transactions_order_idx
ON ebay_financial_transactions(order_id, transaction_at DESC);
CREATE INDEX IF NOT EXISTS ebay_financial_transactions_payout_idx
ON ebay_financial_transactions(payout_id, transaction_at DESC);

CREATE TABLE IF NOT EXISTS ebay_payouts (
  id TEXT PRIMARY KEY,
  payout_status TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  scheduled_at INTEGER,
  sent_at INTEGER,
  bank_reference TEXT,
  synced_at INTEGER NOT NULL
);

