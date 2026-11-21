import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanGoal, mergeHealth, parseHealth } from '../functions/_lib/salud.js';

test('Health Auto Export: daily totals per field, units converted, weight averaged, junk dropped', () => {
  const body = { data: { metrics: [
    { name: 'step_count', units: 'count', data: [{ date: '2026-11-20 00:00:00 +0100', qty: 8123.6 }, { date: '2026-11-21 00:00:00 +0100', qty: 4000 }] },
    { name: 'dietary_energy', units: 'kJ', data: [{ date: '2026-11-20 00:00:00 +0100', qty: 8368 }] },
    { name: 'protein', units: 'g', data: [{ date: '2026-11-20 00:00:00 +0100', qty: 110.4 }] },
    { name: 'weight_body_mass', units: 'kg', data: [{ date: '2026-11-20 08:00:00 +0100', qty: 60.2 }, { date: '2026-11-20 21:00:00 +0100', qty: 60.6 }, { date: '2026-11-19 08:00:00 +0100', qty: 900 }] },
    { name: 'heart_rate', units: 'bpm', data: [{ date: '2026-11-20 00:00:00 +0100', qty: 70 }] }
  ] } };
  assert.deepEqual(parseHealth(body), { '2026-11-20': { pasos: 8124, kcal: 2000, prot: 110, peso: 60.4 }, '2026-11-21': { pasos: 4000 } });
});
test('Shortcut payload and merging: a resent day replaces its fields; old days are dropped', () => {
  const days = parseHealth({ fecha: '2026-11-21', pasos: 9000, kcal: 1850, peso: '' });
  assert.deepEqual(days, { '2026-11-21': { pasos: 9000, kcal: 1850 } });
  const stored = { dias: { '2022-01-01': { pasos: 1 }, '2026-11-21': { pasos: 4000, peso: 60 } }, objetivo: { tipo: 'volumen', peso: 63 } };
  const merged = mergeHealth(stored, days, '2026-11-21');
  assert.deepEqual(merged.dias, { '2026-11-21': { pasos: 9000, peso: 60, kcal: 1850 } });
  assert.deepEqual(merged.objetivo, { tipo: 'volumen', peso: 63 });
  assert.deepEqual(cleanGoal({ tipo: 'definicion', peso: '58.24' }), { tipo: 'definicion', peso: 58.2, ritmo: null });
  assert.throws(() => cleanGoal({ tipo: 'comer' }), /objetivo/);
});
test('Her goal pace, profile and days marked in or out', async () => {
  const { cleanProfile, markDay } = await import('../functions/_lib/salud.js');
  assert.deepEqual(cleanGoal({ tipo: 'volumen', peso: 63, ritmo: '0.2' }), { tipo: 'volumen', peso: 63, ritmo: 0.2 });
  assert.deepEqual(cleanProfile({ edad: '27', altura: 164.6 }), { edad: 27, altura: 165 });
  assert.throws(() => cleanProfile({ altura: 20 }), /perfil/);
  let s = markDay({ dias: {} }, '2026-11-20', 'fuera');
  assert.deepEqual(s.marcas, { '2026-11-20': 'fuera' });
  s = markDay(s, '2026-11-20', null); assert.deepEqual(s.marcas, {});
  assert.throws(() => markDay(s, '20-11', 'fuera'), /dia/);
});
test('The free Shortcut: lists of dates and values, numbers as the iPhone writes them in Spanish', async () => {
  const { spanishNumber } = await import('../functions/_lib/salud.js');
  assert.equal(spanishNumber('8.123', 'pasos'), 8123); assert.equal(spanishNumber('60,4', 'peso'), 60.4); assert.equal(spanishNumber('1.234,5', 'kcal'), 1234.5);
  assert.equal(spanishNumber('110,25', 'prot'), 110.25); assert.equal(spanishNumber('8123', 'pasos'), 8123); assert.equal(spanishNumber('60.4', 'peso'), 60.4);
  const body = {
    pasos_fechas: '2026-11-19T00:00:00+01:00\n2026-11-20T00:00:00+01:00', pasos_valores: '8.123\n4.000',
    kcal_fechas: '2026-11-20T00:00:00+01:00', kcal_valores: '1.850',
    peso_fechas: '2026-11-20T08:01:00+01:00\n2026-11-20T21:00:00+01:00', peso_valores: '60,2\n60,6',
    prot_fechas: '', prot_valores: ''
  };
  assert.deepEqual(parseHealth(body), { '2026-11-19': { pasos: 8123 }, '2026-11-20': { pasos: 4000, kcal: 1850, peso: 60.4 } });
});
test('Dates as the iPhone may write them', async () => {
  const { isoDay } = await import('../functions/_lib/salud.js');
  assert.equal(isoDay('2026-11-20T00:00:00+01:00'), '2026-11-20'); assert.equal(isoDay('20 nov 2026, 0:00'), '2026-11-20');
  assert.equal(isoDay('5 de noviembre de 2026'), '2026-11-05'); assert.equal(isoDay('20/11/26'), '2026-11-20'); assert.equal(isoDay('ayer'), null);
});
