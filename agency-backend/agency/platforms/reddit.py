"""Reddit por su API oficial (PRAW, app de tipo «script»).

Se identifica con un User-Agent honesto, como pide Reddit, y PRAW respeta sus límites de ritmo.
Las credenciales se guardan con DPAPI (python -m agency setup-reddit) y nunca salen del PC.
"""
import time

from .. import VERSION, vault


class RedditError(Exception):
    pass


class Reddit:
    def __init__(self):
        self._client = None
        self._creds = None
        self._read_at = 0.0

    @property
    def creds(self):
        # Sin cuenta conectada se vuelve a mirar cada 30 s: setup-reddit puede ejecutarse con el servicio en marcha.
        if self._creds is None or (not self._creds and time.time() - self._read_at > 30):
            self._creds, self._read_at = vault.load("reddit") or {}, time.time()
        return self._creds

    @property
    def configured(self):
        c = self.creds
        return all(c.get(k) for k in ("client_id", "client_secret", "username", "password"))

    @property
    def username(self):
        return self.creds.get("username", "")

    def client(self):
        if not self.configured:
            raise RedditError("Falta conectar la cuenta de Reddit (python -m agency setup-reddit)")
        if self._client is None:
            import praw  # import tardío: el resto del backend funciona aunque falte
            c = self.creds
            self._client = praw.Reddit(
                client_id=c["client_id"], client_secret=c["client_secret"],
                username=c["username"], password=c["password"],
                user_agent=f"windows:scarlett-agency:{VERSION} (by /u/{c['username']})",
                check_for_async=False, ratelimit_seconds=600,
            )
        return self._client

    def _wrap(self, fn):
        try:
            return fn()
        except RedditError:
            raise
        except Exception as e:  # prawcore lanza muchas clases distintas
            self._client = None if "401" in str(e) or "invalid_grant" in str(e) else self._client
            raise RedditError(f"{e.__class__.__name__}: {str(e)[:160]}") from e

    def me(self):
        def run():
            u = self.client().user.me()
            return {"post": int(u.link_karma), "comment": int(u.comment_karma), "total": int(u.link_karma) + int(u.comment_karma)}
        return self._wrap(run)

    def hot_titles(self, subreddit, limit=40):
        return self._wrap(lambda: [s.title for s in self.client().subreddit(subreddit).hot(limit=limit) if not s.stickied])

    def submit(self, subreddit, title):
        def run():
            s = self.client().subreddit(subreddit).submit(title=title, selftext="", send_replies=True)
            return self.describe(s)
        return self._wrap(run)

    def my_recent(self, limit=15):
        return self._wrap(lambda: [self.describe(s) for s in self.client().redditor(self.username).submissions.new(limit=limit)])

    def refresh(self, post_ids):
        if not post_ids:
            return []
        return self._wrap(lambda: [self.describe(s) for s in self.client().info(fullnames=["t3_" + i for i in post_ids])])

    @staticmethod
    def describe(s):
        return {
            "id": s.id, "title": s.title, "subreddit": str(s.subreddit),
            "url": "https://www.reddit.com" + s.permalink, "score": int(s.score or 0),
            "comments": int(s.num_comments or 0), "created_at": int(float(s.created_utc) * 1000),
            "removed": bool(getattr(s, "removed_by_category", None)),
            "checked_at": int(time.time() * 1000),
        }
