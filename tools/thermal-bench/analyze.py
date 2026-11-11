"""Summarise Terra bench sessions and check repeatability.

Usage: python analyze.py S01 S02 S03 [--ambient 26.5]
For each load phase: peak, steady state (mean of the last 3 min), mean power, fan duty,
rise over idle and thermal resistance (steady - ambient) / power. Then the spread
between sessions, compared with the CFD-gate target of +/-1 C.
"""
import argparse
import csv
import json
import os
import statistics as st
from collections import defaultdict
from datetime import datetime
from pathlib import Path

DATA = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'sesiones'
STEADY_S = 180


def gpu_series(folder):
    rows = []
    with open(folder / 'gpu.csv', newline='') as fh:
        for r in list(csv.reader(fh))[1:]:
            try:
                ts = datetime.strptime(r[0].strip(), '%Y/%m/%d %H:%M:%S.%f').timestamp()
                rows.append((ts, float(r[1]), float(r[2]), float(r[3])))
            except (ValueError, IndexError):
                continue
    return rows


def cpu_series(folder):
    path = folder / 'hwinfo.csv'
    if not path.exists() or path.stat().st_size < 100:
        return []
    temps, power = {}, {}
    with open(path, newline='', encoding='utf8') as fh:
        for r in csv.DictReader(fh):
            t = round(float(r['epoch']))
            if r['label'].startswith('CPU (Tctl/Tdie)'):
                temps[t] = float(r['value'])
            elif r['label'] in ('CPU PPT', 'CPU Package Power'):
                power[t] = float(r['value'])
    return [(t, temps[t], power.get(t, float('nan')), float('nan')) for t in sorted(temps)]


def window(series, a, b):
    return [row for row in series if a <= row[0] < b]


def summarise(sid, ambient):
    folder = DATA / sid
    meta = json.loads((folder / 'session.json').read_text())
    t0 = meta['t0_epoch']
    amb = ambient if ambient is not None else meta.get('ambient_C')
    plan = {p['phase']: (t0 + p['start_s'], t0 + p['end_s']) for p in meta['plan']}
    out = {'id': sid, 'config': meta['config'], 'aborted': meta.get('aborted'), 'ambient_C': amb, 'phases': {}}
    for chip, series in (('gpu', gpu_series(folder)), ('cpu', cpu_series(folder))):
        if not series:
            continue
        idle = window(series, *plan['idle'])
        idle_T = st.mean(r[1] for r in idle[-60:]) if idle else None
        for phase in ('gpu', 'cpu', 'combined'):
            a, b = plan[phase]
            seg = window(series, a, b)
            if not seg:
                continue
            steady = window(series, max(a, b - STEADY_S), b)
            T_ss = st.mean(r[1] for r in steady)
            P_ss = st.mean(r[2] for r in steady)
            cool_a, cool_b = plan['cool_' + phase]
            cool = window(series, cool_a, cool_b)
            row = {'peak_C': max(r[1] for r in seg), 'steady_C': round(T_ss, 2), 'power_W': round(P_ss, 1),
                   'rise_over_idle_C': round(T_ss - idle_T, 2) if idle_T is not None else None,
                   'end_of_cooldown_C': cool[-1][1] if cool else None}
            if chip == 'gpu':
                row['fan_pct'] = round(st.mean(r[3] for r in steady), 1)
            if amb is not None and P_ss > 0:
                row['rth_C_per_W'] = round((T_ss - amb) / P_ss, 4)
            out['phases'][f'{chip}@{phase}'] = row
        out[f'{chip}_idle_C'] = round(idle_T, 2) if idle_T is not None else None
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ids', nargs='+')
    ap.add_argument('--ambient', type=float)
    a = ap.parse_args()
    results = [summarise(s, a.ambient) for s in a.ids]
    for res in results:
        print(f"\n== {res['id']} ({res['config']}) ambient={res['ambient_C']} aborted={res['aborted']} "
              f"gpu_idle={res.get('gpu_idle_C')} cpu_idle={res.get('cpu_idle_C')}")
        for key, row in res['phases'].items():
            print(f'  {key:14} ' + '  '.join(f'{k}={v}' for k, v in row.items()))
    if len(results) > 1:
        print('\n== repeatability (max - min across sessions; target <= 2 C, i.e. +/-1 C)')
        spread = defaultdict(list)
        for res in results:
            for key, row in res['phases'].items():
                for metric in ('peak_C', 'steady_C', 'rise_over_idle_C'):
                    if row.get(metric) is not None:
                        spread[(key, metric)].append(row[metric])
        for (key, metric), vals in sorted(spread.items()):
            if len(vals) == len(results):
                rng = max(vals) - min(vals)
                sd = st.stdev(vals) if len(vals) > 2 else float('nan')
                flag = 'OK' if rng <= 2.0 else 'REVISAR'
                print(f'  {key:14} {metric:17} values={vals}  range={rng:.2f}  sd={sd:.2f}  {flag}')
    (DATA / 'resumen.json').write_text(json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
