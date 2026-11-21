"""Pasa una sesión del banco a una tabla ancha a 1 Hz, lista para ajustar modelos dinámicos.

Uso:  python wide.py S04 S05 S06 S07        (o --all)
Sale  Datos/Terra/sesiones/<id>/wide_1hz.csv  con una fila por segundo desde t0:
  t, fase, T y potencia de gráfica y procesador, rpm de los ventiladores y las temperaturas de la placa.
HWiNFO escribe en formato largo (una fila por sensor y muestra, ~66 MB); aquí se queda en ~0,5 MB.
Huecos de hasta 3 s se rellenan con el último valor; más largos quedan vacíos.
"""
import csv
import json
import math
import os
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

DATA = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'sesiones'

# (columna, prefijo del sensor, etiqueta, unidad)
CHANNELS = [
    ('cpu_tctl', 'CPU [#0]', 'CPU (Tctl/Tdie)', '°C'),
    ('cpu_ccd', 'CPU [#0]', 'CPU CCD1 (Tdie)', '°C'),
    ('cpu_iod', 'CPU [#0]', 'CPU IOD Hotspot', '°C'),
    ('cpu_ppt', 'CPU [#0]', 'CPU PPT', 'W'),
    ('cpu_soc_w', 'CPU [#0]', 'Potencia de SoC CPU (SVI3 TFN)', 'W'),
    ('cpu_vrm_vdd', 'CPU [#0]', 'CPU VDDCR_VDD VRM (SVI3 TFN)', '°C'),
    ('cpu_thermal_limit', 'CPU [#0]', 'Thermal Limit', '%'),
    ('board_cpu', 'GIGABYTE', 'CPU', '°C'),
    ('board_sys1', 'GIGABYTE', 'Sistema1', '°C'),
    ('pch', 'GIGABYTE', 'PCH', '°C'),
    ('chipset', 'GIGABYTE', 'Chipset 1 (xHCI)', '°C'),
    ('pciex16', 'GIGABYTE', 'PCIEX16', '°C'),
    ('vrm_mos', 'GIGABYTE', 'VRM MOS', '°C'),
    ('cpu_fan_rpm', 'GIGABYTE', 'CPU', 'RPM'),
    ('sys1_fan_rpm', 'GIGABYTE', 'Sistema 1', 'RPM'),
    ('ram1', 'DDR5 DIMM [#1]', 'SPD Hub Temperatura', '°C'),
    ('ram3', 'DDR5 DIMM [#3]', 'SPD Hub Temperatura', '°C'),
    ('nvme', 'S.M.A.R.T.: WD_BLACK', 'Temperatura del disco', '°C'),
    ('gpu_t', 'dGPU [#0]', 'Temperatura de la GPU', '°C'),
    ('gpu_hot', 'dGPU [#0]', 'Temperatura de punto caliente de GPU', '°C'),
    ('gpu_mem', 'dGPU [#0]', 'Temperatura de unión de la memoria de la GPU', '°C'),
    ('gpu_w', 'dGPU [#0]', 'GPU Potencia', 'W'),
    ('gpu_fan1_rpm', 'dGPU [#0]', 'GPU Ventilador1', 'RPM'),
    ('gpu_fan2_rpm', 'dGPU [#0]', 'GPU Ventilador2', 'RPM'),
]
CORE_T = re.compile(r'Core(\d+) \(CCD\d\)$')
CORE_P = re.compile(r'Core (\d+) Potencia$')
R_CORE = 2.05     # K/W: cada núcleo sube ~2,05 °C por vatio propio sobre la base del chip (pendiente núcleo a núcleo, S01-S07)
HOLD = 3


def channel(sensor, label, unit):
    for col, pre, lab, un in CHANNELS:
        if label == lab and unit == un and sensor.startswith(pre):
            return col
    m = CORE_T.match(label)
    if m and unit == '°C':
        return f'coreT{m.group(1)}'
    m = CORE_P.match(label)
    if m and unit == 'W':
        return f'coreP{m.group(1)}'
    return None


def convert(sid):
    folder = DATA / sid
    meta = json.loads((folder / 'session.json').read_text(encoding='utf-8'))
    t0 = meta['t0_epoch']
    end = max(p['end_s'] for p in meta['plan'])
    acc = defaultdict(lambda: defaultdict(list))          # segundo -> columna -> valores
    with open(folder / 'hwinfo.csv', newline='', encoding='utf8') as fh:
        for r in csv.DictReader(fh):
            col = channel(r['sensor'], r['label'], r['unit'])
            if col is None:
                continue
            s = int(math.floor(float(r['epoch']) - t0))
            if -60 <= s <= end:
                try:
                    acc[s][col].append(float(r['value']))
                except ValueError:
                    pass
    # nvidia-smi también (más fino para la gráfica, y respaldo si HWiNFO se corta)
    with open(folder / 'gpu.csv', newline='') as fh:
        for r in list(csv.reader(fh))[1:]:
            try:
                ts = datetime.strptime(r[0].strip(), '%Y/%m/%d %H:%M:%S.%f').timestamp()
                s = int(math.floor(ts - t0))
                acc[s]['smi_t'].append(float(r[1]))
                acc[s]['smi_w'].append(float(r[2]))
                acc[s]['smi_fan_pct'].append(float(r[3]))
            except (ValueError, IndexError):
                continue
    # media de núcleos y "base" del chip: la media de (T_núcleo − R_CORE · P_núcleo). La base no depende de cuántos
    # núcleos cargue Windows (en la S07 la prueba solo cargó 4 de 8 y la media de núcleos mezclaba calientes y ociosos)
    for s_, cols_ in acc.items():
        T = [sum(cols_[f'coreT{i}']) / len(cols_[f'coreT{i}']) for i in range(8) if cols_.get(f'coreT{i}')]
        P = [sum(cols_[f'coreP{i}']) / len(cols_[f'coreP{i}']) for i in range(8) if cols_.get(f'coreP{i}')]
        if len(T) == 8:
            cols_['core'] = [sum(T) / 8]
            if len(P) == 8:
                cols_['base'] = [sum(t - R_CORE * q for t, q in zip(T, P)) / 8]
                cols_['corep'] = [sum(P)]
    cols = [c[0] for c in CHANNELS] + ['cpu_core_mean', 'cpu_base', 'cpu_core_w', 'smi_t', 'smi_w', 'smi_fan_pct']
    phase_of = lambda s: next((p['phase'] for p in meta['plan'] if p['start_s'] <= s < p['end_s']), 'post' if s >= end else 'pre')
    rows, last = [], {}
    for s in range(0, end):
        row = {'t': s, 'phase': phase_of(s)}
        for c in cols:
            src = {'cpu_core_mean': 'core', 'cpu_base': 'base', 'cpu_core_w': 'corep'}.get(c, c)
            v = acc[s].get(src)
            if v:
                last[c] = (s, sum(v) / len(v))
            row[c] = round(last[c][1], 3) if c in last and s - last[c][0] <= HOLD else ''
        rows.append(row)
    out = folder / 'wide_1hz.csv'
    with open(out, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=['t', 'phase'] + cols)
        w.writeheader()
        w.writerows(rows)
    miss = {c: sum(1 for r in rows if r[c] == '') for c in cols}
    bad = {c: n for c, n in miss.items() if n > 30}
    print(sid, meta['config'], len(rows), 'filas', '· huecos >30 s:' if bad else '· sin huecos', bad if bad else '')


if __name__ == '__main__':
    ids = [d.name for d in sorted(DATA.iterdir()) if re.match(r'S\d\d$', d.name)] if '--all' in sys.argv else sys.argv[1:]
    for sid in ids:
        convert(sid)
