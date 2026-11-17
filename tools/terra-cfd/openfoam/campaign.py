"""Campaña de CFD con aire exterior: validación (S04, S07) y ventiladores de caja dados la vuelta.

Uso:  python campaign.py [--cell 2.5] [--ext 36] [--only S07,S07-top-in]

Para cada caso: make_case → run_case (ajuste de ventiladores) → líneas para el visor (export_streams)
→ imágenes y fotogramas del GIF (render.py --gif) → GIF con ffmpeg. Al final compare.py S04/S07.
Se puede cortar y relanzar: los casos con results.json no se repiten.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
DATA = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra'
PV = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Cache' / 'CFD' / 'ParaView' / 'ParaView-6.2.1-Windows-Python3.12-msvc2017-AMD64' / 'bin' / 'pvbatch.exe'
FFMPEG = shutil.which('ffmpeg') or 'ffmpeg'

# rpm medidas en la fase combinada; el de arriba a tope (Sistema 2 no da una lectura válida)
# Orden por importancia: si el tiempo se acaba, lo que falta es lo menos útil
CASES = [
    ('S04', 'S04', ['BOTTOM_FAN=1361', 'TOP_FAN=2200'], []),          # ajuste
    ('S07', 'S07', ['BOTTOM_FAN=1206', 'TOP_FAN=2200'], []),          # predicción (y vídeo del CV)
    ('S05', 'S05', [], []),                                           # a ciegas: sin paneles (la S08 no se puede: los canales van en los paneles)
    ('S07-top-in', 'S07', ['BOTTOM_FAN=1206', 'TOP_FAN=2200'], ['TOP_FAN']),
    ('S07-bottom-out', 'S07', ['BOTTOM_FAN=1206', 'TOP_FAN=2200'], ['BOTTOM_FAN']),
    ('S07-both-flipped', 'S07', ['BOTTOM_FAN=1206', 'TOP_FAN=2200'], ['TOP_FAN', 'BOTTOM_FAN']),
    ('S06', 'S06', [], []),                                           # a ciegas: solo el canal de la CPU
]


def run(cmd, **kw):
    print('>', ' '.join(str(c) for c in cmd), flush=True)
    return subprocess.run([str(c) for c in cmd], check=True, **kw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cell', type=float, default=2.5)
    ap.add_argument('--ext', type=float, default=36)
    ap.add_argument('--grille-k', type=float, default=0.6)
    ap.add_argument('--only', default='')
    ap.add_argument('--seeds', type=int, default=3500)
    ap.add_argument('--loops', type=int, default=5)
    a = ap.parse_args()
    only = set(filter(None, a.only.split(',')))
    out = DATA / 'cfd-casos' / f'campana-ext-{a.cell:g}mm'
    img = DATA / 'cfd-imagenes' / f'campana-ext-{a.cell:g}mm'
    streams = REPO / 'control' / 'data' / 'cfd'
    streams.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, PYTHONIOENCODING='utf8')
    for name, cfg, rpm, flip in CASES:
        if only and name not in only:
            continue
        case = out / f'terra-{cfg}-{a.cell:g}mm-{name}'
        if not (case / 'results.json').exists():
            cmd = [sys.executable, HERE / 'make_case.py', '--config', cfg, '--cell', a.cell, '--ext', a.ext,
                   '--grille-k', a.grille_k, f'--tag=-{name}', '--out', out]
            for r in rpm:
                cmd += ['--rpm', r]
            for f in flip:
                cmd += ['--panels-off'] if f == 'PANELS_OFF' else ['--flip', f]
            run(cmd, env=env)
            run([sys.executable, HERE / 'run_case.py', case, '--np', '8', '--loops', str(a.loops), '--iters', '500'], env=env)
        run([PV, HERE / 'export_streams.py', case, streams / f'{name.lower()}-streams.bin', a.seeds], env=env)
        frames = img / name
        run([PV, HERE / 'render.py', case, frames, DATA / 'cfd-geometria', '--gif', f'--seeds={a.seeds}'], env=env)
        gif = img / f'{name}.gif'
        run([FFMPEG, '-y', '-loglevel', 'error', '-framerate', '16', '-i', frames / 'gif' / '%03d.png',
             '-vf', "select='not(mod(n,2))',setpts=N/(10*TB),scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5",
             '-r', '10', gif])                                        # ~6 MB para mandarlo por el móvil
        run([FFMPEG, '-y', '-loglevel', 'error', '-framerate', '24', '-i', frames / 'gif' / '%03d.png',
             '-vf', 'scale=1100:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-movflags', '+faststart',
             img / f'{name}.mp4'])                                    # la versión buena
        if name == 'S07':   # vídeo de la tarjeta del CV (público, sin barra de color)
            run([FFMPEG, '-y', '-loglevel', 'error', '-framerate', '20', '-i', frames / 'gif' / '%03d.png',
                 '-vf', 'crop=960:660:40:20,scale=960:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow',
                 '-movflags', '+faststart', '-an', REPO / 'assets' / 'projects' / 'thermal-cfd.mp4'])
            run([FFMPEG, '-y', '-loglevel', 'error', '-i', frames / 'gif' / '000.png', '-vf', 'crop=960:660:40:20',
                 '-q:v', '4', REPO / 'assets' / 'projects' / 'thermal-cfd-poster.jpg'])
        print('listo', name, json.load(open(case / 'results.json'))['vents_m3h'], flush=True)
    s04 = out / f'terra-S04-{a.cell:g}mm-S04'
    s07 = out / f'terra-S07-{a.cell:g}mm-S07'
    if (s04 / 'results.json').exists() and (s07 / 'results.json').exists():
        blind = [f'--blind={b}={out / f"terra-{b}-{a.cell:g}mm-{b}"}' for b in ('S05', 'S06')]
        run([sys.executable, HERE / 'compare.py', s04, s07, *blind, '--json', out / 'compare.json'], env=env)


if __name__ == '__main__':
    main()
