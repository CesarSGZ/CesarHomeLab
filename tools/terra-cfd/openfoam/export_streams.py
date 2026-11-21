"""Exporta las líneas de corriente de un caso para el visor 3D de la web (pvbatch).

Uso:  pvbatch export_streams.py <carpeta del caso> <fichero .bin de salida> [nº de semillas] [--sphere]

Las semillas van en los discos de los ventiladores (como render_story.py): cada línea es aire que pasa por un
ventilador, seguido desde fuera de la caja hasta que sale. Así el visor enseña recorridos y no una maraña.
Con --sphere se siembra como antes, al azar dentro de una esfera que envuelve la caja.

Formato (little endian), en las coordenadas del modelo (mm, las mismas que `geometry`):
  uint32 nLines · uint32 nPoints · uint16[nLines] puntos por línea (relleno a 4 bytes) ·
  int16[nPoints*5] por punto: x, y, z en décimas de mm, T en centésimas de °C, velocidad en mm/s
Cada línea se remuestrea cada ~2,5 mm y se descartan las muy cortas.
"""
import math
import os
import random
import struct
import sys

from paraview import servermanager
from paraview.simple import OpenFOAMReader, MergeBlocks, CellDatatoPointData, StreamTracer, PointSource, PolyPointSource

case, out = sys.argv[1], sys.argv[2]
args = [a for a in sys.argv[3:] if not a.startswith('--')]
seeds = int(args[0]) if args else 700
SPHERE = '--sphere' in sys.argv

foam = OpenFOAMReader(FileName=os.path.join(case, 'case.foam'))
foam.MeshRegions = ['internalMesh']
foam.CellArrays = ['U', 'T']
foam.UpdatePipeline(max(foam.TimestepValues) if foam.TimestepValues else 0)
mesh = CellDatatoPointData(Input=MergeBlocks(Input=foam))

if SPHERE:
    src = PointSource(Center=[0.173, 0.0765, 0.099], Radius=0.13, NumberOfPoints=seeds)
else:
    import json
    geo = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'control', 'data',
                                      'terra-thermal-summary.json'), encoding='utf-8'))['geometry']
    # reparto por caudal aproximado: la gráfica y el procesador mandan
    SHARE = {'GPU_FAN_1': 0.15, 'GPU_FAN_2': 0.13, 'GPU_FAN_3': 0.13, 'CPU_FAN': 0.2, 'BOTTOM_FAN': 0.15, 'TOP_FAN': 0.16, 'PSU_FAN': 0.08}
    rng = random.Random(3)
    pts = []
    for c in geo['components']:
        f = c.get('fan')
        if not f or c['id'] not in SHARE:
            continue
        cx, cy, cz = (v / 1000 for v in f['centre'])
        ax = f['axis']
        r_out, r_in = f['diameter'] / 2000 * 0.92, f['diameter'] / 2000 * max(0.35, f.get('hub_ratio', 0.3) + 0.05)
        e1 = [1, 0, 0] if abs(ax[0]) < 0.5 else [0, 1, 0]
        e2 = [ax[1] * e1[2] - ax[2] * e1[1], ax[2] * e1[0] - ax[0] * e1[2], ax[0] * e1[1] - ax[1] * e1[0]]
        for _ in range(max(4, round(seeds * SHARE[c['id']]))):
            a = rng.random() * 2 * math.pi
            r = math.sqrt(r_in ** 2 + (r_out ** 2 - r_in ** 2) * rng.random())
            pts += [cx + r * (math.cos(a) * e1[0] + math.sin(a) * e2[0]),
                cy + r * (math.cos(a) * e1[1] + math.sin(a) * e2[1]),
                cz + r * (math.cos(a) * e1[2] + math.sin(a) * e2[2])]
    src = PolyPointSource(Points=pts)
st = StreamTracer(Input=mesh, SeedType=src)
st.Vectors = ['POINTS', 'U']
st.MaximumStreamlineLength = 0.7
st.IntegrationDirection = 'BOTH'
st.UpdatePipeline()
poly = servermanager.Fetch(st)

pts = poly.GetPoints()
T = poly.GetPointData().GetArray('T')
U = poly.GetPointData().GetArray('U')
lines = poly.GetLines()
lines.InitTraversal()
import vtk  # noqa: E402
ids = vtk.vtkIdList()
STEP = 0.0025          # m entre puntos remuestreados
IT = poly.GetPointData().GetArray('IntegrationTime')
SEED = poly.GetCellData().GetArray('SeedIds')
# Con BOTH salen dos tramos por semilla (hacia atrás y hacia delante) y el de atrás va al revés que el aire:
# se juntan por semilla y se ordenan por tiempo, para que el visor anime cada línea en el sentido del aire.
by_seed = {}
cell = 0
while lines.GetNextCell(ids):
    key = int(SEED.GetValue(cell)) if SEED else cell
    cell += 1
    for k in range(ids.GetNumberOfIds()):
        i = ids.GetId(k)
        p = pts.GetPoint(i)
        u = U.GetTuple3(i)
        by_seed.setdefault(key, {})[round(IT.GetValue(i), 7)] = (p[0], p[1], p[2], T.GetValue(i),
                                                                   math.sqrt(u[0] ** 2 + u[1] ** 2 + u[2] ** 2))
out_lines = []
for key, pts_t in by_seed.items():
    # fuera de la caja el aire va lento y da vueltas: se queda solo el último tramo antes de entrar (≤0,4 s)
    # y nada que se aleje más de 4 cm de la caja
    raw = [pts_t[t] for t in sorted(pts_t) if t >= -0.4]
    near = lambda q: -0.04 < q[0] < 0.383 and -0.04 < q[1] < 0.193 and -0.04 < q[2] < 0.238
    first = next((i for i, q in enumerate(raw) if near(q)), len(raw))
    last = first
    while last < len(raw) and near(raw[last]):
        last += 1
    raw = raw[first:last]
    if len(raw) < 4:
        continue
    keep = [raw[0]]
    acc = 0.0
    for a, b in zip(raw, raw[1:]):
        acc += math.dist(a[:3], b[:3])
        if acc >= STEP:
            keep.append(b)
            acc = 0.0
    total = (len(keep) - 1) * STEP
    if len(keep) < 6 or total < 0.03:
        continue
    out_lines.append(keep[:600])

random.seed(1)
random.shuffle(out_lines)
npts = sum(len(line) for line in out_lines)
with open(out, 'wb') as fh:
    fh.write(struct.pack('<II', len(out_lines), npts))
    fh.write(struct.pack(f'<{len(out_lines)}H', *[len(line) for line in out_lines]))
    if len(out_lines) % 2:
        fh.write(b'\0\0')
    clamp = lambda v: max(-32768, min(32767, int(round(v))))
    buf = []
    for line in out_lines:
        for x, y, z, t, v in line:
            buf += [clamp(x * 10000), clamp(y * 10000), clamp(z * 10000), clamp(t * 100), clamp(v * 1000)]
    fh.write(struct.pack(f'<{len(buf)}h', *buf))
print('ok', len(out_lines), 'líneas', npts, 'puntos', os.path.getsize(out) // 1024, 'KB')
