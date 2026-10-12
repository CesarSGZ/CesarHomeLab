# BTL-01 · Backtest Lab

Apartado privado en `/control/#backtest` (Mission Control 08). Prueba estrategias semanales sobre
~117 valores del mercado continuo español con datos gratuitos de Yahoo Finance y las compara con el
IBEX 35 con dividendos. Solo simulación: no se conecta a ningún bróker.

## Flujo

```text
Mission Control (botón «Ejecutar backtest»)
   │  POST /control/api/backtest/status  (sesión + capacidad backtest:run + CSRF + parámetros validados)
   ▼
D1 personal_datasets['backtest-lab-request'] = {status:'queued', params}
   ▲                                   │
   │ puente acotado (runtime-db.js)    │  cada 10 min: .github/workflows/backtest-lab.yml
   │ con OFFICE_DEV_TOKEN              ▼
   │                         scripts/backtest-lab.mjs claim → status 'running'
   │                         python descargar_datos.py (precios; completo los sábados)
   │                         python backtest.py --params … --web web.json
   └──────────────────────── scripts/backtest-lab.mjs publish → personal_datasets['backtest-lab']
Mission Control lee GET /control/api/backtest/status y dibuja el informe.
```

- Sábados 05:17 UTC: recálculo automático con los parámetros por defecto y datos completos.
- `workflow_dispatch` manual: igual que el semanal.
- Los datos descargados se guardan en la caché de Actions para no bajar todo cada vez.
- Una ejecución «running» de más de 75 minutos se considera caída y deja de bloquear otra.

## Piezas

| Archivo | Qué hace |
| --- | --- |
| `backtest-lab/` | Motor en Python (pandas). No se publica en Pages: el despliegue sube solo `dist/`, construido por `scripts/build-pages-dist.mjs` con una lista blanca (web raíz, `assets/`, `control/`). Ver su `README.md`. |
| `backtest-lab/estrategias.py` | Las estrategias: reglas, explicación en lenguaje llano y límites de parámetros. |
| `backtest-lab/bt/web.py` | JSON compacto para la web (~190 KB) y veredicto automático con regla fija. |
| `scripts/backtest-lab.mjs` | Lado Actions: reclamar petición, publicar resultado o marcar fallo. |
| `functions/control/api/backtest/status.js` | API: GET resultado/estado, POST `run` o `cancel`. |
| `control/backtest-model.js` | Límites de parámetros compartidos por formulario y API. |
| `control/backtest.js` / `.css` | Interfaz: reglas, veredicto, KPIs, gráfico, años, cartera actual, operaciones, formulario. |

## Seguridad

- Solo `CesarVapor` tiene `backtest:read` y `backtest:run`.
- La web nunca ejecuta código: encola una petición con parámetros validados (tres veces: navegador,
  Function y Python). El workflow solo usa el token del ejecutor y el puente SQL de lista cerrada;
  las tres sentencias nuevas solo tocan las filas `backtest-lab` y `backtest-lab-request`.
- El workflow no despliega, no hace push y no usa credenciales de Cloudflare.

## Veredicto automático

Se calcula en Python con una regla fija sobre el periodo de validación (fuera de muestra):
pierde (≤ −2 pp/año frente al IBEX), empata (dentro de ±2 pp), «va por delante pero puede ser
suerte» (> +2 pp sin significación) o bate (> +2 pp con t ≥ 2). Así el texto no depende de quién
mire los números.

## Limitaciones conocidas

Supervivencia (Yahoo no tiene empresas excluidas), solo 4 ejercicios de cuentas (estrategia de valor
desde abril de 2023), comisión de IBKR aproximada y sin impuestos. Están explicadas en el propio
apartado («Antes de fiarte»).


## Versión global (octubre 2026)

- **Universo**: ~8.400 acciones de 23 bolsas que IBKR ofrece a un particular europeo (EE. UU., Canadá,
  México, Europa incl. toda la bolsa española, Japón, Hong Kong, Singapur, Australia), construido con el
  screener de Yahoo (`backtest-lab/universo.py`). Todo en EUR. Benchmark: S&P 500 con dividendos en EUR.
- **Datos**: `descargar_global.py` (precios desde 2006 en parquet, tipos de cambio, fundamentales por valor).
  Limpieza de errores de Yahoo (picos de un día, splits no aplicados, rupturas de serie) en `bt/global_datos.py`.
- **Motor**: `bt/motor_global.py` (costes por mercado: comisión IBKR aprox., stamp duty UK/IE/HK, TTF Francia,
  Tobin Italia, ITF España, cambio de divisa, slippage por liquidez).
- **Búsqueda**: `investigar.py` prueba rejillas solo en entrenamiento (precio 2008-2018; fundamentales
  abr-2023 a dic-2024), valida las finalistas en el periodo no visto y calcula el Sharpe deflactado.
  Todo lo probado queda en `resultados/investigacion_*.csv` (local, no versionado).
- **Publicación**: `estrategias_elegidas.json` dice qué estrategias se muestran; `publicar.py` las ejecuta y
  genera el JSON de la web. El workflow semanal ejecuta `descargar_global.py semanal` + `publicar.py`.
- **Interfaz**: sin formularios; los cambios de estrategia se piden por chat.
