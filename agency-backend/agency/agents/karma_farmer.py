"""Karma Farmer: una pregunta al día en r/AskReddit, a una hora al azar, y seguimiento del karma.

Plan diario persistente (kv «karma:plan»): cada día se sortea una hora dentro de la ventana de
settings.json. Si el PC estaba apagado o sin red a esa hora, al volver publica en cuanto puede
(tras unos minutos de margen al arrancar) siempre que siga dentro de la ventana; si no, el día
queda como «perdido». Un apagón en mitad de la publicación no la duplica: antes de enviar se
anota el título y, al volver, se busca en los posts recientes de la cuenta.
"""
import datetime as dt
import random
import re

from ..llm import LLMError
from ..platforms.reddit import RedditError
from ..store import now_ms
from .base import Agent

GRACE_MIN = 45  # minutos de cortesía tras el fin de la ventana para recuperar un día con apagón
STATS_FIRST_DELAY_S = 90

INSTRUCTIONS = """You write the title of one r/AskReddit post for a regular Reddit user. The title is the whole post.
Goal: a question lots of ordinary people instantly want to answer with their own story or opinion, so it gets upvotes and comments.

What works:
- Open-ended and about everyday life: work, school, food, money habits, childhood, friendships, family quirks, hobbies, small social rules, nostalgia, travel, pets, home, odd little experiences, lessons learned.
- Easy to answer from personal experience in a sentence or two, with room for funny or surprising stories.
- A specific angle with a small twist, so people think "oh, I have one". Not generic.
- Short and plain, like someone typing on their phone: usually 7-18 words, simple words, no emojis, no hashtags, no quotation marks, no "Reddit," prefix, no exclamation marks.

AskReddit rules you must respect:
- It is a question and ends with "?". No body text.
- No yes/no questions, no polls, no "would you rather", no requests for personal, medical or legal advice.
- No politics, religion, current news, tragedies, sexual or NSFW topics, named celebrities, brands, links, self-promotion.
- Avoid the evergreen reposts (best advice you ever got, smells that bring back memories, most useless talent, etc.) and anything close to the titles you are shown.

Write in natural American English. Vary how the candidates start, and avoid stock openers such as "What tiny", "What is something" or "What's a small". Return the candidates ordered from best to worst."""

SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["candidates"],
    "properties": {"candidates": {"type": "array", "items": {
        "type": "object", "additionalProperties": False, "required": ["title", "why"],
        "properties": {"title": {"type": "string"}, "why": {"type": "string"}}}}},
}

YES_NO = re.compile(r"^(is|are|am|was|were|do|does|did|have|has|had|can|could|should|would|will|shall|may|might|ever)\b", re.I)
BANNED = re.compile(r"https?://|www\.|@|#|\b(ai|chatgpt|gpt|onlyfans|reddit,)\b|would you rather|[\U0001F300-\U0001FAFF☀-➿]", re.I)
STOP = set("a an the of to in on for and or your you what whats what's is are was were do did that this it its with at as be my me i".split())


def words(s):
    return set(re.findall(r"[a-z']+", s.lower())) - STOP


def similar(a, b):
    wa, wb = words(a), words(b)
    return len(wa & wb) / max(1, len(wa | wb))


def check_title(title, others):
    t = " ".join(str(title).split())
    if not 20 <= len(t) <= 160:
        return None, "longitud"
    if not t.endswith("?") or t.count("?") > 1:
        return None, "no es una pregunta"
    if YES_NO.match(t):
        return None, "pregunta de sí/no"
    if BANNED.search(t) or '"' in t or "!" in t:
        return None, "contenido no permitido"
    if any(similar(t, o) >= 0.5 for o in others):
        return None, "demasiado parecida a otra"
    return t, None


class KarmaFarmer(Agent):
    id = "karma-farmer"
    name = "Karma Farmer"
    role = "Reddit · r/AskReddit"
    description = ("Una vez al día, a una hora al azar dentro de su ventana, publica en r/AskReddit una pregunta "
                   "cotidiana pensada para recibir muchas respuestas, y mide el karma de la cuenta y el de sus posts. "
                   "Sigue las directrices del Director (temas, tono, cosas que evitar).")
    commands = ("pause", "resume", "run-now")

    def __init__(self, rt):
        super().__init__(rt)
        self.cfg = rt.settings["karma_farmer"]
        self.reddit = rt.reddit
        self.stats_at = 0
        self.stats_due = now_ms() + STATS_FIRST_DELAY_S * 1000
        # Tras arrancar (apagón, reinicio) espera unos minutos antes de publicar algo atrasado.
        self.not_before = now_ms() + random.randint(3, 15) * 60_000
        self._notified_day = None

    # ---- plan del día ----
    def _window(self, day):
        tz = self.rt.tz
        start = dt.datetime.combine(day, dt.time.fromisoformat(self.cfg["window_start"]), tz)
        end = dt.datetime.combine(day, dt.time.fromisoformat(self.cfg["window_end"]), tz)
        return start, end

    def plan(self):
        today = self.rt.now().date()
        plan = self.rt.store.get("karma:plan")
        if plan and plan.get("day") == today.isoformat():
            return plan
        start, end = self._window(today)
        lo = max(start, self.rt.now() + dt.timedelta(minutes=random.randint(4, 25)))
        if lo >= end:
            plan = {"day": today.isoformat(), "state": "skipped", "at": None, "attempts": 0, "reason": "el servicio arrancó después de la ventana de hoy"}
        else:
            at = lo + dt.timedelta(seconds=random.uniform(0, (end - lo).total_seconds()))
            plan = {"day": today.isoformat(), "state": "pending", "at": int(at.timestamp() * 1000), "attempts": 0, "reason": ""}
        self.rt.store.put("karma:plan", plan)
        if plan["state"] == "pending":
            self.log(f"Plan de hoy: publicará a las {self.rt.hm(plan['at'])}")
        return plan

    def save_plan(self, plan):
        self.rt.store.put("karma:plan", plan)

    def next_run_at(self):
        plan = self.rt.store.get("karma:plan") or {}
        return plan.get("at") if plan.get("state") == "pending" else None

    def posts_since(self, ms):
        return self.rt.store.q("SELECT * FROM posts WHERE created_at >= ? ORDER BY created_at DESC", (ms,))

    # ---- bucle ----
    def tick(self):
        if self.busy:
            return
        plan, now = self.plan(), now_ms()
        if not self.reddit.configured:
            self.status, self.detail = "blocked", "Falta conectar la cuenta de Reddit en el PC (python -m agency setup-reddit)"
        elif self.status in ("working", "error", "blocked", "resting"):
            self.status, self.detail = "resting", self.rest_detail(plan)
        if self.reddit.configured and now >= self.stats_due and self.rt.online():
            self.start(self.refresh_stats)
            return
        if plan["state"] != "pending":
            return
        _, end = self._window(self.rt.now().date())
        if now > int((end + dt.timedelta(minutes=GRACE_MIN)).timestamp() * 1000):
            plan.update(state="missed", reason="no pudo publicar dentro de la ventana (PC apagado, sin red o en pausa)")
            self.save_plan(plan)
            self.log("Hoy no se ha publicado: " + plan["reason"], "warn")
            return
        if now < plan["at"] or now < self.not_before or self.paused or not self.reddit.configured:
            return
        if not self.rt.online():
            plan["at"] = now + random.randint(5, 12) * 60_000
            self.save_plan(plan)
            self.log(f"Sin conexión a la hora prevista: lo intenta de nuevo a las {self.rt.hm(plan['at'])}", "warn")
            return
        self.start(self.run, False)

    def rest_detail(self, plan):
        if self.paused:
            return "En pausa"
        st = plan.get("state")
        if st == "pending":
            return f"Descansando. Hoy publica a las {self.rt.hm(plan['at'])}"
        if st == "done":
            return "Descansando. La publicación de hoy ya está hecha"
        return "Descansando. Hoy no toca publicar más" if st == "skipped" else f"Descansando. Hoy: {plan.get('reason', st)}"

    def handle_command(self, kind):
        if kind != "run-now":
            return super().handle_command(kind)
        if self.busy:
            return False, "Ya está trabajando"
        if not self.reddit.configured:
            return False, "Falta conectar la cuenta de Reddit"
        if not self.start(self.run, True):
            return False, "Ya está trabajando"
        return True, "Publicación manual en marcha"

    # ---- trabajo ----
    def recover_interrupted(self):
        pending = self.rt.store.get("karma:submitting")
        if not pending:
            return None
        for p in self.reddit.my_recent(10):
            if p["title"].strip() == pending["title"].strip() and p["created_at"] >= pending["at"] - 600_000:
                self.rt.store.put("karma:submitting", None)
                self.record(p)
                self.log("Recuperada una publicación que quedó a medias por un corte: «" + p["title"] + "»", "ok")
                return p
        if now_ms() - pending["at"] > 2 * 3600_000:
            self.rt.store.put("karma:submitting", None)  # no llegó a publicarse
        return None

    def record(self, p):
        self.rt.store.x(
            "INSERT OR REPLACE INTO posts (id, agent, subreddit, title, url, score, comments, removed, created_at, checked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (p["id"], self.id, p["subreddit"], p["title"], p["url"], p["score"], p["comments"], int(p["removed"]), p["created_at"], p["checked_at"]))

    def run(self, manual):
        plan = self.plan()
        self.status, self.detail = "working", "Conectando con Reddit"
        try:
            if self.recover_interrupted():
                if not manual:
                    plan.update(state="done")
                    self.save_plan(plan)
                return self.done("Publicación recuperada tras un corte")
            recent = self.posts_since(now_ms() - 24 * 3600_000)
            if len(recent) >= int(self.cfg["max_posts_24h"]):
                raise RedditError(f"ya hay {len(recent)} publicaciones en las últimas 24 h; para no parecer spam, espera")
            sub = self.cfg["subreddit"]
            self.detail = f"Leyendo lo que se publica hoy en r/{sub}"
            hot = self.reddit.hot_titles(sub, 40)
            ours = [p["title"] for p in self.rt.store.q("SELECT title FROM posts ORDER BY created_at DESC LIMIT 60")]
            title = self.write_question(hot, ours)
            self.detail = "Publicando: " + title
            self.rt.store.put("karma:submitting", {"title": title, "at": now_ms()})
            post = self.reddit.submit(sub, title)
            self.rt.store.put("karma:submitting", None)
            self.record(post)
            plan.update(state="done", reason="")
            self.save_plan(plan)
            self.stats_due = now_ms() + 30 * 60_000
            self.log(f"Publicado en r/{sub}: «{title}»", "ok")
            self.done("Publicado: " + title)
        except (RedditError, LLMError) as e:
            self.status, self.detail = "error", str(e)[:200]
            if manual:
                self.log(f"La publicación manual falló: {e}", "error")
                return self.finish(f"Falló: {e}")
            plan["attempts"] = plan.get("attempts", 0) + 1
            if plan["attempts"] < 3:
                plan["at"] = now_ms() + random.randint(20, 50) * 60_000
                self.log(f"No ha podido publicar ({e}). Reintento a las {self.rt.hm(plan['at'])}", "warn")
            else:
                plan.update(state="failed", reason=str(e)[:160])
                self.log(f"Hoy no publicará: tres intentos fallidos ({e})", "error")
            self.save_plan(plan)
            self.finish(f"Falló: {e}")

    def done(self, result):
        self.status = "resting"
        self.detail = self.rest_detail(self.plan())
        self.finish(result)

    def write_question(self, hot, ours):
        self.detail = "Pensando una pregunta"
        now = self.rt.now()
        directives = self.rt.directives_for(self.id)
        rejected = []
        for attempt in range(2):
            data = {
                "today": now.strftime("%A %d %B %Y"),
                "titles_on_askreddit_now": hot[:40],
                "titles_already_posted_by_this_account": ours[:40],
                "owner_directives": directives or ["(none)"],
                "rejected_before": rejected,
                "how_many": 6,
            }
            out = self.rt.llm.call(self.id, INSTRUCTIONS, data, SCHEMA, deep=False, max_out=900, name="askreddit_titles")
            for c in out.get("candidates", []):
                title, why = check_title(c.get("title", ""), hot + ours)
                if title:
                    return title
                rejected.append({"title": c.get("title", ""), "problem": why})
        raise LLMError("ninguna de las preguntas generadas cumplía las reglas de r/AskReddit")

    # ---- karma ----
    def refresh_stats(self):
        try:
            me = self.reddit.me()
            today = self.rt.today()
            self.rt.store.x("INSERT INTO karma (day, total, post, comment, at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(day) DO UPDATE SET total = excluded.total, post = excluded.post, comment = excluded.comment, at = excluded.at",
                            (today, me["total"], me["post"], me["comment"], now_ms()))
            ids = [p["id"] for p in self.posts_since(now_ms() - 30 * 86400_000)]
            for p in self.reddit.refresh(ids):
                self.rt.store.x("UPDATE posts SET score = ?, comments = ?, removed = ?, checked_at = ? WHERE id = ?",
                                (p["score"], p["comments"], int(p["removed"]), p["checked_at"], p["id"]))
            self.stats_at = now_ms()
        except RedditError as e:
            self.log(f"No ha podido leer el karma: {e}", "warn")
        finally:
            self.stats_due = now_ms() + int(self.cfg["stats_every_minutes"]) * 60_000

    def karma_numbers(self):
        rows = self.rt.store.q("SELECT day, total, post, comment FROM karma ORDER BY day DESC LIMIT 60")
        latest = rows[0] if rows else None
        week_ago = (self.rt.now().date() - dt.timedelta(days=7)).isoformat()
        base = next((r for r in rows if r["day"] <= week_ago), rows[-1] if rows else None)
        karma7d = latest["total"] - base["total"] if latest and base and base is not latest else None
        week_posts = self.posts_since(now_ms() - 7 * 86400_000)
        return latest, karma7d, week_posts, list(reversed(rows))

    def snapshot_extra(self):
        latest, karma7d, week_posts, _ = self.karma_numbers()
        plan = self.rt.store.get("karma:plan") or {}
        today = {"pending": "Toca a las " + self.rt.hm(plan.get("at")), "done": "Publicado", "missed": "Perdido", "failed": "Falló", "skipped": "No toca"}.get(plan.get("state"), "—")
        return [
            {"label": "Karma 7 días", "value": ("+" if (karma7d or 0) >= 0 else "") + str(karma7d) if karma7d is not None else "midiendo"},
            {"label": "Karma total", "value": str(latest["total"]) if latest else "—"},
            {"label": "Posts 7 días", "value": str(len(week_posts))},
            {"label": "Hoy", "value": today},
        ]

    def reddit_state(self):
        latest, karma7d, week_posts, history = self.karma_numbers()
        posts = self.rt.store.q("SELECT * FROM posts ORDER BY created_at DESC LIMIT 30")
        return {
            "configured": self.reddit.configured, "username": self.reddit.username,
            "karma": {"total": latest["total"], "post": latest["post"], "comment": latest["comment"]} if latest else {},
            "karma7d": karma7d, "postScore7d": sum(p["score"] or 0 for p in week_posts),
            "history": [{"day": h["day"], "total": h["total"]} for h in history],
            "posts": [{"id": p["id"], "title": p["title"], "subreddit": p["subreddit"], "url": p["url"], "score": p["score"],
                       "comments": p["comments"], "createdAt": p["created_at"], "removed": bool(p["removed"])} for p in posts],
            "checkedAt": self.stats_at or None,
        }
