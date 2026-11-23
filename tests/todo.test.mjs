import test from 'node:test';
import assert from 'node:assert/strict';
import {applyOps, emptyDoc, normTask, completeTask, nextDue, tasksFor, counts, fromGraph, fromText, parseImport, importSummary, dueBucket} from '../control/todo-model.js';
import {onRequest} from '../functions/control/api/todo/status.js';
import {accessForUser} from '../functions/_lib/auth.js';

const graphExport = {
  source: 'microsoft-todo',
  lists: [
    {id: 'AAA', displayName: 'Tasks', wellknownListName: 'defaultList', tasks: [
      {id: 'T1-very-long-graph-id', title: 'Pagar el seguro', status: 'notStarted', importance: 'high',
        body: {contentType: 'html', content: '<p>Póliza &amp; recibo</p><p>llamar</p>'},
        dueDateTime: {dateTime: '2026-11-29T23:00:00.0000000', timeZone: 'UTC'},
        recurrence: {pattern: {type: 'absoluteYearly', interval: 1}}, isReminderOn: true,
        reminderDateTime: {dateTime: '2026-11-30T09:00:00.0000000', timeZone: 'Romance Standard Time'},
        createdDateTime: '2025-01-02T10:00:00Z', categories: ['Casa'],
        checklistItems: [{id: 'c1', displayName: 'Buscar el número', isChecked: true}]},
      {id: 'T2', title: 'Hecha', status: 'completed', importance: 'normal', body: {contentType: 'text', content: ''}, completedDateTime: {dateTime: '2026-10-01T00:00:00.0000000', timeZone: 'UTC'}},
    ]},
    {id: 'BBB', displayName: 'Compra', wellknownListName: 'none', tasks: [
      {id: 'T3', title: 'Leche', status: 'notStarted', importance: 'normal', dueDateTime: {dateTime: '2026-11-24T00:00:00.0000000', timeZone: 'Romance Standard Time'}},
    ]},
  ],
};

test('a Microsoft To Do export keeps lists, notes, steps, dates and repeats', () => {
  const lists = fromGraph(graphExport);
  assert.deepEqual(lists.map(l => l.name), ['Tareas', 'Compra']);
  const [seguro, hecha] = lists[0].tasks;
  assert.equal(seguro.important, true);
  assert.equal(seguro.due, '2026-11-30'); // 23:00 UTC is the next day in Spain
  assert.equal(seguro.reminder, '2026-11-30T09:00');
  assert.deepEqual(seguro.repeat, {every: 'year', interval: 1});
  assert.equal(seguro.note, 'Póliza & recibo\nllamar\n\nCategorías: Casa');
  assert.deepEqual(seguro.steps.map(s => [s.title, s.done]), [['Buscar el número', true]]);
  assert.match(seguro.id, /^ms-\w+$/);
  assert.equal(hecha.done, true); assert.equal(hecha.completed, '2026-10-01T00:00:00Z');
  assert.equal(lists[1].tasks[0].due, '2026-11-24');
  assert.deepEqual(importSummary(lists), {lists: 2, tasks: 3, done: 1, steps: 1});
  // The script writes UTF-8 with a BOM on Windows PowerShell.
  assert.equal(parseImport('﻿' + JSON.stringify(graphExport)).length, 2);
  assert.throws(() => parseImport('{"foo":1}'));
});

test('importing twice changes nothing, and same-named lists are merged', () => {
  const lists = fromGraph(graphExport);
  const once = applyOps(emptyDoc(), [{op: 'import', lists}]);
  assert.deepEqual(once.lists.map(l => [l.name, l.tasks.length]), [['Tareas', 2], ['Compra', 1]]);
  const twice = applyOps(once, [{op: 'import', lists}]);
  assert.deepEqual(twice, once);
});

test('pasted text: headings make lists, [x] is done, indented lines are steps', () => {
  const lists = fromText('# Compra\n- leche\n- [x] pan\n\nCasa:\n- Llamar al fontanero\n  - pedir presupuesto\n1. Pintar');
  assert.deepEqual(lists.map(l => [l.name, l.tasks.map(t => [t.title, t.done, t.steps.length])]), [
    ['Compra', [['leche', false, 0], ['pan', true, 0]]],
    ['Casa', [['Llamar al fontanero', false, 1], ['Pintar', false, 0]]],
  ]);
  assert.equal(fromText('sin lista').at(0).name, 'Tareas');
});

test('ops: add, move between lists, delete; bad ops change nothing', () => {
  let doc = applyOps(emptyDoc(), [{op: 'list.add', id: 'casa', name: 'Casa'}, {op: 'task.put', list: 'tareas', task: {id: 'a', title: 'Uno'}}, {op: 'task.put', list: 'tareas', task: {id: 'b', title: 'Dos'}}]);
  assert.deepEqual(doc.lists[0].tasks.map(t => t.id), ['b', 'a']); // newest on top
  doc = applyOps(doc, [{op: 'task.put', list: 'casa', task: {...doc.lists[0].tasks[1], title: 'Uno bis'}}]);
  assert.deepEqual(doc.lists.map(l => l.tasks.map(t => t.title)), [['Dos'], ['Uno bis']]);
  doc = applyOps(doc, [{op: 'list.rename', id: 'casa', name: 'Hogar'}, {op: 'task.delete', id: 'b'}]);
  assert.equal(doc.lists[1].name, 'Hogar'); assert.equal(doc.lists[0].tasks.length, 0);
  assert.throws(() => applyOps(doc, [{op: 'drop.tables'}]));
  // The last list cannot be deleted.
  assert.equal(applyOps(emptyDoc(), [{op: 'list.delete', id: 'tareas'}]).lists.length, 1);
  assert.equal(normTask({title: 'x', evil: 1, due: 'mañana'}).due, '');
  assert.equal('evil' in normTask({evil: 1}), false);
});

test('repeating tasks open the next one; month ends are respected', () => {
  assert.equal(nextDue({due: '2026-01-31', repeat: {every: 'month', interval: 1}}, '2026-01-31'), '2026-02-28');
  assert.equal(nextDue({due: '2026-11-23', repeat: {every: 'week', interval: 2}}, '2026-11-23'), '2026-12-07');
  assert.equal(nextDue({due: '', repeat: {every: 'day', interval: 1}}, '2026-11-23'), '2026-11-24');
  const task = normTask({id: 'r', title: 'Regar', due: '2026-11-23', myDay: '2026-11-23', repeat: {every: 'day', interval: 3}, steps: [{title: 'a', done: true}]});
  const {done, next} = completeTask(task, '2026-11-23', '2026-11-23T10:00:00Z');
  assert.equal(done.done, true); assert.equal(next.done, false); assert.equal(next.due, '2026-11-26');
  assert.notEqual(next.id, task.id); assert.equal(next.myDay, ''); assert.equal(next.steps[0].done, false);
  assert.equal(completeTask(normTask({title: 'x'}), '2026-11-23').next, null);
});

test('smart lists: Mi día includes what is due, Planeado sorts by date', () => {
  const t = '2026-11-23';
  const doc = applyOps(emptyDoc(), [
    {op: 'task.put', list: 'tareas', task: {id: 'a', title: 'hoy', myDay: t}},
    {op: 'task.put', list: 'tareas', task: {id: 'b', title: 'vencida', due: '2026-11-20'}},
    {op: 'task.put', list: 'tareas', task: {id: 'c', title: 'luego', due: '2026-12-20', important: true}},
    {op: 'task.put', list: 'tareas', task: {id: 'd', title: 'ayer en mi día', myDay: '2026-11-22'}},
  ]);
  assert.deepEqual(tasksFor(doc, 'myday', t).map(r => r.task.id).sort(), ['a', 'b']);
  assert.deepEqual(tasksFor(doc, 'planned', t).map(r => r.task.id), ['b', 'c']);
  assert.deepEqual(tasksFor(doc, 'important', t).map(r => r.task.id), ['c']);
  assert.equal(counts(doc, t).tareas, 4);
  assert.deepEqual(['2026-11-20', t, '2026-11-24', '2026-11-29', '2027-01-01'].map(d => dueBucket(d, t)), ['overdue', 'today', 'tomorrow', 'week', 'later']);
});

// A tiny D1 stand-in with the conditional update the API relies on.
function fakeEnv() {
  const rows = new Map();
  return {rows, CONTROL_DB: {prepare(sql) { return {bind(...a) { return {
    first: async () => rows.get(a[0]) ? {payload: rows.get(a[0]).payload, updated_at: rows.get(a[0]).updated_at} : null,
    run: async () => {
      if (sql.startsWith('INSERT')) { if (rows.has(a[0])) return {meta: {changes: 0}}; rows.set(a[0], {payload: a[1], updated_at: a[2]}); return {meta: {changes: 1}}; }
      const row = rows.get(a[2]); if (!row || row.updated_at !== a[3]) return {meta: {changes: 0}};
      rows.set(a[2], {payload: a[0], updated_at: a[1]}); return {meta: {changes: 1}};
    }}; }}; }}};
}
const owner = {session: {user: {username: 'cesarvapor'}, csrfToken: 'tok'}};
const post = body => new Request('https://x/control/api/todo/status', {method: 'POST', headers: {'x-csrf-token': 'tok'}, body: JSON.stringify(body)});

test('API: only the owner, CSRF on writes, and changes are stored', async () => {
  assert.ok(accessForUser({username: 'CesarVapor'}).views.includes('todo'));
  assert.ok(!accessForUser({username: 'SuperSanti86'}).capabilities.includes('todo:read'));
  const env = fakeEnv();
  assert.equal((await onRequest({request: new Request('https://x/'), env, data: {session: {user: {username: 'supersanti86'}}}})).status, 403);
  const empty = await (await onRequest({request: new Request('https://x/'), env, data: owner})).json();
  assert.equal(empty.lists[0].name, 'Tareas');
  const noCsrf = new Request('https://x/', {method: 'POST', body: '{"ops":[]}'});
  assert.equal((await onRequest({request: noCsrf, env, data: owner})).status, 403);
  let r = await onRequest({request: post({ops: [{op: 'import', lists: fromGraph(graphExport)}]}), env, data: owner});
  assert.equal(r.status, 200);
  r = await onRequest({request: post({ops: [{op: 'task.put', list: 'tareas', task: {id: 'n', title: 'Nueva'}}]}), env, data: owner});
  const saved = await r.json();
  assert.equal(saved.lists[0].tasks[0].title, 'Nueva'); assert.equal(saved.lists[0].tasks.length, 3);
  assert.equal((await onRequest({request: post({ops: [{op: 'nope'}]}), env, data: owner})).status, 400);
  assert.equal(JSON.parse(env.rows.get('todo').payload).lists.length, 2);
});
