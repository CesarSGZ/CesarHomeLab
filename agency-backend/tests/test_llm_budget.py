from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import requests

from agency.agents.director import Director
from agency.config import DEFAULTS, load_settings
from agency.llm import LLM, LLMError
from agency.store import Store


class BudgetTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path = Path(self.folder.name) / 'test.db'
        self.store = Store(self.path)
        self.addCleanup(self.store.db.close)
        self.rt = SimpleNamespace(store=self.store, settings=deepcopy(DEFAULTS), today=lambda: '2026-10-21')
        self.llm = LLM(self.rt)
        self.llm._key = 'test-fixture-not-a-secret'

    def call(self):
        return self.llm.call('director', 'Return JSON.', 'test', {}, deep=True, max_out=100)

    def test_idle_director_does_not_generate(self):
        director = Director(self.rt)
        with patch.object(director, 'start') as start:
            for _ in range(100):
                director.tick()
            start.assert_not_called()

    def test_timeout_is_not_retried_and_reservation_survives_restart(self):
        with patch('agency.llm.requests.post', side_effect=requests.Timeout) as post:
            with self.assertRaisesRegex(LLMError, 'sin reintento'):
                self.call()
            self.assertEqual(post.call_count, 1)
        with StoreConnection(self.path) as other:
            self.assertGreater(other.llm_spent(self.rt.today()), 0)

    def test_daily_request_cap_applies_to_failures(self):
        self.rt.settings['llm']['daily_request_cap'] = 1
        with patch('agency.llm.requests.post', return_value=Mock(ok=False, status_code=500)) as post:
            with self.assertRaisesRegex(LLMError, 'HTTP 500'):
                self.call()
            with self.assertRaisesRegex(LLMError, 'Tope diario'):
                self.call()
            self.assertEqual(post.call_count, 1)

    def test_success_replaces_reservation_with_usage(self):
        result = {'status': 'completed', 'usage': {'input_tokens': 10, 'output_tokens': 20},
                  'output': [{'content': [{'type': 'output_text', 'text': '{"ok":true}'}]}]}
        with patch('agency.llm.requests.post', return_value=Mock(ok=True, status_code=200, json=lambda: result)):
            self.assertTrue(self.call()['ok'])
        self.assertAlmostEqual(self.store.llm_spent(self.rt.today()), 0.00022)

    def test_budget_refuses_a_request_that_would_cross_cap(self):
        self.rt.settings['llm']['daily_usd_cap'] = 0.00001
        with patch('agency.llm.requests.post') as post:
            with self.assertRaisesRegex(LLMError, 'Tope diario'):
                self.call()
            post.assert_not_called()

    def test_reservations_are_atomic_across_connections(self):
        other = Store(self.path)
        self.addCleanup(other.db.close)
        def reserve(store):
            try:
                store.reserve_llm(self.rt.today(), 'director', 'test', 0.6, 1, 20)
                return True
            except ValueError:
                return False
        with ThreadPoolExecutor(2) as pool:
            self.assertEqual(sorted(pool.map(reserve, (self.store, other))), [False, True])

    def test_existing_settings_drop_legacy_switch_and_accept_bom(self):
        path = Path(self.folder.name) / 'settings.json'
        path.write_text('{"karma_farmer":{"enabled":false,"username":"testuser",'
                        '"browser":{"session_ready":false,"session_error":"obsolete"}},'
                        '"llm":{"daily_usd_cap":0.2}}', encoding='utf-8-sig')
        with patch('agency.config.DATA_DIR', path.parent), patch('agency.config.SETTINGS_PATH', path):
            settings = load_settings()
        self.assertNotIn('karma_farmer', settings)
        self.assertEqual(settings['planning']['subreddit'], 'AskReddit')
        self.assertEqual(settings['llm']['daily_usd_cap'], 0.2)

    def test_corrupt_settings_do_not_reset_budget_to_defaults(self):
        path = Path(self.folder.name) / 'settings.json'
        path.write_text('{broken', encoding='utf-8')
        with patch('agency.config.DATA_DIR', path.parent), patch('agency.config.SETTINGS_PATH', path):
            with self.assertRaisesRegex(ValueError, 'corrígelo antes de arrancar'):
                load_settings()


class StoreConnection:
    def __init__(self, path):
        self.store = Store(path)

    def __enter__(self):
        return self.store

    def __exit__(self, *args):
        self.store.db.close()
