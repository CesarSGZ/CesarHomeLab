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
  const lists = fromText('# Compra\n- leche\n- [x] pan\n\n# Casa\n- Llamar al fontanero\n  - pedir presupuesto\n1. Pintar');
  assert.deepEqual(lists.map(l => [l.name, l.tasks.map(t => [t.title, t.done, t.steps.length])]), [
    ['Compra', [['leche', false, 0], ['pan', true, 0]]],
    ['Casa', [['Llamar al fontanero', false, 1], ['Pintar', false, 0]]],
  ]);
  assert.equal(fromText('sin lista').at(0).name, 'Tareas');
  // Without "# " headings, "Lista:" still starts a list.
  assert.deepEqual(fromText('Casa:\n- Pintar\nCoche:\n- ITV').map(l => l.name), ['Casa', 'Coche']);
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

// A tiny D1 stand-in with the conditional update, the upsert and the delete the API relies on.
function fakeEnv() {
  const rows = new Map();
  return {rows, CONTROL_DB: {prepare(sql) { return {bind(...a) { return {
    first: async () => rows.get(a[0]) ? {payload: rows.get(a[0]).payload, updated_at: rows.get(a[0]).updated_at} : null,
    run: async () => {
      if (sql.startsWith('DELETE')) { rows.delete(a[0]); return {meta: {changes: 1}}; }
      if (sql.startsWith('INSERT')) { if (rows.has(a[0]) && !/ON CONFLICT/.test(sql)) return {meta: {changes: 0}}; rows.set(a[0], {payload: a[1], updated_at: a[2]}); return {meta: {changes: 1}}; }
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

test('quick dates are read from the end of the title', async () => {
  const {parseQuick} = await import('../control/todo-model.js');
  const t = '2026-11-23'; // a Monday
  assert.deepEqual(parseQuick('Pagar la luz mañana', t), {title: 'Pagar la luz', due: '2026-11-24'});
  assert.deepEqual(parseQuick('Cita médico el viernes', t), {title: 'Cita médico', due: '2026-11-27'});
  assert.deepEqual(parseQuick('Gimnasio lunes', t), {title: 'Gimnasio', due: '2026-11-30'}); // today is Monday: the next one
  assert.deepEqual(parseQuick('Entregar informe 30/11', t), {title: 'Entregar informe', due: '2026-11-30'});
  assert.deepEqual(parseQuick('Cumple mamá 5 de enero', t), {title: 'Cumple mamá', due: '2027-01-05'});
  assert.deepEqual(parseQuick('Revisar 31/02', t), {title: 'Revisar 31/02', due: ''});
  assert.deepEqual(parseQuick('Comprar pan', t), {title: 'Comprar pan', due: ''});
});

test('list kinds: ideas as cards, the shopping list as a checklist, emoji icons', async () => {
  const {guessKind, splitEmoji, upcoming, daysUntil} = await import('../control/todo-model.js');
  assert.deepEqual(['🛒 Lista de la Compra', 'Compras Caprichosas', '🎂 Ideas cumpleaños', 'Pelis Cine', 'Disfraces', 'Viajes', 'Coche', 'Progreso personal'].map(guessKind),
    ['check', 'ideas', 'ideas', 'ideas', 'ideas', 'ideas', 'tasks', 'tasks']);
  assert.deepEqual(splitEmoji('🎂 Ideas cumpleaños'), {emoji: '🎂', name: 'Ideas cumpleaños'});
  assert.deepEqual(splitEmoji('Coche'), {emoji: '', name: 'Coche'});
  let doc = applyOps(emptyDoc(), [{op: 'list.add', id: 'regalos', name: 'Regalos', kind: 'ideas'}, {op: 'list.kind', id: 'tareas', kind: 'check'}, {op: 'list.kind', id: 'tareas', kind: 'nope'}]);
  assert.deepEqual(doc.lists.map(l => l.kind), ['tasks', 'ideas']);
  doc = applyOps(doc, [{op: 'task.put', list: 'regalos', task: {id: 'g', title: 'Libro'}}, {op: 'task.put', list: 'tareas', task: {id: 'x', title: 'ITV', due: '2026-11-25'}}]);
  assert.deepEqual(tasksFor(doc, 'all', '2026-11-23').map(r => r.task.id), ['x']); // ideas stay out of Todas
  assert.deepEqual(tasksFor(doc, 'search', '2026-11-23', 'LIBRO').map(r => r.task.id), ['g']);
  assert.equal(upcoming(doc, '2026-11-23')[0].task.id, 'x');
  assert.equal(daysUntil('2026-11-25', '2026-11-23'), 2);
  // Older copies without a kind read as task lists.
  assert.equal(applyOps({v: 1, lists: [{id: 'a', name: 'A', tasks: []}]}, []).lists[0].kind, 'tasks');
});

test('the Tareas app installs on its own and comes back after signing in', async () => {
  const {readFileSync} = await import('node:fs');
  const manifest = JSON.parse(readFileSync(new URL('../control/tareas/manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.start_url, '/control/tareas/'); assert.equal(manifest.scope, '/control/tareas/'); assert.equal(manifest.display, 'standalone');
  for (const icon of manifest.icons) assert.ok(readFileSync(new URL('..' + icon.src, import.meta.url)).length > 1000, icon.src);
  const middleware = readFileSync(new URL('../functions/control/_middleware.js', import.meta.url), 'utf8');
  assert.match(middleware, /"\/control\/tareas\/manifest\.webmanifest"/); assert.match(middleware, /app=tareas/);
  assert.match(readFileSync(new URL('../control/login.js', import.meta.url), 'utf8'), /'\/control\/tareas\/'/);
  const mc = JSON.parse(readFileSync(new URL('../control/manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(mc.shortcuts[0].url, '/control/tareas/');
});

test('the To Do export opens with a double click and keeps its window open', async () => {
  const {readFileSync, existsSync} = await import('node:fs');
  const cmd = readFileSync(new URL('../control/todo-export.cmd', import.meta.url), 'utf8');
  assert.ok(cmd.startsWith('<# :'), 'batch/PowerShell hybrid header');
  assert.ok(!/[^\r]\n/.test(cmd), 'Windows line endings');
  assert.match(cmd, /-ExecutionPolicy Bypass/); assert.match(cmd, /\r\npause\r\n/); assert.match(cmd, /catch \{/);
  assert.ok(!/[^\x00-\x7F]/.test(cmd), 'plain ASCII for the Windows console');
  assert.ok(!existsSync(new URL('../control/todo-export.ps1', import.meta.url)));
  assert.match(readFileSync(new URL('../control/todo.js', import.meta.url), 'utf8'), /href="\/control\/todo-export\.cmd" download/);
});

test('a checklist written by Claude becomes a project with sections and deadlines', async () => {
  const {sections, progress, splitEmoji} = await import('../control/todo-model.js');
  const text = '# 🇩🇪 Mudanza a Ingolstadt\n## Papeles\n- [x] Contrato firmado\n- Anmeldung antes del 15/01\n## Casa\n- Buscar piso\n  - WG-Gesucht\n- Contratar internet 20 de diciembre';
  const [list] = fromText(text, '2026-11-23');
  assert.equal(list.kind, 'project');
  assert.deepEqual(splitEmoji(list.name), {emoji: '🇩🇪', name: 'Mudanza a Ingolstadt'});
  const doc = applyOps(emptyDoc(), [{op: 'import', lists: [list]}]);
  const project = doc.lists[1];
  assert.deepEqual(sections(project).map(s => [s.name, s.tasks.map(t => t.title)]), [['Papeles', ['Contrato firmado', 'Anmeldung']], ['Casa', ['Buscar piso', 'Contratar internet']]]);
  assert.equal(project.tasks[1].due, '2027-01-15');
  assert.deepEqual(progress(project), {done: 1, total: 4});
  // New items go to the end of a project, not on top.
  const more = applyOps(doc, [{op: 'task.put', list: project.id, task: {id: 'z', title: 'Llaves', section: 'Casa'}}]);
  assert.equal(more.lists[1].tasks.at(-1).id, 'z');
  // Updating the same checklist again from Claude adds only what is new.
  const again = applyOps(more, [{op: 'import', lists: fromText(text + '\n- Seguro de hogar', '2026-11-23')}]);
  assert.equal(again.lists[1].tasks.length, 6);
});

test('routines start fresh every day and keep a streak', async () => {
  const {streak, routinesToday, habitHistory, scheduleText, habitDue} = await import('../control/todo-model.js');
  let doc = applyOps(emptyDoc(), [
    {op: 'list.add', id: 'rutinas', name: 'Rutinas', kind: 'routine'},
    {op: 'task.put', list: 'rutinas', task: {id: 'gym', title: '🏋️ Entrenar', habit: {days: [1, 3, 5], time: '19:00'}}},
    {op: 'task.put', list: 'rutinas', task: {id: 'pill', title: '💊 Pastilla', habit: {days: [], time: '09:00'}}},
  ]);
  const t = '2026-11-25'; // Wednesday
  assert.deepEqual(routinesToday(doc, t).map(r => r.task.id), ['pill', 'gym']); // by time
  assert.ok(!habitDue(doc.lists[1].tasks[0], '2026-11-24')); // no training on Tuesday
  doc = applyOps(doc, ['2026-11-23', '2026-11-25'].map(date => ({op: 'habit.log', id: 'gym', date, done: true})));
  doc = applyOps(doc, [{op: 'habit.log', id: 'pill', date: '2026-11-24', done: true}, {op: 'habit.log', id: 'pill', date: '2026-11-24', done: true}]);
  const [gym, pill] = doc.lists[1].tasks;
  assert.equal(streak(gym, t), 2); // Monday and Wednesday; Tuesday was not due
  assert.equal(streak(pill, t), 1); // today not done yet does not break it
  assert.deepEqual(pill.log, ['2026-11-24']);
  doc = applyOps(doc, [{op: 'habit.log', id: 'pill', date: '2026-11-24', done: false}]);
  assert.deepEqual(doc.lists[1].tasks[1].log, []);
  assert.equal(habitHistory(gym, t, 7).filter(d => d.done).length, 2);
  assert.equal(scheduleText({days: [1, 2, 3, 4, 5], time: '08:00'}), 'Entre semana · 08:00');
  // Routines stay out of Mi día, Todas and the counts of the smart lists.
  assert.equal(tasksFor(doc, 'all', t).length, 0);
});

test('a list made by an import gets the same id on the phone and on the server', () => {
  const lists = fromText('# Viaje\n- Pasaporte', '2026-11-23');
  const a = applyOps(emptyDoc(), [{op: 'import', lists}]), b = applyOps(emptyDoc(), [{op: 'import', lists: JSON.parse(JSON.stringify(lists))}]);
  assert.equal(a.lists[1].id, b.lists[1].id);
  assert.equal(fromGraph(graphExport)[0].id, fromGraph(graphExport)[0].id);
});

test("Claude's door: only with the key, reads a summary and updates a checklist by text", async () => {
  const {onRequest: claudeDoor, summary} = await import('../functions/api/tareas.js');
  const {onRequest: page} = await import('../functions/control/api/todo/status.js');
  const env = fakeEnv();
  const ask = (body, key) => claudeDoor({request: new Request('https://x/api/tareas', {method: body ? 'POST' : 'GET', headers: key ? {authorization: 'Bearer ' + key} : {}, ...(body ? {body: JSON.stringify(body)} : {})}), env});
  assert.equal((await ask(null, 'tareas_nope')).status, 401);
  const made = await (await page({request: post({action: 'agent-key'}), env, data: owner})).json();
  assert.match(made.key, /^tareas_[\w-]{40,}$/);
  assert.ok(!env.rows.get('todo-agent').payload.includes(made.key), 'only the hash is stored');
  let r = await ask({text: '# Mudanza\n## Papeles\n- [ ] Anmeldung\n- [ ] Banco'}, made.key);
  assert.equal(r.status, 200);
  r = await ask({text: '# Mudanza\n## Papeles\n- [x] Anmeldung\n- [ ] Banco\n## Casa\n- [ ] Piso'}, made.key);
  const out = await r.json();
  assert.match(out.summary, /# Mudanza {2}\[project, id tx-\w+, 1\/3\]/);
  assert.match(out.summary, /- \[x\] Anmeldung/);
  const read = await (await ask(null, made.key)).json();
  assert.equal(read.lists.find(l => l.name === 'Mudanza').tasks.length, 3);
  // A new key retires the old one; revoking closes the door.
  const second = await (await page({request: post({action: 'agent-key'}), env, data: owner})).json();
  assert.equal((await ask(null, made.key)).status, 401);
  assert.equal((await ask(null, second.key)).status, 200);
  await page({request: post({action: 'agent-revoke'}), env, data: owner});
  assert.equal((await ask(null, second.key)).status, 401);
  assert.equal(typeof summary, 'function');
});
