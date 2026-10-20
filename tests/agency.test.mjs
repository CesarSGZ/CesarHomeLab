import test from 'node:test';
import assert from 'node:assert/strict';
import {agentSync, queueCommand, queueMessage, readStatus, requireAgencyAgent, sanitiseEvent, sanitiseState} from '../functions/_lib/agency.js';
import {constantTimeEqual, userCan} from '../functions/_lib/auth.js';

// D1 mínima en memoria para las sentencias de functions/_lib/agency.js.
function fakeDb() {
  const t = {state: null, messages: [], events: [], commands: []};
  const run = (sql, a) => {
    if (sql.startsWith('INSERT INTO agency_state')) { t.state = {payload: a[0], updated_at: a[1], seen_at: a[2]}; return {}; }
    if (sql.startsWith('UPDATE agency_state')) { if (t.state) t.state.seen_at = a[0]; return {}; }
    if (sql.startsWith('INSERT OR IGNORE INTO agency_events')) { if (!t.events.some(e => e.id === a[0])) t.events.push({id: a[0], agent: a[1], level: a[2], text: a[3], at: a[4]}); return {}; }
    if (sql.startsWith('INSERT OR IGNORE INTO agency_messages')) { if (!t.messages.some(m => m.id === a[0])) t.messages.push({id: a[0], role: 'director', text: a[1], reply_to: a[2], status: 'answered', actions: a[3], created_at: a[4]}); return {}; }
    if (sql.startsWith("UPDATE agency_messages SET status = 'answered'")) { t.messages.filter(m => m.id === a[1] && m.role === 'owner').forEach(m => { m.status = 'answered'; }); return {}; }
    if (sql.startsWith('UPDATE agency_commands SET status = ?')) { t.commands.filter(c => c.id === a[3] && c.status === 'queued').forEach(c => { c.status = a[0]; c.result = a[2]; }); return {}; }
    if (sql.startsWith('DELETE') || sql.startsWith("UPDATE agency_commands SET status = 'expired'")) return {};
    if (sql.startsWith("SELECT id, text, created_at FROM agency_messages")) return t.messages.filter(m => m.role === 'owner' && m.status === 'queued');
    if (sql.startsWith('SELECT id, agent, type, requested_at')) return t.commands.filter(c => c.status === 'queued');
    if (sql.startsWith('SELECT payload')) return t.state;
    if (sql.startsWith('SELECT id, role')) return [...t.messages].reverse();
    if (sql.startsWith('SELECT id, agent, level')) return t.events;
    if (sql.startsWith('SELECT id, agent, type, status')) return t.commands;
    if (sql.startsWith('SELECT COUNT(*)')) return {n: t.messages.filter(m => m.role === 'owner' && m.status === 'queued').length};
    if (sql.startsWith('INSERT INTO agency_messages')) { t.messages.push({id: a[0], role: 'owner', text: a[1], status: 'queued', created_at: a[2]}); return {}; }
    if (sql.startsWith('SELECT id FROM agency_commands')) return t.commands.find(c => c.agent === a[0] && c.type === a[1] && c.status === 'queued') || null;
    if (sql.startsWith('INSERT INTO agency_commands')) { t.commands.push({id: a[0], agent: a[1], type: a[2], status: 'queued', requested_at: a[3]}); return {}; }
    throw new Error('SQL inesperado: ' + sql);
  };
  const prepare = sql => { let a = []; const s = {bind: (...x) => { a = x; return s; }, first: async () => run(sql, a), run: async () => run(sql, a), all: async () => ({results: run(sql, a)}), sql, get args() { return a; }}; return s; };
  return {prepare, batch: async list => { for (const s of list) run(s.sql, s.args); }, t};
}

test('only the owner can manage the agency', () => {
  assert.equal(userCan({username: 'cesarvapor'}, 'agency:manage'), true);
  assert.equal(userCan({username: 'supersanti86'}, 'agency:manage'), false);
});

test('agency agent token: required, long and exact', () => {
  const req = auth => new Request('https://x', {headers: auth ? {authorization: auth} : {}});
  const env = {AGENCY_AGENT_TOKEN: 'a'.repeat(40)};
  assert.equal(requireAgencyAgent(req('Bearer ' + 'a'.repeat(40)), env, constantTimeEqual), true);
  assert.equal(requireAgencyAgent(req('Bearer ' + 'a'.repeat(39)), env, constantTimeEqual), false);
  assert.equal(requireAgencyAgent(req(), env, constantTimeEqual), false);
  assert.equal(requireAgencyAgent(req('Bearer short'), {AGENCY_AGENT_TOKEN: 'short'}, constantTimeEqual), false);
});

test('state keeps known fields only and drops foreign links', () => {
  const s = sanitiseState({evil: 1, agents: [{id: 'karma-farmer', name: 'Karma Farmer', status: 'hacking', commands: ['run-now', 'rm -rf'], stats: [{label: 'Karma', value: 5}]}, {id: 'BAD ID'}],
    reddit: {configured: true, posts: [{id: 'a', title: 'What?', url: 'https://evil.example/x'}, {id: 'b', title: 'Why?', url: 'https://www.reddit.com/r/AskReddit/comments/b'}], history: [{day: '2026-10-20', total: 10}, {day: 'nope', total: 1}]}});
  assert.equal(s.evil, undefined);
  assert.deepEqual(s.agents.map(a => a.id), ['karma-farmer']);
  assert.equal(s.agents[0].status, 'resting');
  assert.deepEqual(s.agents[0].commands, ['run-now']);
  assert.deepEqual(s.agents[0].stats, [{label: 'Karma', value: '5'}]);
  assert.deepEqual(s.reddit.posts.map(p => p.url), ['', 'https://www.reddit.com/r/AskReddit/comments/b']);
  assert.equal(s.reddit.history.length, 1);
  assert.equal(sanitiseEvent({id: 'x'}), null);
});

test('chat round trip: owner message reaches the backend once answered it leaves the queue', async () => {
  const db = fakeDb();
  const m = await queueMessage(db, '  ¿Cómo vamos de karma?  ');
  let res = await agentSync(db, {state: {agents: [{id: 'director', name: 'Director'}]}});
  assert.deepEqual(res.messages.map(x => x.text), ['¿Cómo vamos de karma?']);
  res = await agentSync(db, {replies: [{id: 'reply000001', replyTo: m.id, text: 'Vamos bien.', actions: ['nada']}], events: [{id: 'event000001', agent: 'director', level: 'ok', text: 'Contestó'}, {id: 'event000001', agent: 'director', text: 'duplicado'}]});
  assert.deepEqual(res.messages, []);
  const st = await readStatus(db);
  assert.equal(st.backend.online, true);
  assert.equal(st.events.length, 1);
  assert.equal(st.messages.find(x => x.role === 'director').text, 'Vamos bien.');
  await assert.rejects(queueMessage(db, ' '), /Escribe/);
});

test('commands are validated, deduplicated and closed by the backend', async () => {
  const db = fakeDb();
  await assert.rejects(queueCommand(db, 'karma-farmer', 'delete-account'), /no válida/);
  const a = await queueCommand(db, 'karma-farmer', 'run-now'), b = await queueCommand(db, 'karma-farmer', 'run-now');
  assert.equal(b.duplicate, true); assert.equal(a.id, b.id);
  let res = await agentSync(db, {});
  assert.equal(res.commands.length, 1);
  res = await agentSync(db, {done: [{id: a.id, ok: true, result: 'Publicación manual en marcha'}]});
  assert.equal(res.commands.length, 0);
});

test('completed browser job survives sync and is shown as Completado', async () => {
  const { teamCard } = await import('../control/agency/panel.js');
  const db = fakeDb();
  await agentSync(db, {
    state: {agents: [{id: 'karma-farmer', name: 'Karma Farmer', status: 'completed', detail: 'Publicación confirmada'}]},
    events: [{id: 'browserdone001', agent: 'karma-farmer', level: 'ok', text: 'Publicado con navegador'}],
  });
  const live = await readStatus(db);
  assert.equal(live.state.agents[0].status, 'completed');
  assert.match(teamCard(live, 'karma-farmer'), /Completado/);
  assert.equal(live.events[0].text, 'Publicado con navegador');
});

test('missing Reddit session shows the real error and normal controls', async () => {
  const { teamCard, karmaCard } = await import('../control/agency/panel.js');
  const state = sanitiseState({agents: [{id: 'karma-farmer', name: 'Karma Farmer', status: 'blocked', detail: 'Falta preparar la sesión de Reddit', commands: ['pause', 'run-now']}],
    reddit: {configured: false, browserError: 'Reddit devolvió HTTP 403 <test>'}});
  const live = {state, backend: {online: true}};
  assert.match(teamCard(live, ''), /Requiere atención/);
  assert.match(teamCard(live, ''), /data-cmd="run-now"/);
  assert.match(karmaCard(live), /HTTP 403 &lt;test&gt;/);
});
