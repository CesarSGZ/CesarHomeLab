import {userCan, validCsrf} from '../../../_lib/auth.js';
import {json, methodNotAllowed, readJson} from '../../../_lib/http.js';
import {validateBacktestParams, requestIsActive} from '../../../../control/backtest-model.js';

// Backtest Lab. GET: últimos resultados + estado de la petición. POST: encolar una ejecución
// (la recoge el workflow backtest-lab.yml, que es lo único que ejecuta código).
async function readRow(env, name) {
  const row = await env.CONTROL_DB.prepare('SELECT payload, updated_at FROM personal_datasets WHERE name = ?').bind(name).first();
  if (!row) return null;
  try { return {payload: JSON.parse(row.payload), updatedAt: row.updated_at}; } catch { return null; }
}

export async function onRequest(context) {
  const {request, env, data} = context;
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST']);
  const session = data.session;
  if (!session) return json({ok: false, error: 'not_authenticated'}, {status: 401});
  if (!userCan(session.user, 'backtest:read')) return json({ok: false, error: 'not_authorised'}, {status: 403});

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const soloPeticion = url.searchParams.get('only') === 'request';
    const [result, pending, paper] = await Promise.all([
      soloPeticion ? null : readRow(env, 'backtest-lab'),
      readRow(env, 'backtest-lab-request'),
      soloPeticion ? null : readRow(env, 'ibkr-paper'),
    ]);
    return json({ok: true, result: result?.payload || null, resultUpdatedAt: result?.updatedAt || null,
      paper: paper?.payload || null,
      request: pending?.payload || null, active: requestIsActive(pending?.payload),
      canRun: userCan(session.user, 'backtest:run')});
  }

  if (!userCan(session.user, 'backtest:run')) return json({ok: false, error: 'not_authorised'}, {status: 403});
  if (!validCsrf(request, session)) return json({ok: false, error: 'invalid_csrf'}, {status: 403});
  let body;
  try { body = await readJson(request, 8192); } catch { return json({ok: false, error: 'invalid_request'}, {status: 400}); }
  const current = (await readRow(env, 'backtest-lab-request'))?.payload || null;
  const now = new Date().toISOString();

  if (body?.action === 'cancel') {
    if (current?.status !== 'queued') return json({ok: false, error: 'nothing_to_cancel'}, {status: 409});
    const cancelled = {...current, status: 'cancelled', finishedAt: now};
    await env.CONTROL_DB.prepare("UPDATE personal_datasets SET payload = ?, updated_at = ? WHERE name = 'backtest-lab-request' AND json_extract(payload,'$.status') = 'queued'")
      .bind(JSON.stringify(cancelled), now).run();
    return json({ok: true, request: cancelled});
  }
  if (body?.action !== 'run') return json({ok: false, error: 'unknown_action'}, {status: 400});
  let params;
  try { params = validateBacktestParams(body.params); } catch { return json({ok: false, error: 'invalid_params'}, {status: 400}); }
  if (requestIsActive(current)) return json({ok: false, error: 'already_running', request: current}, {status: 409});

  const next = {status: 'queued', requestedAt: now, requestedBy: session.user.username, params};
  await env.CONTROL_DB.prepare("INSERT INTO personal_datasets (name, payload, updated_at) VALUES ('backtest-lab-request', ?, ?) ON CONFLICT(name) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at")
    .bind(JSON.stringify(next), now).run();
  return json({ok: true, request: next}, {status: 202});
}
