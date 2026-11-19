"""Compara el CFD con lo medido: ajusta con la S04 y predice la S07.

Uso:  python compare.py <caso S04> <caso S07> [--json salida.json]

Para cada pieza: T_pieza = T_aire_CFD + R · P. R se ajusta con la S04 y se usa tal cual en la S07; en la gráfica
y el procesador R escala con el caudal de su ventilador elevado a −0,7 (aletas). El aire que se usa es el que
llega al ventilador (gráfica, procesador). Para la placa (VRM, chipset, sensor) y la memoria se usa el aire que
sale del disipador del procesador: el AXP90 es de flujo hacia abajo y su chorro barre el VRM, el zócalo y los
módulos de memoria (a 2 mm del disipador), que es justo donde están los sensores. La media de toda la zona de la
placa no sirve: incluye rincones muertos que el CFD con aire de fuera calienta igual con y sin canales, cuando lo
medido baja 5-7 °C (S04 → S07), igual que la salida del disipador.

Memoria: el CFD no lleva la conducción por la placa, así que se añade un nodo térmico sencillo. Cada módulo
(Corsair Vengeance DDR5, 135 × 35 × 7 mm, disipador de aluminio) cede calor por dos caminos:
  - al aire: ~3 caras útiles de 135 × 35 mm (las de dentro se miran a 2,5 mm) con h ≈ 12 W/m²K → G_aire ≈ 0,17 W/K
  - a la placa: 288 contactos y los planos de cobre del zócalo, ~5 K/W por módulo → G_placa ≈ 0,40 W/K (2 módulos)
  T_memoria = w · T_placa + (1 − w) · T_aire_memoria + c,  con w = G_placa / (G_placa + G_aire) ≈ 0,7
La placa es la que predice el propio modelo; la constante c (P / G) se ajusta con la S04 como todo lo demás.
Con los datos medidos la memoria va siempre 2-4 °C por encima de la placa, que es lo que dice este nodo.
"""
import argparse
import json
from pathlib import Path

# Medido en la ventana estable de la fase combinada (analyze.py y HWiNFO)
MEAS = {
    'S04': {'GPU': 78.89, 'CPU': 79.75, 'RAM': 59.1, 'VRM': 67.5, 'CHIPSET': 68.6, 'BOARD': 56.8, 'P_GPU': 300, 'P_CPU': 87.7},
    'S07': {'GPU': 75.80, 'CPU': 72.40, 'RAM': 53.4, 'VRM': 60.7, 'CHIPSET': 62.8, 'BOARD': 51.3, 'P_GPU': 300, 'P_CPU': 91.6},
    # a ciegas (measured.py): S05 a 20,5 °C de ambiente
    'S05': {'GPU': 77.92, 'CPU': 79.90, 'RAM': 58.2, 'VRM': 66.9, 'CHIPSET': 66.5, 'BOARD': 54.8, 'P_GPU': 300, 'P_CPU': 94.2},
    'S06': {'GPU': 77.86, 'CPU': 78.81, 'RAM': 57.2, 'VRM': 65.2, 'CHIPSET': 66.0, 'BOARD': 53.2, 'P_GPU': 300, 'P_CPU': 104.6},
}
LABEL = {'GPU': 'Gráfica', 'CPU': 'Procesador (media de núcleos)', 'RAM': 'Memoria (SPD)', 'VRM': 'VRM de la placa',
         'CHIPSET': 'Chipset', 'BOARD': 'Sensor de la placa'}


def load(case):
    r = json.loads((Path(case) / 'results.json').read_text())
    z, f = r['zone_T_C'], r['fans']
    gpu_in = sum(z[k] for k in ('gpuFan1', 'gpuFan2', 'gpuFan3')) / 3
    gpu_q = sum(f[k]['Q_m3h'] for k in ('gpuFan1', 'gpuFan2', 'gpuFan3'))
    exhaust = z['cpuFins']          # aire que baja del disipador sobre la placa y la memoria (ver arriba)
    return {'GPU': (gpu_in, gpu_q), 'CPU': (z['cpuFan'], f['cpuFan']['Q_m3h']), 'RAM': (exhaust, None),
            'VRM': (exhaust, None), 'CHIPSET': (exhaust, None), 'BOARD': (exhaust, None), 'raw': r}


W_RAM_BOARD = 0.70          # peso de la placa en la memoria (G_placa / (G_placa + G_aire)), ver arriba
KEYS = ('GPU', 'CPU', 'VRM', 'CHIPSET', 'BOARD', 'RAM')


def predict(c4, cx, sid):
    """Temperatura de cada pieza en el caso cx (medido o no; sid da los vatios) con las constantes de la S04."""
    out = {}
    for k in KEYS[:-1]:
        (t4, q4), (tx, qx) = c4[k], cx[k]
        r = (MEAS['S04'][k] - t4) / MEAS['S04'].get('P_' + k, 1.0)
        if q4 and qx:
            r *= (qx / q4) ** -0.7
        out[k] = tx + r * MEAS[sid].get('P_' + k, 1.0)
    w = W_RAM_BOARD
    t4, tx = c4['RAM'][0], cx['RAM'][0]
    c = MEAS['S04']['RAM'] - w * MEAS['S04']['BOARD'] - (1 - w) * t4
    out['RAM'] = w * out['BOARD'] + (1 - w) * tx + c
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('s04')
    ap.add_argument('s07')
    ap.add_argument('--json')
    ap.add_argument('--blind', action='append', default=[], help='ID=carpeta de un caso medido a predecir con el ajuste de S04 (S05, S06)')
    a = ap.parse_args()
    c4, c7 = load(a.s04), load(a.s07)
    rows = []
    p7 = predict(c4, c7, 'S07')
    for k in KEYS:
        (t4, _), (t7, _) = c4[k], c7[k]
        pred = p7[k]
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
    # Comprobaciones a ciegas: misma constante de S04, sin tocar nada
    blind = {}
    for spec in a.blind:
        sid, path = spec.split('=', 1)
        if not (Path(path) / 'results.json').exists():
            continue
        cb = load(path)
        brows = []
        pb = predict(c4, cb, sid)
        for k in KEYS:
            pred = pb[k]
            brows.append({'id': k, 'label': LABEL[k], 'meas': MEAS[sid][k], 'pred': round(pred, 1), 'err': round(pred - MEAS[sid][k], 1)})
            print(f"{sid} {LABEL[k]:30} medido {MEAS[sid][k]:5} predicho {pred:5.1f} (error {pred - MEAS[sid][k]:+.1f})")
        brms = (sum(x['err'] ** 2 for x in brows) / len(brows)) ** 0.5
        print(f'{sid} RMS {brms:.2f} °C')
        blind[sid] = {'rows': brows, 'rms_C': round(brms, 2)}
    out['blind'] = blind
    if a.json:
        Path(a.json).write_text(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
