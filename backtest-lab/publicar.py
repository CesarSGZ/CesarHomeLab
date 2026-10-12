"""
Ejecuta las estrategias elegidas (estrategias_elegidas.json) en todo el periodo y genera el JSON de la web.

  python publicar.py --web resultados/web.json

estrategias_elegidas.json lo escribe investigar.py validar (o se edita a mano al pedir un cambio en el chat).
"""
import argparse
import json
import math
import time
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

import estrategias_global as EG
import investigar as IV
from bt import estadistica as S
from bt.metricas import rentabilidad_anual
from bt.motor_global import benchmark_equiponderado, ejecutar

import estrategias_deepvalue as DV
import estrategias_raras as ER

RAIZ = Path(__file__).resolve().parent
ELEGIDAS = RAIZ / "estrategias_elegidas.json"
FAMILIAS = {"ruptura": EG.ruptura_volumen, "acumulacion": EG.acumulacion, "momentum_volumen": EG.momentum_volumen,
            "capitulacion": EG.capitulacion, "cerca_maximos": EG.cerca_maximos, "volumen_anomalo": EG.volumen_anomalo,
            "momentum_riesgo": EG.momentum_riesgo, "ruptura_momentum": EG.ruptura_momentum, "fundamental": EG.fundamental,
            **ER.FAMILIAS, **DV.FAMILIAS}


def f(x, dec=4):
    try:
        x = float(x)
    except (TypeError, ValueError):
        return None
    return round(x, dec) if math.isfinite(x) else None


def construir(cfg):
    params = {k: v for k, v in cfg["parametros"].items() if k != "salir"}
    est = FAMILIAS[cfg["familia"]](**params)
    if cfg["parametros"].get("salir"):
        est.vender_si_mercado_bajista = True
        est.filtro_mercado = True
        est.reglas["venta"] = [r for r in est.reglas["venta"] if "No compra" not in r] + \
            ["Se pasa a liquidez si el S&P 500 pierde su media de 200"]
    return est


def veredicto(m_test):
    d, t = m_test["exceso"], m_test["t"]
    mejor_sharpe = m_test["sharpe"] > m_test["sharpe_bench"]
    es = lambda x, dec=1: f"{x:.{dec}f}".replace(".", ",")
    sh = f"Sharpe {es(m_test['sharpe'], 2)} frente a {es(m_test['sharpe_bench'], 2)}"
    if d <= -0.02:
        return {"level": "pierde", "title": "No bate al S&P 500",
                "text": f"En los años que no se usaron para diseñarla rinde {es(abs(d) * 100)} puntos al año menos. {sh}."}
    if d < 0.02:
        return {"level": "empate", "title": "Empata con el S&P 500",
                "text": f"En los años no vistos la diferencia es de {es(d * 100)} puntos al año: dentro del ruido. {sh}."}
    if t >= 2 and mejor_sharpe:
        return {"level": "gana", "title": "Bate al S&P 500 de forma significativa",
                "text": f"+{es(d * 100)} puntos al año en los años no vistos (t = {es(t, 2)}) y mejor {sh}."}
    if not mejor_sharpe:
        return {"level": "indicio", "title": "Gana en rentabilidad, pero con más riesgo",
                "text": f"+{es(d * 100)} puntos al año en los años no vistos, pero peor relación rentabilidad/riesgo ({sh}) "
                        f"y aún no significativo (t = {es(t, 2)}; hace falta ≥ 2)."}
    return {"level": "indicio", "title": "Va por delante, pero puede ser suerte",
            "text": f"+{es(d * 100)} puntos al año en los años no vistos y {sh}, aún no significativo (t = {es(t, 2)}; hace falta ≥ 2)."}


def bloque(cfg, res, d, ew, ejemplos=None):
    est = res.estrategia
    eq = res.equity / res.equity.iloc[0]
    sp = d.sp500_eur.reindex(eq.index).ffill()
    sp = sp / sp.iloc[0]
    ewr = ew.reindex(eq.index).ffill()
    ewr = ewr / ewr.iloc[0]
    fin_tr = pd.Timestamp(est.fin_entrenamiento)
    tramos = {"full": (None, None), "train": (None, fin_tr), "test": (fin_tr + pd.Timedelta(days=1), None)}
    kpis = {}
    for k, (a, b) in tramos.items():
        m = S.metricas_vs(eq, sp, a, b)
        me = S.metricas_vs(ewr, sp, a, b)
        ops = res.operaciones
        o = ops[(ops["fecha_entrada"] >= eq.loc[a:b].index[0]) & (ops["fecha_entrada"] <= eq.loc[a:b].index[-1])] if len(ops) else ops
        cerradas = o[o["motivo_salida"] != "abierta"] if len(o) else o
        kpis[k] = {"from": eq.loc[a:b].index[0].strftime("%Y-%m-%d"), "years": f(m["anios"], 1),
                   "strategy": {"cagr": f(m["cagr"]), "sharpe": f(m["sharpe"], 2), "maxdd": f(m["maxdd"]),
                                "tradesPerYear": f(len(o) / m["anios"], 1) if m["anios"] else None,
                                "hitRate": f((cerradas["rentabilidad"] > 0).mean()) if len(cerradas) else None},
                   "sp500": {"cagr": f(m["cagr_bench"]), "sharpe": f(m["sharpe_bench"], 2), "maxdd": f(m["maxdd_bench"])},
                   "universe": {"cagr": f(me["cagr"]), "sharpe": f(me["sharpe"], 2), "maxdd": f(me["maxdd"])},
                   "excess": f(m["exceso"]), "t": f(m["t"], 2)}
    m_test = S.metricas_vs(eq, sp, fin_tr + pd.Timedelta(days=1))
    sem = pd.DataFrame({"strategy": eq, "sp500": sp, "universe": ewr}).resample("W-FRI").last().dropna()
    anual = rentabilidad_anual({"strategy": eq, "sp500": sp})
    uni = d.universo
    nombre = lambda tk: str(uni.at[tk, "nombre"])[:38] if tk in uni.index else tk
    ops = res.operaciones
    trades = [] if ops.empty else [
        {"ticker": r.ticker, "name": nombre(r.ticker), "zone": str(uni.at[r.ticker, "zona"]) if r.ticker in uni.index else "",
         "in": r.fecha_entrada.strftime("%Y-%m-%d"), "out": None if pd.isna(r.fecha_salida) else r.fecha_salida.strftime("%Y-%m-%d"),
         "ret": f(r.rentabilidad), "days": int(r.dias)} for r in ops.itertuples()]
    return {
        "id": cfg["id"], "name": est.nombre, "kind": cfg["tipo"], "rules": est.reglas, "params": cfg["parametros"],
        "positions": est.n_posiciones, "start": eq.index[0].strftime("%Y-%m-%d"), "trainEnd": fin_tr.strftime("%Y-%m-%d"),
        "kpis": kpis, "verdict": veredicto(m_test),
        "search": cfg.get("busqueda", {}),
        "curve": {"dates": [x.strftime("%Y-%m-%d") for x in sem.index],
                  **{c: [round(float(v), 4) for v in sem[c]] for c in sem.columns}},
        "annual": [{"year": int(y), "strategy": f(r["strategy"]), "sp500": f(r["sp500"])} for y, r in anual.iterrows()],
        "holdings": [t for t in trades if t["out"] is None],
        "trades": trades, "tradesTotal": len(trades), "costs": f(res.costes_totales, 0),
        "examples": ejemplos or {},
        "capital": est.capital_inicial, "finalValue": f(res.equity.iloc[-1], 0),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--web", default=str(RAIZ / "resultados" / "web.json"))
    ap.add_argument("--origen", default="local")
    args = ap.parse_args()
    cfgs = json.loads(ELEGIDAS.read_text(encoding="utf-8"))
    d, ind, regimen, costes = IV.preparar()
    extra = None
    bloques = []
    for cfg in cfgs:
        est = construir(cfg)
        columnas = DV.COLUMNAS_DV if est.usa_fundamentales else ER.COLUMNAS_PRECIO_4
        if est.usa_fundamentales and extra is None:
            extra, _, _ = IV.preparar_fundamentales(d, ind)
        t0 = time.time()
        res = ejecutar(est, d, ind, costes, columnas, extra if est.usa_fundamentales else None, regimen)
        if res.operaciones.empty:
            raise SystemExit(f"{est.nombre}: ninguna operación (¿faltan datos?). No se publica para no pisar "
                             "el resultado bueno anterior.")
        ew = benchmark_equiponderado(ind, est.inicio, None, est.liquidez_min)
        from bt import ejemplos as EJ
        ej = EJ.generar(est, res, d, ind, extra if est.usa_fundamentales else None, columnas)
        bloques.append(bloque(cfg, res, d, ew, ej))
        IV.log(f"{est.nombre}: {time.time() - t0:.0f}s")
    zonas = d.universo["zona"].value_counts().to_dict()
    payload = {
        "schema": 2, "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "dataUntil": d.close.index[-1].strftime("%Y-%m-%d"), "trigger": args.origen,
        "benchmark": "S&P 500 con dividendos, en euros",
        "universe": {"stocks": int(d.close.shape[1]), "markets": int(d.universo["region"].nunique()), "zones": zonas},
        "strategies": bloques,
    }
    texto = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    Path(args.web).write_text(texto, encoding="utf-8")
    # cartera objetivo para el robot de IBKR (paper): lo que tendría cada estrategia con el último cierre
    from bt import alertas as AL
    cartera = {"generatedAt": payload["generatedAt"], "dataUntil": payload["dataUntil"], "estrategias": [
        {"id": b["id"], "nombre": b["name"], "posiciones": b["positions"],
         "valores": [{"ticker": h["ticker"], "nombre": h["name"], "desde": h["in"],
                      "divisa": str(d.universo.at[h["ticker"], "divisa"]) if h["ticker"] in d.universo.index else None,
                      # semáforo de alertas: solo se anota para comprobarlo en paper, no cambia la cartera
                      "semaforo": AL.semaforo(b["id"], d, ind, h["ticker"], d.close.index[-1])}
                     for h in b["holdings"]]} for b in bloques]}
    IV.log("Semáforo: " + ", ".join(f"{v['ticker']} {len(v['semaforo']['alertas'])}"
                                     for e in cartera["estrategias"] for v in e["valores"]))
    Path(args.web).with_name("cartera_objetivo.json").write_text(json.dumps(cartera, ensure_ascii=False, indent=1), encoding="utf-8")
    IV.log(f"JSON web: {args.web} ({len(texto) / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
