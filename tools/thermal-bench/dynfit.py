"""Ajusta y valida el modelo dinámico acoplado (dynmodel.py) con el aire que da el CFD.

Uso:  python dynfit.py [--fit S04] [--json salida.json] [--mode cfd|datos]

Modo cfd (el bueno): el aire que llega a cada ventilador sale del CFD para cada montaje. Con tres casos por montaje
(solo gráfica, solo procesador y los dos, con sus vatios y rpm medidos) se saca, por superposición,
  T_aire − T_ambiente = c0 + c_g · P_gráfica + c_c · P_procesador.
Las piezas (resistencias, capacidades y la ley con las rpm) se ajustan con las sesiones de --fit y el resto se
predice a ciegas, traza completa de 71 min, con las rpm y los vatios medidos como entrada.
Modo datos: el aire de cada sesión se ajusta con sus propios datos (sirve para ver si las piezas se transfieren).
"""
import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
from scipy.optimize import least_squares

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import dynmodel as dm  # noqa: E402

CFD = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'cfd-casos'
SESSIONS = ['S04', 'S05', 'S06', 'S07']
P0 = dict(C1g=3, R1g=0.08, C2g=400, Gg_nat=1.4, Gg_f=14, C1c=2, R1c=0.46, C2c=500, Gc_nat=0.25, Gc_f=13, tau_a=140, C3g=600, R23g=0.3)
FIXED = {'Gc_nat': 0.25}     # convección natural de un disipador de 90 mm (~5 W/m²K × 0,05 m²): sin ventilador casi no hay datos
KS = ('gpuFan1', 'gpuFan2', 'gpuFan3')


def cfd_inlets(results):
    z, f = results['zone_T_C'], results['fans']
    q = [max(f[k]['Q_m3h'], 0.0) for k in KS]
    gpu = sum(z[k] * qq for k, qq in zip(KS, q)) / sum(q) if sum(q) > 5 else sum(z[k] for k in KS) / 3
    return gpu, z['cpuFan']


P_OTHER = 40.0


def cfd_air(sid, cell=2.5, kappa=0.0):
    """Aire de cada entrada para un montaje, por superposición de tres casos del CFD con los vatios y rpm medidos:
    solo gráfica, solo procesador y los dos. Sin calor, el aire es el de la habitación (más κ · resto).
      gráfica con su ventilador girando: fases "solo gráfica" y "las dos"     → c_gg, c_gc
      gráfica con el ventilador parado: fase "solo procesador" (aire quieto)  → p_gc (p_gg = c_gg)
      procesador: las tres fases                                              → c0, c_cg, c_cc
    """
    sys.path.insert(0, str(HERE.parent / 'terra-cfd' / 'openfoam'))
    from make_case import phase_steady
    pts = {}
    for ph, folder in (('gpu', CFD / f'fases-{cell:g}mm' / f'terra-{sid}_gpu-{cell:g}mm'),
                       ('cpu', CFD / f'fases-{cell:g}mm' / f'terra-{sid}_cpu-{cell:g}mm'),
                       ('combined', CFD / f'campana-ext-{cell:g}mm' / f'terra-{sid}-{cell:g}mm-{sid}')):
        r = json.loads((folder / 'results.json').read_text())
        m = phase_steady(sid, ph)
        g, c = cfd_inlets(r)
        pts[ph] = (m['P_GPU'], m['P_CPU'], g - m['ambient_C'], c - m['ambient_C'])
    # gráfica (ventiladores girando): dos casos, sin término independiente
    A = np.array([[pts[k][0], pts[k][1]] for k in ('gpu', 'combined')])
    cgg, cgc = np.linalg.solve(A, [pts[k][2] for k in ('gpu', 'combined')])
    pg, pc, gpass, _ = pts['cpu']
    pgc = (gpass - cgg * pg) / pc
    A = np.array([[1, pts[k][0], pts[k][1]] for k in ('gpu', 'cpu', 'combined')])
    c0c, ccg, ccc = np.linalg.solve(A, [pts[k][3] for k in ('gpu', 'cpu', 'combined')])
    # aire alrededor del PC: sube κ por vatio que sale de la caja (calibrado con las fases de la S04, model4.py)
    return {'c0g': kappa * P_OTHER, 'cgg': cgg + kappa, 'cgc': cgc + kappa,
            'p0g': kappa * P_OTHER, 'pgg': cgg + kappa, 'pgc': pgc + kappa,
            'c0c': c0c + kappa * P_OTHER, 'ccg': ccg + kappa, 'ccc': ccc + kappa}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fit', default='S04')
    ap.add_argument('--mode', default='cfd', choices=['cfd', 'datos'])
    ap.add_argument('--json')
    ap.add_argument('--fixed', default='{}', help='parámetros fijos extra en JSON')
    ap.add_argument('--kappa', type=float, default=None, help='°C por W alrededor del PC (por defecto, el de model4 con la S04)')
    a = ap.parse_args()
    fit = a.fit.split(',')
    fixed = dict(FIXED, **json.loads(a.fixed))
    free = [k for k in dm.DEV if k not in fixed]
    D = {s: dm.load(s) for s in SESSIONS}
    if a.kappa is None:
        sys.path.insert(0, str(HERE.parent / 'terra-cfd' / 'openfoam'))
        import compare
        import model4
        cal = [(compare.load(f), m) for n, f, m in model4.cases() if n.startswith('S04')]
        a.kappa = model4.calibrate(cal)['kappa']
    print('κ =', round(a.kappa, 4), '°C/W')
    air = {}
    for s in list(SESSIONS):
        try:
            air[s] = cfd_air(s, kappa=a.kappa)
        except FileNotFoundError:
            SESSIONS.remove(s)          # faltan sus fases en el CFD
    print('sesiones con aire del CFD:', SESSIONS)
    # canal del procesador: mismas dos constantes que el modelo en régimen (model4.duct_terms), cruzadas: las que
    # predicen la S07 salen de la S06 y al revés, para que ninguna de las dos se use para ajustarse a sí misma
    reg = CFD.parent / 'modelo' / 'regimen.json'
    if reg.exists() and a.mode == 'cfd':
        cross = json.loads(reg.read_text(encoding='utf-8'))['duct_cross']
        for s, (lam, mu) in cross.items():
            if s in air:
                air[s]['ccg'] += lam
                air[s]['c0c'] -= lam * 21.0
                air[s]['ccc'] += mu
        print('canal (λ, μ) cruzado:', cross)

    def params(x):
        p = dict(P0, **fixed)
        p.update({k: float(np.exp(v)) for k, v in zip(free, x)})
        return p

    def resid(x):
        p = params(x)
        return np.concatenate([np.concatenate([o[:, 0] - D[s]['Tg'], o[:, 1] - D[s]['Tc']])
                               for s in fit for o in [dm.simulate(p, air[s], D[s])]])

    if a.mode == 'datos':
        raise SystemExit('modo datos: ver el script de exploración')
    x0 = [np.log(P0[k]) for k in free]
    sol = least_squares(resid, x0, bounds=([v - 4 for v in x0], [v + 4 for v in x0]), x_scale='jac')
    p = params(sol.x)
    report = {'mode': a.mode, 'fit': fit, 'kappa': a.kappa, 'params': {k: round(v, 5) for k, v in p.items()},
              'air': {s: {k: round(float(v), 5) for k, v in air[s].items()} for s in SESSIONS}, 'sessions': {}}
    print('ajuste con', fit, sol.message)
    print('piezas', {k: round(v, 4) for k, v in p.items()})
    for s in SESSIONS:
        d = D[s]
        o = dm.simulate(p, air[s], d)
        rg, fg = dm.metrics(o[:, 0], d['Tg'])
        rc, fc = dm.metrics(o[:, 1], d['Tc'])
        steady = {}
        for ph in ('idle', 'gpu', 'cpu', 'combined'):
            k = dm.steady_mask(d, ph)
            steady[ph] = {'gpu_meas': round(float(d['Tg'][k].mean()), 2), 'gpu_pred': round(float(o[k, 0].mean()), 2),
                          'cpu_meas': round(float(d['Tc'][k].mean()), 2), 'cpu_pred': round(float(o[k, 1].mean()), 2)}
        step = 10
        report['sessions'][s] = {
            'role': 'ajuste' if s in fit else 'a ciegas', 'gpu_rmse': round(rg, 2), 'gpu_fit_pct': round(fg, 1),
            'cpu_rmse': round(rc, 2), 'cpu_fit_pct': round(fc, 1), 'steady': steady,
            'trace': {'t_s': d['t'][::step].astype(int).tolist(), 'phase': d['phase'][::step].tolist(),
                      'gpu_meas': np.round(d['Tg'][::step], 1).tolist(), 'gpu_pred': np.round(o[::step, 0], 1).tolist(),
                      'cpu_meas': np.round(d['Tc'][::step], 1).tolist(), 'cpu_pred': np.round(o[::step, 1], 1).tolist(),
                      'gpu_W': np.round(d['Pg'][::step]).tolist(), 'cpu_W': np.round(d['Pc'][::step], 1).tolist()}}
        ss = ' | '.join(f"{ph[:4]} g {v['gpu_pred'] - v['gpu_meas']:+.1f} c {v['cpu_pred'] - v['cpu_meas']:+.1f}" for ph, v in steady.items())
        print(f"{s} {'ajuste ' if s in fit else 'a ciegas'} gráfica {rg:.2f} °C ({fg:.0f} %)  procesador {rc:.2f} °C ({fc:.0f} %)  {ss}")
        print('   aire CFD', {k: round(float(v), 4) for k, v in air[s].items()})
    if a.json:
        Path(a.json).write_text(json.dumps(report, ensure_ascii=False), encoding='utf-8')


if __name__ == '__main__':
    main()
