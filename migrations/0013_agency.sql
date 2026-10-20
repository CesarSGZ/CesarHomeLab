-- Agencia (Scarlett Storm): estado del backend local, chat con el Director, registro y órdenes.
-- functions/_lib/agency.js crea estas tablas al primer uso (CREATE TABLE IF NOT EXISTS); este
-- fichero deja constancia del esquema.
CREATE TABLE IF NOT EXISTS agency_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL, updated_at INTEGER NOT NULL, seen_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS agency_messages (id TEXT PRIMARY KEY, role TEXT NOT NULL, text TEXT NOT NULL, reply_to TEXT, status TEXT NOT NULL, actions TEXT, created_at INTEGER NOT NULL, answered_at INTEGER);
CREATE TABLE IF NOT EXISTS agency_events (id TEXT PRIMARY KEY, agent TEXT NOT NULL, level TEXT NOT NULL, text TEXT NOT NULL, at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS agency_commands (id TEXT PRIMARY KEY, agent TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL, requested_at INTEGER NOT NULL, done_at INTEGER, result TEXT);
CREATE INDEX IF NOT EXISTS idx_agency_messages_status ON agency_messages(status, created_at);
CREATE INDEX IF NOT EXISTS idx_agency_messages_created ON agency_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_agency_events_at ON agency_events(at);
CREATE INDEX IF NOT EXISTS idx_agency_commands_status ON agency_commands(status, requested_at);
