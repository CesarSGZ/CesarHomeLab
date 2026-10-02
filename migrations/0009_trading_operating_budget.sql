CREATE TABLE IF NOT EXISTS trading_operating_budget (
  month TEXT PRIMARY KEY,
  allowance_eur REAL NOT NULL DEFAULT 10 CHECK(allowance_eur=10),
  spent_eur REAL NOT NULL DEFAULT 0 CHECK(spent_eur>=0),
  updated_at INTEGER NOT NULL
);
ALTER TABLE trading_calls ADD COLUMN eur_reserved REAL;
ALTER TABLE trading_calls ADD COLUMN eur_actual REAL;
ALTER TABLE trading_calls ADD COLUMN fx_rate REAL;
ALTER TABLE trading_calls ADD COLUMN agent TEXT;
