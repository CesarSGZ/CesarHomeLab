# Backtest Lab · motor en Python

Motor de backtesting propio (pandas) para estrategias semanales sobre ~117 valores del mercado
continuo español con datos gratuitos de Yahoo Finance. Lo ejecuta GitHub Actions
(`.github/workflows/backtest-lab.yml`) y el resultado se ve en Mission Control → **08 · Backtest Lab**.
Flujo completo y seguridad: [`docs/backtest-lab.md`](../docs/backtest-lab.md). No se conecta a ningún bróker.
Esta carpeta no se publica en la web: Pages solo sirve `dist/` (ver `scripts/build-pages-dist.mjs`).

## Ejecutarlo en local

```
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe descargar_datos.py              (10-15 min; --precios: solo precios)
.venv\Scripts\python.exe backtest.py                     (informe en resultados/informe.html)
.venv\Scripts\python.exe backtest.py --web resultados\web.json --params p.json
```

`datos/` y `resultados/` no se versionan.

## Estructura

```
descargar_datos.py     descarga de Yahoo (precios, cuentas, info, fechas de resultados, acciones)
backtest.py            orquesta todo; --params, --web, --sin-rejilla, --sin-informe
estrategias.py         las estrategias: reglas, explicación en simple y límites de parámetros web
bt/datos.py            carga, corrección de splits mal aplicados, rentabilidad total, validación
bt/fundamentales.py    ratios históricos point-in-time (solo datos ya publicados en cada fecha)
bt/senales.py          indicadores y tabla transversal de señales (reutilizable en vivo con ib_async)
bt/motor.py            simulación semanal, costes (IBKR aprox. + ITF + slippage), benchmarks
bt/metricas.py         CAGR, volatilidad, Sharpe, drawdown, aciertos...
bt/informe.py          informe HTML completo (uso local)
bt/web.py              JSON para Mission Control y veredicto automático
```

## Datos: dónde está cada cosa

Todo vive en `datos_global/` (no se versiona: pesa ~2 GB). GitHub Actions vuelve a bajar lo que necesita en
cada ejecución; en el PC sirve para investigar. Conviene guardar una copia de esta carpeta fuera del PC.

| Carpeta / fichero | Qué es | De dónde | Cómo se actualiza |
|---|---|---|---|
| `universo.csv` | ~8.600 acciones (todas las bolsas) con zona, divisa y liquidez | screener de Yahoo | `universo.py` |
| `precios.parquet` | precios diarios desde 2006 (OHLC, volumen, dividendos, splits) | Yahoo | `descargar_global.py precios/actualizar` |
| `mercado.parquet`, `vix.csv` | S&P 500, divisas, VIX | Yahoo | `descargar_global.py mercado` |
| `fundamentales/` | cuentas de ~5 años por empresa (todas las bolsas) | Yahoo | `descargar_global.py fundamentales` |
| `sec/companyfacts/` | cuentas XBRL de ~3.400 empresas de EE. UU. desde 2009, con fecha real de presentación | SEC (gratis) | `descargar_sec.py` |
| `sec/fotos_sec.parquet` | las cuentas SEC ya en 12 meses + balance, listas para el motor | `bt/fund_sec.py` | se rehace solo si se borra |
| `alternativos/wiki/` | visitas diarias en Wikipedia desde 2015 (~1.350 empresas) | Wikimedia | análisis de operaciones |
| `alternativos/yahoo/` | fechas de resultados con sorpresa del BPA y cambios de recomendación | Yahoo | análisis de operaciones |
| `alternativos/sec_form4/` | compras y ventas de directivos (formularios 4) desde 2008 | SEC | análisis de operaciones |
| `alternativos/finra/` | volumen vendido a corto diario (desde 2019) | FINRA | análisis de operaciones |
| `alternativos/fred.csv` | diferencial high yield, curva de tipos, condiciones financieras | FRED | análisis de operaciones |
| `alternativos/rasgos_operaciones.parquet` | ~140 rasgos de cada operación de las dos estrategias | análisis de octubre de 2026 | — |

Estudio con las cuentas de la SEC: `estudio_sec.py validar` (cuadre con Yahoo), `estudio_sec.py backtest`
(Valor + momentum en EE. UU. desde 2010), `estudio_sec.py rejilla` y `finalistas` (reentreno 2010-2018 / 2019-hoy).
Gestión del dinero (mismas acciones, distinta forma de invertir): `estudio_gestion.py politicas | aportes | mezcla`
con el simulador `bt/gestion.py`. Límite conocido: faltan las empresas que dejaron de cotizar
(`resultados/supervivencia_sec.csv` mide cuántas).

## Reglas de honestidad que aplica el motor

- Señal con el cierre del viernes, ejecución en la apertura del lunes.
- Cada cuenta solo se usa desde su fecha de publicación (o cierre + 90 días).
- Entrenamiento y validación separados; la rejilla de parámetros solo mira entrenamiento.
- Comparación siempre con el IBEX 35 con dividendos (ETF BBVAI.MC) y con la equiponderada del universo.
- Limitación conocida: sesgo de supervivencia (Yahoo no tiene empresas excluidas).
