"""Temperatura media del aire en cajas alrededor de la gráfica, sobre un caso ya resuelto (pvbatch).

Uso:  pvbatch probe_zones.py <caso> [<caso> ...]   → una línea JSON por caso
Cajas (mm, coordenadas del modelo): detrás de la gráfica hasta la espina, encima, debajo y el hueco hasta el panel.
Sirve para probar hipótesis (p. ej. parte del calor de la gráfica sale por su placa y backplate al aire de la caja)
sin volver a simular.
"""
import json
import os
import sys

from paraview.simple import OpenFOAMReader, MergeBlocks, ExtractCellsByRegion, IntegrateVariables
from paraview import servermanager as sm

BOXES = {
    'gpuBack': ((30, 57.75, 42), (334, 67.25, 158)),
    'gpuTop': ((30, 16, 158), (334, 67, 197)),
    'gpuBottom': ((30, 16, 1), (334, 67, 42)),
    'gpuGap': ((30, 1, 42), (334, 16, 158)),
    'cpuSide': ((165, 84.5, 16), (335, 152, 186)),
    'boardTop': ((165, 85, 130), (335, 152, 197)),          # parte alta del lado de la placa
    'aboveCpuFan': ((200, 117, 128), (300, 152, 197)),      # encima del canal del procesador
    'besideCpuDuct': ((150, 117, 25), (183, 152, 130)),     # al lado del canal (hacia el frente)
    'boardFront': ((130, 85, 0), (184, 152, 197)),          # entre la fuente y la memoria
}

for case in sys.argv[1:]:
    foam = OpenFOAMReader(FileName=os.path.join(case, 'case.foam'))
    foam.MeshRegions = ['internalMesh']
    foam.CellArrays = ['T']
    foam.UpdatePipeline(max(foam.TimestepValues) if foam.TimestepValues else 0)
    mesh = MergeBlocks(Input=foam)
    out = {'case': os.path.basename(case.rstrip('/\\'))}
    for name, (lo, hi) in BOXES.items():
        ex = ExtractCellsByRegion(Input=mesh)
        ex.IntersectWith = 'Box'
        ex.IntersectWith.UseReferenceBounds = 0
        ex.IntersectWith.Position = [v / 1000 for v in lo]
        ex.IntersectWith.Length = [(h - l) / 1000 for l, h in zip(lo, hi)]
        iv = IntegrateVariables(Input=ex)
        iv.DivideCellDataByVolume = 1
        iv.UpdatePipeline()
        d = sm.Fetch(iv)
        arr = d.GetCellData().GetArray('T')
        out[name] = round(arr.GetValue(0) - 273.15 if arr.GetValue(0) > 200 else arr.GetValue(0), 2) if arr else None
    print(json.dumps(out), flush=True)
