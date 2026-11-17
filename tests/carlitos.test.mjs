import test from 'node:test';
import assert from 'node:assert/strict';
import { activity, applyAction, carlitosState, eventOf, levelOf, xpFor, seasonOf } from '../functions/_lib/carlitos.js';
import { CESAR_COLUMNS, MARIA_COLUMNS, summarize } from '../functions/_lib/rivalry.js';

const shift = (iso, d) => new Date(Date.parse(`${iso}T12:00:00Z`) + d * 864e5).toISOString().slice(0, 10);
const cesarRow = (fecha, kg = 100, ej = 'Bench Press') => [fecha, 1, ej, 'Pecho', 1, 8, kg, '', '', 'app', fecha + ej];
const mariaRow = (fecha, kg = 60, ej = 'Hip thrust') => [fecha, 1, ej, 'Glúteos', 1, 10, kg, '', 'app', fecha + ej];
const acts = (c, m) => ({ cesar: activity(c, CESAR_COLUMNS), maria: activity(m, MARIA_COLUMNS) });

test('Carlitos: born hungry for nothing, fed by both, never below the floor', () => {
  const born = '2026-11-02', today = '2026-11-15', log = { born, actions: [] };
  const lazy = carlitosState(acts([], []), log, today);
  assert.equal(lazy.hunger, 10); assert.equal(lazy.level, 1); assert.equal(lazy.mood, 'triste'); assert.equal(lazy.streak, 0);
  const days = Array.from({ length: 14 }, (_, i) => shift(born, i));
  const both = carlitosState(acts(days.filter((_, i) => i % 2 === 0).map(d => cesarRow(d)), days.filter((_, i) => i % 2 === 1).map(d => mariaRow(d))), log, today);
  assert.ok(both.hunger > lazy.hunger); assert.ok(both.level > 1); assert.equal(both.streak, 1);
  assert.ok(both.diary.some(e => /Semana cuidada/.test(e.text)));
  assert.ok(both.tricks.find(t => t.id === 'sentarse').learned);
});
test('Carlitos: a week is looked after only when both train, whatever the number of days', () => {
  const log = { born: '2026-11-02', actions: [] };
  const one = carlitosState(acts(['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'].map(d => cesarRow(d)), []), log, '2026-11-10');
  assert.equal(one.streak, 0); assert.deepEqual(one.week, { cesar: false, maria: false });
  const two = carlitosState(acts([cesarRow('2026-11-03'), cesarRow('2026-11-10')], [mariaRow('2026-11-08')]), log, '2026-11-10');
  assert.equal(two.streak, 1); assert.deepEqual(two.week, { cesar: true, maria: false });
});
test('Carlitos: cuddles count up to the daily limit; treats and clothes cost bones', () => {
  let log = { born: '2026-11-10', actions: [] };
  for (let i = 0; i < 5; i++) log = applyAction(log, 'maria', { type: 'mimo' }, '2026-11-10');
  const s = carlitosState(acts([], []), log, '2026-11-10');
  assert.equal(s.left.maria.mimo, 0); assert.equal(s.left.cesar.mimo, 3); assert.equal(s.love, 60 + 21);
  log = applyAction(log, 'cesar', { type: 'golosina' }, '2026-11-10');
  const t = carlitosState(acts([], []), log, '2026-11-10');
  assert.equal(t.bones, s.bones - 4);
  log = applyAction(log, 'cesar', { type: 'comprar', item: 'corona' }, '2026-11-10');
  assert.equal(carlitosState(acts([], []), log, '2026-11-10').wardrobe.find(x => x.id === 'corona').owned, false);
  log = applyAction(log, 'maria', { type: 'vestir', item: 'collar', quitar: true }, '2026-11-10');
  assert.deepEqual(carlitosState(acts([], []), log, '2026-11-10').worn, []);
});
test('Carlitos: notes for the other, read by the other; one voucher a week each', () => {
  let log = applyAction({ born: '2026-11-10' }, 'cesar', { type: 'mensaje', text: '  Te quiero  ' }, '2026-11-10');
  assert.equal(log.messages[0].text, 'Te quiero');
  log = applyAction(log, 'cesar', { type: 'leido' }, '2026-11-10'); assert.equal(log.messages[0].read, false);
  log = applyAction(log, 'maria', { type: 'leido' }, '2026-11-10'); assert.equal(log.messages[0].read, true);
  log = applyAction(log, 'maria', { type: 'vale', text: 'Vale por palomitas' }, '2026-11-10');
  assert.throws(() => applyAction(log, 'maria', { type: 'vale', text: 'Otro' }, '2026-11-12'), /vale_semana/);
  log = applyAction(log, 'cesar', { type: 'canjear', id: log.vales[0].id }, '2026-11-12');
  assert.equal(log.vales[0].used, '2026-11-12');
  assert.throws(() => applyAction(log, 'pepe', { type: 'mimo' }, '2026-11-12'), /who/);
});
test('Carlitos: levels, events and seasons are the same for both and in a fixed rotation', () => {
  assert.equal(levelOf(0), 1); assert.equal(levelOf(xpFor(5)), 5); assert.equal(levelOf(xpFor(5) - 1), 4);
  assert.equal(eventOf('2026-11-10').id, eventOf('2026-11-15').id);
  assert.equal(seasonOf('2026-12-24').id, 'navidad'); assert.equal(seasonOf('2027-11-10', '2026-11-10').id, 'cumple'); assert.equal(seasonOf('2026-05-05'), null);
});
test('Rivalry: tonnage this week against the same days of the four weeks before', () => {
  const rows = ['2026-10-13', '2026-10-20', '2026-10-27', '2026-11-03', '2026-11-10'].map(d => cesarRow(d, 100));
  const s = summarize(rows, CESAR_COLUMNS, '2026-11-10');
  assert.equal(s.tonnage.week, 800); assert.equal(s.tonnage.pace, 800); assert.equal(s.tonnage.lastWeek, 800);
  assert.deepEqual(s.tonnage.top, { ejercicio: 'Bench Press', kg: 800 });
});
test('Carlitos: each one marks what brings them closer, once a day, and the flat in Germany fills up', () => {
  let log = { born: '2026-11-09', actions: [] };
  log = applyAction(log, 'maria', { type: 'paso', kind: 'ingles' }, '2026-11-10');
  log = applyAction(log, 'maria', { type: 'paso', kind: 'ingles' }, '2026-11-10');
  log = applyAction(log, 'maria', { type: 'paso', kind: 'entrevista' }, '2026-11-10');
  assert.throws(() => applyAction(log, 'cesar', { type: 'paso', kind: 'ingles' }, '2026-11-10'), /type/);
  log = applyAction(log, 'cesar', { type: 'paso', kind: 'aleman' }, '2026-11-10');
  const s = carlitosState(acts([], []), log, '2026-11-10');
  assert.equal(s.left.maria.ingles, 0); assert.equal(s.left.cesar.aleman, 0); assert.equal(s.left.cesar.casa, 1);
  assert.equal(s.diary.filter(d => /practicado inglés/.test(d.text)).length, 1);
  assert.deepEqual(s.home.items.map(h => h.id), ['llaves', 'cama']);
  assert.equal(s.home.next.id, 'sofa');
});
test('Carlitos: the next visit counts down and is celebrated on the day', () => {
  let log = applyAction({ born: '2026-11-09' }, 'cesar', { type: 'visita', fecha: '2026-12-20' }, '2026-11-16');
  assert.deepEqual(carlitosState(acts([], []), log, '2026-11-16').visit, { fecha: '2026-12-20', days: 34, who: 'cesar' });
  assert.throws(() => applyAction(log, 'maria', { type: 'visita', fecha: '2026-11-01' }, '2026-11-16'), /fecha/);
  const day = carlitosState(acts([], []), log, '2026-12-20');
  assert.equal(day.visit.days, 0); assert.equal(day.love, 100); assert.ok(day.diary.some(d => /Hoy os veis/.test(d.text)));
  assert.equal(carlitosState(acts([], []), log, '2026-12-21').visit, null);
});
test('Carlitos: off on the server until his start date is set', async () => {
  const { carlitosActivo, carlitosFor, CARLITOS_DESDE } = await import('../functions/_lib/carlitos-store.js');
  assert.equal(CARLITOS_DESDE, null); assert.equal(carlitosActivo('2026-11-16'), false);
  const env = { CONTROL_DB: { prepare: () => { throw new Error('no debe tocar la base'); } } };
  assert.equal(await carlitosFor(env), null);
});
test('Rivalry: bodyweight lifts never count as a beaten mark', () => {
  const rows = [['2026-10-01', 1, 'Dominadas', 'Espalda', 1, 3, 1, '', 'app', 'a'], ['2026-11-09', 1, 'Dominadas', 'Espalda', 1, 3, 5, '', 'app', 'b']];
  assert.equal(summarize(rows, MARIA_COLUMNS, '2026-11-10').records.length, 0);
});
