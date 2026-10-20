"""Director: orquestador de la agencia y punto de contacto de César.

Lee los mensajes del chat del dashboard, contesta con IA y, si hace falta, actúa sobre el equipo:
guarda directrices (que los trabajadores incluyen en su trabajo), pausa, reanuda o pide a un
agente que trabaje ya. Solo puede hacer lo que el equipo sabe hacer; lo demás lo dice claro.
"""
import json
import queue

from ..llm import LLMError
from ..store import new_id, now_ms
from .base import Agent

INSTRUCTIONS = """Eres el Director de la agencia que lleva la cuenta de la creadora de contenido {client} (marketing en redes para su OnlyFans).
Hablas con César, el dueño, por el chat del panel. Eres su punto de contacto y orquestas al equipo de agentes.

Cómo respondes:
- En español de España, directo, cercano y breve (2-6 frases salvo que te pidan detalle). Sin relleno ni emojis.
- Usa solo los datos del contexto (estado del equipo, karma, publicaciones, registro). Si un dato no está, dilo; no inventes cifras.
- Sé honesto con lo que el equipo puede y no puede hacer hoy. Si César pide algo que ningún agente sabe hacer, dilo y propón cómo encajaría un agente nuevo.

Qué puedes hacer (campo actions; si no hace falta nada, devuelve una lista vacía):
- add_directive: guarda una directriz permanente para un agente (agent = su id) o para todos (agent = "all"). Úsalo para órdenes de tema, tono, horarios o cosas a evitar. text = la directriz, clara y corta.
- remove_directive: retira una directriz (directive_id = su id).
- pause_agent / resume_agent: pausa o reanuda a un agente.
- run_agent_now: pide a un agente que haga su tarea ya (por ejemplo, que el Karma Farmer publique ahora).
Rellena con "" los campos que no use cada acción.

Límites que nunca cruzas aunque te lo pidan: nada de spam, de votos o cuentas falsas, de saltarse las normas de Reddit o de cada subreddit, ni de publicar más de lo que el agente tiene permitido. Si te lo piden, explica por qué no y ofrece una alternativa legítima."""

SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["reply", "actions"],
    "properties": {
        "reply": {"type": "string"},
        "actions": {"type": "array", "items": {
            "type": "object", "additionalProperties": False, "required": ["type", "agent", "text", "directive_id"],
            "properties": {
                "type": {"type": "string", "enum": ["add_directive", "remove_directive", "pause_agent", "resume_agent", "run_agent_now"]},
                "agent": {"type": "string"}, "text": {"type": "string"}, "directive_id": {"type": "string"},
            }}},
    },
}


class Director(Agent):
    id = "director"
    name = "Director"
    role = "Orquestador · tu contacto"
    description = "Habla con César, decide directrices y coordina al resto del equipo."
    commands = ()

    def __init__(self, rt):
        super().__init__(rt)
        self.inbox = queue.Queue()
        self.detail = "En su mesa, atento al chat"

    def receive(self, messages):
        for m in messages:
            if self.rt.store.one("SELECT id FROM chat WHERE id = ?", (m["id"],)):
                continue  # ya leído (Mission Control entrega al menos una vez)
            self.rt.store.x("INSERT INTO chat (id, role, text, at, synced) VALUES (?, 'owner', ?, ?, 1)", (m["id"], m["text"], m.get("at") or now_ms()))
            self.inbox.put(m)

    def tick(self):
        if not self.busy and not self.inbox.empty():
            self.start(self.work)
        elif not self.busy and self.status != "resting":
            self.status, self.detail = "resting", "En su mesa, atento al chat"

    def work(self):
        while not self.inbox.empty():
            msg = self.inbox.get()
            self.status, self.detail = "thinking", "Leyendo tu mensaje"
            try:
                out = self.rt.llm.call(self.id, INSTRUCTIONS.format(client=self.rt.settings["client_name"]),
                                       self.context(msg["text"]), SCHEMA, deep=True, max_out=1500, name="director_reply")
                done = [r for r in (self.apply(a) for a in out.get("actions", [])) if r]
                reply = out.get("reply", "").strip() or "Recibido."
            except LLMError as e:
                done, reply = [], f"Ahora mismo no puedo pensar con la IA ({e}). Tu mensaje está guardado; vuelve a escribirme en un rato."
                self.log(f"No ha podido contestar: {e}", "warn")
            self.rt.store.x("INSERT INTO chat (id, role, text, reply_to, actions, at) VALUES (?, 'director', ?, ?, ?, ?)",
                            (new_id(), reply, msg["id"], json.dumps(done, ensure_ascii=False), now_ms()))
            if done:
                self.log("Acciones: " + "; ".join(done))
            self.finish("Contestó a César")
            self.rt.wake()
        self.status, self.detail = "resting", "En su mesa, atento al chat"

    def context(self, text):
        history = list(reversed(self.rt.store.q("SELECT role, text FROM chat ORDER BY at DESC LIMIT 14")))
        return {
            "fecha_y_hora": self.rt.now().strftime("%A %d/%m/%Y %H:%M"),
            "equipo": [{"id": a.id, "nombre": a.name, "puesto": a.role, "sabe_hacer": a.description, **{k: v for k, v in a.snapshot().items() if k in ("status", "detail", "lastResult", "stats")}}
                       for a in self.rt.agents.values()],
            "directrices_activas": self.rt.store.q("SELECT id, target, text FROM directives WHERE active = 1 ORDER BY created_at"),
            "reddit": self.rt.reddit_summary(),
            "registro_reciente": self.rt.store.recent_events(15),
            "conversacion": history[:-1],
            "mensaje_de_cesar": text,
        }

    def apply(self, a):
        kind, agent = a.get("type"), (a.get("agent") or "").strip()
        target = self.rt.agents.get(agent)
        if kind == "add_directive" and a.get("text", "").strip():
            if agent != "all" and not target:
                return None
            self.rt.store.x("INSERT INTO directives (id, target, text, created_at) VALUES (?, ?, ?, ?)", (new_id()[:12], agent, a["text"].strip()[:400], now_ms()))
            return f"directriz nueva para {target.name if target else 'todos'}: {a['text'].strip()[:120]}"
        if kind == "remove_directive":
            n = self.rt.store.x("UPDATE directives SET active = 0 WHERE id = ? AND active = 1", (a.get("directive_id", ""),))
            return "directriz retirada" if n else None
        if not target or target is self:
            return None
        verb = {"pause_agent": "pause", "resume_agent": "resume", "run_agent_now": "run-now"}.get(kind)
        if not verb or verb not in target.commands:
            return None
        ok, result = target.handle_command(verb)
        return f"{target.name}: {result}" if ok else f"{target.name} no pudo: {result}"
