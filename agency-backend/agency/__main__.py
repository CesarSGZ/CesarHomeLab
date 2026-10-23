"""Servicio de la agencia y su línea de comandos.

  python -m agency run            servicio (lo arranca la tarea programada «Scarlett Agency»)
  python -m agency prepare        prepara y revisa la propuesta de hoy para publicación manual
  python -m agency new-token      crea y registra el token del backend (lo usa install.ps1)
  python -m agency status         resumen local
  python -m agency check          comprueba nube y modelos sin generar texto
  python -m agency check --generate  añade una generación mínima con presupuesto
"""
import datetime as dt
import hashlib
import json
import logging
import logging.handlers
import msvcrt
import socket
import sys
import threading
import time
from zoneinfo import ZoneInfo

from . import VERSION, vault
from .agents import TEAM
from .cloud import CloudError, MissionControl
from .config import DATA_DIR, DB_PATH, LOG_DIR, load_settings
from .llm import LLM
from . import delivery
from .store import Store, now_ms

STATE_EVERY_S = 300
SYNC_IDLE_S = 15
SYNC_CHAT_S = 3


class Runtime:
    def __init__(self):
        self.settings = load_settings()
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        self.logger = logging.getLogger("agency")
        if not self.logger.handlers:
            h = logging.handlers.RotatingFileHandler(LOG_DIR / "agency.log", maxBytes=2_000_000, backupCount=5, encoding="utf-8")
            h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
            self.logger.addHandler(h)
            self.logger.setLevel(logging.INFO)
        self.tz = ZoneInfo(self.settings["timezone"])
        self.store = Store(DB_PATH)
        self.cloud = MissionControl(self.settings["cloud_url"], vault.load("agent_token"))
        self.llm = LLM(self)
        self.started_at = now_ms()
        self._wake = threading.Event()
        self._online = (0, False)
        self.agents = {}
        for cls in TEAM:
            agent = cls(self)
            self.agents[agent.id] = agent

    # ---- utilidades compartidas por los agentes ----
    def now(self):
        return dt.datetime.now(self.tz)

    def today(self):
        return self.now().date().isoformat()

    def hm(self, ms):
        return dt.datetime.fromtimestamp(ms / 1000, self.tz).strftime("%H:%M") if ms else "—"

    def log(self, agent, level, text):
        self.logger.info("[%s] %s: %s", agent, level, text)
        self.store.event(agent, level, text)
        self.wake()

    def wake(self):
        self._wake.set()

    def online(self):
        at, ok = self._online
        if time.time() - at < 30:
            return ok
        ok = False
        for host in (("1.1.1.1", 443), ("8.8.8.8", 443)):
            try:
                socket.create_connection(host, timeout=4).close()
                ok = True
                break
            except OSError:
                pass
        self._online = (time.time(), ok)
        return ok

    def directives_for(self, agent_id):
        return [r["text"] for r in self.store.q("SELECT text FROM directives WHERE active = 1 AND target IN (?, 'all') ORDER BY created_at", (agent_id,))]

    def reddit_summary(self):
        kf = self.agents.get("karma-farmer")
        if not kf:
            return None
        return {"publication": "manual", "drafts": kf.drafts()[:5]}

    def state(self):
        cfg = self.settings["llm"]
        kf = self.agents.get("karma-farmer")
        return {
            "version": VERSION, "startedAt": self.started_at, "timezone": self.settings["timezone"],
            "agents": [a.snapshot() for a in self.agents.values()],
            "reddit": None,
            "drafts": kf.drafts() if kf else [],
            "delivery": {"publication": "manual", "sheetUrl": self.settings["planning"]["sheet_url"],
                         "sheetConnected": self.settings["planning"].get("sheet_sync") == "codex_daily",
                         "sheetError": self.store.get("delivery:error", "")},
            "directives": [{"id": d["id"], "target": d["target"], "text": d["text"], "createdAt": d["created_at"]}
                           for d in self.store.q("SELECT * FROM directives WHERE active = 1 ORDER BY created_at")],
            "llm": {"model": cfg["deep"] + " / " + cfg["light"], "usdToday": round(self.store.llm_spent(self.today()), 4),
                    "usdMonth": round(self.store.llm_spent_month(self.today()[:7]), 4), "ready": bool(self.llm._key or vault.load("openai"))},
        }

    # ---- órdenes del dashboard ----
    def handle_commands(self, commands):
        for c in commands:
            if self.store.one("SELECT id FROM commands WHERE id = ?", (c["id"],)):
                continue
            agent = self.agents.get(c.get("agent"))
            ok, result = agent.handle_command(c.get("type")) if agent and c.get("type") in agent.commands else (False, "Orden no válida")
            self.store.x("INSERT INTO commands (id, agent, type, ok, result, at) VALUES (?, ?, ?, ?, ?, ?)", (c["id"], c.get("agent", ""), c.get("type", ""), int(ok), result, now_ms()))
            if agent:
                agent.log(f"Orden del panel ({c.get('type')}): {result}", "info" if ok else "warn")

    # ---- bucle principal ----
    def run(self):
        self.logger.info("Agencia %s arrancando", VERSION)
        self.log("system", "info", f"Backend de la agencia en marcha (v{VERSION})")
        last_state_hash, last_state_at, next_sync, failures = None, 0, 0, 0
        next_delivery = 0
        while True:
            if time.time() >= next_delivery:
                try:
                    delivery.export(self)
                    self.store.put("delivery:error", "")
                except Exception as exc:
                    self.store.put("delivery:error", f"Entrega pendiente ({type(exc).__name__})")
                    self.logger.warning("Entrega pendiente: %s", type(exc).__name__)
                next_delivery = time.time() + 300
            for agent in self.agents.values():
                try:
                    agent.tick()
                except Exception as e:  # noqa: BLE001 - el servicio no se cae por un agente
                    self.logger.exception("tick %s", agent.id)
                    agent.status, agent.detail = "error", str(e)[:200]
            if time.time() >= next_sync or self._wake.is_set():
                self._wake.clear()
                try:
                    state = self.state()
                    digest = hashlib.sha256(json.dumps(state, sort_keys=True, default=str).encode()).hexdigest()
                    send_state = digest != last_state_hash or time.time() - last_state_at > STATE_EVERY_S
                    if self.cloud.token is None:
                        self.cloud.token = vault.load("agent_token")
                    events = self.store.pending_events(50)
                    replies = self.store.q("SELECT id, text, reply_to, actions, at FROM chat WHERE role = 'director' AND synced = 0 ORDER BY at LIMIT 10")
                    done = self.store.q("SELECT id, ok, result FROM commands WHERE synced = 0 LIMIT 10")
                    res = self.cloud.sync(
                        state if send_state else None, events,
                        [{"id": r["id"], "text": r["text"], "replyTo": r["reply_to"], "actions": json.loads(r["actions"] or "[]"), "at": r["at"]} for r in replies],
                        [{"id": d["id"], "ok": bool(d["ok"]), "result": d["result"]} for d in done])
                    self.store.mark_synced("events", [e["id"] for e in events])
                    self.store.mark_synced("chat", [r["id"] for r in replies])
                    self.store.mark_synced("commands", [d["id"] for d in done])
                    if send_state:
                        last_state_hash, last_state_at = digest, time.time()
                    self.agents["director"].receive(res.get("messages", []))
                    self.handle_commands(res.get("commands", []))
                    if failures:
                        self.logger.info("Conexión con Mission Control recuperada")
                    failures = 0
                    chatting = bool(res.get("messages")) or self.agents["director"].busy or (
                        self.store.one("SELECT MAX(at) AS at FROM chat")["at"] or 0) > now_ms() - 180_000
                    next_sync = time.time() + (SYNC_CHAT_S if chatting else SYNC_IDLE_S)
                except CloudError as e:
                    failures += 1
                    if failures in (1, 5) or failures % 50 == 0:
                        self.logger.warning("Sincronización fallida (%s): %s", failures, e)
                    next_sync = time.time() + min(300, 5 * 2 ** min(failures, 6))
                except Exception:  # noqa: BLE001
                    self.logger.exception("sync")
                    next_sync = time.time() + 30
            self._wake.wait(1.0)


def single_instance():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    f = open(DATA_DIR / "agency.lock", "a+")  # noqa: SIM115 - se mantiene abierto mientras viva el proceso
    try:
        msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, 1)
    except OSError:
        sys.exit(0)  # ya hay un servicio en marcha (la tarea lo relanza cada 5 min por si se cae)
    return f


def check(generate=False):
    """Explicit operator probe, never part of the recurring service loop."""
    import requests
    rt = Runtime()
    # Authenticate without fetching or executing queued work.
    key = rt.llm.key()
    for model in {rt.settings['llm']['light'], rt.settings['llm']['deep']}:
        from .llm import RATES
        if model not in RATES:
            raise RuntimeError('Modelo sin tarifa de presupuesto: revisa llm.py')
        response = requests.get(f'https://api.openai.com/v1/models/{model}',
                                headers={'Authorization': 'Bearer ' + key}, timeout=(10, 20))
        if response.status_code != 200:
            raise RuntimeError(f'No se pudo verificar el modelo {model}: HTTP {response.status_code}')
    if generate:
        schema = {'type': 'object', 'additionalProperties': False,
                  'required': ['ok'], 'properties': {'ok': {'type': 'boolean'}}}
        result = rt.llm.call('director', 'Return ok=true for this connectivity test.',
                             'Connectivity check', schema, deep=True, max_out=256, name='health')
        if result.get('ok') is not True:
            raise RuntimeError('La generación de prueba no devolvió la confirmación esperada')
    # A state-only sync leaves commands/messages queued and does not generate replies.
    rt.cloud.sync(state=rt.state())
    print(json.dumps({'cloud': 'authenticated', 'openai_models': 'accessible',
                      'publication': 'manual',
                      'generation': 'verified' if generate else 'not_requested'}))


def main(argv):
    cmd = argv[1] if len(argv) > 1 else "run"
    if cmd == "run":
        lock = single_instance()  # noqa: F841
        while True:
            try:
                Runtime().run()
            except Exception:  # noqa: BLE001 - p. ej. disco lleno o base bloqueada: reintenta
                logging.getLogger("agency").exception("El servicio se ha caído; reinicio en 30 s")
                time.sleep(30)
    elif cmd == "check":
        check('--generate' in argv)
    elif cmd == "migrate-settings":
        from .config import SETTINGS_PATH
        settings = load_settings()
        temporary = SETTINGS_PATH.with_suffix('.json.tmp')
        temporary.write_text(json.dumps(settings, indent=2, ensure_ascii=False), encoding='utf-8')
        temporary.replace(SETTINGS_PATH)
        print('Ajustes actualizados; límites de gasto conservados.')
    elif cmd == "new-token":
        # Token nuevo: se guarda con DPAPI, se sube como secreto de GitHub y se lanza el workflow que
        # lo copia a Cloudflare Pages. Se hace aquí (no en PowerShell) para que no lleve BOM ni saltos.
        import secrets as pysecrets
        import subprocess
        repo = argv[2] if len(argv) > 2 else "CesarSGZ/CesarHomeLab"
        token = pysecrets.token_urlsafe(48)
        subprocess.run(["gh", "secret", "set", "AGENCY_AGENT_TOKEN", "--repo", repo], input=token.encode(), check=True)
        vault.save("agent_token", token)
        subprocess.run(["gh", "workflow", "run", "agency-secrets.yml", "--repo", repo, "--ref", "main"], check=True)
        print("Token nuevo creado; Cloudflare lo tendrá en unos minutos (workflow agency-secrets).")
    elif cmd == "has-token":
        sys.exit(0 if vault.load("agent_token") else 1)
    elif cmd == "prepare":
        lock = single_instance()
        rt = Runtime()
        rt.agents["karma-farmer"].run(manual=True)
        delivery.export(rt)
        print(json.dumps(rt.agents["karma-farmer"].drafts(), ensure_ascii=False, indent=2))
        if rt.agents["karma-farmer"].status == "error":
            sys.exit(1)
    elif cmd == "status":
        rt = Runtime()
        print(json.dumps(rt.state(), indent=2, ensure_ascii=False, default=str))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv)
