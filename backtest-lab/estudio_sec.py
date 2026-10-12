"""
Valor + momentum con las cuentas de la SEC (EE. UU., desde 2010): ¿funcionaba la idea antes de 2023?

La estrategia se diseñó mirando abril 2023 - diciembre 2024 con cuentas de Yahoo (todo el mundo). Aquí se ejecuta
EXACTAMENTE con los mismos parámetros, pero solo en EE. UU. y con las cuentas de la SEC, desde julio de 2010.
Los años 2010-2022 nunca se usaron para diseñarla: son una prueba fuera de muestra "hacia atrás".

  python estudio_sec.py validar     compara los ratios SEC con los de Yahoo donde coinciden (2023-2026)
  python estudio_sec.py backtest    ejecuta la estrategia y escribe resultados/estudio_sec.json
"""
import json
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

import estrategias_deepvalue as DV
import investigar as IV
from bt import estadistica as S
from bt import fund_global as FG
from bt import fund_sec as FS
from bt.motor_global import benchmark_equiponderado, ejecutar, fechas_revision

RES = Path(__file__).resolve().parent / "resultados"
ELEGIDA = next(c for c in json.loads((Path(__file__).resolve().parent / "estrategias_elegidas.json").read_text(encoding="utf-8"))
               if c["id"] == "fundamental")
INICIO = "2010-07-01"
EDAD = 460          # días máximos entre el cierre de unas cuentas y su uso (anuales de extranjeras + retraso)
TRAMOS = {"2010-2022 (nunca vistos al diseñarla)": ("2010-07-01", "2022-12-31"),
          "2023-2024 (periodo de diseño)": ("2023-04-03", "2024-12-31"),
          "2025-hoy (años no vistos)": ("2025-01-01", None),
          "Todo 2010-hoy": ("2010-07-01", None)}


def validar():
    d, ind, regimen, costes = IV.preparar()
    fechas = pd.DatetimeIndex(sorted(fechas_revision(d.close.loc["2023-06-01":].index)))[::4]
    ry, _ = FG.ratios(d, fechas, ind)
    rs, _ = FG.ratios(d, fechas, ind, FS.leer_todo, max_edad=EDAD)
    m = ry.merge(rs, on=["fecha", "ticker"], suffixes=("_y", "_s"))
    m = m[m["zona_y"] == "EE. UU."]
    filas = []
    for c in ["cap_eur", "per", "pb", "ev_ebitda", "roe", "margen_neto"]:
        x = m[[f"{c}_y", f"{c}_s"]].replace([np.inf, -np.inf], np.nan).dropna()
        if not len(x):
            continue
        rel = (x[f"{c}_s"] / x[f"{c}_y"]).replace([np.inf, -np.inf], np.nan).dropna()
        filas.append({"ratio": c, "pares": len(x), "spearman": x[f"{c}_y"].rank().corr(x[f"{c}_s"].rank()),
                      "mediana_sec_entre_yahoo": rel.median(), "dentro_20pct": (rel.sub(1).abs() <= 0.2).mean()})
    t = pd.DataFrame(filas)
    print(t.round(3).to_string())
    cobertura = rs.groupby(rs["fecha"].dt.year)["ticker"].nunique()
    print("Empresas con ratios SEC por año (muestra de fechas):", cobertura.to_dict())
    t.to_csv(RES / "validacion_sec_vs_yahoo.csv", index=False)


def backtest():
    from publicar import construir
    t0 = time.time()
    d, ind, regimen, costes = IV.preparar()
    extra, info, malos = IV.preparar_fundamentales(d, ind, desde="2010-01-01", lector=FS.leer_todo, max_edad=EDAD)
    IV.log(f"Fundamentales SEC listos ({time.time() - t0:.0f}s); {len(malos)} excluidos por nº de acciones dudoso")
    salida = {"parametros": ELEGIDA["parametros"], "inicio": INICIO, "tramos": {}, "anual": {}}
    variantes = {"SEC · solo EE. UU.": dict(zona="eeuu")}
    for nombre, cambio in variantes.items():
        cfg = json.loads(json.dumps(ELEGIDA))
        cfg["parametros"].update(cambio)
        est = construir(cfg)
        est.inicio = INICIO
        est.fin_entrenamiento = "2022-12-31"
        res = ejecutar(est, d, ind, costes, DV.COLUMNAS_DV, extra, regimen)
        ew = benchmark_equiponderado(ind, INICIO, None, est.liquidez_min)
        sp = d.sp500_eur
        tr = {}
        for t, (a, b) in TRAMOS.items():
            m = S.metricas_vs(res.equity, sp, a, b)
            me = S.metricas_vs(res.equity, ew, a, b)
            o = res.operaciones
            o = o[(o["fecha_entrada"] >= pd.Timestamp(a)) & (o["fecha_entrada"] <= (pd.Timestamp(b) if b else o["fecha_entrada"].max()))]
            c = o[o["motivo_salida"] != "abierta"]
            tr[t] = {"cagr": m["cagr"], "cagr_sp500": m["cagr_bench"], "exceso": m["exceso"], "t": m["t"], "sharpe": m["sharpe"],
                     "sharpe_sp500": m["sharpe_bench"], "maxdd": m["maxdd"], "cagr_equiponderada": me["cagr_bench"],
                     "ops_anio": len(o) / m["anios"] if m["anios"] else None, "aciertos": float((c["rentabilidad"] > 0).mean()) if len(c) else None,
                     "dias_medios": float(c["dias"].mean()) if len(c) else None, "exposicion": float(res.exposicion.loc[a:b].mean())}
            IV.log(f"{nombre} | {t}: {m['cagr']:.1%} vs S&P {m['cagr_bench']:.1%} (t={m['t']:.2f}) | Sharpe {m['sharpe']:.2f} vs "
                   f"{m['sharpe_bench']:.2f} | caída {m['maxdd']:.1%} | equiponderada {me['cagr_bench']:.1%}")
        anual = res.equity.resample("YE").last()
        anual = pd.concat([pd.Series([res.equity.iloc[0]], index=[res.equity.index[0]]), anual]).pct_change().dropna()
        spa = sp.reindex(res.equity.index).ffill().resample("YE").last()
        spa = pd.concat([pd.Series([sp.reindex(res.equity.index).ffill().iloc[0]], index=[res.equity.index[0]]), spa]).pct_change().dropna()
        salida["tramos"][nombre] = tr
        salida["anual"][nombre] = {str(k.year): [round(float(v), 4), round(float(spa.get(k, np.nan)), 4)] for k, v in anual.items()}
        res.operaciones.to_csv(RES / "estudio_sec_operaciones.csv", index=False)
        res.equity.to_csv(RES / "estudio_sec_equity.csv")
        # cuántas empresas había para elegir cada año (cobertura de las cuentas SEC)
        cob = {str(f.year): int(len(t)) for f, t in sorted(extra.items()) if f.month == 6 and f.day <= 7}
        salida["cobertura_empresas_junio"] = cob
    (RES / "estudio_sec.json").write_text(json.dumps(salida, ensure_ascii=False, indent=1, default=float), encoding="utf-8")
    IV.log(f"Hecho en {time.time() - t0:.0f}s: resultados/estudio_sec.json")


if __name__ == "__main__":
    {"validar": validar, "backtest": backtest}[sys.argv[1]]()
