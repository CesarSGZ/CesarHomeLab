CREATE TABLE IF NOT EXISTS personal_datasets (
  name TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
