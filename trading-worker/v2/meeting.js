// Agent Office v2 · reuniones reales: cada asistente interviene con una llamada ligera
// viendo lo que ya se ha dicho, se votan las propuestas y Augusto cierra con acuerdos
// que el código aplica. Todo queda transcrito para verlo en el dashboard.
import {STAFF, staffById, checkPolicy, setPolicy, policyLabel, POLICY_HELP, emit, tell, madrid} from './company.js';
import {HOUSE, brief} from './agents.js';

const SLOTS = {1: [900], 2: [900, 1330], 3: [570, 900, 1330], 4: [570, 900, 1110, 1330], 5: [570, 720, 900, 1110, 1330], 6: [570, 720, 900, 1020, 1140, 1330]}; // minutos de Madrid
const SLOT_NAME = m => m <= 600 ? 'Apertura: plan del día' : m <= 760 ? 'Seguimiento de mediodía' : m <= 930 ? 'Premercado: qué hacemos hoy' : m < 1300 ? 'Seguimiento de sesión' : 'Cierre: balance del día';
const EXTRA = {ahorro: 0, normal: 1, intensivo: 3};

const voiceSchema = {
  type: 'object', additionalProperties: false, required: ['say', 'votes', 'proposal'],
  properties: {
    say: {type: 'string'},
    votes: {type: 'array', maxItems: 6, items: {type: 'object', additionalProperties: false, required: ['id', 'vote'], properties: {id: {type: 'string'}, vote: {type: 'string', enum: ['si', 'no']}}}},
    proposal: {type: 'object', additionalProperties: false, required: ['param', 'value', 'text'], properties: {param: {type: 'string'}, value: {type: 'string'}, text: {type: 'string'}}}
  }
};
const closeSchema = {
  type: 'object', additionalProperties: false, required: ['say', 'summary', 'decisions', 'tasks'],
  properties: {
    say: {type: 'string'}, summary: {type: 'string'},
    decisions: {type: 'array', maxItems: 4, items: {type: 'object', additionalProperties: false, required: ['param', 'value', 'reason'], properties: {param: {type: 'string'}, value: {type: 'string'}, reason: {type: 'string'}}}},
    tasks: {type: 'array', maxItems: 4, items: {type: 'object', additionalProperties: false, required: ['to', 'text'], properties: {to: {type: 'string', enum: STAFF.map(s => s.id)}, text: {type: 'string'}}}}
  }
};
const short = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

// ¿Toca reunión ahora? Devuelve {topic, kind} o null.
export function meetingDue(s, now, session) {
  const v2 = s.v2, m = madrid(now), md = v2.meetingDay;
  if (md.day !== m.day) v2.meetingDay = {day: m.day, done: [], extra: 0};
  const last = v2.meetings[0]?.at || 0;
  const forced = v2.meetingRequests.find(r => r.owner);
  if (forced && m.hour >= 0) return {topic: forced.topic, kind: 'extra', by: 'auditor', owner: true};
  if (now - last < 40 * 60e3) return null;
  if (!m.weekend) {
    const slots = SLOTS[Math.min(6, Math.max(1, v2.policy.meetingsPerDay))];
    const slot = slots.find(t => m.minutes >= t && m.minutes < t + 50 && !v2.meetingDay.done.includes(t));
    if (slot !== undefined) return {topic: SLOT_NAME(slot), kind: 'agenda', slot};
  }
  if (v2.meetingRequests.length && v2.meetingDay.extra < EXTRA[v2.policy.pace] && m.hour >= 8) { const r = v2.meetingRequests[0]; return {topic: r.topic, kind: 'extra', by: r.by}; }
  return null;
}

export async function holdMeeting(envDb, s, due, env) {
  const v2 = s.v2, now = env.now, chair = staffById('auditor');
  if (due.kind === 'agenda') v2.meetingDay.done.push(due.slot); else if (due.owner) v2.meetingRequests = v2.meetingRequests.filter(r => !r.owner); else { v2.meetingDay.extra++; v2.meetingRequests.shift(); }
  const pending = v2.proposals.filter(p => p.status === 'pendiente').slice(0, 5);
  const base = {...brief(s, env), tema: due.topic, propuestasAVotar: pending.map(p => ({id: p.id, param: p.param, value: p.value, de: staffById(p.by)?.name, motivo: short(p.text, 120)}))};
  const meeting = {id: 'm' + (++v2.seq), at: now, topic: due.topic, kind: due.kind, by: due.by || 'auditor', lines: [], decisions: [], tasks: [], votes: {}, costEur: 0, status: 'en curso'};
  v2.meetings.unshift(meeting); v2.meetings = v2.meetings.slice(0, 24);
  const speak = (id, text) => { if (short(text, 280)) meeting.lines.push({agent: id, text: short(text, 280)}); };
  const order = ['designer', 'scout', 'analyst', 'risk', 'operator'].filter(id => !v2.agents[id].paused);
  const call = async (member, instructions, extra, schema, maxOut) => {
    const res = await env.call(envDb, s, {agent: member.id, instructions, input: {...base, ...extra, seHaDicho: meeting.lines.map(l => staffById(l.agent).name + ': ' + l.text)}, schema, maxOut});
    meeting.costEur += res.costEur; const a = v2.agents[member.id]; a.calls++; a.eur += res.costEur; if (a.today.day === madrid(now).day) { a.today.calls++; a.today.eur += res.costEur; }
    return res.data;
  };
  try {
    // Abre quien la pidió (si no es el director) y después el resto por turno.
    if (due.by && order.includes(due.by)) order.splice(0, 0, ...order.splice(order.indexOf(due.by), 1));
    for (const id of order) {
      const member = staffById(id);
      const d = await call(member, HOUSE + '\n\nERES ' + member.name.toUpperCase() + ', ' + member.role + '. ' + member.persona + ' Estás en una REUNIÓN de la empresa. Interviene UNA vez desde tu puesto (máx. 220 caracteres): aporta un dato, una objeción o una propuesta concreta; contesta a lo que han dicho otros si no estás de acuerdo. Vota cada propuesta pendiente por su id (si/no). Si quieres proponer un cambio de regla rellena proposal; si no, déjala con los tres campos vacíos. Reglas modificables: ' + POLICY_HELP + '.',
        {tuUltimaNota: v2.agents[id].notes.at(-1) || ''}, voiceSchema, 300);
      speak(id, d.say);
      for (const v of d.votes || []) { const p = pending.find(x => x.id === v.id); if (p) p.votes[id] = v.vote; }
      if (d.proposal?.param) { const check = checkPolicy(d.proposal.param, d.proposal.value); if (check.ok && pending.length < 6) { const p = {id: 'p' + (++v2.seq), param: d.proposal.param, value: check.value, text: short(d.proposal.text, 200), by: id, at: now, status: 'pendiente', votes: {[id]: 'si'}}; v2.proposals.unshift(p); pending.push(p); base.propuestasAVotar.push({id: p.id, param: p.param, value: p.value, de: member.name, motivo: p.text}); } }
      if (env.checkpoint) await env.checkpoint();
    }
    const tally = Object.fromEntries(pending.map(p => { const v = Object.values(p.votes); return [p.id, {si: v.filter(x => x === 'si').length, no: v.filter(x => x === 'no').length}]; }));
    const d = await call(chair, HOUSE + '\n\nERES AUGUSTO, Dirección. ' + chair.persona + ' Presides la REUNIÓN y te toca CERRARLA. say = tu intervención final (máx. 240 caracteres). summary = el acuerdo en una frase (máx. 140). decisions = cambios de regla que se aplican YA (param y value válidos); no puedes aplicar una propuesta que la mayoría ha votado en contra. tasks = encargos concretos a compañeros (máx. 4, uno por persona). Si no hay nada que cambiar, deja decisions vacío: mantener el rumbo también es una decisión. Reglas modificables: ' + POLICY_HELP + '.',
      {recuento: pending.map(p => ({id: p.id, param: p.param, value: p.value, ...tally[p.id]}))}, closeSchema, 420);
    speak('auditor', d.say);
    for (const dec of d.decisions || []) {
      const check = checkPolicy(dec.param, dec.value); if (!check.ok) continue;
      const rejected = pending.find(p => p.param === dec.param && String(p.value) === String(check.value) && tally[p.id].no > tally[p.id].si);
      if (rejected) { meeting.decisions.push({param: dec.param, value: check.value, applied: false, reason: 'La mayoría votó en contra'}); continue; }
      const r = setPolicy(v2, dec.param, check.value, 'auditor', 'Reunión: ' + short(dec.reason, 160), now);
      if (r.ok && !r.unchanged) meeting.decisions.push({param: dec.param, label: policyLabel(dec.param), value: check.value, applied: true, reason: short(dec.reason, 160)});
    }
    for (const p of pending) { meeting.votes[p.id] = {param: p.param, value: p.value, by: p.by, ...tally[p.id]}; if (p.status === 'pendiente') p.status = tally[p.id].no > tally[p.id].si ? 'rechazada' : 'aparcada'; }
    for (const t of (d.tasks || []).slice(0, 4)) { if (!staffById(t.to) || t.to === 'auditor') continue; tell(v2, t.to, 'auditor', 'Encargo de la reunión: ' + short(t.text, 200), now); meeting.tasks.push({to: t.to, text: short(t.text, 200)}); v2.agents[t.to].waitUntil = 0; }
    meeting.summary = short(d.summary, 180) || 'Sin acuerdos nuevos'; meeting.status = 'terminada';
  } catch (error) {
    meeting.status = 'interrumpida'; meeting.summary = 'La reunión se cortó: ' + short(error.message, 100); meeting.error = error.code || 'error';
    if (!meeting.lines.length) { v2.meetings.shift(); throw error; }
  }
  emit(v2, 'meeting', {meetingId: meeting.id, topic: meeting.topic, participants: [...new Set(meeting.lines.map(l => l.agent))], lines: meeting.lines, decision: meeting.summary, changes: meeting.decisions.filter(x => x.applied).length}, now);
  return meeting;
}
