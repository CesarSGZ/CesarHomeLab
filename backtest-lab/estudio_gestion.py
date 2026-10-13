"""
Cómo invertir el dinero con las estrategias que tenemos (mismas acciones, distinta gestión del dinero).

  python estudio_gestion.py politicas    tamaño, rebalanceo, caja, volatilidad objetivo, pirámide (por estrategia)
  python estudio_gestion.py aportes      qué hacer con el ahorro que entra cada mes
  python estudio_gestion.py mezcla       cuánto poner en cada estrategia y en el S&P 500, y cada cuánto reequilibrar

Se elige con 2010-2018 y se comprueba en 2019-hoy (como con las estrategias). Resultados en resultados/gestion_*.csv
"""
import itertools
import json
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

import estrategias_deepvalue as DV
import estrategias_raras as ER
import investigar as IV
from bt import estadistica as S
from bt import fund_sec as FS
from bt.gestion import Politica, simular, tir
from bt.motor_global import ejecutar

RAIZ = Path(__file__).resolve().parent
RES = RAIZ / "resultados"
INICIO, FIN_ENTRENO = "2010-07-01", "2018-12-31"
TRAMOS = {"ent": (INICIO, FIN_ENTRENO), "val": ("2019-01-01", None)}


def estrategias(d, ind, regimen, costes, con_valor=True):
    """Operaciones de cada estrategia desde 2010: momentum (la publicada) y la mejor de valor de la rejilla SEC."""
    from publicar import construir
    cfgs = {c["id"]: c for c in json.loads((RAIZ / "estrategias_elegidas.json").read_text(encoding="utf-8"))}
    out = {}
    est = construir(cfgs["precio"])
    est.inicio = INICIO
    r = ejecutar(est, d, ind, costes, ER.COLUMNAS_PRECIO_4, None, regimen)
    out["precio"] = (est, r)
    if con_valor:
        mejor = json.loads((RES / "rejilla_sec.json").read_text(encoding="utf-8"))["elegida"]
        extra = IV.preparar_fundamentales(d, ind, desde="2010-01-01", lector=FS.leer_todo, max_edad=460)[0]
        e = DV.valor_momentum(**{k: v for k, v in mejor["parametros"].items() if k in ("n", "peso_mom", "liquidez", "zona", "tendencia")}) \
            if mejor["familia"] == "valor_momentum" else None
        if e is None:
            import estudio_sec as ES
            e = next(x for f, x in ES.variantes() if f == mejor["familia"] and x.parametros == mejor["parametros"])
        if mejor["parametros"].get("salir"):
            e.vender_si_mercado_bajista, e.filtro_mercado = True, True
        e.inicio = INICIO
        cols = DV.COLUMNAS_DV
        if mejor["familia"] == "fundamental":
            from estrategias_global import COLUMNAS_FUND
            cols = COLUMNAS_FUND + ["es_eeuu"]
        out["valor"] = (e, ejecutar(e, d, ind, costes, cols, extra, regimen))
    return out


def metricas(serie, sp, a, b):
    m = S.metricas_vs(serie, sp, a, b)
    return {"cagr": m["cagr"], "sharpe": m["sharpe"], "maxdd": m["maxdd"], "cagr_sp": m["cagr_bench"]}


POLITICAS = [Politica(nombre="Como ahora (cartera/n al comprar, sin reequilibrar)"),
             Politica(rebalanceo="Q", nombre="Reequilibrar cada trimestre"),
             Politica(rebalanceo="M", nombre="Reequilibrar cada mes"),
             Politica(tamano="inv_vol", nombre="Más peso a lo menos volátil"),
             Politica(tamano="inv_vol", rebalanceo="Q", nombre="Menos volátil + trimestral"),
             Politica(caja="sp500", nombre="La caja espera en el S&P 500"),
             Politica(vol_obj=0.15, nombre="Volatilidad objetivo 15 %"),
             Politica(vol_obj=0.20, nombre="Volatilidad objetivo 20 %"),
             Politica(vol_obj=0.25, nombre="Volatilidad objetivo 25 %"),
             Politica(vol_obj=0.20, caja="sp500", nombre="Vol. objetivo 20 % + caja en S&P"),
             Politica(piramide=0.25, nombre="Añadir a las que suben > 25 %"),
             Politica(piramide=0.5, nombre="Añadir a las que suben > 50 %")]


def politicas():
    t0 = time.time()
    d, ind, regimen, costes = IV.preparar()
    sp = d.sp500_eur
    ests = estrategias(d, ind, regimen, costes, con_valor=(RES / "rejilla_sec.json").exists())
    filas = []
    for k, (est, r) in ests.items():
        motor = {t: metricas(r.equity, sp, a, b) for t, (a, b) in TRAMOS.items()}
        IV.log(f"{k} motor: ent {motor['ent']['cagr']:.1%} | val {motor['val']['cagr']:.1%}")
        for pol in POLITICAS:
            s = simular(r.operaciones, d, ind, costes, est.n_posiciones, est.capital_inicial, pol, INICIO)
            m = {t: metricas(s["nav"], sp, a, b) for t, (a, b) in TRAMOS.items()}
            filas.append({"estrategia": k, "politica": pol.nombre, **{f"{t}_{x}": v for t, mm in m.items() for x, v in mm.items()},
                          "costes": s["costes"], "motor_ent": motor["ent"]["cagr"], "motor_val": motor["val"]["cagr"]})
            IV.log(f"  {pol.nombre}: ent {m['ent']['cagr']:.1%} Sh {m['ent']['sharpe']:.2f} DD {m['ent']['maxdd']:.0%} | "
                   f"val {m['val']['cagr']:.1%} Sh {m['val']['sharpe']:.2f} DD {m['val']['maxdd']:.0%}")
            pd.DataFrame(filas).to_csv(RES / "gestion_politicas.csv", index=False)
    IV.log(f"hecho en {time.time() - t0:.0f}s")


DESTINOS = [("caja", "Espera a la próxima compra"), ("repartir", "A todas por igual"), ("infra", "A las que están por debajo de su peso"),
            ("ganadoras", "A las que más suben"), ("sp500", "Al S&P 500")]


def aportes():
    d, ind, regimen, costes = IV.preparar()
    ests = estrategias(d, ind, regimen, costes, con_valor=(RES / "rejilla_sec.json").exists())
    filas = []
    for k, (est, r) in ests.items():
        for dest, nombre in DESTINOS:
            for tramo, (a, b) in TRAMOS.items():
                ops = r.operaciones[(r.operaciones["fecha_entrada"] >= a)]
                s = simular(ops, d, ind, costes, est.n_posiciones, 100_000, Politica(aporte=1000, destino=dest), a, b)
                aportado = 100_000 + s["flujos"].sum()
                filas.append({"estrategia": k, "destino": nombre, "tramo": tramo, "aportado": aportado,
                              "patrimonio_final": s["patrimonio"].iloc[-1], "tir": tir(s["patrimonio"], s["flujos"], 100_000),
                              "cagr_participacion": S.metricas_vs(s["nav"], d.sp500_eur)["cagr"]})
                IV.log(f"{k} | {nombre} | {tramo}: {aportado:,.0f} € aportados -> {s['patrimonio'].iloc[-1]:,.0f} € (TIR {filas[-1]['tir']:.1%})")
        pd.DataFrame(filas).to_csv(RES / "gestion_aportes.csv", index=False)


def mezcla():
    """Cartera de estrategias: pesos fijos entre momentum, valor y S&P 500, reequilibrando cada cierto tiempo."""
    d, ind, regimen, costes = IV.preparar()
    ests = estrategias(d, ind, regimen, costes, con_valor=True)
    navs = pd.DataFrame({k: r.equity / r.equity.iloc[0] for k, (_, r) in ests.items()})
    navs["sp500"] = d.sp500_eur.reindex(navs.index).ffill()
    navs = navs.loc[INICIO:].dropna()
    ret = navs.pct_change().fillna(0)
    filas = []
    pesos = [p for p in itertools.product([0, 0.25, 0.5, 0.75, 1.0], repeat=2) if sum(p) <= 1.0]
    for (wm, wv), freq in itertools.product(pesos, ["M", "Q", "Y", None]):
        w = pd.Series({"precio": wm, "valor": wv, "sp500": 1 - wm - wv})
        valor, actual, serie = 1.0, w.copy(), []
        cambio = ret.index.to_period(freq or "Y")
        for i, (dia, r) in enumerate(ret.iterrows()):
            actual = actual * (1 + r)
            valor_n = actual.sum()
            serie.append(valor_n)
            if freq and i + 1 < len(ret) and cambio[i + 1] != cambio[i]:
                objetivo = w * valor_n
                coste = 0.001 * (objetivo - actual).abs().sum()       # 0,1 % de lo que se mueve
                actual = objetivo * (1 - coste / valor_n)
        s = pd.Series(serie, index=ret.index)
        m = {t: metricas(s, d.sp500_eur, a, b) for t, (a, b) in TRAMOS.items()}
        filas.append({"momentum": wm, "valor": wv, "sp500": round(1 - wm - wv, 2), "reequilibrio": freq or "nunca",
                      **{f"{t}_{x}": v for t, mm in m.items() for x, v in mm.items()}})
    t = pd.DataFrame(filas)
    t.to_csv(RES / "gestion_mezcla.csv", index=False)
    print(t.sort_values("ent_sharpe", ascending=False).head(15).round(3).to_string())
    print("correlación diaria:", ret.corr().round(2).to_dict())



def mezcla_aportes():
    """Reparto entre la estrategia 1 (13F), momentum y el S&P SIN vender para reequilibrar (impuestos):
    'nunca' (cada parte va a lo suyo) frente a 'aportes' (el ahorro de cada mes va a la parte más por debajo de su peso)."""
    import estrategias_fondos as EF
    from bt import clon13f
    from publicar import construir
    d, ind, regimen, costes = IV.preparar()
    extra = IV.preparar_fundamentales(d, ind, desde="2013-06-01", lector=FS.leer_todo, max_edad=460)[0]
    extra = clon13f.anadir_a_extra(extra, d.close.columns)
    cfgs = {c["id"]: c for c in json.loads((RAIZ / "estrategias_elegidas.json").read_text(encoding="utf-8"))}
    e1 = construir(cfgs["fundamental"]); e1.inicio = "2014-03-03"
    r1 = ejecutar(e1, d, ind, costes, DV.COLUMNAS_DV, extra, regimen)
    e2 = construir(cfgs["precio"]); e2.inicio = "2014-03-03"
    r2 = ejecutar(e2, d, ind, costes, ER.COLUMNAS_PRECIO_4, None, regimen)
    navs = pd.DataFrame({"copia13f": r1.equity, "momentum": r2.equity, "sp500": d.sp500_eur.reindex(r1.equity.index).ffill()}).dropna()
    ret = navs.pct_change().fillna(0)
    meses = ret.index.to_period("M")
    filas = []
    for (w1, w2), modo in itertools.product([p for p in itertools.product([0, .25, .5, .75, 1], repeat=2) if sum(p) <= 1],
                                            ["nunca", "aportes"]):
        w = pd.Series({"copia13f": w1, "momentum": w2, "sp500": 1 - w1 - w2})
        for tramo, (a, b) in {"ent": ("2014-03-03", FIN_ENTRENO), "val": ("2019-01-01", None)}.items():
            rr = ret.loc[a:b]
            mm = meses[(ret.index >= pd.Timestamp(a)) & ((ret.index <= pd.Timestamp(b)) if b else True)]
            actual, aportado, serie, flujos, nav, unid = w * 100_000, 100_000.0, [], [], [], 100_000.0
            for i, (dia, r) in enumerate(rr.iterrows()):
                f = 0.0
                if modo == "aportes" and i > 0 and mm[i] != mm[i - 1]:
                    total = actual.sum()
                    falta = (w * (total + 1000) - actual).clip(lower=0)
                    actual = actual + (falta / falta.sum() * 1000 if falta.sum() > 0 else w * 1000)
                    unid += 1000 / (nav[-1] / 100_000)
                    f, aportado = 1000, aportado + 1000
                elif modo == "nunca" and i > 0 and mm[i] != mm[i - 1]:
                    actual = actual + w * 1000                   # el ahorro se reparte con los pesos objetivo
                    unid += 1000 / (nav[-1] / 100_000)
                    f, aportado = 1000, aportado + 1000
                actual = actual * (1 + r)
                serie.append(actual.sum()); flujos.append(f); nav.append(actual.sum() / unid * 100_000)
            s, fl, nv = pd.Series(serie, index=rr.index), pd.Series(flujos, index=rr.index), pd.Series(nav, index=rr.index)
            m = metricas(nv, d.sp500_eur, a, b)
            filas.append({"copia13f": w1, "momentum": w2, "sp500": round(1 - w1 - w2, 2), "modo": modo, "tramo": tramo,
                          "cagr": m["cagr"], "sharpe": m["sharpe"], "maxdd": m["maxdd"], "aportado": aportado,
                          "final": s.iloc[-1], "tir": tir(s, fl, 100_000)})
    t = pd.DataFrame(filas)
    t.to_csv(RES / "gestion_mezcla_aportes.csv", index=False)
    v = t.pivot_table(index=["copia13f", "momentum", "sp500", "modo"], columns="tramo", values=["cagr", "sharpe", "maxdd", "tir"])
    print(v.round(3).to_string())
    print("correlación diaria:", ret.corr().round(2).to_dict())


if __name__ == "__main__":
    {"politicas": politicas, "aportes": aportes, "mezcla": mezcla, "mezcla_aportes": mezcla_aportes}[sys.argv[1]]()
