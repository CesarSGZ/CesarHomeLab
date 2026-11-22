"""¿Vuelve a entrar el aire caliente que sale de la caja? Misma S07 con poco y con mucho aire alrededor.

Uso:  python room.py [--cell 4] [--ext 36,100] [--cases S07_cpu,S07_comb]

Con los canales, lo medido dice que cargar la gráfica sube ~4,5 °C el procesador aunque este respire por su canal
aire del panel, y el CFD (36 mm de aire fuera, borde a 19 °C) no lo ve. Si la causa es que el chorro caliente de
arriba vuelve a entrar por los paneles, con más aire alrededor el CFD debería verlo: el aire que entra al
procesador y a la gráfica subirá con la gráfica cargada. Escribe una línea por caso en room-<cell>mm/resumen.txt
"""
import argparse
import json
import subprocess
import sys

from campaign import DATA, HERE, run


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cell', type=float, default=4.0)
    ap.add_argument('--ext', default='36,100')
    ap.add_argument('--cases', default='S07_cpu,S07_comb')
    ap.add_argument('--loops', type=int, default=4)
    a = ap.parse_args()
    root = DATA / 'cfd-casos' / f'room-{a.cell:g}mm'
    for ext in [float(x) for x in a.ext.split(',')]:
        for name in a.cases.split(','):
            out = root / f'ext{ext:g}'
            case = out / f'terra-{name}-{a.cell:g}mm'
            if not (case / 'results.json').exists():
                run([sys.executable, HERE / 'make_case.py', '--config', name, '--cell', a.cell, '--ext', ext, '--grille-k', 1.0,
                     '--out', out], stdout=subprocess.DEVNULL)
                run([sys.executable, HERE / 'run_case.py', case, '--np', '8', '--loops', str(a.loops), '--iters', '400'],
                    stdout=subprocess.DEVNULL)
            z = json.loads((case / 'results.json').read_text())['zone_T_C']
            g = (z['gpuFan1'] + z['gpuFan2'] + z['gpuFan3']) / 3
            line = (f"ext {ext:5g} {name:9} aire procesador {z['cpuFan']:.1f}  gráfica {g:.1f}  placa {z['boardAir']:.1f}  "
                    f"aletas proc {z['cpuFins']:.1f}  memoria {z['ram']:.1f}  fuente {z['psuIn']:.1f}")
            print(line, flush=True)
            with open(root / 'resumen.txt', 'a', encoding='utf-8') as fh:
                fh.write(line + '\n')


if __name__ == '__main__':
    main()
