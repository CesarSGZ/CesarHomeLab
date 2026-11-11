"""Terra thermal bench: run one standard session and log everything at 1 Hz.

Usage:
  python run_session.py --id S01 --config BASE [--ambient 26.5] [--dry]

Standard session (71 min): 5 idle | 12 GPU | 10 cool | 12 CPU | 10 cool |
12 combined (CPU first, GPU joins after 3 min) | 10 cool.
--dry compresses it to ~5 min to check the pipeline.

Outputs go to Desktop/Claude/Datos/Terra/sesiones/<id>/:
  gpu.csv (nvidia-smi), hwinfo.csv (CPU/board temps, power, fans; if HWiNFO shared
  memory is on), markers.csv (real load start/end), session.json (plan + metadata).
"""
import argparse
import csv
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'sesiones'
MATLAB = r'C:\Program Files\MATLAB\R2026a\bin\matlab.exe'
LIMITS = {'cpu': 95.0, 'gpu': 88.0}

STANDARD = [  # (phase, start_s, end_s, loads)
    ('idle', 0, 300, []),
    ('gpu', 300, 1020, ['gpu']),
    ('cool_gpu', 1020, 1620, []),
    ('cpu', 1620, 2340, ['cpu']),
    ('cool_cpu', 2340, 2940, []),
    ('combined', 2940, 3660, ['cpu', 'gpu@180']),
    ('cool_combined', 3660, 4260, []),
]
DRY = [
    ('idle', 0, 20, []),
    ('gpu', 20, 80, ['gpu']),
    ('cool_gpu', 80, 110, []),
    ('cpu', 110, 170, ['cpu']),
    ('cool_cpu', 170, 200, []),
    ('combined', 200, 260, ['cpu', 'gpu@20']),
    ('cool_combined', 260, 290, []),
]
GPU_FIELDS = 'timestamp,temperature.gpu,power.draw,fan.speed,clocks.sm,utilization.gpu,pstate,clocks_event_reasons.active'


def log(msg):
    print(f'[{datetime.now():%H:%M:%S}] {msg}', flush=True)


def start_matlab(kind, start_epoch, duration, markers):
    cmd = f"addpath('{HERE.as_posix()}'); load_worker('{kind}', {start_epoch:.3f}, {duration:.1f}, '{markers.as_posix()}')"
    args = [MATLAB, '-batch', cmd]
    if kind == 'gpu':
        args.insert(1, '-singleCompThread')
    return subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                            creationflags=subprocess.CREATE_NO_WINDOW)


def hwinfo_reader():
    sys.path.insert(0, str(HERE))
    try:
        import hwinfo_sm
        hwinfo_sm.read_all()
        return hwinfo_sm
    except Exception as exc:  # noqa: BLE001 - report and continue GPU-only
        log(f'HWiNFO not available ({exc}); CPU temperatures will NOT be logged')
        return None


def cpu_temp(rows):
    for row in rows:
        if row['type'] == 'temp' and row['label'].startswith('CPU (Tctl/Tdie)'):
            return row['value']
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--id', required=True)
    ap.add_argument('--config', required=True)
    ap.add_argument('--ambient', type=float)
    ap.add_argument('--notes', default='')
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()

    plan = DRY if a.dry else STANDARD
    out = DATA / a.id
    out.mkdir(parents=True, exist_ok=False)
    markers = out / 'markers.csv'
    markers.write_text('kind,start_epoch,end_epoch,iterations\n')
    hw = hwinfo_reader()

    lead = 45 if not a.dry else 30  # MATLAB start-up margin before t0
    t0 = time.time() + lead
    meta = {'id': a.id, 'config': a.config, 'ambient_C': a.ambient, 'ambient_source': 'user' if a.ambient else 'pending',
            'notes': a.notes, 'dry_run': a.dry, 't0_epoch': t0,
            't0_local': datetime.fromtimestamp(t0).isoformat(timespec='seconds'),
            'plan': [{'phase': p, 'start_s': s, 'end_s': e, 'loads': l} for p, s, e, l in plan],
            'hwinfo': hw is not None, 'limits_C': LIMITS, 'aborted': None}
    (out / 'session.json').write_text(json.dumps(meta, indent=2))

    gpu_log = subprocess.Popen(['nvidia-smi', f'--query-gpu={GPU_FIELDS}', '--format=csv,nounits', '-lms', '1000',
                                '-f', str(out / 'gpu.csv')], creationflags=subprocess.CREATE_NO_WINDOW)

    # Schedule every load: launch MATLAB `lead` seconds before its phase starts.
    pending = []
    for phase, s, e, loads in plan:
        for load in loads:
            kind, _, offset = load.partition('@')
            begin = s + float(offset or 0)
            pending.append({'kind': kind, 'phase': phase, 'start': t0 + begin, 'duration': e - begin})
    pending.sort(key=lambda item: item['start'])
    running = []

    hw_file = open(out / 'hwinfo.csv', 'w', newline='', encoding='utf8') if hw else None
    hw_csv = csv.writer(hw_file) if hw_file else None
    if hw_csv:
        hw_csv.writerow(['epoch', 'sensor', 'label', 'type', 'unit', 'value'])

    end = t0 + plan[-1][2]
    log(f'session {a.id} ({a.config}) starts at {meta["t0_local"]}, ends ~{datetime.fromtimestamp(end):%H:%M}')
    current = None
    try:
        while time.time() < end:
            now = time.time()
            while pending and pending[0]['start'] - lead <= now:
                job = pending.pop(0)
                running.append(start_matlab(job['kind'], job['start'], job['duration'], markers))
                log(f"launched {job['kind']} load for phase {job['phase']}")
            phase = next((p for p, s, e, _ in plan if t0 + s <= now < t0 + e), None)
            if phase != current and phase:
                log(f'phase -> {phase}')
                current = phase
            if hw:
                try:
                    _, rows = hw.read_all()
                    for row in rows:
                        if row['type'] in ('temp', 'fan', 'power', 'usage'):
                            hw_csv.writerow([f'{now:.3f}', row['sensor'], row['label'], row['type'], row['unit'], f"{row['value']:.3f}"])
                    t = cpu_temp(rows)
                    if t is not None and t >= LIMITS['cpu']:
                        raise RuntimeError(f'CPU {t:.1f} C >= limit')
                except RuntimeError:
                    raise
                except Exception as exc:  # noqa: BLE001
                    log(f'HWiNFO read failed: {exc}')
            gpu_t = last_gpu_temp(out / 'gpu.csv')
            if gpu_t is not None and gpu_t >= LIMITS['gpu']:
                raise RuntimeError(f'GPU {gpu_t:.0f} C >= limit')
            time.sleep(max(0.0, 1.0 - (time.time() - now)))
    except (RuntimeError, KeyboardInterrupt) as exc:
        meta['aborted'] = str(exc)
        log(f'ABORT: {exc}')
    finally:
        for proc in running:
            if proc.poll() is None:
                proc.kill()
        gpu_log.terminate()
        if hw_file:
            hw_file.close()
        meta['finished_local'] = datetime.now().isoformat(timespec='seconds')
        (out / 'session.json').write_text(json.dumps(meta, indent=2))
    log(f'done -> {out}')


def last_gpu_temp(path):
    try:
        with open(path, 'rb') as fh:
            fh.seek(0, 2)
            fh.seek(max(0, fh.tell() - 400))
            line = fh.read().decode('utf8', 'ignore').strip().splitlines()[-1]
        return float(line.split(',')[1])
    except Exception:  # noqa: BLE001
        return None


if __name__ == '__main__':
    main()
