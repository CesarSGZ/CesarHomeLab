import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {accessForUser} from '../functions/_lib/auth.js';
import {onRequest} from '../functions/control/api/backtest/status.js';
import {validateBacktestParams, requestIsActive, STALE_RUN_MS} from '../control/backtest-model.js';
import {runtimeDatabase} from '../trading-worker/runtime-db.js';
import {claim, publish, fail, readRequest} from '../scripts/backtest-lab.mjs';

function d1() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../migrations/0002_personal_datasets.sql', import.meta.url), 'utf8'));
  const prepare = (sql, params = []) => ({sql, params, bind(...values) { return prepare(sql, values); },
    async first() { return sqlite.prepare(sql).get(...params) || null; },
    async all() { return {results: sqlite.prepare(sql).all(...params)}; },
    async run() { sqlite.prepare(sql).run(...params); return {success: true}; }});
  const db = {prepare: sql => prepare(sql), async batch(rows) { return rows.map(({sql, params}) => ({success: true, results: sqlite.prepare(sql).all(...params), meta: {}})); }};
  return {sqlite, db};
}
// Cliente del puente igual que el de GitHub Actions, pero contra SQLite en memoria y pasando por la lista cerrada.
function bridge(env) {
  const query = async body => (await runtimeDatabase(env, {action: 'runtime-db', ...body})).result;
  const prepare = (sql, params = []) => ({sql, params, bind(...v) { return prepare(sql, v); },
    async first() { return (await query({sql, params}))[0].results?.[0] || null; },
    async all() { return (await query({sql, params}))[0]; }, async run() { return (await query({sql, params}))[0]; }});
  return {prepare};
}
const owner = {user: {username: 'CesarVapor'}, csrfToken: 'csrf-fixture'};
const call = (env, session, init = {}, query = '') => onRequest({request: new Request('https://example.test/control/api/backtest/status' + query, init), env, data: {session}});
const post = body => ({method: 'POST', headers: {'content-type': 'application/json', 'x-csrf-token': 'csrf-fixture'}, body: JSON.stringify(body)});

test('Backtest Lab belongs only to the owner', () => {
  const access = accessForUser({username: 'CesarVapor'});
  assert.ok(access.views.includes('backtest'));
  assert.ok(access.capabilities.includes('backtest:read') && access.capabilities.includes('backtest:run'));
  for (const username of ['SuperSanti86', 'someone-else']) {
    assert.ok(!accessForUser({username}).views.includes('backtest'));
    assert.ok(!accessForUser({username}).capabilities.some(c => c.startsWith('backtest:')));
  }
});

test('parameters outside the allowed set or limits are rejected', () => {
  assert.deepEqual(validateBacktestParams(undefined), {vct: {}, momentum: {}});
  assert.deepEqual(validateBacktestParams({vct: {n: 10, holgura: 1.2}, momentum: {modo: 'manual', momentum: 'mom_6m'}}),
    {vct: {n: 10, holgura: 1.2}, momentum: {modo: 'manual', momentum: 'mom_6m'}});
  for (const bad of [{vct: {n: 50}}, {vct: {n: 10.5}}, {vct: {hack: 1}}, {other: {}}, {momentum: {momentum: 'rm -rf'}}, {vct: {n: true}}, {vct: {capital: ''}}, []])
    assert.throws(() => validateBacktestParams(bad));
});

test('API: authentication, ownership and CSRF are checked before anything is queued', async () => {
  const {db, sqlite} = d1();
  assert.equal((await call({CONTROL_DB: db}, null)).status, 401);
  assert.equal((await call({CONTROL_DB: db}, {user: {username: 'SuperSanti86'}})).status, 403);
  const noCsrf = await call({CONTROL_DB: db}, owner, {method: 'POST', body: JSON.stringify({action: 'run'})});
  assert.equal(noCsrf.status, 403);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM personal_datasets').get().n, 0);
  assert.equal((await call({CONTROL_DB: db}, owner, post({action: 'run', params: {vct: {n: 99}}}))).status, 400);
});

test('API queues one run at a time, can cancel a queued run and reports results', async () => {
  const {db} = d1();
  const env = {CONTROL_DB: db};
  const first = await call(env, owner, post({action: 'run', params: {momentum: {n: 10}}}));
  assert.equal(first.status, 202);
  assert.equal((await first.json()).request.requestedBy, 'CesarVapor');
  assert.equal((await call(env, owner, post({action: 'run'}))).status, 409);
  const status = await (await call(env, owner)).json();
  assert.equal(status.active, true); assert.equal(status.result, null); assert.equal(status.canRun, true);
  assert.equal((await call(env, owner, post({action: 'cancel'}))).status, 200);
  assert.equal((await (await call(env, owner)).json()).active, false);
  assert.equal((await call(env, owner, post({action: 'run'}))).status, 202);
});

test('a crashed run stops blocking new requests after the stale window', () => {
  const now = Date.now();
  assert.ok(requestIsActive({status: 'running', startedAt: new Date(now - 60e3).toISOString()}, now));
  assert.ok(!requestIsActive({status: 'running', startedAt: new Date(now - STALE_RUN_MS - 1).toISOString()}, now));
  assert.ok(!requestIsActive({status: 'done'}, now));
});

test('runner claims a queued request once, publishes through the allowlisted bridge and closes it', async () => {
  const {db, sqlite} = d1();
  const env = {CONTROL_DB: db};
  await call(env, owner, post({action: 'run', params: {vct: {n: 8}}}));
  const runner = bridge(env);
  const claimed = await claim(runner);
  assert.equal(claimed.run, true); assert.deepEqual(claimed.params, {vct: {n: 8}, momentum: {}});
  assert.equal((await claim(runner)).run, false, 'a second runner cannot take the same request');
  assert.equal((await claim(runner, {weekly: true})).trigger, 'weekly');
  await publish(runner, JSON.stringify({schema: 1, trigger: 'manual', strategies: []}));
  const request = await readRequest(runner);
  assert.equal(request.status, 'done');
  const stored = JSON.parse(sqlite.prepare("SELECT payload FROM personal_datasets WHERE name='backtest-lab'").get().payload);
  assert.equal(stored.requestedBy, 'CesarVapor');
  const result = await (await call(env, owner)).json();
  assert.equal(result.result.schema, 1); assert.equal(result.active, false);
});

test('runner marks failures and the bridge refuses writes to other rows or oversized payloads', async () => {
  const {db} = d1();
  const env = {CONTROL_DB: db};
  await call(env, owner, post({action: 'run'}));
  const runner = bridge(env);
  await claim(runner);
  await fail(runner, 'Yahoo no respondió');
  assert.equal((await readRequest(runner)).status, 'failed');
  const iso = new Date().toISOString();
  await assert.rejects(runtimeDatabase(env, {action: 'runtime-db', sql: 'UPDATE personal_datasets SET payload=?,updated_at=? WHERE name=?', params: ['{}', iso, 'training']}));
  await assert.rejects(runtimeDatabase(env, {action: 'runtime-db', sql: "INSERT INTO personal_datasets(name,payload,updated_at) VALUES('backtest-lab',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at", params: [JSON.stringify({x: 'a'.repeat(1_600_000)}), iso]}));
  await assert.rejects(runtimeDatabase(env, {action: 'runtime-db', sql: "INSERT INTO personal_datasets(name,payload,updated_at) VALUES('backtest-lab',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at", params: ['{}', '2020-01-01T00:00:00Z']}));
});

test('the workflow uses only the scoped runner token and never deploys or pushes', () => {
  const workflow = readFileSync(new URL('../.github/workflows/backtest-lab.yml', import.meta.url), 'utf8');
  assert.doesNotMatch(workflow, /CLOUDFLARE_|wrangler|contents: write|git push/);
  assert.match(workflow, /OFFICE_DEV_TOKEN/);
  assert.match(readFileSync(new URL('../.assetsignore', import.meta.url), 'utf8'), /^backtest-lab$/m, 'Python sources are not published by Pages');
});
