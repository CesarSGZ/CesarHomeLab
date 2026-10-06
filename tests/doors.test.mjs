import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createRoom, applyAction, publicRoom, roleComposition, rewardPool, fulfillEnemyRequest } from '../functions/_lib/doors-engine.js';
import { CARDS, suggestion } from '../control/doors-catalog.js';
import { accessForUser } from '../functions/_lib/auth.js';
import { onRequest } from '../functions/control/api/doors/[[path]].js';

const users = Array.from({ length: 8 }, (_, i) => ({ id: `u${i}`, username: `Player${i}` }));
let clock = 100000;
const action = (room, index, input) => applyAction(room, users[index], input, ++clock, () => .4);
function started(n = 3) {
  const room = createRoom(users[0], 'Prueba de las puertas', clock);
  for (let i = 1; i < n; i++) action(room, i, { action: 'join' });
  for (let i = 0; i < n; i++) action(room, i, { action: 'ready' });
  action(room, 0, { action: 'start' }); return room;
}
function throughChoices(room) {
  for (const id of [...room.order]) action(room, Number(id.slice(1)), { action: 'craft', scenario: `Arena ${id}`, weapon: `Arma ${id}` });
  for (const id of [...room.order]) action(room, Number(id.slice(1)), { action: 'choose', door: room.doors[0].id });
  assert.equal(room.phase, 'preparation');
}
function readyEveryone(room) { for (const p of room.players.filter(p => p.lives)) action(room, Number(p.id.slice(1)), { action: 'ready' }); }
function throughReveal(room) {
  throughChoices(room); readyEveryone(room);
  assert.equal(room.phase, 'assigning');
  for (const p of room.players.filter(p => p.lives)) {
    const creator = room.doors.find(d => d.id === p.choice).creator;
    action(room, Number(creator.slice(1)), { action: 'assign', target: p.id, enemy: `Monstruo ${p.id}` });
  }
  assert.equal(room.phase, 'sealed'); readyEveryone(room); assert.equal(room.phase, 'revealed');
}
function give(room, index, type) {
  const card = { id: `test-${type}-${index}`, type, acquired: Math.max(0, room.round - 1) };
  room.players[index].hand.push(card); return card.id;
}
function resolve(room) { action(room, 0, { action: 'tick' }); clock += 16000; action(room, 0, { action: 'tick' }); }
function cast(room, index, type, fields = {}) { action(room, index, { action: 'card', card: give(room, index, type), ...fields }); }
function allVote(room, votes) {
  const voters = [...room.vote.voters];
  voters.forEach((id, i) => action(room, Number(id.slice(1)), { action: 'vote', yes: votes[i % votes.length] }));
}

test('All current and future accounts get only the shared game capability', () => {
  for (const username of ['CesarVapor', 'SuperSanti86', 'future-account']) {
    const access = accessForUser({ username });
    assert.ok(access.views.includes('doors')); assert.ok(access.capabilities.includes('doors:play'));
  }
  const access = accessForUser({ username: 'future-account', role: 'operator' });
  assert.deepEqual(access.views, ['overview', 'doors']);
  assert.deepEqual(access.capabilities, ['doors:play']);
});
test('Scalable roles always include a mortal and rewards really change with player count', () => {
  for (let n = 3; n <= 12; n++) {
    const r = roleComposition(n); assert.equal(r.mortal + r.victory + r.free, n); assert.ok(r.mortal >= 1);
  }
  assert.ok(!rewardPool(3).includes('life')); assert.ok(rewardPool(6).includes('life'));
  assert.equal(Object.keys(CARDS).length, 12);
  assert.ok(suggestion('door').scenario); assert.ok(suggestion('enemy'));
});
test('Rooms require three ready players, turn order is enforced, and same-door selection is allowed', () => {
  const room = createRoom(users[0], 'Sala'); action(room, 1, { action: 'join' });
  assert.throws(() => action(room, 0, { action: 'start' }), /3 a 12/);
  const game = started(); assert.equal(game.players[0].lives, 3);
  assert.throws(() => action(game, 1, { action: 'craft', scenario: 'Arena', weapon: 'Arma' }), /turno/);
  throughChoices(game); assert.equal(new Set(game.players.map(p => p.choice)).size, 1);
  assert.equal(game.doors.filter(d => d.reward).length, 1);
  assert.ok(game.players.every(p => !p.hand.length));
});
test('Roles, hands, intel, ballots and enemies are redacted on the server', () => {
  const room = started(); throughChoices(room); readyEveryone(room);
  for (const p of room.players) action(room, 0, { action: 'assign', target: p.id, enemy: 'SECRET ENEMY' });
  give(room, 0, 'weapon');
  const view = publicRoom(room, users[1].id, 'ABC234', 1);
  assert.equal(view.players[0].role, null); assert.equal(view.players[0].enemy, null);
  assert.equal(view.players[1].role, room.players[1].role); assert.equal(view.players[1].enemy, null);
  assert.equal(view.hand.length, 0); assert.ok(!JSON.stringify(view).includes('SECRET ENEMY'));
  assert.throws(() => publicRoom(room, 'stranger', 'ABC234', 1), /Únete/);
  readyEveryone(room); readyEveryone(room);
  action(room, 0, { action: 'vote', yes: false });
  const opponent = publicRoom(room, users[1].id, 'ABC234', 2);
  assert.equal(opponent.vote.mine, null); assert.equal(opponent.vote.count, 1);
  assert.ok(!('ballots' in opponent.vote));
});
test('A full round loses lives, grants cards afterwards and rotates the next opening turn', () => {
  const room = started(); throughReveal(room); readyEveryone(room);
  for (let i = 0; i < 3; i++) allVote(room, [false]);
  assert.equal(room.phase, 'results'); assert.deepEqual(room.players.map(p => p.lives), [2, 2, 2]);
  const reward = room.doors[0].reward;
  assert.ok(room.players.every(p => p.hand.some(c => c.type === reward)));
  readyEveryone(room); assert.equal(room.round, 2); assert.equal(room.order[0], 'u1');
});
test('Last-life defeat cannot receive a reward, and the remaining two immediately win', () => {
  const room = started(); throughReveal(room); room.players[0].lives = 1; room.doors[0].reward = 'life';
  readyEveryone(room); allVote(room, [false]);
  assert.equal(room.players[0].lives, 0); assert.equal(room.phase, 'finished');
  assert.deepEqual(room.winners, ['u1', 'u2']); assert.equal(room.players[1].lives, 4);
  assert.throws(() => action(room, 0, { action: 'card', card: 'fake' }), /terminado/);
});
test('Life rewards can exceed three lives, combat ties survive, and mutation ties are rejected', () => {
  const room = started(4); throughReveal(room); room.doors[0].reward = 'life';
  cast(room, 0, 'mutate', { targets: ['u0'], value: 'Improved', reason: 'Ingeniería' }); resolve(room);
  allVote(room, [true, false]); assert.equal(room.players[0].weapon, 'Arma u0');
  readyEveryone(room);
  for (let i = 0; i < 4; i++) allVote(room, [true, false]);
  assert.ok(room.players.every(p => p.lives === 4));
});
test('Weapon change and both exchange cards resolve only in their windows', () => {
  const room = started(4); throughChoices(room);
  cast(room, 0, 'weapon', { targets: ['u1'], value: 'Paraguas' }); resolve(room);
  assert.equal(room.players[1].weapon, 'Paraguas');
  cast(room, 0, 'swap', { targets: ['u1', 'u2'] }); resolve(room);
  assert.equal(room.players[2].weapon, 'Paraguas');
  cast(room, 0, 'ownSwap', { targets: ['u0', 'u2'] }); resolve(room);
  assert.equal(room.players[0].weapon, 'Paraguas');
  const invalid = give(room, 1, 'enemy');
  assert.throws(() => action(room, 1, { action: 'card', card: invalid, targets: ['u2'], value: 'Robot' }), /fase/);
  assert.throws(() => action(room, 1, { action: 'card', card: 'other', targets: ['u2'] }), /carta/);
});
test('Spy is private; bait reveals only its target before full reveal', () => {
  const room = started(); throughChoices(room);
  cast(room, 1, 'spy', { targets: ['u0'], field: 'role' }); resolve(room);
  assert.equal(publicRoom(room, 'u1', 'ABC234', 1).players[0].role, room.players[0].role);
  assert.equal(publicRoom(room, 'u2', 'ABC234', 1).players[0].role, null);
  readyEveryone(room);
  for (const p of room.players) action(room, 0, { action: 'assign', target: p.id, enemy: `Secreto ${p.id}` });
  cast(room, 1, 'spy', { targets: ['u2'], field: 'enemy' }); resolve(room);
  assert.equal(publicRoom(room, 'u1', 'ABC234', 1).players[2].enemy, 'Secreto u2');
  assert.equal(publicRoom(room, 'u2', 'ABC234', 1).players[2].enemy, null);
  cast(room, 1, 'bait', { targets: ['u0'] }); resolve(room);
  assert.equal(publicRoom(room, 'u2', 'ABC234', 1).players[0].enemy, 'Secreto u0');
});
test('Enemy changes, random third-person reassignment, doubling and mutation work', () => {
  const room = started(4); throughReveal(room);
  cast(room, 0, 'enemy', { targets: ['u1'], value: 'Un dragón distinto' }); resolve(room);
  assert.equal(room.players[1].enemy, 'Un dragón distinto');
  cast(room, 0, 'random', { targets: ['u1'] }); resolve(room);
  assert.ok(!['u0', 'u1'].includes(room.request.author));
  assert.throws(() => fulfillEnemyRequest(room, users[1], { enemy: 'X' }), /otra persona/);
  fulfillEnemyRequest(room, users[Number(room.request.author.slice(1))], { enemy: 'Nuevo secreto' }, ++clock);
  assert.equal(room.players[1].enemy, 'Nuevo secreto');
  cast(room, 0, 'mutate', { targets: ['u0'], value: 'Arma mejorada', reason: 'Añadir un escudo a la empuñadura.' }); resolve(room);
  allVote(room, [true]); assert.equal(room.players[0].weapon, 'Arma mejorada');
  cast(room, 1, 'double', { targets: ['u0'] }); resolve(room); readyEveryone(room);
  allVote(room, [true]); assert.equal(room.vote.attempt, 2);
  allVote(room, [false]); assert.equal(room.players[0].lives, 2); assert.equal(room.vote.target, 'u1');
});
test('Reflection redirects, interruption has priority, and unused reflection expires', () => {
  const room = started(); throughReveal(room);
  cast(room, 0, 'enemy', { targets: ['u1'], value: 'Reflected monster' });
  action(room, 1, { action: 'reaction', card: give(room, 1, 'reflect'), target: 'u0' });
  assert.equal(room.pending.targets[0], 'u0');
  action(room, 2, { action: 'reaction', card: give(room, 2, 'interrupt') });
  assert.equal(room.pending, null); assert.equal(room.players[0].enemy, 'Monstruo u0');
  cast(room, 0, 'enemy', { targets: ['u1'], value: 'Reflected monster' });
  action(room, 1, { action: 'reaction', card: give(room, 1, 'reflect'), target: 'u0' }); resolve(room);
  assert.equal(room.players[0].enemy, 'Reflected monster');
  room.players[1].hand.push({ id: 'expiring', type: 'reflect', acquired: 0, expires: 1 });
  readyEveryone(room); for (let i = 0; i < 3; i++) allVote(room, [true]);
  assert.ok(!room.players[1].hand.some(c => c.id === 'expiring'));
});
test('Reflection of own-weapon swap back to its other target cancels the exchange', () => {
  const room = started(); throughChoices(room); room.players[1].weapon = 'Special';
  cast(room, 0, 'ownSwap', { targets: ['u0', 'u1'] });
  action(room, 1, { action: 'reaction', card: give(room, 1, 'reflect'), target: 'u0' });
  assert.equal(room.pending, null); assert.equal(room.players[1].weapon, 'Special');
});
test('Room limits, host-only controls, no late joins, and safe input limits are enforced', () => {
  const room = started();
  assert.throws(() => action(room, 3, { action: 'join' }), /empezado/);
  assert.throws(() => action(room, 1, { action: 'cancel' }), /anfitrión/);
  assert.throws(() => action(room, 0, { action: 'leave' }), /antes de empezar/);
  assert.throws(() => action(room, 0, { action: 'craft', scenario: 'x'.repeat(501), weapon: 'x' }), /caracteres/);
  action(room, 0, { action: 'chat', message: '<script>alert(1)</script>' });
  assert.throws(() => action(room, 0, { action: 'chat', message: 'spam' }), /instante/);
  assert.equal(room.chat[0].message, '<script>alert(1)</script>'); // Stored as text; UI escapes it.
});

function database(initialise = true) {
  const sqlite = new DatabaseSync(':memory:');
  if (initialise) sqlite.exec(readFileSync(new URL('../migrations/0012_doors_game.sql', import.meta.url), 'utf8'));
  return {
    sqlite, env: { CONTROL_DB: { prepare(sql) {
      return { bind(...bindings) {
        return {
          async first() { return sqlite.prepare(sql).get(...bindings) || null; },
          async all() { return { results: sqlite.prepare(sql).all(...bindings) }; },
          async run() { const r = sqlite.prepare(sql).run(...bindings); return { meta: { changes: Number(r.changes) } }; },
        };
      } };
    } } },
  };
}
const request = (env, user, path = '', body, token = 'csrf') => onRequest({ env, data: { session: user ? { user, csrfToken: 'csrf' } : null },
  request: new Request(`https://example.test/control/api/doors${path}`, { method: body ? 'POST' : 'GET', headers: body ? { 'content-type': 'application/json', 'x-csrf-token': token } : {}, body: body ? JSON.stringify(body) : undefined }) });
test('API enforces authentication, CSRF, membership and optimistic concurrency against real SQLite', async () => {
  const { env, sqlite } = database();
  assert.equal((await request(env, null)).status, 401);
  assert.equal((await request(env, users[0], '', { action: 'create', title: 'Private' }, 'wrong')).status, 403);
  const created = await request(env, users[0], '', { action: 'create', title: 'A game' });
  assert.equal(created.status, 201); const { room } = await created.json();
  assert.equal((await request(env, users[1], `/${room.code}`)).status, 403);
  const list = await (await request(env, users[1])).json();
  assert.equal(list.rooms[0].version, 1); assert.ok(!('state_json' in list.rooms[0]));
  const joined = await request(env, users[1], `/${room.code}`, { action: 'join', version: 1 }); assert.equal(joined.status, 200);
  assert.equal((await request(env, users[2], `/${room.code}`, { action: 'join', version: 1 })).status, 409);
  assert.equal((await request(env, users[2], `/${room.code}`, { action: 'join', version: 2 })).status, 200);
  assert.equal((await request(env, users[2], `/${room.code}`, { action: 'cancel', version: 3 })).status, 403);
  const snapshot = await (await request(env, users[0], `/${room.code}`)).json();
  assert.equal(snapshot.room.players.length, 3); assert.equal(snapshot.room.version, 3);
  assert.equal((await request(env, users[3], '/invalid')).status, 404);
  sqlite.close();
});
test('Authenticated startup initialises only the game schema, with no broader deployment credentials', async () => {
  const {env,sqlite} = database(false);
  assert.equal((await request(env,null)).status,401);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table'").get().n,0);
  const response = await request(env,users[0]); assert.equal(response.status,200);
  assert.deepEqual((await response.json()).rooms,[]);
  assert.deepEqual(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name),['doors_rooms']);
  assert.equal((await request(env,users[0])).status,200);
  sqlite.close();
});
