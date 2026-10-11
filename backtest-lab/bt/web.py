"""Exporta los resultados a un JSON compacto para el apartado Backtest Lab de Mission Control."""
import json
import math
from datetime import datetime, timezone

import numpy as np
import pandas as pd

from .metricas import tramo

CLAVES = ["CAGR", "Volatilidad", "Sharpe (rf=0)", "Drawdown maximo", "Exposicion media", "Operaciones/anio",
          "% aciertos", "Ganancia media", "Perdida media", "Dias medios en cartera", "Rentabilidad total", "Anios"]
NOMBRES = {"CAGR": "cagr", "Volatilidad": "vol", "Sharpe (rf=0)": "sharpe", "Drawdown maximo": "maxdd",
           "Exposicion media": "exposure", "Operaciones/anio": "tradesPerYear", "% aciertos": "hitRate",
           "Ganancia media": "avgWin", "Perdida media": "avgLoss", "Dias medios en cartera": "avgDays",
           "Rentabilidad total": "total", "Anios": "years"}
SERIES = {"Estrategia": "strategy", "IBEX 35 con dividendos (ETF)": "ibex", "Equiponderada universo": "ew"}
TRAMOS = {"Completo": "full", "Entrenamiento": "train", "Validacion (fuera de muestra)": "test"}


def _f(x, dec=4):
    try:
        x = float(x)
    except (TypeError, ValueError):
        return None
    return round(x, dec) if math.isfinite(x) else None


def exceso_frente_ibex(eq: pd.Series, ibex: pd.Series, desde=None, hasta=None) -> dict:
    """Exceso anual frente al IBEX con su estadistico t (rentabilidades semanales)."""
    a, b = tramo(eq, desde, hasta), tramo(ibex, desde, hasta)
    ex = (a.pct_change() - b.reindex(a.index).ffill().pct_change()).dropna().resample("W").sum()
    if len(ex) < 10 or ex.std() == 0:
        return {"excess": None, "tStat": None, "weeks": int(len(ex))}
    m, te = ex.mean() * 52, ex.std() * np.sqrt(52)
    return {"excess": _f(m), "trackingError": _f(te), "tStat": _f(m / te * np.sqrt(len(ex) / 52), 2), "weeks": int(len(ex))}


def veredicto(m_test: dict, ibex_test: dict, ex_test: dict, ex_full: dict, anios_test: float) -> dict:
    """Regla fija y conservadora: mira la validacion fuera de muestra y la significacion estadistica."""
    d = (m_test.get("CAGR") or 0) - (ibex_test.get("CAGR") or 0)
    t, tt = ex_full.get("tStat"), ex_test.get("tStat")
    es = lambda x, dec=1: f"{x:.{dec}f}".replace(".", ",")
    if d <= -0.02:
        nivel, titulo = "peor", "Pierde contra el IBEX fuera de muestra"
        texto = (f"En el periodo de validación ({es(anios_test)} años) rinde {es(abs(d) * 100)} puntos al año menos que "
                 "comprar el IBEX 35 con dividendos. Con estos datos, no compensa frente a un fondo indexado.")
    elif d < 0.02:
        nivel, titulo = "empate", "Empata con el IBEX: no hay evidencia de que aporte valor"
        texto = (f"En validación ({es(anios_test)} años) la diferencia con el IBEX es de {'+' if d >= 0 else '−'}"
                 f"{es(abs(d) * 100)} puntos al año, dentro del ruido. No se justifica solo por rentabilidad.")
    elif tt is not None and tt >= 2:
        nivel, titulo = "mejor", "Bate al IBEX fuera de muestra"
        texto = (f"En validación ({es(anios_test)} años) rinde {es(d * 100)} puntos al año más que el IBEX con dividendos "
                 "y la diferencia es estadísticamente significativa. Aun así, valídala en la cuenta paper antes de usarla.")
    else:
        nivel, titulo = "indicio", "Va por delante del IBEX, pero todavía puede ser suerte"
        texto = (f"En validación ({es(anios_test)} años) rinde {es(d * 100)} puntos al año más que el IBEX con dividendos, "
                 f"pero con tan poco recorrido la diferencia no es significativa (t = {es(tt or 0, 2)}).")
    if t is not None:
        texto += f" Estadístico t del exceso en todo el periodo: {es(t, 2)} (hace falta ~2 para empezar a fiarse)."
    return {"level": nivel, "title": titulo, "text": texto, "testGap": _f(d)}


def _curva(series: dict) -> dict:
    df = pd.DataFrame(series).ffill().dropna()
    sem = df.resample("W-FRI").last().dropna()
    if df.index[-1] not in sem.index:
        sem.loc[df.index[-1]] = df.iloc[-1]
    sem = sem / sem.iloc[0]
    return {"dates": [d.strftime("%Y-%m-%d") for d in sem.index],
            **{SERIES[k]: [round(float(v), 5) for v in sem[k].values] for k in sem.columns}}


def bloque_estrategia(clave, res, eq, bm, tabla, anual, rejilla=None) -> dict:
    est = res.estrategia
    fin_tr = pd.Timestamp(est.fin_entrenamiento)
    metricas = {TRAMOS[t]: {} for t in TRAMOS}
    for (t, s), m in tabla.items():
        metricas[TRAMOS[t]][SERIES[s]] = {NOMBRES[k]: _f(m.get(k)) for k in CLAVES if k in m}
        metricas[TRAMOS[t]][SERIES[s]]["period"] = m.get("Periodo")
    ibex = bm["IBEX 35 con dividendos (ETF)"]
    ex_full = exceso_frente_ibex(eq, ibex)
    ex_test = exceso_frente_ibex(eq, ibex, fin_tr + pd.Timedelta(days=1))
    m_test = tabla[("Validacion (fuera de muestra)", "Estrategia")]
    i_test = tabla[("Validacion (fuera de muestra)", "IBEX 35 con dividendos (ETF)")]
    ops = res.operaciones
    trades = []
    if not ops.empty:
        for r in ops.itertuples():
            trades.append({"ticker": r.ticker.replace(".MC", ""), "name": str(r.nombre or "").title()[:40],
                           "sector": r.sector if isinstance(r.sector, str) else "",
                           "in": r.fecha_entrada.strftime("%Y-%m-%d"),
                           "out": None if pd.isna(r.fecha_salida) else r.fecha_salida.strftime("%Y-%m-%d"),
                           "pin": _f(r.precio_entrada, 3), "pout": _f(r.precio_salida, 3),
                           "ret": _f(r.rentabilidad), "days": int(r.dias), "reason": r.motivo_salida})
    abiertas = [t for t in trades if t["out"] is None]
    return {
        "id": clave, "name": est.nombre, "rules": est.reglas, "params": est.parametros,
        "start": eq.index[0].strftime("%Y-%m-%d"), "end": eq.index[-1].strftime("%Y-%m-%d"),
        "trainEnd": fin_tr.strftime("%Y-%m-%d"), "capital": est.capital_inicial,
        "finalValue": _f(res.equity.iloc[-1], 0), "costs": _f(res.costes_totales, 0),
        "metrics": metricas, "excess": {"full": ex_full, "test": ex_test},
        "verdict": veredicto(m_test, i_test, ex_test, ex_full, m_test.get("Anios") or 0),
        "curve": _curva({"Estrategia": eq, **bm}),
        "annual": [{"year": int(y), **{SERIES[c]: _f(v) for c, v in row.items()}} for y, row in anual.iterrows()],
        "trades": trades, "openPositions": abiertas,
        "grid": rejilla,
    }


def exportar(ruta, resultados, rejilla, calidad, cobertura, control, p, params, origen):
    bloques = []
    for clave, (res, eq, bm, tabla, anual) in resultados.items():
        rj = None
        if clave == "momentum" and rejilla:
            rj = [{k: (_f(v) if isinstance(v, float) else v) for k, v in fila.items()} for fila in rejilla]
        bloques.append(bloque_estrategia(clave, res, eq, bm, tabla, anual, rj))
    anios = calidad["anios"]
    payload = {
        "schema": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "dataUntil": p.close.index[-1].strftime("%Y-%m-%d"),
        "trigger": origen, "params": params,
        "data": {
            "tickers": int(len(calidad)), "since2008": int((p.close.loc[:"2008-01-31"].notna().any()).sum()),
            "years15plus": int((anios >= 15).sum()),
            "fundamentalsReliable": int(control["fiable"].sum()),
            "fundamentalsExcluded": [t.replace(".MC", "") for t in control.index[~control["fiable"]]],
            "fundamentalYears": int(cobertura["anios_cuentas"].median()),
        },
        "strategies": bloques,
    }
    texto = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    with open(ruta, "w", encoding="utf-8") as fh:
        fh.write(texto)
    return len(texto.encode("utf-8"))
