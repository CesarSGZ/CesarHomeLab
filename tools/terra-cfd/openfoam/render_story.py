"""Animación limpia del aire para el CV (pvbatch): cámara fija, pocas líneas y trazos que avanzan con el aire.

Uso:  pvbatch render_story.py <carpeta del caso> <carpeta de salida> <carpeta de STL> [--frames=96] [--test]

En vez de miles de líneas y una cámara girando, se siembran líneas solo en los discos de los ventiladores
(gráfica, procesador, abajo, arriba y fuente) y se siguen en los dos sentidos: de fuera de la caja hasta el
ventilador y del ventilador hasta que el aire sale. Cada línea lleva trazos cortos que se mueven a la velocidad
real del aire (a cámara lenta), coloreados por su temperatura, sobre la misma línea dibujada muy tenue.
El tiempo de cada trazo es el tiempo real de integración, así que el aire va despacio fuera y deprisa en los
ventiladores. La animación cierra el bucle: el último fotograma enlaza con el primero.
"""
import json
import math
import os
import random
import sys

from paraview.simple import (  # noqa: E402
    OpenFOAMReader, STLReader, StreamTracer, Tube, GetActiveViewOrCreate, Show, ColorBy, GetColorTransferFunction,
    Render, SaveScreenshot, MergeBlocks, CellDatatoPointData, Transform, Box, Plane, PolyPointSource,
    PythonCalculator, Threshold, Triangulate, ExtractSurface, Text)

case, out, stl_dir = sys.argv[1], sys.argv[2], sys.argv[3]
FRAMES = int(next((a.split('=')[1] for a in sys.argv if a.startswith('--frames=')), '96'))
TEST = '--test' in sys.argv
os.makedirs(out, exist_ok=True)
info = json.load(open(os.path.join(case, 'caseInfo.json')))
ducts = info.get('ducts', [])
manifest = json.load(open(os.path.join(stl_dir, 'manifest.json'), encoding='utf-8'))
geo = json.load(open(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'control', 'data', 'terra-thermal-summary.json'),
                     encoding='utf-8'))['geometry']

foam = OpenFOAMReader(FileName=os.path.join(case, 'case.foam'))
foam.MeshRegions = ['internalMesh']
foam.CellArrays = ['U', 'T']
foam.UpdatePipeline(max(foam.TimestepValues) if foam.TimestepValues else 0)
mesh = CellDatatoPointData(Input=MergeBlocks(Input=foam))


def mirror(src):
    # misma reflexión que render.py y el visor web (y → −y) para que se vea como el PC real
    tr = Transform(Input=src)
    tr.Transform = 'Transform'
    tr.Transform.Scale = [1.0, -1.0, 1.0]
    try:
        tr.TransformAllInputVectors = 1
    except AttributeError:
        pass
    return tr


# ---------- semillas: anillos en el disco de cada ventilador ----------
PER_FAN = {'GPU_FAN_1': 11, 'GPU_FAN_2': 11, 'GPU_FAN_3': 11, 'CPU_FAN': 18, 'BOTTOM_FAN': 8}
rng = random.Random(7)
pts = []
for c in geo['components']:
    f = c.get('fan')
    if not f or c['id'] not in PER_FAN:
        continue
    cx, cy, cz = (v / 1000 for v in f['centre'])
    ax = f['axis']
    r_out, r_in = f['diameter'] / 2000 * 0.92, f['diameter'] / 2000 * max(0.35, f.get('hub_ratio', 0.3) + 0.05)
    # dos vectores perpendiculares al eje
    e1 = [1, 0, 0] if abs(ax[0]) < 0.5 else [0, 1, 0]
    e2 = [ax[1] * e1[2] - ax[2] * e1[1], ax[2] * e1[0] - ax[0] * e1[2], ax[0] * e1[1] - ax[1] * e1[0]]
    n = PER_FAN[c['id']]
    for k in range(n):
        a = 2 * math.pi * (k + rng.random() * 0.6) / n
        r = math.sqrt(r_in ** 2 + (r_out ** 2 - r_in ** 2) * rng.random())
        pts += [cx + r * (math.cos(a) * e1[0] + math.sin(a) * e2[0]),
                cy + r * (math.cos(a) * e1[1] + math.sin(a) * e2[1]),
                cz + r * (math.cos(a) * e1[2] + math.sin(a) * e2[2])]
seeds = PolyPointSource(Points=pts)

st = StreamTracer(Input=mesh, SeedType=seeds)
st.Vectors = ['POINTS', 'U']
st.IntegrationDirection = 'BOTH'
st.MaximumStreamlineLength = 0.6

lines = CellDatatoPointData(Input=st)          # SeedIds de cada línea también en sus puntos
lines.PassCellData = 1
# desfase por línea para que los trazos no vayan todos a la vez
PERIOD = 0.32            # s de aire real entre dos trazos de la misma línea
DASH = 0.05              # s de aire real que dura cada trazo
phase0 = PythonCalculator(Input=lines, ArrayName='s0', ArrayAssociation='Point Data')
phase0.Expression = (f"mod(inputs[0].PointData['IntegrationTime'] - mod(inputs[0].PointData['SeedIds'] * 0.6180339, 1.0) * {PERIOD}, {PERIOD})")
segments = Triangulate(Input=phase0)            # polilíneas → segmentos sueltos, para poder cortar trazos


def keep(src, name, lo, hi):
    th = Threshold(Input=src)
    th.Scalars = ['POINTS', name]
    try:
        th.LowerThreshold, th.UpperThreshold = lo, hi
        th.ThresholdMethod = 'Between'
    except AttributeError:
        th.ThresholdRange = [lo, hi]
    th.AllScalars = 1
    return ExtractSurface(Input=th)


# hacia atrás solo el tramo corto de la rejilla al ventilador: fuera el aire va lento y da vueltas que confunden
box = PythonCalculator(Input=segments, ArrayName='inbox', ArrayAssociation='Point Data')   # solo cerca de la caja
box.Expression = ("(inputs[0].Points[:,0] > -0.03) * (inputs[0].Points[:,0] < 0.373) * (inputs[0].Points[:,1] > -0.04)"
                  " * (inputs[0].Points[:,1] < 0.193) * (inputs[0].Points[:,2] > -0.02) * (inputs[0].Points[:,2] < 0.245) * 1.0")
clean = keep(keep(box, 'inbox', 0.5, 2.0), 'IntegrationTime', -0.12, 1e3)

view = GetActiveViewOrCreate('RenderView')
W, H = 1000, 1000          # cuadrado: el hueco del CV es vertical en escritorio y apaisado en el móvil
view.ViewSize = [W, H]
view.Background = [11 / 255, 19 / 255, 23 / 255]     # el mismo fondo que la tarjeta del CV (#0b1317)
try:
    view.UseColorPaletteForBackground = 0
except AttributeError:
    pass
view.OrientationAxesVisibility = 0

# ---------- piezas: siluetas suaves, sin tapar el aire ----------
HEAT = {'GPU': [1.0, 0.56, 0.40], 'CPU_COOLER': [1.0, 0.44, 0.31], 'RAM': [0.95, 0.76, 0.31], 'PSU': [1.0, 0.70, 0.42]}
for f in manifest['files']:
    kind, pid = f['kind'], f['id']
    if kind in ('opening', 'porous_zone', 'cable') or pid.startswith('PANEL') or 'SLOT' in pid.upper():
        continue
    if pid in ('GPU_DUCT', 'CPU_DUCT') and pid not in ducts:
        continue
    path = os.path.join(stl_dir, f['file'])
    if not os.path.exists(path):
        continue
    d = Show(mirror(STLReader(FileNames=[path])), view)
    ColorBy(d, None)
    if kind == 'fan_disc':
        col, op = [0.32, 0.85, 1.0], 0.22
    elif kind == 'wall' or pid in ('GPU_DUCT', 'CPU_DUCT'):
        col, op = [0.18, 0.77, 0.65], 0.30
    elif pid in HEAT:
        col, op = HEAT[pid], 0.20
    else:
        col, op = [0.55, 0.63, 0.67], 0.07
    d.DiffuseColor = col
    d.AmbientColor = col
    d.Opacity = op
    d.Specular = 0.1

case_box = Box(XLength=0.343, YLength=0.153, ZLength=0.198, Center=[0.1715, 0.0765, 0.099])
outline = Show(mirror(case_box), view)
outline.SetRepresentationType('Outline')
outline.AmbientColor = outline.DiffuseColor = [0.55, 0.68, 0.62]
outline.LineWidth = 1.6


# ---------- color por temperatura (mismos colores que el visor web) ----------
T_STOPS = [(19, '3b7bd8'), (26, '5fb0f0'), (33, 'a8dcf5'), (40, 'eef2f4'), (47, 'f6a46b'), (54, 'e0482b'), (60, 'a01528')]
lut = GetColorTransferFunction('T')
rgb = []
for i, (_, hx) in enumerate(T_STOPS):
    # 19-36 °C: el aire que sale de los disipadores ronda los 30-36 °C; con esta escala se ve dónde se calienta
    rgb += [19.0 + 17.0 * i / (len(T_STOPS) - 1)] + [int(hx[k:k + 2], 16) / 255 for k in (0, 2, 4)]
lut.RGBPoints = rgb
lut.ColorSpace = 'Lab'

# camino completo muy tenue
ghost = Tube(Input=mirror(clean))
ghost.Radius = 0.0005
ghost.UpdatePipeline()
gd = Show(ghost, view)
ColorBy(gd, ('POINTS', 'T'))
gd.LookupTable = lut
gd.Opacity = 0.11

# trazos que avanzan
moving = PythonCalculator(Input=clean, ArrayName='s', ArrayAssociation='Point Data')
dash = Tube(Input=mirror(keep(moving, 's', 0.0, DASH)))
dash.Radius = 0.0014
dash.NumberofSides = 8
dash.UpdatePipeline()
dsh = Show(dash, view)
ColorBy(dsh, ('POINTS', 'T'))
dsh.LookupTable = lut
dsh.Ambient = 0.35
dsh.Specular = 0.3
# ColorBy reajusta la escala al rango de los datos: se vuelve a fijar y se bloquea
try:
    lut.AutomaticRescaleRangeMode = 'Never'
except AttributeError:
    pass
lut.RGBPoints = rgb

# rótulos: qué lado es cuál y por dónde sale el aire (en inglés, para el CV)
LABELS = [('GPU side', [0.04, 0.03]), ('CPU side', [0.76, 0.03]), ('warm air out', [0.37, 0.945]),
          ('room air in', [0.008, 0.615]), ('room air in', [0.80, 0.615])]
if '--no-labels' not in sys.argv:
    for txt, pos in LABELS:
        tv = Show(Text(Text=txt), view)
        tv.WindowLocation = 'Any Location'
        tv.Position = pos
        tv.FontSize = 23
        tv.FontFamily = 'Arial'
        tv.Color = [0.70, 0.80, 0.84]

# cámara fija: desde delante y algo arriba, para ver el lado de la gráfica (izquierda) y el del procesador (derecha)
Render(view)              # el primer render recoloca la cámara: se fija después
C = [0.172, -0.0765, 0.094]
view.CameraFocalPoint = C
CAM = [float(v) for v in next((a.split('=')[1] for a in sys.argv if a.startswith('--cam=')), '-0.50,-0.135,0.235').split(',')]
view.CameraPosition = CAM
view.CameraViewUp = [0, 0, 1]
view.CameraViewAngle = 30

n = 4 if TEST else FRAMES
for i in range(n):
    ph = PERIOD * i / FRAMES
    moving.Expression = f"mod(inputs[0].PointData['s0'] - {ph:.6f}, {PERIOD})"
    Render(view)
    SaveScreenshot(os.path.join(out, f'{i:03d}.png'), view, ImageResolution=[W * 3 // 2, H * 3 // 2])   # se reduce luego: bordes suaves
print('ok', out, len(pts) // 3, 'semillas')
