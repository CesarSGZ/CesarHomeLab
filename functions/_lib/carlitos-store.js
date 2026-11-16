// Where Carlitos lives: both training Sheets are read, and what the two of them did with him is kept in D1.
import { CESAR_COLUMNS, MARIA_COLUMNS, madridToday, monday } from './rivalry.js';
import { TREAT_COST, activity, applyAction, carlitosState } from './carlitos.js';

const LOG = 'carlitos-lab';

async function dataset(env, name) {
  const row = await env.CONTROL_DB.prepare('SELECT payload FROM personal_datasets WHERE name = ?').bind(name).first();
  return row ? JSON.parse(row.payload) : null;
}
export async function readSheetRows(sheet) {
  if (!sheet?.url) return null;
  const response = await fetch(`${sheet.url}?k=${encodeURIComponent(sheet.key)}`, { signal: AbortSignal.timeout(25_000), redirect: 'follow' });
  const data = await response.json();
  return Array.isArray(data?.filas) ? data.filas : null;
}
export async function readLog(env, today = madridToday()) {
  const log = await dataset(env, LOG);
  if (log) return log;
  // He arrives the week he is first asked about, so that week's training already counts.
  const fresh = { born: monday(today), actions: [], messages: [], vales: [] };
  await saveLog(env, fresh);
  return fresh;
}
async function saveLog(env, log) {
  await env.CONTROL_DB.prepare('INSERT INTO personal_datasets(name,payload,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at')
    .bind(LOG, JSON.stringify(log), new Date().toISOString()).run();
}
// Either side may pass rows it already has, so no Sheet is read twice in one request.
export async function carlitosFor(env, { cesarRows, mariaRows } = {}) {
  const today = madridToday();
  const [cesar, maria, log] = await Promise.all([
    cesarRows || dataset(env, 'training-lab').then(d => readSheetRows(d?.sheet)),
    mariaRows || dataset(env, 'maria-lab').then(d => readSheetRows(d?.sheet)),
    readLog(env, today)
  ]);
  if (!cesar || !maria) return null;
  const acts = { cesar: activity(cesar, CESAR_COLUMNS), maria: activity(maria, MARIA_COLUMNS) };
  return { acts, log, today, state: carlitosState(acts, log, today) };
}
// Checked against the dog as he is now: no treat without bones, nothing bought twice, no clothes he does not have.
export async function carlitosAction(env, who, action) {
  const now = await carlitosFor(env);
  if (!now) throw new Error('not_connected');
  const { state, log, acts, today } = now, type = action?.type;
  if (['mimo', 'jugar', 'golosina'].includes(type) && !state.left[who][type]) return state;
  if (type === 'paso' && state.left[who][action.kind] === 0) return state;
  if (type === 'golosina' && state.bones < TREAT_COST) throw new Error('bones');
  if (type === 'comprar') {
    const item = state.wardrobe.find(x => x.id === action.item);
    if (!item?.buyable) throw new Error('item');
    if (state.bones < item.price) throw new Error('bones');
  }
  if (type === 'vestir' && !action.quitar && !state.wardrobe.find(x => x.id === action.item)?.owned) throw new Error('item');
  const next = applyAction(log, who, action, today);
  await saveLog(env, next);
  return carlitosState(acts, next, today);
}
