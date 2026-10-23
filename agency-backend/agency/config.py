"""Rutas y ajustes. Los ajustes viven en settings.json (sin secretos); los secretos, en secrets/ con DPAPI."""
import json
import os
from pathlib import Path

DATA_DIR = Path(os.environ.get("AGENCY_DATA_DIR") or Path(os.environ.get("LOCALAPPDATA", Path.home())) / "ScarlettAgency")
LOG_DIR = DATA_DIR / "logs"
SECRETS_DIR = DATA_DIR / "secrets"
DB_PATH = DATA_DIR / "agency.db"
SETTINGS_PATH = DATA_DIR / "settings.json"

DEFAULTS = {
    "cloud_url": "https://cesar-solla.pages.dev",
    "timezone": "Europe/Madrid",
    "client_name": "Scarlett Storm",
    "llm": {"light": "gpt-6-luna", "deep": "gpt-6.1-sol", "daily_usd_cap": 1.0, "daily_request_cap": 20},
    "planning": {
        "subreddit": "AskReddit",
        "daily_at": "09:00",
        "sheet_url": "",
        "sheet_sync": "unconfigured",
    },
}


def _merge(base, extra):
    out = dict(base)
    for k, v in (extra or {}).items():
        out[k] = _merge(base[k], v) if isinstance(v, dict) and isinstance(base.get(k), dict) else v
    return out


def load_settings():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    user = {}
    if SETTINGS_PATH.exists():
        try:
            user = json.loads(SETTINGS_PATH.read_text(encoding="utf-8-sig"))
        except ValueError as exc:
            raise ValueError('settings.json no es válido; corrígelo antes de arrancar la agencia') from exc
    else:
        SETTINGS_PATH.write_text(json.dumps(DEFAULTS, indent=2, ensure_ascii=False), encoding="utf-8")
    legacy = user.pop("karma_farmer", None)
    if legacy and "planning" not in user:
        user["planning"] = {"subreddit": legacy.get("subreddit", "AskReddit")}
    return _merge(DEFAULTS, user)
