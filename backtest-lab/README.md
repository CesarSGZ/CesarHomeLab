# Backtest Lab · motor en Python

Motor de backtesting propio (pandas) para estrategias semanales sobre ~117 valores del mercado
continuo español con datos gratuitos de Yahoo Finance. Lo ejecuta GitHub Actions
(`.github/workflows/backtest-lab.yml`) y el resultado se ve en Mission Control → **08 · Backtest Lab**.
Flujo completo y seguridad: [`docs/backtest-lab.md`](../docs/backtest-lab.md). No se conecta a ningún bróker.

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

## Reglas de honestidad que aplica el motor

- Señal con el cierre del viernes, ejecución en la apertura del lunes.
- Cada cuenta solo se usa desde su fecha de publicación (o cierre + 90 días).
- Entrenamiento y validación separados; la rejilla de parámetros solo mira entrenamiento.
- Comparación siempre con el IBEX 35 con dividendos (ETF BBVAI.MC) y con la equiponderada del universo.
- Limitación conocida: sesgo de supervivencia (Yahoo no tiene empresas excluidas).
