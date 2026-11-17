"""Temperaturas y rpm medidas en la ventana estable (últimos 180 s) de la fase combinada de cada sesión.

Uso:  python measured.py S04 S05 S06 S07     → imprime el dict MEAS para compare.py y las rpm de los ventiladores
"""
import csv
import json
import os
import re
import statistics as st
import sys
from collections import defaultdict
from pathlib import Path

DATA = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'sesiones'
STEADY_S = 180
CORE = re.compile(r'Core\d+ \(CCD\d\)$')
# etiqueta de HWiNFO → clave (unidad para separar temperaturas de rpm con el mismo nombre)
TEMP = {'SPD Hub Temperatura': 'RAM', 'VRM MOS': 'VRM', 'Chipset 1 (xHCI)': 'CHIPSET', 'Sistema1': 'BOARD'}


def steady(sid):
    folder = DATA / sid
    meta = json.loads((folder / 'session.json').read_text())
    t0 = meta['t0_epoch']
    a, b = [(t0 + p['start_s'], t0 + p['end_s']) for p in meta['plan'] if p['phase'] == 'combined'][0]
    a = max(a, b - STEADY_S)
    vals = defaultdict(list)
    cores = defaultdict(list)
    with open(folder / 'hwinfo.csv', newline='', encoding='utf8') as fh:
        for r in csv.DictReader(fh):
            t = float(r['epoch'])
            if not a <= t < b:
                continue
            lab, unit, v = r['label'], r.get('unit', ''), float(r['value'])
            if CORE.match(lab):
                cores[round(t)].append(v)
            elif lab in TEMP and 'rpm' not in unit.lower():
                vals[TEMP[lab]].append(v)
            elif lab == 'CPU PPT':
                vals['P_CPU'].append(v)
            elif 'rpm' in unit.lower():
                vals['rpm:' + lab].append(v)
    sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'thermal-bench'))
    from analyze import gpu_series
    gpu = [(r[1], r[2], r[3]) for r in gpu_series(folder) if a <= r[0] < b]
    out = {'GPU': round(st.mean(g[0] for g in gpu), 2), 'P_GPU': round(st.mean(g[1] for g in gpu)),
           'GPU_fan_pct': round(st.mean(g[2] for g in gpu), 1),
           'CPU': round(st.mean(st.mean(c) for c in cores.values()), 2), 'ambient_C': meta.get('ambient_C')}
    for k, v in vals.items():
        out[k] = round(st.mean(v), 1)
    return out


if __name__ == '__main__':
    res = {sid: steady(sid) for sid in sys.argv[1:]}
    print(json.dumps(res, indent=1, ensure_ascii=False))
