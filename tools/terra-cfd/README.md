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

## CFD con OpenFOAM (carpeta `openfoam/`)

OpenFOAM v2512 para Windows (build MinGW de ESI/Keysight, en `C:\Program Files\ESI-OpenCFD`) y
ParaView 6.2 portable (`Escritorio\Claude\Cache\CFD\ParaView`).

```
python tools/terra-cfd/openfoam/make_case.py --config S07 --cell 3      # escribe el caso en Datos\Terra\cfd-casos
python tools/terra-cfd/openfoam/run_case.py <caso> --np 8 --loops 6     # malla, simula y ajusta los ventiladores
pvbatch tools/terra-cfd/openfoam/render.py <caso> <salida> Datos\Terra\cfd-geometria   # imágenes
```

- `foam.bat` prepara el entorno de OpenFOAM para una orden suelta (`foam.bat checkMesh`).
- Dominio: el aire de dentro de la caja. Sólidos recortados con topoSet + subsetMesh; `run_case.py` cambia
  el patch `oldInternalFaces` de `empty` a `wall` (si no, simpleFoam no resuelve la velocidad).
- Ventiladores: fuerza en su zona cilíndrica; el salto de presión se corrige en cada vuelta hacia su curva
  (Noctua oficial; gráfica y fuente estimadas). Rejillas, aletas, cables y memoria: zonas porosas.
- Temperatura: escalar pasivo (scalarTransport) con el calor medido en cada pieza. Paredes adiabáticas.
- En v2512 las fuentes `semiImplicitSource` van en `sources { U ((x y z) 0); }`; `injectionRateSuSp` se ignora sin avisar.
- Orientación: los ejes del modelo (x frontal→trasera, y panel gráfica→panel CPU, z arriba) forman una referencia
  reflejada respecto a la caja real. El visor de la web lo corrige con su cambio de ejes y `render.py` hace lo mismo
  (y → −y, vectores incluidos) para que las imágenes del CFD coincidan con el PC y con el visor. La física no cambia
  con el reflejo (los ventiladores no llevan giro en el modelo), así que los resultados valen igual.
- Aire en el visor 3D: `pvbatch tools/terra-cfd/openfoam/export_streams.py <caso> control/data/cfd/s07-streams.bin`
  exporta ~3.000 líneas de corriente (binario compacto, coordenadas del modelo). El visor las anima con un shader
  (pulsos a la velocidad real del aire, color por temperatura). Después de tocar `thermal-viewer.js`, recompilar el bundle.
