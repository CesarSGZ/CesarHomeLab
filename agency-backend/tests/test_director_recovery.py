from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest

from agency.agents.director import Director
from agency.store import Store


class DirectorRecovery(unittest.TestCase):
    def test_crash_before_reply_requeues_persisted_message_once(self):
        with tempfile.TemporaryDirectory() as folder:
            store = Store(Path(folder) / 'agency.db')
            try:
                rt = SimpleNamespace(store=store)
                director = Director(rt)
                message = {'id': 'message0001', 'text': '¿Cómo está el equipo?', 'at': 1000}
                director.receive([message])
                # Simulate a crash after persistence but before generating a reply.
                resumed = Director(rt)
                self.assertEqual(resumed.inbox.qsize(), 1)
                resumed.receive([message])
                self.assertEqual(resumed.inbox.qsize(), 1)
                self.assertEqual(resumed.inbox.get()['id'], message['id'])
                store.x("INSERT INTO chat (id,role,text,reply_to,at) VALUES (?, 'director', ?, ?, ?)",
                        ('reply0001', 'Todo revisado.', message['id'], 1001))
                self.assertTrue(Director(rt).inbox.empty())
            finally:
                store.db.close()


if __name__ == '__main__':
    unittest.main()
