"""Modelo dinámico acoplado gráfica + procesador (red térmica física) sobre las sesiones de 71 min.

Nodos (temperaturas):
  gráfica:    Tg1 (chip + cámara de vapor)  --R1g--  Tg2 (aletas)     --G_g(rpm)--  aire que entra a la gráfica
                                                          |--R23g-- Tg3 (placa y backplate: masa lenta que guarda calor
                                                                    y lo suelta despacio al enfriarse)
  procesador: Tc1 (núcleos)                  --R1c--  Tc2 (disipador)  --G_c(rpm)--  aire que entra al procesador
              A los núcleos solo llega la potencia de núcleos (PPT − SoC); la del SoC/IOD entra directa al disipador.
  aire:       el que llega a cada ventilador = ambiente + c0 + c_·g · P_gráfica + c_·c · P_procesador,
              con un retraso de primer orden τ_a (la caja, la placa y los paneles tardan en calentarse).
G(rpm) = G_nat + G_f · (rpm / 2000)^0,7   (convección forzada en aletas, la misma ley que el CFD).

Los coeficientes de aire (c0, c_gg, c_gc, c_cg, c_cc) dependen del montaje: o se ajustan con los datos de esa
sesión (modo "datos") o salen del CFD (modo "cfd", el que vale para predecir montajes nuevos).
Entradas medidas: vatios, rpm de los ventiladores de cada chip y ambiente. Salidas: gráfica y media de núcleos.
"""
import csv
import json
import os
from pathlib import Path

import numpy as np
from numba import njit

DATA = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'sesiones'
AMBIENT = {'S04': 19.0, 'S05': 20.5, 'S06': 19.0, 'S07': 19.0}
EXP = 0.7
CPU_BASE = True   # procesador: base del chip (media de T_núcleo − 2,05 · P_núcleo) en vez de la media de núcleos
SUB = 4          # subpasos por segundo (Euler explícito estable con las constantes de tiempo más cortas)
DEV = ['C1g', 'R1g', 'C2g', 'Gg_nat', 'Gg_f', 'C1c', 'R1c', 'C2c', 'Gc_nat', 'Gc_f', 'tau_a', 'C3g', 'R23g']
AIR = ['c0g', 'cgg', 'cgc', 'c0c', 'ccg', 'ccc']


def col(rows, name):
    v = np.array([float(r[name]) if r[name] != '' else np.nan for r in rows])
    if np.isnan(v).any():
        idx = np.arange(len(v))
        ok = ~np.isnan(v)
        v = np.interp(idx, idx[ok], v[ok])
    return v


def load(sid):
    rows = list(csv.DictReader(open(DATA / sid / 'wide_1hz.csv', encoding='utf-8')))
    d = {'sid': sid, 'Ta': AMBIENT[sid], 'phase': np.array([r['phase'] for r in rows])}
    for k, c in (('Pg', 'smi_w'), ('Pc', 'cpu_ppt'), ('Psoc', 'cpu_soc_w'), ('ng', 'gpu_fan1_rpm'), ('nc', 'cpu_fan_rpm'),
                 ('nb', 'sys1_fan_rpm'), ('Tg', 'smi_t'), ('Tc', 'cpu_core_mean'), ('Tctl', 'cpu_tctl'),
                 ('vrm', 'vrm_mos'), ('board', 'board_sys1')):
        d[k] = col(rows, c)
    d['Psoc'] = np.minimum(d['Psoc'], d['Pc'])
    if CPU_BASE:      # salida = base del chip (no depende del reparto de núcleos): toda la PPT entra al nodo 1
        d['Tc_mean'] = d['Tc']
        d['Tc'] = col(rows, 'cpu_base')
        d['Psoc'] = np.zeros_like(d['Pc'])
    d['t'] = np.arange(len(rows), dtype=float)
    return d


@njit(cache=True)
def _kernel(Pg, Pc, Psoc, Gg, Gc, ag_ss, ac_ss, C1g, R1g, C2g, C1c, R1c, C2c, tau_a, sub, Tg0, Tc0, C3g, R23g):
    n = Pg.shape[0]
    out = np.empty((n, 4))
    # arranque desde lo medido en t = 0 (al empezar la sesión el PC no siempre está en régimen): cada disipador en
    # equilibrio con su aire, y el aire el que hace falta para ese equilibrio; a partir de ahí va hacia su régimen
    tg1 = Tg0
    tg2 = tg1 - Pg[0] * R1g
    tg3 = tg2       # placa de la gráfica y backplate: masa lenta pegada a las aletas
    ag = tg2 - Pg[0] / Gg[0]
    tc1 = Tc0
    tc2 = tc1 - (Pc[0] - Psoc[0]) * R1c
    ac = tc2 - Pc[0] / Gc[0]
    h = 1.0 / sub
    ka = h / tau_a
    for i in range(n):
        out[i, 0] = tg1; out[i, 1] = tc1; out[i, 2] = ag; out[i, 3] = ac
        pcore = Pc[i] - Psoc[i]
        for _ in range(sub):
            ag += ka * (ag_ss[i] - ag)
            ac += ka * (ac_ss[i] - ac)
            qg = (tg1 - tg2) / R1g
            qc = (tc1 - tc2) / R1c
            tg1 += h * (Pg[i] - qg) / C1g
            q3 = (tg2 - tg3) / R23g
            tg2 += h * (qg - q3 - Gg[i] * (tg2 - ag)) / C2g
            tg3 += h * q3 / C3g
            tc1 += h * (pcore - qc) / C1c
            tc2 += h * (qc + Psoc[i] - Gc[i] * (tc2 - ac)) / C2c
    return out


def G(nat, f, rpm):
    return nat + f * (np.maximum(rpm, 0.0) / 2000.0) ** EXP


def air_inlets(air, d):
    ag = d['Ta'] + air['c0g'] + air['cgg'] * d['Pg'] + air['cgc'] * d['Pc']
    if 'pgc' in air:     # con sus ventiladores parados (modo 0 rpm) la gráfica no "respira": ve el aire quieto de su alrededor
        passive = d['Ta'] + air.get('p0g', 0.0) + air['pgg'] * d['Pg'] + air['pgc'] * d['Pc']
        ag = np.where(d['ng'] > 300, ag, passive)
    ac = d['Ta'] + air['c0c'] + air['ccg'] * d['Pg'] + air['ccc'] * d['Pc']
    return ag, ac


def simulate(p, air, d, sub=SUB, T0=None):
    """p: dict de DEV; air: dict de AIR. Devuelve columnas (gráfica, núcleos, aire gráfica, aire procesador).
    T0 = (gráfica, núcleos) al arrancar; por defecto lo medido en t = 0."""
    ag, ac = air_inlets(air, d)
    tg0, tc0 = (d['Tg'][0], d['Tc'][0]) if T0 is None else T0
    return _kernel(d['Pg'], d['Pc'], d['Psoc'], G(p['Gg_nat'], p['Gg_f'], d['ng']), G(p['Gc_nat'], p['Gc_f'], d['nc']),
                   ag, ac, p['C1g'], p['R1g'], p['C2g'], p['C1c'], p['R1c'], p['C2c'], p['tau_a'], sub, float(tg0), float(tc0),
                   p.get('C3g', 1e-3), p.get('R23g', 1e6))


def metrics(pred, meas, mask=None):
    if mask is not None:
        pred, meas = pred[mask], meas[mask]
    e = pred - meas
    rmse = float(np.sqrt(np.mean(e ** 2)))
    fit = float(100 * (1 - np.linalg.norm(e) / np.linalg.norm(meas - meas.mean())))
    return rmse, fit


def steady_mask(d, phase, last=180):
    idx = np.where(d['phase'] == phase)[0]
    m = np.zeros(len(d['t']), bool)
    m[idx[-last:]] = True
    return m


def save(path, obj):
    Path(path).write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding='utf-8')
