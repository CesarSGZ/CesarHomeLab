import test from 'node:test';
import assert from 'node:assert/strict';
import {normPlan, stateOf, isDone, applyTick, progress, deadlines, soon, byMonth, bySection} from '../control/mudanza-model.js';
import {onRequest} from '../functions/control/api/mudanza/status.js';
import {accessForUser} from '../functions/_lib/auth.js';

// A made-up plan: the real one is private and lives only in D1.
const sample = {
  title: 'Mudanza de prueba', updated: '2026-11-24', start: '2027-02-01', status: 'Todo en marcha.',
  facts: [{label: 'Inicio', value: '1 feb'}, {label: '', value: 'sin etiqueta'}],
  sections: [{id: 'piso', name: 'Piso'}, {id: 'papeles', name: 'Papeles'}],
  items: [
    {id: 'a', section: 'papeles', title: 'Firmar', due: '2026-11-25', deadline: true, state: 'doing'},
    {id: 'b', section: 'piso', title: 'Buscar piso', due: '2026-11-17', state: 'done', doneOn: '2026-11-17'},
    {id: 'c', section: 'piso', title: 'Fianza', due: '2027-01-10', approx: true},
    {id: 'd', section: 'piso', title: 'Seguro de hogar', state: 'optional'},
    {id: 'a', title: 'Duplicado'},
    {id: 'bad id!', title: 'Id no válido'},
    {id: 'e', title: '   '},
    {id: 'f', section: 'papeles', title: 'Activar app', due: '2026-12-31', deadline: true, unknown: 'fuera'},
  ],
};

test('a plan is cleaned on the way in', () => {
  const p = normPlan(JSON.stringify(sample));
  assert.deepEqual(p.items.map(i => i.id), ['a', 'b', 'c', 'd', 'f']);
  assert.equal(p.items.find(i => i.id === 'c').approx, true);
  assert.equal(p.items.find(i => i.id === 'c').state, 'todo', 'no state means pending');
  assert.ok(!('unknown' in p.items.at(-1)));
  assert.equal(p.facts.length, 1);
  assert.throws(() => normPlan({title: 'sin items'}), /invalid_plan/);
  assert.throws(() => normPlan({items: [{id: 'x'}]}), /invalid_plan/);
  assert.throws(() => normPlan('no es json'));
});

test('his ticks win over the plan, progress skips optional items, and dates sort the urgent lists', () => {
  const p = normPlan(sample);
  let ticks = {};
  assert.equal(stateOf(p.items[0], ticks), 'doing');
  ticks = applyTick(ticks, 'a', true, '2026-11-24T10:00:00Z');
  assert.equal(isDone(p.items[0], ticks), true);
  ticks = applyTick(ticks, 'b', false);
  assert.equal(stateOf(p.items[1], ticks), 'todo', 'un-ticking a done item brings it back');
  assert.throws(() => applyTick(ticks, 'x', 'yes'), /invalid_tick/);
  assert.deepEqual(progress(p, ticks), {done: 1, total: 4});
  assert.deepEqual(deadlines(p, ticks).map(i => i.id), ['f']);
  assert.deepEqual(soon(p, {}, '2026-11-24', 14).map(i => i.id), ['a'], 'only open items within 14 days');
  const months = byMonth(p);
  assert.deepEqual(months.map(m => m.name), ['noviembre 2026', 'diciembre 2026', 'enero 2027', 'Sin fecha']);
  assert.deepEqual(bySection(p).map(g => g.name), ['Piso', 'Papeles']);
});

// A tiny D1 stand-in with the conditional update the API relies on.
function fakeEnv() {
  const rows = new Map();
  return {rows, CONTROL_DB: {prepare(sql) { return {bind(...a) { return {
    first: async () => rows.get(a[0]) ? {...rows.get(a[0])} : null,
    run: async () => {
      if (sql.startsWith('INSERT')) { if (rows.has(a[0])) return {meta: {changes: 0}}; rows.set(a[0], {payload: a[1], updated_at: a[2]}); return {meta: {changes: 1}}; }
      const row = rows.get(a[2]); if (!row || row.updated_at !== a[3]) return {meta: {changes: 0}};
      rows.set(a[2], {payload: a[0], updated_at: a[1] + '#' + Math.random()}); return {meta: {changes: 1}};
    }}; }}; }}};
}
const owner = {session: {user: {username: 'cesarvapor'}, csrfToken: 'tok'}};
const post = body => new Request('https://x/control/api/mudanza/status', {method: 'POST', headers: {'x-csrf-token': 'tok'}, body: JSON.stringify(body)});

test('API: only the owner, CSRF on writes, the plan is private and ticks survive a new plan', async () => {
  assert.ok(accessForUser({username: 'CesarVapor'}).views.includes('mudanza'));
  assert.ok(!accessForUser({username: 'SuperSanti86'}).capabilities.includes('mudanza:read'));
  const env = fakeEnv();
  assert.equal((await onRequest({request: new Request('https://x/'), env, data: {}})).status, 401);
  assert.equal((await onRequest({request: new Request('https://x/'), env, data: {session: {user: {username: 'supersanti86'}}}})).status, 403);
  const empty = await (await onRequest({request: new Request('https://x/'), env, data: owner})).json();
  assert.equal(empty.plan, null);
  assert.equal((await onRequest({request: new Request('https://x/', {method: 'POST', body: '{"action":"import"}'}), env, data: owner})).status, 403);
  assert.equal((await onRequest({request: post({action: 'import', plan: {items: []}}), env, data: owner})).status, 400);
  let r = await onRequest({request: post({action: 'import', plan: sample}), env, data: owner});
  assert.equal(r.status, 200);
  r = await onRequest({request: post({action: 'tick', id: 'c', done: true}), env, data: owner});
  assert.equal((await r.json()).ticks.c.done, true);
  assert.equal((await onRequest({request: post({action: 'tick', id: 'c'}), env, data: owner})).status, 400);
  // A newer plan keeps what he ticked.
  r = await onRequest({request: post({action: 'import', plan: {...sample, title: 'Versión 2'}}), env, data: owner});
  const out = await r.json();
  assert.equal(out.plan.title, 'Versión 2');
  assert.equal(out.ticks.c.done, true);
  assert.equal((await onRequest({request: post({action: 'borrar'}), env, data: owner})).status, 400);
});
