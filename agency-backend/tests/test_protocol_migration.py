from pathlib import Path
import sqlite3
import unittest


class ProtocolMigration(unittest.TestCase):
    def test_legacy_notice_is_relabelled_without_changing_other_events(self):
        db = sqlite3.connect(':memory:')
        try:
            db.execute('CREATE TABLE agency_events (agent TEXT, text TEXT)')
            db.executemany('INSERT INTO agency_events VALUES (?, ?)', [
                ('system', 'Backend Playwright instalado. legacy'),
                ('system', 'Inicio del servicio'),
                ('director', 'Contestó al usuario'),
            ])
            sql = (Path(__file__).resolve().parents[2] / 'migrations/0014_agency_osiris.sql').read_text()
            db.executescript(sql)
            db.executescript(sql)
            self.assertEqual(db.execute('SELECT text FROM agency_events').fetchall(),
                             [('PROTOCOLO OSIRIS',), ('Inicio del servicio',), ('Contestó al usuario',)])
        finally:
            db.close()
