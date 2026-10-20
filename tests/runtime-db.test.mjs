// Puente SQL de los ejecutores en la nube: solo el Backtest Lab y el robot de IBKR paper.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {validateRuntimeDbRequest, runtimeSqlStatements, runtimeDbLimits, readRuntimeBody} from '../functions/_lib/runtime-db.js';
import {onRequest} from '../functions/api/runtime.js';

const token = 'fixture-runtime-runner-token-never-real';
const statement = (sql, params = []) => ({action: 'runtime-db', sql, params});
const iso = () => new Date().toISOString();
async function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../migrations/0010_office_development.sql', import.meta.url), 'utf8'));
  sqlite.exec('CREATE TABLE personal_datasets(name TEXT PRIMARY KEY,payload TEXT NOT NULL,updated_at TEXT NOT NULL)');
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))].map(x => x.toString(16).padStart(2, '0')).join('');
  sqlite.prepare('INSERT INTO trading_dev_auth VALUES (1,?,?)').run(hash, Date.now());
  const counters = {batch: 0};
  const prepare = (sql, params = []) => ({sql, params, bind(...values) { return prepare(sql, values); }, async first() { return sqlite.prepare(sql).get(...params) || null; }});
  const db = {prepare(sql) { return prepare(sql); }, async batch(rows) {
    counters.batch++; sqlite.exec('BEGIN');
    try { const result = rows.map(({sql, params}) => ({success: true, results: sqlite.prepare(sql).all(...params), meta: {}})); sqlite.exec('COMMIT'); return result; }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  }};
  return {env: {CONTROL_DB: db}, sqlite, counters};
}
const call = (env, body, auth = token) => onRequest({request: new Request('https://fixture.example/api/runtime', {method: 'POST', headers: {authorization: 'Bearer ' + auth, 'content-type': 'application/json'}, body: JSON.stringify(body)}), env});

test('solo se permiten las sentencias del Backtest Lab y de IBKR paper', () => {
  assert.ok(runtimeSqlStatements.length > 0);
  for (const sql of runtimeSqlStatements) assert.match(sql, /personal_datasets.* WHERE name='(backtest-lab-request|ibkr-paper|ibkr-paper-libro)'|VALUES\('(backtest-lab|ibkr-paper|ibkr-paper-libro)'/);
  for (const sql of ['SELECT * FROM trading_state WHERE id=1', 'SELECT cipher FROM trading_secrets', 'SELECT token_hash FROM trading_dev_auth WHERE id=1', "SELECT payload,updated_at FROM personal_datasets WHERE name='backtest-lab-request'; DROP TABLE users"])
    assert.throws(() => validateRuntimeDbRequest(statement(sql)), /fuera de la lista/);
  const write = "INSERT INTO personal_datasets(name,payload,updated_at) VALUES('ibkr-paper',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at";
  assert.throws(() => validateRuntimeDbRequest(statement(write, ['{}'])), /Parámetros/);
  assert.throws(() => validateRuntimeDbRequest(statement(write, ['[]', iso()])), /Parámetros/, 'el payload ha de ser un objeto JSON');
  assert.throws(() => validateRuntimeDbRequest(statement(write, ['{}', '2020-01-01T00:00:00Z'])), /Parámetros/, 'la fecha ha de ser la actual');
});

test('con el token del ejecutor se escribe y se lee; sin él no se lee ni el cuerpo', async () => {
  const f = await fixture();
  const write = "INSERT INTO personal_datasets(name,payload,updated_at) VALUES('ibkr-paper',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at";
  assert.equal((await call(f.env, statement(write, ['{"ok":1}', iso()]))).status, 200);
  const read = await call(f.env, statement("SELECT payload,updated_at FROM personal_datasets WHERE name='ibkr-paper'"));
  assert.equal((await read.json()).result[0].results[0].payload, '{"ok":1}');
  assert.equal((await call(f.env, {action: 'runtime-key'})).status, 404, 'ya no se entrega ninguna clave de IA');
  let reads = 0;
  const response = await onRequest({request: {url: 'https://fixture.example/api/runtime', method: 'POST', headers: new Headers({authorization: 'Bearer wrong'}), body: {getReader() { reads++; throw Error('no se debe leer'); }}}, env: f.env});
  assert.equal(response.status, 401); assert.equal(reads, 0);
});

test('el tamaño del cuerpo se limita leyendo el flujo y los fallos de D1 no se dan por buenos', async () => {
  const tooLarge = new TextEncoder().encode(JSON.stringify({action: 'runtime-db', sql: 'x', params: ['é'.repeat(runtimeDbLimits.bodyBytes / 2)]}));
  const request = new Request('https://fixture.example', {method: 'POST', body: new ReadableStream({start(c) { c.enqueue(tooLarge); c.close(); }}), duplex: 'half'});
  await assert.rejects(() => readRuntimeBody(request), e => e.status === 413);
  const f = await fixture(); f.env.CONTROL_DB.batch = async () => { throw Error('D1 unavailable'); };
  const response = await call(f.env, statement("SELECT payload,updated_at FROM personal_datasets WHERE name='ibkr-paper'"));
  assert.equal(response.status, 503); assert.equal((await response.json()).success, false);
});
