"""Renderiza los dos casos (S04 y S07) y deja las imágenes y el vídeo de la web en control/assets/thermal/cfd.

Uso:  python publish_images.py <caso S04> <caso S07>

Llama a pvbatch con render.py (líneas de aire, cortes y, para la S07, una vuelta completa), recorta y
comprime las imágenes (JPG al 84 %, 1200 px de ancho como mucho) y monta el vídeo con ffmpeg.
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HOME = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude'
PVBATCH = next((HOME / 'Cache' / 'CFD' / 'ParaView').glob('*/bin/pvbatch.exe'))
STL = HOME / 'Datos' / 'Terra' / 'cfd-geometria'
IMG = HOME / 'Datos' / 'Terra' / 'cfd-imagenes'
WEB = ROOT / 'control' / 'assets' / 'thermal' / 'cfd'
VIEWS = ['aire_iso', 'aire_cpu', 'aire_grafica', 'velocidad_iso', 'corte_cpu', 'corte_grafica', 'corte_horizontal']
CROP = {'aire_iso': (330, 110, 1800, 1090), 'velocidad_iso': (330, 110, 1800, 1090)}


def pv(case, out, *flags):
    subprocess.run([str(PVBATCH), str(HERE / 'render.py'), str(case), str(out), str(STL), *flags],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main():
    cases = {'s04': Path(sys.argv[1]), 's07': Path(sys.argv[2])}
    WEB.mkdir(parents=True, exist_ok=True)
    for old in WEB.glob('*'):
        old.unlink()
    for tag, case in cases.items():
        out = IMG / case.name
        if out.exists():
            shutil.rmtree(out)
        pv(case, out, *(['--video'] if tag == 's07' else []))
        pv(case, out, '--cortes')
        for v in VIEWS:
            im = Image.open(out / f'{v}.png').convert('RGB')
            im = im.crop(CROP.get(v, (150, 40, 1800, 1090)))
            im.thumbnail((1200, 900))
            im.save(WEB / f'{tag}-{v.replace("_", "-")}.jpg', quality=84, optimize=True)
        if tag == 's07':
            ffmpeg = shutil.which('ffmpeg')
            subprocess.run([ffmpeg, '-y', '-loglevel', 'error', '-framerate', '20', '-i', str(out / 'giro' / '%03d.png'),
                            '-vf', 'scale=1120:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow',
                            '-movflags', '+faststart', str(WEB / 's07-giro.mp4')], check=True)
            Image.open(out / 'giro' / '000.png').convert('RGB').save(WEB / 's07-giro.jpg', quality=82, optimize=True)
    for f in sorted(WEB.glob('*')):
        print(f.name, f.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
