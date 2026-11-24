# CesarHomeLab

Web pública, Mission Control (Training, Backtest Lab, Galaxy, ServerCesar) y sus APIs en Cloudflare Pages. Se publica al fusionar en main.

## Carpetas (regla de César para todas las sesiones)

Todo lo que Claude genere o use como entrada vive bajo la carpeta `Claude` del Escritorio de cada PC
(en el PC de César: `C:\Users\cesar\Desktop\Claude`). Este repo está en `Claude\Proyectos\`. Datos de entrada,
descargas, vídeos, documentos y pruebas van en `Claude\Datos`, `Claude\Videos`, `Claude\Documentos` o `Claude\Temporal`,
nunca en carpetas sueltas de `C:\`, del perfil, de `Documents`, de `.cache` o de `Downloads`. Regla completa: `~\.claude\CLAUDE.md`.

## Thermal Lab: la presentación se mantiene sola

La página del Thermal Lab (`/control/#thermal`) y su presentación para todo el mundo (botón «Ver la presentación»,
`control/thermal-deck.js`) se pintan desde `control/data/terra-thermal-summary.json`. Las cifras salen de las medidas;
el relato, de la sección `story`. Cada vez que cambie algo del Thermal Lab (pruebas, modelos, piezas, ideas, página):

1. Añade una línea a `story.timeline` con la fecha y qué se hizo, en lenguaje sencillo.
2. Cada prueba nueva de la campaña de canales va también como fila en `story.ab_tests.rows` (cifras de `tools/thermal-bench/analyze.py`); así sale en la gráfica de antes y después. La CPU se compara con `cpu_*_WpC` = 1 / `rth_core_C_per_W` (media de los núcleos), no con los vatios: a 87 °C los vatios dependen de en cuántos núcleos reparte Windows la carga. Cada fila lleva `lesson_es`/`lesson_en`, y `story.ideas_next` y `story.cfd_plan` se revisan con cada prueba.
   Revisa `story.next_steps` (siempre debe quedar uno en `next`), `story.phases`, `story.cfd_gate`, `story.conclusions` y `story.uses`.
3. Sube `story.updated` y `generated_at`. Una idea o modelo nuevo necesita su `plain_es`.
4. `node --test tests/thermal-story.test.mjs` comprueba que no falte nada.
5. El modelo 3D sale de `tools/terra-cfd/build_geometry.py` (no edites `geometry` a mano). Si cambias `control/thermal-viewer.js`, recompila `thermal-viewer.bundle.js` (ver `tools/terra-cfd/README.md`) y sube el `?v=` en `control/index.html`.

## Tareas: Claude puede leer y cambiar las listas de César

Tareas (`/control/#todo` y la app `/control/tareas/`) sustituye a Microsoft To Do, con el estilo de Mission Control.
Tres pestañas: Hoy (rutinas, lo que toca, próximos 14 días, proyectos), Listas (tareas, compra, ideas y proyectos:
checklists con secciones, como la mudanza a Ingolstadt) y Rutinas (cosas diarias con racha). Una sola barra añade
todo: una fecha al final la pone en el calendario y `#lista` la manda a esa lista. Los pasos se abren en la fila.
El modelo y todas las operaciones están en `control/todo-model.js` (`applyOps`); la página y la API usan el mismo.

Cuando César pida algo sobre sus tareas («añade…», «marca… como hecho», «crea una checklist para…»):

1. Necesitas su llave (empieza por `tareas_`). La crea él en Tareas → Desde Claude → «Que Claude lo actualice».
   Pídela con `request_credential` para el host `cesar-solla.pages.dev` (cabecera `Authorization: Bearer`);
   nunca en el chat.
2. Leer: `curl -s https://cesar-solla.pages.dev/api/tareas` devuelve `summary` (texto con ids) y las listas.
3. Crear o actualizar una checklist: `POST /api/tareas` con `{"text": "# 🇩🇪 Nombre\n## Sección\n- [ ] tarea 15/01/2027\n- [x] hecha"}`.
   Si la lista ya existe (mismo nombre), solo añade lo nuevo y marca lo que venga con `[x]`.
4. Cualquier otro cambio: `POST /api/tareas` con `{"ops": [...]}`, por ejemplo
   `{"op":"task.put","list":"<id lista>","task":{...tarea completa con su id...}}`,
   `{"op":"habit.log","id":"<id rutina>","date":"YYYY-MM-DD","done":true}`, `{"op":"task.delete","id":"..."}`.
   Para editar una tarea, léela primero y manda la tarea entera con el cambio.
5. Cuenta a César qué has cambiado. `node --test tests/todo.test.mjs` cubre el modelo y la API.

## Mudanza: el plan del traslado a Ingolstadt

Sección `/control/#mudanza` (`control/mudanza.js`, `mudanza.css`, `mudanza-model.js`; API `functions/control/api/mudanza/status.js`).
El repo es público: **el plan nunca va en el código**. Vive en D1 (`personal_datasets` 'mudanza': `{plan, ticks}`) y se carga
desde la propia sección con «Actualizar el plan» (fichero `mudanza-plan.json`). Ese JSON lo genera
`Claude\Documentos\Relocation Ingolstadt\mudanza-plan.py`: para cambiar el plan, edita los `ITEMS` de ese script, ejecútalo
y pide a César que lo cargue. Lo que él marca (`ticks`) se guarda aparte y sobrevive a un plan nuevo; usa ids estables.
Cada tarea: `id`, `section`, `title`, `due`, `approx` (fecha aproximada, sale con ≈), `deadline` (plazo de verdad, se pone en
rojo al pasar), `state` (done, doing, wait, todo, optional), `who`, `how`, `doneOn`. `node --test tests/mudanza.test.mjs`.

## Empleo: la búsqueda de trabajo de María

Empleo (`/control/#empleo`) sigue la búsqueda de trabajo de María: RRHH / Talent Acquisition cerca de Múnich e
Ingolstadt, en puestos donde no se pida alemán. Cuatro pestañas: Ofertas (con nota de encaje del 0 al 100 y sus
motivos), Candidaturas (fase, follow-ups), Resultados (tasas por versión de CV, canal, mensaje, ubicación del CV,
antigüedad de la oferta, día y hora) y Ajustes (versiones del CV, robot y llave). El modelo y todas las operaciones
están en `control/empleo-model.js` (`applyOps`, `scoreOffer`, `stats`); la página, la API y el robot usan el mismo.

- **Robot** (`scripts/empleo-buscar.mjs`, `.github/workflows/empleo-buscar.yml`): 4 veces al día entre semana lee la
  Agencia de Empleo alemana (`pc/v6/jobs` y `pc/v4/jobdetails`) y Arbeitnow, puntúa con `scoreOffer` y sube lo que
  pasa de 35. Usa el secreto `EMPLEO_KEY`. Sin la llave, `node scripts/empleo-buscar.mjs` solo enseña lo que subiría.
- **LinkedIn no se lee con el robot.** Cuando César pida buscar ofertas, búscalas tú (búsqueda web) y añádelas.
- César aplica a mano. Claude no envía candidaturas ni usa la cuenta de LinkedIn de María.

Cuando César pida algo de Empleo («busca ofertas», «hazme la carta para…», «apunta que apliqué a…»):

1. Necesitas la llave (empieza por `empleo_`). La crea él en Empleo → Ajustes. Pídela con `request_credential`
   para el host `cesar-solla.pages.dev` (cabecera `Authorization: Bearer`); nunca en el chat.
2. Leer: `GET https://cesar-solla.pages.dev/api/empleo` devuelve `summary` (ofertas nuevas de mejor a peor con id,
   candidaturas abiertas, follow-ups y lo que funciona) y todo el documento (`offers`, `apps`, `cvs`, `runs`).
3. Añadir ofertas que encuentres: `POST /api/empleo` con
   `{"ops":[{"op":"offers.add","offers":[{"source":"claude","ext":"<url>","title":"…","company":"…","location":"…","url":"…","posted":"YYYY-MM-DD","score":80,"reasons":["Selección / TA","Oferta en inglés"],"lang":"en","track":"A","note":"por qué encaja"}]}]}`.
   Puntúa como `scoreOffer` (puedes importarlo y pasarle título y descripción).
4. Carta de presentación o notas para una oferta: `{"op":"offer.put","offer":{"id":"<id>","letter":"Dear …","note":"…","cv":"CV-B"}}`.
   Cartas en inglés y cortas. El repo es público: el CV y la situación de María no van aquí; pídeselos a César.
5. Registrar una candidatura: `{"op":"app.put","app":{"company":"…","title":"…","date":"YYYY-MM-DD","time":"HH:MM","offer":"<id oferta>","channel":"Web empresa","cv":"CV-A","location":"madrid","daysPosted":2,"lang":"en","message":true}}`;
   cambiar de fase: `{"op":"app.put","app":{"id":"<id>","phase":"interview"}}` (fases en `PHASES`).
6. Cuenta a César qué has cambiado. `node --test tests/empleo.test.mjs` cubre el modelo, el robot y la API.
