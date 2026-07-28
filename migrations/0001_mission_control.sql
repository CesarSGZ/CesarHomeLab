CREATE TABLE IF NOT EXISTS commands (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('restart')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'claimed', 'succeeded', 'failed', 'expired')),
  requested_by TEXT NOT NULL,
  requested_at INTEGER NOT NULL,
  claimed_at INTEGER,
  completed_at INTEGER,
  result TEXT,
  idempotency_key TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_commands_queue
  ON commands(status, requested_at);

CREATE TABLE IF NOT EXISTS agent_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  agent_status TEXT NOT NULL DEFAULT 'offline',
  server_status TEXT NOT NULL DEFAULT 'unknown',
  players_online INTEGER,
  players_max INTEGER,
  server_version TEXT,
  last_seen INTEGER,
  last_action TEXT,
  last_error TEXT
);

INSERT OR IGNORE INTO agent_state (id) VALUES (1);
