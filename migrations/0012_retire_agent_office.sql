-- Retirada de la oficina de inversión (Agent Office v2, 20/10/2026). Se conserva trading_dev_auth:
-- guarda el hash del token con el que el Backtest Lab y el robot de IBKR paper usan /api/runtime.
-- La clave de OpenAI se movió antes al secreto OPENAI_API_KEY del proyecto Pages.
DROP TABLE IF EXISTS trading_state;
DROP TABLE IF EXISTS trading_secrets;
DROP TABLE IF EXISTS trading_budget;
DROP TABLE IF EXISTS trading_calls;
DROP TABLE IF EXISTS trading_bridge;
DROP TABLE IF EXISTS trading_operating_budget;
DROP TABLE IF EXISTS trading_status_cache;
DROP TABLE IF EXISTS trading_command_queue;
DROP TABLE IF EXISTS trading_development_results;
