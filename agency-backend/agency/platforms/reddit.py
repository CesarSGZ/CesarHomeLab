"""Reddit through rendered old.reddit.com pages. No PRAW or Reddit API calls.

Selectors are configurable. Called only from the existing agent worker thread;
each operation owns and closes its persistent browser context.
"""
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
import re
from urllib.parse import urljoin

from playwright.async_api import async_playwright

from ..config import DATA_DIR
from ..playwright_worker import PlaywrightWorker
from ..store import now_ms

class RedditError(Exception):
    pass


class Reddit:
    def __init__(self, settings):
        self.cfg = settings
        self.browser = settings['browser']
        profile = Path(self.browser['profile_dir'])
        self.profile = profile if profile.is_absolute() else DATA_DIR / profile

    @property
    def username(self):
        return self.cfg.get('username', '').strip()

    @property
    def configured(self):
        return bool(re.fullmatch(r'[A-Za-z0-9_-]{3,20}', self.username)
                    and self.profile.is_dir() and self.browser.get('session_ready'))

    @asynccontextmanager
    async def page(self):
        if not self.configured:
            raise RedditError('Falta preparar la sesión de Reddit (python -m agency setup-reddit)')
        async with async_playwright() as p:
            context = await p.chromium.launch_persistent_context(
                str(self.profile), headless=self.browser['headless'], timeout=60_000,
                accept_downloads=False,
            )
            try:
                context.set_default_timeout(self.browser['timeout_ms'])
                page = await context.new_page()
                yield page
            finally:
                await context.close()

    async def navigate(self, page, url):
        response = await page.goto(url, wait_until='domcontentloaded')
        if response is not None and response.status >= 400:
            raise RedditError(f'Reddit devolvió HTTP {response.status}')
        account = page.locator(self.browser['account_selector']).filter(
            has_text=re.compile('^' + re.escape(self.username) + '$', re.I))
        await account.first.wait_for(state='visible')

    def _run(self, coroutine):
        async def bounded():
            async with asyncio.timeout(180):
                return await coroutine
        try:
            return asyncio.run(bounded())
        except RedditError:
            raise
        except Exception as exc:
            raise RedditError(f'Lectura UI fallida ({type(exc).__name__}); revisa sesión y selectores') from exc

    async def _posts(self, url, limit=40, allow_empty=False):
        async with self.page() as page:
            await self.navigate(page, url)
            posts = page.locator(self.browser['posts_selector'])
            if allow_empty:
                await page.locator('#siteTable, .listing-page .infobar').first.wait_for(state='visible')
            else:
                await posts.first.wait_for(state='visible')
            result = []
            for item in (await posts.all())[:limit]:
                fullname = await item.get_attribute('data-fullname') or ''
                if not re.fullmatch(r't3_[a-z0-9]+', fullname):
                    continue
                title = item.locator(self.browser['title_selector'])
                comments = item.locator(self.browser['comments_selector'])
                href = await comments.get_attribute('href')
                stamp = await item.get_attribute('data-timestamp')
                if not stamp:
                    raise RedditError('No se pudo leer la fecha del post; revisa los selectores')
                score = await item.get_attribute('data-score')
                count = re.search(r'\d[\d,]*', await comments.inner_text())
                result.append({
                    'id': fullname[3:], 'title': await title.inner_text(),
                    'subreddit': await item.get_attribute('data-subreddit') or self.cfg['subreddit'],
                    'url': urljoin('https://www.reddit.com', href or ''),
                    'score': int(score) if score and re.fullmatch(r'-?\d+', score) else None,
                    'comments': int(count[0].replace(',', '')) if count else None,
                    'created_at': int(stamp), 'checked_at': now_ms(),
                    'removed': 'removed' in (await item.get_attribute('class') or '').split(),
                })
            return result

    def hot_titles(self, subreddit, limit=40):
        self._validate_subreddit(subreddit)
        return [p['title'] for p in self._run(self._posts(f'https://old.reddit.com/r/{subreddit}/hot/', limit))]

    def my_recent(self, limit=15):
        return self._run(self._posts(f'https://old.reddit.com/user/{self.username}/submitted/?sort=new', limit, True))

    def refresh(self, post_ids):
        # Unseen IDs retain their old timestamps; never invent a refreshed value.
        if not post_ids:
            return []
        wanted = set(post_ids)
        return [p for p in self.my_recent(100) if p['id'] in wanted]

    async def _me(self):
        async with self.page() as page:
            await self.navigate(page, f'https://old.reddit.com/user/{self.username}/')
            async def number(selector):
                locator = page.locator(selector)
                await locator.wait_for(state='visible')
                raw = await locator.get_attribute('title') or await locator.inner_text()
                value = raw.strip().replace(',', '').replace(' ', '')
                if not re.fullmatch(r'-?\d+', value):
                    raise RedditError('Karma no legible como entero; revisa el selector')
                return int(value)
            post = await number(self.browser['post_karma_selector'])
            comment = await number(self.browser['comment_karma_selector'])
            return {'post': post, 'comment': comment, 'total': post + comment}

    def me(self):
        return self._run(self._me())

    @staticmethod
    def _validate_subreddit(subreddit):
        if not re.fullmatch(r'[A-Za-z0-9_]{2,21}', subreddit):
            raise RedditError('Subreddit no válido')

    async def submit_async(self, subreddit, title):
        self._validate_subreddit(subreddit)
        if not self.configured:
            raise RedditError('Falta preparar la sesión de Reddit (python -m agency setup-reddit)')
        worker = PlaywrightWorker(
            self.profile, headless=self.browser['headless'],
            timeout_ms=self.browser['timeout_ms'], typing_delay_ms=self.browser['typing_delay_ms'],
        )
        return await worker.execute(
            f'https://old.reddit.com/r/{subreddit}/submit?selftext=true', title,
            input_selector=self.browser['input_selector'], submit_selector=self.browser['submit_selector'],
            success_url_pattern=rf'^https://(?:www\.|old\.)?reddit\.com/r/{re.escape(subreddit)}/comments/[a-z0-9]+(?:/|$)',
            account_selector=self.browser['account_selector'], expected_account=self.username,
        )

    def submit(self, subreddit, title):
        result = self._run(self.submit_async(subreddit, title))
        if result.status != 'Completado':
            error = RedditError(f'{result.code} en {result.phase}; revisa el navegador')
            error.worker_result = result
            raise error
        post_id = re.search(r'/comments/([a-z0-9]+)(?:/|$)', result.final_url or '')
        if not post_id:
            raise RedditError('No se pudo identificar el post confirmado')
        return {'id': post_id[1], 'title': title, 'subreddit': subreddit,
                'url': result.final_url.replace('https://old.', 'https://www.'),
                'score': None, 'comments': None, 'removed': False,
                'created_at': now_ms(), 'checked_at': now_ms(), '_ui_result': result.to_dict()}
