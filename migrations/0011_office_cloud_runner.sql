CREATE TABLE IF NOT EXISTS trading_status_cache(id INTEGER PRIMARY KEY CHECK(id=1),payload TEXT NOT NULL,updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS trading_command_queue(id TEXT PRIMARY KEY,path TEXT NOT NULL,body TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'queued',created_at INTEGER NOT NULL,completed_at INTEGER,result TEXT);
CREATE INDEX IF NOT EXISTS trading_command_pending ON trading_command_queue(status,created_at);
