// Infraestructura del Agent Office: migración del estado heredado, lease, secretos,
// frontera de César en la API y radar por código con fuentes simuladas.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {initialState, upgradeState, encodeState, decodeState, locked, load, storeSecret, secret} from '../trading-worker/store.js';
import {scout} from '../trading-worker/radar.js';
import {equity} from '../trading-worker/core.js';
import worker from '../trading-worker/index.js';
import {onRequest} from '../functions/control/api/trading/[[path]].js';

function db() {
  const sqlite = new DatabaseSync(':memory:');
  for (const f of ['0008_trading_lab.sql', '0009_trading_operating_budget.sql', '0010_office_development.sql', '0011_office_cloud_runner.sql']) sqlite.exec(readFileSync(new URL('../migrations/' + f, import.meta.url), 'utf8'));
  const run = (sql, params) => { const st = sqlite.prepare(sql); return /^\s*SELECT|RETURNING/i.test(sql) ? st.all(...params) : (st.run(...params), []); };
  const prepare = (sql, params = []) => ({sql, params, bind: (...p) => prepare(sql, p), async first() { return run(sql, params)[0] || null; }, async all() { return {results: run(sql, params)}; }, async run() { return {success: true, results: run(sql, params)}; }});
  return {sqlite, env: {TRADING_ENCRYPTION_SECRET: 'fixture-secret-never-real-0123456789abcdef', CONTROL_DB: {prepare, async batch(ops) { return ops.map(o => ({success: true, results: run(o.sql, o.params)})); }}}};
}

test('el estado del motor anterior se limpia conservando cartera, ledger y la empresa v2', async () => {
  const old = initialState(); old.schema = 6;
  Object.assign(old, {company: {meetings: [1, 2], development: [{status: 'queued'}]}, policy: {version: 9}, kpis: {x: 1}, visual: {}, proposals: [{}], agents: [{id: 'scout'}], demo: {book: {}}, operating: {}});
  old.real.book.cash = 7200; old.real.book.positions.push({id: 'p1', symbol: 'AAPL', qty: 10, entry: 100, mark: 110, entryFx: 1.1, markFx: 1.1});
  old.operatingLedger = {month: '2026-10', openingEquity: 9900, startedAt: 1}; old.v2 = {schema: 1, policy: {strategy: 'Mía'}, ideas: [{symbol: 'AAPL'}]};
  const before = equity(old.real.book);
  const s = upgradeState(await decodeState(await encodeState(old)));
  assert.deepEqual(Object.keys(s).sort(), ['automatic', 'config', 'lastError', 'lastTick', 'logs', 'mode', 'operatingLedger', 'paused', 'real', 'schema', 'v2']);
  assert.equal(s.schema, 7); assert.equal(equity(s.real.book), before); assert.equal(s.real.book.positions[0].symbol, 'AAPL');
  assert.equal(s.operatingLedger.openingEquity, 9900); assert.equal(s.v2.policy.strategy, 'Mía'); assert.ok(s.real.assets.length > 1000);
  assert.ok((await encodeState(s)).length < (await encodeState(old)).length + 10);
});

test('la lease impide dos ciclos a la vez y se libera aunque el ciclo falle', async () => {
  const {env, sqlite} = db();
  await locked(env, async s => { s.paused = true; await assert.rejects(() => locked(env, () => {}), /Ya hay una tarea/); });
  assert.equal((await load(env)).state.paused, true);
  await assert.rejects(() => locked(env, () => { throw Error('fallo de prueba'); }), /fallo de prueba/);
  assert.equal(sqlite.prepare('SELECT lock_until FROM trading_state').get().lock_until, 0);
  assert.equal((await load(env)).state.lastError, 'fallo de prueba');
});

test('la clave de IA se guarda cifrada, nunca sale por status y se puede borrar', async () => {
  const {env, sqlite} = db(), key = 'sk-fixture-never-real-000000000000';
  const res = await worker.fetch(new Request('https://internal/key', {method: 'POST', body: JSON.stringify({key})}), env);
  assert.equal((await res.json()).configured, true);
  assert.ok(!JSON.stringify(sqlite.prepare('SELECT * FROM trading_secrets').all()).includes(key)); assert.equal(await secret(env, 'openai'), key);
  const live = await (await worker.fetch(new Request('https://internal/status'), env)).text();
  assert.ok(!live.includes(key)); assert.equal(JSON.parse(live).connections.openai, true);
  assert.equal((await worker.fetch(new Request('https://internal/key', {method: 'POST', body: JSON.stringify({key: 'no-vale'})}), env)).status, 400);
  await storeSecret(env, 'openai', ''); assert.equal(await secret(env, 'openai'), null);
});

test('solo César con CSRF puede dejar órdenes, y solo las que existen', async () => {
  const {env, sqlite} = db(), owner = {user: {username: 'cesarvapor'}, csrfToken: 'tok'};
  const call = (path, {session = owner, method = 'POST', csrf = 'tok', body = '{}'} = {}) => onRequest({request: new Request('https://x/control/api/trading/' + path, {method, headers: {'x-csrf-token': csrf}, body: method === 'POST' ? body : undefined}), env, data: {session}, params: {path: [path]}});
  assert.equal((await call('owner', {session: null})).status, 401);
  assert.equal((await call('owner', {session: {user: {username: 'otra-persona'}, csrfToken: 'tok'}})).status, 403);
  for (const gone of ['config', 'mode', 'event', 'advance', 'bridge-token', 'development']) assert.equal((await call(gone)).status, 404, gone);
  assert.equal((await call('owner', {csrf: 'otro'})).status, 403);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM trading_command_queue').get().n, 0);
  assert.equal((await (await call('owner', {body: JSON.stringify({text: 'hola equipo'})})).json()).queued, true);
  assert.equal(sqlite.prepare('SELECT path FROM trading_command_queue').get().path, '/owner');
});

test('las órdenes de César se aplican: pausa, empleado en pausa y mensaje', async () => {
  const {env} = db(), post = (path, body) => worker.fetch(new Request('https://internal' + path, {method: 'POST', body: JSON.stringify(body)}), env).then(r => r.json());
  assert.equal((await post('/control', {paused: true})).ok, true); assert.equal((await post('/agent', {id: 'risk', paused: true})).ok, true);
  assert.equal((await post('/agent', {id: 'nadie', paused: true})).ok, false); assert.equal((await post('/owner', {text: 'Ánimo, equipo'})).ok, true);
  assert.equal((await post('/mode', {mode: 'demo'})).ok, false);
  const {state} = await load(env); assert.equal(state.paused, true); assert.equal(state.v2.agents.risk.paused, true); assert.equal(state.v2.owner[0].text, 'Ánimo, equipo');
});

test('el radar por código recorre calendario y noticias sin IA y deja candidatas puntuadas', async () => {
  const s = upgradeState(initialState()), now = Date.now(), asset = s.real.assets.find(a => a.marketCap > 3e8 && a.marketCap < 2e9 && a.price > 5 && /common stock/i.test(a.name) && !/preferred|warrant|depositary|fund|units|etf/i.test(a.name));
  s.real.catalogAt = now; const saved = globalThis.fetch, seen = [];
  const bars = n => { const ts = [], close = [], volume = []; for (let i = n; i >= 1; i--) { ts.push(Math.floor((now - i * 864e5) / 1000)); close.push(10 + i * 0.01); volume.push(4e5); } return {chart: {result: [{meta: {symbol: asset.symbol.replaceAll('.', '-'), currency: 'USD', instrumentType: 'EQUITY', exchangeName: 'NMS', regularMarketPrice: 10, regularMarketTime: Math.floor(now / 1000) - 60}, timestamp: ts, indicators: {quote: [{close, volume}], adjclose: [{adjclose: close}]}}]}}; };
  globalThis.fetch = async url => {
    url = String(url); seen.push(new URL(url).hostname);
    if (url.includes('calendar/earnings')) return Response.json({data: {rows: [{symbol: asset.symbol, name: asset.name}]}});
    if (url.includes('company_tickers_exchange')) return Response.json({fields: ['cik', 'name', 'ticker', 'exchange'], data: [[4242, asset.name, asset.symbol, 'Nasdaq']]});
    if (url.includes('prnewswire')) return new Response(`<rss><item><title>${asset.name.replace(/&/g, 'and')} raises outlook</title><description>(NASDAQ: ${asset.symbol}) raises full-year guidance</description><link>https://www.prnewswire.com/news/1.html</link><pubDate>${new Date(now - 3600e3).toUTCString()}</pubDate></item></rss>`);
    if (url.includes('browse-edgar')) return new Response('<feed></feed>');
    if (url.includes('companyfacts')) return Response.json({cik: 4242, facts: {}});
    if (url.includes('finance.yahoo.com')) return Response.json(bars(260));
    throw Error('URL inesperada ' + url);
  };
  try { await scout(s); } finally { globalThis.fetch = saved; }
  assert.ok(s.real.lastScan >= now); assert.ok(!seen.includes('api.openai.com'));
  const mine = s.real.events.filter(e => e.symbol === asset.symbol);
  assert.ok(mine.some(e => e.kind === 'Resultados' && Date.parse(e.date) > now), 'fecha de resultados del calendario');
  const news = mine.find(e => e.signal); assert.ok(news, 'señal de noticia'); assert.equal(news.signal.kind, 'Previsiones / guidance');
  assert.ok(news.preScore.score > 0 && !news.preScore.blocked); assert.ok(s.real.profiles[asset.symbol].market, 'ficha de precios');
  assert.ok(s.logs.some(l => /Barrido/.test(l.text)));
});
