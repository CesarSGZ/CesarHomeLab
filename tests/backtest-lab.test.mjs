import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {accessForUser} from '../functions/_lib/auth.js';
import {onRequest} from '../functions/control/api/backtest/status.js';
import {validateBacktestParams, requestIsActive, STALE_RUN_MS} from '../control/backtest-model.js';
import {runtimeDatabase} from '../trading-worker/runtime-db.js';
import {publicRootFiles, PUBLIC_DIRECTORIES} from '../scripts/build-pages-dist.mjs';
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
  assert.ok(!PUBLIC_DIRECTORIES.includes('backtest-lab') && !publicRootFiles().includes('backtest-lab'), 'Python sources are not in the Pages output');
  assert.match(readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8'), /pages deploy dist /, 'Pages publishes only the dist/ allowlist');
});

test('IBKR paper snapshots: only paper accounts, one history point per day, stored through the bridge', async () => {
  const {limpiarFoto, combinar, guardar} = await import('../scripts/ibkr-paper-foto.mjs');
  const base = {fecha: '2026-10-12T13:07:52+00:00', cuenta: 'DUR260665', divisa: 'EUR', valor: 994867.8, efectivo: 199180.7,
    sp500eur: 15671.06, ordenesPendientes: 0, posiciones: [{simbolo: 'TEAM', divisa: 'USD', acciones: 180, precio: 208.8, gananciaPct: -0.0057, extra: 'x'}],
    ejecuciones: [{fecha: '2026-10-12', simbolo: 'TEAM', lado: 'compra', acciones: 180, precio: 210}]};
  assert.throws(() => limpiarFoto({...base, cuenta: 'U1234567'}), /cuenta_no_paper/);
  assert.throws(() => limpiarFoto({...base, valor: 'mucho'}), /foto_incompleta/);
  const limpia = limpiarFoto(JSON.stringify({...base, capitalInicial: 1e6,
    estrategias: {fundamental: {nombre: 'Valor + momentum', asignado: 5e5, valor: 493746.5, invertido: 474431.6, noRealizada: -6253.5, realizada: 0, posiciones: 19},
      'NO VALIDA': {valor: 1}}}));
  assert.equal(limpia.posiciones[0].extra, undefined);
  assert.deepEqual(Object.keys(limpia.estrategias), ['fundamental'], 'only well-formed strategy keys');
  const conDias = limpiarFoto({...base, posiciones: [{simbolo: 'TEAM', desde: '2026-10-12', dias: 3}],
    cerradas: [{simbolo: 'MU', estrategia: 'precio', desde: '2026-10-12', hasta: '2026-11-02', dias: 21, gananciaEur: 1234.5, raro: 1}]});
  assert.equal(conDias.posiciones[0].dias, 3); assert.equal(conDias.cerradas[0].dias, 21); assert.equal(conDias.cerradas[0].raro, undefined);
  const conSemaforo = limpiarFoto({...base, posiciones: [{simbolo: 'HIMS', semaforo: {alertas: ['va_por_libre', 'loteria', 'inventada'], sinDato: ['diluye'], fecha: '2026-10-09', aprox: true, datos: {r2: 0.09}}}],
    cerradas: [{simbolo: 'MU', semaforo: 'roto'}]});
  assert.deepEqual(conSemaforo.posiciones[0].semaforo, {alertas: ['va_por_libre', 'loteria'], sinDato: ['diluye'], fecha: '2026-10-09', aprox: true},
    'risk-light alerts: only known keys, no raw data');
  assert.equal(conSemaforo.cerradas[0].semaforo, null);
  assert.equal(combinar(null, limpia).historial[0].estrategias.fundamental, 493746.5);
  const dos = combinar(combinar(null, limpia), {...limpia, fecha: '2026-10-12T20:00:00+00:00', valor: 1000100});
  assert.equal(dos.historial.length, 1, 'same day replaces');
  const tres = combinar(dos, {...limpia, fecha: '2026-10-13T20:00:00+00:00', valor: 1001000});
  assert.equal(tres.historial.length, 2); assert.equal(tres.inicio.slice(0, 10), '2026-10-12');
  const {db, sqlite} = d1();
  await guardar(bridge({CONTROL_DB: db}), limpia);
  const fila = JSON.parse(sqlite.prepare("SELECT payload FROM personal_datasets WHERE name='ibkr-paper'").get().payload);
  assert.equal(fila.ultima.cuenta, 'DUR260665');
  const status = await (await call({CONTROL_DB: db}, owner)).json();
  assert.equal(status.paper.historial.length, 1);
  await assert.rejects(runtimeDatabase({CONTROL_DB: db}, {action: 'runtime-db', sql: "INSERT INTO personal_datasets(name,payload,updated_at) VALUES('ibkr-paper',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at", params: ['{}', '2020-01-01T00:00:00Z']}));
});

test('the snapshot workflow passes the input through an environment variable and only uses the runner token', () => {
  const wf = readFileSync(new URL('../.github/workflows/ibkr-paper-foto.yml', import.meta.url), 'utf8');
  assert.match(wf, /FOTO: \$\{\{ inputs\.foto \}\}/);
  assert.doesNotMatch(wf, /run: .*\$\{\{ inputs/);
  assert.doesNotMatch(wf, /CLOUDFLARE_|wrangler|contents: write|git push/);
});

test('robot ledger round-trips through the allowlisted bridge and rejects malformed ledgers', async () => {
  const {leer, guardar, validarLibro} = await import('../scripts/ibkr-paper-libro.mjs');
  const {db} = d1();
  const runner = bridge({CONTROL_DB: db});
  assert.equal(await leer(runner), '{}');
  await guardar(runner, JSON.stringify({capitalInicial: 1e6, asignacion: {MU: 'precio'}, entradas: {MU: '2026-10-12'}, cerradas: []}));
  assert.equal(JSON.parse(await leer(runner)).asignacion.MU, 'precio');
  for (const malo of ['[]', '{"cerradas":{}}', '{"capitalInicial":-1}', 'no json']) assert.throws(() => validarLibro(malo));
});

test('the cloud robot only uses paper mode, secrets via env, and never deploys or pushes', () => {
  const wf = readFileSync(new URL('../.github/workflows/ibkr-paper-robot.yml', import.meta.url), 'utf8');
  assert.match(wf, /TRADING_MODE=paper/);
  assert.match(wf, /TWS_PASSWORD: \$\{\{ secrets\.IBKR_PAPER_PASSWORD \}\}/);
  assert.doesNotMatch(wf, /run: .*secrets\./);
  assert.doesNotMatch(wf, /CLOUDFLARE_|wrangler|contents: write|git push|TRADING_MODE=live/);
});
