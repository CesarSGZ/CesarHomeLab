// Libreta del robot IBKR paper (qué estrategia es cada acción, fechas de entrada, ventas cerradas...).
// Vive en D1 porque en GitHub Actions cada ejecución empieza de cero.
//   node scripts/ibkr-paper-libro.mjs leer <fichero>      escribe la libreta guardada (o {} si no hay)
//   node scripts/ibkr-paper-libro.mjs guardar <fichero>   guarda la libreta del fichero
//   LIBRO='{...}' node scripts/ibkr-paper-libro.mjs importar   guarda la libreta recibida (alta inicial)
import {readFileSync, writeFileSync} from 'node:fs';
import {cloudDatabase} from './cloud-db.mjs';

export function validarLibro(texto) {
  const l = JSON.parse(texto);
  if (!l || typeof l !== 'object' || Array.isArray(l)) throw new Error('libro_invalido');
  for (const k of ['asignacion', 'realizado', 'entradas', 'pesos', 'nombres'])
    if (l[k] !== undefined && (typeof l[k] !== 'object' || Array.isArray(l[k]))) throw new Error('libro_invalido');
  if (l.cerradas !== undefined && !Array.isArray(l.cerradas)) throw new Error('libro_invalido');
  if (l.capitalInicial !== undefined && !(typeof l.capitalInicial === 'number' && l.capitalInicial > 0)) throw new Error('libro_invalido');
  return JSON.stringify(l);
}

export async function leer(db) {
  const row = await db.prepare("SELECT payload,updated_at FROM personal_datasets WHERE name='ibkr-paper-libro'").first();
  return row ? row.payload : '{}';
}

export async function guardar(db, texto) {
  await db.prepare("INSERT INTO personal_datasets(name,payload,updated_at) VALUES('ibkr-paper-libro',?,?) ON CONFLICT(name) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at")
    .bind(validarLibro(texto), new Date().toISOString()).run();
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/ibkr-paper-libro.mjs')) {
  const [accion, fichero] = process.argv.slice(2);
  const db = cloudDatabase();
  if (accion === 'leer') { writeFileSync(fichero, await leer(db)); console.log('Libreta leída'); }
  else if (accion === 'guardar') { await guardar(db, readFileSync(fichero, 'utf8')); console.log('Libreta guardada'); }
  else if (accion === 'importar') { await guardar(db, process.env.LIBRO || ''); console.log('Libreta importada'); }
  else { console.error('Uso: leer|guardar <fichero> | importar'); process.exit(2); }
}
