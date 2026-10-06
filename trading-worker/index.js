// Agent Office · servicio interno. Lo usan (1) el ejecutor de GitHub Actions para aplicar las
// órdenes que César deja en cola desde el dashboard y (2) el Worker privado de Cloudflare
// (puente SQL, clave de IA y proxy de datos públicos para el ejecutor).
import {runtimeDatabase, readRuntimeBody} from './runtime-db.js';
import {publicDataUrl} from './public-data-proxy.js';
import {authorisedRunner} from './auth.js';
import {locked, storeSecret, secret, log} from './store.js';
import {status, cycle, ownerCommand, processOrders, refreshQuotes} from './v2/cycle.js';
import {initCompany, staffById} from './v2/company.js';
import {json} from '../functions/_lib/http.js';

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    try {
      if (['/runtime-db', '/runtime-key', '/data'].includes(path)) {
        if (request.method !== 'POST' || !await authorisedRunner(request, env)) return json({ok: false, error: 'No autorizado'}, {status: 401});
        if (path === '/runtime-db') {
          try { const {body} = await readRuntimeBody(request); return json(await runtimeDatabase(env, body)); }
          catch (error) { return json({ok: false, success: false, error: String(error.message).slice(0, 200)}, {status: error.status || 503}); }
        }
        if (path === '/runtime-key') return json({ok: true, key: await secret(env, 'openai')});
        const url = publicDataUrl((await request.json()).url);
        return fetch(url, {redirect: 'error', headers: {Accept: 'application/json, application/xml, text/xml, */*', 'User-Agent': url.hostname.endsWith('sec.gov') ? 'Cesar Agent Office research https://cesar-solla.pages.dev' : 'Mozilla/5.0'}, signal: AbortSignal.timeout(25000)});
      }
      if (path === '/status' && request.method === 'GET') {
        const cached = await env.CONTROL_DB.prepare('SELECT payload FROM trading_status_cache WHERE id=1').first();
        return cached ? new Response(cached.payload, {headers: {'content-type': 'application/json', 'cache-control': 'no-store'}}) : json(await status(env));
      }
      if (request.method !== 'POST') return json({ok: false, error: 'Método no permitido'}, {status: 405});
      const text = await request.text(); if (text.length > 25000) return json({ok: false, error: 'Petición demasiado grande'}, {status: 413});
      const body = text ? JSON.parse(text) : {};
      if (path === '/key') { const key = String(body.key || ''); if (key && (!key.startsWith('sk-') || key.length < 20 || key.length > 300)) throw Error('Formato de clave no válido'); await storeSecret(env, 'openai', key); return json({ok: true, configured: !!key}); }
      if (path === '/run') { await cycle(env, {manual: true}); return json({ok: true, completed: true}); }
      await locked(env, async s => {
        const v2 = initCompany(s);
        if (path === '/control') {
          if (typeof body.paused === 'boolean') s.paused = body.paused; if (typeof body.automatic === 'boolean') s.automatic = body.automatic;
          log(s, 'boss', s.paused ? 'César pausa las compras' : 'César reanuda las compras');
        } else if (path === '/agent') {
          const member = staffById(body.id); if (!member || typeof body.paused !== 'boolean') throw Error('Empleado no válido');
          v2.agents[member.id].paused = body.paused; log(s, 'boss', member.name + (body.paused ? ' en pausa' : ' vuelve al trabajo'));
        } else if (path === '/owner' || path === '/meeting') {
          ownerCommand(s, path, body); log(s, 'boss', path === '/owner' ? 'Mensaje de César al equipo' : 'César convoca reunión');
        } else if (path === '/close') {
          const p = s.real.book.positions.find(p => p.id === body.id); if (!p) throw Error('Posición no encontrada');
          await refreshQuotes(s, [p.symbol]);
          if (!v2.orders.some(o => o.side === 'sell' && o.symbol === p.symbol)) v2.orders.push({id: 'o' + (++v2.seq), side: 'sell', symbol: p.symbol, by: 'cesar', at: Date.now(), expiresAt: Date.now() + 30 * 3600e3, said: 'Cierre ordenado por César'});
          processOrders(s); log(s, 'boss', p.symbol + ': César ordena cerrar');
        } else throw Error('Acción desconocida');
      });
      return json({ok: true});
    } catch (e) { return json({ok: false, error: String(e.message).slice(0, 200)}, {status: 400}); }
  }
};
