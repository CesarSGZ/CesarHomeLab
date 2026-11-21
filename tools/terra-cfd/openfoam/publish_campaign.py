"""Pasa los resultados de la campaña a la web: story.cfd_campaign en control/data/terra-thermal-summary.json.

Uso:  python publish_campaign.py [carpeta de la campaña] [--dry]

Con la constante de cada pieza ajustada en S04 (como compare.py) predice cada caso:
- validación: S07 (predicción) y S05/S06 (a ciegas: medidas, nunca usadas para ajustar)
- sentido de los ventiladores de caja: S07 tal cual frente a los ventiladores dados la vuelta
Las conclusiones en texto se escriben a mano después de mirar los números.
"""
import argparse
import json
import os
from datetime import date
from pathlib import Path

from compare import MEAS, LABEL, load, predict as predict_case

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
SUMMARY = REPO / 'control' / 'data' / 'terra-thermal-summary.json'
DEFAULT = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'cfd-casos' / 'campana-ext-2.5mm'
KEYS = ('GPU', 'CPU', 'VRM', 'CHIPSET', 'BOARD', 'RAM')
LABEL_EN = {'GPU': 'GPU', 'CPU': 'CPU (core average)', 'RAM': 'RAM (SPD)', 'VRM': 'Board VRM', 'CHIPSET': 'Chipset', 'BOARD': 'Board sensor'}
LABEL_ES = {'GPU': 'Gráfica', 'CPU': 'Procesador', 'RAM': 'Memoria', 'VRM': 'VRM', 'CHIPSET': 'Chipset', 'BOARD': 'Placa'}
CASE = {  # nombre → (config medida, textos, sentido arriba / abajo)
    'S04': ('S04', 'Sin canales (S04)', 'No ducts (S04)', 'out', 'in'),
    'S07': ('S07', 'Como está: los dos canales (S07)', 'As built: both ducts (S07)', 'out', 'in'),
    'S05': ('S05', 'Sin paneles ni canales (S05)', 'Panels off, no ducts (S05)', 'out', 'in'),
    'S06': ('S06', 'Solo el canal del procesador (S06)', 'CPU duct only (S06)', 'out', 'in'),
    'S07-top-in': ('S07', 'Arriba metiendo aire', 'Top fan as intake', 'in', 'in'),
    'S07-bottom-out': ('S07', 'Abajo sacando aire', 'Bottom fan as exhaust', 'out', 'out'),
    'S07-both-flipped': ('S07', 'Los dos al revés', 'Both flipped', 'in', 'out'),
}
OPENING = {  # zona de rejilla → textos
    'vent_gpu': ('Panel de la gráfica', 'GPU-side panel'), 'vent_cpu': ('Panel del procesador', 'CPU-side panel'),
    'vent_top': ('Techo', 'Top'), 'vent_floor': ('Suelo', 'Floor'), 'vent_rear_gap': ('Trasera', 'Rear'),
    'vent_board_io': ('Trasera (placa)', 'Rear (board I/O)'), 'vent_gpu_bracket': ('Trasera (gráfica)', 'Rear (GPU bracket)'),
}


def predict(fit, case, cfg):
    """Temperatura de cada pieza con las constantes de la S04 (compare.predict, memoria con su nodo de placa)."""
    return {k: round(v, 1) for k, v in predict_case(fit, case, cfg).items()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('folder', nargs='?', default=str(DEFAULT))
    ap.add_argument('--cell', default='2.5')
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    root = Path(a.folder)
    found = {}
    for name, (cfg, *_r) in CASE.items():
        c = root / f'terra-{cfg}-{a.cell}mm-{name}'
        if (c / 'results.json').exists():
            found[name] = load(c)
    if 'S04' not in found:
        raise SystemExit('Falta S04: sin ella no hay ajuste')
    fit = found['S04']
    pred = {n: predict(fit, c, CASE[n][0]) for n, c in found.items()}

    validation = []
    for name, kind in (('S07', 'predicted'), ('S05', 'blind'), ('S06', 'blind')):
        if name not in pred:
            continue
        rows = [{'id': k, 'es': LABEL_ES[k], 'en': LABEL_EN[k], 'meas': MEAS[name][k], 'pred': pred[name][k],
                 'err': round(pred[name][k] - MEAS[name][k], 1)} for k in KEYS]
        core = rows
        validation.append({'case': name, 'kind': kind, 'es': CASE[name][1], 'en': CASE[name][2], 'rows': rows,
                           'max_err_C': max(abs(r['err']) for r in core),
                           'rms_C': round((sum(r['err'] ** 2 for r in core) / len(core)) ** 0.5, 2)})

    layouts = []
    base = pred.get('S07')
    for name in ('S07', 'S07-top-in', 'S07-bottom-out', 'S07-both-flipped'):
        if name not in pred or not base:
            continue
        raw = found[name]['raw']
        z = raw['zone_T_C']
        inflow = sum(-v for v in raw['vents_m3h'].values() if v < 0)
        layouts.append({'case': name.lower(), 'es': CASE[name][1], 'en': CASE[name][2], 'top': CASE[name][3], 'bottom': CASE[name][4],
                        'gpu': pred[name]['GPU'], 'cpu': pred[name]['CPU'], 'board': pred[name]['BOARD'],
                        'd_gpu': round(pred[name]['GPU'] - base['GPU'], 1), 'd_cpu': round(pred[name]['CPU'] - base['CPU'], 1),
                        'd_board': round(pred[name]['BOARD'] - base['BOARD'], 1),
                        'gpu_inlet_C': round(sum(z[k] for k in ('gpuFan1', 'gpuFan2', 'gpuFan3')) / 3, 1),
                        'cpu_inlet_C': round(z['cpuFan'], 1), 'through_m3h': round(inflow)})

    order = [n for n in ('S04', 'S07', 'S05', 'S06', 'S07-top-in', 'S07-bottom-out', 'S07-both-flipped') if n in found]
    zones = sorted({k for n in order for k in found[n]['raw']['vents_m3h']})
    flows = {'cases': [{'es': CASE[n][1], 'en': CASE[n][2]} for n in order],
             'rows': [{'es': OPENING.get(k, (k, k))[0], 'en': OPENING.get(k, (k, k))[1],
                       'm3h': [round(found[n]['raw']['vents_m3h'].get(k, 0.0), 1) for n in order]} for k in zones
                      if max(abs(found[n]['raw']['vents_m3h'].get(k, 0.0)) for n in order) >= 1.0]}
    streams = [n.lower() for n in order if (REPO / 'control' / 'data' / 'cfd' / f'{n.lower()}-streams.bin').exists()]

    block = {'date': date.today().isoformat(), 'cell_mm': float(a.cell), 'outside_air': True,
             'validation': validation, 'layouts': layouts, 'flows': flows, 'streams': streams}
    print(json.dumps(block, indent=1, ensure_ascii=False))
    if not a.dry:
        d = json.loads(SUMMARY.read_text(encoding='utf-8'))
        d['story']['cfd_campaign'] = {**d['story'].get('cfd_campaign', {}), **block}
        SUMMARY.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print('escrito en', SUMMARY)


if __name__ == '__main__':
    main()
