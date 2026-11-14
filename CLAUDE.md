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
2. Cada prueba nueva de la campaña de canales va también como fila en `story.ab_tests.rows` (cifras de `tools/thermal-bench/analyze.py`); así sale en la gráfica de antes y después.
   Revisa `story.next_steps` (siempre debe quedar uno en `next`), `story.phases`, `story.cfd_gate`, `story.conclusions` y `story.uses`.
3. Sube `story.updated` y `generated_at`. Una idea o modelo nuevo necesita su `plain_es`.
4. `node --test tests/thermal-story.test.mjs` comprueba que no falte nada.
5. El modelo 3D sale de `tools/terra-cfd/build_geometry.py` (no edites `geometry` a mano). Si cambias `control/thermal-viewer.js`, recompila `thermal-viewer.bundle.js` (ver `tools/terra-cfd/README.md`) y sube el `?v=` en `control/index.html`.
