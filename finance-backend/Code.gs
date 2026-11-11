// Gastos: conecta Mission Control con las pestañas Movimientos, Recurrentes y Categorías de este Sheet.
// La clave vive en las propiedades del script, no en este código. Se instala una vez con instalar().

// Si el script no está dentro del Sheet (proyecto suelto de script.google.com), pon aquí el ID del Sheet.
var LIBRO_ID = '';
function libro_() { return LIBRO_ID ? SpreadsheetApp.openById(LIBRO_ID) : SpreadsheetApp.getActive(); }

var COLS_MOVIMIENTOS = ['Fecha', 'Tipo', 'Importe', 'Categoría', 'Concepto', 'Cuenta', 'Origen', 'ID'];
var COLS_RECURRENTES = ['ID', 'Tipo', 'Importe', 'Categoría', 'Concepto', 'Frecuencia', 'Día', 'Mes', 'Desde', 'Hasta', 'Activo'];
var COLS_CATEGORIAS = ['Tipo', 'Categoría', 'Presupuesto mensual'];
var TABLAS = { Movimientos: COLS_MOVIMIENTOS, Recurrentes: COLS_RECURRENTES, Categorias: COLS_CATEGORIAS };
var HOJA = { Movimientos: 'Movimientos', Recurrentes: 'Recurrentes', Categorias: 'Categorías' };
var CATEGORIAS_INICIALES = [
  ['Gasto', 'Casa', ''], ['Gasto', 'Comida', ''], ['Gasto', 'Transporte', ''], ['Gasto', 'Ocio', ''], ['Gasto', 'Salud', ''],
  ['Gasto', 'Suscripciones', ''], ['Gasto', 'Ropa', ''], ['Gasto', 'Viajes', ''], ['Gasto', 'Gimnasio', ''], ['Gasto', 'Otros', ''],
  ['Ingreso', 'Nómina', ''], ['Ingreso', 'Extra', ''], ['Ingreso', 'Inversiones', '']
];

function instalar() {
  var libro = libro_();
  Object.keys(TABLAS).forEach(function (t) {
    if (libro.getSheetByName(HOJA[t])) return;
    var hoja = libro.insertSheet(HOJA[t]);
    hoja.getRange(1, 1, 1, TABLAS[t].length).setValues([TABLAS[t]]).setFontWeight('bold');
    hoja.setFrozenRows(1);
    if (t === 'Categorias') hoja.getRange(2, 1, CATEGORIAS_INICIALES.length, 3).setValues(CATEGORIAS_INICIALES);
  });
  Logger.log('Listo. Añade esto a la URL de la implementación que acaba en /exec: #' + clave_());
}

function clave_() {
  var props = PropertiesService.getScriptProperties();
  var clave = props.getProperty('CLAVE');
  if (!clave) {
    clave = Utilities.getUuid().replace(/-/g, '');
    props.setProperty('CLAVE', clave);
  }
  return clave;
}

function responder_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function leer_(t) {
  var hoja = libro_().getSheetByName(HOJA[t]);
  if (!hoja || hoja.getLastRow() < 2) return [];
  return hoja.getRange(2, 1, hoja.getLastRow() - 1, TABLAS[t].length).getValues().map(function (r) {
    return r.map(function (v) { return v instanceof Date ? Utilities.formatDate(v, 'Europe/Madrid', 'yyyy-MM-dd') : v; });
  }).filter(function (r) { return r.join('') !== ''; });
}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.k !== clave_()) return responder_({ error: 'clave' });
  return responder_({ movimientos: leer_('Movimientos'), recurrentes: leer_('Recurrentes'), categorias: leer_('Categorias') });
}

function doPost(e) {
  var cuerpo;
  try { cuerpo = JSON.parse(e.postData.contents); } catch (err) { return responder_({ error: 'formato' }); }
  if (cuerpo.k !== clave_()) return responder_({ error: 'clave' });
  var cerrojo = LockService.getScriptLock();
  cerrojo.waitLock(20000);
  try {
    if (cuerpo.categorias) reemplazar_('Categorias', cuerpo.categorias);
    (cuerpo.ops || []).forEach(aplicar_);
    return responder_({ ok: true });
  } finally {
    cerrojo.releaseLock();
  }
}

function reemplazar_(t, filas) {
  var hoja = libro_().getSheetByName(HOJA[t]), n = TABLAS[t].length;
  if (hoja.getLastRow() > 1) hoja.getRange(2, 1, hoja.getLastRow() - 1, n).clearContent();
  if (filas.length) hoja.getRange(2, 1, filas.length, n).setValues(filas);
}

// Guarda por ID: si ya existe se sobrescribe, así una operación repetida (o un cargo recurrente) nunca se duplica.
function aplicar_(op) {
  var t = op.tabla === 'Recurrentes' ? 'Recurrentes' : 'Movimientos';
  var hoja = libro_().getSheetByName(HOJA[t]), cols = TABLAS[t];
  var colId = cols.indexOf('ID'), datos = hoja.getDataRange().getValues(), fila = -1;
  var id = op.tipo === 'borrar' ? op.id : op.fila[colId];
  for (var i = 1; i < datos.length; i++) if (String(datos[i][colId]) === String(id)) { fila = i + 1; break; }
  if (op.tipo === 'borrar') { if (fila > 0) hoja.deleteRow(fila); return; }
  var valores = cols.map(function (c, j) { return op.fila[j] === undefined || op.fila[j] === null ? '' : op.fila[j]; });
  if (fila > 0) hoja.getRange(fila, 1, 1, cols.length).setValues([valores]);
  else hoja.getRange(hoja.getLastRow() + 1, 1, 1, cols.length).setValues([valores]);
  if (t === 'Movimientos') hoja.getRange(fila > 0 ? fila : hoja.getLastRow(), 1).setNumberFormat('yyyy-mm-dd');
}
