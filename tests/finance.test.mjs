import test from 'node:test';
import assert from 'node:assert/strict';
import {occurrences, dueRecurring, upcoming, monthTotals, usualSpend, pace, fixedPerMonth, monthlySeries, budgets, normRec, shiftMonth} from '../control/finance-model.js';
import {onRequest, validOp} from '../functions/control/api/finance/status.js';
import {accessForUser} from '../functions/_lib/auth.js';

const rec = (id, freq, dia, extra = {}) => normRec([id, extra.tipo || 'Gasto', extra.importe ?? 10, extra.cat || 'Suscripciones', extra.concepto || id, freq, dia, extra.mes ?? '', extra.desde || '2026-01-01', extra.hasta || '', extra.activo ?? true]);

test('recurring dates: monthly on the last day of short months, yearly once, weekly on its weekday', () => {
  assert.deepEqual(occurrences(rec('a', 'mensual', 31), '2026-01-15', '2026-04-30'), ['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  assert.deepEqual(occurrences(rec('b', 'anual', 5, {mes: 3}), '2026-01-01', '2027-12-31'), ['2026-03-05', '2027-03-05']);
  assert.deepEqual(occurrences(rec('c', 'semanal', 1), '2026-11-01', '2026-11-16'), ['2026-11-02', '2026-11-09', '2026-11-16']);
  assert.deepEqual(occurrences(rec('d', 'mensual', 1, {activo: false}), '2026-01-01', '2026-12-31'), []);
  assert.deepEqual(occurrences(rec('e', 'mensual', 1, {desde: '2026-06-10'}), '2026-01-01', '2026-08-31'), ['2026-07-01', '2026-08-01']);
});

test('due charges are written once, never before the start, and at most two months back', () => {
  const recs = [rec('netflix', 'mensual', 5, {importe: 12.99, desde: '2026-08-01'})];
  const due = dueRecurring(recs, [], '2026-11-11');
  // Started in August, but only the last 62 days are filled in: 5 September is older than that.
  assert.deepEqual(due.map(r => r[0]), ['2026-10-05', '2026-11-05']);
  assert.equal(due[0][7], 'r-netflix-2026-10-05');
  assert.deepEqual(dueRecurring(recs, due, '2026-11-11'), []);
  assert.equal(upcoming(recs, '2026-11-11')[0].fecha, '2026-12-05');
});

test('month totals, usual spend, pace, fixed costs and budgets', () => {
  const movs = [
    ['2026-09-03', 'Gasto', 300, 'Comida', '', '', 'app', '1'], ['2026-10-03', 'Gasto', 500, 'Comida', '', '', 'app', '2'],
    ['2026-11-02', 'Gasto', 100, 'Comida', '', '', 'app', '3'], ['2026-11-04', 'Gasto', 60, 'Ocio', '', '', 'app', '4'], ['2026-11-01', 'Ingreso', 2000, 'Nómina', '', '', 'app', '5']];
  const t = monthTotals(movs, '2026-11');
  assert.equal(t.gastos, 160); assert.equal(t.ingresos, 2000); assert.equal(t.neto, 1840); assert.deepEqual(t.porCategoria[0], ['Comida', 100]);
  assert.equal(usualSpend(movs, '2026-11'), 400);
  // By the 15th, September and October had spent 300 and 500 (both on the 3rd): the usual is 400, and November has spent 160.
  const p = pace(movs, '2026-11', '2026-11-15'); assert.equal(p.expected, 400); assert.equal(p.ratio, 0.4);
  assert.deepEqual(fixedPerMonth([rec('x', 'anual', 1, {importe: 120, mes: 1}), rec('y', 'semanal', 1, {importe: 3}), rec('z', 'mensual', 1, {importe: 1500, tipo: 'Ingreso'})]), {gastos: 10 + 13, ingresos: 1500});
  assert.equal(monthlySeries(movs, '2026-11').length, 12);
  assert.deepEqual(budgets([['Gasto', 'Comida', 80], ['Gasto', 'Ocio', '']], t), [{cat: 'Comida', budget: 80, spent: 100, share: 1.25}]);
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
});

test('the API only accepts well-formed rows and only for the owner', async () => {
  assert.ok(validOp({tipo: 'guardar', tabla: 'Movimientos', fila: ['2026-11-11', 'Gasto', 12.5, 'Comida', 'Menú', '', 'app', 'm1']}));
  assert.ok(!validOp({tipo: 'guardar', tabla: 'Movimientos', fila: ['11/11/2026', 'Gasto', 12.5, 'Comida', '', '', 'app', 'm1']}));
  assert.ok(!validOp({tipo: 'guardar', tabla: 'Movimientos', fila: ['2026-11-11', 'Robo', 12.5, 'Comida', '', '', 'app', 'm1']}));
  assert.ok(validOp({tipo: 'guardar', tabla: 'Recurrentes', fila: rec('r', 'anual', 5, {mes: 3})}));
  assert.ok(validOp({tipo: 'borrar', tabla: 'Recurrentes', id: 'r'}));
  assert.ok(!validOp({tipo: 'borrar', tabla: 'Usuarios', id: 'r'}));
  assert.ok(accessForUser({username: 'CesarVapor'}).capabilities.includes('finance:read'));
  assert.ok(!accessForUser({username: 'SuperSanti86'}).capabilities.includes('finance:read'));
  const url = 'https://example.test/control/api/finance/status';
  assert.equal((await onRequest({request: new Request(url), data: {session: null}, env: {}})).status, 401);
  assert.equal((await onRequest({request: new Request(url), data: {session: {user: {username: 'SuperSanti86'}}}, env: {}})).status, 403);
  const db = {prepare: () => ({bind: () => ({first: async () => null})})};
  const none = await onRequest({request: new Request(url), data: {session: {user: {username: 'CesarVapor'}, csrfToken: 'c'}}, env: {CONTROL_DB: db}});
  assert.deepEqual(await none.json(), {ok: true, connected: false});
});
