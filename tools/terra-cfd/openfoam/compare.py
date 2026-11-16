"""Compara el CFD con lo medido: ajusta con la S04 y predice la S07.

Uso:  python compare.py <caso S04> <caso S07> [--json salida.json]

Para cada pieza: T_pieza = T_aire_CFD + R · P. R se ajusta con la S04 y se usa tal cual en la S07; en la gráfica
y el procesador R escala con el caudal de su ventilador elevado a −0,7 (aletas). El aire que se usa es el que
llega al ventilador (gráfica, procesador) o el de la zona que rodea a la pieza (memoria, placa).
"""
import argparse
import json
from pathlib import Path

# Medido en la ventana estable de la fase combinada (analyze.py y HWiNFO)
MEAS = {
    'S04': {'GPU': 78.89, 'CPU': 79.75, 'RAM': 59.1, 'VRM': 67.5, 'CHIPSET': 68.6, 'BOARD': 56.8, 'P_GPU': 300, 'P_CPU': 87.7},
    'S07': {'GPU': 75.80, 'CPU': 72.40, 'RAM': 53.4, 'VRM': 60.7, 'CHIPSET': 62.8, 'BOARD': 51.3, 'P_GPU': 300, 'P_CPU': 91.6},
}
LABEL = {'GPU': 'Gráfica', 'CPU': 'Procesador (media de núcleos)', 'RAM': 'Memoria (SPD)', 'VRM': 'VRM de la placa',
         'CHIPSET': 'Chipset', 'BOARD': 'Sensor de la placa'}


def load(case):
    r = json.loads((Path(case) / 'results.json').read_text())
    z, f = r['zone_T_C'], r['fans']
    gpu_in = sum(z[k] for k in ('gpuFan1', 'gpuFan2', 'gpuFan3')) / 3
    gpu_q = sum(f[k]['Q_m3h'] for k in ('gpuFan1', 'gpuFan2', 'gpuFan3'))
    return {'GPU': (gpu_in, gpu_q), 'CPU': (z['cpuFan'], f['cpuFan']['Q_m3h']), 'RAM': (z['ram'], None),
            'VRM': (z['boardAir'], None), 'CHIPSET': (z['boardAir'], None), 'BOARD': (z['boardAir'], None), 'raw': r}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('s04')
    ap.add_argument('s07')
    ap.add_argument('--json')
    a = ap.parse_args()
    c4, c7 = load(a.s04), load(a.s07)
    rows = []
    for k in ('GPU', 'CPU', 'RAM', 'VRM', 'CHIPSET', 'BOARD'):
        (t4, q4), (t7, q7) = c4[k], c7[k]
        p4 = MEAS['S04'].get('P_' + k, 1.0)
        p7 = MEAS['S07'].get('P_' + k, 1.0)
        r = (MEAS['S04'][k] - t4) / p4
        if q4 and q7:
            r *= (q7 / q4) ** -0.7
        pred = t7 + r * p7
        rows.append({'id': k, 'label': LABEL[k], 'air_S04': round(t4, 1), 'air_S07': round(t7, 1),
                     'meas_S07': MEAS['S07'][k], 'pred_S07': round(pred, 1), 'err': round(pred - MEAS['S07'][k], 1),
                     'meas_delta': round(MEAS['S07'][k] - MEAS['S04'][k], 1), 'pred_delta': round(pred - MEAS['S04'][k], 1)})
    rms = (sum(x['err'] ** 2 for x in rows) / len(rows)) ** 0.5
    for x in rows:
        print(f"{x['label']:32} aire {x['air_S04']:5} → {x['air_S07']:5} | S07 medido {x['meas_S07']:5} predicho {x['pred_S07']:5} (error {x['err']:+.1f})")
    print(f'RMS {rms:.2f} °C')
    out = {'rows': rows, 'rms_C': round(rms, 2),
           'fans_S07': {k: round(v['Q_m3h'], 1) for k, v in c7['raw']['fans'].items()},
           'vents_S07': c7['raw']['vents_m3h']}
    if a.json:
        Path(a.json).write_text(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
