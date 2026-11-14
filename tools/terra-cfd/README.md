# Terra · geometría para el visor 3D y el CFD

- `build_geometry.py` escribe la sección `geometry` de `control/data/terra-thermal-summary.json`.
  Cada pieza lleva `role` (heat, fan, duct, structure, porous) y `certainty`
  (measured, official, photo, assumed), y su `basis` dice de dónde sale la cota.
  `--check` solo comprueba que nada macizo se solape ni se salga de la caja.
- `export_stl.py` saca un STL por pieza, zona porosa, disco de ventilador y ranuras de cada panel,
  en metros, más `manifest.json` con la condición de contorno prevista para cada uno.
  Por defecto escribe en `Escritorio\Claude\Datos\Terra\cfd-geometria`.

El visor (`control/thermal-viewer.js`) lee la misma geometría. Después de tocarlo hay que recompilar el bundle:

    esbuild control/thermal-viewer.js --bundle --minify --format=iife --target=es2020 \
      --alias:three=./control/vendor/three.module.min.js --outfile=control/thermal-viewer.bundle.js

Ejes (mm): x de delante (nogal, fuente) hacia atrás (I/O), y del panel de la gráfica al del procesador, z hacia arriba.
Las preguntas abiertas (lo que hay que medir antes del CFD) están en `geometry.open_questions`.
