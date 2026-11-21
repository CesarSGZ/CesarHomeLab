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
  const stored = { dias: { '2025-01-01': { pasos: 1 }, '2026-11-21': { pasos: 4000, peso: 60 } }, objetivo: { tipo: 'volumen', peso: 63 } };
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
