// Carlitos, the dachshund César and María look after together while they live apart: he lives in the flat in Germany
// where they will live together for the first time, gets it ready for them and carries notes from one to the other. Nothing about him is stored but what the two of them
// do with him (cuddles, treats, purchases, notes): everything else (how fed he is, his level, his tricks, the
// weekly event, the surprises) is worked out again from both training logs, so both apps always see the same dog.
// He never dies or falls ill: the worst that can happen is that he misses them.
import { NOT_A_SET, WALK, monday, number, shift, walkKm } from './rivalry.js';

export const NAMES = { cesar: 'Cesarlópodo', maria: 'Marialópoda' };
const WHO = ['cesar', 'maria'];
const LEG = /pierna|gl[uú]te|cu[aá]dri|femoral|isquio|gemel|sentadilla|hip thrust|leg |leg$|prensa|hacka|zancada|b[uú]lgara|abduct|aduct|peso muerto|deadlift|step/i;

// ---------- What he can learn, wear and play with ----------
export const TRICKS = [
  { id: 'sentarse', name: 'Sentarse', level: 2 }, { id: 'pata', name: 'Dar la patita', level: 3 },
  { id: 'rodar', name: 'Rodar', level: 5 }, { id: 'muerto', name: 'Hacerse el muerto', level: 7 },
  { id: 'bailar', name: 'Bailar', level: 9 }, { id: 'saltar', name: 'Saltar', level: 11 },
  { id: 'choca', name: 'Chocar esos cinco', level: 13 }, { id: 'pesa', name: 'Levantar su mancuerna', level: 15 },
  { id: 'aullar', name: 'Cantar', level: 17 }, { id: 'pino', name: 'Hacer el pino', level: 20 }
];
// slot: only one thing per slot at a time. price: in bones; gift: only comes with an event or a season.
export const WARDROBE = [
  { id: 'collar', name: 'Collar rojo', slot: 'cuello', price: 0 },
  { id: 'panuelo', name: 'Pañuelo rosa', slot: 'cuello', price: 30 },
  { id: 'pajarita', name: 'Pajarita', slot: 'cuello', price: 35 },
  { id: 'gorro', name: 'Gorro de lana', slot: 'cabeza', price: 40 },
  { id: 'gafas', name: 'Gafas de sol', slot: 'ojos', price: 50 },
  { id: 'cinta', name: 'Cinta de gimnasio', slot: 'cabeza', price: 55 },
  { id: 'gafitas', name: 'Gafas de empollón', slot: 'ojos', price: 60 },
  { id: 'capa', name: 'Capa de superhéroe', slot: 'cuerpo', price: 100 },
  { id: 'chubasquero', name: 'Chubasquero amarillo', slot: 'cuerpo', price: 90 },
  { id: 'corona', name: 'Corona', slot: 'cabeza', price: 150 },
  { id: 'reno', name: 'Cuernos de reno', slot: 'cabeza', price: 25, season: 'navidad' },
  { id: 'jersey', name: 'Jersey navideño', slot: 'cuerpo', gift: 'navidad' },
  { id: 'mago', name: 'Sombrero de mago', slot: 'cabeza', gift: 'halloween' },
  { id: 'corazones', name: 'Pañuelo de corazones', slot: 'cuello', gift: 'sanvalentin' },
  { id: 'flotador', name: 'Flotador de pato', slot: 'cuerpo', gift: 'verano' },
  { id: 'fiesta', name: 'Gorro de cumpleaños', slot: 'cabeza', gift: 'cumple' },
  { id: 'medalla', name: 'Medalla de campeón', slot: 'cuello', gift: 'racha' }
];
export const TOYS = [
  { id: 'hueso', name: 'Hueso de goma' }, { id: 'pelota', name: 'Pelota' },
  { id: 'oruga', name: 'Oruga de peluche' }, { id: 'mancuerna', name: 'Mancuerna de juguete' }, { id: 'calcetin', name: 'Calcetín robado' }
];
export const TREAT_COST = 4;
const LIMITS = { mimo: 3, golosina: 2, jugar: 2 };

// ---------- What brings them closer: one tap a day for each thing done ----------
// María practises English and moves her job search forward; César practises German and gets the flat ready.
export const STEPS = {
  ingles: { who: 'maria', points: 1, icon: '🇬🇧', text: '{n} ha practicado inglés. Carlitos dice «good girl» con acento salchicha.' },
  trabajo: { who: 'maria', points: 1, icon: '💼', text: '{n} ha dado un paso más en su búsqueda de trabajo en Alemania. Carlitos le guarda el sitio en el sofá.' },
  entrevista: { who: 'maria', points: 3, icon: '🤝', text: '¡{n} tiene una entrevista! Carlitos ha cruzado las patas (las cuatro, que para eso son cortas).' },
  aleman: { who: 'cesar', points: 1, icon: '🇩🇪', text: '{n} ha practicado alemán. Carlitos ya sabe decir «Wurst».' },
  casa: { who: 'cesar', points: 1, icon: '🏠', text: '{n} ha avanzado con la casa de Alemania. Carlitos lo ha supervisado todo.' }
};
// The flat in Germany fills up as they look after Carlitos and each other.
export const HOME = [
  { at: 0, id: 'llaves', name: 'Las llaves', icon: '🔑' }, { at: 3, id: 'cama', name: 'La cama de Carlitos', icon: '🧺' },
  { at: 7, id: 'sofa', name: 'Un sofá para dos', icon: '🛋️' }, { at: 12, id: 'lampara', name: 'Una lámpara cálida', icon: '💡' },
  { at: 18, id: 'girasoles', name: 'Girasoles en la ventana', icon: '🌻' }, { at: 25, id: 'libros', name: 'Libros de inglés y de alemán', icon: '📚' },
  { at: 33, id: 'cafetera', name: 'Una cafetera para dos', icon: '☕' }, { at: 42, id: 'mesa', name: 'Una mesa para cenar juntos', icon: '🍽️' },
  { at: 52, id: 'pesas', name: 'Un rincón de pesas', icon: '🏋️' }, { at: 63, id: 'plantas', name: 'Plantas', icon: '🪴' },
  { at: 75, id: 'cuadro', name: 'Una foto vuestra en la pared', icon: '🖼️' }, { at: 88, id: 'manta', name: 'Una manta para las pelis', icon: '🧣' },
  { at: 102, id: 'banderas', name: 'Una bandera de España y otra de Alemania', icon: '🇪🇸' }, { at: 118, id: 'cartel', name: 'Un cartel: «Willkommen zu Hause, Marialópoda»', icon: '🎉' }
];

// ---------- Weekly events: one each week, the same for both, in a fixed rotation ----------
// Every goal is shared: what one does counts for the two.
const EVENTS = [
  { id: 'pelota', title: 'Semana de la pelota', text: 'Carlitos ha visto una pelota en el parque. Si entre los dos entrenáis 6 veces, es suya.', toy: 'pelota', goal: w => [w.sessions, 6, 'entrenos'] },
  { id: 'piernas', title: 'Semana de patas cortas', text: 'Carlitos quiere ver piernas fuertes, como las suyas. 3 entrenos de pierna entre los dos.', goal: w => [w.legs, 3, 'entrenos de pierna'] },
  { id: 'paseo', title: 'Semana de paseos', text: 'A Carlitos le encanta pasear: 8 km de caminadora entre los dos.', goal: w => [w.km, 8, 'km'] },
  { id: 'equipo', title: 'Semana en equipo', text: 'Carlitos quiere veros entrenar el mismo día. Con una vez basta.', goal: w => [w.together, 1, 'días juntos'] },
  { id: 'oruga', title: 'Semana de la oruga', text: 'Hay una oruga de peluche en la tienda. Entrenad entre los dos 4 días distintos.', toy: 'oruga', goal: w => [w.days, 4, 'días'] },
  { id: 'toneladas', title: 'Semana tonelada', text: 'Carlitos quiere presumir: mover entre los dos más peso que vuestra media.', goal: w => [w.tonnage, Math.max(5000, w.average * 1.05), 'kg'] },
  { id: 'mancuerna', title: 'Semana de la mancuerna', text: 'Carlitos ha visto una mancuerna de su tamaño. Cada uno tiene que entrenar dos veces.', toy: 'mancuerna', goal: w => [Math.min(w.each.cesar, 2) + Math.min(w.each.maria, 2), 4, 'entrenos'] },
  { id: 'calcetin', title: 'Semana del calcetín', text: 'Carlitos ha escondido un calcetín. Lo devuelve si entrenáis los dos antes del jueves.', toy: 'calcetin', goal: w => [Math.min(w.early.cesar, 1) + Math.min(w.early.maria, 1), 2, 'entrenos antes del jueves'] }
];
const EPOCH = '2026-01-05'; // a Monday: week 0 of the rotation
const weekIndex = iso => Math.round((Date.parse(`${monday(iso)}T12:00:00Z`) - Date.parse(`${EPOCH}T12:00:00Z`)) / (7 * 864e5));
export const eventOf = iso => EVENTS[((weekIndex(iso) % EVENTS.length) + EVENTS.length) % EVENTS.length];

// ---------- Seasons ----------
export function seasonOf(iso, born) {
  const md = iso.slice(5);
  if (born && md === born.slice(5) && iso > born) return { id: 'cumple', title: 'Cumpleaños de Carlitos', gift: 'fiesta' };
  if (md >= '12-15' || md <= '01-06') return { id: 'navidad', title: 'Navidad', gift: 'jersey' };
  if (md >= '10-24' && md <= '11-01') return { id: 'halloween', title: 'Halloween', gift: 'mago' };
  if (md >= '02-07' && md <= '02-14') return { id: 'sanvalentin', title: 'San Valentín', gift: 'corazones' };
  if (md >= '07-01' && md <= '08-31') return { id: 'verano', title: 'Verano', gift: 'flotador' };
  if (md === '08-25') return { id: 'cumpleMaria', title: 'Cumpleaños de Marialópoda' };
  return null;
}

// ---------- Surprises: some sessions bring one, always the same for that day and person ----------
const SURPRISES = [
  [0, '{n} ha vuelto del gimnasio y Carlitos le ha olido las zapatillas durante diez minutos. Aprobadas.'],
  [1, 'Carlitos ha encontrado un hueso enterrado mientras {n} entrenaba.'],
  [0, 'Carlitos ha intentado imitar a {n} haciendo sentadillas. Se ha quedado dormido a mitad.'],
  [2, 'Carlitos ha cavado en el jardín y ha encontrado dos huesitos. Dice que son por el entreno de {n}.'],
  [0, 'Carlitos ha esperado a {n} en la puerta moviendo la cola tan fuerte que se ha caído.'],
  [1, 'Carlitos ha robado un calcetín de {n} y lo ha cambiado por un huesito.'],
  [0, 'Carlitos ha soñado que levantaba una barra. Movía las patas sin parar.'],
  [0, 'Carlitos ha ladrado a la báscula. No le gusta que nadie juzgue a {n}.'],
  [1, 'Carlitos ha olido a {n} y ha decidido que hoy huele a campeón. Un huesito de premio.'],
  [0, 'Carlitos se ha subido al sofá a esperar a {n}. Sabe que no puede. Le da igual.'],
  [0, 'Carlitos ha escondido la toalla de {n} en su cama. Dice que así huele a esfuerzo.'],
  [3, '¡Carlitos ha encontrado un tesoro en el parque! Tres huesitos, gracias al entreno de {n}.'],
  [0, 'Carlitos ha aprendido a contar series. Cuenta hasta dos y luego se aburre.'],
  [0, 'Carlitos ha mordido una mancuerna de {n}. Ha perdido.'],
  [1, 'Carlitos ha acompañado a {n} hasta la esquina y ha vuelto con un huesito que nadie sabe de dónde ha salido.'],
  [0, 'Carlitos ha visto a {n} con agujetas y le ha traído su peluche. Es lo que tiene.'],
  [0, 'Carlitos se ha tumbado panza arriba al ver llegar a {n}. Es su forma de decir que está orgulloso.'],
  [2, 'Carlitos ha ganado un concurso de perros salchicha del barrio. Dice que fue gracias a {n}.']
];
const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
export const goldenDay = iso => hash(`oro${iso}`) % 45 === 0;

// ---------- Level ----------
export const xpFor = level => 60 * (level - 1) * level / 2; // level 2 at 60, 5 at 600, 10 at 2.700, 20 at 11.400
export const levelOf = xp => { let n = 1; while (xp >= xpFor(n + 1)) n++; return n; };
export const stageOf = level => (level < 4 ? 'cachorro' : level < 10 ? 'joven' : level < 20 ? 'adulto' : 'leyenda');
export const STAGE_NAMES = { cachorro: 'Cachorro', joven: 'Joven', adulto: 'Adulto', leyenda: 'Leyenda' };
const MILESTONES = [1, 5, 10, 25, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000];

// Rows of either app reduced to what Carlitos needs: per person and day, tonnage, sets, leg work and km walked.
export function activity(rows, c) {
  const days = new Map();
  for (const r of rows || []) {
    const fecha = String(r[c.FECHA] || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || NOT_A_SET.test(r[c.EJ] || '')) continue;
    const d = days.get(fecha) || { kg: 0, sets: 0, legs: false, km: 0 };
    if (WALK.test(r[c.EJ] || '')) d.km += walkKm(r, c);
    else {
      d.sets++;
      d.kg += Math.max(0, (number(r[c.KG]) || 0) * (number(r[c.REPS]) || 0));
      if (LEG.test(`${r[c.EJ]} ${r[c.MUSC] || ''}`)) d.legs = true;
    }
    days.set(fecha, d);
  }
  return days;
}
const trained = d => d && d.sets > 0;

// Everything the two apps show. `log` is what is stored: { born, actions: [{ t, d, who, type, ... }], messages: [] }.
export function carlitosState(acts, log, today) {
  const born = log.born || today, out = { today, born, diary: [] };
  const diary = (fecha, icon, text) => out.diary.push({ fecha, icon, text });
  const byDay = new Map();
  for (const a of log.actions || []) { if (!byDay.has(a.d)) byDay.set(a.d, []); byDay.get(a.d).push(a); }
  const owned = new Set(['collar', 'hueso']);
  let homePoints = 0, homeIndex = 1, lastNote = '', togetherWeek = '', hunger = 80, love = 70, xp = 0, bones = 6, tonnage = 0, milestone = 0, streak = 0, best = 0, level = 1;
  const usedToday = { cesar: {}, maria: {} };
  diary(born, '🐶', 'Ha llegado Carlitos. Es un cachorro de perro salchicha y os ha elegido a los dos. Vive en vuestra futura casa de Alemania, va y viene con notas en el collar y os espera a los dos.');
  const notesByDay = new Map();
  for (const m of log.messages || []) notesByDay.set(m.d, (notesByDay.get(m.d) || 0) + 1);
  const visits = new Set((log.visits || []).map(v => v.fecha));

  for (let day = born; day <= today; day = shift(day, 1)) {
    const mon = monday(day), isMonday = day === mon, is = { cesar: acts.cesar.get(day), maria: acts.maria.get(day) };
    // A new week: was the last one looked after by both? And the event of the week that ends.
    if (isMonday && day > born) {
      const prev = shift(day, -7), w = weekStats(acts, prev, shift(day, -1));
      if (prev >= monday(born)) {
        if (w.each.cesar && w.each.maria) {
          streak++; xp += 30; bones += 5; homePoints += 3;
          diary(shift(day, -1), '💞', streak === 1 ? 'Semana cuidada: habéis entrenado los dos. Carlitos duerme feliz.' : `Semana cuidada: ${streak} seguidas. Carlitos no recuerda haber sido tan feliz.`);
          if (streak === 8 && !owned.has('medalla')) { owned.add('medalla'); diary(shift(day, -1), '🏅', 'Dos meses seguidos bien cuidado: Carlitos estrena su medalla de campeón.'); }
        } else if (streak) { diary(shift(day, -1), '🥺', `${!w.each.cesar && !w.each.maria ? 'Nadie ha entrenado' : `${NAMES[w.each.cesar ? 'maria' : 'cesar']} no ha entrenado`} esta semana y Carlitos se ha quedado mirando la puerta. Empieza otra racha.`); streak = 0; }
        best = Math.max(best, streak);
        const ev = eventOf(prev), [have, need] = ev.goal({ ...w, average: averageTonnage(acts, prev) });
        if (have >= need) {
          xp += 40; homePoints += 2;
          if (ev.toy && !owned.has(ev.toy)) { owned.add(ev.toy); diary(shift(day, -1), '🎁', `${ev.title} superada: Carlitos ya tiene su ${TOYS.find(t => t.id === ev.toy).name.toLowerCase()}.`); }
          else { bones += 8; diary(shift(day, -1), '🎉', `${ev.title} superada. Ocho huesitos para Carlitos.`); }
        }
      }
    }
    hunger = Math.max(10, hunger - 25); love = Math.max(0, love - 10);
    const season = seasonOf(day, born), gold = goldenDay(day);
    for (const who of WHO) {
      const d = is[who];
      if (trained(d)) {
        hunger = Math.min(100, hunger + 25); love = Math.min(100, love + 4); bones += 2;
        const kg = d.kg;
        xp += 10 + Math.min(30, Math.round(kg / 1000 * 2)); tonnage += kg;
        if (gold) { bones += 5; diary(day, '✨', `Día dorado: Carlitos brillaba y ${NAMES[who]} ha entrenado. Cinco huesitos extra.`); }
        const h = hash(`${who}${day}`);
        if (h % 100 < 24) { const [b, text] = SURPRISES[(h >>> 8) % SURPRISES.length]; bones += b; diary(day, b ? '🦴' : '🐾', text.replace('{n}', NAMES[who])); }
        if (season?.gift && !owned.has(season.gift)) {
          owned.add(season.gift);
          diary(day, '🎁', season.id === 'cumple' ? `¡Cumpleaños de Carlitos! ${NAMES[who]} ha entrenado y le ha regalado un gorro de fiesta.` : `${season.title}: ${NAMES[who]} ha entrenado y Carlitos estrena ${WARDROBE.find(x => x.id === season.gift).name.toLowerCase()}.`);
        }
      }
      if (d && d.km >= 1) { hunger = Math.min(100, hunger + 8); xp += Math.min(10, Math.round(d.km * 2)); if (d.km >= 3) bones += 1; }
    }
    if (trained(is.cesar) && trained(is.maria)) {
      love = Math.min(100, love + 10);
      if (togetherWeek !== mon) { togetherWeek = mon; diary(day, '👟', 'Hoy habéis entrenado los dos. Carlitos ha dado tres vueltas sobre sí mismo.'); }
    }
    while (milestone < MILESTONES.length && tonnage >= MILESTONES[milestone] * 1000) {
      const t = MILESTONES[milestone++];
      diary(day, '🏋️', `Entre los dos ya habéis levantado ${t.toLocaleString('de-DE')} t desde que llegó Carlitos: lo que pesan ${Math.round(t * 1000 / 9).toLocaleString('de-DE')} carlitos.`);
    }
    // What the two of them did with him that day.
    const used = { cesar: {}, maria: {} };
    for (const a of byDay.get(day) || []) {
      const u = used[a.who];
      if (!u) continue;
      if (a.type === 'mimo' || a.type === 'jugar' || a.type === 'golosina') {
        u[a.type] = (u[a.type] || 0) + 1;
        if (u[a.type] > LIMITS[a.type]) continue;
        if (a.type === 'mimo') { love = Math.min(100, love + 7); xp += 1; }
        if (a.type === 'jugar') { love = Math.min(100, love + 6); hunger = Math.max(10, hunger - 3); xp += 2; }
        if (a.type === 'golosina' && bones >= TREAT_COST) { bones -= TREAT_COST; love = Math.min(100, love + 12); hunger = Math.min(100, hunger + 10); }
      } else if (a.type === 'comprar') {
        const item = WARDROBE.find(x => x.id === a.item);
        if (item && !owned.has(item.id) && item.price !== undefined && bones >= item.price && (!item.season || seasonOf(day, born)?.id === item.season)) {
          bones -= item.price; owned.add(item.id); diary(day, '🛍️', `${NAMES[a.who]} le ha comprado a Carlitos: ${item.name.toLowerCase()}.`);
        }
      } else if (a.type === 'paso' && STEPS[a.kind]) {
        u[a.kind] = (u[a.kind] || 0) + 1;
        if (u[a.kind] > 1) continue;
        const st = STEPS[a.kind];
        love = Math.min(100, love + 6); bones += 2; xp += 5; homePoints += st.points;
        diary(day, st.icon, st.text.replace('{n}', NAMES[a.who]));
      } else if (a.type === 'vale') diary(day, '🎟️', `Carlitos le ha traído un vale a ${NAMES[a.who]}: ${a.text}`);
      else if (a.type === 'canjear') diary(day, '✅', `Vale canjeado: ${a.text}`);
    }
    for (const who of WHO) if (used[who].mimo) diary(day, '💗', `${NAMES[who]} le ha dado mimos a Carlitos.`);
    // A note sent on a day counts once for the flat; a visit is the best day of all.
    if (notesByDay.get(day) && lastNote !== day) { lastNote = day; homePoints += 1; }
    if (visits.has(day)) { love = 100; xp += 30; homePoints += 5; diary(day, '🫶', '¡Hoy os veis! Carlitos no ha podido dormir de los nervios. Disfrutad muchísimo.'); }
    while (homeIndex < HOME.length && homePoints >= HOME[homeIndex].at) {
      const h = HOME[homeIndex++];
      diary(day, h.icon, h.id === 'cartel' ? 'La casa de Alemania ya está lista: Carlitos ha colgado un cartel que dice «Willkommen zu Hause, Marialópoda». Solo faltas tú.' : `Vuestra casa de Alemania tiene algo nuevo: ${h.name.toLowerCase()}. Carlitos lo ha olido todo.`);
    }
    if (day === today) Object.assign(usedToday, used);
    const now = levelOf(xp);
    while (level < now) {
      level++; bones += 5;
      const trick = TRICKS.find(t => t.level === level), stage = stageOf(level) !== stageOf(level - 1) ? stageOf(level) : null;
      diary(day, '⭐', `Carlitos sube a nivel ${level}.${trick ? ` Ha aprendido un truco nuevo: ${trick.name.toLowerCase()}.` : ''}${stage ? ` Ya no es un cachorro: ahora es ${STAGE_NAMES[stage].toLowerCase()}.`.replace('Ya no es un cachorro: ahora es leyenda', 'Ya es una leyenda') : ''}`);
    }
  }

  const week = weekStats(acts, monday(today), today), ev = eventOf(today), [have, need, unit] = ev.goal({ ...week, average: averageTonnage(acts, monday(today)) });
  const worn = wornNow(log, owned);
  const mood = (hunger + love) / 2 - (week.each.cesar && week.each.maria ? 0 : (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7 >= 4 ? 10 : 0);
  Object.assign(out, {
    level, stage: stageOf(level), stageName: STAGE_NAMES[stageOf(level)], progress: (xp - xpFor(level)) / (xpFor(level + 1) - xpFor(level)),
    hunger: Math.round(hunger), love: Math.round(love), bones, mood: mood >= 75 ? 'feliz' : mood >= 50 ? 'contento' : mood >= 30 ? 'echa' : 'triste',
    week: { cesar: week.each.cesar > 0, maria: week.each.maria > 0 }, streak, bestStreak: Math.max(best, streak),
    tonnage: Math.round(tonnage), golden: goldenDay(today), season: seasonOf(today, born),
    event: { id: ev.id, title: ev.title, text: ev.text, progress: Math.min(1, have / need), done: have >= need, left: Math.max(0, Math.ceil(need - have)), unit, toy: ev.toy && !owned.has(ev.toy) ? ev.toy : null },
    tricks: TRICKS.map(t => ({ ...t, learned: level >= t.level })),
    wardrobe: WARDROBE.map(x => ({ ...x, owned: owned.has(x.id), worn: worn.includes(x.id), buyable: !owned.has(x.id) && x.price !== undefined && (!x.season || out.season?.id === x.season) })),
    toys: TOYS.filter(t => owned.has(t.id)), worn,
    left: Object.fromEntries(WHO.map(w => [w, Object.fromEntries([...Object.entries(LIMITS), ...Object.keys(STEPS).map(k => [k, 1])].map(([k, n]) => [k, Math.max(0, n - (usedToday[w][k] || 0))]))])),
    home: { items: HOME.slice(0, homeIndex), next: HOME[homeIndex] || null, progress: HOME[homeIndex] ? (homePoints - HOME[homeIndex - 1].at) / (HOME[homeIndex].at - HOME[homeIndex - 1].at) : 1 },
    visit: nextVisit(log, today),
    messages: (log.messages || []).slice(-30), vales: (log.vales || []).slice(-40)
  });
  out.diary = out.diary.reverse().slice(0, 60);
  return out;
}

function weekStats(acts, from, to) {
  const w = { sessions: 0, legs: 0, km: 0, days: 0, together: 0, tonnage: 0, each: { cesar: 0, maria: 0 }, early: { cesar: 0, maria: 0 } };
  for (let d = from; d <= to; d = shift(d, 1)) {
    let any = false;
    for (const who of WHO) {
      const x = acts[who].get(d);
      if (!x) continue;
      w.km += x.km;
      if (!trained(x)) continue;
      any = true; w.sessions++; w.each[who]++; w.tonnage += x.kg;
      if (x.legs) w.legs++;
      if (d < shift(from, 3)) w.early[who]++;
    }
    if (any) w.days++;
    if (trained(acts.cesar.get(d)) && trained(acts.maria.get(d))) w.together++;
  }
  w.km = Math.round(w.km * 10) / 10;
  return w;
}
function averageTonnage(acts, mon) {
  let t = 0;
  for (let i = 1; i <= 4; i++) t += weekStats(acts, shift(mon, -7 * i), shift(mon, -7 * i + 6)).tonnage;
  return t / 4;
}
// The next time they see each other, if one of them has set it and it has not passed.
function nextVisit(log, today) {
  const v = (log.visits || []).filter(x => x.fecha >= today).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))[0];
  return v ? { fecha: v.fecha, days: Math.round((Date.parse(`${v.fecha}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 864e5), who: v.who } : null;
}
function wornNow(log, owned) {
  const worn = (log.worn || ['collar']).filter(id => owned.has(id));
  return worn.length || log.worn ? worn : ['collar'];
}

// ---------- What the apps can ask for ----------
const clean = text => String(text || '').replace(/\s+/g, ' ').trim().slice(0, 240);
export function applyAction(log, who, action, today, now = new Date()) {
  if (!WHO.includes(who)) throw new Error('who');
  const next = { ...log, born: log.born || today, actions: [...(log.actions || [])], messages: [...(log.messages || [])], vales: [...(log.vales || [])], visits: [...(log.visits || [])], worn: log.worn ? [...log.worn] : undefined };
  const t = now.toISOString(), type = action?.type;
  if (['mimo', 'jugar', 'golosina'].includes(type)) next.actions.push({ t, d: today, who, type, toy: type === 'jugar' ? clean(action.toy).slice(0, 20) : undefined });
  else if (type === 'comprar') {
    if (!WARDROBE.some(x => x.id === action.item)) throw new Error('item');
    next.actions.push({ t, d: today, who, type, item: action.item });
  } else if (type === 'vestir') {
    const item = WARDROBE.find(x => x.id === action.item);
    if (!item) throw new Error('item');
    const current = (next.worn || ['collar']).filter(id => WARDROBE.find(x => x.id === id)?.slot !== item.slot);
    next.worn = action.quitar ? (next.worn || ['collar']).filter(id => id !== item.id) : [...current, item.id];
  } else if (type === 'mensaje') {
    const text = clean(action.text);
    if (!text) throw new Error('text');
    next.messages.push({ id: `m${Date.now().toString(36)}`, from: who, text, t, d: today, read: false });
  } else if (type === 'leido') {
    next.messages = next.messages.map(m => (m.from !== who && !m.read ? { ...m, read: true } : m));
  } else if (type === 'vale') {
    const text = clean(action.text);
    if (!text) throw new Error('text');
    if (next.vales.some(v => v.who === who && v.d >= shift(today, -6))) throw new Error('vale_semana');
    next.vales.push({ id: `v${Date.now().toString(36)}`, who, text, d: today, used: null });
    next.actions.push({ t, d: today, who, type, text });
  } else if (type === 'paso') {
    const st = STEPS[action.kind];
    if (!st || st.who !== who) throw new Error('type');
    next.actions.push({ t, d: today, who, type, kind: action.kind });
  } else if (type === 'visita') {
    const fecha = String(action.fecha || '');
    if (action.quitar) next.visits = next.visits.filter(v => v.fecha !== fecha);
    else {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha < today || fecha > shift(today, 400)) throw new Error('fecha');
      next.visits = next.visits.filter(v => v.fecha < today).concat({ fecha, who });
    }
  } else if (type === 'canjear') {
    const v = next.vales.find(x => x.id === action.id && !x.used);
    if (!v) throw new Error('vale');
    v.used = today;
    next.actions.push({ t, d: today, who, type, text: v.text });
  } else throw new Error('type');
  // Old cuddles say nothing any more; purchases, vouchers and the rest are kept.
  const from = shift(today, -60);
  next.actions = next.actions.filter(a => a.d >= from || !['mimo', 'jugar', 'golosina'].includes(a.type)).slice(-1500);
  next.messages = next.messages.slice(-200);
  return next;
}
