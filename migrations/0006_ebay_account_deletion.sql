CREATE TABLE IF NOT EXISTS ebay_account_deletion_events (
  id TEXT PRIMARY KEY,
  payload_hash TEXT NOT NULL,
  received_at INTEGER NOT NULL,
  processing_status TEXT NOT NULL CHECK (processing_status IN ('acknowledged', 'processed', 'failed'))
);
