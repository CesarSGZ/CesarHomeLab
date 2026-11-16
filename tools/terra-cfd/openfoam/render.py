"""Imágenes (y vídeo giratorio) del CFD con ParaView (pvbatch), sin abrir ventanas.

Uso:  pvbatch render.py <carpeta del caso> <carpeta de salida> <carpeta de STL> [--video | --cortes]

Las piezas que se dibujan son las del modelo 3D de la web (STL de export_stl.py, con sus mismos colores:
calor naranja, ventiladores azul, canales verde, estructura gris). Los canales solo salen si el caso los tiene.

Saca:
- aire_*.png         líneas de corriente coloreadas por la temperatura del aire, con las piezas
- velocidad_*.png    las mismas líneas coloreadas por velocidad
- corte_*.png        cortes de temperatura (por la gráfica, por el procesador y horizontal)
- giro/NNN.png       fotogramas de una vuelta completa (con --video), para montar un vídeo con ffmpeg
"""
import json
import math
import os
import sys

from paraview.simple import (  # noqa: E402
    OpenFOAMReader, STLReader, StreamTracer, Slice, Tube, GetActiveViewOrCreate, Show, Hide, ColorBy,
    GetColorTransferFunction, GetScalarBar, Render, SaveScreenshot, MergeBlocks, PointSource, CellDatatoPointData)

case, out, stl_dir = sys.argv[1], sys.argv[2], sys.argv[3]
video = '--video' in sys.argv
os.makedirs(out, exist_ok=True)
info = json.load(open(os.path.join(case, 'caseInfo.json')))
ducts = info.get('ducts', [])
manifest = json.load(open(os.path.join(stl_dir, 'manifest.json'), encoding='utf-8'))

ROLE = {'heat': [1.0, 0.56, 0.40], 'fan': [0.32, 0.85, 1.0], 'duct': [0.18, 0.77, 0.65],
        'structure': [0.62, 0.70, 0.73], 'cable': [0.35, 0.38, 0.40]}
HEAT = {'GPU': [1.0, 0.56, 0.40], 'CPU_COOLER': [1.0, 0.44, 0.31], 'RAM': [0.95, 0.76, 0.31], 'PSU': [1.0, 0.70, 0.42]}
OPACITY = {'heat': 0.30, 'fan': 0.55, 'duct': 0.55, 'structure': 0.16, 'cable': 0.5}

foam = OpenFOAMReader(FileName=os.path.join(case, 'case.foam'))
foam.MeshRegions = ['internalMesh']
foam.CellArrays = ['U', 'T']
foam.UpdatePipeline(max(foam.TimestepValues) if foam.TimestepValues else 0)
mesh = CellDatatoPointData(Input=MergeBlocks(Input=foam))
mesh.PassCellData = 1

view = GetActiveViewOrCreate('RenderView')
W, H = 1800, 1100
view.ViewSize = [W, H]
view.Background = [0.045, 0.075, 0.09]
try:
    view.UseColorPaletteForBackground = 0
except AttributeError:
    pass
view.OrientationAxesVisibility = 0

parts = []
for f in manifest['files']:
    kind, pid = f['kind'], f['id']
    if kind in ('opening', 'porous_zone'):
        continue
    if pid in ('GPU_DUCT', 'CPU_DUCT') and pid not in ducts:
        continue
    role = {'fan_disc': 'fan', 'wall': 'duct', 'cable': 'cable'}.get(kind) or ('heat' if pid in HEAT else 'structure')
    path = os.path.join(stl_dir, f['file'])
    if not os.path.exists(path):
        continue
    d = Show(STLReader(FileNames=[path]), view)
    ColorBy(d, None)
    color = HEAT.get(pid, ROLE[role])
    d.DiffuseColor = color
    d.AmbientColor = color
    d.Opacity = OPACITY[role]
    d.Specular = 0.2
    parts.append((d, role))

outline = Show(mesh, view)
outline.SetRepresentationType('Outline')
outline.AmbientColor = [0.62, 0.75, 0.6]
outline.DiffuseColor = [0.62, 0.75, 0.6]
outline.LineWidth = 1.5

seed = PointSource(Center=[0.173, 0.0765, 0.099], Radius=0.115, NumberOfPoints=1100)
st = StreamTracer(Input=mesh, SeedType=seed)
st.Vectors = ['POINTS', 'U']
st.MaximumStreamlineLength = 1.2
st.IntegrationDirection = 'BOTH'
tube = Tube(Input=st)
tube.Radius = 0.00055
sd = Show(tube, view)
Tamb = 19.0


def bar(lut, title):
    b = GetScalarBar(lut, view)
    b.Title = title
    b.ComponentTitle = ''
    b.TitleFontSize = 20
    b.LabelFontSize = 18
    b.ScalarBarLength = 0.38
    b.ScalarBarThickness = 22
    b.WindowLocation = 'Any Location'
    b.Orientation = 'Vertical'
    b.Position = [0.9, 0.08]
    b.LabelFormat = '%.0f'
    b.RangeLabelFormat = '%.0f'
    return b


def color_streams(by):
    if by == 'T':
        ColorBy(sd, ('POINTS', 'T'))
        lut = GetColorTransferFunction('T')
        lut.ApplyPreset('Cool to Warm (Extended)', True)
        lut.RescaleTransferFunction(Tamb, 60.0)
        bar(lut, 'aire (°C)')
    else:
        ColorBy(sd, ('POINTS', 'U', 'Magnitude'))
        lut = GetColorTransferFunction('U')
        lut.ApplyPreset('Turbo', True)
        lut.RescaleTransferFunction(0.0, 2.5)
        b = bar(lut, 'velocidad (m/s)')
        b.LabelFormat = '%.1f'
        b.RangeLabelFormat = '%.1f'
    sd.SetScalarBarVisibility(view, True)


C = [0.173, 0.0765, 0.099]
CAMS = {
    'iso': ([0.60, -0.40, 0.40], [0, 0, 1]),
    'grafica': ([0.173, -0.62, 0.13], [0, 0, 1]),
    'cpu': ([0.173, 0.78, 0.13], [0, 0, 1]),
    'arriba': ([0.173, 0.0766, 0.80], [1, 0, 0]),
}


def cam(pos, up, angle=30):
    view.CameraPosition = pos
    view.CameraFocalPoint = C
    view.CameraViewUp = up
    view.CameraViewAngle = angle
    Render(view)


cortes = '--cortes' in sys.argv      # los cortes van en una pasada aparte (mezclarlos con las líneas daba imágenes en blanco)
if not cortes:
    for by, prefix in (('T', 'aire'), ('U', 'velocidad')):
        color_streams(by)
        for name, (pos, up) in CAMS.items():
            if by == 'U' and name not in ('iso', 'cpu'):
                continue
            cam(pos, up)
            SaveScreenshot(os.path.join(out, f'{prefix}_{name}.png'), view, ImageResolution=[W, H])
        sd.SetScalarBarVisibility(view, False)

    if video:
        color_streams('T')
        os.makedirs(os.path.join(out, 'giro'), exist_ok=True)
        N = 120
        for i in range(N):
            a = 2 * math.pi * i / N - 0.6
            cam([C[0] + 0.66 * math.cos(a), C[1] + 0.66 * math.sin(a), 0.36], [0, 0, 1])
            SaveScreenshot(os.path.join(out, 'giro', f'{i:03d}.png'), view, ImageResolution=[1280, 780])
        sd.SetScalarBarVisibility(view, False)

else:
    # Cortes de temperatura: piezas casi transparentes para que se vea el corte
    Hide(tube, view)
    for d, role in parts:        # en los cortes, las piezas solo como aristas (sin transparencias)
        d.Opacity = 1.0
        if role == 'cable':
            Hide(d.Input, view)
            continue
        d.SetRepresentationType('Feature Edges')
        d.LineWidth = 2.0 if role in ('duct', 'fan') else 1.2
    for name, origin, normal, pos, up in [
            ('grafica', [0.1818, 0.0765, 0.099], [1, 0, 0], [0.66, 0.0765, 0.099], [0, 0, 1]),
            ('cpu', [0.2502, 0.0765, 0.099], [1, 0, 0], [0.73, 0.0765, 0.099], [0, 0, 1]),
            ('horizontal', [0.173, 0.0765, 0.110], [0, 0, 1], [0.173, 0.0765, 0.80], [0, 1, 0])]:
        sl = Slice(Input=mesh)
        sl.SliceType = 'Plane'
        sl.SliceType.Origin = origin
        sl.SliceType.Normal = normal
        d = Show(sl, view)
        ColorBy(d, ('POINTS', 'T'))
        tl = GetColorTransferFunction('T')
        tl.ApplyPreset('Cool to Warm (Extended)', True)
        tl.RescaleTransferFunction(Tamb, 60.0)
        bar(tl, 'aire (°C)')
        d.SetScalarBarVisibility(view, True)
        view.CameraPosition = pos
        view.CameraFocalPoint = origin
        view.CameraViewUp = up
        view.CameraViewAngle = 22
        Render(view)
        SaveScreenshot(os.path.join(out, f'corte_{name}.png'), view, ImageResolution=[W, H])
        Hide(sl, view)
print('ok', out)
