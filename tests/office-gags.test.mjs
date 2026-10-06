// La vida de oficina del dashboard sale del estado real: sin IA, sin cifras inventadas.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as G from '../control/office/gags.js';

const IDS = ['scout', 'analyst', 'risk', 'operator', 'auditor', 'designer'];
const empty = {mood: 'calm', monthPnl: 0, rentTarget: 10000, daysLeft: 20, tokensLeft: 1, tokensEur: 10, positions: [], policy: {}, life: {}, agents: {}, upgrades: [], hour: 11, weekday: 3, marketOpen: true};
const rich = {mood: 'tense', equity: 10200, monthPnl: 1200, dayPnl: 90, rentTarget: 10000, daysLeft: 12, tokensLeft: .18, tokensEur: 1.8, marketOpen: false, hour: 14, weekday: 5, bossNear: true,
  positions: [{symbol: 'AAPL', pnlPct: 6.2, pnl: 150}, {symbol: 'AMD', pnlPct: -5.1, pnl: -90}], policy: {strategy: 'Momentum con red', leverage: 1.5, lotPct: 60, riskGate: 'off', pace: 'ahorro'}, upgrades: ['arcade', 'dardos', 'neon', 'aquarium', 'cafetera', 'gato', 'campana', 'plantas'],
  life: {daysSinceTrade: 3, everTraded: true, streak: {kind: 'loss', n: 2}, lastStop: {symbol: 'MSFT', pnl: -120, at: Date.now() - 3600e3}, best: {symbol: 'AAPL', pnl: 300}, worst: {symbol: 'MSFT', pnl: -120}, monthsPaid: 1, monthsMissed: 1, meetingsToday: 3, ownerUnread: true, ideas: {nueva: 4},
    agents: {scout: {pitches: 5, vetoed: 2, discarded: 1, ideasClosed: 2, ideasPnl: 180}, analyst: {plans: 4, discards: 1}, risk: {vetoes: 4, approvals: 3, overruled: 1}, operator: {buys: 3, sells: 1}, auditor: {ruleChanges: 2, lessons: 1}, designer: {}},
    strategies: [{name: 'Catalizadores cercanos', pnl: 300, trades: 2, wins: 1, current: false}, {name: 'Momentum con red', pnl: -120, trades: 1, wins: 0, current: true}]},
  agents: {scout: {task: 'pitch AAPL', thought: 'AAPL llega fuerte a resultados.', say: 'Esta es la buena.', note: 'Mirar AAPL', work: 0, callsToday: 3, eurToday: 0.0009}, analyst: {work: 2}, risk: {work: 1, idle: true}, operator: {work: 1}, auditor: {work: 3}, designer: {paused: true, idle: true}}};
const clean = s => { assert.equal(typeof s, 'string'); assert.ok(s.length > 1, 'frase vacía'); assert.doesNotMatch(s, /undefined|NaN|null|\[object|Infinity/, s); };

test('hablar con cada empleado devuelve frases con su estado real y nunca datos rotos', () => {
  for (const S of [empty, rich]) for (const id of IDS) { const lines = G.talkLines(id, S); assert.ok(lines.length >= 2, id); lines.forEach(clean); assert.equal(new Set(lines).size, lines.length); }
  const santi = G.talkLines('scout', rich).join(' | ');
  assert.match(santi, /pitch AAPL/); assert.match(santi, /AAPL llega fuerte a resultados/); assert.match(santi, /5 candidatas presentadas; me han tumbado 3/); assert.match(santi, /3 turnos/);
  assert.match(G.talkLines('risk', rich).join(' | '), /4 vetos y 3 aprobados/); assert.match(G.talkLines('designer', rich).join(' | '), /en pausa/);
  assert.match(G.talkLines('auditor', rich).join(' | '), /«Momentum con red»/); assert.match(G.talkLines('operator', rich).join(' | '), /AAPL: \+6,2 %/);
  assert.match(G.talkLines('operator', empty).join(' | '), /ni una vez/);
});

test('reacciones, miradas a la pantalla, saludos y arengas dependen del ánimo y del estado', () => {
  for (const S of [empty, rich, {...rich, mood: 'panic'}, {...rich, mood: 'joy', monthPnl: 10400}]) for (const id of IDS) {
    for (let i = 0; i < 6; i++) { clean(G.reactLine(id, S, {hour: 9 + i * 2}, () => i / 6)); clean(G.reactLine(id, S, {asleep: true}, () => i / 6)); clean(G.peekLine(id, S, () => i / 6).text); clean(G.highFive(id, S, () => i / 6).text); }
    const [a, b] = G.smalltalk(id, 'risk', S, () => .3); clean(a); clean(b);
  }
  assert.equal(G.peekLine('risk', rich).caught, true, 'quien descansa se lleva el susto'); assert.equal(G.peekLine('scout', rich).caught, false);
  assert.equal(G.highFive('scout', {...rich, mood: 'panic'}).ok, false); assert.equal(G.highFive('scout', empty).ok, true);
  const pep = G.pepTalk({...rich, mood: 'panic'}, IDS); assert.ok(pep.length <= 3 && pep.length > 0); pep.forEach(l => clean(l.text)); assert.match(pep[0].text, /8800/);
  assert.deepEqual(G.pepTalk(rich, []), []);
  for (const k of ['coffee', 'fridge', 'tank', 'mood', 'aquarium', 'cat', 'bell', 'darts', 'sofa', 'shelf', 'plant']) for (const S of [empty, rich]) clean(G.objectLine(k, S, 2, () => .4));
  assert.match(G.objectLine('tank', rich), /1,80 € \(18 %\) para 12 días/);
  const away = G.bossAway(rich), grim = G.bossAway({...rich, mood: 'panic'}); assert.equal(away.party, true); assert.equal(grim.party, false); [...away.lines, ...away.back, ...grim.lines, ...grim.back].forEach(l => { clean(l.text); assert.ok(IDS.includes(l.who)); });
});

test('los gags solo saltan cuando su condición es cierta, con datos reales y sin repetirse', () => {
  const quiet = new Set(); for (let i = 0; i < 400; i++) { const g = G.pickGag(empty, IDS, new Map(), 0, Math.random); if (g) quiet.add(g.id); }
  for (const id of ['cobweb', 'tokens', 'stop', 'vetos', 'leverage', 'nogate', 'paid', 'darts', 'months', 'pausados']) assert.ok(!quiet.has(id), id + ' no pinta nada en una oficina tranquila y sin historia');
  assert.ok(quiet.has('never'), 'sin operaciones todavía, Yari se impacienta');
  const seen = new Set(), now = 1000;
  for (const id of G.GAG_IDS) { const others = new Map(G.GAG_IDS.filter(x => x !== id).map(x => [x, now])); const g = G.pickGag(rich, IDS, others, now, () => 0); if (!g) continue; assert.equal(g.id, id); seen.add(id); assert.ok(g.steps.length >= 1); for (const s of g.steps) { assert.ok(IDS.includes(s.who)); if (s.say) clean(s.say); } }
  for (const id of ['cobweb', 'tokens', 'lights', 'stop', 'told', 'vetos', 'tumbadas', 'behind', 'winner', 'loser', 'leverage', 'allin', 'nogate', 'meetings', 'closed', 'ahorro', 'queue', 'strategy', 'owner', 'darts', 'arcade', 'neon', 'fishes', 'pausados', 'lunch', 'months', 'boss']) assert.ok(seen.has(id), 'con este estado debería poder salir «' + id + '»');
  const web = G.pickGag(rich, IDS, new Map(G.GAG_IDS.filter(x => x !== 'cobweb').map(x => [x, now])), now, () => 0);
  assert.match(web.steps[0].say, /Llevo 3 días sin apretar un botón/); assert.equal(web.steps[0].fx, 'cobweb');
  assert.equal(G.pickGag(rich, [], new Map(), now), null, 'hace falta que los implicados estén libres'); for (let i = 0; i < 50; i++) { const g = G.pickGag(rich, ['scout', 'risk'], new Map(), now); assert.ok(g.steps.every(s => ['scout', 'risk'].includes(s.who))); }
  assert.equal(G.pickGag(rich, IDS, new Map(G.GAG_IDS.map(x => [x, now])), now + 60), null, 'un gag no se repite antes de cuatro minutos');
  assert.ok(G.pickGag(rich, IDS, new Map(G.GAG_IDS.map(x => [x, now])), now + 300));
});

test('la pantalla de la sala y la recreativa enseñan datos de verdad', () => {
  const sl = G.slides(rich), flat = sl.map(x => x.join(' ')).join(' | ');
  for (const row of sl) { assert.equal(row.length, 3); assert.doesNotMatch(row.join(' '), /undefined|NaN|null/); assert.ok(row[1].length <= 16, 'cabe en la pantalla: ' + row[1]); }
  assert.match(flat, /DIAS SIN OPERAR 3/); assert.match(flat, /RACHA 2 PERDIENDO/); assert.match(flat, /VETOS DE MARIA 4/); assert.match(flat, /ULTIMO STOP MSFT -120€/); assert.match(flat, /FALTAN 8800€ EN 12D/); assert.match(flat, /MEJOR DEL MES AAPL \+300€/);
  assert.match(G.slides(empty).map(x => x.join(' ')).join('|'), /OPERACIONES NINGUNA AUN/); assert.match(G.slides({...rich, monthPnl: 12000}).map(x => x.join(' ')).join('|'), /ALQUILER PAGADO/);
  const v = G.arcadeVerdict(4.2, 1, rich); clean(v.toast); clean(v.text); assert.match(v.toast, /récord tuyo/); assert.equal(v.who, 'operator'); assert.match(G.arcadeVerdict(-3, 5, rich).text, /perdido dinero/);
});

test('la oficina no llama a ningún modelo ni a la red y usa lo que publica el motor', () => {
  for (const f of ['office.js', 'gags.js', 'art.js']) assert.doesNotMatch(readFileSync(new URL('../control/office/' + f, import.meta.url), 'utf8'), /fetch\(|XMLHttpRequest|openai|WebSocket|<img|new Image/i, f);
  const app = readFileSync(new URL('../control/office/app.js', import.meta.url), 'utf8');
  for (const field of ['life: live.life', 'policy: live.policy', 'catalog: live.office.catalog', 'dayPnl: live.company.dayPnl']) assert.ok(app.includes(field), field);
  assert.doesNotMatch(app, /openai\.com/);
});
