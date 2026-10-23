"""Daily editorial drafts for human publication. No Reddit session or submission code."""
import datetime as dt
import json
import re

from ..llm import LLMError
from ..store import now_ms
from .base import Agent

INSTRUCTIONS = """You write the title of one r/AskReddit post for a regular Reddit user. The title is the whole post.
Goal: a question lots of ordinary people instantly want to answer with their own story or opinion, so it gets upvotes and comments.

What works:
- Open-ended and about everyday life: work, school, food, money habits, childhood, friendships, family quirks, hobbies, small social rules, nostalgia, travel, pets, home, odd little experiences, lessons learned.
- Easy to answer from personal experience in a sentence or two, with room for funny or surprising stories.
- A specific angle with a small twist, so people think "oh, I have one". Not generic.
- Short and plain, like someone typing on their phone: usually 7-18 words, simple words, no emojis, no hashtags, no quotation marks, no "Reddit," prefix, no exclamation marks.

Editorial constraints for this draft (current community rules are checked manually):
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
    # Keep the existing ID so dashboard commands and persisted directives survive.
    id = 'karma-farmer'
    name = 'Reddit Planner'
    role = 'Propuestas para publicación manual'
    description = 'Prepara una propuesta diaria y se la pasa al Director para revisión. César publica manualmente.'
    commands = ('pause', 'resume', 'run-now')

    def __init__(self, rt):
        super().__init__(rt)
        self.cfg = rt.settings['planning']
        self.detail = 'Preparado para planificar el contenido de hoy'

    def due_at(self):
        return dt.datetime.combine(self.rt.now().date(), dt.time.fromisoformat(self.cfg['daily_at']), self.rt.tz)

    def next_run_at(self):
        due = self.due_at()
        if self.rt.store.one('SELECT id FROM drafts WHERE day = ?', (self.rt.today(),)):
            due += dt.timedelta(days=1)
        return int(due.timestamp() * 1000)

    def tick(self):
        if self.busy or self.paused:
            return
        row = self.rt.store.one('SELECT state, error FROM drafts WHERE day = ?', (self.rt.today(),))
        if row:
            if row['state'] == 'ready':
                self.status, self.detail = 'completed', 'La propuesta de hoy está preparada para tu revisión y publicación manual'
            elif row['state'] == 'error':
                self.status, self.detail = 'error', row['error'] or 'Revisa la propuesta y pide Preparar ahora'
            else:
                self.status, self.detail = 'error', 'Preparación interrumpida. Preparar ahora recupera el trabajo guardado'
            return
        if self.rt.now() >= self.due_at() and not self.rt.agents['director'].busy:
            self.start(self.run, False)
        else:
            self.status, self.detail = 'resting', 'Próxima preparación diaria: ' + self.cfg['daily_at']

    def handle_command(self, kind):
        if kind != 'run-now':
            return super().handle_command(kind)
        if self.busy or self.rt.agents['director'].busy:
            return False, 'El equipo ya está trabajando'
        if self.start(self.run, True):
            return True, 'Preparación manual en marcha; los agentes no publican en Reddit'
        return False, 'Ya está trabajando'

    def drafts(self):
        return [json.loads(row['payload']) for row in self.rt.store.q(
            "SELECT payload FROM drafts WHERE state = 'ready' ORDER BY created_at DESC LIMIT 30")]

    def run(self, manual=False):
        day = self.rt.today()
        draft_id = 'reddit-' + day
        created = self.rt.store.x(
            "INSERT OR IGNORE INTO drafts (id, day, state, payload, created_at) VALUES (?, ?, 'generating', '{}', ?)",
            (draft_id, day, now_ms()))
        row = self.rt.store.one('SELECT * FROM drafts WHERE day = ?', (day,))
        if row['state'] == 'ready':
            self.status, self.detail = 'completed', 'La propuesta de hoy ya está preparada'
            return
        if not created and not manual:
            return
        self.status, self.detail = 'working', 'Preparando la propuesta de hoy'
        draft = json.loads(row['payload'])
        try:
            if not draft.get('title'):
                recent = [d['title'] for d in self.drafts()]
                out = self.rt.llm.call(self.id, INSTRUCTIONS,
                    {'subreddit': self.cfg['subreddit'], 'date': day, 'how_many': 4,
                     'previous_titles': recent, 'owner_directives': self.rt.directives_for(self.id)},
                    SCHEMA, deep=False, max_out=900, name='manual_reddit_draft')
                title = why = None
                for candidate in out.get('candidates', []):
                    checked, _ = check_title(candidate.get('title', ''), recent)
                    if checked:
                        title, why = checked, str(candidate.get('why', ''))[:500]
                        break
                if not title:
                    raise LLMError('Las propuestas no superaron la revisión de formato; pide una nueva preparación')
                sub = self.cfg['subreddit']
                draft = {'id': draft_id, 'day': day, 'subreddit': sub, 'title': title, 'body': '',
                         'rationale': why, 'createdAt': row['created_at'],
                         'steps': [f'Abre https://www.reddit.com/r/{sub}/ y revisa sus normas actuales.',
                                   'Comprueba si el tema ya se ha publicado y decide si esta idea encaja en la comunidad.',
                                   'Adapta el título con tus propias palabras y experiencia. Revisa la nota del Director.',
                                   'Publica tú desde tu cuenta si procede. No añadas enlaces promocionales.',
                                   'Marca Publicado en la hoja y pega la URL; usa Descartado si decides no hacerlo.']}
                self.rt.store.x("UPDATE drafts SET payload = ?, state = 'reviewing', error = '' WHERE id = ?",
                                (json.dumps(draft, ensure_ascii=False), draft_id))
            self.detail = 'El Director está revisando la propuesta'
            review = self.rt.agents['director'].review_draft(draft)
            draft.update(review=str(review['notes'])[:2000], approved=review['approved'] is True)
            self.rt.store.x("UPDATE drafts SET payload = ?, state = 'ready', error = '' WHERE id = ?",
                            (json.dumps(draft, ensure_ascii=False), draft_id))
            self.status, self.detail = 'completed', 'Propuesta preparada y revisada para publicación manual'
            self.finish(self.detail)
            self.log('Propuesta diaria preparada y revisada. Pendiente de decisión de César.', 'ok')
            from ..delivery import export
            export(self.rt)
        except Exception as exc:
            self.status, self.detail = 'error', str(exc)[:200]
            # No automatic regeneration, including across restarts.
            self.rt.store.x("UPDATE drafts SET state = 'error', error = ? WHERE id = ?", (self.detail, draft_id))
            self.log('Preparación pendiente: ' + self.detail, 'error')
        finally:
            self.rt.wake()

    def snapshot_extra(self):
        drafts = self.drafts()
        return [{'label': 'Propuestas preparadas', 'value': str(len(drafts))},
                {'label': 'Publicación', 'value': 'Manual por César'},
                {'label': 'Google Sheets', 'value': 'Enlazada' if self.cfg['sheet_url'] else 'Sin enlazar'}]
