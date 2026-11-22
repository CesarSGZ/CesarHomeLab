"""Acoplamiento gráfica ↔ procesador: simula las fases "solo gráfica" y "solo procesador" medidas y las predice.

Uso:  python phases.py [--cases S07_gpu,S07_cpu,...] [--cell 2.5] [--compare-only]

Cada fase se monta con sus vatios y rpm medidos (make_case.py --config S07_gpu) en la misma malla y con el mismo
aire de fuera que la campaña. Luego se predice con las constantes de la S04 combinada (compare.py), sin tocar nada.
Es la prueba que le faltó al modelo de agosto: cada carga por separado, así que se ve cuánto calienta una pieza a la otra.
La gráfica con los ventiladores parados (modo 0 rpm) no se predice: la ley h ∝ Q^0,7 no vale sin aire forzado.
Casos en Datos/Terra/cfd-casos/fases-<cell>mm/ y resumen en fases-<cell>mm/fases.json
"""
import argparse
import json
import subprocess
import sys

from campaign import DATA, HERE, run
import compare
from make_case import phase_steady

ORDER = ['S07_gpu', 'S07_cpu', 'S04_gpu', 'S04_cpu', 'S06_gpu', 'S06_cpu', 'S05_gpu', 'S05_cpu']


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cases', default=','.join(ORDER))
    ap.add_argument('--cell', type=float, default=2.5)
    ap.add_argument('--ext', type=float, default=36)
    ap.add_argument('--loops', type=int, default=3)
    ap.add_argument('--compare-only', action='store_true')
    ap.add_argument('--base', default=None, help='carpeta del caso S04 combinado para las constantes')
    a = ap.parse_args()
    out = DATA / 'cfd-casos' / f'fases-{a.cell:g}mm'
    base = a.base or DATA / 'cfd-casos' / f'campana-ext-{a.cell:g}mm' / f'terra-S04-{a.cell:g}mm-S04'
    c4 = compare.load(base)
    summary = {}
    for name in a.cases.split(','):
        case = out / f'terra-{name}-{a.cell:g}mm'
        if not (case / 'results.json').exists():
            if a.compare_only:
                continue
            run([sys.executable, HERE / 'make_case.py', '--config', name, '--cell', a.cell, '--ext', a.ext,
                 '--grille-k', 1.0, '--out', out], stdout=subprocess.DEVNULL)
            sid = name.split('_', 1)[0]
            warm = DATA / 'cfd-casos' / f'campana-ext-{a.cell:g}mm' / f'terra-{sid}-{a.cell:g}mm-{sid}'
            run([sys.executable, HERE / 'run_case.py', case, '--np', '8', '--loops', str(a.loops), '--iters', '500', '--warm', warm],
                stdout=subprocess.DEVNULL)
        sid, ph = name.split('_', 1)
        m = phase_steady(sid, {'comb': 'combined'}.get(ph, ph))
        compare.MEAS[name] = m
        p = compare.predict(c4, compare.load(case), name)
        rows = []
        for k in compare.KEYS:
            if k == 'GPU' and m['rpm_gpu'] < 300:
                continue
            rows.append({'id': k, 'meas': round(m[k], 1), 'pred': round(p[k], 1), 'err': round(p[k] - m[k], 1)})
        rms = (sum(r['err'] ** 2 for r in rows) / len(rows)) ** 0.5
        z = json.loads((case / 'results.json').read_text())['zone_T_C']
        summary[name] = {'rows': rows, 'rms_C': round(rms, 2), 'P_GPU': round(m['P_GPU'], 1), 'P_CPU': round(m['P_CPU'], 1),
                         'air': {'cpuFan': round(z['cpuFan'], 1), 'gpuFan': round((z['gpuFan1'] + z['gpuFan2'] + z['gpuFan3']) / 3, 1),
                                 'boardAir': round(z['boardAir'], 1), 'cpuFins': round(z['cpuFins'], 1)}}
        print(name, 'rms', round(rms, 2), ' '.join(f"{r['id']} {r['meas']}→{r['pred']} ({r['err']:+.1f})" for r in rows),
              '| aire CPU', summary[name]['air']['cpuFan'], 'GPU', summary[name]['air']['gpuFan'], flush=True)
        out.mkdir(parents=True, exist_ok=True)
        (out / 'fases.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8')


if __name__ == '__main__':
    main()
