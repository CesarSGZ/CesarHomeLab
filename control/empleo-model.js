// Empleo: the job search for María (HR / Talent Acquisition near Munich and Ingolstadt). Pure functions, shared by
// the page (control/empleo.js), the API (functions/control/api/empleo/status.js, functions/api/empleo.js) and the
// robot that finds offers (scripts/empleo-buscar.mjs), so every change is applied the same way everywhere.
//   offers  what the robot or Claude found, with a fit score and the reasons behind it
//   apps    every application sent, with what was tried (CV version, channel, message...) and how far it got
//   cvs     the CV versions, so the results can be compared version against version

export const MAX_OFFERS = 3000, MAX_APPS = 2000, MAX_CVS = 40, MAX_RUNS = 60;
const DATE = /^\d{4}-\d{2}-\d{2}$/, TIME = /^([01]\d|2[0-3]):[0-5]\d$/, ID = /^[\w.:-]{1,80}$/;

export const TRACKS = {
  A: 'TA en empresa internacional',
  B: 'Agencia / consultora',
  C: 'HR-tech / payroll España',
  D: 'Remoto España',
};
export const CHANNELS = ['LinkedIn Easy Apply', 'LinkedIn → web empresa', 'Web empresa', 'StepStone', 'Indeed', 'Agencia de Empleo', 'Arbeitnow', 'englishjobs.de', 'Referido', 'Me contactó un recruiter', 'Otro'];
export const LOCATIONS = { madrid: 'Madrid (relocating)', munich: 'Munich / Ingolstadt' };
// How far an application got. Everything after 'rejected' counts as an interview, even if it ended in a no.
export const PHASES = {
  sent: 'Enviada',
  rejected: 'Rechazo sin entrevista',
  screen: 'Llamada de recruiter',
  interview: 'Entrevista',
  final: 'Entrevista final',
  offer: 'Oferta',
};
const INTERVIEW = new Set(['screen', 'interview', 'final', 'offer']);
export const OFFER_STATUS = ['new', 'saved', 'applied', 'discarded'];

export const emptyDoc = () => ({ v: 1, offers: [], apps: [], cvs: [{ id: 'CV-A', date: '', what: 'Versión base en inglés' }], runs: [] });
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const str = (v, max) => String(v ?? '').trim().slice(0, max);
const oneOf = (v, re) => (typeof v === 'string' && re.test(v) ? v : '');
const pick = (v, list, fallback = '') => (list.includes(v) ? v : fallback);
const url = v => (/^https?:\/\/\S+$/i.test(String(v || '').trim()) ? String(v).trim().slice(0, 600) : '');
const int = (v, lo, hi) => { const n = Math.round(Number(v)); return Number.isFinite(n) && v !== '' && v !== null ? Math.max(lo, Math.min(hi, n)) : null; };

export function normOffer(o) {
  if (!o || typeof o !== 'object') throw new Error('invalid_offer');
  const title = str(o.title, 200);
  if (!title) throw new Error('invalid_offer');
  return {
    id: oneOf(o.id, ID) || newId(),
    source: str(o.source, 30) || 'manual',
    ext: str(o.ext, 120),
    title,
    company: str(o.company, 120),
    location: str(o.location, 120),
    url: url(o.url),
    posted: oneOf(o.posted, DATE),
    found: str(o.found, 30),
    lang: pick(o.lang, ['en', 'de', ''], ''),
    german: pick(o.german, ['required', 'plus', 'none', ''], ''),
    spanish: !!o.spanish,
    remote: !!o.remote,
    score: int(o.score, 0, 100) ?? 0,
    reasons: (Array.isArray(o.reasons) ? o.reasons : []).map(r => str(r, 60)).filter(Boolean).slice(0, 8),
    track: pick(o.track, Object.keys(TRACKS), ''),
    status: pick(o.status, OFFER_STATUS, 'new'),
    snippet: str(o.snippet, 600),
    note: str(o.note, 4000),
    letter: str(o.letter, 8000),
    cv: str(o.cv, 20),
  };
}

export function normApp(a) {
  if (!a || typeof a !== 'object') throw new Error('invalid_app');
  const company = str(a.company, 120);
  if (!company) throw new Error('invalid_app');
  return {
    id: oneOf(a.id, ID) || newId(),
    offer: oneOf(a.offer, ID),
    date: oneOf(a.date, DATE),
    time: oneOf(a.time, TIME),
    company,
    title: str(a.title, 200),
    url: url(a.url),
    track: pick(a.track, Object.keys(TRACKS), ''),
    channel: pick(a.channel, CHANNELS, ''),
    cv: str(a.cv, 20),
    location: pick(a.location, Object.keys(LOCATIONS), ''),
    daysPosted: int(a.daysPosted, 0, 365),
    lang: pick(a.lang, ['en', 'de', ''], ''),
    message: !!a.message,
    contact: str(a.contact, 120),
    phase: pick(a.phase, Object.keys(PHASES), 'sent'),
    open: a.open !== false,
    replyDate: oneOf(a.replyDate, DATE),
    followed: oneOf(a.followed, DATE),
    notes: str(a.notes, 4000),
  };
}

const normCv = c => {
  const id = str(c?.id, 20);
  if (!id) throw new Error('invalid_cv');
  return { id, date: oneOf(c.date, DATE), what: str(c.what, 300) };
};
// Same source id, or the same link when one has no id (one added by hand or by Claude). Two robot offers can share a link
// (a company's general careers page) and still be different jobs.
const sameOffer = (a, b) => (a.ext && b.ext ? a.source === b.source && a.ext === b.ext : !!a.url && a.url === b.url);

// The robot runs several times a day and sends everything it sees: an offer already known keeps what was done
// with it (saved, discarded, notes, letter) and only its facts are refreshed.
function addOffers(doc, list) {
  const offers = doc.offers.slice();
  let added = 0;
  for (const raw of Array.isArray(list) ? list : []) {
    const o = normOffer(raw);
    const i = offers.findIndex(x => x.id === o.id || sameOffer(x, o));
    if (i < 0) { offers.unshift(o); added++; continue; }
    const old = offers[i];
    offers[i] = { ...old, ...o, id: old.id, found: old.found || o.found, status: old.status, note: old.note || o.note, letter: old.letter || o.letter, cv: old.cv || o.cv, track: o.track || old.track };
  }
  return { offers: prune(offers), added };
}
// Past the cap, offers saved or applied to are kept; the oldest new and discarded ones go first.
function prune(offers) {
  if (offers.length <= MAX_OFFERS) return offers;
  const keep = offers.filter(o => o.status !== 'discarded' && o.status !== 'new');
  const rest = offers.filter(o => o.status === 'discarded' || o.status === 'new');
  return [...keep, ...rest].slice(0, MAX_OFFERS);
}

export function applyOps(doc, ops) {
  let d = { ...emptyDoc(), ...structuredClone(doc || emptyDoc()) };
  for (const op of Array.isArray(ops) ? ops : []) {
    switch (op?.op) {
      case 'offers.add': { d.offers = addOffers(d, op.offers).offers; break; }
      case 'offer.put': {
        const i = d.offers.findIndex(o => o.id === op.offer?.id);
        const next = normOffer(i < 0 ? op.offer : { ...d.offers[i], ...op.offer });
        if (i < 0) d.offers.unshift(next); else d.offers[i] = next;
        break;
      }
      case 'offer.delete': d.offers = d.offers.filter(o => o.id !== op.id); break;
      case 'app.put': {
        const i = d.apps.findIndex(a => a.id === op.app?.id);
        const next = normApp(i < 0 ? op.app : { ...d.apps[i], ...op.app });
        if (i < 0) d.apps.unshift(next); else d.apps[i] = next;
        if (next.offer) d.offers = d.offers.map(o => (o.id === next.offer ? { ...o, status: 'applied' } : o));
        break;
      }
      case 'app.delete': d.apps = d.apps.filter(a => a.id !== op.id); break;
      case 'cv.put': {
        const c = normCv(op.cv), i = d.cvs.findIndex(x => x.id === c.id);
        if (i < 0) d.cvs.push(c); else d.cvs[i] = c;
        break;
      }
      case 'cv.delete': d.cvs = d.cvs.filter(c => c.id !== op.id); break;
      case 'run.log': {
        const r = op.run || {};
        d.runs = [{ at: str(r.at, 30), source: str(r.source, 30), seen: int(r.seen, 0, 1e6) ?? 0, added: int(r.added, 0, 1e6) ?? 0, error: str(r.error, 200) }, ...d.runs].slice(0, MAX_RUNS);
        break;
      }
      default: throw new Error('invalid_op');
    }
  }
  if (d.apps.length > MAX_APPS) throw new Error('too_many_apps');
  if (d.cvs.length > MAX_CVS) throw new Error('too_many_cvs');
  return d;
}

// ---------- Reading an offer: does it fit María? ----------
// Rules, not magic: each point has a reason shown on the card, so a wrong score is easy to spot and fix.
const HR_TITLE = /\b(talent (acquisition|partner|manag|lead|specialist|sourc|attraction|scout|advisor|consultant)|recruit|recruiting|recruiter|sourcer|talent sourcing|active sourcing|hiring|people (operations|partner|specialist|&|and)|hr\b|human resources|personal(referent|sachbearbeiter|wesen|berater|management|abteilung|recruit)|employer branding|onboarding|payroll|nómina|nominas|candidate)/i;
const TA_TITLE = /\b(talent acquisition|recruit|sourcer|talent sourcing|active sourcing|hiring|employer branding|early careers|university relations|campus)/i;
const HR_GEN_TITLE = /\b(hr generalist|people operations|people partner|hr business partner|hrbp|hr specialist|hr manager|hr operations|hr coordinator|hr consultant|people specialist|onboarding)/i;
const DE_HR_TITLE = /\b(personal(referent|sachbearbeiter|wesen|berater)|lohn|gehalt|entgelt)/i;
const OUT_TITLE = /\b(talent pool|praktik|praktikum|intern(ship)?\b|werkstudent|working student|ausbildung|azubi|trainee|minijob|thesis|abschlussarbeit|volunteer)/i;
const SENIOR_TITLE = /\b(head of|director|vp\b|vice president|chief|leiter|leitung|teamlead|team lead)/i;
const AGENCY = /\b(personalberatung|personaldienstleist|personalvermittlung|zeitarbeit|arbeitnehmerüberlassung|recruitment agency|staffing|headhunt|executive search|hays|randstad|adecco|manpower|michael page|robert walters|gi group)/i;
const PAYROLL_ES = /\b(payroll|nómina|nominas|compensation)\b[\s\S]{0,80}\b(spain|spanish|iberia|españa)|\b(spain|spanish|iberia|españa)\b[\s\S]{0,80}\b(payroll|nómina|nominas)/i;
const HRTECH = /\b(personio|factorial|deel|remote\.com|hibob|workday|sap successfactors|implementation consultant|customer success)/i;
const GERMAN_REQUIRED = /\b(fluent|fluency in|excellent|very good|business[- ]fluent|native|proficient|strong)\b[^.\n]{0,25}\bgerman\b|\bgerman\b[^.\n]{0,20}\b(c1|c2|fluent|native|mandatory|required|is a must|is essential)|\bgerman (and|&) english\b[^.\n]{0,25}\b(fluent|required)|(sehr gute|verhandlungssicher|fließend|fliessend|exzellent)[^.\n]{0,30}deutsch|deutsch[^.\n]{0,25}(verhandlungssicher|fließend|fliessend|c1|c2|muttersprach)/i;
const GERMAN_PLUS = /\bgerman\b[^.\n]{0,30}\b(plus|advantage|nice to have|beneficial|desirable|bonus)|deutsch(kenntnisse)?[^.\n]{0,30}(von vorteil|wünschenswert|ein plus)/i;
const SPANISH = /\b(spanish|spanisch|español|espanol|castellano)\b/i;
const TECH = /\b(engineer(ing|s)?|technical|tech recruit|it recruit|aerospace|aviation|automotive|defen[cs]e|semiconductor|ingenieur)/i;
const EN_WORDS = /\b(the|and|you|your|with|our|for|will|we|are|team|experience|skills)\b/gi;
const DE_WORDS = /\b(und|die|der|das|mit|für|wir|sie|ihre|eine|einen|bei|unser|deine|du)\b/gi;

export function language(text) {
  const t = String(text || '');
  const en = (t.match(EN_WORDS) || []).length, de = (t.match(DE_WORDS) || []).length;
  if (en + de < 6) return /\(m\/w\/d\)|\(w\/m\/d\)/i.test(t) && de >= en ? 'de' : en > de ? 'en' : '';
  return en > de * 1.3 ? 'en' : 'de';
}

export function scoreOffer(o) {
  const title = String(o.title || ''), text = `${title}\n${o.description || ''}`, reasons = [];
  if (OUT_TITLE.test(title) || !HR_TITLE.test(title)) return null;
  let score = 0;
  if (TA_TITLE.test(title)) { score += 45; reasons.push('Selección / TA'); }
  else if (HR_GEN_TITLE.test(title)) { score += 32; reasons.push('HR generalista'); }
  else if (DE_HR_TITLE.test(title)) { score += 8; reasons.push('Puesto de RRHH alemán'); }
  else { score += 22; reasons.push('RRHH'); }
  const lang = o.lang || language(o.description ? o.description : title);
  if (lang === 'en') { score += 22; reasons.push('Oferta en inglés'); }
  else if (lang === 'de') { score -= 25; reasons.push('Oferta en alemán'); }
  let german = '';
  if (GERMAN_REQUIRED.test(text)) { german = 'required'; score -= 30; reasons.push('Pide alemán'); }
  else if (GERMAN_PLUS.test(text)) { german = 'plus'; score -= 3; reasons.push('Alemán: un plus'); }
  else if (o.description) german = 'none';
  const spanish = SPANISH.test(text);
  if (spanish) { score += 15; reasons.push('Valora español'); }
  if (TECH.test(text)) { score += 6; reasons.push('Ingeniería / tech'); }
  if (SENIOR_TITLE.test(title)) { score -= 10; reasons.push('Muy senior'); }
  if (o.remote) { score += 4; reasons.push('Remoto / híbrido'); }
  let track = 'A';
  if (PAYROLL_ES.test(text) || (HRTECH.test(text) && spanish)) { track = 'C'; score += 10; reasons.push('Mercado español'); }
  else if (AGENCY.test(`${text}\n${o.company || ''}`)) track = 'B';
  return { score: Math.max(0, Math.min(100, score + 15)), reasons, lang, german, spanish, track };
}

// ---------- Results: what is working ----------
export const isReply = a => a.phase !== 'sent';
export const isInterview = a => INTERVIEW.has(a.phase);
export const daysBetween = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const freshness = n => (n === null || n === undefined ? '' : n <= 1 ? '0-1 días' : n <= 3 ? '2-3 días' : n <= 7 ? '4-7 días' : '8+ días');
export const hourBand = time => {
  if (!time) return '';
  const h = Number(time.slice(0, 2));
  return h < 12 ? 'Mañana (<12h)' : h < 15 ? 'Mediodía (12-15h)' : h < 19 ? 'Tarde (15-19h)' : 'Noche (19h+)';
};
export const weekday = date => (date ? WEEKDAYS[new Date(date + 'T12:00:00Z').getUTCDay()] : '');

// Follow-up after 7 days without an answer; after 21 it is given up (but still counted).
export function followUp(a, today) {
  if (!a.open || a.phase !== 'sent' || !a.date) return '';
  // Once the follow-up message is sent, it waits 14 more days before giving up.
  if (a.followed) return daysBetween(a.followed, today) >= 14 ? 'lost' : '';
  const n = daysBetween(a.date, today);
  return n >= 21 ? 'lost' : n >= 7 ? 'follow' : '';
}

export const DIMENSIONS = [
  { key: 'cv', label: 'Versión de CV', value: a => a.cv },
  { key: 'track', label: 'Vía', value: a => (a.track ? `${a.track} · ${TRACKS[a.track]}` : '') },
  { key: 'channel', label: 'Canal', value: a => a.channel },
  { key: 'message', label: 'Mensaje al recruiter', value: a => (a.message ? 'Con mensaje' : 'Sin mensaje') },
  { key: 'location', label: 'Ubicación en el CV', value: a => LOCATIONS[a.location] || '' },
  { key: 'fresh', label: 'Antigüedad de la oferta', value: a => freshness(a.daysPosted), order: ['0-1 días', '2-3 días', '4-7 días', '8+ días'] },
  { key: 'lang', label: 'Idioma de la oferta', value: a => ({ en: 'Inglés', de: 'Alemán' }[a.lang] || '') },
  { key: 'weekday', label: 'Día de la semana', value: a => weekday(a.date), order: WEEKDAYS.slice(1).concat(WEEKDAYS[0]) },
  { key: 'hour', label: 'Franja horaria', value: a => hourBand(a.time), order: ['Mañana (<12h)', 'Mediodía (12-15h)', 'Tarde (15-19h)', 'Noche (19h+)'] },
];
export const ENOUGH = 10;

export function groupBy(apps, dim) {
  const map = new Map();
  for (const a of apps) {
    const k = dim.value(a);
    if (!k) continue;
    const g = map.get(k) || { key: k, n: 0, replies: 0, interviews: 0 };
    g.n++; if (isReply(a)) g.replies++; if (isInterview(a)) g.interviews++;
    map.set(k, g);
  }
  const rows = [...map.values()].map(g => ({ ...g, replyRate: g.replies / g.n, interviewRate: g.interviews / g.n, enough: g.n >= ENOUGH }));
  return dim.order ? rows.sort((a, b) => dim.order.indexOf(a.key) - dim.order.indexOf(b.key)) : rows.sort((a, b) => b.n - a.n);
}

export function stats(doc, today) {
  const apps = doc.apps || [];
  const n = apps.length, replies = apps.filter(isReply).length, interviews = apps.filter(isInterview).length;
  const week = apps.filter(a => a.date && daysBetween(a.date, today) >= 0 && daysBetween(a.date, today) < 7).length;
  const times = apps.filter(a => a.date && a.replyDate).map(a => daysBetween(a.date, a.replyDate)).filter(x => x >= 0);
  const funnel = Object.keys(PHASES).map(p => ({ phase: p, label: PHASES[p], n: apps.filter(a => a.phase === p).length }));
  // Applications per week, the last 8 weeks (Monday to Sunday).
  const monday = d => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10); };
  const thisWeek = monday(today);
  const weeks = Array.from({ length: 8 }, (_, i) => { const x = new Date(thisWeek + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() - 7 * (7 - i)); return { start: x.toISOString().slice(0, 10), n: 0, interviews: 0 }; });
  for (const a of apps) { const w = weeks.find(w => a.date && monday(a.date) === w.start); if (w) { w.n++; if (isInterview(a)) w.interviews++; } }
  const groups = DIMENSIONS.map(dim => ({ key: dim.key, label: dim.label, rows: groupBy(apps, dim) }));
  return {
    n, replies, interviews, week,
    replyRate: n ? replies / n : 0, interviewRate: n ? interviews / n : 0,
    avgReplyDays: times.length ? times.reduce((s, x) => s + x, 0) / times.length : null,
    followUps: apps.filter(a => followUp(a, today) === 'follow').length,
    open: apps.filter(a => a.open && a.phase !== 'rejected' && followUp(a, today) !== 'lost').length,
    funnel, weeks, groups, insights: insights(groups),
  };
}

// One line per dimension where two options already have enough data and one clearly gets more interviews.
export function insights(groups) {
  const out = [];
  for (const g of groups) {
    const ready = g.rows.filter(r => r.enough);
    if (ready.length < 2) continue;
    // Interviews decide; if they are level, a clear gap in replies is still worth saying.
    for (const [rate, what, gap] of [['interviewRate', 'entrevistas', 0.05], ['replyRate', 'respuestas', 0.1]]) {
      const sorted = [...ready].sort((a, b) => b[rate] - a[rate]), best = sorted[0], worst = sorted.at(-1);
      if (best[rate] - worst[rate] < gap) continue;
      out.push({ dim: g.label, best: best.key, worst: worst.key, text: `${g.label}: «${best.key}» consigue ${Math.round(best[rate] * 100)} % de ${what} frente a ${Math.round(worst[rate] * 100)} % de «${worst.key}».` });
      break;
    }
  }
  return out;
}

// What Claude reads first through /api/empleo.
export function summary(doc, today) {
  const s = stats(doc, today), byStatus = st => doc.offers.filter(o => o.status === st);
  const lines = [`Empleo a ${today}: ${s.n} candidaturas, ${s.interviews} con entrevista (${Math.round(s.interviewRate * 100)} %), ${s.followUps} follow-ups pendientes.`];
  lines.push('', `# Ofertas nuevas (${byStatus('new').length}), de mejor a peor`);
  for (const o of byStatus('new').sort((a, b) => b.score - a.score).slice(0, 40)) lines.push(`- [${o.score}] ${o.title} · ${o.company} · ${o.location}${o.posted ? ` · ${o.posted}` : ''} · ${o.reasons.join(', ')}${o.letter ? ' · carta lista' : ''} id ${o.id}${o.url ? ` ${o.url}` : ''}`);
  lines.push('', `# Guardadas (${byStatus('saved').length})`);
  for (const o of byStatus('saved')) lines.push(`- [${o.score}] ${o.title} · ${o.company}${o.letter ? ' · carta lista' : ''} id ${o.id}`);
  lines.push('', '# Candidaturas abiertas');
  for (const a of doc.apps.filter(a => a.open)) lines.push(`- ${a.date} ${a.company} · ${a.title} · ${PHASES[a.phase]}${followUp(a, today) === 'follow' ? ' · TOCA FOLLOW-UP' : ''} · ${a.cv || 'sin CV'} id ${a.id}`);
  if (s.insights.length) lines.push('', '# Lo que funciona', ...s.insights.map(i => `- ${i.text}`));
  return lines.join('\n');
}
