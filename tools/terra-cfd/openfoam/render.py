"""Imágenes del CFD con ParaView (pvbatch), sin abrir ventanas.

Uso:  pvbatch render.py <carpeta del caso> <carpeta de salida> [<carpeta de STL>]

Saca:
- flujo_*.png      líneas de corriente coloreadas por velocidad, con las piezas en semitransparente
- temperatura_*.png corte vertical por los ventiladores de la gráfica y del procesador, coloreado por temperatura
"""
import os
import sys

from paraview.simple import (  # noqa: E402
    OpenFOAMReader, STLReader, StreamTracer, Slice, Tube, GetActiveViewOrCreate, Show, Hide, ColorBy,
    GetColorTransferFunction, GetScalarBar, Render, SaveScreenshot, ResetCamera, Calculator, MergeBlocks,
    PointSource, Glyph, ExtractBlock)

case, out = sys.argv[1], sys.argv[2]
stl_dir = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(out, exist_ok=True)

foam = OpenFOAMReader(FileName=os.path.join(case, 'case.foam'))
foam.MeshRegions = ['internalMesh']
foam.CellArrays = ['U', 'p', 'T']
foam.UpdatePipeline(max(foam.TimestepValues) if foam.TimestepValues else 0)
mesh = MergeBlocks(Input=foam)
temp = mesh

view = GetActiveViewOrCreate('RenderView')
view.ViewSize = [1800, 1100]
view.Background = [0.06, 0.09, 0.11]
try:
    view.UseColorPaletteForBackground = 0
except AttributeError:
    pass
view.OrientationAxesVisibility = 0

# Piezas en semitransparente para dar contexto
parts = []
if stl_dir and os.path.isdir(stl_dir):
    for name, color, opacity in [('gpu.stl', [0.55, 0.2, 0.2], 0.25), ('cpu_cooler.stl', [0.75, 0.45, 0.2], 0.3),
                                 ('psu.stl', [0.35, 0.35, 0.4], 0.3), ('motherboard.stl', [0.2, 0.45, 0.3], 0.3),
                                 ('ram.stl', [0.4, 0.4, 0.6], 0.3), ('gpu_duct.stl', [0.9, 0.9, 0.9], 0.35),
                                 ('cpu_duct.stl', [0.9, 0.9, 0.9], 0.35), ('spine.stl', [0.5, 0.5, 0.5], 0.12)]:
        f = os.path.join(stl_dir, name)
        if os.path.exists(f):
            s = STLReader(FileNames=[f])
            d = Show(s, view)
            d.DiffuseColor = color
            d.AmbientColor = color
            d.Opacity = opacity
            parts.append(d)

# Contorno de la caja
outline = Show(mesh, view)
outline.SetRepresentationType('Outline')
outline.AmbientColor = [0.6, 0.7, 0.75]
outline.DiffuseColor = [0.6, 0.7, 0.75]

# Líneas de corriente desde una nube de puntos que llena la caja
seed = PointSource(Center=[0.173, 0.0765, 0.099], Radius=0.11, NumberOfPoints=900)
st = StreamTracer(Input=mesh, SeedType=seed)
st.Vectors = ['CELLS', 'U']
st.MaximumStreamlineLength = 1.5
st.IntegrationDirection = 'BOTH'
tube = Tube(Input=st)
tube.Radius = 0.0006
sd = Show(tube, view)
ColorBy(sd, ('POINTS', 'U', 'Magnitude'))
lut = GetColorTransferFunction('U')
lut.ApplyPreset('Turbo', True)
lut.RescaleTransferFunction(0.0, 2.0)
bar = GetScalarBar(lut, view)
bar.Title = 'velocidad del aire (m/s)'
bar.ComponentTitle = ''
bar.TitleFontSize = 18
bar.LabelFontSize = 16
sd.SetScalarBarVisibility(view, True)

cams = {
    'iso': ([0.62, -0.42, 0.42], [0.173, 0.0765, 0.099], [0, 0, 1]),
    'lado_grafica': ([0.173, -0.55, 0.099], [0.173, 0.0765, 0.099], [0, 0, 1]),
    'lado_cpu': ([0.173, 0.70, 0.099], [0.173, 0.0765, 0.099], [0, 0, 1]),
    'arriba': ([0.173, 0.0765, 0.75], [0.173, 0.0765, 0.099], [1, 0, 0]),
}
for name, (pos, foc, up) in cams.items():
    view.CameraPosition = pos
    view.CameraFocalPoint = foc
    view.CameraViewUp = up
    view.CameraViewAngle = 30
    Render(view)
    SaveScreenshot(os.path.join(out, f'flujo_{name}.png'), view, ImageResolution=[1800, 1100])

# Cortes de temperatura
Hide(tube, view)
for name, origin, normal, cam in [
        ('grafica', [0.1818, 0.06, 0.1], [1, 0, 0], ([0.75, 0.0765, 0.099], [0.18, 0.0765, 0.099], [0, 0, 1])),
        ('cpu', [0.2502, 0.06, 0.122], [1, 0, 0], ([0.85, 0.0765, 0.11], [0.25, 0.0765, 0.11], [0, 0, 1])),
        ('horizontal', [0.17, 0.07, 0.10], [0, 0, 1], ([0.173, 0.0765, 0.75], [0.173, 0.0765, 0.099], [1, 0, 0]))]:
    sl = Slice(Input=temp)
    sl.SliceType = 'Plane'
    sl.SliceType.Origin = origin
    sl.SliceType.Normal = normal
    d = Show(sl, view)
    ColorBy(d, ('CELLS', 'T'))
    tl = GetColorTransferFunction('T')
    tl.ApplyPreset('Black-Body Radiation', True)
    tl.RescaleTransferFunction(19.0, 60.0)
    tb = GetScalarBar(tl, view)
    tb.Title = 'temperatura del aire (°C)'
    tb.ComponentTitle = ''
    d.SetScalarBarVisibility(view, True)
    sd.SetScalarBarVisibility(view, False)
    view.CameraPosition, view.CameraFocalPoint, view.CameraViewUp = cam
    Render(view)
    SaveScreenshot(os.path.join(out, f'temperatura_{name}.png'), view, ImageResolution=[1800, 1100])
    Hide(sl, view)
print('ok', out)
