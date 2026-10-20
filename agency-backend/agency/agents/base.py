"""Base de todos los agentes de la agencia.

Un agente nuevo (DMs, otro tipo de posts, analítica…) es una subclase de Agent con:
  - id, name, role y description (el Director lee la descripción para saber qué puede encargarle);
  - tick(): se llama cada pocos segundos y debe volver enseguida; el trabajo largo va en self.start();
  - snapshot_extra(): estadísticas propias para el dashboard (opcional).
Se registra añadiéndolo a agents/__init__.py, y el dashboard le da un puesto en la oficina.
"""
import threading
import traceback

from ..store import now_ms


class Agent:
    id = "agent"
    name = "Agente"
    role = ""
    description = ""
    commands = ("pause", "resume")

    def __init__(self, rt):
        self.rt = rt
        self.status = "resting"
        self.detail = ""
        self.last_result = self.rt.store.get(f"agent:{self.id}:last_result", "")
        self.last_run_at = self.rt.store.get(f"agent:{self.id}:last_run_at")
        self._thread = None

    # ---- estado ----
    @property
    def paused(self):
        return bool(self.rt.store.get(f"agent:{self.id}:paused", False))

    @paused.setter
    def paused(self, value):
        self.rt.store.put(f"agent:{self.id}:paused", bool(value))

    @property
    def busy(self):
        return self._thread is not None and self._thread.is_alive()

    def log(self, text, level="info"):
        self.rt.log(self.id, level, text)

    def finish(self, result):
        self.last_result, self.last_run_at = result, now_ms()
        self.rt.store.put(f"agent:{self.id}:last_result", result)
        self.rt.store.put(f"agent:{self.id}:last_run_at", self.last_run_at)

    def start(self, fn, *args):
        """Ejecuta fn en segundo plano; el bucle principal sigue sincronizando mientras tanto."""
        if self.busy:
            return False

        def run():
            try:
                fn(*args)
            except Exception as e:  # un fallo de un agente nunca tumba el servicio
                self.status, self.detail = "error", str(e)[:200]
                self.log(f"Error inesperado: {e}", "error")
                self.rt.logger.error("%s: %s", self.id, traceback.format_exc())
        self._thread = threading.Thread(target=run, name=self.id, daemon=True)
        self._thread.start()
        return True

    # ---- ciclo de vida ----
    def tick(self):
        pass

    def next_run_at(self):
        return None

    def handle_command(self, kind):
        if kind == "pause":
            self.paused = True
            self.log("En pausa por orden de César")
            return True, "En pausa"
        if kind == "resume":
            self.paused = False
            self.log("Vuelve al trabajo")
            return True, "Reanudado"
        return False, "Orden no disponible para este agente"

    def snapshot_extra(self):
        return []

    def snapshot(self):
        status = "paused" if self.paused and not self.busy else self.status
        return {
            "id": self.id, "name": self.name, "role": self.role, "status": status, "detail": self.detail,
            "lastRunAt": self.last_run_at, "nextRunAt": self.next_run_at(), "lastResult": self.last_result,
            "commands": list(self.commands), "stats": self.snapshot_extra(),
        }
