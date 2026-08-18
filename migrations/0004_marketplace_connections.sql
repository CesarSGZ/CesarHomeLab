CREATE TABLE IF NOT EXISTS marketplace_oauth_states (
  state_hash TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS marketplace_oauth_states_expiry_idx ON marketplace_oauth_states(expires_at);

CREATE TABLE IF NOT EXISTS marketplace_tokens (
  service TEXT PRIMARY KEY,
  access_cipher TEXT NOT NULL,
  access_iv TEXT NOT NULL,
  refresh_cipher TEXT,
  refresh_iv TEXT,
  access_expires_at INTEGER NOT NULL,
  refresh_expires_at INTEGER,
  scopes TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS marketplace_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS marketplace_sync_jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  scanned_count INTEGER NOT NULL DEFAULT 0,
  opportunity_count INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  requested_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS marketplace_sync_jobs_date_idx ON marketplace_sync_jobs(started_at DESC);

ALTER TABLE ebay_listings ADD COLUMN external_offer_id TEXT;
ALTER TABLE ebay_listings ADD COLUMN publish_error TEXT;

INSERT OR IGNORE INTO marketplace_settings (setting_key, setting_value, updated_at, updated_by) VALUES
  ('marketplace_id', 'EBAY_ES', 1787000000000, 'migration'),
  ('currency', 'EUR', 1787000000000, 'migration'),
  ('locale', 'es-ES', 1787000000000, 'migration'),
  ('inventory_location_key', 'csg-bigbuy-es', 1787000000000, 'migration'),
  ('default_shipping_cents', '495', 1787000000000, 'migration'),
  ('minimum_profit_cents', '500', 1787000000000, 'migration'),
  ('minimum_roi_basis_points', '2000', 1787000000000, 'migration'),
  ('estimated_fee_basis_points', '1350', 1787000000000, 'migration'),
  ('live_publish_enabled', 'false', 1787000000000, 'migration');
