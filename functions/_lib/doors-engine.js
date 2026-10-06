import { CARDS, ROLES } from '../../control/doors-catalog.js';

export class GameError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const fail = (condition, message, status = 400) => { if (!condition) throw new GameError(message, status); };
const text = (value, max = 320) => {
  fail(typeof value === 'string', 'Escribe un texto válido.');
  const clean = value.trim();
  fail(clean.length > 0 && clean.length <= max, `El texto debe tener entre 1 y ${max} caracteres.`);
  return clean;
};
const uid = () => crypto.randomUUID();
export const active = room => room.players.filter(p => p.lives > 0);
const player = (room, id) => room.players.find(p => p.id === id);
const log = (room, message, now, kind = 'event') => {
  room.events.push({ id: uid(), message, at: now, kind });
  room.events = room.events.slice(-100);
};
const shuffle = (items, random) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
export function secureRandom() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
}
export function createRoom(user, title, now = Date.now()) {
  return {
    title: text(title, 70), host: user.id, phase: 'lobby', round: 0, createdAt: now,
    players: [{ id: user.id, name: user.username, lives: 3, hand: [], ready: false }],
    doors: [], events: [], chat: [], outcomes: [], winners: [], pending: null, vote: null, request: null,
  };
}
export function roleComposition(n) {
  const mortal = Math.max(1, Math.floor(n / 4));
  const victory = Math.max(1, Math.floor(n / 3));
  return { mortal, victory, free: n - mortal - victory };
}
export function rewardPool(n) {
  const base = ['weapon', 'swap', 'ownSwap', 'spy', 'mutate', 'bait', 'reflect', 'interrupt'];
  if (n >= 4) base.push('enemy', 'random');
  if (n >= 6) base.push('double', 'life');
  return base;
}
function beginRound(room, now, random) {
  room.round++;
  room.phase = 'crafting';
  room.doors = []; room.pending = null; room.request = null; room.vote = null; room.combat = null;
  const living = active(room);
  const distribution = roleComposition(living.length);
  const roles = shuffle(Object.entries(distribution).flatMap(([key, count]) => Array(count).fill(key)), random);
  // Rotate the opening player every round; nobody always has first choice.
  const offset = (room.round - 1) % living.length;
  room.order = [...living.slice(offset), ...living.slice(0, offset)].map(p => p.id);
  living.forEach((p, i) => {
    p.role = roles[i]; p.ready = false; p.choice = null; p.weapon = null; p.enemy = null;
    p.enemyPublic = false; p.double = false; p.intel = []; p.roll = null;
    p.hand = p.hand.filter(c => !c.expires || c.expires >= room.round);
  });
  room.turn = 0;
  log(room, `Ronda ${room.round}. ${living.length} jugadores, ${distribution.mortal} rol(es) mortal(es).`, now);
}
function allocateRewards(room, now, random) {
  const candidates = room.doors.map(d => ({ door: d, roll: 1 + Math.floor(random() * 6), tie: random() }));
  candidates.sort((a, b) => b.roll - a.roll || b.tie - a.tie);
  const count = Math.max(1, Math.floor(active(room).length / 3));
  const pool = shuffle(rewardPool(active(room).length), random);
  candidates.forEach(({ door, roll }, i) => {
    door.roll = roll;
    if (i < count) door.reward = pool[i % pool.length];
    player(room, door.creator).roll = roll;
  });
  room.rewardCount = count;
  log(room, `Dados lanzados: ${count} puerta(s) reciben una habilidad. Los empates del dado se desempatan al azar.`, now);
  room.phase = 'choosing'; room.turn = 0;
}
const resetReady = room => room.players.forEach(p => { p.ready = false; });
function finishRound(room, now) {
  for (const p of active(room)) {
    const door = room.doors.find(d => d.id === p.choice);
    if (!door?.reward) continue;
    if (door.reward === 'life') {
      p.lives++;
      log(room, `${p.name} obtiene una vida extra.`, now);
    } else {
      const card = { id: uid(), type: door.reward, acquired: room.round };
      if (card.type === 'reflect') card.expires = room.round + 1;
      p.hand.push(card);
      log(room, `${p.name} consigue ${CARDS[card.type].name} para la próxima ronda.`, now);
    }
  }
  // A reflection acquired last round has now had its one playable round.
  room.players.forEach(p => { p.hand = p.hand.filter(c => !c.expires || c.expires > room.round); });
  resetReady(room);
  if (active(room).length <= 2) {
    room.phase = 'finished'; room.winners = active(room).map(p => p.id);
    log(room, room.winners.length ? `Victoria: ${active(room).map(p => p.name).join(' y ')}.` : 'Nadie sobrevivió: empate sin ganadores.', now);
  } else {
    room.phase = 'results';
    log(room, 'Ronda resuelta. Las habilidades se entregan solo a quienes aún tienen vidas.', now);
  }
}
function nextCombat(room, now) {
  if (room.combat.index >= room.combat.queue.length) { finishRound(room, now); return; }
  const target = room.combat.queue[room.combat.index];
  room.vote = { kind: 'combat', target, attempt: room.combat.attempt, ballots: {}, voters: active(room).map(p => p.id) };
  log(room, `Combate de ${player(room, target).name}${room.combat.attempt === 2 ? ' · segunda prueba' : ''}. Votad si puede vencer.`, now);
}
function beginCombats(room, now) {
  room.phase = 'combat';
  room.combat = { queue: room.order.filter(id => player(room, id).lives > 0), index: 0, attempt: 1 };
  nextCombat(room, now);
}
function completeVote(room, now) {
  const vote = room.vote;
  const yes = Object.values(vote.ballots).filter(v => v === true).length;
  const no = Object.values(vote.ballots).filter(v => v === false).length;
  if (vote.kind === 'mutation') {
    const accepted = yes > no;
    if (accepted) player(room, vote.target).weapon = vote.weapon;
    log(room, `Mutación ${accepted ? 'aprobada' : 'rechazada'} (${yes} sí / ${no} no).`, now);
    room.vote = null; resetReady(room); return;
  }
  const target = player(room, vote.target);
  const survived = no <= yes; // Only a majority against loses a life; ties survive.
  room.outcomes.push({ round: room.round, player: target.id, name: target.name, attempt: vote.attempt, yes, no, survived });
  room.outcomes = room.outcomes.slice(-150);
  log(room, `${target.name}: ${survived ? 'supera la prueba' : 'pierde una vida'} (${yes} sí / ${no} no).`, now);
  room.vote = null;
  if (survived && target.double && room.combat.attempt === 1) {
    room.combat.attempt = 2; nextCombat(room, now); return;
  }
  if (!survived) target.lives = Math.max(0, target.lives - 1);
  if (!target.lives) log(room, `${target.name} queda eliminado y puede seguir como espectador.`, now);
  if (active(room).length <= 2) { finishRound(room, now); return; }
  room.combat.index++; room.combat.attempt = 1; nextCombat(room, now);
}
function useEffect(room, effect, now, random) {
  const actor = player(room, effect.actor);
  const target = player(room, effect.targets[0]);
  switch (effect.type) {
    case 'weapon': case 'enemy':
      target[effect.type] = effect.value; break;
    case 'swap': case 'ownSwap': {
      const second = player(room, effect.targets[1]);
      [target.weapon, second.weapon] = [second.weapon, target.weapon]; break;
    }
    case 'double': target.double = true; break;
    case 'spy':
      actor.intel.push({ target: target.id, name: target.name, field: effect.field, value: target[effect.field], round: room.round }); break;
    case 'bait': target.enemyPublic = true; break;
    case 'mutate':
      room.vote = { kind: 'mutation', target: actor.id, weapon: effect.value, reason: effect.reason, ballots: {}, voters: active(room).map(p => p.id) };
      break;
    case 'random': {
      const eligible = active(room).filter(p => p.id !== target.id && p.id !== actor.id);
      const author = eligible[Math.floor(random() * eligible.length)];
      room.request = { author: author.id, target: target.id };
      log(room, `${author.name} debe inventar el nuevo enemigo de ${target.name}.`, now); break;
    }
  }
  log(room, `${actor.name} usa ${CARDS[effect.type].name}${effect.type === 'spy' ? ' (consulta privada)' : ''}.`, now);
  resetReady(room);
}
export function settlePending(room, now = Date.now(), random = secureRandom) {
  if (!room.pending || room.pending.deadline > now) return false;
  const pending = room.pending;
  room.pending = null;
  useEffect(room, pending, now, random);
  return true;
}
function playCard(room, actor, input, now) {
  fail(!room.pending && !room.vote && !room.request, 'Primero hay que resolver la acción pendiente.');
  const card = actor.hand.find(c => c.id === input.card);
  fail(card && card.acquired < room.round, 'No tienes esa carta disponible.');
  const definition = CARDS[card.type];
  fail(definition.window === room.phase || definition.extraWindow === room.phase, 'Esa carta no se puede usar en esta fase.');
  const targets = Array.isArray(input.targets) ? input.targets : [];
  const needed = ['swap', 'ownSwap'].includes(card.type) ? 2 : 1;
  fail(targets.length === needed && new Set(targets).size === needed, 'Selecciona los objetivos correctos.');
  targets.forEach(id => fail(player(room, id)?.lives > 0, 'El objetivo no está activo.'));
  if (['enemy', 'double', 'bait'].includes(card.type)) fail(targets[0] !== actor.id, 'Esta habilidad no puede apuntarte a ti.');
  if (['spy', 'mutate'].includes(card.type)) {
    if (card.type === 'mutate') fail(targets[0] === actor.id, 'Solo puedes mutar tu propia arma.');
  }
  if (card.type === 'ownSwap') fail(targets[0] === actor.id, 'Selecciona primero tu propia arma.');
  if (card.type === 'swap') {
    fail(targets.every(id => !player(room, id).enemyPublic && !(player(room, id).enemy && room.doors.find(d => d.id === player(room, id).choice)?.creator === actor.id) && !actor.intel.some(i => i.target === id && i.field === 'enemy')), 'No puedes intercambiar armas después de ver esos enemigos.');
  }
  const effect = { id: uid(), type: card.type, actor: actor.id, targets, deadline: now + 15000, passed: [actor.id], reflected: false };
  if (['weapon', 'enemy', 'mutate'].includes(card.type)) effect.value = text(input.value);
  if (card.type === 'mutate') effect.reason = text(input.reason, 500);
  if (card.type === 'spy') {
    fail(['role', 'weapon', 'enemy'].includes(input.field), 'Elige qué quieres espiar.');
    fail(input.field !== 'enemy' || player(room, targets[0]).enemy, 'El enemigo todavía no se ha asignado.');
    effect.field = input.field;
  }
  actor.hand = actor.hand.filter(c => c.id !== card.id);
  room.pending = effect; resetReady(room);
  log(room, `${actor.name} propone ${definition.name}. Hay 15 segundos para reaccionar.`, now);
}
function reaction(room, actor, input, now) {
  const pending = room.pending;
  fail(pending && pending.deadline > now, 'La ventana de reacción ha terminado.');
  fail(actor.lives > 0, 'Los espectadores no pueden reaccionar.');
  if (input.action === 'pass') {
    if (!pending.passed.includes(actor.id)) pending.passed.push(actor.id);
    if (active(room).every(p => pending.passed.includes(p.id))) pending.deadline = now;
    return;
  }
  const card = actor.hand.find(c => c.id === input.card && c.acquired < room.round);
  fail(card && ['reflect', 'interrupt'].includes(card.type), 'Necesitas una carta de reacción.');
  if (card.type === 'interrupt') {
    fail(pending.actor !== actor.id, 'No puedes interrumpir tu propia habilidad.');
    room.pending = null;
    log(room, `${actor.name} interrumpe ${CARDS[pending.type].name}. Ambas cartas se consumen.`, now);
  } else {
    fail(!pending.reflected && pending.targets.includes(actor.id) && pending.actor !== actor.id, 'No puedes reflejar esta acción.');
    fail(pending.type !== 'mutate', 'La mutación solo modifica el arma de quien la propone.');
    const destination = player(room, input.target);
    fail(destination?.lives > 0 && destination.id !== actor.id, 'Elige otro jugador activo.');
    const index = pending.targets.indexOf(actor.id);
    if (pending.targets.includes(destination.id)) {
      room.pending = null;
      log(room, `${actor.name} refleja el intercambio sobre su otro objetivo: el intercambio se anula.`, now);
    } else {
      pending.targets[index] = destination.id;
      pending.reflected = true; pending.passed = [actor.id]; pending.deadline = now + 15000;
      log(room, `${actor.name} refleja la habilidad hacia ${destination.name}. Se puede interrumpir.`, now);
    }
  }
  actor.hand = actor.hand.filter(c => c.id !== card.id);
}
export function applyAction(room, user, input, now = Date.now(), random = secureRandom) {
  fail(input && typeof input.action === 'string', 'Falta una acción.');
  const actor = player(room, user.id);
  if (input.action === 'join') {
    if (actor) return;
    fail(room.phase === 'lobby', 'La partida ya ha empezado.');
    fail(room.players.length < 12, 'La sala está completa (12 jugadores).');
    room.players.push({ id: user.id, name: user.username, lives: 3, hand: [], ready: false });
    log(room, `${user.username} entra en la sala.`, now); return;
  }
  fail(actor, 'No perteneces a esta partida.', 403);
  if (input.action === 'chat') {
    fail(now - (actor.lastChat || 0) >= 1500, 'Espera un instante antes de enviar otro mensaje.', 429);
    room.chat.push({ id: uid(), name: actor.name, message: text(input.message, 500), at: now });
    room.chat = room.chat.slice(-80); actor.lastChat = now; return;
  }
  if (input.action === 'tick') { settlePending(room, now, random); return; }
  // Expired reactions settle first. Do not execute a new action against a changed state.
  if (settlePending(room, now, random)) return;
  if (input.action === 'cancel') {
    fail(room.host === actor.id, 'Solo el anfitrión puede cerrar la partida.', 403);
    room.phase = 'cancelled'; room.pending = null; room.vote = null; room.request = null;
    log(room, 'El anfitrión ha cerrado la sala.', now); return;
  }
  if (input.action === 'leave' || input.action === 'kick') {
    fail(room.phase === 'lobby', 'Solo se puede salir o expulsar antes de empezar. Durante una partida puedes volver a entrar con tu cuenta.');
    const id = input.action === 'leave' ? actor.id : input.target;
    if (input.action === 'kick') fail(room.host === actor.id && id !== actor.id, 'Solo el anfitrión puede expulsar a otro jugador.', 403);
    fail(player(room, id), 'Ese jugador no está en la sala.');
    room.players = room.players.filter(p => p.id !== id);
    if (!room.players.length) room.phase = 'cancelled';
    else if (room.host === id) room.host = room.players[0].id;
    resetReady(room); return;
  }
  fail(!['finished', 'cancelled'].includes(room.phase), 'La partida ya ha terminado.');
  fail(actor.lives > 0, 'Has sido eliminado. Puedes observar y conversar.');
  if (['pass', 'reaction'].includes(input.action)) { reaction(room, actor, input, now); settlePending(room, now, random); return; }
  fail(!room.pending && !room.request && !(room.vote && input.action !== 'vote'), 'Hay una acción o votación pendiente.');
  switch (input.action) {
    case 'start':
      fail(room.host === actor.id && room.phase === 'lobby', 'Solo el anfitrión puede empezar desde la sala.', 403);
      fail(room.players.length >= 3 && room.players.every(p => p.ready), 'Se necesitan de 3 a 12 jugadores y todos deben estar listos.');
      beginRound(room, now, random); break;
    case 'ready':
      fail(['lobby', 'preparation', 'sealed', 'revealed', 'results'].includes(room.phase), 'No hay confirmación en esta fase.');
      actor.ready = !actor.ready;
      if (room.phase !== 'lobby' && active(room).every(p => p.ready)) {
        if (room.phase === 'preparation') { room.phase = 'assigning'; resetReady(room); }
        else if (room.phase === 'sealed') { room.phase = 'revealed'; resetReady(room); log(room, 'Todos los enemigos quedan revelados. Última ventana de habilidades.', now); }
        else if (room.phase === 'revealed') beginCombats(room, now);
        else beginRound(room, now, random);
      }
      break;
    case 'craft': {
      fail(room.phase === 'crafting' && room.order[room.turn] === actor.id, 'Aún no es tu turno de inventar la puerta.');
      room.doors.push({ id: uid(), creator: actor.id, scenario: text(input.scenario, 500), weapon: text(input.weapon), reward: null });
      log(room, `${actor.name} crea la puerta ${room.doors.length}.`, now);
      room.turn++;
      if (room.turn === room.order.length) allocateRewards(room, now, random);
      break;
    }
    case 'choose': {
      fail(room.phase === 'choosing' && room.order[room.turn] === actor.id, 'Aún no es tu turno de elegir puerta.');
      const door = room.doors.find(d => d.id === input.door);
      fail(door, 'Esa puerta no existe.');
      actor.choice = door.id; actor.weapon = door.weapon;
      log(room, `${actor.name} elige la puerta ${room.doors.indexOf(door) + 1}.`, now);
      room.turn++;
      if (room.turn === room.order.length) { room.phase = 'preparation'; resetReady(room); }
      break;
    }
    case 'assign': {
      fail(room.phase === 'assigning', 'No es la fase de asignación.');
      const target = player(room, input.target);
      const door = room.doors.find(d => d.id === target?.choice);
      fail(door?.creator === actor.id && target.lives > 0 && !target.enemy, 'No te corresponde asignar ese enemigo.');
      target.enemy = text(input.enemy);
      log(room, `${actor.name} ha sellado un enemigo secreto.`, now);
      if (active(room).every(p => p.enemy)) { room.phase = 'sealed'; resetReady(room); }
      break;
    }
    case 'card': playCard(room, actor, input, now); break;
    case 'vote': {
      fail(room.vote && room.vote.voters.includes(actor.id), 'No puedes votar en este combate.');
      fail(typeof input.yes === 'boolean', 'El voto debe ser sí o no.');
      fail(!(actor.id in room.vote.ballots), 'Tu voto ya está registrado.');
      room.vote.ballots[actor.id] = input.yes;
      if (room.vote.voters.every(id => id in room.vote.ballots)) completeVote(room, now);
      break;
    }
    default: throw new GameError('Acción desconocida.');
  }
}
export function fulfillEnemyRequest(room, user, input, now = Date.now()) {
  fail(room.request?.author === user.id, 'La sala ha escogido a otra persona.', 403);
  const target = player(room, room.request.target);
  target.enemy = text(input.enemy);
  log(room, `${player(room, user.id).name} reasigna el enemigo de ${target.name}: ${target.enemy}.`, now);
  room.request = null; resetReady(room);
}
export function publicRoom(room, userId, code, version) {
  const me = player(room, userId);
  fail(me, 'Únete a la sala para ver la partida.', 403);
  const enemiesRevealed = ['revealed', 'combat', 'results', 'finished'].includes(room.phase);
  const revealRoles = ['results', 'finished'].includes(room.phase);
  const intel = me.intel || [];
  const players = room.players.map(p => {
    const door = room.doors.find(d => d.id === p.choice);
    const enemyKnown = enemiesRevealed || p.enemyPublic || door?.creator === userId || intel.some(i => i.target === p.id && i.field === 'enemy');
    const roleKnown = p.id === userId || revealRoles || intel.some(i => i.target === p.id && i.field === 'role');
    return {
      id: p.id, name: p.name, lives: p.lives, ready: p.ready, choice: p.choice || null, weapon: p.weapon || null,
      role: roleKnown ? p.role || null : null, enemy: enemyKnown ? p.enemy || null : null,
      enemyAssigned: Boolean(p.enemy), double: p.double || false, roll: p.roll || null,
      cardCount: p.hand.length,
    };
  });
  const pending = room.pending ? {
    id: room.pending.id, type: room.pending.type, actor: room.pending.actor, targets: room.pending.targets,
    deadline: room.pending.deadline, passed: room.pending.passed, reflected: room.pending.reflected,
    value: room.pending.type === 'spy' ? null : room.pending.value || null, reason: room.pending.reason || null,
  } : null;
  const vote = room.vote ? {
    kind: room.vote.kind, target: room.vote.target, attempt: room.vote.attempt || 1,
    weapon: room.vote.weapon || null, reason: room.vote.reason || null,
    count: Object.keys(room.vote.ballots).length, total: room.vote.voters.length,
    canVote: room.vote.voters.includes(userId) && !(userId in room.vote.ballots),
    mine: room.vote.ballots[userId] ?? null,
  } : null;
  return {
    code, version, title: room.title, phase: room.phase, host: room.host, round: room.round,
    players, doors: room.doors, turn: room.order?.[room.turn] || null,
    hand: me.hand, intel, pending, vote, request: room.request, events: room.events, chat: room.chat,
    outcomes: room.outcomes, winners: room.winners, me: userId,
    composition: roleComposition(Math.max(3, active(room).length)), rewardCount: room.rewardCount || 0,
  };
}
