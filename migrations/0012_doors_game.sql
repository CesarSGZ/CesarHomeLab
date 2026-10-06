CREATE TABLE IF NOT EXISTS doors_rooms (
  code TEXT PRIMARY KEY,
  host_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby',
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS doors_rooms_activity ON doors_rooms(status, updated_at);
