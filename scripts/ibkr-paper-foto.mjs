// Cartera paper de IBKR · guarda en D1 la foto que manda backtest-lab/ibkr_paper.py --foto (vía workflow_dispatch).
// Solo acepta campos conocidos y con el tipo esperado; añade un punto al histórico (uno por día).
import {cloudDatabase} from './cloud-db.mjs';

const num = x => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const txt = (x, max = 40) => (typeof x === 'string' ? x.slice(0, max) : '');
const fecha = x => (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}([T ][\d:.+\-Z]+)?$/.test(x) ? x.slice(0, 25) : null);

const CLAVES_ALERTA = new Set(['va_por_libre', 'loteria', 'diluye', 'pico_wiki', 'vol_propia', 'no_bate_bpa', 'sin_dividendo']);
const claves = xs => (Array.isArray(xs) ? xs.filter(x => CLAVES_ALERTA.has(x)).slice(0, 8) : []);

export function limpiarSemaforo(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return null;
  return {alertas: claves(s.alertas), sinDato: claves(s.sinDato), fecha: fecha(s.fecha), ...(s.aprox === true ? {aprox: true} : {})};
}

// plan del dinero (backtest-lab/bt/plan.py): reserva, bolsa por aportar, caída del S&P y últimos movimientos
export function limpiarPlan(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const r = p.reglas && typeof p.reglas === 'object' ? p.reglas : {};
  const pesos = {};
  for (const [k, w] of Object.entries(r.pesos && typeof r.pesos === 'object' ? r.pesos : {}).slice(0, 6))
    if (/^[a-z_]{1,24}$/.test(k) && num(w) !== null) pesos[k] = num(w);
  return {
    inicio: fecha(p.inicio), reserva: num(p.reserva), porAportar: num(p.porAportar), aporteMensual: num(p.aporteMensual),
    caidaSP: num(p.caidaSP), disparosUsados: num(p.disparosUsados),
    reglas: {pesos, reserva: num(r.reserva), rearme: num(r.rearme),
      disparos: (Array.isArray(r.disparos) ? r.disparos.slice(0, 6) : []).map(d => ({caidaSP: num(d?.caidaSP), fraccion: num(d?.fraccion)}))},
    aportes: (Array.isArray(p.aportes) ? p.aportes.slice(-24) : []).map(a => {
      const o = {fecha: fecha(a?.fecha), aporte: num(a?.aporte), caidaSP: num(a?.caidaSP)};
      for (const k of Object.keys(pesos)) o[k] = num(a?.[k]);
      return o;
    }),
  };
}

export function limpiarFoto(bruta) {
  const f = typeof bruta === 'string' ? JSON.parse(bruta) : bruta;
  if (!f || typeof f !== 'object' || Array.isArray(f)) throw new Error('foto_invalida');
  if (typeof f.cuenta !== 'string' || !/^DU[A-Z0-9]{3,12}$/.test(f.cuenta)) throw new Error('cuenta_no_paper');
  if (!fecha(f.fecha) || num(f.valor) === null) throw new Error('foto_incompleta');
  const lista = (xs, n) => (Array.isArray(xs) ? xs.slice(0, n) : []);
  const ests = {};
  for (const [k, e] of Object.entries(f.estrategias && typeof f.estrategias === 'object' ? f.estrategias : {}).slice(0, 6)) {
    if (!/^[a-z_]{1,24}$/.test(k) || !e || typeof e !== 'object') continue;
    ests[k] = {nombre: txt(e.nombre, 60), asignado: num(e.asignado), valor: num(e.valor), invertido: num(e.invertido),
      noRealizada: num(e.noRealizada), realizada: num(e.realizada), posiciones: num(e.posiciones),
      ...(num(e.caja) !== null ? {caja: num(e.caja)} : {}), ...(num(e.indice) !== null ? {indice: num(e.indice)} : {})};
  }
  return {
    fecha: fecha(f.fecha), cuenta: f.cuenta, divisa: txt(f.divisa, 4), valor: num(f.valor), efectivo: num(f.efectivo),
    sp500eur: num(f.sp500eur), ordenesPendientes: num(f.ordenesPendientes), capitalInicial: num(f.capitalInicial),
    estrategias: ests, plan: limpiarPlan(f.plan),
    posiciones: lista(f.posiciones, 200).map(p => ({
      simbolo: txt(p.simbolo, 16), divisa: txt(p.divisa, 4), bolsa: txt(p.bolsa, 12), acciones: num(p.acciones),
      precioMedio: num(p.precioMedio), precio: num(p.precio), valor: num(p.valor), ganancia: num(p.ganancia),
      gananciaPct: num(p.gananciaPct), valorEur: num(p.valorEur), gananciaEur: num(p.gananciaEur),
      estrategia: txt(p.estrategia, 24) || null, desde: fecha(p.desde), dias: num(p.dias), semaforo: limpiarSemaforo(p.semaforo),
      ...(p.pendienteVenta === true ? {pendienteVenta: true} : {})})),
    cerradas: lista(f.cerradas, 300).map(c => ({
      simbolo: txt(c.simbolo, 16), estrategia: txt(c.estrategia, 24) || null, desde: fecha(c.desde), hasta: fecha(c.hasta),
      dias: num(c.dias), gananciaEur: num(c.gananciaEur), semaforo: limpiarSemaforo(c.semaforo)})),
    ejecuciones: lista(f.ejecuciones, 200).map(e => ({
      fecha: fecha(e.fecha), simbolo: txt(e.simbolo, 16), lado: e.lado === 'venta' ? 'venta' : 'compra',
      acciones: num(e.acciones), precio: num(e.precio), divisa: txt(e.divisa, 4), estrategia: txt(e.estrategia, 24) || null})),
  };
}

export function combinar(anterior, foto) {
  const historial = Array.isArray(anterior?.historial) ? anterior.historial.filter(h => h.fecha.slice(0, 10) !== foto.fecha.slice(0, 10)) : [];
  historial.push({fecha: foto.fecha, valor: foto.valor, sp500eur: foto.sp500eur,
    estrategias: Object.fromEntries(Object.entries(foto.estrategias || {}).map(([k, e]) => [k, e.valor])),
    // valor por participación de cada estrategia (sin el efecto del ahorro que entra), desde que hay plan del dinero
    ...(Object.values(foto.estrategias || {}).some(e => e.indice !== undefined)
      ? {indices: Object.fromEntries(Object.entries(foto.estrategias).filter(([, e]) => e.indice !== undefined).map(([k, e]) => [k, e.indice]))} : {})});
  historial.sort((a, b) => a.fecha.localeCompare(b.fecha));
  // ejecuciones: se acumulan (las de IBKR solo cubren los últimos días)
  const vistas = new Map((anterior?.ejecuciones || []).map(e => [`${e.fecha}|${e.simbolo}|${e.lado}`, e]));
  for (const e of foto.ejecuciones) vistas.set(`${e.fecha}|${e.simbolo}|${e.lado}`, e);
  const ejecuciones = [...vistas.values()].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 1000);
  return {schema: 1, inicio: historial[0].fecha, ultima: {...foto, ejecuciones: undefined}, historial: historial.slice(-2000), ejecuciones};
}

export async function guardar(db, foto) {
  const row = await db.prepare("SELECT payload,updated_at FROM personal_datasets WHERE name='ibkr-paper'").first();
  let anterior = null;
  try { anterior = row ? JSON.parse(row.payload) : null; } catch { anterior = null; }
  const datos = combinar(anterior, foto);
  await db.prepare("INSERT INTO personal_datasets(name,payload,updated_at) VALUES('ibkr-paper',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at")
    .bind(JSON.stringify(datos), new Date().toISOString()).run();
  return datos;
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/ibkr-paper-foto.mjs')) {
  const {readFileSync} = await import('node:fs');
  const foto = limpiarFoto(process.env.FOTO_FILE ? readFileSync(process.env.FOTO_FILE, 'utf8') : (process.env.FOTO || ''));
  const datos = await guardar(cloudDatabase(), foto);
  console.log(`Guardada la foto de ${foto.cuenta}: ${datos.historial.length} puntos en el histórico, ${foto.posiciones.length} posiciones.`);
}
