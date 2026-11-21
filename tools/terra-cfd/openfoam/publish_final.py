"""Publica el modelo final en la web: story.final_model, story.whatif y las entradas nuevas de model_lineage.

Uso:  python publish_final.py [--dry]

Lee lo que ya está calculado (no simula nada):
- campana-ext-2.5mm/compare.json      validación del CFD en régimen (S07 y, a ciegas, S05 y S06)
- fases-2.5mm/fases.json               cada carga por separado (solo gráfica / solo procesador) en las cuatro pruebas
- Datos/Terra/modelo/dinamico.json     modelo dinámico con el aire del CFD, trazas de 71 min (thermal-bench/dynfit.py --json)
- escenarios-2.5mm/whatif.json         ¿y si…? en bucle cerrado
Los textos de conclusión van en TEXT (se escriben a mano después de mirar los números).
"""
import argparse
import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
SUMMARY = REPO / 'control' / 'data' / 'terra-thermal-summary.json'
CFD = Path(os.environ['USERPROFILE']) / 'Desktop' / 'Claude' / 'Datos' / 'Terra' / 'cfd-casos'
sys.path.insert(0, str(REPO / 'tools' / 'thermal-bench'))

PHASE_ES = {'gpu': 'solo gráfica', 'cpu': 'solo procesador'}
PHASE_EN = {'gpu': 'GPU only', 'cpu': 'CPU only'}
SESSION_ES = {'S04': 'S04 sin canales', 'S05': 'S05 sin paneles', 'S06': 'S06 canal del procesador', 'S07': 'S07 los dos canales'}
SESSION_EN = {'S04': 'S04 no ducts', 'S05': 'S05 panels off', 'S06': 'S06 CPU duct', 'S07': 'S07 both ducts'}
SHORT_ES = {'S04': 'S04 · sin canales', 'S05': 'S05 · sin paneles', 'S06': 'S06 · canal CPU', 'S07': 'S07 · dos canales'}
SHORT_EN = {'S04': 'S04 · no ducts', 'S05': 'S05 · panels off', 'S06': 'S06 · CPU duct', 'S07': 'S07 · both ducts'}
GROUPS = [{'id': 'dir', 'es': 'Sentido', 'en': 'Direction'}, {'id': 'speed', 'es': 'Velocidad', 'en': 'Speed'},
          {'id': 'cpu', 'es': 'Procesador', 'en': 'CPU'}, {'id': 'gpu', 'es': 'Gráfica', 'en': 'GPU'}]
TEXT = json.loads((HERE / 'final_text.json').read_text(encoding='utf-8')) if (HERE / 'final_text.json').exists() else {}


def rms(v):
    return (sum(x * x for x in v) / len(v)) ** 0.5 if v else None


def verdict(r):
    """Regla fijada antes de mirar: merece la pena si gana ≥ 1 °C en gráfica o procesador (o baja ≥ 50 rpm la gráfica
    sin calentarla) y ninguna pieza empeora más de 1 °C; peor si algo empeora más de 1 °C sin ganancia así."""
    gains = r['d_gpu'] <= -1 or r['d_cpu'] <= -1 or (r['d_gpu_rpm'] <= -50 and r['d_gpu'] <= 0.2)
    worse = max(r['d_gpu'], r['d_cpu'], r['d_vrm'], r['d_ram'], r['d_board']) > 1
    return 'yes' if gains and not worse else 'no' if worse and not gains else 'meh'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    d = json.loads(SUMMARY.read_text(encoding='utf-8'))
    s = d['story']
    reg = json.loads((CFD.parent / 'modelo' / 'regimen.json').read_text(encoding='utf-8'))
    dyn_path = CFD.parent / 'modelo' / 'dinamico.json'
    dyn = json.loads(dyn_path.read_text(encoding='utf-8')) if dyn_path.exists() else None
    wi_path = CFD / 'escenarios-2.5mm' / 'whatif.json'
    wi = json.loads(wi_path.read_text(encoding='utf-8')) if wi_path.exists() else None

    # ---- cada carga por separado (las 12 fases: S04 calibra, el resto a ciegas) ----
    PH_ES = {'gpu': 'solo gráfica', 'cpu': 'solo procesador', 'comb': 'las dos'}
    PH_EN = {'gpu': 'GPU only', 'cpu': 'CPU only', 'comb': 'both'}
    rows = []
    for name in ('S04_gpu', 'S04_cpu', 'S04_comb', 'S07_gpu', 'S07_cpu', 'S07_comb', 'S06_gpu', 'S06_cpu', 'S06_comb',
                 'S05_gpu', 'S05_cpu', 'S05_comb'):
        c = reg['cases'][name]
        sid, ph = name.split('_')
        rows.append({'case': name, 'role': c['role'], 'es': f'{SESSION_ES[sid]} · {PH_ES[ph]}', 'en': f'{SESSION_EN[sid]} · {PH_EN[ph]}',
                     'gpu_W': c['P_GPU'], 'cpu_W': c['P_CPU'], 'rows': c['rows'], 'rms_C': c['rms_C']})
    coupling = {'rows': rows, 'rms_C': reg['blind_rms_C'], 'note_es': TEXT.get('coupling_note_es', ''), 'note_en': TEXT.get('coupling_note_en', '')}

    # ---- modelos ----
    def srms(sid):
        e = [q['err'] for x in ('gpu', 'cpu', 'comb') for q in reg['cases'][f'{sid}_{x}']['rows']]
        return round((sum(v * v for v in e) / len(e)) ** 0.5, 2)
    cfd_errors = [{'es': 'S04 · calibración (3 fases)', 'en': 'S04 · calibration (3 phases)', 'value_C': srms('S04')},
                  {'es': 'S07 · dos canales (a ciegas)', 'en': 'S07 · both ducts (blind)', 'value_C': srms('S07')},
                  {'es': 'S06 · canal del procesador (a ciegas)', 'en': 'S06 · CPU duct (blind)', 'value_C': srms('S06')},
                  {'es': 'S05 · sin paneles (a ciegas)', 'en': 'S05 · panels off (blind)', 'value_C': srms('S05')}]
    models = [{'id': 'MDL-CFD-STEADY-03', 'tone': 'ok', 'name_es': 'CFD del aire + constantes físicas por pieza', 'name_en': 'Air CFD + physical constants per part',
               'verdict_es': 'Aceptado', 'verdict_en': 'Accepted',
               'what_es': TEXT.get('cfd_what_es', ''), 'what_en': TEXT.get('cfd_what_en', ''), 'errors': cfd_errors}]
    if dyn:
        dy = dyn['sessions']
        derr = []
        for sid in ('S07', 'S05', 'S06', 'S04'):
            if sid in dy:
                role = 'ajuste' if dy[sid]['role'] == 'ajuste' else 'a ciegas'
                derr.append({'es': f'{sid} gráfica ({role})', 'en': f"{sid} GPU ({'fit' if role == 'ajuste' else 'blind'})", 'value_C': dy[sid]['gpu_rmse']})
                derr.append({'es': f'{sid} procesador ({role})', 'en': f"{sid} CPU ({'fit' if role == 'ajuste' else 'blind'})", 'value_C': dy[sid]['cpu_rmse']})
        models.append({'id': 'MDL-SYS-DYN-03', 'tone': TEXT.get('dyn_tone', 'ok'), 'name_es': 'Modelo dinámico gráfica + procesador',
                       'name_en': 'Dynamic GPU + CPU model', 'verdict_es': TEXT.get('dyn_verdict_es', 'Aceptado'),
                       'verdict_en': TEXT.get('dyn_verdict_en', 'Accepted'), 'what_es': TEXT.get('dyn_what_es', ''),
                       'what_en': TEXT.get('dyn_what_en', ''), 'errors': derr})

    final = {'updated': TEXT.get('updated', ''), 'summary_es': TEXT.get('summary_es', ''), 'summary_en': TEXT.get('summary_en', ''),
             'kpis': TEXT.get('kpis', []), 'models': models, 'coupling': coupling, 'budget': TEXT.get('budget', [])}
    if dyn:
        order = [x for x in ('S04', 'S06', 'S05', 'S07') if x in dyn['sessions']]
        final['dynamic'] = {'note_es': TEXT.get('dyn_note_es', ''), 'note_en': TEXT.get('dyn_note_en', ''),
                            'sessions': [{'id': sid, 'es': SHORT_ES[sid], 'en': SHORT_EN[sid],
                                          'role': 'fit' if dyn['sessions'][sid]['role'] == 'ajuste' else 'blind',
                                          'gpu_rmse': dyn['sessions'][sid]['gpu_rmse'], 'cpu_rmse': dyn['sessions'][sid]['cpu_rmse'],
                                          'trace': {k: dyn['sessions'][sid]['trace'][k] for k in ('t_s', 'phase', 'gpu_meas', 'gpu_pred', 'cpu_meas', 'cpu_pred')}}
                                         for sid in order]}
    s['final_model'] = final

    # ---- ¿y si…? ----
    if wi:
        notes = TEXT.get('whatif_notes', {})
        for r in wi['rows']:
            if r['id'] != 's07':
                r['verdict'] = verdict(r)
                r['score'] = round((r['d_gpu'] + r['d_cpu'] + r['d_vrm'] + r['d_ram']) / 4 + r['d_gpu_rpm'] / 100, 2)
            r.update({k: v for k, v in notes.get(r['id'], {}).items()})
            r.pop('fans_m3h', None)
        s['whatif'] = {'cell_mm': wi['cell_mm'], 'groups': GROUPS, 'rows': wi['rows'],
                       'recommendation_es': TEXT.get('reco_es', ''), 'recommendation_en': TEXT.get('reco_en', ''),
                       'note_es': TEXT.get('whatif_note_es', ''), 'note_en': TEXT.get('whatif_note_en', '')}

    # ---- model_lineage ----
    lineage = [m for m in d['model_lineage'] if m['id'] not in ('MDL-CFD-STEADY-03', 'MDL-SYS-DYN-03')]
    new = [{
        'id': 'MDL-CFD-STEADY-03', 'name': 'OpenFOAM air CFD + two thermal constants per part',
        'family': '3-D RANS (k-ω SST) with buoyancy and outside air, 2.5 mm mesh, 1.42 M cells',
        'inputs': ['measured watts', 'measured fan rpm', 'room temperature'],
        'states': 'steady state', 'outputs': ['GPU', 'CPU core average', 'VRM', 'chipset', 'board sensor', 'RAM'],
        'calibration_source': 'S04, its three phases (two constants per part); CPU-duct constants cross-checked S06 ↔ S07',
        'validation_source': 'S05, S06 and S07, each with its three phases (GPU only, CPU only, both): 51 blind comparisons',
        'calibration_fit_pct': None, 'calibration_rmse_C': None,
        'validation_fit_pct': None, 'validation_rmse_C': reg['blind_rms_C'],
        'validation_plot': None, 'verification': TEXT.get('cfd_verification', ''),
        'decision': 'ACCEPTED FOR PREDICTION', 'authority': TEXT.get('cfd_authority', ''),
        'score_rows': [{'label_en': e['en'], 'rmse_C': e['value_C'], 'fit_pct': None} for e in cfd_errors[1:]],
        'plain_es': {'title': 'CFD del aire', 'verdict': 'Aceptado', 'tone': 'ok', 'why': TEXT.get('cfd_why_es', '')},
        'plain_en': {'title': 'Air CFD', 'verdict': 'Trusted to predict', 'tone': 'ok', 'why': TEXT.get('cfd_why_en', '')}}]
    if dyn:
        dy = dyn['sessions']
        blind_ids = [x for x in ('S07', 'S05', 'S06') if x in dy and dy[x]['role'] != 'ajuste']
        new.append({
            'id': 'MDL-SYS-DYN-03', 'name': 'Coupled GPU + CPU thermal network with CFD air',
            'family': 'grey-box RC network (4 nodes + 2 air lags), air coupling from the CFD',
            'inputs': ['GPU watts', 'CPU package and SoC watts', 'GPU and CPU fan rpm', 'room temperature', 'CFD air coefficients per layout'],
            'states': 'GPU die, GPU fins, CPU cores, CPU heatsink, GPU intake air, CPU intake air',
            'outputs': ['GPU temperature', 'CPU core average'],
            'calibration_source': ', '.join(dyn['fit']) + ' (71-min sessions)',
            'validation_source': ', '.join(blind_ids) + ' full 71-min traces, never used to fit',
            'calibration_fit_pct': None, 'calibration_rmse_C': None,
            'validation_fit_pct': [dy[x]['cpu_fit_pct'] for x in blind_ids[:1]] + [dy[x]['gpu_fit_pct'] for x in blind_ids[:1]],
            'validation_rmse_C': [max(dy[x]['cpu_rmse'] for x in blind_ids), max(dy[x]['gpu_rmse'] for x in blind_ids)],
            'validation_plot': None, 'verification': TEXT.get('dyn_verification', ''),
            'decision': TEXT.get('dyn_decision', 'ACCEPTED FOR PREDICTION'), 'authority': TEXT.get('dyn_authority', ''),
            'score_rows': [row for x in blind_ids for row in (
                {'label_en': f'{x} GPU', 'rmse_C': dy[x]['gpu_rmse'], 'fit_pct': dy[x]['gpu_fit_pct']},
                {'label_en': f'{x} CPU', 'rmse_C': dy[x]['cpu_rmse'], 'fit_pct': dy[x]['cpu_fit_pct']})],
            'plain_es': {'title': 'Modelo dinámico de los dos', 'verdict': TEXT.get('dyn_verdict_es', 'Aceptado'), 'tone': TEXT.get('dyn_tone', 'ok'), 'why': TEXT.get('dyn_why_es', '')},
            'plain_en': {'title': 'GPU + CPU over time', 'verdict': TEXT.get('dyn_verdict_en', 'Trusted to predict'), 'tone': TEXT.get('dyn_tone', 'ok'), 'why': TEXT.get('dyn_why_en', '')}})
    for m in lineage:      # los de agosto quedan como historia
        old = TEXT.get('old_models', {}).get(m['id'])
        if old:
            m.update(old)
    d['model_lineage'] = new + lineage
    for k, v in TEXT.get('story_patch', {}).items():
        s[k] = v
    if a.dry:
        print(json.dumps({'final_model': {k: v for k, v in final.items() if k != 'dynamic'}, 'whatif': s.get('whatif')}, ensure_ascii=False, indent=1)[:6000])
        return
    SUMMARY.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ok', [m['id'] for m in d['model_lineage']])


if __name__ == '__main__':
    main()
