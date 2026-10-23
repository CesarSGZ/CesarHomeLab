"""Private local handoff consumed by the daily Google Sheets synchronization."""
import csv
import io
import json

from .config import DATA_DIR

HEADERS = ['ID', 'Fecha', 'Comunidad', 'Título para adaptar', 'Cuerpo', 'Instrucciones',
           'Revisión del Director', 'Estado', 'URL publicada', 'Fecha publicación', 'Notas de César', 'Preparado por']


def rows_for(drafts):
    return [[d['id'], d['day'], 'r/' + d['subreddit'], d['title'], d.get('body', ''),
             '\n'.join(d['steps']), d['review'], 'Pendiente' if d['approved'] else 'Revisar',
             '', '', '', 'Reddit Planner + Director'] for d in drafts]


def export(rt):
    drafts = rt.agents['karma-farmer'].drafts()
    target = DATA_DIR / 'deliveries'
    target.mkdir(parents=True, exist_ok=True)
    buffer = io.StringIO(newline='')
    csv.writer(buffer).writerows([HEADERS, *rows_for(drafts)])
    outputs = {'reddit-drafts.csv': buffer.getvalue(),
               'reddit-drafts.json': json.dumps(drafts, ensure_ascii=False, indent=2)}
    for name, content in outputs.items():
        path = target / name
        temp = path.with_suffix(path.suffix + '.tmp')
        temp.write_text(content, encoding='utf-8-sig' if name.endswith('.csv') else 'utf-8')
        temp.replace(path)
    return drafts

