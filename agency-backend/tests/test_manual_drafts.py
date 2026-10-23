from copy import deepcopy
import datetime as dt
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
from zoneinfo import ZoneInfo

from agency.agents.karma_farmer import KarmaFarmer
from agency.config import DEFAULTS
from agency.delivery import export
from agency.store import Store


class ManualDrafts(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.store = Store(Path(self.temp.name) / 'agency.db')
        self.addCleanup(self.store.db.close)
        self.director = SimpleNamespace(busy=False, review_draft=Mock(return_value={'approved': True, 'notes': 'Adapta el título a tu experiencia.'}))
        self.now = dt.datetime(2026, 10, 23, 12, 0, tzinfo=ZoneInfo('Europe/Madrid'))
        self.rt = SimpleNamespace(store=self.store, settings=deepcopy(DEFAULTS),
            now=lambda: self.now, today=lambda: self.now.date().isoformat(), tz=self.now.tzinfo,
            directives_for=lambda _: [], wake=lambda: None, log=lambda *a: None,
            llm=SimpleNamespace(call=Mock(return_value={'candidates': [
                {'title': 'Which childhood meal reminds you of summer holidays?', 'why': 'Experiencias personales'}]})),
            agents={'director': self.director})
        self.agent = KarmaFarmer(self.rt)
        self.rt.agents['karma-farmer'] = self.agent
        self.export_patch = patch('agency.delivery.DATA_DIR', Path(self.temp.name))
        self.export_patch.start()
        self.addCleanup(self.export_patch.stop)

    def test_prepares_reviews_exports_without_a_reddit_client(self):
        self.agent.run(True)
        self.assertEqual(self.agent.status, 'completed', self.agent.detail)
        draft = self.agent.drafts()[0]
        self.assertEqual(draft['id'], 'reddit-2026-10-23')
        self.assertTrue(draft['approved'])
        self.assertIn('Publica tú', ' '.join(draft['steps']))
        self.rt.llm.call.assert_called_once()
        self.director.review_draft.assert_called_once()
        data = json.loads((Path(self.temp.name) / 'deliveries/reddit-drafts.json').read_text())
        self.assertEqual(data[0]['title'], draft['title'])
        self.assertFalse(hasattr(self.rt, 'reddit'))

    def test_same_day_commands_and_restarts_do_not_regenerate(self):
        self.agent.run(True)
        self.agent.run(True)
        recovered = KarmaFarmer(self.rt)
        recovered.tick()
        recovered.run(True)
        self.rt.llm.call.assert_called_once()
        self.director.review_draft.assert_called_once()
        self.assertEqual(len(self.agent.drafts()), 1)

    def test_failed_review_recovers_saved_title_without_generating_again(self):
        self.director.review_draft.side_effect = RuntimeError('Review unavailable')
        self.agent.run(True)
        self.assertEqual(self.agent.status, 'error')
        for _ in range(100):
            self.agent.tick()
        self.rt.llm.call.assert_called_once()
        self.director.review_draft.side_effect = None
        self.agent.run(True)
        self.rt.llm.call.assert_called_once()
        self.assertEqual(self.agent.status, 'completed')

    def test_before_daily_time_or_paused_never_starts(self):
        self.now = self.now.replace(hour=8)
        with patch.object(self.agent, 'start') as start:
            self.agent.tick()
            self.now = self.now.replace(hour=12)
            self.agent.paused = True
            self.agent.tick()
            start.assert_not_called()

    def test_after_time_starts_only_when_director_is_available(self):
        with patch.object(self.agent, 'start') as start:
            self.director.busy = True
            self.agent.tick()
            start.assert_not_called()
            self.director.busy = False
            self.agent.tick()
            start.assert_called_once_with(self.agent.run, False)

    def test_existing_work_is_not_automatically_retried_after_crash(self):
        self.store.x("INSERT INTO drafts (id,day,state,payload,created_at) VALUES ('x',?,'generating','{}',1)", (self.rt.today(),))
        self.agent.tick()
        self.assertEqual(self.agent.status, 'error')
        self.agent.run(False)
        self.rt.llm.call.assert_not_called()
