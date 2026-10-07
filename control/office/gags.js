// Agent Office · guion de la vida de oficina. Todo sale del estado real que publica el
// motor (S): no llama a ningún modelo y no inventa cifras. Funciones puras, sin DOM.
export const NAME = {scout: 'Santi', analyst: 'Pedro', risk: 'María', operator: 'Yari', auditor: 'Augusto', designer: 'Cadaqui', cesar: 'César'};
const IDS = ['scout', 'analyst', 'risk', 'operator', 'auditor', 'designer'];
const eur = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n || 0)).toLocaleString('es-ES') + ' €';
const eur2 = n => (n || 0).toFixed(2).replace('.', ',') + ' €';
const pc = n => (n >= 0 ? '+' : '−') + Math.abs(n || 0).toFixed(1).replace('.', ',') + ' %';
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
const pick = (a, rnd = Math.random) => a[Math.floor(rnd() * a.length) % a.length];
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };

// Vista cómoda del estado, con valores por defecto para que nada salga «undefined».
export function view(S) {
  const life = S.life || {}, pol = S.policy || {}, pos = S.positions || [], up = new Set(S.upgrades || []);
  const tokensPct = Math.round((S.tokensLeft ?? 1) * 100), missing = Math.max(0, (S.rentTarget || 10000) - (S.monthPnl || 0));
  const best = pos.reduce((b, p) => !b || p.pnlPct > b.pnlPct ? p : b, null), worst = pos.reduce((b, p) => !b || p.pnlPct < b.pnlPct ? p : b, null);
  const st = id => life.agents?.[id] || {}, ag = id => S.agents?.[id] || {};
  return {S, life, pol, pos, up, tokensPct, missing, best, worst, st, ag, mood: S.mood || 'calm', days: S.daysLeft ?? 0, idle: life.daysSinceTrade || 0, traded: !!life.everTraded,
    paid: (S.monthPnl || 0) >= (S.rentTarget || 10000), perDay: missing / Math.max(1, S.daysLeft || 1), tokPerDay: (S.tokensEur || 0) / Math.max(1, S.daysLeft || 1), strat: pol.strategy || 'la de siempre'};
}

// ---- hablar con un empleado (E): frases con su estado real, en su voz ----
export function talkLines(id, S) {
  const v = view(S), a = v.ag(id), st = v.st(id), out = [];
  const last = (S.recent || []).filter(e => (e.from || e.agent) === id && e.text).at(-1); if (last) out.push('Lo último mío: ' + clip(last.text, 110));
  if (a.paused) out.push('Me tienes en pausa, jefe. Cuando quieras vuelvo.');
  if (a.task && !/^(Pensando|Incorporándose)/.test(a.task)) out.push(/^En pausa/.test(a.task) ? 'Ahora mismo, nada útil que hacer. Y así no gasto tokens.' : 'Lo último que he hecho: ' + clip(a.task, 70) + '.');
  if (a.thought) out.push('Te digo lo que pienso: ' + clip(a.thought, 150));
  if (a.work > 0) out.push({analyst: 'Tengo ' + plural(a.work, 'candidata esperando', 'candidatas esperando') + ' plan. Voy por orden.', risk: plural(a.work, 'plan', 'planes') + ' por revisar. Alguno no pasará.', operator: plural(a.work, 'compra aprobada', 'compras aprobadas') + ' en la cola. En cuanto haya precio, entro.', auditor: plural(a.work, 'asunto pendiente', 'asuntos pendientes') + ' de revisar en mi mesa.'}[id] || 'Tengo trabajo en la mesa.');
  if (a.note) out.push('Me he apuntado esto: ' + clip(a.note, 120));
  const mine = {
    scout: [st.pitches ? 'Llevo ' + plural(st.pitches, 'candidata presentada', 'candidatas presentadas') + ((st.vetoed || 0) + (st.discarded || 0) ? '; me han tumbado ' + ((st.vetoed || 0) + (st.discarded || 0)) + '. Sin rencor. Casi.' : ' y ninguna tumbada todavía. Dame tiempo.') : 'Aún no he traído ninguna candidata. El radar manda.',
      st.ideasClosed ? 'Mis ideas ya cerradas suman ' + eur(st.ideasPnl) + '. ' + (st.ideasPnl >= 0 ? 'De nada.' : 'Estoy en racha… mala.') : null],
    analyst: [st.plans ? 'He escrito ' + plural(st.plans, 'plan', 'planes') + '. Todos con su stop, su objetivo y su plazo.' : 'Todavía no he firmado ningún plan. No improviso.',
      st.discards ? 'He descartado ' + plural(st.discards, 'idea', 'ideas') + '. No todo lo que brilla tiene ventaja.' : null],
    risk: [(st.vetoes || st.approvals) ? 'Llevo ' + plural(st.vetoes || 0, 'veto', 'vetos') + ' y ' + plural(st.approvals || 0, 'aprobado', 'aprobados') + '. Soy más simpática de lo que dicen.' : 'Aún no me ha llegado ningún plan. Estoy afilando el boli rojo.',
      st.overruled ? 'Augusto me ha levantado ' + plural(st.overruled, 'veto', 'vetos') + '. Lo tengo apuntado.' : null,
      v.pol.riskGate === 'off' ? 'Me han quitado el filtro de riesgo. Yo aviso: luego no quiero lloros.' : null, v.pol.leverage > 1 ? 'Vamos con apalancamiento ×' + v.pol.leverage + '. Duermo regular.' : null],
    operator: [(st.buys || st.sells) ? 'He lanzado ' + plural(st.buys || 0, 'compra', 'compras') + ' y ' + plural(st.sells || 0, 'venta', 'ventas') + '.' : 'Todavía no he apretado el botón ni una vez. Me pica el dedo.',
      v.best ? 'La que mejor va es ' + v.best.symbol + ': ' + pc(v.best.pnlPct) + '.' + (v.worst && v.worst !== v.best ? ' La peor, ' + v.worst.symbol + ': ' + pc(v.worst.pnlPct) + '.' : '') : 'No tenemos nada en cartera. Así no se paga un alquiler.',
      v.traded && v.idle >= 1 ? 'Llevo ' + plural(v.idle, 'día', 'días') + ' sin operar. Me aburro, jefe.' : null],
    auditor: ['Vamos con «' + v.strat + '».' + (v.life.strategies?.find(x => x.current)?.trades ? ' De momento: ' + eur(v.life.strategies.find(x => x.current).pnl) + ' en ' + plural(v.life.strategies.find(x => x.current).trades, 'cierre', 'cierres') + '.' : ' Aún sin cierres con ella.'),
      st.ruleChanges ? 'He cambiado las reglas ' + plural(st.ruleChanges, 'vez', 'veces') + '. Rectificar es de directores.' : null, st.lessons ? 'Llevamos ' + plural(st.lessons, 'lección apuntada', 'lecciones apuntadas') + '. Otra cosa es que las leamos.' : null,
      v.life.ownerUnread ? 'Tengo tu mensaje en la bandeja. Lo leo en mi próximo turno.' : null],
    designer: ['Quedan ' + eur2(S.tokensEur) + ' de tokens para ' + plural(v.days, 'día', 'días') + ': salen ' + eur2(v.tokPerDay) + ' al día.' + (v.tokensPct < 25 ? ' Vamos justos.' : ' Vamos bien.'),
      'Ritmo de trabajo: ' + (v.pol.pace || 'normal') + '.' + (v.pol.pace === 'ahorro' ? ' Pensamos lo justo.' : v.pol.pace === 'intensivo' ? ' Hoy se gasta.' : ''), v.up.size ? 'La oficina tiene ' + plural(v.up.size, 'mejora', 'mejoras') + '. Cada una con su factura.' : 'No he comprado nada para la oficina. De nada.']
  }[id] || [];
  out.push(...mine.filter(Boolean));
  if (a.callsToday) out.push('Hoy llevo ' + plural(a.callsToday, 'turno', 'turnos') + ': ' + (a.eurToday || 0).toFixed(4).replace('.', ',') + ' € en tokens.');
  if (a.idle && !a.paused) out.push('Estoy descansando hasta que haya algo útil. No es vagancia: es presupuesto.');
  out.push(rentLine(id, v));
  if (a.say) out.push('Lo último que dije en voz alta: «' + clip(a.say, 120) + '»');
  return [...new Set(out.filter(Boolean))];
}
function rentLine(id, v) {
  if (v.paid) return {scout: '¡Alquiler pagado! Lo que caiga ahora es propina.', risk: 'Alquiler cubierto. Ahora toca no devolverlo.', designer: 'Alquiler cubierto: ' + eur(v.S.monthPnl) + '. Lo he sumado dos veces.'}[id] || 'El alquiler de este mes está pagado. Respiramos.';
  const base = 'Faltan ' + eur(v.missing) + ' y quedan ' + plural(v.days, 'día', 'días') + ': ' + eur(v.perDay) + ' al día.';
  return base + ' ' + ({scout: 'Con una buena lo arreglo.', analyst: 'Los números son los que son.', risk: 'Y no pienso jugármelo todo a una carta. Bueno, depende.', operator: 'Dame algo que comprar.', auditor: 'Si hay que cambiar de rumbo, se cambia.', designer: 'He hecho la cuenta tres veces.'}[id] || '');
}

// ---- reacción cuando César pasa cerca ----
export function reactLine(id, S, {asleep = false, hour = 12} = {}, rnd = Math.random) {
  const v = view(S), a = v.ag(id);
  if (asleep) return pick(['¡No estaba dormido!', 'Estaba… descansando la vista.', '¿Eh? Sí, sí, el alquiler.', 'Cinco minutos más, jefe.'], rnd);
  if (a.paused) return pick(['Sigo en pausa, jefe.', '¿Ya puedo volver?'], rnd);
  const g = {
    panic: ['Lo tenemos controlado. Más o menos.', 'No mires el marcador, jefe.', 'Faltan ' + eur(v.missing) + '. Estamos en ello.', 'Ahora no, que remontamos.'],
    tense: ['Jefe.', 'Trabajando, trabajando.', 'Quedan ' + plural(v.days, 'día', 'días') + '. Lo sé.', 'Todo en orden. Casi todo.'],
    calm: ['Buenas, jefe.', hour < 12 ? 'Buenos días.' : hour < 20 ? '¿Qué tal la tarde?' : 'Buenas noches.', '¿Un café?', 'Vamos bien de alquiler.'],
    joy: ['¡Jefe! ¿Has visto el mes?', 'Hoy invitas tú.', '¡Alquiler a la vista!', 'Así da gusto venir.']
  }[v.mood] || ['Hola, jefe.'];
  const own = {
    scout: v.st('scout').pitches ? ['¡Tengo una buena, jefe!', 'Esta vez sí.'] : ['Estoy con el radar.'],
    analyst: v.ag('analyst').work ? ['Un momento, que estoy con números.'] : ['Sin datos no opino.'],
    risk: v.st('risk').vetoes ? ['No vengas a pedirme que afloje.'] : ['Yo vigilo.'],
    operator: v.pos.length ? ['Tengo ' + plural(v.pos.length, 'posición viva', 'posiciones vivas') + '. No me distraigas.'] : ['Sin nada en cartera me aburro.'],
    auditor: ['Luego lo vemos en reunión.'],
    designer: v.tokensPct < 25 ? ['Habla poco, que cada palabra cuesta.'] : ['Las cuentas cuadran.']
  }[id] || [];
  return pick(rnd() < 0.4 && own.length ? own : g, rnd);
}

// ---- mirar la pantalla de alguien ----
export function peekLine(id, S, rnd = Math.random) {
  const v = view(S), a = v.ag(id);
  if (a.idle || a.paused) return {caught: true, text: pick({scout: ['Era… un vídeo sobre mercados.', 'Estaba investigando. En una red social.'], analyst: ['Es una hoja de cálculo. De mi liga de fantasy.', 'Esto es análisis… de otra cosa.'], risk: ['Si miras, no baja el riesgo.', 'Es un solitario. Con stop.'], operator: ['Estaba practicando reflejos.', 'El buscaminas también es gestión de riesgo.'], auditor: ['Estaba pensando en la visión.', 'Reflexión estratégica. Con cartas.'], designer: ['Comparaba precios de bolis.', 'Es un presupuesto. De mis vacaciones.']}[id] || ['Nada, nada.'], rnd)};
  const real = a.task && !/^(Pensando|En pausa|Incorporándose)/.test(a.task) ? ['Estoy con esto: ' + clip(a.task, 60) + '.'] : [];
  return {caught: false, text: pick([...real, ...({scout: ['¿Ves? Volumen. Te lo dije.', 'Mira esta, mira esta.'], analyst: ['No toques nada, que lo descuadro.', 'Sí, hay muchas columnas. Todas necesarias.'], risk: ['¿Vienes a mirar o a firmar el riesgo?', 'Rojo es malo. Para que lo sepas.'], operator: ['No respires fuerte, que se mueve el precio.', v.best ? v.best.symbol + ' va ' + pc(v.best.pnlPct) + '. No la gafes.' : 'Pantalla vacía. Deprimente.'], auditor: ['Es la foto de conjunto, jefe.', '¿Necesitas algo?'], designer: ['Esto son tokens. Esto, euros. No los mezcles.', 'Gasto de hoy: controlado.']}[id] || ['¿Necesitas algo, jefe?'])], rnd)};
}

export function highFive(id, S, rnd = Math.random) {
  const v = view(S);
  if (v.mood === 'panic') return {ok: false, text: pick(['No hay nada que celebrar, jefe.', 'Cuando remontemos.', 'Con ' + eur(v.missing) + ' por delante, no.'], rnd)};
  if (v.mood === 'tense') return {ok: id === 'scout' || id === 'operator', text: pick(id === 'risk' ? ['Chocamos cuando paguemos el alquiler.'] : ['Venga, va. Por si da suerte.', 'Cuando paguemos el alquiler, con las dos manos.'], rnd)};
  return {ok: true, text: pick(id === 'risk' ? ['Venga. Pero no te acostumbres.'] : id === 'designer' ? ['Esto no cuesta tokens. Me gusta.'] : ['¡Esa!', '¡Vamos!', '¡Equipo!'], rnd)};
}

// ---- arenga de César (Espacio): hasta tres respuestas ----
export function pepTalk(S, free, rnd = Math.random) {
  const v = view(S), out = [], add = (who, text) => { if (free.includes(who) && out.length < 3 && !out.some(o => o.who === who)) out.push({who, text}); };
  if (v.paid) { add('scout', '¡Pagado, jefe! ¿Fiesta?'); add('designer', 'Fiesta barata.'); add('risk', 'Y mañana, a no perderlo.'); return out; }
  if (v.mood === 'panic') { add('designer', 'Con ánimos no llega: faltan ' + eur(v.missing) + '.'); add('operator', 'Menos discurso y más órdenes.'); add('auditor', 'Gracias, jefe. Lo intentamos todo.'); }
  else if (v.mood === 'tense') { add('auditor', 'Recibido. Apretamos.'); add('risk', 'Apretar no es lo mismo que tirarse.'); add('scout', '¡Esta semana cae una buena!'); }
  else { add('scout', '¡A por ello!'); add('operator', 'Tú di «compra» y yo compro.'); add('designer', 'Y sin gastar de más.'); }
  for (const id of free) add(id, pick(['¡Vamos!', 'Hecho.', 'Oído.'], rnd));
  return out;
}

// ---- charla de pasillo entre dos empleados ----
export function smalltalk(a, b, S, rnd = Math.random) {
  const v = view(S), opts = [];
  const add = (x, y) => opts.push([x, y]);
  if (!v.traded) add('¿Y si compramos algo? Por probar.', 'Primero un plan. Luego ya si eso.');
  if (v.traded && v.idle >= 2) add('Llevamos ' + v.idle + ' días sin operar.', 'El alquiler no se paga mirando.');
  if (v.pos.length) add('¿Cómo va ' + v.pos[0].symbol + '?', pc(v.pos[0].pnlPct) + '. ' + (v.pos[0].pnlPct >= 0 ? 'No la toques.' : 'No preguntes.'));
  if (v.tokensPct < 30) add('Quedan ' + eur2(S.tokensEur) + ' de tokens.', 'Pues hablemos bajito.');
  if (v.life.streak?.n >= 2) add(v.life.streak.kind === 'win' ? v.life.streak.n + ' seguidas ganando.' : v.life.streak.n + ' seguidas perdiendo.', v.life.streak.kind === 'win' ? 'No lo digas en voz alta.' : 'Eso tampoco lo digas en voz alta.');
  if (v.life.meetingsToday >= 3) add('Hoy van ' + v.life.meetingsToday + ' reuniones.', 'Alguna podía ser un mensaje.');
  if (v.paid) add('Alquiler pagado.', '¿Pedimos algo para la oficina?');
  else if (v.mood === 'panic') { add('Faltan ' + eur(v.missing) + '.', 'Y ' + plural(v.days, 'día', 'días') + '. Ya.'); add('¿Y si cambiamos de estrategia?', 'Otra vez. Vale.'); }
  else if (v.mood === 'tense') add('Hay que ganar ' + eur(v.perDay) + ' al día.', 'Dicho así suena fácil.');
  else add('Vamos por delante del alquiler.', 'Calla, que lo gafas.');
  if (!S.marketOpen) add('Mercado cerrado.', 'Y nosotros aquí. Vocación.');
  add('¿Café?', v.up.has('cafetera') ? 'De la buena, sí.' : 'Del de siempre. Sí.');
  const pair = pick(opts, rnd);
  return pair;
}

// ---- gags dirigidos: se elige uno cuya condición sea cierta ahora ----
// paso: {who, say, to, pose, fx, wait}. to: 'coffee'|'tank'|'board'|'strategy'|'darts'|'bell'|'arcade'|'@id'|'home'
const GAGS = [
  {id: 'cobweb', w: 3, need: ['operator'], when: v => v.traded && v.idle >= 2, steps: v => [{who: 'operator', pose: 'sit', say: 'Llevo ' + v.idle + ' días sin apretar un botón. Me van a salir telarañas.', fx: 'cobweb'}, {who: 'risk', say: 'Las telarañas no pierden dinero.'}]},
  {id: 'never', w: 3, need: ['operator', 'analyst'], when: v => !v.traded, steps: () => [{who: 'operator', to: '@analyst', say: '¿Tienes algo para mí? Lo que sea.'}, {who: 'analyst', say: 'Cuando tenga ventaja, tendrás plan.'}, {who: 'operator', say: 'El alquiler no espera a tu ventaja.'}]},
  {id: 'tokens', w: 4, need: ['designer'], when: v => v.tokensPct < 25, steps: v => [{who: 'designer', to: 'tank', say: 'Queda un ' + v.tokensPct + ' %. Lo mido cada hora.', fx: 'measure'}, {who: 'designer', say: 'A partir de ahora, frases cortas.'}, {who: 'scout', say: 'Vale.'}]},
  {id: 'lights', w: 2, need: ['designer', 'operator'], when: v => v.tokensPct < 40 || v.pol.pace === 'ahorro', steps: () => [{who: 'designer', say: 'Apago luces. Ahorro es ahorro.', fx: 'lights'}, {who: 'operator', say: '¡Que no veo el precio!'}, {who: 'designer', say: 'El precio no cambia por mirarlo.'}]},
  {id: 'stop', w: 5, need: ['risk', 'operator'], when: v => v.life.lastStop && Date.now() - v.life.lastStop.at < 8 * 3600e3, steps: v => [{who: 'operator', pose: 'panic', say: v.life.lastStop.symbol + ': ' + eur(v.life.lastStop.pnl) + '. El stop estaba mal puesto.'}, {who: 'risk', say: 'El stop estaba donde dijimos. Tú no.'}, {who: 'auditor', say: 'Lo apuntamos y seguimos.'}]},
  {id: 'told', w: 2, need: ['risk'], when: v => v.life.streak?.kind === 'loss' && v.life.streak.n >= 2, steps: v => [{who: 'risk', pose: 'sit', say: v.life.streak.n + ' seguidas perdiendo. Yo solo digo que lo dije.'}, {who: 'scout', say: 'Tú siempre lo dices todo.'}]},
  {id: 'streak', w: 3, need: ['operator'], when: v => v.life.streak?.kind === 'win' && v.life.streak.n >= 2, steps: v => [{who: 'operator', pose: 'cheer', say: v.life.streak.n + ' seguidas. Llamadme cuando queráis aprender.'}, {who: 'analyst', say: 'El plan era mío.'}, {who: 'scout', say: 'Y la idea, mía.'}]},
  {id: 'vetos', w: 3, need: ['scout', 'risk'], when: v => (v.st('risk').vetoes || 0) >= 2, steps: v => [{who: 'scout', to: '@risk', say: 'Llevas ' + v.st('risk').vetoes + ' vetos. Los estoy apuntando.'}, {who: 'risk', say: 'Apunta también los que vienen.'}]},
  {id: 'tumbadas', w: 2, need: ['scout', 'analyst'], when: v => (v.st('scout').pitches || 0) >= 2, steps: v => [{who: 'scout', to: '@analyst', say: '¡Esta es la buena, Pedro!'}, {who: 'analyst', say: 'Dijiste lo mismo de las otras ' + (v.st('scout').pitches - 1) + '.'}, {who: 'scout', say: 'Y alguna lo era.'}]},
  {id: 'behind', w: 3, need: ['designer', 'auditor'], when: v => !v.paid && v.mood !== 'calm' && v.mood !== 'joy', steps: v => [{who: 'designer', to: 'board', say: 'Faltan ' + eur(v.missing) + ' y ' + plural(v.days, 'día', 'días') + '. Son ' + eur(v.perDay) + ' diarios.'}, {who: 'auditor', say: 'Pues habrá que inventar algo.'}, {who: 'designer', say: 'Inventa barato.'}]},
  {id: 'ahead', w: 2, need: ['auditor', 'designer'], when: v => !v.paid && (v.mood === 'calm' || v.mood === 'joy') && v.S.monthPnl > 0, steps: v => [{who: 'auditor', to: 'board', say: 'Llevamos ' + eur(v.S.monthPnl) + '. Si seguimos así, pido plantas.'}, {who: 'designer', say: 'Las plantas también se riegan con dinero.'}]},
  {id: 'paid', w: 5, need: ['scout', 'designer'], when: v => v.paid, steps: v => [{who: 'scout', pose: 'cheer', say: '¡Alquiler pagado! ¡' + eur(v.S.monthPnl) + '!', fx: 'confetti'}, {who: 'designer', say: 'El confeti lo barre quien lo tira.'}, {who: 'risk', say: 'Ahora, a no devolverlo.'}]},
  {id: 'winner', w: 3, need: ['operator'], when: v => v.best && v.best.pnlPct >= 5, steps: v => [{who: 'operator', pose: 'sit', say: v.best.symbol + ' va ' + pc(v.best.pnlPct) + '. Que nadie la toque. Ni la mire.'}, {who: 'risk', say: '¿Subimos el stop o seguimos rezando?'}]},
  {id: 'loser', w: 3, need: ['analyst', 'operator'], when: v => v.worst && v.worst.pnlPct <= -4, steps: v => [{who: 'analyst', pose: 'sit', say: v.worst.symbol + ' va ' + pc(v.worst.pnlPct) + '. El plan decía otra cosa.'}, {who: 'operator', say: 'El mercado no se leyó tu plan.'}]},
  {id: 'leverage', w: 2, need: ['risk'], when: v => v.pol.leverage > 1, steps: v => [{who: 'risk', pose: 'sit', say: 'Con palanca ×' + v.pol.leverage + ' duermo peor. Que conste en acta.'}, {who: 'auditor', say: 'Consta.'}]},
  {id: 'allin', w: 2, need: ['risk', 'operator'], when: v => v.pol.lotPct >= 50, steps: v => [{who: 'risk', to: '@operator', say: 'Un ' + Math.round(v.pol.lotPct) + ' % por posición. Todo a una carta.'}, {who: 'operator', say: 'Si sale bien, es una carta muy buena.'}]},
  {id: 'nogate', w: 3, need: ['risk'], when: v => v.pol.riskGate === 'off', steps: v => [{who: 'risk', to: v.up.has('arcade') ? 'arcade' : 'coffee', say: 'Me habéis quitado el filtro. Disfrutad. Yo estaré aquí.'}, {who: 'scout', say: '¿Eso es una amenaza?'}, {who: 'risk', say: 'Es un pronóstico.'}]},
  {id: 'meetings', w: 2, need: ['analyst', 'auditor'], when: v => v.life.meetingsToday >= 3, steps: v => [{who: 'analyst', pose: 'sit', say: 'Hoy llevamos ' + v.life.meetingsToday + ' reuniones.'}, {who: 'auditor', say: 'Lo vemos en la siguiente.'}]},
  {id: 'closed', w: 2, need: ['scout', 'operator'], when: v => !v.S.marketOpen, steps: () => [{who: 'scout', say: '¡Va!', fx: 'plane:operator'}, {who: 'operator', say: 'Mercado cerrado no significa recreo.'}, {who: 'operator', say: 'Bueno. Un poco sí.', fx: 'plane:scout'}]},
  {id: 'ahorro', w: 2, need: ['designer', 'scout'], when: v => v.pol.pace === 'ahorro', steps: () => [{who: 'scout', say: 'En modo ahorro pienso a medias.'}, {who: 'designer', say: 'Pues piensa la mitad buena.'}]},
  {id: 'intensivo', w: 2, need: ['designer'], when: v => v.pol.pace === 'intensivo', steps: v => [{who: 'designer', pose: 'panic', say: 'Ritmo intensivo. Veo los tokens irse uno a uno.'}, {who: 'operator', say: 'Para ganar hay que gastar.'}]},
  {id: 'queue', w: 3, need: ['analyst', 'scout'], when: v => (v.life.ideas?.nueva || 0) >= 3, steps: v => [{who: 'analyst', pose: 'sit', say: 'Tengo ' + v.life.ideas.nueva + ' candidatas en la mesa. Santi, respira.'}, {who: 'scout', say: 'El mundo no para, Pedro.'}]},
  {id: 'strategy', w: 2, need: ['auditor', 'analyst'], when: v => (v.life.strategies || []).length >= 2, steps: v => { const top = v.life.strategies[0]; return [{who: 'auditor', to: 'strategy', say: 'La que más ha dado es «' + top.name + '»: ' + eur(top.pnl) + '.'}, {who: 'analyst', say: top.current ? 'Pues no la toquéis.' : 'Y la cambiamos. Muy nuestro.'}]; }},
  {id: 'owner', w: 3, need: ['auditor'], when: v => v.life.ownerUnread, steps: () => [{who: 'auditor', pose: 'sit', say: 'Tengo un mensaje del jefe sin leer. Que nadie me mire.'}, {who: 'scout', say: 'Te estamos mirando todos.'}]},
  {id: 'darts', w: 2, need: ['operator', 'analyst'], when: v => v.up.has('dardos'), steps: v => [{who: 'operator', to: 'darts', say: v.life.worst ? 'Esta va por ' + v.life.worst.symbol + '.' : 'Esta va por el alquiler.', fx: 'dart'}, {who: 'analyst', say: 'Has dado en la pared.'}]},
  {id: 'arcade', w: 2, need: ['operator', 'scout'], when: v => v.up.has('arcade') && v.mood !== 'panic', steps: () => [{who: 'scout', to: 'arcade', say: '¡Récord!'}, {who: 'operator', say: 'El récord es mío. Mira bien.'}]},
  {id: 'neon', w: 1, need: ['designer'], when: v => v.up.has('neon'), steps: () => [{who: 'designer', pose: 'sit', say: 'Ese neón gasta más luz que nosotros tokens.'}, {who: 'auditor', say: 'Pero motiva.'}]},
  {id: 'fishes', w: 1, need: ['scout'], when: v => v.up.has('aquarium'), steps: v => [{who: 'scout', to: 'aquarium', say: 'El naranja se llama ' + (v.best?.symbol || 'Alquiler') + '.'}, {who: 'risk', say: 'No le pongas nombre, que luego hay que venderlo.'}]},
  {id: 'pausados', w: 3, need: ['scout'], when: v => IDS.some(id => v.ag(id).paused), steps: v => { const p = IDS.find(id => v.ag(id).paused); return [{who: p === 'scout' ? 'analyst' : 'scout', pose: 'sit', say: NAME[p] + ' está en pausa. ¿Vacaciones pagadas?'}, {who: 'designer', say: 'Pagadas no. Aquí nada es pagado.'}]; }},
  {id: 'friday', w: 2, need: ['operator', 'designer'], when: v => v.S.weekday === 5 && v.S.hour >= 16, steps: () => [{who: 'operator', say: 'Viernes. ¿Cañas?'}, {who: 'designer', say: 'Cañas ficticias, como el capital.'}]},
  {id: 'monday', w: 2, need: ['scout', 'risk'], when: v => v.S.weekday === 1 && v.S.hour < 13, steps: () => [{who: 'scout', say: '¡Lunes! ¡Semana nueva, ideas nuevas!'}, {who: 'risk', say: 'Baja el volumen hasta las doce.'}]},
  {id: 'lunch', w: 2, need: ['analyst', 'scout'], when: v => v.S.hour >= 13.5 && v.S.hour < 15, steps: () => [{who: 'analyst', pose: 'sit', say: 'Tupper de lentejas. Rentabilidad asegurada.'}, {who: 'scout', say: 'Yo he pedido sushi a cuenta del bonus.'}, {who: 'analyst', say: '¿Qué bonus?'}]},
  {id: 'late', w: 2, need: ['operator', 'auditor'], when: v => v.S.hour >= 20 && v.S.marketOpen, steps: () => [{who: 'auditor', say: 'En Nueva York es media tarde. Aquí no.'}, {who: 'operator', say: 'El alquiler no entiende de husos.'}]},
  {id: 'months', w: 2, need: ['auditor'], when: v => v.life.monthsMissed > 0, steps: v => [{who: 'auditor', pose: 'sit', say: 'Ya fallamos ' + plural(v.life.monthsMissed, 'mes', 'meses') + '. Este no.'}, {who: 'operator', say: 'Este no.'}]},
  {id: 'boss', w: 2, need: ['scout', 'risk'], when: v => v.S.bossNear, steps: () => [{who: 'scout', say: '¿Tú crees que nos oye?'}, {who: 'risk', say: 'Lleva gafas de sol dentro. Nos oye seguro.'}]}
];
export function pickGag(S, free, seen = new Map(), now = 0, rnd = Math.random) {
  const v = view(S), ok = GAGS.filter(g => g.need.every(id => free.includes(id)) && (!seen.has(g.id) || now - seen.get(g.id) > 240) && safe(() => g.when(v)));
  if (!ok.length) return null;
  let r = rnd() * ok.reduce((n, g) => n + g.w, 0); const g = ok.find(g => (r -= g.w) < 0) || ok[0];
  const steps = g.steps(v).filter(s => free.includes(s.who));
  return steps.length ? {id: g.id, steps} : null;
}
const safe = f => { try { return !!f(); } catch { return false; } };
export const GAG_IDS = GAGS.map(g => g.id);

// ---- pantalla de la sala cuando está libre: datos reales en bucle ----
export function slides(S) {
  const v = view(S), out = [['SALA LIBRE', 'E PARA CONVOCAR', 'dim']];
  out.push(v.traded ? ['DIAS SIN OPERAR', String(v.idle), v.idle >= 3 ? 'bad' : 'ok'] : ['OPERACIONES', 'NINGUNA AUN', 'warn']);
  if (v.life.streak?.n >= 2) out.push(['RACHA', v.life.streak.n + (v.life.streak.kind === 'win' ? ' GANANDO' : ' PERDIENDO'), v.life.streak.kind === 'win' ? 'ok' : 'bad']);
  if (v.st('risk').vetoes) out.push(['VETOS DE MARIA', String(v.st('risk').vetoes), 'warn']);
  if (v.st('scout').pitches) out.push(['IDEAS DE SANTI', String(v.st('scout').pitches), 'ok']);
  if (v.life.best?.pnl > 0) out.push(['MEJOR DEL MES', v.life.best.symbol + ' ' + sgn(v.life.best.pnl), 'ok']);
  if (v.life.lastStop) out.push(['ULTIMO STOP', v.life.lastStop.symbol + ' ' + sgn(v.life.lastStop.pnl), 'bad']);
  if (v.life.worst && v.life.worst.pnl < 0 && v.life.worst.symbol !== v.life.lastStop?.symbol) out.push(['PEOR DEL MES', v.life.worst.symbol + ' ' + sgn(v.life.worst.pnl), 'bad']);
  out.push(v.paid ? ['ALQUILER', 'PAGADO', 'ok'] : ['FALTAN', Math.round(v.missing) + '€ EN ' + v.days + 'D', v.mood === 'panic' ? 'bad' : 'warn']);
  if (v.life.monthsPaid || v.life.monthsMissed) out.push(['MESES', (v.life.monthsPaid || 0) + ' PAGADOS ' + (v.life.monthsMissed || 0) + ' NO', 'dim']);
  return out;
}
const sgn = n => (n >= 0 ? '+' : '-') + Math.abs(Math.round(n)) + '€';

// ---- cosas de la oficina que César puede tocar ----
export function objectLine(kind, S, n = 1, rnd = Math.random) {
  const v = view(S);
  switch (kind) {
    case 'coffee': return n >= 4 ? 'Café número ' + n + '. Te tiembla el pulso, jefe.' : pick([(S.monthPnl || 0) < 0 ? 'Café solo. Negro, como el mes.' : 'Café. Sabe a ' + eur(S.monthPnl) + ' de beneficio.', v.up.has('cafetera') ? 'La cafetera buena. Se nota la inversión.' : 'Café de máquina. Carácter tiene.', 'Un café y a mirar cómo trabajan.'], rnd);
    case 'fridge': return pick([v.paid ? 'Hay una botella de cava. Alguien confiaba.' : v.mood === 'panic' ? 'Queda hielo. Y poco.' : 'Un yogur con el nombre de Pedro. Y la fecha. Y un stop.', 'Un tupper de María con una nota: «NO».', 'Medio limón. Lleva aquí más que la estrategia.'], rnd);
    case 'tank': return 'Tokens: ' + eur2(S.tokensEur) + ' (' + v.tokensPct + ' %) para ' + plural(v.days, 'día', 'días') + '. Salen ' + eur2(v.tokPerDay) + ' al día.';
    case 'mood': return 'Ánimo: ' + ({joy: 'eufóricos', calm: 'tranquilos', tense: 'tensos', panic: 'agobiados'}[v.mood]) + '. ' + (v.paid ? 'Alquiler pagado con ' + eur(S.monthPnl) + '.' : 'Llevan ' + eur(S.monthPnl) + ' de ' + eur(S.rentTarget) + ' y quedan ' + plural(v.days, 'día', 'días') + '.');
    case 'aquarium': return pick(['Los peces comen y no gastan tokens. Empleados modelo.', 'El naranja te mira como María mira un plan.'], rnd);
    case 'cat': return pick(['Ronronea. Es el único que no pregunta por el alquiler.', 'Se deja. Hoy está generoso.', v.mood === 'panic' ? 'El gato está tranquilo. Él sabrá.' : 'Te ignora con mucho cariño.'], rnd);
    case 'bell': return v.life.streak?.kind === 'win' ? '¡DING! ' + plural(v.life.streak.n, 'cierre ganador', 'cierres ganadores') + ' seguidos.' : '¡DING! …Nadie ha ganado nada todavía.';
    case 'darts': { const pts = [1, 5, 20, 25, 50, 0][Math.floor(rnd() * 6)]; return pts === 0 ? 'A la pared. Como la última idea.' : pts === 50 ? '¡Diana! 50 puntos.' + (v.life.worst ? ' Dedicada a ' + v.life.worst.symbol + '.' : '') : pts + ' puntos.'; }
    case 'sofa': return 'Un minuto de sofá. Desde aquí se les ve trabajar.';
    case 'shelf': return 'El diario de la oficina. Lo tienes abajo.';
    case 'plant': return v.mood === 'panic' ? 'La planta está mustia. Como el mes.' : 'La planta está bien. Alguien la riega.';
  }
  return '';
}

// ---- César sale por la puerta ----
export function bossAway(S, rnd = Math.random) {
  const v = view(S);
  if (v.mood === 'panic') return {party: false, lines: [{who: 'operator', text: '¿Se ha ido? Da igual. No estamos para fiestas.'}, {who: 'designer', text: 'Faltan ' + eur(v.missing) + '. Seguimos.'}], back: [{who: 'auditor', text: 'Aquí seguimos, jefe.'}]};
  return {party: true, lines: [{who: 'scout', text: '¿Se ha ido el jefe?'}, {who: 'operator', text: '¡Se ha ido!'}, {who: 'risk', text: 'Cinco minutos. Los cronometro.'}], back: [{who: 'scout', text: '¡Que vuelve, que vuelve!'}, {who: pick(['analyst', 'designer'], rnd), text: 'Aquí, trabajando. Como siempre.'}]};
}

export function arcadeVerdict(score, record, S) {
  const v = view(S), yari = 12 + (v.st('operator').buys || 0) * 2 + (v.st('operator').sells || 0);
  const head = 'STONKS: ' + pc(score) + (score > record ? ' · ¡récord tuyo!' : ' · tu récord: ' + pc(Math.max(record, score)));
  return {toast: head, who: 'operator', text: score > yari ? 'Vale, ' + pc(score) + '. Ahora hazlo con el alquiler encima.' : score > 0 ? pc(score) + '. Mi récord es ' + pc(yari) + ', por si preguntas.' : 'Has perdido dinero en un videojuego, jefe.'};
}

export const KEYS = [['WASD / flechas', 'mover a César'], ['E', 'usar lo que tengas delante o hablar'], ['Espacio', 'saludar o arengar al equipo'], ['F', 'chocar los cinco'], ['1–6', 'llamar a Santi, Pedro, María, Yari, Augusto o Cadaqui'], ['H', 'esta ayuda'], ['Clic / toque', 'ir a un sitio, usar un objeto o abrir la ficha de alguien']];

// ---- charla sobre lo último que ha pasado de verdad (S.recent = últimos eventos del motor) ----
export function recentPair(a, b, S, rnd = Math.random) {
  const ev = (S.recent || []).filter(e => (e.from || e.agent) === a || e.to === a).slice(-3); if (!ev.length || rnd() < .3) return null;
  const e = pick(ev, rnd), sym = e.symbol || '', mine = (e.from || e.agent) === a, other = NAME[mine ? e.to : e.from] || '';
  if (e.type === 'trade') return e.side === 'buy' ? ['Ya estamos dentro de ' + sym + '.', b === 'risk' ? '¿Y el stop dónde está?' : 'A ver si esta sí.'] : [sym + ' cerrada: ' + eur(e.pnl) + '.', e.pnl >= 0 ? 'Una menos para el alquiler.' : 'Apuntada. Siguiente.'];
  if (e.type === 'strategy') return ['He cambiado ' + (e.label || 'las reglas') + ': ahora ' + clip(e.value, 28) + '.', pick(['Otra vez. Vale.', 'A ver cuánto dura.', 'Me lo apunto.'], rnd)];
  if (e.type === 'research' && sym) return ['He estado mirando ' + sym + ' a fondo.', '¿Y? ¿Hay algo o es humo?'];
  if (e.type === 'handoff' && sym) {
    if (e.tone === 'veto') return mine ? ['He vetado ' + sym + '. Tenía que hacerlo.', b === e.to ? 'Ya. Era mía.' : 'Qué novedad.'] : ['Me han vetado ' + sym + '.', 'Vuelve con menos riesgo.'];
    return mine ? ['Le he pasado ' + sym + ' a ' + other + '.', b === e.to ? 'La tengo en la mesa. Dame un rato.' : 'A ver qué hace ' + other + ' con ella.'] : ['Tengo ' + sym + ' encima de la mesa, de ' + other + '.', b === e.from ? '¿Y qué te parece?' : 'Pues no la dejes enfriar.'];
  }
  if (e.type === 'handoff' && e.text) return mine ? ['Le he dicho a ' + other + ': «' + clip(e.text, 60) + '»', 'Claro y directo.'] : null;
  return null;
}
