// Training Lab: conecta Mission Control con las pestañas Rutina, Alternativas y Registro de este Sheet.
// Las pestañas antiguas no se modifican. La clave vive en las propiedades del script, no en este código.

var COLS_RUTINA = ['Día', 'Nombre', 'Orden', 'Ejercicio', 'Músculo', 'Series', 'Reps', 'Referencia', 'Salto kg'];
var COLS_ALTERNATIVAS = ['Músculo', 'Ejercicio', 'Referencia'];
var COLS_REGISTRO = ['Fecha', 'Día', 'Ejercicio', 'Músculo', 'Serie', 'Reps', 'Kg', 'RPE', 'Nota', 'Origen', 'ID'];
var COL_ID = COLS_REGISTRO.indexOf('ID');

function instalar() {
  var libro = SpreadsheetApp.getActive();
  [['Rutina', COLS_RUTINA], ['Alternativas', COLS_ALTERNATIVAS], ['Registro', COLS_REGISTRO]].forEach(function (t) {
    if (libro.getSheetByName(t[0])) return;
    var hoja = libro.insertSheet(t[0]);
    hoja.getRange(1, 1, 1, t[1].length).setValues([t[1]]).setFontWeight('bold');
    hoja.setFrozenRows(1);
  });
  clave_();
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

function doGet(e) {
  if (!e || !e.parameter || e.parameter.k !== clave_()) return responder_({ error: 'clave' });
  return responder_(leerTodo_());
}

function doPost(e) {
  var cuerpo;
  try {
    cuerpo = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder_({ error: 'formato' });
  }
  if (cuerpo.k !== clave_()) return responder_({ error: 'clave' });
  var cerrojo = LockService.getScriptLock();
  cerrojo.waitLock(20000);
  try {
    if (cuerpo.rutina) reemplazar_('Rutina', COLS_RUTINA, cuerpo.rutina);
    if (cuerpo.alternativas) reemplazar_('Alternativas', COLS_ALTERNATIVAS, cuerpo.alternativas);
    aplicar_(cuerpo.ops || []);
    return responder_({ ok: true });
  } finally {
    cerrojo.releaseLock();
  }
}

function reemplazar_(nombre, columnas, filas) {
  var hoja = SpreadsheetApp.getActive().getSheetByName(nombre);
  if (hoja.getLastRow() > 1) hoja.getRange(2, 1, hoja.getLastRow() - 1, columnas.length).clearContent();
  if (filas.length) hoja.getRange(2, 1, filas.length, columnas.length).setValues(filas);
}

// Un ejercicio creado desde la app queda como alternativa; si el nombre ya existe no se duplica.
function anadirAlternativas_(altas) {
  var hoja = SpreadsheetApp.getActive().getSheetByName('Alternativas');
  var vistos = {};
  hoja.getDataRange().getValues().forEach(function (r) { vistos[r[1]] = true; });
  altas.forEach(function (a) {
    if (vistos[a.ejercicio]) return;
    vistos[a.ejercicio] = true;
    hoja.getRange(hoja.getLastRow() + 1, 1, 1, COLS_ALTERNATIVAS.length).setValues([[a.musculo || '', a.ejercicio, a.referencia || '']]);
  });
}

function fechaTexto_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v);
}

function leerTodo_() {
  var libro = SpreadsheetApp.getActive();
  var rutina = libro.getSheetByName('Rutina').getDataRange().getValues().slice(1)
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) {
      return { dia: +r[0], nombre: String(r[1]), orden: +r[2], ejercicio: String(r[3]), musculo: String(r[4]),
        series: +r[5] || 4, reps: +r[6] || 8, referencia: String(r[7]), salto: +r[8] || 2.5 };
    });
  var alternativas = libro.getSheetByName('Alternativas').getDataRange().getValues().slice(1)
    .filter(function (r) { return r[1] !== ''; })
    .map(function (r) { return { musculo: String(r[0]), ejercicio: String(r[1]), referencia: String(r[2]) }; });
  var filas = libro.getSheetByName('Registro').getDataRange().getValues().slice(1)
    .filter(function (r) { return r[COL_ID] !== ''; })
    .map(function (r) {
      r[0] = fechaTexto_(r[0]);
      return r;
    });
  return { rutina: rutina, alternativas: alternativas, filas: filas };
}

// Las operaciones llevan ID, así que reenviarlas tras un corte de red no duplica nada.
function aplicar_(ops) {
  var altas = ops.filter(function (op) { return op.tipo === 'alternativa'; });
  ops = ops.filter(function (op) { return op.tipo !== 'alternativa'; });
  if (altas.length) anadirAlternativas_(altas);
  if (!ops.length) return;
  var hoja = SpreadsheetApp.getActive().getSheetByName('Registro');
  var ultima = hoja.getLastRow();
  var posiciones = {};
  if (ultima > 1) {
    hoja.getRange(2, COL_ID + 1, ultima - 1, 1).getValues().forEach(function (v, i) { posiciones[v[0]] = i + 2; });
  }
  var nuevas = [], borrar = [];
  ops.forEach(function (op) {
    if (op.tipo === 'borrar') {
      if (posiciones[op.id]) borrar.push(posiciones[op.id]);
      return;
    }
    var f = op.fila;
    var valores = [f.fecha, f.dia, f.ejercicio, f.musculo, f.serie, f.reps === null ? '' : f.reps, f.kg === null ? '' : f.kg,
      f.rpe === null || f.rpe === undefined ? '' : f.rpe, f.nota || '', f.origen || 'app', f.id];
    if (posiciones[f.id] > 0) {
      hoja.getRange(posiciones[f.id], 1, 1, valores.length).setValues([valores]);
    } else if (!posiciones[f.id]) {
      nuevas.push(valores);
      posiciones[f.id] = -1;
    }
  });
  if (nuevas.length) {
    var desde = hoja.getLastRow() + 1;
    hoja.getRange(desde, 1, nuevas.length, 1).setNumberFormat('@');
    hoja.getRange(desde, 1, nuevas.length, COLS_REGISTRO.length).setValues(nuevas);
  }
  borrar.sort(function (a, b) { return b - a; }).forEach(function (fila) { hoja.deleteRow(fila); });
}
