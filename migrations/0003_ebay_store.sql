-- Marketplace data is account-scoped through the authenticated control panel.
-- Seed rows deliberately use mock sources and are safe to replace after a provider is connected.
CREATE TABLE IF NOT EXISTS ebay_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  connection_status TEXT NOT NULL CHECK (connection_status IN ('not_connected', 'connected', 'error')),
  stock_sync_at INTEGER,
  price_sync_at INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS ebay_opportunities (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  supplier_sku TEXT NOT NULL,
  ean TEXT,
  title TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  supplier_cost_cents INTEGER NOT NULL,
  shipping_cost_cents INTEGER NOT NULL DEFAULT 0,
  estimated_sale_cents INTEGER NOT NULL,
  estimated_fee_cents INTEGER NOT NULL,
  estimated_profit_cents INTEGER NOT NULL,
  roi_basis_points INTEGER NOT NULL,
  match_confidence INTEGER NOT NULL CHECK (match_confidence BETWEEN 0 AND 100),
  stock_quantity INTEGER,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'drafted', 'listed', 'paused')) DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (provider_id) REFERENCES ebay_providers(id)
);
CREATE INDEX IF NOT EXISTS ebay_opportunities_status_score_idx ON ebay_opportunities(status, estimated_profit_cents DESC, match_confidence DESC);

CREATE TABLE IF NOT EXISTS ebay_listings (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  listing_status TEXT NOT NULL CHECK (listing_status IN ('draft', 'ready_to_publish', 'active', 'paused', 'ended')),
  external_listing_id TEXT,
  generated_at INTEGER NOT NULL,
  published_at INTEGER,
  monitored_at INTEGER,
  FOREIGN KEY (opportunity_id) REFERENCES ebay_opportunities(id)
);
CREATE INDEX IF NOT EXISTS ebay_listings_status_idx ON ebay_listings(listing_status, monitored_at);

CREATE TABLE IF NOT EXISTS ebay_orders (
  id TEXT PRIMARY KEY,
  listing_id TEXT,
  buyer_label TEXT NOT NULL,
  order_status TEXT NOT NULL CHECK (order_status IN ('paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  sale_cents INTEGER NOT NULL,
  fee_cents INTEGER NOT NULL,
  product_cost_cents INTEGER NOT NULL,
  shipping_cost_cents INTEGER NOT NULL DEFAULT 0,
  ordered_at INTEGER NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES ebay_listings(id)
);
CREATE INDEX IF NOT EXISTS ebay_orders_status_date_idx ON ebay_orders(order_status, ordered_at DESC);

CREATE TABLE IF NOT EXISTS ebay_credentials (
  service TEXT PRIMARY KEY,
  connection_status TEXT NOT NULL CHECK (connection_status IN ('not_connected', 'connected', 'error')),
  last_checked_at INTEGER,
  detail TEXT
);

CREATE TABLE IF NOT EXISTS ebay_activity_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  detail TEXT
);
CREATE INDEX IF NOT EXISTS ebay_activity_entity_idx ON ebay_activity_log(entity_type, entity_id, created_at DESC);

INSERT OR IGNORE INTO ebay_providers (id, name, provider_type, connection_status, notes) VALUES
  ('provider-bigbuy-demo', 'BigBuy', 'dropship_catalogue', 'not_connected', 'Seed provider: connect a catalogue feed or API before live use.'),
  ('provider-manual-demo', 'Manual research', 'manual', 'connected', 'Illustrative opportunities only; no supplier order can be sent.');

INSERT OR IGNORE INTO ebay_credentials (service, connection_status, detail) VALUES
  ('ebay_sell_api', 'not_connected', 'OAuth application credentials and seller consent are required.'),
  ('supplier_catalogue', 'not_connected', 'A supplier API key or scheduled catalogue feed is required.'),
  ('order_fulfilment', 'not_connected', 'Supplier order endpoint or manual fulfilment process is required.');

INSERT OR IGNORE INTO ebay_opportunities (id, provider_id, supplier_sku, ean, title, brand, category, supplier_cost_cents, shipping_cost_cents, estimated_sale_cents, estimated_fee_cents, estimated_profit_cents, roi_basis_points, match_confidence, stock_quantity, status, created_at, updated_at) VALUES
  ('opp-heatpad', 'provider-bigbuy-demo', 'BB-DEMO-HP-01', '5901234123457', 'Electric heat pad with 6 heat settings', 'DemoHome', 'Home & Garden', 1890, 495, 3999, 532, 1082, 4561, 98, 42, 'pending', 1780000000000, 1780000000000),
  ('opp-dock', 'provider-bigbuy-demo', 'BB-DEMO-DK-02', '5901234123458', 'USB-C 8-in-1 aluminium docking station', 'Nexora', 'Computing', 2410, 395, 4999, 665, 1529, 5442, 96, 18, 'pending', 1780000100000, 1780000100000),
  ('opp-lamp', 'provider-manual-demo', 'MR-DEMO-LP-03', '5901234123459', 'Rechargeable LED desk lamp, touch dimmer', 'LumaDesk', 'Home & Garden', 1260, 395, 2999, 399, 945, 5727, 93, 31, 'approved', 1780000200000, 1780000200000),
  ('opp-organiser', 'provider-bigbuy-demo', 'BB-DEMO-OR-04', '5901234123460', 'Modular cable organiser kit, 40 pieces', 'CableNest', 'Home & Garden', 840, 295, 2199, 292, 772, 6814, 91, 67, 'drafted', 1780000300000, 1780000300000),
  ('opp-stand', 'provider-bigbuy-demo', 'BB-DEMO-ST-05', '5901234123461', 'Adjustable aluminium laptop stand', 'Nexora', 'Computing', 1570, 395, 3499, 465, 1069, 5440, 97, 24, 'listed', 1780000400000, 1780000400000);

INSERT OR IGNORE INTO ebay_listings (id, opportunity_id, title, sku, price_cents, quantity, listing_status, generated_at, monitored_at) VALUES
  ('listing-organiser', 'opp-organiser', 'Modular Cable Organiser Kit - 40 Piece', 'CSG-OR-04', 2199, 67, 'ready_to_publish', 1780000500000, 1780000600000),
  ('listing-stand', 'opp-stand', 'Adjustable Aluminium Laptop Stand', 'CSG-ST-05', 3499, 24, 'active', 1780000500000, 1780000600000);

INSERT OR IGNORE INTO ebay_orders (id, listing_id, buyer_label, order_status, sale_cents, fee_cents, product_cost_cents, shipping_cost_cents, ordered_at) VALUES
  ('order-demo-01', 'listing-stand', 'Buyer #1042', 'shipped', 3499, 465, 1570, 395, 1779900000000),
  ('order-demo-02', 'listing-stand', 'Buyer #1078', 'processing', 3499, 465, 1570, 395, 1779986400000),
  ('order-demo-03', 'listing-stand', 'Buyer #1091', 'delivered', 3499, 465, 1570, 395, 1780072800000);
