import test from 'node:test';
import assert from 'node:assert/strict';
import {applyOps, emptyDoc, scoreOffer, language, stats, followUp, summary, insights, groupBy, DIMENSIONS, closeGhosted, fits, isReply} from '../control/empleo-model.js';
import {onRequest as page} from '../functions/control/api/empleo/status.js';
import {onRequest as door} from '../functions/api/empleo.js';
import {accessForUser} from '../functions/_lib/auth.js';
import {fromBA, fromArbeitnow, stillFits} from '../scripts/empleo-buscar.mjs';

// A tiny D1 stand-in with the conditional update, the upsert and the delete the stores rely on.
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
const post = body => new Request('https://x/control/api/empleo/status', {method: 'POST', headers: {'x-csrf-token': 'tok'}, body: JSON.stringify(body)});

const EN_TA = 'You will own full-cycle recruiting for our engineering teams. We are an international team and our working language is English. Experience with LinkedIn Recruiter and your skills in sourcing are key.';
const DE_REQ = 'We are looking for you. Your profile: fluent German and English, experience in recruiting for our teams in Munich.';

test('the score reads the title and the text, and says why', () => {
  const ta = scoreOffer({title: 'Talent Acquisition Specialist (m/f/d)', description: EN_TA});
  assert.ok(ta.score >= 80, `got ${ta.score}`);
  assert.deepEqual(ta.reasons.slice(0, 2), ['Selección / TA', 'Oferta en inglés']);
  assert.ok(ta.reasons.includes('Ingeniería / tech'));
  const german = scoreOffer({title: 'Recruiter (m/w/d)', description: DE_REQ});
  assert.equal(german.german, 'required');
  assert.ok(german.score < ta.score - 25);
  const spanish = scoreOffer({title: 'Payroll Specialist Spain', description: 'You will run payroll for our Spanish entities. Spanish and English required, with our team.'});
  assert.equal(spanish.track, 'C'); assert.ok(spanish.spanish);
  assert.equal(scoreOffer({title: 'Agency recruiter', description: 'Hays is a recruitment agency and you will work with our team.'}).track, 'B');
  // Not HR, students and procurement "sourcing" are not offers for her.
  assert.equal(scoreOffer({title: 'Java Backend Developer'}), null);
  assert.equal(scoreOffer({title: 'Werkstudent Recruiting (m/w/d)'}), null);
  assert.equal(scoreOffer({title: 'Senior IT-Consultant Service & Sourcing Management'}), null);
  assert.equal(language('Wir suchen dich für unser Team und die Personalabteilung mit einer tollen Kultur und der besten'), 'de');
  assert.equal(language(EN_TA), 'en');
});

test('the robot turns both sources into offers and drops what does not fit', () => {
  const now = new Date('2026-11-25T08:00:00Z');
  const ba = fromBA({refnr: '10001-1', stellenangebotsTitel: 'Talent Acquisition Partner (m/w/d)', firma: 'Isar GmbH', stellenlokationen: [{adresse: {ort: 'München', region: 'BAYERN'}}], datumErsteVeroeffentlichung: '2026-11-24', homeofficemoeglich: true}, {stellenangebotsBeschreibung: `**About us** ${EN_TA}`}, now);
  assert.equal(ba.source, 'ba'); assert.equal(ba.ext, '10001-1'); assert.equal(ba.location, 'München'); assert.equal(ba.posted, '2026-11-24');
  assert.match(ba.url, /arbeitsagentur\.de\/jobsuche\/jobdetail\/10001-1$/);
  assert.ok(ba.remote && ba.score >= 80 && !ba.snippet.includes('**'));
  assert.equal(fromBA({refnr: '2', stellenangebotsTitel: 'Lagerist'}, {}, now), null);
  const an = fromArbeitnow({slug: 'ta-munich', title: 'Recruiter', company_name: 'Flix', location: 'Munich', remote: false, url: 'https://www.arbeitnow.com/jobs/x', description: `<p>${EN_TA}</p>`, created_at: 1764000000}, now);
  assert.equal(an.source, 'arbeitnow'); assert.equal(an.posted, '2025-11-24'); assert.ok(an.score >= 70);
  assert.equal(fromArbeitnow({slug: 'b', title: 'Recruiter', location: 'Berlin', remote: false, description: EN_TA}, now), null, 'far away and not remote');
});

test('offers: the robot sends them again and again, what was done with them stays', () => {
  let doc = applyOps(emptyDoc(), [{op: 'offers.add', offers: [{source: 'ba', ext: '1', title: 'Recruiter', score: 60}, {source: 'ba', ext: '2', title: 'HR Generalist', score: 40}]}]);
  assert.equal(doc.offers.length, 2);
  const id = doc.offers.find(o => o.ext === '1').id;
  doc = applyOps(doc, [{op: 'offer.put', offer: {id, status: 'saved', letter: 'Dear team'}}]);
  doc = applyOps(doc, [{op: 'offers.add', offers: [{source: 'ba', ext: '1', title: 'Recruiter (m/w/d)', score: 65}]}]);
  const o = doc.offers.find(o => o.id === id);
  assert.equal(doc.offers.length, 2);
  assert.deepEqual([o.title, o.score, o.status, o.letter], ['Recruiter (m/w/d)', 65, 'saved', 'Dear team']);
  // An application made from an offer marks it as applied.
  doc = applyOps(doc, [{op: 'app.put', app: {id: 'a1', offer: id, company: 'Isar', date: '2026-11-20'}}]);
  assert.equal(doc.offers.find(o => o.id === id).status, 'applied');
  assert.equal(doc.apps[0].phase, 'sent');
  assert.throws(() => applyOps(doc, [{op: 'app.put', app: {id: 'x'}}]), /invalid_app/);
  assert.throws(() => applyOps(doc, [{op: 'nope'}]), /invalid_op/);
  assert.equal(applyOps(doc, [{op: 'offer.put', offer: {id, url: 'javascript:alert(1)'}}]).offers.find(o => o.id === id).url, '');
});

test('follow-up after a week; more than a month untouched and unanswered closes it as «sin respuesta»', () => {
  const a = {open: true, phase: 'sent', date: '2026-11-01'};
  assert.equal(followUp(a, '2026-11-05'), '');
  assert.equal(followUp(a, '2026-11-08'), 'follow');
  assert.equal(followUp({...a, followed: '2026-11-09'}, '2026-11-15'), '', 'one follow-up is enough');
  assert.equal(followUp(a, '2026-12-01'), 'follow', 'day 30 is still waiting');
  assert.equal(followUp(a, '2026-12-02'), 'lost');
  assert.equal(followUp({...a, touched: '2026-11-20'}, '2026-12-02'), 'follow', 'touched recently: not yet');
  assert.equal(followUp({...a, followed: '2026-11-09'}, '2026-12-10'), 'lost');
  assert.equal(followUp({...a, phase: 'screen'}, '2027-01-20'), '', 'only applications still waiting');
  let doc = applyOps(emptyDoc(), [
    {op: 'app.put', app: {id: 'old', company: 'A', date: '2026-10-01'}},
    {op: 'app.put', app: {id: 'kept', company: 'B', date: '2026-10-01', touched: '2026-11-20'}},
    {op: 'app.put', app: {id: 'new', company: 'C', date: '2026-11-20'}},
  ]);
  const ops = closeGhosted(doc, '2026-11-25');
  assert.deepEqual(ops.map(o => o.app.id), ['old']);
  doc = applyOps(doc, ops);
  const old = doc.apps.find(a => a.id === 'old');
  assert.deepEqual([old.phase, old.open, old.touched], ['ghosted', false, ''], 'the robot does not count as touching it');
  assert.equal(isReply(old), false);
  assert.equal(stats(doc, '2026-11-25').replies, 0);
});

test('results: rates by what was tried, and a sentence only when there is enough data', () => {
  const apps = [];
  for (let i = 0; i < 12; i++) apps.push({id: 'a' + i, company: 'X', date: '2026-11-02', time: '09:00', cv: 'CV-A', message: false, phase: i < 1 ? 'screen' : i < 4 ? 'rejected' : 'sent', open: true});
  for (let i = 0; i < 10; i++) apps.push({id: 'b' + i, company: 'Y', date: '2026-11-03', time: '20:00', cv: 'CV-B', message: true, phase: i < 4 ? 'interview' : 'sent', open: true});
  const doc = applyOps(emptyDoc(), apps.map(app => ({op: 'app.put', app})));
  const s = stats(doc, '2026-11-25');
  assert.equal(s.n, 22); assert.equal(s.interviews, 5); assert.equal(s.replies, 8);
  const cv = s.groups.find(g => g.key === 'cv').rows;
  assert.deepEqual(cv.map(r => [r.key, r.n, r.interviews, r.enough]), [['CV-A', 12, 1, true], ['CV-B', 10, 4, true]]);
  assert.match(s.insights.find(i => i.dim === 'Versión de CV').text, /«CV-B» consigue 40 % de entrevistas frente a 8 % de «CV-A»/);
  assert.deepEqual(groupBy(doc.apps, DIMENSIONS.find(d => d.key === 'hour')).map(r => r.key), ['Mañana (<12h)', 'Noche (19h+)']);
  assert.equal(s.weeks.length, 8); assert.equal(s.weeks.reduce((n, w) => n + w.n, 0), 22);
  assert.deepEqual(insights([{label: 'X', rows: [{key: 'a', n: 3, enough: false, interviewRate: 1, replyRate: 1}]}]), []);
  assert.match(summary(doc, '2026-11-25'), /22 candidaturas, 5 con entrevista/);
});

test('API: only the owner, CSRF on writes; the door needs its own key', async () => {
  assert.ok(accessForUser({username: 'CesarVapor'}).views.includes('empleo'));
  assert.ok(!accessForUser({username: 'SuperSanti86'}).capabilities.includes('empleo:read'));
  const env = fakeEnv();
  assert.equal((await page({request: new Request('https://x/'), env, data: {session: {user: {username: 'supersanti86'}}}})).status, 403);
  assert.equal((await page({request: new Request('https://x/', {method: 'POST', body: '{"ops":[]}'}), env, data: owner})).status, 403);
  const empty = await (await page({request: new Request('https://x/'), env, data: owner})).json();
  assert.deepEqual(empty.cvs.map(c => c.id), ['CV-A']);
  let r = await page({request: post({ops: [{op: 'app.put', app: {id: 'a1', company: 'Airbus', date: '2026-11-24'}}]}), env, data: owner});
  assert.equal((await r.json()).apps[0].company, 'Airbus');
  const ask = (body, key) => door({request: new Request('https://x/api/empleo', {method: body ? 'POST' : 'GET', headers: key ? {authorization: 'Bearer ' + key} : {}, ...(body ? {body: JSON.stringify(body)} : {})}), env});
  assert.equal((await ask(null, 'empleo_nope')).status, 401);
  const {key} = await (await page({request: post({action: 'agent-key'}), env, data: owner})).json();
  assert.match(key, /^empleo_[\w-]{40,}$/);
  assert.equal((await ask(null, key.replace('empleo_', 'tareas_'))).status, 401, 'a Tareas-looking key does not open Empleo');
  r = await ask({ops: [{op: 'offers.add', offers: [{source: 'ba', ext: '9', title: 'Recruiter', score: 70}]}, {op: 'run.log', run: {at: '2026-11-25T07:15:00Z', source: 'ba', seen: 120, added: 1}}]}, key);
  const out = await r.json();
  assert.equal(out.added, 1); assert.match(out.summary, /\[70\] Recruiter/);
  const read = await (await ask(null, key)).json();
  assert.equal(read.runs[0].seen, 120); assert.equal(read.apps.length, 1);
  await page({request: post({action: 'agent-revoke'}), env, data: owner});
  assert.equal((await ask(null, key)).status, 401);
  assert.ok(!env.rows.has('todo'), 'Empleo never touches Tareas');
});

test('after the first real run: no talent pools, no remote jobs abroad, and shared careers links stay separate offers', () => {
  const now = new Date('2026-11-25T08:00:00Z');
  assert.equal(scoreOffer({title: 'Senior UI/ UX Artist Freelance Talent Pool (2027)', description: EN_TA}), null);
  assert.equal(scoreOffer({title: 'Senior Rendering Engineer - Talent Network'}), null);
  const job = {slug: 'x', title: 'Talent Acquisition Partner', company_name: 'A', remote: true, url: 'https://www.arbeitnow.com/jobs/x', description: EN_TA};
  assert.equal(fromArbeitnow({...job, location: 'Netherlands'}, now), null);
  // Only the Munich area and around Ingolstadt, remote or not.
  assert.equal(fromArbeitnow({...job, location: 'Remote job'}, now), null);
  assert.equal(fromArbeitnow({...job, location: 'Berlin'}, now), null);
  assert.ok(fromArbeitnow({...job, location: 'Munich'}, now));
  assert.ok(fromArbeitnow({...job, location: 'Ingolstadt'}, now));
  const careers = 'https://jobs.korian.de/';
  const doc = applyOps(emptyDoc(), [{op: 'offers.add', offers: [
    {source: 'ba', ext: 'n', title: 'Regional Recruiting Manager Nord', url: careers},
    {source: 'ba', ext: 'w', title: 'Regional Recruiting Manager West', url: careers},
  ]}]);
  assert.equal(doc.offers.length, 2);
  // Without an id (added by hand), the same link is the same offer.
  const link = 'https://www.linkedin.com/jobs/view/1';
  assert.equal(applyOps(emptyDoc(), [{op: 'offers.add', offers: [{source: 'manual', title: 'Recruiter', url: link}, {source: 'claude', title: 'Recruiter', url: link}]}]).offers.length, 1);
});

test('nothing that asks for German or is written in German; old ones are cleaned up', () => {
  const now = new Date('2026-11-25T08:00:00Z');
  assert.equal(fits({lang: 'en', german: 'plus'}), true);
  assert.equal(fits({lang: 'de'}), false);
  assert.equal(fits({lang: 'en', german: 'required'}), false);
  const item = {refnr: 'r1', stellenangebotsTitel: 'Recruiter (m/w/d)', firma: 'X', stellenlokationen: [{adresse: {ort: 'München'}}]};
  assert.equal(fromBA(item, {stellenangebotsBeschreibung: 'Wir suchen dich für unser Team und die Personalabteilung mit einer tollen Kultur und der besten Zukunft.'}, now), null);
  assert.equal(fromBA({...item, stellenangebotsTitel: 'People Operations Specialist'}, {stellenangebotsBeschreibung: DE_REQ}, now), null);
  assert.ok(fromBA({...item, stellenangebotsTitel: 'Talent Acquisition Partner'}, {stellenangebotsBeschreibung: EN_TA}, now));
  assert.equal(stillFits({source: 'ba', title: 'Recruiter', lang: 'de'}), false);
  assert.equal(stillFits({source: 'arbeitnow', title: 'Recruiter', lang: 'en', location: 'Remote job'}), false);
  assert.equal(stillFits({source: 'ba', title: 'Recruiter', lang: 'en'}), true);
  assert.equal(stillFits({source: 'claude', title: 'Lo que sea', lang: 'de'}), true, 'what Claude or César added is never removed');
});

test('each CV version keeps its file: upload, download, replace and delete', async () => {
  const env = fakeEnv();
  const pdf = Buffer.from('%PDF-1.4 cv de prueba').toString('base64');
  let r = await page({request: post({action: 'cv-upload', id: 'CV-A', name: 'CV María.pdf', type: 'application/pdf', data: pdf}), env, data: owner});
  assert.equal(r.status, 200);
  const cv = (await r.json()).cvs.find(c => c.id === 'CV-A');
  assert.equal(cv.what, 'Versión base en inglés', 'uploading keeps the description');
  assert.deepEqual([cv.file.name, cv.file.size, cv.file.type], ['CV María.pdf', 21, 'application/pdf']);
  assert.ok(!env.rows.get('empleo').payload.includes(pdf), 'the file is not inside the document');
  const down = await page({request: new Request('https://x/control/api/empleo/status?cv=CV-A'), env, data: owner});
  assert.equal(down.headers.get('content-type'), 'application/pdf');
  assert.match(down.headers.get('content-disposition'), /attachment; filename\*=UTF-8''CV%20Mar%C3%ADa\.pdf/);
  assert.equal(Buffer.from(await down.arrayBuffer()).toString(), '%PDF-1.4 cv de prueba');
  // Editing the description keeps the file.
  r = await page({request: post({ops: [{op: 'cv.put', cv: {id: 'CV-A', what: 'Base'}}]}), env, data: owner});
  assert.equal((await r.json()).cvs[0].file.name, 'CV María.pdf');
  assert.equal((await page({request: post({action: 'cv-upload', id: 'CV-A', name: 'x.exe', type: 'application/x-msdownload', data: pdf}), env, data: owner})).status, 400);
  assert.equal((await page({request: post({action: 'cv-upload', id: '../x', name: 'a.pdf', type: 'application/pdf', data: pdf}), env, data: owner})).status, 400);
  const big = Buffer.alloc(1_300_001).toString('base64');
  assert.equal((await page({request: post({action: 'cv-upload', id: 'CV-A', name: 'a.pdf', type: 'application/pdf', data: big}), env, data: owner})).status, 413);
  assert.equal((await page({request: new Request('https://x/?cv=CV-A'), env, data: {session: {user: {username: 'supersanti86'}}}})).status, 403);
  await page({request: post({ops: [{op: 'cv.delete', id: 'CV-A'}]}), env, data: owner});
  assert.ok(!env.rows.has('empleo-cv:CV-A'));
  assert.equal((await page({request: new Request('https://x/?cv=CV-A'), env, data: owner})).status, 404);
});

test('German asked for after the language name still counts («German and English … are excellent»)', () => {
  for (const text of ['Your German and English language skills are excellent, both spoken and written.', 'English and German at a business level are required.', 'Full professional English and German']) {
    assert.equal(scoreOffer({title: 'Associate, Recruiting', description: `We are an international team. ${text}`}).german, 'required', text);
  }
  assert.notEqual(scoreOffer({title: 'Recruiter', description: 'Our team works in English. German and English speakers welcome.'}).german, 'required');
});

test('German as a plus is not German required, even next to «fluent English»', () => {
  for (const text of ['Business fluent English, german is a plus', 'Fluent English and professionnal proficiency (B2) German is highly desirable', 'Fluent English; B2 German is highly desirable but not mandatory']) {
    assert.equal(scoreOffer({title: 'HR Business Partner', description: `We work in English with you and our team. ${text}.`}).german, 'plus', text);
  }
  assert.equal(scoreOffer({title: 'HR Business Partner', description: 'We work in English with you and our team. Fluent German (mandatory). Italian is a plus.'}).german, 'required');
});
