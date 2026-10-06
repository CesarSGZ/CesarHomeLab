import { userCan, validCsrf } from '../../../_lib/auth.js';
import { json, readJson, methodNotAllowed } from '../../../_lib/http.js';
import { GameError, createRoom, applyAction, fulfillEnemyRequest, publicRoom } from '../../../_lib/doors-engine.js';

const CODE = /^[A-Z2-9]{6}$/;
function roomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return [...crypto.getRandomValues(new Uint8Array(6))].map(n => alphabet[n % alphabet.length]).join('');
}
const roomRow = (env, code) => env.CONTROL_DB.prepare('SELECT * FROM doors_rooms WHERE code = ?').bind(code).first();

export async function onRequest(context) {
  const { request, env, data } = context;
  const session = data.session;
  if (!session) return json({ ok: false, error: 'Inicia sesión para jugar.' }, { status: 401 });
  if (!userCan(session.user, 'doors:play')) return json({ ok: false, error: 'Acceso no autorizado.' }, { status: 403 });
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST']);
  if (request.method === 'POST' && !validCsrf(request, session)) return json({ ok: false, error: 'Sesión de seguridad caducada. Recarga la página.' }, { status: 403 });
  try {
    const segments = new URL(request.url).pathname.split('/api/doors')[1].split('/').filter(Boolean);
    const code = segments[0]?.toUpperCase();
    if (segments.length > 1 || (code && !CODE.test(code))) throw new GameError('Código de sala no válido.', 404);
    if (request.method === 'GET' && !code) {
      const { results } = await env.CONTROL_DB.prepare(`
        SELECT code, title, host_user_id, status, state_json, version, updated_at FROM doors_rooms
        WHERE (status = 'lobby' OR EXISTS (SELECT 1 FROM json_each(state_json, '$.players') p WHERE json_extract(p.value, '$.id') = ?))
          AND updated_at > ? ORDER BY updated_at DESC LIMIT 30
      `).bind(session.user.id, Date.now() - 30 * 86400000).all();
      const rooms = results.map(row => {
        const room = JSON.parse(row.state_json);
        return { code: row.code, title: row.title, phase: room.phase, round: room.round, count: room.players.length,
          host: room.players.find(p => p.id === room.host)?.name, member: room.players.some(p => p.id === session.user.id),
          players: room.players.map(p => p.name), updatedAt: row.updated_at, version: row.version };
      });
      return json({ ok: true, rooms });
    }
    if (request.method === 'POST' && !code) {
      const input = await readJson(request, 2048);
      if (input.action !== 'create') throw new GameError('Acción desconocida.');
      const count = await env.CONTROL_DB.prepare("SELECT COUNT(*) AS count FROM doors_rooms WHERE host_user_id = ? AND status NOT IN ('finished', 'cancelled')")
        .bind(session.user.id).first();
      if (count.count >= 3) throw new GameError('Ya tienes tres partidas abiertas. Cierra alguna antes de crear otra.', 429);
      const now = Date.now();
      const room = createRoom(session.user, input.title, now);
      for (let attempt = 0; attempt < 4; attempt++) {
        const newCode = roomCode();
        const result = await env.CONTROL_DB.prepare('INSERT OR IGNORE INTO doors_rooms (code, host_user_id, title, status, state_json, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)')
          .bind(newCode, room.host, room.title, room.phase, JSON.stringify(room), now, now).run();
        if (result.meta.changes) return json({ ok: true, room: publicRoom(room, session.user.id, newCode, 1) }, { status: 201 });
      }
      throw new GameError('No se pudo crear la sala. Inténtalo otra vez.', 503);
    }
    const row = await roomRow(env, code);
    if (!row) throw new GameError('No existe esa sala.', 404);
    const room = JSON.parse(row.state_json);
    if (request.method === 'GET') return json({ ok: true, room: publicRoom(room, session.user.id, code, row.version), serverNow: Date.now() });
    const input = await readJson(request, 8192);
    if (!Number.isInteger(input.version) || input.version !== row.version) throw new GameError('La sala ha cambiado. Actualiza y vuelve a intentarlo.', 409);
    const before = row.state_json;
    const now = Date.now();
    if (input.action === 'reassign') fulfillEnemyRequest(room, session.user, input, now);
    else applyAction(room, session.user, input, now);
    const state = JSON.stringify(room);
    if (state !== before) {
      const result = await env.CONTROL_DB.prepare('UPDATE doors_rooms SET host_user_id = ?, status = ?, state_json = ?, version = version + 1, updated_at = ? WHERE code = ? AND version = ?')
        .bind(room.host, room.phase, state, now, code, row.version).run();
      if (!result.meta.changes) throw new GameError('Otro jugador acaba de actuar. Actualiza y repite tu acción.', 409);
    }
    if (!room.players.some(p => p.id === session.user.id)) return json({ ok: true, left: true });
    return json({ ok: true, room: publicRoom(room, session.user.id, code, row.version + (state !== before ? 1 : 0)), serverNow: now });
  } catch (error) {
    if (error instanceof GameError) return json({ ok: false, error: error.message }, { status: error.status });
    if (error.message === 'payload_too_large') return json({ ok: false, error: 'El mensaje es demasiado largo.' }, { status: 413 });
    if (error instanceof SyntaxError) return json({ ok: false, error: 'Datos no válidos.' }, { status: 400 });
    console.error('Doors game request failed:', error.name);
    return json({ ok: false, error: 'No se pudo conectar con la sala. Vuelve a intentarlo.' }, { status: 503 });
  }
}
