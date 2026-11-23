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

Tareas (`/control/#todo` y la app `/control/tareas/`) sustituye a Microsoft To Do. Tiene Hoy, Fechas, Rutinas
(cosas diarias con racha), Proyectos (checklists con secciones, como la mudanza a Ingolstadt), Listas e Ideas.
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
