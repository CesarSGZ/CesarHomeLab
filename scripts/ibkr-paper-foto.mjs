// Cartera paper de IBKR · guarda en D1 la foto que manda backtest-lab/ibkr_paper.py --foto (vía workflow_dispatch).
// Solo acepta campos conocidos y con el tipo esperado; añade un punto al histórico (uno por día).
import {cloudDatabase} from './office-cloud-db.mjs';

const num = x => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const txt = (x, max = 40) => (typeof x === 'string' ? x.slice(0, max) : '');
const fecha = x => (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}([T ][\d:.+\-Z]+)?$/.test(x) ? x.slice(0, 25) : null);

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
      noRealizada: num(e.noRealizada), realizada: num(e.realizada), posiciones: num(e.posiciones)};
  }
  return {
    fecha: fecha(f.fecha), cuenta: f.cuenta, divisa: txt(f.divisa, 4), valor: num(f.valor), efectivo: num(f.efectivo),
    sp500eur: num(f.sp500eur), ordenesPendientes: num(f.ordenesPendientes), capitalInicial: num(f.capitalInicial),
    estrategias: ests,
    posiciones: lista(f.posiciones, 200).map(p => ({
      simbolo: txt(p.simbolo, 16), divisa: txt(p.divisa, 4), bolsa: txt(p.bolsa, 12), acciones: num(p.acciones),
      precioMedio: num(p.precioMedio), precio: num(p.precio), valor: num(p.valor), ganancia: num(p.ganancia),
      gananciaPct: num(p.gananciaPct), valorEur: num(p.valorEur), gananciaEur: num(p.gananciaEur),
      estrategia: txt(p.estrategia, 24) || null})),
    ejecuciones: lista(f.ejecuciones, 200).map(e => ({
      fecha: fecha(e.fecha), simbolo: txt(e.simbolo, 16), lado: e.lado === 'venta' ? 'venta' : 'compra',
      acciones: num(e.acciones), precio: num(e.precio), divisa: txt(e.divisa, 4), estrategia: txt(e.estrategia, 24) || null})),
  };
}

export function combinar(anterior, foto) {
  const historial = Array.isArray(anterior?.historial) ? anterior.historial.filter(h => h.fecha.slice(0, 10) !== foto.fecha.slice(0, 10)) : [];
  historial.push({fecha: foto.fecha, valor: foto.valor, sp500eur: foto.sp500eur,
    estrategias: Object.fromEntries(Object.entries(foto.estrategias || {}).map(([k, e]) => [k, e.valor]))});
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
  const foto = limpiarFoto(process.env.FOTO || '');
  const datos = await guardar(cloudDatabase(), foto);
  console.log(`Guardada la foto de ${foto.cuenta}: ${datos.historial.length} puntos en el histórico, ${foto.posiciones.length} posiciones.`);
}
