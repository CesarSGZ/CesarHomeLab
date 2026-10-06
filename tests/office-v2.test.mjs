// Agent Office v2: ciclo completo con SQLite real, el validador del puente runtime-db
// (toda sentencia SQL debe estar en su lista) y una IA simulada por puesto.
import test, {mock} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {validateRuntimeDbRequest} from '../trading-worker/runtime-db.js';
import {cycle, status, ownerCommand, planTurns} from '../trading-worker/v2/cycle.js';
import {callModel} from '../trading-worker/v2/llm.js';
import {locked} from '../trading-worker/engine.js';
import {checkPolicy, companyMood, initCompany} from '../trading-worker/v2/company.js';
import {equity} from '../trading-worker/core.js';

const T0 = Date.parse('2026-10-07T15:00:00Z'); // miércoles 17:00 Madrid · 11:00 Nueva York (sesión abierta)
function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  for (const f of ['0008_trading_lab.sql', '0009_trading_operating_budget.sql', '0011_office_cloud_runner.sql']) sqlite.exec(readFileSync(new URL('../migrations/' + f, import.meta.url), 'utf8'));
  const sqlSeen = new Set();
  const run = (sql, params) => { validateRuntimeDbRequest({action: 'runtime-db', sql, params}); sqlSeen.add(sql); const st = sqlite.prepare(sql); return /^\s*SELECT|RETURNING/i.test(sql) ? st.all(...params) : (st.run(...params), []); };
  const prepare = (sql, params = []) => ({sql, params, bind: (...p) => prepare(sql, p), async first() { return run(sql, params)[0] || null; }, async all() { return {results: run(sql, params)}; }, async run() { return {success: true, results: run(sql, params)}; }});
  const env = {OPENAI_RUNTIME_KEY: 'test-only-not-a-live-key', CONTROL_DB: {prepare, async batch(ops) { return ops.map(o => ({success: true, results: run(o.sql, o.params)})); }}};
  const prices = {AAPL: 100, MSFT: 50};
  const chart = symbol => { const now = Date.now(), ts = [], close = [], volume = []; for (let i = 25; i >= 2; i--) { ts.push(Math.floor((now - i * 864e5) / 1000)); close.push(prices[symbol]); volume.push(2e6); } return {chart: {result: [{meta: {symbol, currency: 'USD', instrumentType: 'EQUITY', exchangeName: 'NMS', regularMarketPrice: prices[symbol], regularMarketTime: Math.floor((now - 60e3) / 1000)}, timestamp: ts, indicators: {quote: [{close, volume}]}}]}}; };
  const script = {}, calls = [];
  const fetcher = async (url, init) => {
    url = String(url);
    if (url.includes('ecb.europa.eu')) return new Response("<Cube time='2026-10-07'><Cube currency='USD' rate='1.10'/></Cube>");
    if (url.includes('finance.yahoo.com')) { const sym = decodeURIComponent(url.split('/chart/')[1].split('?')[0]); return prices[sym] ? Response.json(chart(sym)) : new Response('', {status: 404}); }
    if (url.includes('api.openai.com')) {
      const body = JSON.parse(init.body), who = /ERES ([^\s,]+)/.exec(body.instructions)?.[1] || 'WEB', kind = /REUNIÓN/.test(body.instructions) ? 'meeting' : /RESUMEN DEL DÍA/.test(body.instructions) ? 'summary' : body.tools ? 'web' : 'turn';
      calls.push({who, kind, input: JSON.parse(body.input), model: body.model});
      const answer = (script[kind + ':' + who] || script[kind] || (() => ({thought: 'Nada que hacer', say: '', mood: 'tranquilo', note: '', actions: [{type: 'wait', symbol: '', to: '', text: '', eur: 0, stopPct: 0, targetPct: 0, days: 0, param: '', value: '60'}]})))(calls.at(-1));
      return Response.json({status: 'completed', usage: {input_tokens: 1500, output_tokens: 200}, output: [{type: 'message', content: [{type: 'output_text', text: JSON.stringify(answer)}]}]});
    }
    throw Error('URL inesperada ' + url);
  };
  const opts = {fetcher, radar: async s => { s.real.lastScan = Date.now(); }, call: (e, s, o) => callModel(e, s, {...o, fetcher})};
  return {sqlite, env, prices, script, calls, opts, sqlSeen};
}
const act = (type, extra = {}) => ({type, symbol: '', to: '', text: '', eur: 0, stopPct: 0, targetPct: 0, days: 0, param: '', value: '', ...extra});
const turn = (actions, say = '') => () => ({thought: 'ok', say, mood: 'motivado', note: '', actions});
const clockAt = t => mock.timers.enable({apis: ['Date'], now: t});

test('una idea recorre el equipo entero y acaba en compra y venta con beneficio', async () => {
  clockAt(T0); const f = fixture();
  try {
    f.script['turn:SANTI'] = c => c.input.ideasEnCurso.length ? turn([act('wait', {value: '60'})])() : turn([act('pitch', {symbol: 'AAPL', text: 'Resultados el jueves y viene con volumen fuerte'})])();
    f.script['turn:PEDRO'] = c => c.input.pendientes.length ? turn([act('plan', {symbol: 'AAPL', eur: 3000, stopPct: 5, targetPct: 10, days: 5, text: 'Momentum previo a resultados'})])() : turn([act('wait', {value: '60'})])();
    f.script['turn:MARÍA'] = c => c.input.planesPorRevisar.length ? turn([act('approve', {symbol: 'AAPL', eur: 2000, text: 'Vale, pero con menos tamaño'})])() : turn([act('wait', {value: '60'})])();
    f.script['turn:YARI'] = c => c.input.listasParaComprar.length ? turn([act('buy', {symbol: 'AAPL', text: 'Entro ya'})], 'Dentro.')() : turn([act('wait', {value: '60'})])();
    for (let i = 0; i < 3; i++) { await cycle(f.env, f.opts); mock.timers.tick(5 * 60e3); }
    let live = await status(f.env);
    assert.equal(live.positions.length, 1); assert.equal(live.positions[0].symbol, 'AAPL');
    assert.ok(live.positions[0].eur > 1900 && live.positions[0].eur <= 2000, 'María recortó el tamaño a 2.000 €');
    assert.ok(live.company.cash < 8100 && live.company.cash > 7900);
    const types = live.timeline.map(e => e.type + ':' + (e.from || e.agent || '') + '>' + (e.to || e.side || ''));
    for (const expected of ['handoff:scout>analyst', 'handoff:analyst>risk', 'handoff:risk>operator', 'trade:operator>buy']) assert.ok(types.includes(expected), expected + ' en ' + types.join(' '));
    assert.equal(live.ideas.find(i => i.symbol === 'AAPL').status, 'comprada');
    // sube un 12 %: el objetivo (+10 %) se ejecuta solo, sin IA
    f.prices.AAPL = 112.5; mock.timers.tick(5 * 60e3); const callsBefore = f.calls.length;
    f.script.turn = turn([act('wait', {value: '240'})]);
    await cycle(f.env, f.opts); live = await status(f.env);
    assert.equal(live.positions.length, 0); assert.equal(live.closed[0].reason, 'objetivo'); assert.ok(live.closed[0].pnl > 150);
    assert.ok(live.timeline.some(e => e.type === 'trade' && e.side === 'sell' && e.pnl > 150));
    assert.ok(live.company.monthPnl > 150); assert.ok(f.calls.length >= callsBefore);
    // contabilidad de tokens: cada llamada queda liquidada con su coste real
    const rows = f.sqlite.prepare('SELECT status,actual,agent FROM trading_calls').all();
    assert.ok(rows.length >= 4 && rows.every(r => r.status === 'complete' && r.actual > 0));
    const spent = f.sqlite.prepare('SELECT spent_eur FROM trading_operating_budget').get().spent_eur;
    assert.ok(spent > 0 && spent < 0.02, 'gasto ' + spent); assert.ok(Math.abs(live.budget.spentEur - spent) < 1e-9);
    assert.ok(live.agents.find(a => a.id === 'scout').calls >= 1);
  } finally { mock.timers.reset(); }
});

test('María veta, Augusto levanta el veto y la orden espera a que abra el mercado', async () => {
  const closed = Date.parse('2026-10-07T09:00:00Z'); clockAt(closed); const f = fixture();
  try {
    f.script['turn:SANTI'] = c => c.input.ideasEnCurso.length ? turn([act('wait', {value: '60'})])() : turn([act('pitch', {symbol: 'MSFT', text: 'Contrato grande anunciado esta mañana'})])();
    f.script['turn:PEDRO'] = c => c.input.pendientes.some(p => p.estado === 'nueva') ? turn([act('plan', {symbol: 'MSFT', eur: 0, text: 'Entrada en apertura'})])() : turn([act('message', {to: 'auditor', text: 'María ha vetado MSFT y creo que se equivoca'})])();
    f.script['turn:MARÍA'] = c => c.input.planesPorRevisar.length ? turn([act('veto', {symbol: 'MSFT', text: 'No me creo el contrato sin fuente'})])() : turn([])();
    f.script['turn:AUGUSTO'] = c => c.input.bandeja.length ? turn([act('overrule', {symbol: 'MSFT', text: 'Asumimos el riesgo'})])() : turn([])();
    f.script['turn:YARI'] = c => c.input.listasParaComprar.length ? turn([act('buy', {symbol: 'MSFT'})])() : turn([])();
    for (let i = 0; i < 8; i++) { await cycle(f.env, {...f.opts, manual: true}); mock.timers.tick(5 * 60e3); }
    let live = await status(f.env);
    assert.equal(live.positions.length, 0, 'mercado cerrado: no hay ejecución');
    assert.equal(live.orders.length, 1); assert.equal(live.orders[0].symbol, 'MSFT'); assert.match(live.orders[0].note, /precio reciente/);
    assert.ok(live.timeline.some(e => e.type === 'handoff' && e.tone === 'veto')); assert.ok(live.timeline.some(e => e.type === 'handoff' && e.tone === 'overrule'));
    mock.timers.setTime(T0); f.script.turn = turn([]);
    await cycle(f.env, f.opts); live = await status(f.env);
    assert.equal(live.positions.length, 1); assert.equal(live.orders.length, 0);
    assert.ok(Math.abs(live.positions[0].eur - 2000) < 60, 'lote de la casa: 20 % de 10.000 €');
  } finally { mock.timers.reset(); }
});

test('la reunión de premercado se transcribe, vota y aplica cambios de estrategia', async () => {
  clockAt(Date.parse('2026-10-07T13:02:00Z')); const f = fixture(); // 15:02 Madrid
  try {
    await locked(f.env, s => { initCompany(s).proposals.push({id: 'p-test', param: 'maxPositions', value: 12, text: 'Más diversificación', by: 'scout', at: Date.now(), status: 'pendiente', votes: {}}); });
    f.script.meeting = c => ({say: 'Opino desde mi puesto', votes: [{id: 'p-test', vote: 'no'}], proposal: {param: '', value: '', text: ''}});
    f.script['meeting:CADAQUI'] = () => ({say: 'Vamos lentos: propongo apalancarnos', votes: [{id: 'p-test', vote: 'no'}], proposal: {param: 'leverage', value: '1.5', text: 'Sin palanca no llegamos al alquiler'}});
    f.script['meeting:AUGUSTO'] = c => ({say: 'Cerramos: más palanca y nuevo nombre', summary: 'Subimos apalancamiento a 1,5', decisions: [{param: 'leverage', value: '1.5', reason: 'Necesitamos más ritmo'}, {param: 'maxPositions', value: '12', reason: 'intento'}, {param: 'strategy', value: 'Momentum agresivo', reason: 'Cambio de rumbo'}, {param: 'inventado', value: '3', reason: 'no existe'}], tasks: [{to: 'scout', text: 'Trae tres candidatas de momentum'}]});
    const r = await cycle(f.env, f.opts); assert.equal(r.meeting, 'Premercado: qué hacemos hoy');
    const live = await status(f.env), m = live.meetings[0];
    assert.equal(m.status, 'terminada'); assert.equal(m.lines.length, 6); assert.equal(m.lines.at(-1).agent, 'auditor');
    assert.equal(live.policy.leverage, 1.5); assert.equal(live.policy.strategy, 'Momentum agresivo');
    assert.equal(live.policy.maxPositions, 5, 'una propuesta rechazada por mayoría no se aplica');
    assert.ok(m.decisions.some(d => d.param === 'maxPositions' && d.applied === false));
    assert.ok(live.timeline.some(e => e.type === 'meeting' && e.lines.length === 6)); assert.ok(live.timeline.filter(e => e.type === 'strategy').length >= 2);
    assert.equal(live.board.name, 'Momentum agresivo');
    mock.timers.tick(5 * 60e3); const again = await cycle(f.env, f.opts); assert.equal(again.meeting, null, 'no se repite la misma reunión');
    assert.equal(f.calls.find(c => c.who === 'SANTI' && c.kind === 'turn').input.bandeja.some(b => /Encargo de la reunión/.test(b)), true);
  } finally { mock.timers.reset(); }
});

test('sin presupuesto no hay llamadas, pero stops y contabilidad siguen por código', async () => {
  clockAt(T0); const f = fixture();
  try {
    f.script['turn:YARI'] = turn([]);
    await cycle(f.env, f.opts);
    f.sqlite.prepare('UPDATE trading_operating_budget SET spent_eur=10').run();
    const before = f.calls.length; mock.timers.tick(5 * 60e3);
    await cycle(f.env, f.opts); const live = await status(f.env);
    assert.equal(f.calls.length, before); assert.equal(live.budget.ai.ok, false); assert.match(live.budget.ai.reason, /agotados/);
    assert.ok(live.timeline.some(e => e.type === 'system' && /agotados/.test(e.text)));
    assert.equal(live.company.mood, 'panic');
  } finally { mock.timers.reset(); }
});

test('César puede hablar al equipo y convocar reunión; reglas con límites', async () => {
  clockAt(T0); const f = fixture();
  try {
    await locked(f.env, s => { ownerCommand(s, '/owner', {text: 'Quiero más riesgo esta semana'}); ownerCommand(s, '/meeting', {topic: 'Plan para remontar'}); });
    f.script.meeting = () => ({say: 'De acuerdo', votes: [], proposal: {param: '', value: '', text: ''}});
    f.script['meeting:AUGUSTO'] = () => ({say: 'Hecho', summary: 'Más riesgo', decisions: [{param: 'lotPct', value: '500', reason: 'pide César'}], tasks: []});
    const r = await cycle(f.env, f.opts); assert.equal(r.meeting, 'Plan para remontar');
    const live = await status(f.env);
    assert.equal(live.policy.lotPct, 100, 'los valores se acotan a su rango');
    assert.ok(f.calls[0].input.mensajeDelDueño.includes('Quiero más riesgo esta semana'));
    assert.deepEqual(checkPolicy('riskGate', 'OFF'), {ok: true, value: 'off'}); assert.equal(checkPolicy('pace', 'turbo').ok, false);
    assert.equal(companyMood({monthPnl: 10500, daysLeft: 3, daysInMonth: 31, remainingEur: 2}), 'joy');
    assert.equal(companyMood({monthPnl: 200, daysLeft: 4, daysInMonth: 31, remainingEur: 2}), 'panic');
    assert.equal(companyMood({monthPnl: 4800, daysLeft: 16, daysInMonth: 31, remainingEur: 5}), 'calm');
  } finally { mock.timers.reset(); }
});

test('el reparto de turnos respeta lo que queda de presupuesto para hoy', () => {
  const s = {v2: {policy: {pace: 'normal'}, stats: {turnCostEur: 0.001}}};
  assert.equal(planTurns(s, {phase: 'session', leftToday: 1, now: T0}), 3);
  assert.equal(planTurns(s, {phase: 'session', leftToday: 0.0005, now: T0}), 0);
  const scarce = Array.from({length: 12}, (_, i) => planTurns(s, {phase: 'session', leftToday: 0.05, now: T0 + i * 300000}));
  assert.ok(scarce.reduce((a, b) => a + b, 0) <= 6, 'con poco saldo se espacian los turnos: ' + scarce.join(''));
  s.v2.policy.pace = 'intensivo'; assert.equal(planTurns(s, {phase: 'session', leftToday: 1, now: T0}), 4);
});
