// Agent Office v2 · única puerta a la IA. Reserva el coste antes de llamar y lo
// liquida con el uso real, sobre el mismo ledger D1 que ya llevaba el alquiler.
// Las sentencias SQL son literales: el puente runtime-db solo acepta estas.
import {secret, operatingBudget} from '../engine.js';
import {day} from '../core.js';

export const MODELS = {light: 'gpt-6-luna', deep: 'gpt-6.1-sol'};
const RATES = {'gpt-6-luna': [0.1, 0.5], 'gpt-6.1-sol': [2, 10]}; // USD por millón de tokens (entrada, salida)
const WEB_FEE = 0.01; // USD por búsqueda
export class OfficeError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

const bytes = s => new TextEncoder().encode(s).length;

export async function callModel(env, s, {agent, instructions, input, schema, maxOut = 450, deep = false, web = false, fetcher = fetch}) {
  const key = await secret(env, 'openai');
  if (!key) throw new OfficeError('sin_clave', 'Falta conectar la clave de OpenAI');
  const fx = s.real.book.fx?.rate;
  if (!(fx > 0)) throw new OfficeError('sin_fx', 'Falta el cambio EUR/USD para contabilizar la llamada');
  const model = deep ? MODELS.deep : MODELS.light, [ri, ro] = RATES[model];
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  const format = {format: {type: 'json_schema', name: 'decision', strict: true, schema}};
  const tools = web ? {tools: [{type: 'web_search', search_context_size: 'low'}], max_tool_calls: 2, include: ['web_search_call.action.sources']} : {};
  // Reserva prudente: bytes/3 sobrestima los tokens; una búsqueda web añade contexto y tarifa.
  const inTokens = Math.ceil(bytes(text + instructions + JSON.stringify(schema)) / 3) + (web ? 40000 : 200);
  const reserve = Math.min(9.5, inTokens * ri / 1e6 + maxOut * ro / 1e6 + (web ? 2 * WEB_FEE : 0));
  const eurReserve = reserve / fx, today = day(), month = today.slice(0, 7), db = env.CONTROL_DB;
  const dailyCap = Math.min(10, Math.max(0.1, Number(s.config?.dailyBudget) || 3));

  await db.prepare('INSERT OR IGNORE INTO trading_budget(day) VALUES (?)').bind(today).run();
  const daily = await db.prepare('UPDATE trading_budget SET spent=spent+?,calls=calls+1 WHERE day=? AND spent+?<=? RETURNING spent').bind(reserve, today, reserve, dailyCap).first();
  if (!daily) throw new OfficeError('sin_presupuesto', 'Presupuesto diario de IA alcanzado');
  await db.prepare('INSERT OR IGNORE INTO trading_operating_budget(month,spent_eur,updated_at) SELECT ?,COALESCE(SUM(COALESCE(actual,reserved)),0)/?,? FROM trading_calls WHERE day LIKE ?').bind(month, fx, Date.now(), month + '%').run();
  const monthly = await db.prepare('UPDATE trading_operating_budget SET spent_eur=spent_eur+?,updated_at=? WHERE month=? AND spent_eur+?<=allowance_eur RETURNING spent_eur').bind(eurReserve, Date.now(), month, eurReserve).first();
  const refundDaily = () => db.prepare('UPDATE trading_budget SET spent=MAX(0,spent-?),calls=MAX(0,calls-1) WHERE day=?').bind(reserve, today).run();
  if (!monthly) { await refundDaily(); throw new OfficeError('sin_presupuesto', 'Alquiler de tokens agotado: la IA se queda en pausa hasta el mes que viene'); }
  const callId = crypto.randomUUID();
  await db.prepare('INSERT INTO trading_calls(id,day,model,reserved,status,created_at,eur_reserved,fx_rate,agent) VALUES (?,?,?,?,?,?,?,?,?)').bind(callId, today, model, reserve, 'reserved', Date.now(), eurReserve, fx, agent).run();
  const settle = (actual, inTok, outTok) => db.batch([
    db.prepare('UPDATE trading_budget SET spent=MAX(0,spent-?+?),input_tokens=input_tokens+?,output_tokens=output_tokens+? WHERE day=?').bind(reserve, actual, inTok, outTok, today),
    db.prepare('UPDATE trading_calls SET actual=?,eur_actual=?,status=? WHERE id=?').bind(actual, actual / fx, 'complete', callId),
    db.prepare('UPDATE trading_operating_budget SET spent_eur=MAX(0,spent_eur-?+?),updated_at=? WHERE month=?').bind(eurReserve, actual / fx, Date.now(), month)
  ]);

  let response;
  try {
    response = await fetcher('https://api.openai.com/v1/responses', {
      method: 'POST', headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'}, signal: AbortSignal.timeout(web ? 90000 : 45000),
      body: JSON.stringify({model, instructions, input: text, store: false, reasoning: {effort: deep ? 'low' : 'none'}, max_output_tokens: maxOut, text: format, ...tools})
    });
  } catch (error) {
    // Sin respuesta no se sabe si OpenAI cobró: la reserva se conserva.
    await db.prepare('UPDATE trading_calls SET status=? WHERE id=?').bind('uncertain-cost-retained', callId).run();
    throw new OfficeError('ia_sin_respuesta', 'La IA no respondió: ' + String(error.message).slice(0, 80));
  }
  if (!response.ok) {
    // Un rechazo 4xx no se factura: se devuelve la reserva íntegra.
    if (response.status >= 400 && response.status < 500 && response.status !== 429) await settle(0, 0, 0);
    else await db.prepare('UPDATE trading_calls SET status=? WHERE id=?').bind('uncertain-cost-retained', callId).run();
    throw new OfficeError(response.status === 401 ? 'clave_invalida' : 'ia_http', 'OpenAI HTTP ' + response.status);
  }
  const j = await response.json(), usage = j.usage;
  let costEur = eurReserve;
  if (usage) {
    const searches = web ? (j.output || []).filter(o => o.type === 'web_search_call').length : 0;
    const actual = (usage.input_tokens * ri + usage.output_tokens * ro) / 1e6 + searches * WEB_FEE;
    await settle(actual, usage.input_tokens, usage.output_tokens); costEur = actual / fx;
  } else await db.prepare('UPDATE trading_calls SET status=? WHERE id=?').bind('uncertain-cost-retained', callId).run();
  const out = j.output?.flatMap(x => x.content || []).find(x => x.type === 'output_text')?.text;
  const sources = web ? [...new Set((j.output || []).flatMap(o => [...(o.action?.sources || []).map(x => x.url), ...(o.content || []).flatMap(c => (c.annotations || []).map(a => a.url))]).filter(Boolean))].slice(0, 6) : [];
  let data;
  try { data = JSON.parse(out); } catch { throw Object.assign(new OfficeError('ia_respuesta', j.status === 'incomplete' ? 'Respuesta de IA cortada' : 'Respuesta de IA ilegible'), {costEur}); }
  return {data, costEur, sources, model};
}

// Foto del presupuesto para repartir turnos: cuánto queda este mes y hoy.
export async function budgetSnapshot(env, s) {
  const op = await operatingBudget(env, s);
  const byAgent = {};
  return {...op, byAgent};
}
