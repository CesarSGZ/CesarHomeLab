"""
Plan del dinero del sistema completo (bt/plan.py): reparto entre estrategias, reserva de liquidez para caídas y
ahorro mensual, sin vender nunca para reequilibrar.

  python estudio_plan.py          -> resultados/plan_dinero.csv y elige el plan (plan_dinero.json se escribe a mano)

Estrategias tal y como están publicadas (estrategia 1 = copia 13F, momentum con semáforo). Tramos:
  ent    2008-2018: la estrategia 1 solo existe desde 2014; antes se usa el S&P 500 en su lugar (aproximación) para
         poder probar las reglas de caídas con 2008 y 2011
  val    2019-hoy (2020 y 2022), solo para mirar el plan elegido
Ahorro: 1 % del capital inicial al mes. Rival: el S&P 500 con el mismo ahorro y sin reserva.
"""
import itertools
import json
from pathlib import Path

import numpy as np
import pandas as pd

import estrategias_deepvalue as DV
import estrategias_raras as ER
import investigar as IV
from bt import clon13f
from bt import estadistica as S
from bt import fund_sec as FS
from bt.gestion import tir
from bt.motor_global import ejecutar
from bt.plan import Plan, simular

RAIZ = Path(__file__).resolve().parent
RES = RAIZ / "resultados"
TRAMOS = {"ent": ("2008-07-01", "2018-12-31"), "val": ("2019-01-01", None)}
CAPITAL, APORTE = 100_000.0, 1_000.0
PESOS = [{"fundamental": a, "precio": round(1 - a, 2)} for a in (0.4, 0.5, 0.6, 0.7)]
RESERVAS = [0.0, 0.05, 0.10, 0.15, 0.20]
DISPAROS = {"nunca": (), "-10 % mitad, -20 % todo": ((-0.10, 0.5), (-0.20, 1.0)), "-15 % todo": ((-0.15, 1.0),),
            "-20 % todo": ((-0.20, 1.0),), "-10/-20/-30 % por tercios": ((-0.10, 1 / 3), (-0.20, 2 / 3), (-0.30, 1.0))}


def navs_estrategias():
    from publicar import construir
    d, ind, regimen, costes = IV.preparar()
    cfgs = {c["id"]: c for c in json.loads((RAIZ / "estrategias_elegidas.json").read_text(encoding="utf-8"))}
    extra = IV.preparar_fundamentales(d, ind, desde="2013-06-01", lector=FS.leer_todo, max_edad=460)[0]
    extra = clon13f.anadir_a_extra(extra, d.close.columns, gestores=clon13f.ORIGINALES)
    e1 = construir(cfgs["fundamental"]); e1.inicio = cfgs["fundamental"]["inicio"]
    r1 = ejecutar(e1, d, ind, costes, DV.COLUMNAS_DV, extra, regimen)
    e2 = construir(cfgs["precio"]); e2.inicio = "2008-01-02"
    r2 = ejecutar(e2, d, ind, costes, ER.COLUMNAS_PRECIO_4, None, regimen)
    sp = d.sp500_eur.ffill()
    idx = r2.equity.index
    f = r1.equity.reindex(idx)
    # antes de 2014 la estrategia 1 no existe: el S&P 500 ocupa su lugar
    ini = f.first_valid_index()
    f = f.fillna(sp.reindex(idx) / sp.reindex(idx).loc[ini] * f.loc[ini])
    return pd.DataFrame({"fundamental": f, "precio": r2.equity, "sp500": sp.reindex(idx)}).dropna(), d.sp500_eur


def medir(s, sp, a, b):
    m = S.metricas_vs(s["nav"], sp, a, b)
    return {"tir": tir(s["patrimonio"], s["flujos"], CAPITAL), "final": s["patrimonio"].iloc[-1],
            "aportado": CAPITAL + s["flujos"].sum(), "sharpe": m["sharpe"], "maxdd": m["maxdd"],
            "reserva_media": s["reserva"].mean()}


def main():
    navs, sp = navs_estrategias()
    navs.to_pickle(RES / "plan_navs.pkl")
    filas = []
    for tramo, (a, b) in TRAMOS.items():
        rival = simular(navs[["sp500"]], sp, Plan(pesos={"sp500": 1.0}, reserva=0.0, aporte=APORTE, disparos=()), CAPITAL, a, b)
        r = medir(rival, sp, a, b)
        filas.append({"tramo": tramo, "plan": "S&P 500 con el mismo ahorro", "pesos": "", "reserva": 0.0, "disparos": "", **r})
        for pesos, reserva, (nd, disp) in itertools.product(PESOS, RESERVAS, DISPAROS.items()):
            if reserva == 0 and nd != "nunca":
                continue
            p = Plan(pesos=pesos, reserva=reserva, aporte=APORTE, disparos=disp)
            s = simular(navs, sp, p, CAPITAL, a, b)
            filas.append({"tramo": tramo, "plan": "", "pesos": f"{pesos['fundamental']:.0%}/{pesos['precio']:.0%}",
                          "reserva": reserva, "disparos": nd, **medir(s, sp, a, b)})
        IV.log(f"{tramo} hecho")
    t = pd.DataFrame(filas)
    t.to_csv(RES / "plan_dinero.csv", index=False)
    v = t.pivot_table(index=["pesos", "reserva", "disparos"], columns="tramo", values=["tir", "sharpe", "maxdd"])
    pd.set_option("display.width", 250)
    print(t[t["plan"] != ""].round(3).to_string())
    print(v.sort_values(("sharpe", "ent"), ascending=False).round(3).to_string())


if __name__ == "__main__":
    main()
