export function parseCsv(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (ch === ',' && !quoted) { row.push(field); field = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function exerciseKey(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function parsePrescription(raw) {
  const text = String(raw || '').trim();
  if (/segundos|minutos|\bseg\b/i.test(text)) return null;
  const match = text.match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)(.*)$/i);
  if (!match || /^\s*[x×]/i.test(match[3])) return null; // Do not reinterpret 6x2x85 / unilateral quantities.
  return { reps: Number(match[1].replace(',', '.')), load: Number(match[2].replace(',', '.')) };
}

function inferredGroup(name) {
  const value = exerciseKey(name);
  if (/bicep|curl scott|ballesyan/.test(value)) return 'Bíceps';
  if (/tricep|french press|pjr/.test(value)) return 'Tríceps';
  if (/bench|chest|pecho|dumbbell press/.test(value)) return 'Pecho';
  if (/gemelo|calf/.test(value)) return 'Gemelos';
  if (/deadlift|leg curl/.test(value)) return 'Isquios / cadena posterior';
  if (/sentadilla|squat|hacka|leg extension|step down/.test(value)) return 'Cuádriceps';
  if (/pulldown|remo|\brow\b|dominada/.test(value)) return 'Espalda';
  if (/crunch|\babs\b|wood chopper|leg raise/.test(value)) return 'Abdominales';
  if (/face pull|hombro|lateral|delts|overhead|aperturas/.test(value)) return 'Hombros';
  if (/thrust|glute/.test(value)) return 'Glúteos';
  return 'Otros';
}

export function parseTrainingRows(rows) {
  const result = []; let day = '', inlineAlternatives = false, group = '', sideGroup = '', primaryMode = '', secondaryMode = '';
  const header = (rows.find(row => row.some(cell => /reps.*peso/i.test(String(cell)))) || []).map(String);
  const exerciseCol = header.findIndex(cell => /^ejercicio$/i.test(cell.trim()));
  const valueCol = header.findIndex(cell => /reps.*peso/i.test(cell));
  const oldMuscleCol = header.findIndex(cell => /^m[uú]sculo$/i.test(cell.trim()));
  const eCol = exerciseCol >= 0 ? exerciseCol : 2, vCol = valueCol >= 0 ? valueCol : 3;
  function add(row, rowIndex, kind, nameCol, loadCol, muscle, currentDay) {
    const name = String(row[nameCol] || '').trim();
    if (!name || /^(ejercicio|alternativas|-)$/i.test(name)) return;
    const raw = String(row[loadCol] || '').trim();
    result.push({ key: exerciseKey(name), name, day: currentDay || '', kind, group: muscle || inferredGroup(name), groupSource: muscle ? 'sheet' : 'exercise-name', sets: kind === 'main' ? Number(row[1]) || null : null, raw, prescription: parsePrescription(raw), cell: `${String.fromCharCode(65 + loadCol)}${rowIndex + 1}`, ...(inlineAlternatives ? { rawMode: primaryMode, secondaryRaw: String(row[5] || '').trim(), secondaryMode, secondaryCell: `F${rowIndex + 1}` } : {}) });
  }
  rows.forEach((row, i) => {
    const first = String(row[0] || '').trim();
    if (/^alternativas$/i.test(first)) { inlineAlternatives = true; group = ''; day = ''; return; }
    if (inlineAlternatives) {
      if (/^m[uú]sculo$/i.test(first)) { primaryMode = String(row[3] || ''); secondaryMode = String(row[5] || ''); return; }
      if (first) group = first;
      if (row[2]) add(row, i, 'alternative', 2, 3, group, '');
    } else {
      if (/^d[ií]a\s*\d/i.test(first)) day = first;
      else if (first && !/^d[ií]as$|^rico entreno$/i.test(first)) day = '';
      if (day && row[eCol] && Number(row[1]) > 0) add(row, i, 'main', eCol, vCol, oldMuscleCol >= 0 ? String(row[oldMuscleCol] || '') : '', day);
      // Earlier plans put their alternatives alongside the routine in F:I.
      if (header[5] && /alternativas/i.test(header[5]) && i > 0) {
        if (row[5]) sideGroup = String(row[5]);
        if (row[7]) add(row, i, 'alternative', 7, 8, sideGroup, '');
      }
    }
  });
  return result;
}

export function snapshotFromCsv(csv, metadata) {
  return { ...metadata, exercises: parseTrainingRows(parseCsv(csv)) };
}
