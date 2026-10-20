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
    "llm": {"light": "gpt-6-luna", "deep": "gpt-6.1-sol", "daily_usd_cap": 1.0},
    "karma_farmer": {
        "enabled": False,
        "subreddit": "AskReddit",
        # Ventana diaria (hora local) dentro de la que se elige una hora al azar.
        "window_start": "10:00",
        "window_end": "23:15",
        "max_posts_24h": 2,
        "stats_every_minutes": 180,
        "username": "",
        "browser": {
            "profile_dir": "reddit-browser-profile",
            "headless": False,
            "session_ready": False,
            "session_error": "",
            "timeout_ms": 30000,
            "typing_delay_ms": 55,
            "input_selector": '#title-field textarea[name="title"]',
            "submit_selector": '#newlink button[type="submit"]',
            "account_selector": '.user a',
            "posts_selector": '.thing[data-fullname^="t3_"]',
            "title_selector": 'a.title',
            "comments_selector": 'a.comments',
            "post_karma_selector": '.side .karma:not(.comment-karma)',
            "comment_karma_selector": '.side .comment-karma',
        },
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
            user = json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
        except ValueError:
            user = {}
    else:
        SETTINGS_PATH.write_text(json.dumps(DEFAULTS, indent=2, ensure_ascii=False), encoding="utf-8")
    return _merge(DEFAULTS, user)
