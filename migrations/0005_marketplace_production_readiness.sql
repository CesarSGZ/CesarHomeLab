ALTER TABLE ebay_opportunities ADD COLUMN source_url TEXT;
ALTER TABLE ebay_opportunities ADD COLUMN description TEXT;
ALTER TABLE ebay_opportunities ADD COLUMN image_urls TEXT;
ALTER TABLE ebay_opportunities ADD COLUMN condition_code TEXT NOT NULL DEFAULT 'NEW';
ALTER TABLE ebay_opportunities ADD COLUMN condition_description TEXT;

CREATE TABLE IF NOT EXISTS marketplace_app_credentials (
  service TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_secret_cipher TEXT NOT NULL,
  client_secret_iv TEXT NOT NULL,
  redirect_uri_name TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  updated_at INTEGER NOT NULL,
  updated_by TEXT NOT NULL
);
