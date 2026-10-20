"""Estado persistente en SQLite (modo WAL): sobrevive a apagones y reinicios.

Todo lo que el backend sabe vive aquí: el plan del día de cada agente, las publicaciones, las
fotos diarias de karma, las directrices del Director, el chat y la cola de eventos pendientes de
subir a Mission Control (si no hay red, se acumulan y se suben al volver).
"""
import json
import sqlite3
import threading
import time
import uuid

SCHEMA = """
CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, agent TEXT NOT NULL, level TEXT NOT NULL, text TEXT NOT NULL, at INTEGER NOT NULL, synced INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS events_pending ON events(synced, at);
CREATE TABLE IF NOT EXISTS chat (id TEXT PRIMARY KEY, role TEXT NOT NULL, text TEXT NOT NULL, reply_to TEXT, actions TEXT, at INTEGER NOT NULL, synced INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS directives (id TEXT PRIMARY KEY, target TEXT NOT NULL, text TEXT NOT NULL, created_at INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS commands (id TEXT PRIMARY KEY, agent TEXT NOT NULL, type TEXT NOT NULL, ok INTEGER, result TEXT, at INTEGER NOT NULL, synced INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, agent TEXT NOT NULL, subreddit TEXT NOT NULL, title TEXT NOT NULL, url TEXT, score INTEGER, comments INTEGER, removed INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, checked_at INTEGER);
CREATE TABLE IF NOT EXISTS karma (day TEXT PRIMARY KEY, total INTEGER NOT NULL, post INTEGER NOT NULL, comment INTEGER NOT NULL, at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS llm_usage (id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT NOT NULL, agent TEXT NOT NULL, model TEXT NOT NULL, input_tokens INTEGER NOT NULL, output_tokens INTEGER NOT NULL, usd REAL NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS llm_usage_day ON llm_usage(day);
"""


def now_ms() -> int:
    return int(time.time() * 1000)


def new_id() -> str:
    return uuid.uuid4().hex


class Store:
    def __init__(self, path):
        self._lock = threading.RLock()
        self.db = sqlite3.connect(str(path), check_same_thread=False, timeout=30)
        self.db.row_factory = sqlite3.Row
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.execute("PRAGMA synchronous=FULL")  # cada cambio queda en disco antes de seguir
        self.db.executescript(SCHEMA)
        self.db.commit()

    def q(self, sql, args=()):
        with self._lock:
            return [dict(r) for r in self.db.execute(sql, args).fetchall()]

    def one(self, sql, args=()):
        rows = self.q(sql, args)
        return rows[0] if rows else None

    def x(self, sql, args=()):
        with self._lock:
            cur = self.db.execute(sql, args)
            self.db.commit()
            return cur.rowcount

    # ---- clave/valor ----
    def get(self, key, default=None):
        row = self.one("SELECT value FROM kv WHERE key = ?", (key,))
        return json.loads(row["value"]) if row else default

    def put(self, key, value):
        self.x("INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", (key, json.dumps(value)))

    # ---- eventos (cola hacia Mission Control) ----
    def event(self, agent, level, text):
        self.x("INSERT INTO events (id, agent, level, text, at) VALUES (?, ?, ?, ?, ?)", (new_id(), agent, level, str(text)[:400], now_ms()))
        if self.one("SELECT COUNT(*) AS n FROM events")["n"] > 3000:
            self.x("DELETE FROM events WHERE synced = 1 AND id IN (SELECT id FROM events WHERE synced = 1 ORDER BY at ASC LIMIT 1000)")

    def pending_events(self, limit=50):
        return self.q("SELECT id, agent, level, text, at FROM events WHERE synced = 0 ORDER BY at ASC LIMIT ?", (limit,))

    def recent_events(self, limit=20):
        return list(reversed(self.q("SELECT agent, level, text, at FROM events ORDER BY at DESC LIMIT ?", (limit,))))

    def mark_synced(self, table, ids):
        if ids:
            self.x(f"UPDATE {table} SET synced = 1 WHERE id IN ({','.join('?' * len(ids))})", tuple(ids))

    # ---- uso de IA ----
    def reserve_llm(self, day, agent, model, usd, cap, request_cap):
        """Persist before sending; interrupted requests keep their reservation."""
        with self._lock:
            try:
                self.db.execute("BEGIN IMMEDIATE")
                spent, count = self.db.execute(
                    "SELECT COALESCE(SUM(usd), 0), COUNT(*) FROM llm_usage WHERE day = ?", (day,)).fetchone()
                if spent + usd > cap or count >= request_cap:
                    raise ValueError("Tope diario de IA alcanzado (presupuesto o número de peticiones)")
                cur = self.db.execute(
                    "INSERT INTO llm_usage (day, agent, model, input_tokens, output_tokens, usd, at) VALUES (?, ?, ?, 0, 0, ?, ?)",
                    (day, agent, model, usd, now_ms()))
                self.db.commit()
                return cur.lastrowid
            except Exception:
                self.db.rollback()
                raise

    def llm_spent(self, day):
        return self.one("SELECT COALESCE(SUM(usd), 0) AS usd FROM llm_usage WHERE day = ?", (day,))["usd"]

    def llm_spent_month(self, month):
        return self.one("SELECT COALESCE(SUM(usd), 0) AS usd FROM llm_usage WHERE day LIKE ?", (month + "%",))["usd"]
