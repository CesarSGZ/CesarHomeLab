"""Monta un caso de OpenFOAM (v2512, ESI) del interior del Fractal Terra a partir de `geometry`.

Uso:  python make_case.py [--cell 3] [--config S07] [--out <carpeta>]

Idea (versión 1, malla gruesa):
- Dominio = aire del interior de la caja (blockMesh). Las piezas sólidas se recortan de la malla
  (topoSet + subsetMesh) y quedan como paredes.
- Rejillas de los paneles, suelo y trasera = trozos del contorno abiertos a la habitación (presión total 0),
  con una capa porosa detrás que reproduce la pérdida de una chapa perforada con su área abierta.
- Ventiladores = zonas cilíndricas con una fuerza que empuja el aire; el salto de presión sale de su curva
  (lineal entre presión estática máxima y caudal libre, escalada a las rpm medidas). run_case.py itera
  hasta que caudal y salto cuadran con la curva.
- Disipadores, cables, memoria, fuente y chapas con huecos = zonas porosas (Darcy-Forchheimer).
- Temperatura = escalar pasivo T (function object scalarTransport) con el calor de cada pieza como fuente.
  Vale porque los ventiladores mandan sobre la flotación; se revisará con buoyantSimpleFoam más adelante.

Coordenadas: las del modelo (mm, x frontal→trasera, y panel gráfica→panel CPU, z suelo→techo); el caso
se escribe en metros.
"""
import argparse
import json
import math
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / 'control' / 'data' / 'terra-thermal-summary.json'
OUT_DEFAULT = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'cfd-casos'

RHO, CP, NU = 1.16, 1005.0, 1.6e-5
GPU_FT = 100.0    # mm de flujo pasante en la gráfica: PCB corto y el ventilador del extremo sopla a través hacia la espina.
                  # Hipótesis (ZOTAC no publica el despiece; es lo habitual en las SFF): es lo único que hace que el aire que
                  # llega al procesador cuadre en S04, S05, S06 y S07 a la vez (criba de 4 mm, 20-21 nov)
PSU_F = 150.0     # freno interno de la fuente (Forchheimer, 1/m)

# Condiciones de cada prueba medida (vatios y rpm de la ventana estable, carga combinada)
CONFIGS = {
    'S07': {'ducts': ['GPU_DUCT', 'CPU_DUCT'], 'ambient_C': 19.0,
            'heat_W': {'GPU': 300, 'CPU_COOLER': 91.6, 'PSU': 27, 'MOTHERBOARD': 15, 'RAM': 5},
            'rpm': {'GPU_FAN': 1955, 'CPU_FAN': 1907, 'BOTTOM_FAN': 1206, 'TOP_FAN': 1550, 'PSU_FAN': 1410}},
    'S04': {'ducts': [], 'ambient_C': 19.0,
            'heat_W': {'GPU': 300, 'CPU_COOLER': 87.7, 'PSU': 27, 'MOTHERBOARD': 15, 'RAM': 5},
            'rpm': {'GPU_FAN': 2050, 'CPU_FAN': 1950, 'BOTTOM_FAN': 1270, 'TOP_FAN': 1550, 'PSU_FAN': 1410}},
    # Comprobaciones a ciegas: medidas pero nunca usadas para ajustar (measured.py S05 S06)
    'S05': {'ducts': [], 'ambient_C': 20.5, 'panels_off': True,
            'heat_W': {'GPU': 300, 'CPU_COOLER': 94.2, 'PSU': 27, 'MOTHERBOARD': 15, 'RAM': 5},
            'rpm': {'GPU_FAN': 2086, 'CPU_FAN': 2071, 'BOTTOM_FAN': 1301, 'TOP_FAN': 2200, 'PSU_FAN': 1410}},
    'S06': {'ducts': ['CPU_DUCT'], 'ambient_C': 19.0,
            'heat_W': {'GPU': 300, 'CPU_COOLER': 104.6, 'PSU': 27, 'MOTHERBOARD': 15, 'RAM': 5},
            'rpm': {'GPU_FAN': 2020, 'CPU_FAN': 1945, 'BOTTOM_FAN': 1270, 'TOP_FAN': 2200, 'PSU_FAN': 1410}},
}

SESSION_SETUP = {'S04': ([], False), 'S05': ([], True), 'S06': (['CPU_DUCT'], False), 'S07': (['GPU_DUCT', 'CPU_DUCT'], False)}
STEADY_S = 180


def phase_steady(sid, phase):
    """Media de los últimos 180 s de una fase (gpu, cpu, combined, idle) en la tabla de 1 Hz (thermal-bench/wide.py)."""
    import csv
    folder = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'sesiones' / sid
    rows = [r for r in csv.DictReader(open(folder / 'wide_1hz.csv', encoding='utf-8')) if r['phase'] == phase]
    end = max(int(r['t']) for r in rows)
    rows = [r for r in rows if int(r['t']) > end - STEADY_S]

    def mean(*cols):
        v = [float(r[c]) for r in rows for c in cols if r[c] != '']
        return sum(v) / len(v)
    meta = json.loads((folder / 'session.json').read_text(encoding='utf-8'))
    return {'GPU': mean('smi_t'), 'CPU': mean('cpu_core_mean'), 'CPU_BASE': mean('cpu_base'), 'P_CORE': mean('cpu_core_w'), 'RAM': mean('ram1', 'ram3'), 'VRM': mean('vrm_mos'),
            'CHIPSET': mean('chipset'), 'BOARD': mean('board_sys1'), 'P_GPU': mean('smi_w'), 'P_CPU': mean('cpu_ppt'), 'P_SOC': mean('cpu_soc_w'),
            'TCTL': mean('cpu_tctl'), 'rpm_gpu': mean('gpu_fan1_rpm'), 'rpm_cpu': mean('cpu_fan_rpm'),
            'rpm_bottom': mean('sys1_fan_rpm'), 'ambient_C': meta['ambient_C']}


def phase_config(name):
    """Config de una fase medida, p. ej. 'S07_gpu' (solo gráfica cargada) o 'S04_cpu'.

    Calor de la fuente y de la placa según la carga (los 27 W y 15 W de las configs de arriba son los de la carga
    combinada): pérdidas de la fuente ≈ 6,3 % de la potencia en continua (~94 % de eficiencia, 80 PLUS Platinum a media carga),
    placa = 6 W fijos (chipset, red, audio) + ~10 % de la potencia del procesador en los VRM. En la combinada da 27 W y 15 W.
    Con los ventiladores de la gráfica parados (modo 0 rpm) se ponen a 1 rpm: sin empuje y sin dividir por cero."""
    sid, phase = name.split('_', 1)
    m = phase_steady(sid, {'comb': 'combined'}.get(phase, phase))
    ducts, off = SESSION_SETUP[sid]
    p_dc = m['P_GPU'] + m['P_CPU'] + 40
    return {'ducts': ducts, 'ambient_C': m['ambient_C'], 'panels_off': off, 'measured': m,
            'heat_W': {'GPU': round(m['P_GPU'], 1), 'CPU_COOLER': round(m['P_CPU'], 1), 'PSU': round(0.063 * p_dc, 1),
                       'MOTHERBOARD': round(6 + 0.1 * m['P_CPU'], 1), 'RAM': 5},
            'rpm': {'GPU_FAN': max(1.0, round(m['rpm_gpu'])), 'CPU_FAN': round(m['rpm_cpu']), 'BOTTOM_FAN': round(m['rpm_bottom']),
                    'TOP_FAN': 2200, 'PSU_FAN': 1410}}


# Curvas: (rpm máximas, caudal libre m3/h, presión estática máxima Pa) — fichas oficiales salvo donde se dice
FAN_SPEC = {
    'NF-A9x14': (2200, 50.5, 16.1),      # Noctua NF-A9x14 PWM: 2200 rpm, 50.5 m3/h, 1.64 mmH2O
    'NF-A12x15': (1850, 94.2, 15.0),     # Noctua: 55.4 CFM, 1.53 mmH2O
    'GPU_90': (3300, 75.0, 45.0),        # ZOTAC no lo publica: estimado (90 mm de gráfica; el 56 % medido son ~1.955 rpm)
    'PSU_92': (3700, 60.0, 40.0),        # Corsair NR092P (92 mm, 0,22 A): curva estimada; rpm según Cybenetics
    # dos NF-A9x14 en serie dentro del canal de la CPU (empujando y tirando): a igual caudal suman presión,
    # el caudal libre casi no cambia (regla habitual para ventiladores iguales en serie)
    'NF-A9x14-x2': (2200, 50.5, 32.2),
}
FAN_MODEL = {'GPU_FAN_1': 'GPU_90', 'GPU_FAN_2': 'GPU_90', 'GPU_FAN_3': 'GPU_90', 'CPU_FAN': 'NF-A9x14',
             'TOP_FAN': 'NF-A9x14', 'BOTTOM_FAN': 'NF-A12x15', 'PSU_FAN': 'PSU_92'}


def plate_K(open_fraction):
    """Pérdida de una chapa perforada de bordes vivos (Idelchik), referida a la velocidad de llegada."""
    f = max(0.02, min(open_fraction, 0.98))
    return (0.707 * math.sqrt(1 - f) + 1 - f) ** 2 / f ** 2


def fan_curve(fan_id, rpm):
    nmax, q0, p0 = FAN_SPEC[FAN_MODEL[fan_id]]
    s = rpm / nmax
    return q0 * s, p0 * s * s          # leyes de semejanza: Q ~ n, p ~ n^2


def header(cls, obj, loc=None):
    loc_line = f'    location    "{loc}";\n' if loc else ''
    return ('FoamFile\n{\n    version     2.0;\n    format      ascii;\n'
            f'    class       {cls};\n{loc_line}    object      {obj};\n}}\n\n')


def m(v):
    return v / 1000.0


def vec(a):
    return '(' + ' '.join(f'{x:.6g}' for x in a) + ')'


def box_m(b, pad=0.0):
    lo = [m(b['min'][i]) - pad for i in range(3)]
    hi = [m(b['min'][i] + b['size'][i]) + pad for i in range(3)]
    return lo, hi


EXT = 0.0          # mm de aire alrededor de la caja (0 = solo el interior)
DESK = 22.0        # hueco medido entre el suelo de la caja y la mesa
FLIP = set()       # ventiladores de caja dados la vuelta (TOP_FAN, BOTTOM_FAN)
PANELS_OFF = False # sin los paneles laterales (solo con EXT): como la S05


def build(geo, cfg_name, cell_mm, out, tag='', grille_k=1.0):
    cfg = CONFIGS[cfg_name]
    comps = {c['id']: c for c in geo['components']}
    L, W, H = geo['case']['outer_mm'] if 'outer_mm' in geo['case'] else (343, 153, 198)
    t = 1.0
    x0, x1 = 5.0, L - t           # el marco frontal (4 mm) cierra el frente
    y0, y1, z0, z1 = t, W - t, t, H - t
    if EXT:
        # aire exterior: la caja queda dentro de un cajón de aire, con la mesa 22 mm por debajo
        x0, x1, y0, y1, z0, z1 = -EXT, L + EXT, -EXT, W + EXT, -DESK, H + EXT
    nx, ny, nz = (max(4, round((b - a) / cell_mm)) for a, b in ((x0, x1), (y0, y1), (z0, z1)))
    case = out / f'terra-{cfg_name}-{cell_mm:g}mm{tag}'
    for d in ('system', 'constant', '0'):
        (case / d).mkdir(parents=True, exist_ok=True)

    # ---------- blockMesh ----------
    X0, X1, Y0, Y1, Z0, Z1 = map(m, (x0, x1, y0, y1, z0, z1))
    pts = [(X0, Y0, Z0), (X1, Y0, Z0), (X1, Y1, Z0), (X0, Y1, Z0), (X0, Y0, Z1), (X1, Y0, Z1), (X1, Y1, Z1), (X0, Y1, Z1)]
    (case / 'system' / 'blockMeshDict').write_text(header('dictionary', 'blockMeshDict') + f"""scale 1;
vertices ( {' '.join(vec(p) for p in pts)} );
blocks ( hex (0 1 2 3 4 5 6 7) ({nx} {ny} {nz}) simpleGrading (1 1 1) );
boundary
(
{'''    vent_amb_front { type patch; faces ((0 4 7 3)); }
    vent_amb_rear { type patch; faces ((1 2 6 5)); }
    vent_amb_gpu { type patch; faces ((0 1 5 4)); }
    vent_amb_cpu { type patch; faces ((3 7 6 2)); }
    desk { type wall; faces ((0 3 2 1)); }
    vent_amb_top { type patch; faces ((4 5 6 7)); }''' if EXT else '''    front  { type wall; faces ((0 4 7 3)); }
    rear   { type wall; faces ((1 2 6 5)); }
    gpuSide { type wall; faces ((0 1 5 4)); }
    cpuSide { type wall; faces ((3 7 6 2)); }
    floor  { type wall; faces ((0 3 2 1)); }
    top    { type wall; faces ((4 5 6 7)); }'''}
);
""")

    # ---------- aberturas del contorno ----------
    panels = {p['id']: p for p in geo['panels']}
    vents = []   # (nombre, patch de origen, caja en m, fracción abierta)
    h = m(cell_mm) * 0.6
    gp = panels['PANEL_GPU']['grille']; cp_ = panels['PANEL_CPU']['grille']; tp = panels['PANEL_TOP']['grille']
    pitch, slot = 8.05, gp['slot_w']
    phi_side = slot / pitch
    xs = (min(gp['rows_x']) - slot / 2, max(gp['rows_x']) + slot / 2)
    vents.append(('vent_gpu', 'gpuSide', ([m(xs[0]), Y0 - h, m(gp['slot_z'][0])], [m(xs[1]), Y0 + h, m(gp['slot_z'][1])]), phi_side))
    vents.append(('vent_cpu', 'cpuSide', ([m(xs[0]), Y1 - h, m(cp_['slot_z'][0])], [m(xs[1]), Y1 + h, m(cp_['slot_z'][1])]), phi_side))
    xt = (min(tp['rows_x']) - slot / 2, max(tp['rows_x']) + slot / 2)
    vents.append(('vent_top', 'top', ([m(xt[0]), m(tp['slot_y'][0]), Z1 - h], [m(xt[1]), m(tp['slot_y'][1]), Z1 + h]), phi_side))
    fl = panels['PANEL_BOTTOM']['grille']
    if fl.get('slots'):
        fx0 = min(s['x'][0] for s in fl['slots']); fx1 = max(s['x'][1] for s in fl['slots'])
        fy0 = min(s['y'][0] for s in fl['slots']); fy1 = max(s['y'][1] for s in fl['slots'])
        phi_floor = sum((s['x'][1] - s['x'][0]) * (s['y'][1] - s['y'][0]) for s in fl['slots']) / ((fx1 - fx0) * (fy1 - fy0))
        vents.append(('vent_floor', 'floor', ([m(fx0), m(fy0), Z0 - h], [m(fx1), m(fy1), Z0 + h]), phi_floor))
    else:
        vents.append(('vent_floor', 'floor', ([m(xt[0]), m(tp['slot_y'][0]), Z0 - h], [m(xt[1]), m(tp['slot_y'][1]), Z0 + h]), phi_side))
    for o in panels['PANEL_REAR']['openings']:
        vents.append((f"vent_{o['id'].lower()}", 'rear', ([X1 - h, m(o['y'][0]), m(o['z'][0])], [X1 + h, m(o['y'][1]), m(o['z'][1])]), o['porosity']))

    # ---------- zonas y sólidos ----------
    actions, porous, heat, fans = [], [], [], []

    def cellset(name, src):
        actions.append(f'    {{ name {name}; type cellSet; action new; source {src}; }}')

    def boxsrc(lo, hi):
        return f'boxToCell; min {vec(lo)}; max {vec(hi)};'

    def cylsrc(p1, p2, r, rin=None):
        if rin is None:
            return f'cylinderToCell; point1 {vec(p1)}; point2 {vec(p2)}; radius {r:.6g};'
        return f'cylinderAnnulusToCell; point1 {vec(p1)}; point2 {vec(p2)}; outerRadius {r:.6g}; innerRadius {rin:.6g};'

    solids = []

    def solid_box(name, lo, hi):
        cellset(name, boxsrc(lo, hi)); solids.append(name)

    fan_sets = []
    fan_disc = {}

    def fan_zone(name, p1, p2, r, axis):
        """Zona del ventilador y disco de caras por donde se mide su caudal real (phi), aguas abajo si hay sitio."""
        cellset(name, cylsrc(p1, p2, r))
        actions.append(f'    {{ name {name}; type cellZoneSet; action new; source setToCellZone; set {name}; }}')
        ext = m(cell_mm) * 1.6
        out_end = [p2[i] + axis[i] * 0 for i in range(3)] if sum((p2[i] - p1[i]) * axis[i] for i in range(3)) > 0 else p1
        in_end = p1 if out_end is not p1 else p2
        beyond = [out_end[i] + axis[i] * ext for i in range(3)]
        lims = ((X0, X1), (Y0, Y1), (Z0, Z1))
        inside = all(lims[i][0] + 1e-6 < beyond[i] < lims[i][1] - 1e-6 for i in range(3))
        if inside:
            a, b, side = out_end, beyond, 'down'
        else:
            a, b, side = [in_end[i] - axis[i] * ext for i in range(3)], in_end, 'up'
        fan_disc[name] = side
        actions.append(f'    {{ name {name}Nb; type cellSet; action new; source {cylsrc(a, b, r)} }}')
        actions.append(f'    {{ name {name}Nb; type cellSet; action subtract; source cellToCell; sets ({name}); }}')
        actions.append(f'    {{ name {name}Disc; type faceSet; action new; source cellToFace; sets ({name}); option all; }}')
        actions.append(f'    {{ name {name}Disc; type faceSet; action subset; source cellToFace; sets ({name}Nb); option all; }}')
        actions.append(f'    {{ name {name}Disc; type faceZoneSet; action new; source setsToFaceZone; faceSet {name}Disc; cellSet {name}; }}')

    def zone_box(name, lo, hi, exclude=()):
        cellset(name, boxsrc(lo, hi))
        if exclude:
            actions.append(f'    {{ name {name}; type cellSet; action subtract; source cellToCell; sets ({" ".join(exclude)}); }}')
        actions.append(f'    {{ name {name}; type cellZoneSet; action new; source setToCellZone; set {name}; }}')

    # Gráfica: ventiladores (y 16.15-26.15), aletas porosas y PCB sólida detrás
    g = comps['GPU']; glo, ghi = box_m(g['box'])
    fan_y1 = m(26.15)
    pcb_y0 = ghi[1] - m(7.75)
    ft = m(GPU_FT)        # flujo pasante: PCB corto y el extremo lejos del soporte abierto (sale hacia la espina)
    zone_box('gpuFins', [glo[0], fan_y1, glo[2]], [ghi[0], pcb_y0, ghi[2]])
    porous.append(('gpuFins', 'gpuFins', (5e7, 2e3, 2e3), (8e3, 300, 300), 'y'))   # aletas: cuesta atravesarlas en x
    heat.append(('gpuFins', cfg['heat_W']['GPU']))
    if ft > 0:
        zone_box('gpuFlow', [glo[0], pcb_y0, glo[2] + m(8)], [glo[0] + ft, ghi[1], ghi[2] - m(8)])
        porous.append(('gpuFlow', 'gpuFlow', (5e7, 2e3, 5e7), (8e3, 300, 8e3), 'y'))   # rejilla de la placa trasera
    solid_box('gpuPcb', [glo[0] + ft, pcb_y0, glo[2]], ghi)
    if ft > 0:   # marco de la placa trasera alrededor del hueco
        solid_box('gpuPcbLo', [glo[0], pcb_y0, glo[2]], [glo[0] + ft, ghi[1], glo[2] + m(8)])
        solid_box('gpuPcbHi', [glo[0], pcb_y0, ghi[2] - m(8)], [glo[0] + ft, ghi[1], ghi[2]])
    # carcasa entre ventiladores: sólida salvo los discos
    cellset('gpuShroud', boxsrc([glo[0], glo[1], glo[2]], [ghi[0], fan_y1, ghi[2]]))
    for i in (1, 2, 3):
        f = comps[f'GPU_FAN_{i}']['fan']; c = [m(v) for v in f['centre']]; r = m(f['diameter'] / 2)
        p1 = [c[0], m(16.15), c[2]]; p2 = [c[0], fan_y1, c[2]]
        name = f'gpuFan{i}'
        zone_cyl = cylsrc(p1, p2, r)
        fan_zone(name, p1, p2, r, [0, 1, 0])
        actions.append(f'    {{ name gpuShroud; type cellSet; action subtract; source {zone_cyl} }}')
        fans.append((name, f'GPU_FAN_{i}', [0, 1, 0], r, p2[1] - p1[1], cfg['rpm']['GPU_FAN'])); fan_sets.append(name)
    solids.append('gpuShroud')

    # Procesador: ventilador, aletas porosas con el calor, base sólida
    cc = comps['CPU_COOLER']; clo, chi = box_m(cc['box'])
    cf = comps['CPU_FAN']['fan']; c = [m(v) for v in cf['centre']]; r = m(cf['diameter'] / 2); th = m(cf['thickness'])
    p1 = [c[0], c[1] - th / 2, c[2]]; p2 = [c[0], c[1] + th / 2, c[2]]
    fan_zone('cpuFan', p1, p2, r, [0, -1, 0])
    fans.append(('cpuFan', 'CPU_FAN', [0, -1, 0], r, th, cfg['rpm']['CPU_FAN'])); fan_sets.append('cpuFan')
    fin_y0 = clo[1] + m(6)
    zone_box('cpuFins', [clo[0], fin_y0, clo[2]], [chi[0], p1[1], chi[2]])
    # aletas verticales (foto del 14 nov): el aire baja por y y sale por arriba y por abajo (z); en x no pasa
    porous.append(('cpuFins', 'cpuFins', (5e7, 2e3, 2e3), (8e3, 500, 500), 'y'))
    heat.append(('cpuFins', cfg['heat_W']['CPU_COOLER']))
    solid_box('cpuBase', [clo[0] + m(30), clo[1], clo[2] + m(30)], [chi[0] - m(30), fin_y0, chi[2] - m(30)])

    # Fuente: carcasa sólida con interior poroso; entra por el lado CPU (ventilador) y sale por arriba
    ps = comps['PSU']; plo, phi = box_m(ps['box']); sk = m(cell_mm)
    zone_box('psuIn', [plo[0] + sk, plo[1] + sk, plo[2] + sk], [phi[0] - sk, phi[1] - sk, phi[2]])
    porous.append(('psuIn', 'psuIn', (5e4, 5e4, 5e4), (PSU_F, PSU_F, PSU_F), 'y'))   # se ajusta para ~13,7 m3/h a 1.410 rpm
    heat.append(('psuIn', cfg['heat_W']['PSU']))
    for nm, lo, hi in (('psuSkX0', plo, [plo[0] + sk, phi[1], phi[2]]), ('psuSkX1', [phi[0] - sk, plo[1], plo[2]], phi),
                       ('psuSkY0', plo, [phi[0], plo[1] + sk, phi[2]]), ('psuSkZ0', plo, [phi[0], phi[1], plo[2] + sk])):
        solid_box(nm, lo, hi)
    pf = comps['PSU_FAN']['fan']; c = [m(v) for v in pf['centre']]; r = m(pf['diameter'] / 2)
    p1 = [c[0], phi[1] - sk, c[2]]; p2 = [c[0], phi[1], c[2]]
    fan_zone('psuFan', p1, p2, r, [0, -1, 0])
    fans.append(('psuFan', 'PSU_FAN', [0, -1, 0], r, sk, cfg['rpm']['PSU_FAN'])); fan_sets.append('psuFan')
    # cara del ventilador cerrada salvo el disco (si no, el aire da vueltas dentro de la fuente)
    solid_box('psuSkY1', [plo[0], phi[1] - sk, plo[2]], [phi[0], phi[1], phi[2]])
    actions.append('    { name psuSkY1; type cellSet; action subtract; source cellToCell; sets (psuFan); }')

    # Ventiladores de caja
    for fid, zname in (('BOTTOM_FAN', 'bottomFan'), ('TOP_FAN', 'topFan')):
        f = comps[fid]['fan']; c = [m(v) for v in f['centre']]; r = m(f['diameter'] / 2); th = m(f['thickness'])
        ax = f['axis']
        p1 = [c[i] - ax[i] * th / 2 for i in range(3)]; p2 = [c[i] + ax[i] * th / 2 for i in range(3)]
        fan_zone(zname, p1, p2, r, [0, 0, 1])
        sign = -1 if fid in FLIP else 1   # de serie ambos empujan hacia +z (abajo mete, arriba saca); FLIP los invierte
        fans.append((zname, fid, [0, 0, sign], r, th, cfg['rpm'][fid])); fan_sets.append(zname)

    # Marco de los ventiladores de 92/120 mm: chapa sólida alrededor del rotor (sin él, el aire da la vuelta
    # por el borde en lugar de atravesar la rejilla: el de abajo cogía aire de dentro y casi nada del suelo)
    for fid, zname in (('CPU_FAN', 'cpuFan'), ('BOTTOM_FAN', 'bottomFan'), ('TOP_FAN', 'topFan')):
        lo, hi = box_m(comps[fid]['box'])
        solid_box(f'{zname}Frame', lo, hi)
        actions.append(f'    {{ name {zname}Frame; type cellSet; action subtract; source cellToCell; sets ({zname}); }}')

    # Sólidos sencillos y zonas porosas del resto
    for cid in ('RISER', 'SLOT_BRACKET'):
        lo, hi = box_m(comps[cid]['box']); solid_box(cid.lower(), lo, hi)
    mb = comps['MOTHERBOARD']; lo, hi = box_m(mb['box'])
    air = max(m(4), m(cell_mm) * 1.1)      # capa de aire con el calor de la placa: al menos una celda
    solid_box('board', lo, [hi[0], hi[1] - air, hi[2]])
    zone_box('boardAir', [lo[0], hi[1] - air, lo[2]], hi)
    heat.append(('boardAir', cfg['heat_W']['MOTHERBOARD']))
    rm = comps['RAM']; lo, hi = box_m(rm['box'])
    mod = rm.get('modules', {'count': 2, 'size_mm': [7, 35, 135], 'pitch_mm': 9.5})
    for k in range(mod['count']):
        x0 = lo[0] + m(k * mod['pitch_mm'])
        solid_box(f'ramMod{k}', [x0, lo[1], lo[2]], [x0 + m(mod['size_mm'][0]), hi[1], hi[2]])
    sh = m(cell_mm) * 1.2
    zone_box('ram', [lo[0] - sh, lo[1], lo[2] - sh], [hi[0] + sh, hi[1] + sh, hi[2] + sh])   # aire alrededor de los módulos
    heat.append(('ram', cfg['heat_W']['RAM']))
    for cid in ('SPINE', 'PSU_BRACKET'):
        cpn = comps[cid]; lo, hi = box_m(cpn['box'])
        nrm = 1 if cid == 'SPINE' else 2
        if hi[nrm] - lo[nrm] < m(cell_mm):           # capa de al menos una celda
            mid = (hi[nrm] + lo[nrm]) / 2; lo[nrm] = mid - m(cell_mm) * 0.55; hi[nrm] = mid + m(cell_mm) * 0.55
        name = cid.lower(); zone_box(name, lo, hi, exclude=fan_sets)
        K = plate_K(cpn['porosity']); fdir = K / (hi[nrm] - lo[nrm])
        fv = [100.0, 100.0, 100.0]; fv[nrm] = fdir
        porous.append((name, name, (0, 0, 0), tuple(fv), 'y'))
    for cid in ('CABLES_GPU', 'CABLES_MAIN', 'CABLES_BOTTOM'):
        cpn = comps[cid]; lo, hi = box_m(cpn['box']); name = cid.lower()
        zone_box(name, lo, hi, exclude=fan_sets + ['ram', 'boardAir', 'cpuFins', 'psuIn'])
        k = 60.0 * (1 - cpn['porosity']) / cpn['porosity']       # por ajustar con S04-S07
        porous.append((name, name, (0, 0, 0), (k, k, k), 'y'))
    lo, hi = box_m(comps['BOTTOM_GRILLE']['box'])
    if hi[2] - lo[2] < m(cell_mm):
        hi[2] = lo[2] + m(cell_mm) * 1.1
    zone_box('bottomGrille', lo, hi, exclude=fan_sets)
    K = plate_K(comps['BOTTOM_GRILLE']['porosity'])
    porous.append(('bottomGrille', 'bottomGrille', (0, 0, 0), (100, 100, K / (hi[2] - lo[2])), 'y'))

    # Canales impresos: paredes de al menos una celda y media
    wall = m(cell_mm) * 1.5
    if 'GPU_DUCT' in cfg['ducts']:
        sh = comps['GPU_DUCT']['shape']
        for i, xc in enumerate(sh['centres_x']):
            p1 = [m(xc), Y0, m(sh['centre_z'])]; p2 = [m(xc), m(16.15), m(sh['centre_z'])]
            ri = m(sh['r_in']); cellset(f'gpuDuct{i}', cylsrc(p1, p2, ri + wall, ri)); solids.append(f'gpuDuct{i}')
    if 'CPU_DUCT' in cfg['ducts']:
        sh = comps['CPU_DUCT']['shape']
        p1 = [m(sh['centre_x']), m(131.5), m(sh['centre_z'])]; p2 = [m(sh['centre_x']), Y1, m(sh['centre_z'])]
        ri = m(sh['r_in']); cellset('cpuDuct', cylsrc(p1, p2, ri + wall, ri)); solids.append('cpuDuct')

    grille_info = {}
    if EXT:
        # Chapa de la caja: una celda de grosor; las rejillas son zonas porosas dentro de esa chapa
        c = m(cell_mm) * 1.01
        Lm, Wm, Hm = m(L), m(W), m(H)
        shell = {
            'gpuSide': ([0, 0, 0], [Lm, c, Hm], 1, -1), 'cpuSide': ([0, Wm - c, 0], [Lm, Wm, Hm], 1, 1),
            'top': ([0, 0, Hm - c], [Lm, Wm, Hm], 2, 1), 'floor': ([0, 0, 0], [Lm, Wm, c], 2, -1),
            'rear': ([Lm - c, 0, 0], [Lm, Wm, Hm], 0, 1), 'front': ([0, 0, 0], [m(5), Wm, Hm], 0, -1)}
        if PANELS_OFF:
            shell.pop('gpuSide'); shell.pop('cpuSide')
            vents = [v for v in vents if v[1] not in ('gpuSide', 'cpuSide')]
        for nm, (lo, hi, ax, sgn) in shell.items():
            cellset(f'shell_{nm}', boxsrc(lo, hi)); solids.append(f'shell_{nm}')
        # patas: los laterales bajan a la mesa en los extremos y el nogal cierra el frontal
        for i, (xa, xb) in enumerate(((0, 30), (L - 30, L))):
            if not PANELS_OFF:
                solid_box(f'legG{i}', [m(xa), 0, m(-DESK)], [m(xb), c, 0])
                solid_box(f'legC{i}', [m(xa), Wm - c, m(-DESK)], [m(xb), Wm, 0])
        solid_box('walnut', [0, 0, m(-DESK)], [c, Wm, 0])
        for name, patch, (lo, hi), phi in vents:
            lo = list(lo); hi = list(hi)
            slo, shi, ax, sgn = shell[patch]
            lo[ax], hi[ax] = slo[ax], shi[ax]
            zname = name.replace('vent_', 'grille_')
            actions.append(f'    {{ name {zname}; type cellSet; action new; source {boxsrc(lo, hi)} }}')
            for sname in [s for s in solids if s.startswith('shell_')]:
                actions.append(f'    {{ name {sname}; type cellSet; action subtract; source cellToCell; sets ({zname}); }}')
            actions.append(f'    {{ name {zname}; type cellZoneSet; action new; source setToCellZone; set {zname}; }}')
            depth = hi[ax] - lo[ax]
            fv = [1e4, 1e4, 1e4]; fv[ax] = (grille_k * plate_K(phi) if phi < 0.99 else 0.0) / depth
            dv = [1e7, 1e7, 1e7]; dv[ax] = 0
            porous.append((zname, zname, tuple(dv), tuple(fv), 'y'))
            n = [0, 0, 0]; n[ax] = sgn
            area = 1.0
            for i in range(3):
                if i != ax:
                    area *= hi[i] - lo[i]
            grille_info[zname] = {'normal_out': n, 'area_m2': area}
        vents_for_layer = []
    else:
        vents_for_layer = vents

    # Capa porosa detrás de cada rejilla
    for name, patch, (lo, hi), phi in vents_for_layer:
        if phi >= 0.99:
            continue
        lo = list(lo); hi = list(hi)
        ax = {'gpuSide': 1, 'cpuSide': 1, 'top': 2, 'floor': 2, 'rear': 0}[patch]
        depth = m(cell_mm) * 2
        if patch in ('gpuSide', 'floor'):
            lo[ax] = (Y0 if ax == 1 else Z0); hi[ax] = lo[ax] + depth
        elif patch == 'rear':
            hi[ax] = X1; lo[ax] = X1 - depth
        else:
            hi[ax] = (Y1 if ax == 1 else Z1); lo[ax] = hi[ax] - depth
        zname = name.replace('vent_', 'grille_')
        zone_box(zname, lo, hi, exclude=fan_sets)
        fv = [200.0, 200.0, 200.0]; fv[ax] = grille_k * plate_K(phi) / depth   # grille_k: ajuste con S05 (sin paneles casi no cambia nada)
        porous.append((zname, zname, (0, 0, 0), tuple(fv), 'y'))

    # quitar sólidos (fuera de las zonas que ya existan, pero da igual: quedan como paredes)
    actions.append('    { name solids; type cellSet; action new; source cellToCell; sets (' + ' '.join(solids) + '); }')
    actions.append('    { name fluid; type cellSet; action new; source cellToCell; sets (solids); }')
    actions.append('    { name fluid; type cellSet; action invert; }')

    vent_actions = []
    for name, patch, (lo, hi), phi in vents:
        vent_actions.append(f'    {{ name {name}; type faceSet; action new; source patchToFace; patch {patch}; }}')
        vent_actions.append(f'    {{ name {name}; type faceSet; action subset; source boxToFace; box {vec(lo)} {vec(hi)}; }}')
    if EXT:
        vent_actions = []
    (case / 'system' / 'topoSetDict.vents').write_text(header('dictionary', 'topoSetDict') + 'actions\n(\n' + '\n'.join(vent_actions) + '\n);\n')
    (case / 'system' / 'createPatchDict').write_text(header('dictionary', 'createPatchDict') + 'pointSync false;\npatches\n(\n' + '\n'.join(
        f'    {{ name {n}; patchInfo {{ type patch; }} constructFrom set; set {n}; }}' for n, *_ in ([] if EXT else vents)) + '\n);\n')
    (case / 'system' / 'topoSetDict').write_text(header('dictionary', 'topoSetDict') + 'actions\n(\n' + '\n'.join(actions) + '\n);\n')

    # ---------- física ----------
    (case / 'constant' / 'transportProperties').write_text(header('dictionary', 'transportProperties') + f'transportModel Newtonian;\nnu {NU};\nbeta 3.3e-3;\nTRef {cfg["ambient_C"]};\nPr 0.71;\nPrt 0.85;\n')
    (case / 'constant' / 'g').write_text(header('uniformDimensionedVectorField', 'g') + 'dimensions [0 1 -2 0 0 0 0];\nvalue (0 0 -9.81);\n')
    (case / 'constant' / 'turbulenceProperties').write_text(header('dictionary', 'turbulenceProperties') + 'simulationType RAS;\nRAS { RASModel kOmegaSST; turbulence on; printCoeffs off; }\n')
    (case / 'constant' / 'momentumTransport').write_text((case / 'constant' / 'turbulenceProperties').read_text())

    fan_state = {}
    fv = []
    for zname, fid, ax, r, th, rpm in fans:
        q0, p0 = fan_curve(fid, rpm)
        area = math.pi * r * r * (1 - 0.3 ** 2)
        dp = p0 * 0.6                                    # arranque: a 60 % de la presión máxima
        fan_state[zname] = {'fan': fid, 'rpm': rpm, 'q0_m3h': q0, 'p0_Pa': p0, 'area_m2': area, 'radius_m': r, 'thickness_m': th,
                            'axis': ax, 'dp_Pa': dp, 'disc': fan_disc[zname]}
        acc = dp / RHO / th
        fv.append(f"""{zname}Push
{{
    type            vectorSemiImplicitSource;
    selectionMode   cellZone;
    cellZone        {zname};
    volumeMode      specific;
    sources
    {{
        U           (({acc * ax[0]:.6g} {acc * ax[1]:.6g} {acc * ax[2]:.6g}) 0);
    }}
}}
""")
    for zname, zone, d, f, _ in porous:
        fv.append(f"""{zname}Porosity
{{
    type            explicitPorositySource;
    explicitPorositySourceCoeffs
    {{
        selectionMode   cellZone;
        cellZone        {zone};
        type            DarcyForchheimer;
        d   {vec(d)};
        f   {vec(f)};
        coordinateSystem
        {{
            origin  (0 0 0);
            rotation {{ type axes; e1 (1 0 0); e2 (0 1 0); }}
        }}
    }}
}}
""")
    for zone, W in heat:
        fv.append(f"""{zone}Heat
{{
    type            scalarSemiImplicitSource;
    selectionMode   cellZone;
    cellZone        {zone};
    volumeMode      absolute;
    sources {{ T ({W / (RHO * CP):.6g} 0); }}
}}
""")
    (case / 'constant' / 'fvOptions').write_text(header('dictionary', 'fvOptions') + '\n'.join(fv))
    (case / 'fanState.json').write_text(json.dumps({'config': cfg_name, 'fans': fan_state}, indent=2))

    # ---------- condiciones de contorno ----------
    vent_names = [] if EXT else [n for n, *_ in vents]
    vent_re = '"vent_.*"'
    Tamb = cfg['ambient_C']

    def field(cls, name, dims, internal, walls, vents_bc):
        return header(cls, name, '0') + f"""dimensions {dims};
internalField uniform {internal};
boundaryField
{{
    ".*" {{ {walls} }}
    {vent_re} {{ {vents_bc} }}
}}
"""
    k0, om0 = 1e-3, 5.0
    (case / '0' / 'U').write_text(field('volVectorField', 'U', '[0 1 -1 0 0 0 0]', '(0 0 0)', 'type noSlip;',
                                       'type pressureInletOutletVelocity; value uniform (0 0 0);'))
    (case / '0' / 'p_rgh').write_text(field('volScalarField', 'p_rgh', '[0 2 -2 0 0 0 0]', '0', 'type fixedFluxPressure; rho rhok; value uniform 0;',
                                           'type totalPressure; p0 uniform 0; value uniform 0;'))
    (case / '0' / 'p').write_text(field('volScalarField', 'p', '[0 2 -2 0 0 0 0]', '0', 'type calculated; value uniform 0;',
                                       'type calculated; value uniform 0;'))
    (case / '0' / 'alphat').write_text(field('volScalarField', 'alphat', '[0 2 -1 0 0 0 0]', 0, 'type alphatJayatillekeWallFunction; Prt 0.85; value uniform 0;',
                                            'type calculated; value uniform 0;'))
    (case / '0' / 'k').write_text(field('volScalarField', 'k', '[0 2 -2 0 0 0 0]', k0, f'type kqRWallFunction; value uniform {k0};',
                                       f'type inletOutlet; inletValue uniform {k0}; value uniform {k0};'))
    (case / '0' / 'omega').write_text(field('volScalarField', 'omega', '[0 0 -1 0 0 0 0]', om0, f'type omegaWallFunction; value uniform {om0};',
                                           f'type inletOutlet; inletValue uniform {om0}; value uniform {om0};'))
    (case / '0' / 'nut').write_text(field('volScalarField', 'nut', '[0 2 -1 0 0 0 0]', 0, 'type nutkWallFunction; value uniform 0;',
                                         'type calculated; value uniform 0;'))
    (case / '0' / 'T').write_text(field('volScalarField', 'T', '[0 0 0 1 0 0 0]', Tamb, 'type zeroGradient;',
                                       f'type inletOutlet; inletValue uniform {Tamb}; value uniform {Tamb};'))

    # ---------- control y esquemas ----------
    flows = '\n'.join(f"""    flow_{n}
    {{
        type surfaceFieldValue; libs (fieldFunctionObjects); writeControl timeStep; writeInterval 20; log false; writeFields false;
        regionType patch; name {n}; operation sum; fields (phi);
    }}""" for n in vent_names)
    fanflows = '\n'.join(f"""    fanflow_{z}
    {{
        type surfaceFieldValue; libs (fieldFunctionObjects); writeControl timeStep; writeInterval 20; log false; writeFields false;
        regionType faceZone; name {z}Disc; operation sum; fields (phi);
    }}""" for z in [f[0] for f in fans])
    zone_avg = '\n'.join(f"""    zone_{z}
    {{
        type volFieldValue; libs (fieldFunctionObjects); writeControl timeStep; writeInterval 20; log false; writeFields false;
        regionType cellZone; name {z}; operation volAverage; fields (U T);
    }}""" for z in [f[0] for f in fans] + ['gpuFins', 'cpuFins', 'psuIn', 'ram', 'boardAir'] + list(grille_info))
    (case / 'system' / 'controlDict').write_text(header('dictionary', 'controlDict') + f"""application     buoyantBoussinesqSimpleFoam;
startFrom       latestTime;
startTime       0;
stopAt          endTime;
endTime         1500;
deltaT          1;
writeControl    timeStep;
writeInterval   500;
purgeWrite      1;
writeFormat     binary;
writePrecision  8;
runTimeModifiable true;

functions
{{
{flows}
{fanflows}
{zone_avg}
}}
""")
    (case / 'system' / 'fvSchemes').write_text(header('dictionary', 'fvSchemes') + """ddtSchemes { default steadyState; }
gradSchemes { default cellLimited Gauss linear 1; }
divSchemes
{
    default none;
    div(phi,U) bounded Gauss linearUpwindV grad(U);
    div(phi,k) bounded Gauss upwind;
    div(phi,omega) bounded Gauss upwind;
    div(phi,T) bounded Gauss upwind;
    div((nuEff*dev2(T(grad(U))))) Gauss linear;
}
laplacianSchemes { default Gauss linear limited 0.5; }
interpolationSchemes { default linear; }
snGradSchemes { default limited 0.5; }
wallDist { method meshWave; }
""")
    (case / 'system' / 'fvSolution').write_text(header('dictionary', 'fvSolution') + """solvers
{
    p_rgh { solver GAMG; smoother GaussSeidel; tolerance 1e-7; relTol 0.05; }
    "(U|k|omega|T)" { solver smoothSolver; smoother symGaussSeidel; tolerance 1e-8; relTol 0.1; }
}
SIMPLE
{
    momentumPredictor yes;
    nNonOrthogonalCorrectors 0;
}
relaxationFactors
{
    equations { U 0.5; "(k|omega)" 0.5; T 0.7; }
    fields { p_rgh 0.7; }
}
""")
    (case / 'system' / 'decomposeParDict').write_text(header('dictionary', 'decomposeParDict') + 'numberOfSubdomains 8;\nmethod scotch;\n')
    (case / 'case.foam').write_text('')
    info = {'panels_off': PANELS_OFF, 'ext_mm': EXT, 'flip': sorted(FLIP), 'grille_zones': grille_info, 'grille_k': grille_k, 'config': cfg_name, 'ducts': cfg['ducts'], 'rpm': cfg['rpm'], 'cell_mm': cell_mm, 'cells_block': nx * ny * nz, 'vents': vent_names,
            'zones_porous': [p[0] for p in porous], 'heat_W': dict(heat), 'solids': solids, 'solver': 'buoyantBoussinesqSimpleFoam'}
    (case / 'caseInfo.json').write_text(json.dumps(info, indent=2))
    return case, info


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cell', type=float, default=3.0)
    ap.add_argument('--config', default='S07', help=f'{", ".join(sorted(CONFIGS))} o una fase medida: S07_gpu, S04_cpu, S06_comb...')
    ap.add_argument('--heat', action='append', default=[], help='PIEZA=W: cambia el calor de una pieza, p. ej. CPU_COOLER=0')
    ap.add_argument('--fan-model', action='append', default=[], help='VENTILADOR=MODELO, p. ej. CPU_FAN=NF-A9x14-x2 (dos en serie)')
    ap.add_argument('--out', default=str(OUT_DEFAULT))
    ap.add_argument('--rpm', action='append', default=[], help='FAN=rpm, p. ej. TOP_FAN=1206 (cambia la velocidad supuesta)')
    ap.add_argument('--tag', default='', help='sufijo para el nombre del caso')
    ap.add_argument('--grille-k', type=float, default=0.3, help='factor sobre la pérdida teórica de las rejillas de los paneles')
    ap.add_argument('--psu-f', type=float, help='freno interno de la fuente')
    ap.add_argument('--ext', type=float, default=0.0, help='mm de aire alrededor de la caja (0 = solo interior)')
    ap.add_argument('--flip', action='append', default=[], help='TOP_FAN o BOTTOM_FAN: darle la vuelta (meter ↔ sacar aire)')
    ap.add_argument('--panels-off', action='store_true', help='sin paneles laterales (necesita --ext)')
    ap.add_argument('--gpu-flowthrough', type=float, default=None, help='mm del extremo delantero de la gráfica sin PCB (flujo pasante)')
    ap.add_argument('--fan-spec', action='append', default=[], help='MODELO=rpm,q0,p0: cambia una curva estimada, p. ej. GPU_90=3300,60,30')
    ap.add_argument('--comp', action='append', default=[], help='ID.clave=valor: cambia un dato de una pieza, p. ej. SPINE.porosity=0.2')
    a = ap.parse_args()
    if a.config not in CONFIGS:
        CONFIGS[a.config] = phase_config(a.config)
    for kv in a.heat:
        k, v = kv.split('=')
        CONFIGS[a.config]['heat_W'][k] = float(v)
    for kv in a.fan_model:
        k, v = kv.split('=')
        FAN_MODEL[k] = v
    geo = json.loads(DATA.read_text(encoding='utf-8'))['geometry']
    for kv in a.fan_spec:
        k, v = kv.split('=')
        FAN_SPEC[k] = tuple(float(x) for x in v.split(','))
    for kv in a.comp:                       # para cribar hipótesis sin tocar la geometría publicada
        key, v = kv.split('=')
        cid, field = key.split('.')
        next(c for c in geo['components'] if c['id'] == cid)[field] = float(v)
    if a.psu_f:
        global PSU_F
        PSU_F = a.psu_f
    for kv in a.rpm:
        k, v = kv.split('=')
        CONFIGS[a.config]['rpm'][k] = float(v)
    global EXT, FLIP, PANELS_OFF, GPU_FT
    GPU_FT = GPU_FT if a.gpu_flowthrough is None else a.gpu_flowthrough
    EXT = a.ext
    FLIP = set(a.flip)
    PANELS_OFF = a.panels_off or CONFIGS[a.config].get('panels_off', False)
    case, info = build(geo, a.config, a.cell, Path(a.out), a.tag, a.grille_k)
    print(case)
    print(json.dumps(info, indent=1))


if __name__ == '__main__':
    main()
