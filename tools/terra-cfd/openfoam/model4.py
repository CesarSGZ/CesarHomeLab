"""Modelo de piezas v4 sobre el CFD: se calibra con las TRES fases de la S04 y predice todo lo demás a ciegas.

Por qué: con una sola carga (la combinada de la S04) cada pieza solo admite una constante, y las fases con una
sola carga (solo gráfica / solo procesador) mostraron que el salto sobre el aire tiene una parte fija y otra que
crece con la potencia. La S04 tiene tres fases medidas; con ellas se separan las dos partes sin mirar S05, S06 ni S07.

Piezas (T_aire sale del CFD de cada caso; P medidas):
  gráfica     T = T_aire_gráfica + R_g · (Q/Q_S04)^−0,7 · P_gráfica          (solo fases con su ventilador girando)
  procesador  T = T_aire_proc + 0,20 · (Q/Q_S04)^−0,7 · PPT + a · PPT + b · (PPT − SoC)
              (0,20 K/W = disipador, de su ficha; a = pasta e IHS, que ven toda la potencia; b = silicio de los
              núcleos, que solo ve la potencia de núcleos)
  VRM, chipset, sensor de la placa   T = T_aire_placa + a + b · PPT
  memoria     T = w · T_placa + (1 − w) · T_aire_memoria + c,  w = 0,7 (ver compare.py)
Mínimos cuadrados con 2-3 puntos de la S04 por pieza; si una constante sale negativa se fija a 0 (no hay física para ella).
"""
import json
from pathlib import Path

import numpy as np

import compare

R_FIN_CPU = 0.20
W_RAM = 0.70
KEYS = ('GPU', 'CPU', 'VRM', 'CHIPSET', 'BOARD', 'RAM')


def air(c):
    """Aire de cada pieza en un caso cargado con compare.load (y la Q de su ventilador)."""
    return {'GPU': c['GPU'], 'CPU': c['CPU'], 'BOARD': c['BOARD'][0], 'RAM': c['RAM'][0]}


def gpu_on(m):
    return m.get('rpm_gpu', 2000) > 300


def nnls_fit(A, y):
    from scipy.optimize import nnls
    x, _ = nnls(np.asarray(A, float), np.asarray(y, float))
    return x


P_OTHER = 40.0          # W del resto (placa, fuente, memoria, discos) que también salen de la caja
CPU_BASE = True         # salida del procesador: base del chip (True) o media de núcleos (False)
KAPPA = True            # el aire alrededor del PC sube κ · P_total (la habitación no es un baño a 19 °C)


def p_tot(m):
    return m['P_GPU'] + m['P_CPU'] + P_OTHER


def _design(c, m, q4g, q4c):
    """Filas del sistema lineal: y = A · θ, θ = [κ, R_g, a_cpu, b_cpu, v0, v1, ch0, ch1, b0, b1, c_ram]."""
    ag = air(c)
    k = p_tot(m) if KAPPA else 0.0
    rows, ys, ids = [], [], []
    if gpu_on(m):
        t, q = ag['GPU']
        rows.append([k, (q / q4g) ** -0.7 * m['P_GPU'], 0, 0, 0, 0, 0, 0, 0, 0, 0]); ys.append(m['GPU'] - t); ids.append('GPU')
    t, q = ag['CPU']
    if CPU_BASE:      # base del chip (media de T_núcleo − 2,05 · P_núcleo): no depende de cuántos núcleos cargue Windows
        rows.append([k, 0, m['P_CPU'], 0, 0, 0, 0, 0, 0, 0, 0])
        ys.append(m['CPU_BASE'] - t - R_FIN_CPU * (q / q4c) ** -0.7 * m['P_CPU']); ids.append('CPU')
    else:
        rows.append([k, 0, m['P_CPU'], m['P_CPU'] - m['P_SOC'], 0, 0, 0, 0, 0, 0, 0])
        ys.append(m['CPU'] - t - R_FIN_CPU * (q / q4c) ** -0.7 * m['P_CPU']); ids.append('CPU')
    for name, col in (('VRM', 4), ('CHIPSET', 6), ('BOARD', 8)):
        r = [k] + [0] * 10
        r[col], r[col + 1] = 1.0, m['P_CPU']
        rows.append(r); ys.append(m[name] - ag['BOARD']); ids.append(name)
    r = [k, 0, 0, 0, 0, 0, 0, 0, W_RAM, W_RAM * m['P_CPU'], 1.0]
    rows.append(r); ys.append(m['RAM'] - W_RAM * ag['BOARD'] - (1 - W_RAM) * ag['RAM']); ids.append('RAM')
    return rows, ys, ids


def calibrate(cal, kappa=None):
    """cal: lista de (caso cargado, medidas) de la S04 (fases y combinada). Ajuste conjunto, todas las constantes ≥ 0
    salvo la de la memoria (puede ser de cualquier signo)."""
    ref = next(c for c, m in cal if gpu_on(m) and m['P_CPU'] > 70)       # la combinada: referencia de caudales
    q4g, q4c = ref['GPU'][1], ref['CPU'][1]
    A, y = [], []
    for c, m in cal:
        r, v, _ = _design(c, m, q4g, q4c)
        A += r; y += v
    A, y = np.array(A, float), np.array(y, float)
    from scipy.optimize import lsq_linear
    lo = [0.0] * 10 + [-20.0]
    hi = [np.inf] * 11
    if not KAPPA:
        hi[0] = 1e-12
    if kappa is not None:          # κ fijado desde fuera (p. ej. por el CFD con más aire alrededor)
        lo[0], hi[0] = kappa, kappa + 1e-12
    th = lsq_linear(A, y, bounds=(lo, hi)).x
    names = ['kappa', 'R_g', 'a_cpu', 'b_cpu', 'v0', 'v1', 'ch0', 'ch1', 'b0', 'b1', 'c_ram']
    p = dict(zip(names, map(float, th)))
    p.update(q4g=q4g, q4c=q4c)
    return p


def predict(p, c, m):
    th = [p[k] for k in ('kappa', 'R_g', 'a_cpu', 'b_cpu', 'v0', 'v1', 'ch0', 'ch1', 'b0', 'b1', 'c_ram')]
    r, _, ids = _design(c, m, p['q4g'], p['q4c'])
    ag = air(c)
    base = {}
    if gpu_on(m):
        base['GPU'] = ag['GPU'][0]
    base['CPU'] = ag['CPU'][0] + R_FIN_CPU * (ag['CPU'][1] / p['q4c']) ** -0.7 * m['P_CPU']
    for k in ('VRM', 'CHIPSET', 'BOARD'):
        base[k] = ag['BOARD']
    base['RAM'] = W_RAM * ag['BOARD'] + (1 - W_RAM) * ag['RAM']
    out = {i: base[i] + float(np.dot(row, th)) for row, i in zip(r, ids)}
    out.setdefault('GPU', None)
    return out


def meas_of(m, k):
    return m['CPU_BASE'] if (k == 'CPU' and CPU_BASE) else m[k]


BOARD_SIDE = ('CPU', 'VRM', 'CHIPSET', 'BOARD', 'RAM')
P_GPU_IDLE = 21.0


def duct_terms(m):
    """Con el canal del procesador el CFD separa demasiado el lado de la placa del calor de la gráfica, y le da
    demasiado del calor propio del procesador. Dos constantes, iguales para todo el lado de la placa:
        ΔT = λ · (P_gráfica − reposo) + μ · P_procesador"""
    return m['P_GPU'] - P_GPU_IDLE, m['P_CPU']


def calibrate_duct(p, cal):
    """λ, μ por mínimos cuadrados con las fases de sesiones con canal del procesador (el error es lineal en ellos)."""
    A, y = [], []
    for c, m in cal:
        pr = predict(p, c, m)
        g, q = duct_terms(m)
        for k in BOARD_SIDE:
            A.append([g, q]); y.append(meas_of(m, k) - pr[k])
    (lam, mu), *_ = np.linalg.lstsq(np.array(A), np.array(y), rcond=None)
    return float(lam), float(mu)


def predict_full(p, c, m, duct=None):
    """predict + corrección del canal del procesador si duct = (λ, μ)."""
    out = predict(p, c, m)
    if duct:
        g, q = duct_terms(m)
        for k in BOARD_SIDE:
            out[k] += duct[0] * g + duct[1] * q
    return out


def rows(pred, m):
    r = [{'id': k, 'meas': round(meas_of(m, k), 1), 'pred': round(pred[k], 1), 'err': round(pred[k] - meas_of(m, k), 1)} for k in KEYS if pred.get(k) is not None]
    return r, round((sum(x['err'] ** 2 for x in r) / len(r)) ** 0.5, 2)


def cases(cell=2.5):
    """Todos los casos medidos: (nombre, carpeta, medidas). Combinadas de la campaña y fases de fases-<cell>mm."""
    from make_case import phase_steady
    from campaign import DATA
    out = []
    for sid in ('S04', 'S07', 'S05', 'S06'):
        out.append((f'{sid}_comb', DATA / 'cfd-casos' / f'campana-ext-{cell:g}mm' / f'terra-{sid}-{cell:g}mm-{sid}', phase_steady(sid, 'combined')))
        for ph in ('gpu', 'cpu'):
            out.append((f'{sid}_{ph}', DATA / 'cfd-casos' / f'fases-{cell:g}mm' / f'terra-{sid}_{ph}-{cell:g}mm', phase_steady(sid, ph)))
    return [(n, f, m) for n, f, m in out if (Path(f) / 'results.json').exists()]


if __name__ == '__main__':
    import sys
    allc = cases()
    loaded = {n: (compare.load(f), m) for n, f, m in allc}
    cal = [loaded[n] for n in loaded if n.startswith('S04')]
    p = calibrate(cal)
    print('constantes (S04, %d fases):' % len(cal), json.dumps({k: round(v, 4) for k, v in p.items()}))
    allerr = []
    for n, (c, m) in loaded.items():
        r, e = rows(predict(p, c, m), m)
        if not n.startswith('S04'):
            allerr += [x['err'] for x in r]
        print(f"{n:9} {'calib' if n.startswith('S04') else 'ciegas'} rms {e:.2f}  " + ' '.join(f"{x['id']} {x['err']:+.1f}" for x in r))
    if allerr:
        print('a ciegas: rms %.2f max %.1f (n=%d)' % ((sum(e * e for e in allerr) / len(allerr)) ** 0.5, max(map(abs, allerr)), len(allerr)))
