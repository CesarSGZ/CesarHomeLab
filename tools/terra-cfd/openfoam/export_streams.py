"""Exporta las líneas de corriente de un caso para el visor 3D de la web (pvbatch).

Uso:  pvbatch export_streams.py <carpeta del caso> <fichero .bin de salida> [nº de semillas]

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
from paraview.simple import OpenFOAMReader, MergeBlocks, CellDatatoPointData, StreamTracer, PointSource

case, out = sys.argv[1], sys.argv[2]
seeds = int(sys.argv[3]) if len(sys.argv) > 3 else 3200

foam = OpenFOAMReader(FileName=os.path.join(case, 'case.foam'))
foam.MeshRegions = ['internalMesh']
foam.CellArrays = ['U', 'T']
foam.UpdatePipeline(max(foam.TimestepValues) if foam.TimestepValues else 0)
mesh = CellDatatoPointData(Input=MergeBlocks(Input=foam))

src = PointSource(Center=[0.173, 0.0765, 0.099], Radius=0.13, NumberOfPoints=seeds)
st = StreamTracer(Input=mesh, SeedType=src)
st.Vectors = ['POINTS', 'U']
st.MaximumStreamlineLength = 1.0
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
out_lines = []
while lines.GetNextCell(ids):
    n = ids.GetNumberOfIds()
    if n < 4:
        continue
    raw = []
    for k in range(n):
        i = ids.GetId(k)
        p = pts.GetPoint(i)
        u = U.GetTuple3(i)
        raw.append((p[0], p[1], p[2], T.GetValue(i), math.sqrt(u[0] ** 2 + u[1] ** 2 + u[2] ** 2)))
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
    out_lines.append(keep[:400])

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
