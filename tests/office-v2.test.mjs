// Agent Office v2: ciclo completo con SQLite real, el validador del puente runtime-db
// (toda sentencia SQL debe estar en su lista) y una IA simulada por puesto.
import test, {mock} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {validateRuntimeDbRequest} from '../trading-worker/runtime-db.js';
import {cycle, status, ownerCommand, planTurns} from '../trading-worker/v2/cycle.js';
import {callModel} from '../trading-worker/v2/llm.js';
import {locked} from '../trading-worker/store.js';
import {checkPolicy, companyMood, initCompany, newIdea} from '../trading-worker/v2/company.js';
import {planMath} from '../trading-worker/v2/agents.js';
import {findAsset} from '../trading-worker/spain.js';
import {equity} from '../trading-worker/core.js';

const T0 = Date.parse('2026-10-07T15:00:00Z'); // miércoles 17:00 Madrid · 11:00 Nueva York (sesión abierta)
function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  for (const f of ['0008_trading_lab.sql', '0009_trading_operating_budget.sql', '0011_office_cloud_runner.sql']) sqlite.exec(readFileSync(new URL('../migrations/' + f, import.meta.url), 'utf8'));
  const sqlSeen = new Set();
  const run = (sql, params) => { validateRuntimeDbRequest({action: 'runtime-db', sql, params}); sqlSeen.add(sql); const st = sqlite.prepare(sql); return /^\s*SELECT|RETURNING/i.test(sql) ? st.all(...params) : (st.run(...params), []); };
  const prepare = (sql, params = []) => ({sql, params, bind: (...p) => prepare(sql, p), async first() { return run(sql, params)[0] || null; }, async all() { return {results: run(sql, params)}; }, async run() { return {success: true, results: run(sql, params)}; }});
  const env = {OPENAI_RUNTIME_KEY: 'test-only-not-a-live-key', CONTROL_DB: {prepare, async batch(ops) { return ops.map(o => ({success: true, results: run(o.sql, o.params)})); }}};
  const prices = {AAPL: 100, MSFT: 50, NVDA: 120, AMD: 90, META: 300, AMZN: 150, GOOGL: 140, 'SAN.MC': 8, 'ITX.MC': 50};
  const chart = symbol => { const now = Date.now(), ts = [], close = [], volume = [], es = symbol.endsWith('.MC'); for (let i = 25; i >= 2; i--) { ts.push(Math.floor((now - i * 864e5) / 1000)); close.push(prices[symbol] * (es ? 1 - i / 200 : 1)); volume.push(2e6); } return {chart: {result: [{meta: {symbol, currency: es ? 'EUR' : 'USD', instrumentType: 'EQUITY', exchangeName: es ? 'MCE' : 'NMS', regularMarketPrice: prices[symbol], regularMarketTime: Math.floor((now - 60e3) / 1000)}, timestamp: ts, indicators: {quote: [{close, volume}]}}]}}; };
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
const act = (type, extra = {}) => ({type, symbol: '', to: '', text: '', eur: 0, stopPct: 0, targetPct: 0, prob: 0, days: 0, param: '', value: '', ...extra});
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

test('María devuelve el plan con un ajuste, Augusto da luz verde y la orden espera a que abra el mercado', async () => {
  const closed = Date.parse('2026-10-07T09:00:00Z'); clockAt(closed); const f = fixture();
  try {
    f.script['turn:SANTI'] = c => c.input.ideasEnCurso.length ? turn([act('wait', {value: '60'})])() : turn([act('pitch', {symbol: 'MSFT', text: 'Contrato grande anunciado esta mañana'})])();
    f.script['turn:PEDRO'] = c => c.input.pendientes.some(p => p.estado === 'nueva') ? turn([act('plan', {symbol: 'MSFT', eur: 0, text: 'Entrada en apertura'})])() : turn([act('message', {to: 'auditor', text: 'María ha devuelto MSFT y creo que compensa tal cual'})])();
    f.script['turn:MARÍA'] = c => c.input.planesPorRevisar.length ? turn([act('revise', {symbol: 'MSFT', text: 'Con prob. del 40 % el stop del 1,5 % no compensa: bájalo al 1 %'})])() : turn([])();
    f.script['turn:AUGUSTO'] = c => c.input.bandeja.length ? turn([act('overrule', {symbol: 'MSFT', text: 'Asumimos el riesgo'})])() : turn([])();
    f.script['turn:YARI'] = c => c.input.listasParaComprar.length ? turn([act('buy', {symbol: 'MSFT'})])() : turn([])();
    for (let i = 0; i < 8; i++) { await cycle(f.env, {...f.opts, manual: true}); mock.timers.tick(5 * 60e3); }
    let live = await status(f.env);
    assert.equal(live.positions.length, 0, 'mercado cerrado: no hay ejecución');
    assert.equal(live.orders.length, 1); assert.equal(live.orders[0].symbol, 'MSFT'); assert.match(live.orders[0].note, /precio reciente/);
    assert.ok(live.timeline.some(e => e.type === 'handoff' && e.tone === 'revise' && /bájalo al 1 %/.test(e.text))); assert.ok(live.timeline.some(e => e.type === 'handoff' && e.tone === 'overrule'));
    mock.timers.setTime(T0); f.script.turn = turn([]);
    await cycle(f.env, f.opts); live = await status(f.env);
    assert.equal(live.positions.length, 1); assert.equal(live.orders.length, 0);
    assert.ok(Math.abs(live.positions[0].eur - 1000) < 60, 'tamaño por defecto: 10 % de 10.000 €');
  } finally { mock.timers.reset(); }
});

test('la reunión de premercado se transcribe, vota y aplica cambios de estrategia', async () => {
  clockAt(Date.parse('2026-10-07T13:02:00Z')); const f = fixture(); // 15:02 Madrid
  try {
    await locked(f.env, s => { initCompany(s).proposals.push({id: 'p-test', param: 'pipeline', value: 12, text: 'Más candidatas vivas', by: 'scout', at: Date.now(), status: 'pendiente', votes: {}}); });
    f.script.meeting = c => ({say: 'Opino desde mi puesto', votes: [{id: 'p-test', vote: 'no'}], proposal: {param: '', value: '', text: ''}});
    f.script['meeting:CADAQUI'] = () => ({say: 'Vamos lentos: propongo apalancarnos', votes: [{id: 'p-test', vote: 'no'}], proposal: {param: 'leverage', value: '1.5', text: 'Sin palanca no llegamos al alquiler'}});
    f.script['meeting:AUGUSTO'] = c => ({say: 'Cerramos: más palanca y nuevo nombre', summary: 'Subimos apalancamiento a 1,5', decisions: [{param: 'leverage', value: '1.5', reason: 'Necesitamos más ritmo'}, {param: 'pipeline', value: '12', reason: 'intento'}, {param: 'strategy', value: 'Momentum agresivo', reason: 'Cambio de rumbo'}, {param: 'inventado', value: '3', reason: 'no existe'}], tasks: [{to: 'scout', text: 'Trae tres candidatas de momentum'}]});
    const r = await cycle(f.env, f.opts); assert.equal(r.meeting, 'Premercado: qué hacemos hoy');
    const live = await status(f.env), m = live.meetings[0];
    assert.equal(m.status, 'terminada'); assert.equal(m.lines.length, 6); assert.equal(m.lines.at(-1).agent, 'auditor');
    assert.equal(live.policy.leverage, 1.5); assert.equal(live.policy.strategy, 'Momentum agresivo');
    assert.equal(live.policy.pipeline, 6, 'una propuesta rechazada por mayoría no se aplica');
    assert.ok(m.decisions.some(d => d.param === 'pipeline' && d.applied === false));
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

test('pulso sin IA: stop dinámico, marcador por estrategia, contadores y regalo de César', async () => {
  clockAt(T0); const f = fixture();
  try {
    f.script['turn:SANTI'] = c => c.input.ideasEnCurso.length ? turn([act('wait', {value: '60'})])() : turn([act('pitch', {symbol: 'AAPL', text: 'Resultados el jueves y viene con volumen fuerte'})])();
    f.script['turn:PEDRO'] = c => c.input.pendientes.length ? turn([act('plan', {symbol: 'AAPL', eur: 2000, stopPct: 10, targetPct: 80, days: 9, text: 'Tendencia'})])() : turn([act('wait', {value: '60'})])();
    f.script['turn:MARÍA'] = c => c.input.planesPorRevisar.length ? turn([act('approve', {symbol: 'AAPL', text: 'Adelante'})])() : turn([act('wait', {value: '60'})])();
    f.script['turn:YARI'] = c => c.input.listasParaComprar.length ? turn([act('buy', {symbol: 'AAPL'})])() : turn([act('wait', {value: '60'})])();
    f.script['turn:AUGUSTO'] = c => c.input.reglas.trailPct ? turn([act('wait', {value: '60'})])() : turn([act('apply', {param: 'trailPct', value: '5', text: 'Que el stop persiga al precio'})])();
    for (let i = 0; i < 4; i++) { await cycle(f.env, f.opts); mock.timers.tick(5 * 60e3); }
    let live = await status(f.env);
    assert.equal(live.positions.length, 1); assert.equal(live.policy.trailPct, 5); assert.match(live.board.lines[1], /STOP 1\.5~/);
    assert.equal(live.life.agents.scout.pitches, 1); assert.equal(live.life.agents.risk.approvals, 1); assert.equal(live.life.agents.operator.buys, 1); assert.equal(live.life.agents.auditor.ruleChanges, 1);
    assert.equal(live.life.daysSinceTrade, 0); assert.equal(live.life.everTraded, true); assert.equal(live.life.streak, null);
    // sube un 20 %: el stop sube detrás (5 % por debajo de 120) sin ninguna llamada
    f.prices.AAPL = 120; f.script.turn = turn([act('wait', {value: '240'})]); for (const k of Object.keys(f.script)) if (k.startsWith('turn:')) delete f.script[k];
    await cycle(f.env, f.opts); live = await status(f.env);
    assert.ok(Math.abs(live.positions[0].stop - 114) < 0.01, 'stop dinámico en ' + live.positions[0].stop);
    // cae a 113: salta el stop con beneficio y se apunta a la estrategia vigente
    f.prices.AAPL = 113; mock.timers.tick(5 * 60e3); await cycle(f.env, f.opts); live = await status(f.env);
    assert.equal(live.positions.length, 0); assert.equal(live.closed[0].reason, 'stop'); assert.ok(live.closed[0].pnl > 150);
    assert.deepEqual(live.life.strategies.map(x => [x.name, x.trades, x.wins, x.current]), [['Intradía', 1, 1, true]]);
    assert.deepEqual(live.life.streak, {kind: 'win', n: 1}); assert.equal(live.life.lastStop.symbol, 'AAPL'); assert.equal(live.life.agents.scout.ideasClosed, 1);
    assert.match(f.calls.at(-1).input.empresa.pulso || 'estrategias: Intradía', /Intradía/);
    // regalo de César: aparece en la oficina y la caja no cambia
    const cash = live.company.cash;
    await locked(f.env, s => { ownerCommand(s, '/gift', {item: 'gato'}); assert.throws(() => ownerCommand(s, '/gift', {item: 'gato'}), /ya está/); assert.throws(() => ownerCommand(s, '/gift', {item: 'yate'}), /catálogo/); });
    live = await status(f.env); assert.deepEqual(live.office.upgrades, ['gato']); assert.equal(live.company.cash, cash); assert.ok(live.timeline.some(e => e.type === 'upgrade' && e.item === 'gato'));
  } finally { mock.timers.reset(); }
});

test('sin novedades no se gasta una ronda: se espera cuatro veces más', async () => {
  clockAt(Date.parse('2026-10-10T10:00:00Z')); const f = fixture(); // sábado a mediodía: todo cerrado
  try {
    f.script.turn = turn([]); // nadie hace nada ni pide descanso
    for (let i = 0; i < 8; i++) { await cycle(f.env, {...f.opts, radar: async () => {}}); mock.timers.tick(5 * 60e3); }
    const quiet = () => f.calls.filter(c => c.who !== 'SANTI').length, first = quiet(); assert.ok(first >= 4 && first <= 5, 'primera ronda: uno por ciclo fuera de sesión');
    for (let i = 0; i < 12; i++) { await cycle(f.env, {...f.opts, radar: async () => {}}); mock.timers.tick(5 * 60e3); } // una hora más sin nada nuevo
    assert.equal(quiet(), first, 'sin eventos, radar ni precios nuevos nadie repite turno antes de 4× su cadencia');
    assert.ok(f.calls.filter(c => c.who === 'SANTI').length >= 3, 'Santi sí vuelve a su ritmo mientras falten candidatas');
    await locked(f.env, s => ownerCommand(s, '/owner', {text: 'Buenos días a todos'}));
    await cycle(f.env, {...f.opts, radar: async () => {}}); assert.ok(f.calls.slice(-2).some(c => c.who === 'AUGUSTO')); assert.equal(quiet(), first + 1);
  } finally { mock.timers.reset(); }
});

test('un cierre se revisa una vez y un descanso con el mismo trabajo delante se respeta', async () => {
  clockAt(T0); const f = fixture();
  try {
    f.script['turn:SANTI'] = c => c.input.ideasEnCurso.length ? turn([act('wait', {value: '240'})])() : turn([act('pitch', {symbol: 'AAPL', text: 'Resultados el jueves y viene con volumen fuerte'})])();
    f.script['turn:PEDRO'] = turn([act('wait', {value: '120'})]); // Pedro decide no hacer el plan todavía
    for (let i = 0; i < 6; i++) { await cycle(f.env, f.opts); mock.timers.tick(5 * 60e3); }
    assert.equal(f.calls.filter(c => c.who === 'PEDRO').length, 1, 'con la misma candidata delante y habiendo pedido descanso no se le vuelve a llamar');
    await locked(f.env, s => { s.v2.ideas[0].status = 'descartada'; const b = s.real.book; b.closed.push({symbol: 'MSFT', pnl: -50, entry: 50, exit: 48, reason: 'stop', openedAt: Date.now() - 864e5, closedAt: Date.now(), thesis: 'x'}); });
    f.script['turn:AUGUSTO'] = c => turn(c.input.cerradasSinRevisar.length ? [act('wait', {value: '30'})] : [act('wait', {value: '240'})])();
    await cycle(f.env, f.opts); mock.timers.tick(45 * 60e3); await cycle(f.env, f.opts);
    const seen = f.calls.filter(c => c.who === 'AUGUSTO').map(c => c.input.cerradasSinRevisar.length);
    assert.equal(seen.at(-1), 1, 'Augusto ve el cierre una vez: ' + seen.join(','));
    assert.equal(seen.filter(n => n === 1).length, 1, 'aunque no apunte lección, el cierre no vuelve como trabajo pendiente');
    assert.equal((await status(f.env)).agents.find(a => a.id === 'auditor').work, 0);
  } finally { mock.timers.reset(); }
});

test('Santi llena la cantera, se opera en la bolsa española en euros y conviven dos estrategias', async () => {
  clockAt(Date.parse('2026-10-07T09:30:00Z')); const f = fixture(); // 11:30 Madrid: España abierta, EEUU cerrado
  try {
    f.script['turn:SANTI'] = c => c.input.faltanCandidatas >= 5 ? turn([act('pitch', {symbol: 'SAN.MC', text: 'Banca española fuerte, sube con volumen esta semana'}), act('pitch', {symbol: 'ITX.MC', text: 'Inditex recupera tras resultados y gana tracción'}), act('pitch', {symbol: 'AAPL', text: 'Resultados el jueves y viene con volumen fuerte'})])() : turn([act('wait', {value: '240'})])();
    f.script['turn:PEDRO'] = c => { const p = c.input.pendientes.find(x => x.symbol === 'SAN.MC') || c.input.pendientes[0]; return p ? turn(p.symbol === 'SAN.MC' ? [act('playbook', {param: 'Ibex de ida y vuelta', text: 'Bancos españoles con movimiento fuerte, entrar y salir en dos días', value: '10', stopPct: 3, targetPct: 6, days: 2}), act('plan', {symbol: 'SAN.MC', param: 'Ibex de ida y vuelta', text: 'Entrada rápida'})] : [act('plan', {symbol: p.symbol, eur: 1500, text: 'Plan estándar'})])() : turn([act('wait', {value: '60'})])(); };
    f.script['turn:MARÍA'] = c => c.input.planesPorRevisar.length ? turn(c.input.planesPorRevisar.slice(0, 3).map(p => act('approve', {symbol: p.symbol, text: 'Adelante'})))() : turn([act('wait', {value: '60'})])();
    f.script['turn:YARI'] = c => c.input.listasParaComprar.length ? turn(c.input.listasParaComprar.slice(0, 3).map(p => act('buy', {symbol: p.symbol})))() : turn([act('wait', {value: '60'})])();
    for (let i = 0; i < 6; i++) { await cycle(f.env, f.opts); mock.timers.tick(5 * 60e3); }
    let live = await status(f.env);
    const first = f.calls.find(c => c.who === 'SANTI').input;
    assert.equal(first.faltanCandidatas, 6); assert.match(first.encargo, /hasta 3 candidatas/); assert.match(first.mercado, /EEUU cerrado · España ABIERTO/);
    assert.ok(first.bolsaEspañola.length >= 2 && first.bolsaEspañola.every(x => x.symbol.endsWith('.MC') && x.r5d > 0), 'Santi ve qué se mueve en España');
    assert.equal(live.life.agents.scout.pitches, 3);
    assert.deepEqual(live.positions.map(p => p.symbol).sort(), ['ITX.MC', 'SAN.MC'], 'las españolas se compran en su sesión; AAPL espera a Nueva York');
    assert.equal(live.orders[0].symbol, 'AAPL'); assert.equal(live.market.es, true); assert.equal(live.market.us, false);
    const san = live.positions.find(p => p.symbol === 'SAN.MC'), itx = live.positions.find(p => p.symbol === 'ITX.MC');
    assert.equal(san.currency, 'EUR'); assert.equal(san.strategy, 'Ibex de ida y vuelta'); assert.equal(itx.strategy, 'Intradía');
    assert.ok(Math.abs(san.eur - 1000) < 12, 'lote del 10 % de la estrategia paralela, sin conversión a dólares: ' + san.eur); assert.ok(itx.eur > 700 && itx.eur < 1050);
    assert.ok(Math.abs(san.stop - 8.02 * 0.97) < 0.01); assert.ok(Math.abs(live.company.equity - 10000) < 15, 'entrar solo cuesta deslizamiento y comisión');
    assert.equal(live.books.length, 1); assert.equal(live.books[0].days, 2);
    // el Santander sube un 7 %: objetivo del +6 % cumplido, en euros y apuntado a su estrategia
    f.prices['SAN.MC'] = 8.6; f.script.turn = turn([act('wait', {value: '240'})]); for (const k of Object.keys(f.script)) if (k.startsWith('turn:')) delete f.script[k];
    await cycle(f.env, f.opts); live = await status(f.env);
    const sold = live.closed.find(c => c.symbol === 'SAN.MC'); assert.equal(sold.reason, 'objetivo'); assert.ok(sold.pnl > 60 && sold.pnl < 75, 'resultado en euros sin tipo de cambio: ' + sold.pnl);
    assert.deepEqual(live.life.strategies.map(x => [x.name, x.trades, x.current]), [['Ibex de ida y vuelta', 1, true]]);
    await locked(f.env, s => { const v2 = initCompany(s); assert.equal(checkPolicy('pipeline', '40').value, 12); assert.ok(v2.books.length === 1); });
  } finally { mock.timers.reset(); }
});

test('regla de la casa: lo que nadie decide en dos turnos sigue adelante y Cadaqui reparte los tokens', async () => {
  clockAt(T0); const f = fixture();
  try {
    f.script['turn:SANTI'] = c => c.input.ideasEnCurso.length ? turn([act('wait', {value: '240'})])() : turn([act('pitch', {symbol: 'AAPL', text: 'Resultados el jueves y viene con volumen fuerte'})])();
    f.script['turn:CADAQUI'] = c => turn(c.input.repartoDeTokens.operator.frecuencia === 1 ? [act('budget', {to: 'operator', value: '1.8', text: 'Yari convierte turnos en operaciones'})] : [])();
    f.script.turn = c => turn([act('message', {to: 'scout', symbol: 'AAPL', text: 'Necesito que me confirmes el precio de AAPL antes de seguir'})])(); // todos piden confirmaciones en vez de decidir
    for (let i = 0; i < 9; i++) { await cycle(f.env, f.opts); mock.timers.tick(5 * 60e3); }
    const live = await status(f.env);
    assert.deepEqual(live.positions.map(p => p.symbol), ['AAPL'], 'aunque nadie decida, la idea acaba comprada con el lote de la casa');
    assert.ok(Math.abs(live.positions[0].eur - 1000) < 110, 'lote ' + live.positions[0].eur + ' ' + JSON.stringify(live.ideas[0].plan)); assert.ok(live.life.agents.analyst.nudged >= 1 && live.life.agents.risk.nudged >= 1 && live.life.agents.operator.nudged >= 1);
    assert.equal(live.shares.operator, 1.8); assert.equal(checkPolicy('leverage', '9').value, 5); assert.equal(checkPolicy('maxPositions', '50').ok, false, 'ya no hay máximo de posiciones');
  } finally { mock.timers.reset(); }
});

test('trading por horas, mensaje de César entregado una vez y colchón para el mes siguiente', async () => {
  clockAt(T0); const f = fixture();
  try {
    f.script['turn:SANTI'] = c => c.input.ideasEnCurso.length ? turn([act('wait', {value: '240'})])() : turn([act('pitch', {symbol: 'AAPL', text: 'Resultados esta tarde: jugada de horas'})])();
    f.script['turn:PEDRO'] = c => c.input.pendientes.length ? turn([act('plan', {symbol: 'AAPL', eur: 2000, stopPct: 2, targetPct: 30, days: 0.05, text: 'Dentro y fuera en poco más de una hora'})])() : turn([act('wait', {value: '60'})])();
    f.script['turn:MARÍA'] = c => c.input.planesPorRevisar.length ? turn([act('approve', {symbol: 'AAPL', text: 'Corto y con stop: vale'})])() : turn([act('wait', {value: '60'})])();
    f.script['turn:YARI'] = c => c.input.listasParaComprar.length ? turn([act('buy', {symbol: 'AAPL'})])() : turn([act('wait', {value: '60'})])();
    for (let i = 0; i < 3; i++) { await cycle(f.env, f.opts); mock.timers.tick(5 * 60e3); }
    let live = await status(f.env);
    assert.equal(live.positions.length, 1); assert.ok(live.positions[0].expiresAt - live.positions[0].openedAt < 75 * 60e3, 'plazo de 0,05 días = 72 minutos');
    assert.equal(live.timeline.filter(e => e.type === 'owner' && /cambio de rumbo/.test(e.text)).length, 1); assert.ok(f.calls.some(c => c.who === 'AUGUSTO' && c.input.bandeja.some(b => /César \(el dueño\).*intradía/.test(b))));
    assert.ok(f.calls[0].input.mensajeDelDueño.some(t => /intradía/.test(t)));
    f.script.turn = turn([act('wait', {value: '240'})]); for (const k of Object.keys(f.script)) if (k.startsWith('turn:')) delete f.script[k];
    mock.timers.tick(75 * 60e3); await cycle(f.env, f.opts); live = await status(f.env);
    assert.equal(live.positions.length, 0); assert.equal(live.closed[0].reason, 'tiempo');
    assert.deepEqual(checkPolicy('holdDays', '0.1'), {ok: true, value: 0.1}); assert.equal(checkPolicy('holdDays', '2.6').value, 3);
    // octubre acaba con 12.500 € de beneficio: 2.500 € pasan a noviembre
    await locked(f.env, s => { s.real.book.cash += 12500 - (equity(s.real.book) - s.operatingLedger.openingEquity); });
    mock.timers.setTime(Date.parse('2026-11-02T15:00:00Z')); await cycle(f.env, f.opts); live = await status(f.env);
    assert.equal(live.company.months['2026-10'].paid, true); assert.ok(Math.abs(live.company.monthPnl - 2500) < 5, 'noviembre arranca con el sobrante: ' + live.company.monthPnl);
  } finally { mock.timers.reset(); }
});

test('sin máximo de posiciones, esperanza de cada plan y migración única a intradía', async () => {
  // Esperanza: 40 % × 6 % − 60 % × 2 % = +1,2 %; probabilidad mínima para compensar = 2 / 8 = 25 %.
  const m = planMath({eur: 1000, stopPct: 2, targetPct: 6, prob: 40});
  assert.equal(m.esperanzaPct, 1.2); assert.equal(m.esperanzaEur, 12); assert.equal(m.probMinimaParaCompensarPct, 25); assert.equal(m.ratioGananciaPerdida, 3);
  assert.equal(planMath({eur: 1000, stopPct: 2, targetPct: 6}).probGanarPct, 'sin estimar');
  // La empresa en marcha pasa a intradía una sola vez y conserva lo que no se toca.
  const s = {v2: null, real: {book: {positions: [], closed: [], orders: []}}};
  initCompany(s, T0); s.v2.policyRev = 1; s.v2.policy = {...s.v2.policy, strategy: 'Catalizadores cercanos', maxPositions: 5, leverage: 2};
  initCompany(s, T0 + 1);
  assert.equal(s.v2.policy.strategy, 'Intradía'); assert.equal(s.v2.policy.leverage, 2); assert.equal('maxPositions' in s.v2.policy, false);
  assert.ok(s.v2.strategyLog.some(l => /Indicación de César/.test(l.reason)));
  s.v2.policy.strategy = 'Lo que decida Augusto'; initCompany(s, T0 + 2); assert.equal(s.v2.policy.strategy, 'Lo que decida Augusto', 'la migración no se repite');
  // Siete posiciones a la vez: ya no hay tope de cartera.
  clockAt(T0); const f = fixture();
  try {
    const syms = ['AAPL', 'MSFT', 'NVDA', 'AMD', 'META', 'AMZN', 'GOOGL'];
    await locked(f.env, st => { initCompany(st); for (const sym of syms) { const idea = newIdea(st.v2, findAsset(st, sym) || {symbol: sym, name: sym}, 'analyst', 'prueba', T0); idea.status = 'aprobada'; idea.plan = {eur: 600, stopPct: 2, targetPct: 4, days: 0.25, prob: 50, text: 'x'}; } });
    f.script['turn:YARI'] = c => turn(c.input.listasParaComprar.map(i => act('buy', {symbol: i.symbol})).slice(0, 3))();
    f.script.turn = turn([act('wait', {value: '240'})]);
    for (let i = 0; i < 4; i++) { await cycle(f.env, {...f.opts, manual: true}); mock.timers.tick(5 * 60e3); }
    const live = await status(f.env);
    assert.ok(live.positions.length > 5, 'más de las 5 posiciones de antes: ' + live.positions.length);
  } finally { mock.timers.reset(); }
});
