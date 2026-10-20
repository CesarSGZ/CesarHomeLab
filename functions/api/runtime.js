// Puerta de los ejecutores en la nube (GitHub Actions: Backtest Lab y robot de IBKR paper):
// puente SQL acotado. Se autentica antes de leer un cuerpo que puede ser grande.
import {authorisedRunner} from '../_lib/runner-auth.js';
import {runtimeDatabase, readRuntimeBody} from '../_lib/runtime-db.js';
export async function onRequest({request, env}) {
  if (request.method !== 'POST') return new Response('Method not allowed', {status: 405});
  try {
    if (!await authorisedRunner(request, env)) return new Response('Unauthorized', {status: 401});
    const {body} = await readRuntimeBody(request);
    if (body?.action !== 'runtime-db') return new Response('Not found', {status: 404});
    return Response.json(await runtimeDatabase(env, body), {headers: {'cache-control': 'no-store'}});
  } catch (error) { return Response.json({ok: false, success: false, error: String(error.message).slice(0, 200)}, {status: error.status || 503, headers: {'cache-control': 'no-store'}}); }
}
