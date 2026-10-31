import { suggestion } from '../../control/doors-catalog.js';
import { GameError, active, applyAction, fulfillEnemyRequest, secureRandom } from './doors-engine.js';

// Server-side AI players. They never play cards; they invent doors and enemies from the
// local catalog, pass every reaction window, confirm at once and vote with a simple heuristic.
const isBot = p => Boolean(p?.bot);
const person = (room, id) => room.players.find(p => p.id === id);
const lower = value => value.charAt(0).toLowerCase() + value.slice(1);

function verdict(room, bot, vote, random) {
  if (vote.kind === 'mutation') return random() < .6;
  if (vote.target === bot.id) return true;
  // A creator knows the intention of their own door; everyone else guesses.
  const door = room.doors.find(d => d.id === person(room, vote.target).choice);
  if (door?.creator === bot.id && bot.role === 'mortal') return false;
  if (door?.creator === bot.id && bot.role === 'victory') return true;
  return random() < .55;
}
function chooseDoor(room, bot, random) {
  const own = room.doors.find(d => d.creator === bot.id);
  let doors = room.doors.filter(d => !(bot.role === 'mortal' && d === own));
  if (!doors.length) doors = room.doors;
  const rewarded = doors.filter(d => d.reward);
  const pool = rewarded.length && random() < .7 ? rewarded : doors;
  return pool[Math.floor(random() * pool.length)];
}
export function nextBotMove(room, random = secureRandom) {
  if (room.phase === 'lobby') {
    const bot = room.players.find(p => isBot(p) && !p.ready);
    return bot && { bot, input: { action: 'ready' } };
  }
  if (['finished', 'cancelled'].includes(room.phase)) return null;
  const bots = active(room).filter(isBot);
  if (!bots.length) return null;
  if (room.pending) {
    const bot = bots.find(b => !room.pending.passed.includes(b.id));
    return bot && { bot, input: { action: 'pass' } };
  }
  if (room.request) {
    const bot = bots.find(b => b.id === room.request.author);
    return bot && { bot, reassign: true, input: { enemy: suggestion('enemy', random) } };
  }
  if (room.vote) {
    const bot = bots.find(b => room.vote.voters.includes(b.id) && !(b.id in room.vote.ballots));
    return bot && { bot, input: { action: 'vote', yes: verdict(room, bot, room.vote, random) } };
  }
  const turn = bots.find(b => b.id === room.order?.[room.turn]);
  if (room.phase === 'crafting' && turn) return { bot: turn, input: { action: 'craft', ...suggestion('door', random) } };
  if (room.phase === 'choosing' && turn) return { bot: turn, input: { action: 'choose', door: chooseDoor(room, turn, random).id } };
  if (room.phase === 'assigning') {
    for (const target of active(room).filter(p => !p.enemy)) {
      const creator = room.doors.find(d => d.id === target.choice)?.creator;
      const bot = bots.find(b => b.id === creator);
      if (bot) return { bot, input: { action: 'assign', target: target.id, enemy: suggestion('enemy', random) } };
    }
    return null;
  }
  if (['preparation', 'sealed', 'revealed', 'results'].includes(room.phase)) {
    const bot = bots.find(b => !b.ready);
    return bot && { bot, input: { action: 'ready' } };
  }
  return null;
}
function speak(room, bot, now) {
  const vote = room.vote;
  if (!vote || vote.kind !== 'combat' || vote.target !== bot.id || vote.spoken) return;
  vote.spoken = true;
  room.chat.push({ id: crypto.randomUUID(), name: bot.name, message: `Con ${lower(bot.weapon)} contra ${lower(bot.enemy)}: dejadme intentarlo, tiene sentido.`, at: now });
  room.chat = room.chat.slice(-80);
}
export function runBots(room, now = Date.now(), random = secureRandom) {
  // Bounded so a malformed room can never spin forever inside a request.
  for (let step = 0; step < 600; step++) {
    const target = room.vote && person(room, room.vote.target);
    if (isBot(target) && target.lives > 0) speak(room, target, now);
    const move = nextBotMove(room, random);
    if (!move) return;
    const user = { id: move.bot.id, username: move.bot.name };
    try {
      if (move.reassign) fulfillEnemyRequest(room, user, move.input, now);
      else applyAction(room, user, move.input, now, random);
    } catch (error) {
      if (error instanceof GameError) return;
      throw error;
    }
  }
}
