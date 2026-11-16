"""Malla, simula y ajusta los ventiladores a su curva en un caso creado por make_case.py.

Uso:  python run_case.py <carpeta del caso> [--np 8] [--loops 5] [--iters 400]

1. Malla: blockMesh → aberturas (topoSet + createPatch) → zonas (topoSet) → quitar sólidos (subsetMesh).
2. Bucle exterior: simpleFoam en paralelo N iteraciones; se lee el caudal de cada ventilador (velocidad axial
   media en su zona × área del disco) y se corrige su salto de presión hacia la curva Δp = p0·(1 − Q/Q0).
3. Al final escribe results.json (caudales, temperaturas medias por zona, flujo por cada abertura).
"""
import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
FOAM = str(HERE / 'foam.bat')
RHO = 1.16
SOLVER = 'buoyantBoussinesqSimpleFoam'
DISC_SIGN = 1.0     # sentido de phi en los discos (cara orientada saliendo de la zona del ventilador)


def foam(case, *args, log=None):
    cmd = ['cmd', '/c', FOAM, *args]
    with open(case / (log or f'log.{args[0]}'), 'w', encoding='utf-8', errors='replace') as fh:
        r = subprocess.run(cmd, cwd=case, stdout=fh, stderr=subprocess.STDOUT)
    text = (case / (log or f'log.{args[0]}')).read_text(encoding='utf-8', errors='replace')
    if r.returncode != 0 or 'FOAM FATAL' in text:
        tail = '\n'.join(text.splitlines()[-25:])
        sys.exit(f'{" ".join(args)} falló:\n{tail}')
    return text


def mesh(case):
    if (case / 'constant' / 'polyMesh' / 'cellZones').exists() and 'oldInternalFaces' in (case / 'constant' / 'polyMesh' / 'boundary').read_text():
        return
    foam(case, 'blockMesh')
    foam(case, 'topoSet', '-dict', 'system/topoSetDict.vents', log='log.topoSet.vents')
    foam(case, 'createPatch', '-overwrite')
    foam(case, 'topoSet')
    shutil.copytree(case / '0', case / '0.orig', dirs_exist_ok=True)
    foam(case, 'subsetMesh', 'fluid', '-overwrite')
    # subsetMesh deja las caras de los sólidos quitados en un patch 'empty': en 3D tienen que ser pared
    b = case / 'constant' / 'polyMesh' / 'boundary'
    b.write_text(re.sub(r'(oldInternalFaces\s*\{[^}]*?type\s+)empty;(\s*inGroups\s+\w+\s*\([^)]*\);)?', r'\1wall;', b.read_text(), flags=re.S))
    # subsetMesh reescribe los campos con ese patch como empty: se recuperan los originales (usan expresiones regulares)
    shutil.rmtree(case / '0')
    shutil.copytree(case / '0.orig', case / '0')
    out = foam(case, 'checkMesh')
    if 'Mesh OK' not in out:
        sys.exit('checkMesh no da Mesh OK')


def last_row(path):
    rows = [ln for ln in path.read_text().splitlines() if ln and not ln.startswith('#')]
    nums = [float(x) for x in re.findall(r'[-+0-9.eE]+', rows[-1])]
    return nums


def zone_avg(case, zone):
    d = sorted((case / 'postProcessing' / f'zone_{zone}').glob('*/volFieldValue.dat'), key=lambda p: float(p.parent.name))
    if not d:
        return None
    n = last_row(d[-1])            # time, Ux, Uy, Uz, T
    return {'U': n[1:4], 'T': n[4] if len(n) > 4 else None}


def vent_flow(case, vent):
    d = sorted((case / 'postProcessing' / f'flow_{vent}').glob('*/surfaceFieldValue.dat'), key=lambda p: float(p.parent.name))
    return last_row(d[-1])[1] if d else None     # m3/s, + sale de la caja


def fan_flow(case, zone, s):
    """Caudal real del ventilador (m3/h): flujo phi por su disco de caras."""
    d = sorted((case / 'postProcessing' / f'fanflow_{zone}').glob('*/surfaceFieldValue.dat'), key=lambda p: float(p.parent.name))
    raw = last_row(d[-1])[1] if d else 0.0
    return raw * DISC_SIGN * (1 if s.get('disc', 'down') == 'down' else -1) * 3600


def write_fans(case, state):
    text = (case / 'constant' / 'fvOptions').read_text()
    for zone, s in state['fans'].items():
        acc = s['dp_Pa'] / RHO / s['thickness_m']
        ax = s['axis']
        new = f"U           (({acc * ax[0]:.6g} {acc * ax[1]:.6g} {acc * ax[2]:.6g}) 0);"
        text = re.sub(rf'({zone}Push\s*\{{[^}}]*?sources\s*\{{\s*)U\s+\(\([^)]*\)\s*0\);', lambda mm: mm.group(1) + new, text, flags=re.S)
    (case / 'constant' / 'fvOptions').write_text(text)
    for proc in case.glob('processor*/constant'):
        (proc / 'fvOptions').write_text(text)
    (case / 'fanState.json').write_text(json.dumps(state, indent=2))


def latest_time(case, np_):
    base = case / 'processor0' if np_ > 1 and (case / 'processor0').exists() else case
    times = [float(p.name) for p in base.iterdir() if p.is_dir() and re.fullmatch(r'[0-9.e+-]+', p.name)]
    return max(times) if times else 0


def solve(case, iters, np_):
    ctl = case / 'system' / 'controlDict'
    t0 = latest_time(case, np_)
    end = int(t0) + iters
    txt = re.sub(r'^endTime\s+.*$', f'endTime         {end};', ctl.read_text(), flags=re.M)
    txt = re.sub(r'^writeInterval\s+.*$', f'writeInterval   {iters};', txt, flags=re.M)
    ctl.write_text(txt)
    if np_ > 1:
        if not (case / 'processor0').exists():
            dp = (case / 'system' / 'decomposeParDict')
            dp.write_text(re.sub(r'numberOfSubdomains\s+\d+;', f'numberOfSubdomains {np_};', dp.read_text()))
            foam(case, 'decomposePar', '-force')
        foam(case, 'mpiexec', '-n', str(np_), SOLVER, '-parallel', log=f'log.simpleFoam.{end}')
    else:
        foam(case, SOLVER, log=f'log.simpleFoam.{end}')
    return end


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('case')
    ap.add_argument('--np', type=int, default=8)
    ap.add_argument('--loops', type=int, default=5)
    ap.add_argument('--iters', type=int, default=400)
    a = ap.parse_args()
    case = Path(a.case)
    mesh(case)
    state = json.loads((case / 'fanState.json').read_text())
    history = []
    for loop in range(a.loops):
        write_fans(case, state)
        end = solve(case, a.iters, a.np)
        row = {'loop': loop, 'iter': end, 'fans': {}}
        worst = 0
        for zone, s in state['fans'].items():
            q = fan_flow(case, zone, s)
            target = max(0.0, s['p0_Pa'] * (1 - max(q, 0.0) / s['q0_m3h']))
            worst = max(worst, abs(target - s['dp_Pa']) / max(s['p0_Pa'], 1e-6))
            row['fans'][zone] = {'Q_m3h': round(q, 1), 'dp_Pa': round(s['dp_Pa'], 2), 'target_Pa': round(target, 2)}
            s['dp_Pa'] = 0.5 * s['dp_Pa'] + 0.5 * target
            s['Q_m3h'] = q
        history.append(row)
        print(json.dumps(row), flush=True)
        if worst < 0.03 and loop > 0:
            break
    write_fans(case, state)
    if a.np > 1:
        foam(case, 'reconstructPar', '-latestTime')
    zones = ['gpuFins', 'cpuFins', 'psuIn', 'ram', 'boardAir'] + list(state['fans'])
    res = {'fans': {z: {k: s[k] for k in ('fan', 'rpm', 'Q_m3h', 'dp_Pa', 'q0_m3h', 'p0_Pa') if k in s} for z, s in state['fans'].items()},
           'zone_T_C': {z: (zone_avg(case, z) or {}).get('T') for z in zones},
           'vents_m3h': {}, 'history': history}
    info = json.loads((case / 'caseInfo.json').read_text())
    for v in info['vents']:
        q = vent_flow(case, v)
        res['vents_m3h'][v] = None if q is None else round(q * 3600, 1)
    (case / 'results.json').write_text(json.dumps(res, indent=2))
    print(json.dumps({k: res[k] for k in ('fans', 'zone_T_C', 'vents_m3h')}, indent=1))


if __name__ == '__main__':
    main()
