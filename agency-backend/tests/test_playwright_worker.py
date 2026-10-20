"""Real Chromium + fixture pages: never submits anything to real Reddit/OpenAI."""
import asyncio
from copy import deepcopy
import datetime as dt
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
from zoneinfo import ZoneInfo

from playwright.async_api import BrowserType

from agency.agents.karma_farmer import KarmaFarmer
from agency.config import DEFAULTS
from agency.platforms.reddit import Reddit, RedditError
from agency.playwright_worker import PlaywrightWorker
from agency.store import Store, now_ms


class BrowserIntegration(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.settings = deepcopy(DEFAULTS)
        cfg = self.settings['karma_farmer']
        cfg['username'] = 'testuser'
        cfg['subreddit'] = 'TestCommunity'
        cfg['browser'].update(profile_dir=self.temp.name, headless=True, timeout_ms=1000, typing_delay_ms=1, session_ready=True)
        self.reddit = Reddit(cfg)
        self.sent = []
        self.confirm = True
        original = BrowserType.launch_persistent_context
        async def launch(browser, *args, **kwargs):
            context = await original(browser, *args, **kwargs)
            await context.route('**/*', self.route)
            return context
        self.patcher = patch.object(BrowserType, 'launch_persistent_context', launch)
        self.patcher.start()
        self.addCleanup(self.patcher.stop)

    async def route(self, route):
        url = route.request.url
        # Every browser request is intercepted, so no traffic reaches Reddit.
        if url.endswith('/created'):
            self.sent.append(route.request.post_data)
            return await route.fulfill(body='ok')
        title = self.sent[-1] if self.sent else 'What did you learn from your first job?'
        account = '<span class="user"><a>testuser</a></span>'
        thing = f'''<div id="siteTable"><div class="thing" data-fullname="t3_abc123"
          data-subreddit="TestCommunity" data-timestamp="{now_ms()}" data-score="12">
          <a class="title">{title}</a><a class="comments" href="/r/TestCommunity/comments/abc123/example/">7 comments</a>
          </div></div>'''
        sidebar = '<div class="side"><span class="karma">123</span><span class="comment-karma">456</span></div>'
        html = account + sidebar + thing
        if '/submit?' in url:
            destination = "location.href='/r/TestCommunity/comments/abc123/example/';" if self.confirm else ''
            html = account + '''<form id="newlink"><div id="title-field"><textarea name="title"></textarea></div>
            <button type="submit">submit</button></form><script>
            document.querySelector('form').onsubmit=async(e)=>{e.preventDefault();
            await fetch('/created',{method:'POST',body:document.querySelector('textarea').value});''' + destination + '};</script>'
        await route.fulfill(content_type='text/html; charset=utf-8', body=html)

    def runtime(self):
        store = Store(Path(self.temp.name) / 'test.db')
        self.addCleanup(store.db.close)
        title = 'Which childhood meal still reminds you of summer holidays?'
        events = []
        rt = SimpleNamespace(
            settings=self.settings, reddit=self.reddit, store=store,
            tz=ZoneInfo('Europe/Madrid'), now=lambda: dt.datetime.now(ZoneInfo('Europe/Madrid')),
            hm=lambda ms: str(ms), directives_for=lambda _: [], online=lambda: True,
            log=lambda agent, level, text: (store.event(agent, level, text), events.append(text)),
            llm=SimpleNamespace(call=lambda *args, **kwargs: {'candidates': [{'title': title, 'why': 'test'}]}),
        )
        return rt

    def test_all_reddit_operations_use_rendered_ui(self):
        self.assertEqual(self.reddit.me(), {'post': 123, 'comment': 456, 'total': 579})
        self.assertEqual(len(self.reddit.hot_titles('TestCommunity')), 1)
        post = self.reddit.submit('TestCommunity', 'Which meal reminds you of summer holidays?')
        self.assertEqual(post['id'], 'abc123')
        self.assertEqual(self.sent, ['Which meal reminds you of summer holidays?'])
        self.assertEqual(self.reddit.my_recent()[0]['score'], 12)
        self.assertEqual(self.reddit.refresh(['abc123'])[0]['comments'], 7)

    def test_karma_farmer_completion_is_persisted(self):
        rt = self.runtime()
        agent = KarmaFarmer(rt)
        agent.run(manual=True)
        self.assertEqual(agent.status, 'completed', agent.detail)
        self.assertEqual(rt.store.get('karma:plan')['state'], 'done')
        self.assertIsNone(rt.store.get('karma:submitting'))
        self.assertEqual(rt.store.get('karma:last_ui_result')['status'], 'Completado')
        self.assertEqual(len(rt.store.q('SELECT * FROM posts')), 1)
        self.assertTrue(any(e['level'] == 'ok' for e in rt.store.pending_events()))

    def test_uncertain_submit_is_not_repeated(self):
        self.confirm = False
        rt = self.runtime()
        agent = KarmaFarmer(rt)
        agent.run(manual=True)
        self.assertEqual(agent.status, 'error')
        self.assertEqual(rt.store.get('karma:plan')['state'], 'failed')
        self.assertIsNotNone(rt.store.get('karma:submitting'))
        self.assertTrue(rt.store.get('karma:last_ui_result')['submission_uncertain'])
        self.assertEqual(len(self.sent), 1)
        # The rendered account listing contains the exact title: recover, never click again.
        self.confirm = True
        agent.run(manual=True)
        self.assertEqual(agent.status, 'completed')
        self.assertEqual(len(self.sent), 1)

    def test_missing_input_fails_before_submission(self):
        self.reddit.browser['input_selector'] = '#absent'
        with self.assertRaises(RedditError) as caught:
            self.reddit.submit('TestCommunity', 'What do you remember from summer holidays?')
        result = caught.exception.worker_result
        self.assertEqual(result.phase, 'input')
        self.assertFalse(result.submission_uncertain)
        self.assertEqual(self.sent, [])

    def test_askreddit_is_blocked_before_browser_or_llm(self):
        self.settings['karma_farmer']['subreddit'] = 'AskReddit'
        agent = KarmaFarmer(self.runtime())
        agent.tick()
        self.assertEqual(agent.status, 'blocked')
        self.assertIsNone(agent.next_run_at())
        ok, reason = agent.handle_command('run-now')
        self.assertFalse(ok)
        self.assertIn('regla 11', reason)
        with self.assertRaisesRegex(RedditError, 'regla 11'):
            self.reddit.submit('AskReddit', 'Which meal reminds you of summer holidays?')
        self.assertEqual(self.sent, [])


if __name__ == '__main__':
    unittest.main()
