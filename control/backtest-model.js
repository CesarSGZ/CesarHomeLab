// Backtest Lab · límites de los parámetros que se pueden cambiar desde la web.
// Lo usan el formulario (navegador) y la API (Pages Function). Python vuelve a validarlos
// (backtest-lab/estrategias.py, PARAMETROS_WEB): ninguna capa confía en la anterior.
export const MOMENTUM_LOOKBACKS = Object.freeze({
  mom_3m: '3 meses', mom_6m: '6 meses', mom_12m: '12 meses', mom_12_1: '12 meses sin el último',
});

export const PARAM_LIMITS = Object.freeze({
  vct: Object.freeze({
    n: {type: 'int', min: 5, max: 20, default: 12, label: 'Posiciones'},
    holgura: {type: 'float', min: 1, max: 1.5, default: 1.15, step: 0.05, label: 'Margen antes de vender por valoración'},
    dn_max: {type: 'float', min: 1, max: 6, default: 3, step: 0.5, label: 'Deuda neta / EBITDA máxima'},
    liquidez_min: {type: 'float', min: 250000, max: 10000000, default: 1000000, step: 250000, label: 'Liquidez mínima diaria (€)'},
    capital: {type: 'float', min: 5000, max: 1000000, default: 50000, step: 5000, label: 'Capital inicial (€)'},
  }),
  momentum: Object.freeze({
    modo: {type: 'enum', values: ['auto', 'manual'], default: 'auto', label: 'Elección de parámetros'},
    n: {type: 'int', min: 5, max: 25, default: 15, label: 'Posiciones'},
    momentum: {type: 'enum', values: Object.keys(MOMENTUM_LOOKBACKS), default: 'mom_3m', label: 'Ventana de momentum'},
    banda: {type: 'float', min: 1, max: 4, default: 2.5, step: 0.5, label: 'Holgura de venta (× posiciones)'},
    liquidez_min: {type: 'float', min: 250000, max: 10000000, default: 1000000, step: 250000, label: 'Liquidez mínima diaria (€)'},
    capital: {type: 'float', min: 5000, max: 1000000, default: 50000, step: 5000, label: 'Capital inicial (€)'},
  }),
});

// Devuelve solo parámetros conocidos y dentro de límites; lanza si algo no encaja.
export function validateBacktestParams(input) {
  if (input === undefined || input === null) return {vct: {}, momentum: {}};
  if (typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid_params');
  const clean = {vct: {}, momentum: {}};
  for (const key of Object.keys(input)) if (!(key in PARAM_LIMITS)) throw new Error('invalid_params');
  for (const [strategy, limits] of Object.entries(PARAM_LIMITS)) {
    const values = input[strategy] ?? {};
    if (typeof values !== 'object' || Array.isArray(values)) throw new Error('invalid_params');
    for (const [name, value] of Object.entries(values)) {
      const limit = limits[name];
      if (!limit) throw new Error('invalid_params');
      if (limit.type === 'enum') {
        if (!limit.values.includes(value)) throw new Error('invalid_params');
        clean[strategy][name] = value;
        continue;
      }
      const number = Number(value);
      if (typeof value === 'boolean' || value === '' || !Number.isFinite(number) || number < limit.min || number > limit.max) throw new Error('invalid_params');
      if (limit.type === 'int' && !Number.isInteger(number)) throw new Error('invalid_params');
      clean[strategy][name] = number;
    }
  }
  return clean;
}

// Una ejecución "running" que lleva más de esto se considera caída y no bloquea otra nueva.
export const STALE_RUN_MS = 75 * 60 * 1000;

export function requestIsActive(request, now = Date.now()) {
  if (!request) return false;
  if (request.status === 'queued') return now - Date.parse(request.requestedAt || 0) < 24 * 3600e3;
  if (request.status === 'running') return now - Date.parse(request.startedAt || request.requestedAt || 0) < STALE_RUN_MS;
  return false;
}
