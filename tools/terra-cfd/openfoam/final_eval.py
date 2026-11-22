"""Evaluación final del modelo en régimen (CFD + piezas, model4.py) con el protocolo a ciegas.

Uso:  python final_eval.py [--json salida.json]

Protocolo (fijado antes de mirar los resultados a ciegas de cada paso):
1. Las piezas se calibran con las tres fases de la S04 (sin canales): solo gráfica, solo procesador y las dos.
2. S05 (sin paneles, sin canales) se predice a ciegas con eso.
3. Con canal del procesador hacen falta dos constantes más (λ, μ: ver model4.duct_terms). Se calibran con una sesión
   con canal y se predice a ciegas la otra: S06 → S07 y S07 → S06. Para usar el modelo (¿y si…?) se sacan de las dos.
"""
import argparse
import json
from pathlib import Path

import numpy as np

import compare
import model4 as M

DUCT = {'S04': False, 'S05': False, 'S06': True, 'S07': True}
PH = ('gpu', 'cpu', 'comb')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json')
    a = ap.parse_args()
    L = {n: (compare.load(f), m) for n, f, m in M.cases()}
    p = M.calibrate([L[f'S04_{x}'] for x in PH])
    duct_from = {'S07': M.calibrate_duct(p, [L[f'S06_{x}'] for x in PH]),
                 'S06': M.calibrate_duct(p, [L[f'S07_{x}'] for x in PH])}
    duct_all = M.calibrate_duct(p, [L[f'{s}_{x}'] for s in ('S06', 'S07') for x in PH])
    out = {'params': p, 'duct_cross': duct_from, 'duct_final': duct_all, 'cases': {}}
    allblind = []
    for s in ('S04', 'S07', 'S05', 'S06'):
        for x in PH:
            c, m = L[f'{s}_{x}']
            pr = M.predict_full(p, c, m, duct_from.get(s) if DUCT[s] else None)
            r, e = M.rows(pr, m)
            role = 'calib' if s == 'S04' else 'blind'
            if role == 'blind':
                allblind += [q['err'] for q in r]
            out['cases'][f'{s}_{x}'] = {'role': role, 'rows': r, 'rms_C': e, 'P_GPU': round(m['P_GPU'], 1), 'P_CPU': round(m['P_CPU'], 1)}
            print(f"{s}_{x:4} {role:5} rms {e:.2f} | " + ' '.join(f"{q['id']} {q['err']:+.1f}" for q in r))
    rms = (sum(v * v for v in allblind) / len(allblind)) ** 0.5
    out['blind_rms_C'] = round(rms, 2)
    out['blind_max_C'] = round(max(map(abs, allblind)), 1)
    out['blind_n'] = len(allblind)
    out['blind_within_2C'] = round(sum(abs(v) <= 2 for v in allblind) / len(allblind), 3)
    print(f'a ciegas: {len(allblind)} comparaciones, rms {rms:.2f} °C, máx {out["blind_max_C"]} °C, '
          f'{100 * out["blind_within_2C"]:.0f} % dentro de ±2 °C')
    print('canal: cruzado', {k: [round(v, 4) for v in t] for k, t in duct_from.items()}, 'final', [round(v, 4) for v in duct_all])
    if a.json:
        Path(a.json).write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding='utf-8')


if __name__ == '__main__':
    main()
