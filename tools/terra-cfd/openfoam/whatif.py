"""¿Y si…? Escenarios sobre el montaje actual (S07: los dos canales), simulados y predichos en bucle cerrado.

Uso:  python whatif.py [--run] [--only id1,id2] [--cell 2.5] [--json salida.json]

Cada escenario es un caso del CFD con la misma malla que la S07 (mismos canales y paneles), así que arranca en
caliente desde la S07 convergida y tarda ~15 min. Luego se predice cada pieza con las constantes de la S04 (compare.py)
y se cierra el bucle del ventilador de la gráfica: si el aire le llega más frío, su ventilador baja de vueltas
(curva medida en S04-S07, en régimen: rpm ≈ −956 + 38,5 · T) y la temperatura baja menos de lo que bajaría a rpm fijas.
El procesador va pegado a su límite: se compara a igual potencia (91,6 W, la de la S07) y con su ventilador como en la S07.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

from campaign import DATA, HERE, run
import compare
import model4

GPU_CURVE = (-956.0, 38.5)          # rpm = a + b · T_gráfica (régimen, sesiones S04-S07), por debajo de 78 °C
GPU_TARGET = 78.0                   # en S01-S05 la gráfica se queda clavada en 78 °C y lo que cambia son las rpm (2020-2196):
GPU_HOLD = 400.0                    # por encima de 78 °C el ventilador sube lo que haga falta (rpm por °C de más)
GPU_RPM_RANGE = (1000.0, 3300.0)


def gpu_fan(t):
    return GPU_CURVE[0] + GPU_CURVE[1] * min(t, GPU_TARGET) + GPU_HOLD * max(0.0, t - GPU_TARGET)
BASE = {'BOTTOM_FAN': 1206, 'TOP_FAN': 2200}      # como en la campaña (S07)

# id, es, en, grupo, opciones de make_case
SCENARIOS = [
    ('s07', 'Como está', 'As built', 'base', []),
    ('top-in', 'Arriba metiendo aire', 'Top fan as intake', 'dir', ['--flip', 'TOP_FAN']),
    ('bottom-out', 'Abajo sacando aire', 'Bottom fan as exhaust', 'dir', ['--flip', 'BOTTOM_FAN']),
    ('both-flipped', 'Los dos al revés', 'Both reversed', 'dir', ['--flip', 'TOP_FAN', '--flip', 'BOTTOM_FAN']),
    ('bottom-max', 'Abajo a tope (1850 rpm)', 'Bottom fan at full speed (1850 rpm)', 'speed', ['--rpm', 'BOTTOM_FAN=1850']),
    ('bottom-slow', 'Abajo lento (800 rpm)', 'Bottom fan slow (800 rpm)', 'speed', ['--rpm', 'BOTTOM_FAN=800']),
    ('top-slow', 'Arriba más lento (1500 rpm)', 'Top fan slower (1500 rpm)', 'speed', ['--rpm', 'TOP_FAN=1500']),
    ('bottom-off', 'Sin ventilador abajo (parado)', 'Bottom fan stopped', 'speed', ['--rpm', 'BOTTOM_FAN=1']),
    ('bottom-out-max', 'Abajo sacando aire y a tope', 'Bottom fan exhausting at full speed', 'dir', ['--flip', 'BOTTOM_FAN', '--rpm', 'BOTTOM_FAN=1850']),
    ('cpu-fan-max', 'Ventilador del procesador al 100 %', 'CPU fan at 100%', 'cpu', ['--rpm', 'CPU_FAN=2200']),
    ('cpu-push-pull', 'Segundo ventilador en el canal del procesador', 'Second fan in the CPU duct', 'cpu', ['--fan-model', 'CPU_FAN=NF-A9x14-x2']),
    ('gpu-280w', 'Gráfica limitada a 280 W', 'GPU capped at 280 W', 'gpu', ['--heat', 'GPU=280']),
]
EXISTING = {'s07': 'S07', 'top-in': 'S07-top-in', 'bottom-out': 'S07-bottom-out', 'both-flipped': 'S07-both-flipped'}


def case_dir(sid, cell):
    if sid in EXISTING:
        name = EXISTING[sid]
        return DATA / 'cfd-casos' / f'campana-ext-{cell:g}mm' / f'terra-S07-{cell:g}mm-{name}'
    return DATA / 'cfd-casos' / f'escenarios-{cell:g}mm' / f'terra-S07-{cell:g}mm-{sid}'


def closed_loop(model, cx, p_gpu, p_cpu):
    """Predicción con el bucle del ventilador de la gráfica cerrado (model4 calibrado con la S04 + canal).
    Devuelve piezas y rpm de la gráfica."""
    p, duct, base_meas = model
    m = dict(base_meas, P_GPU=p_gpu, P_CPU=p_cpu)
    t_in, q_case = cx['GPU']
    n_case = cx['raw']['fans']['gpuFan1']['rpm']
    n = n_case
    for _ in range(400):
        cx_n = dict(cx, GPU=(t_in, q_case * n / n_case))     # Q ∝ rpm en el mismo sistema
        pr = model4.predict_full(p, cx_n, m, duct)
        n_new = min(max(gpu_fan(pr['GPU']), GPU_RPM_RANGE[0]), GPU_RPM_RANGE[1])
        if abs(n_new - n) < 0.2:
            break
        n = 0.8 * n + 0.2 * n_new
    return pr, n


def load_model(cell):
    from make_case import phase_steady
    L = {nm: (compare.load(f), m) for nm, f, m in model4.cases(cell)}
    p = model4.calibrate([L[f'S04_{x}'] for x in ('gpu', 'cpu', 'comb')])
    duct = model4.calibrate_duct(p, [L[f'{s}_{x}'] for s in ('S06', 'S07') for x in ('gpu', 'cpu', 'comb')])
    return p, duct, phase_steady('S07', 'combined')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--run', action='store_true')
    ap.add_argument('--only', default='')
    ap.add_argument('--cell', type=float, default=2.5)
    ap.add_argument('--ext', type=float, default=36)
    ap.add_argument('--json')
    a = ap.parse_args()
    only = set(filter(None, a.only.split(',')))
    warm = case_dir('s07', a.cell)
    out_root = DATA / 'cfd-casos' / f'escenarios-{a.cell:g}mm'
    if a.run:
        for sid, *_, opts in SCENARIOS:
            if (only and sid not in only) or sid in EXISTING or (case_dir(sid, a.cell) / 'results.json').exists():
                continue
            cmd = [sys.executable, HERE / 'make_case.py', '--config', 'S07', '--cell', a.cell, '--ext', a.ext, '--grille-k', 1.0,
                   f'--tag=-{sid}', '--out', out_root]
            for k, v in BASE.items():
                if not any(o.startswith(k + '=') for o in opts):
                    cmd += ['--rpm', f'{k}={v}']
            run(cmd + opts, stdout=subprocess.DEVNULL)
            run([sys.executable, HERE / 'run_case.py', case_dir(sid, a.cell), '--np', '8', '--loops', '4', '--iters', '500',
                 '--warm', warm], stdout=subprocess.DEVNULL)
            print('listo', sid, flush=True)
    model = load_model(a.cell)
    rows, base = [], None
    for sid, es, en, group, opts in SCENARIOS:
        folder = case_dir(sid, a.cell)
        if not (folder / 'results.json').exists():
            continue
        cx = compare.load(folder)
        p_gpu = 280.0 if sid == 'gpu-280w' else 300.0
        p, n = closed_loop(model, cx, p_gpu, model[2]['P_CPU'])
        vents = cx['raw']['vents_m3h']
        through = round(sum(-v for v in vents.values() if v is not None and v < 0), 1)
        row = {'id': sid, 'es': es, 'en': en, 'group': group, 'gpu_rpm': round(n),
               **{k.lower(): round(v, 2) for k, v in p.items()},
               'gpu_inlet_C': round(cx['GPU'][0], 1), 'cpu_inlet_C': round(cx['CPU'][0], 1), 'through_m3h': through,
               'fans_m3h': {k: round(v['Q_m3h'], 1) for k, v in cx['raw']['fans'].items()}}
        if sid == 's07':
            base = row
        rows.append(row)
    for r in rows:
        for k in ('gpu', 'cpu', 'vrm', 'chipset', 'board', 'ram', 'gpu_rpm'):
            r['d_' + k] = round(r[k] - base[k], 2 if k != 'gpu_rpm' else 0)
        print(f"{r['id']:16} gráfica {r['gpu']:.1f} ({r['d_gpu']:+.1f}, {r['gpu_rpm']} rpm {r['d_gpu_rpm']:+.0f})  procesador {r['cpu']:.1f} ({r['d_cpu']:+.1f})"
              f"  placa {r['board']:.1f} ({r['d_board']:+.1f})  VRM {r['d_vrm']:+.1f}  memoria {r['d_ram']:+.1f}  paso {r['through_m3h']} m³/h")
    if a.json:
        Path(a.json).write_text(json.dumps({'cell_mm': a.cell, 'rows': rows}, indent=2, ensure_ascii=False), encoding='utf-8')


if __name__ == '__main__':
    main()
