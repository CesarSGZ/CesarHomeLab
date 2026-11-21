"""Criba rápida de hipótesis: S04 y S07 (y si se pide S05/S06) en malla gruesa y compare.py.

Uso:  python screen.py <nombre> [--cell 4] [--cases S04,S07] -- [opciones extra de make_case]
Resultados en Datos/Terra/cfd-casos/criba-<cell>mm/<nombre>/ y una línea en criba-<cell>mm/resumen.txt
"""
import argparse
import json
import subprocess
import sys

from campaign import CASES, DATA, HERE, run
from compare import MEAS, load, predict

ap = argparse.ArgumentParser()
ap.add_argument('name')
ap.add_argument('--cell', type=float, default=4.0)
ap.add_argument('--ext', type=float, default=36)
ap.add_argument('--grille-k', type=float, default=1.0)
ap.add_argument('--cases', default='S04,S07')
ap.add_argument('--loops', type=int, default=4)
ap.add_argument('extra', nargs=argparse.REMAINDER)
a = ap.parse_args()
extra = [x for x in a.extra if x != '--']
root = DATA / 'cfd-casos' / f'criba-{a.cell:g}mm'
out = root / a.name
want = a.cases.split(',')
found = {}
for name, cfg, rpm, flip in CASES:
    if name not in want:
        continue
    case = out / f'terra-{cfg}-{a.cell:g}mm-{name}'
    if not (case / 'results.json').exists():
        cmd = [sys.executable, HERE / 'make_case.py', '--config', cfg, '--cell', a.cell, '--ext', a.ext,
               '--grille-k', a.grille_k, f'--tag=-{name}', '--out', out, *extra]
        for r in rpm:
            cmd += ['--rpm', r]
        for f in flip:
            cmd += ['--panels-off'] if f == 'PANELS_OFF' else ['--flip', f]
        run(cmd, stdout=subprocess.DEVNULL)
        run([sys.executable, HERE / 'run_case.py', case, '--np', '8', '--loops', str(a.loops), '--iters', '400'], stdout=subprocess.DEVNULL)
    found[name] = load(case)
lines = []
for sid in [s for s in want if s != 'S04']:
    p = predict(found['S04'], found[sid], sid)
    err = {k: round(v - MEAS[sid][k], 1) for k, v in p.items()}
    rms = (sum(e * e for e in err.values()) / len(err)) ** 0.5
    z4, zx = found['S04']['raw']['zone_T_C'], found[sid]['raw']['zone_T_C']
    lines.append(f"{a.name:22s} {sid} err {json.dumps(err)} rms {rms:.2f} | cpuIn {z4['cpuFan']:.1f}->{zx['cpuFan']:.1f} "
                 f"gpuIn {found['S04']['GPU'][0]:.1f}->{found[sid]['GPU'][0]:.1f} exh {z4['cpuFins']:.1f}->{zx['cpuFins']:.1f} "
                 f"extra {' '.join(extra)}")
for ln in lines:
    print(ln)
with open(root / 'resumen.txt', 'a', encoding='utf-8') as fh:
    fh.write('\n'.join(lines) + '\n')
