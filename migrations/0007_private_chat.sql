-- Idempotent. Historical marketplace tables are retained but no longer used.
CREATE TABLE IF NOT EXISTS ai_settings (owner TEXT PRIMARY KEY, key_cipher TEXT NOT NULL, key_iv TEXT NOT NULL, model TEXT NOT NULL DEFAULT 'gpt-5-mini', updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS ai_conversations (id TEXT PRIMARY KEY, owner TEXT NOT NULL, title TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_owner_updated ON ai_conversations(owner, updated_at DESC);
CREATE TABLE IF NOT EXISTS ai_messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK(role IN ('user','assistant')), content TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id, id);
CREATE TABLE IF NOT EXISTS ai_limits (owner TEXT PRIMARY KEY, window_start INTEGER NOT NULL DEFAULT 0, request_count INTEGER NOT NULL DEFAULT 0, lock_until INTEGER NOT NULL DEFAULT 0, lock_id TEXT);
CREATE TABLE IF NOT EXISTS ai_requests (
 id TEXT PRIMARY KEY, owner TEXT NOT NULL,
 conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
 status TEXT NOT NULL, answer TEXT, created_at INTEGER NOT NULL
);
