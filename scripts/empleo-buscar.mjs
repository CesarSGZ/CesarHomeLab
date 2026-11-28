// Robot de ofertas para Empleo (María: RRHH / Talent Acquisition cerca de Múnich e Ingolstadt).
// Lo lanza .github/workflows/empleo-buscar.yml varias veces al día. Lee dos fuentes abiertas:
//   - la Agencia Federal de Empleo alemana (Jobsuche: casi todas las ofertas de Alemania, con descripción)
//   - Arbeitnow (ofertas en inglés de empresas internacionales en Alemania)
// Cada oferta pasa por scoreOffer (control/empleo-model.js): si no es de RRHH o puntúa poco, no se sube.
// Lo que ya está en Mission Control no se vuelve a pedir. Sin EMPLEO_KEY solo enseña lo que subiría.
//   node scripts/empleo-buscar.mjs            (prueba en local; EMPLEO_DIAS=30 mira un mes atrás)
//   EMPLEO_KEY=empleo_... node scripts/empleo-buscar.mjs
import { fileURLToPath } from 'node:url';
import { scoreOffer, fits, closeGhosted } from '../control/empleo-model.js';

const SITE = process.env.EMPLEO_SITE || 'https://cesar-solla.pages.dev';
const BA = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service';
const BA_HEADERS = { 'X-API-Key': 'jobboerse-jobsuche', 'User-Agent': 'Mozilla/5.0 (Empleo robot)' };
export const QUERIES = ['Talent Acquisition', 'Recruiter', 'Recruiting', 'HR Generalist', 'People Operations', 'HR Business Partner', 'Human Resources'];
export const PLACES = [{ wo: 'München', umkreis: 40 }, { wo: 'Ingolstadt', umkreis: 35 }];
export const NEAR = /m(ü|u|ue)nchen|munich|ingolstadt|garching|unterschlei(ß|ss)heim|ottobrunn|taufkirchen|neubiberg|freising|erding|manching|pfaffenhofen|eching|ismaning|aschheim|feldkirchen|planegg|martinsried|gr(ä|a)felfing|starnberg|dachau|f(ü|u)rstenfeldbruck|bavaria|bayern/i;
export const MIN_SCORE = 35;
// For offers already uploaded: the robot's own ones are checked again with today's rules.
export const stillFits = o => !['ba', 'arbeitnow'].includes(o.source) || (!!scoreOffer({ title: o.title }) && fits(o) && (o.source !== 'arbeitnow' || NEAR.test(o.location || '')));
const MAX_DETAILS = 90;

const clean = html => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const day = v => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : '');

// A Jobsuche result (list item + its details) as an Empleo offer, or null if it does not fit.
export function fromBA(item, detail = {}, now = new Date()) {
  const description = clean(detail.stellenangebotsBeschreibung);
  const place = item.stellenlokationen?.[0]?.adresse || item.arbeitsort || {};
  const base = {
    source: 'ba', ext: item.refnr || item.referenznummer, title: clean(item.stellenangebotsTitel || item.titel || item.beruf),
    company: clean(item.firma || item.arbeitgeber), location: [place.ort, place.region === 'BAYERN' ? '' : place.region].filter(Boolean).join(', '),
    url: detail.externeUrl || detail.allianzpartnerUrl || `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(item.refnr || item.referenznummer)}`,
    posted: day(item.datumErsteVeroeffentlichung || item.veroeffentlichungszeitraum?.von || item.aktuelleVeroeffentlichungsdatum),
    remote: !!(item.homeofficemoeglich || detail.homeofficemoeglich), found: now.toISOString(),
  };
  if (!base.ext || !base.title) return null;
  const s = scoreOffer({ ...base, description });
  return s && s.score >= MIN_SCORE && fits(s) ? { ...base, ...s, snippet: description.slice(0, 500) } : null;
}

// An Arbeitnow job as an Empleo offer, or null if it is not near Munich/Ingolstadt (or remote) or does not fit.
export function fromArbeitnow(job, now = new Date()) {
  // Only in the Munich area or around Ingolstadt (remote or not).
  if (!job?.slug || !NEAR.test(job.location || '')) return null;
  const description = clean(job.description);
  const base = {
    source: 'arbeitnow', ext: job.slug, title: clean(job.title), company: clean(job.company_name), location: clean(job.location),
    url: job.url, posted: job.created_at ? new Date(job.created_at * 1000).toISOString().slice(0, 10) : '', remote: !!job.remote, found: now.toISOString(),
  };
  const s = scoreOffer({ ...base, description });
  return s && s.score >= MIN_SCORE && fits(s) ? { ...base, ...s, snippet: description.slice(0, 500) } : null;
}

async function getJson(url, headers = {}) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${r.status} ${url.split('?')[0]}`);
  return r.json();
}

async function searchBA(known) {
  const items = new Map();
  for (const q of QUERIES) for (const p of PLACES) {
    const qs = new URLSearchParams({ was: q, wo: p.wo, umkreis: String(p.umkreis), size: '100', page: '1', veroeffentlichtseit: process.env.EMPLEO_DIAS || '7', angebotsart: '1' });
    const data = await getJson(`${BA}/pc/v6/jobs?${qs}`, BA_HEADERS);
    for (const item of data.ergebnisliste || data.stellenangebote || []) {
      const ref = item.refnr || item.referenznummer;
      if (ref && !items.has(ref) && !known.has(`ba:${ref}`)) items.set(ref, item);
    }
  }
  // Only the ones whose title could be HR are worth asking for the description.
  const candidates = [...items.values()].filter(i => scoreOffer({ title: i.stellenangebotsTitel || i.titel || '' })).slice(0, MAX_DETAILS);
  const offers = [];
  for (const item of candidates) {
    let detail = {};
    try { detail = await getJson(`${BA}/pc/v4/jobdetails/${Buffer.from(item.refnr || item.referenznummer).toString('base64')}`, BA_HEADERS); } catch { /* the list item is enough to score the title */ }
    const offer = fromBA(item, detail);
    if (offer) offers.push(offer);
  }
  return { seen: items.size, offers };
}

// An agency offer already uploaded, scored again with its full text. If it cannot be read, it is kept.
async function stillFitsBA(o) {
  try {
    const detail = await getJson(`${BA}/pc/v4/jobdetails/${Buffer.from(o.ext).toString('base64')}`, BA_HEADERS);
    return !!fromBA({ refnr: o.ext, stellenangebotsTitel: o.title, firma: o.company, datumErsteVeroeffentlichung: o.posted, homeofficemoeglich: o.remote }, detail);
  } catch { return true; }
}

async function searchArbeitnow(known) {
  const offers = [];
  let seen = 0;
  for (let page = 1; page <= 3; page++) {
    const data = await getJson(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
    for (const job of data.data || []) {
      seen++;
      if (known.has(`arbeitnow:${job.slug}`)) continue;
      const offer = fromArbeitnow(job);
      if (offer) offers.push(offer);
    }
    if (!data.links?.next) break;
  }
  return { seen, offers };
}

async function api(method, body) {
  const r = await fetch(`${SITE}/api/empleo`, { method, headers: { authorization: `Bearer ${process.env.EMPLEO_KEY}`, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const out = await r.json().catch(() => ({}));
  if (!r.ok || !out.ok) throw new Error(`Mission Control ${r.status} ${out.error || ''}`);
  return out;
}

export async function main() {
  const live = !!process.env.EMPLEO_KEY;
  const known = new Set();
  const at = new Date().toISOString(), ops = [], found = [];
  const doc = live ? await api('GET') : { offers: [], apps: [] };
  for (const o of doc.offers || []) {
    // A new robot offer that no longer passes the rules (they got stricter) is removed, not kept forever.
    // Agency offers are read again in full: what disqualifies one may be beyond the stored snippet.
    if (o.status === 'new' && (!stillFits(o) || (o.source === 'ba' && !(await stillFitsBA(o))))) { ops.push({ op: 'offer.delete', id: o.id }); continue; }
    known.add(`${o.source}:${o.ext}`);
  }
  if (ops.length) console.log(`Quitadas ${ops.length} ofertas que ya no encajan`);
  // Applications with no answer for more than a month, untouched, are closed as «sin respuesta».
  const ghosted = closeGhosted(doc, new Date().toISOString().slice(0, 10));
  if (ghosted.length) { ops.push(...ghosted); console.log(`Cerradas ${ghosted.length} candidaturas sin respuesta en un mes`); }
  for (const [source, run] of [['ba', searchBA], ['arbeitnow', searchArbeitnow]]) {
    try {
      const { seen, offers } = await run(known);
      found.push(...offers);
      if (offers.length) ops.push({ op: 'offers.add', offers });
      ops.push({ op: 'run.log', run: { at, source, seen, added: offers.length } });
      console.log(`${source}: ${seen} vistas, ${offers.length} encajan`);
    } catch (error) {
      ops.push({ op: 'run.log', run: { at, source, seen: 0, added: 0, error: String(error.message).slice(0, 200) } });
      console.log(`${source}: fallo ${error.message}`);
    }
  }
  for (const o of found.sort((a, b) => b.score - a.score)) console.log(`[${o.score}] ${o.title} · ${o.company} · ${o.location} · ${o.reasons.join(', ')}`);
  if (!live) { console.log('(sin EMPLEO_KEY: no se ha subido nada)'); return; }
  const out = await api('POST', { ops });
  console.log(`Subidas: ${out.added} ofertas nuevas`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exit(1); });
