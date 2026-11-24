// Lists that Claude prepared for César. The page adds each one once (op "seed"): if he deletes it, it does not come back.
// Built from his relocation emails (SIRVA / Local Worldwide, Waheb Hayel) on 24 Nov 2026.
const t = (id, title, extra = {}) => ({ id: 'ing-' + id, title, ...extra });

export const SEEDS = [{
  id: 'ingolstadt-2026-11',
  lists: [{
    id: 'ingolstadt',
    name: '🇩🇪 Mudanza a Ingolstadt',
    kind: 'project',
    tasks: [
      // Piso
      t('needs', 'Enviar el Needs Assessment a Waheb', { section: 'Piso', done: true, completed: '2026-10-30T11:15:00Z', note: 'Enviado el 30/10. Resumen: Ingolstadt mejor que Manching, a ~30 min andando de las paradas del shuttle de Airbus (ZOB y Rathausplatz), amueblado, solo, hasta ~800 € cálidos con parking.' }),
      t('rwagner', 'Mandar a Waheb el piso de Richard-Wagner-Str. 16A + documentos', { section: 'Piso', important: true, due: '2026-11-26', note: '45 m², 2 habitaciones, amueblado, plaza de garaje. 950 € cálidos con parking (por encima de tu tope de 800). Fianza 2.100 €. El casero busca inquilino desde el 1/12/2026.\nBorrador listo en Gmail: «Paquete para el consultor de SIRVA + borrador para Waheb» (3/11). Antes de enviarlo: confirma que aceptas 950 € y pagar desde diciembre.\nkleinanzeigen.de/s-anzeige/vollmoeblierte-2-zimmer-dachgeschosswohnung/3538369304-203-7609', steps: [
        { id: 'ing-rw-1', title: 'Comprobar que el anuncio sigue publicado' },
        { id: 'ing-rw-2', title: 'Confirmar precio (950 €) y entrada el 1/12' },
        { id: 'ing-rw-3', title: 'Enviar el correo con los adjuntos' },
      ] }),
      t('docs', 'Reunir los documentos del alquiler', { section: 'Piso', note: 'Los pide el consultor para la solicitud. La SCHUFA no se puede tener aún (nunca has vivido en Alemania): el correo a Waheb ya lo explica.', steps: [
        { id: 'ing-d-1', title: 'Firmar y fechar la Mieterselbstauskunft (PDF en el correo del 3/11)' },
        { id: 'ing-d-2', title: 'Copia del pasaporte o DNI' },
        { id: 'ing-d-3', title: 'Carta de Airbus: puesto, inicio 01.01.2027 y salario (o el contrato alemán; Esma)' },
        { id: 'ing-d-4', title: 'Tus 3 últimas nóminas' },
        { id: 'ing-d-5', title: 'Opcional: carta del casero de Madrid (Mietschuldenfreiheit), solo si la piden' },
      ] }),
      t('looksee', 'Cerrar fechas del Look & See (3 días / 2 noches)', { section: 'Piso', note: 'Propuestas: 25–27 nov o 1–3 dic; también 10–11 dic. No puedes del 4 al 9 de diciembre ni desde el 24.' }),
      t('hours', 'Preguntar cuántas horas de visitas acompañadas incluye el «Home Search – 1 Day»', { section: 'Piso' }),
      t('briefing', 'Llamada de briefing con SIRVA', { section: 'Piso', note: 'Waheb tenía que proponer el día; tú dijiste que te vale casi cualquiera.' }),
      t('sebastian', 'Seguimiento de Sebastianstraße 14 (ImmoScout24)', { section: 'Piso', note: 'Tu favorito al principio. Escribiste a Doreen Müller (Conterra Bauträger) el 23/10 sin respuesta; lo dejaste en manos de SIRVA.' }),
      t('lease', 'Firmar el contrato de alquiler y pagar la fianza', { section: 'Piso' }),
      // Papeles en Alemania
      t('contract', 'Contrato alemán con Airbus firmado', { section: 'Papeles en Alemania', note: 'Empiezas el 1/1/2027; primer día de trabajo hacia el 7–8 de enero.' }),
      t('health', 'Elegir seguro médico alemán (Krankenkasse)', { section: 'Papeles en Alemania', due: '2026-12-15', note: 'Hace falta desde el primer día de contrato; RR. HH. de Airbus te lo pedirá para la nómina.' }),
      t('anmeldung', 'Anmeldung en el Bürgeramt de Ingolstadt', { section: 'Papeles en Alemania', due: '2027-01-15', note: 'Obligatorio en las 2 semanas siguientes a entrar en el piso. Lleva el pasaporte y la Wohnungsgeberbestätigung que firma el casero. Pide cita online cuanto antes.' }),
      t('bank', 'Abrir cuenta bancaria alemana', { section: 'Papeles en Alemania', note: 'Normalmente piden la Anmeldung. Para la nómina de enero vale también una cuenta española con IBAN si Airbus lo acepta.' }),
      t('taxid', 'Recibir la Steuer-ID por correo y pasársela a Airbus', { section: 'Papeles en Alemania', note: 'Llega sola unas semanas después de la Anmeldung.' }),
      t('rundfunk', 'Alta en el Rundfunkbeitrag', { section: 'Papeles en Alemania', note: 'Tasa de radiotelevisión por vivienda; suele llegar carta tras la Anmeldung.' }),
      t('consulado', 'Inscribirte en el Consulado de España en Múnich (registro de matrícula)', { section: 'Papeles en Alemania' }),
      t('haftpflicht', 'Seguro de responsabilidad civil (Haftpflichtversicherung)', { section: 'Papeles en Alemania', note: 'Muy habitual en Alemania y algunos caseros lo piden.' }),
      // Salida de Madrid y viaje
      t('madrid', 'Avisar al casero de Madrid y fijar el último mes', { section: 'Salida de Madrid' }),
      t('bajas', 'Dar de baja luz, internet y demás suministros de Madrid', { section: 'Salida de Madrid' }),
      t('mudanza', 'Decidir qué va en el coche y qué se envía', { section: 'Salida de Madrid', note: 'ImmoScout24 te ha mandado presupuestos de empresas de mudanza.' }),
      t('coche', 'Coche: seguro válido en Alemania y revisión antes del viaje', { section: 'Salida de Madrid', note: 'Si te quedas más de 6 meses, toca matricularlo en Alemania.' }),
      t('viaje', 'Viaje en coche Madrid → Ingolstadt', { section: 'Salida de Madrid', due: '2027-01-02' }),
      t('primerdia', 'Primer día en Airbus (Manching)', { section: 'Salida de Madrid', due: '2027-01-07' }),
    ],
  }],
}];
