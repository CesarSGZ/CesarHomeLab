"""
Búsqueda de estrategias con disciplina anti-sobreajuste.

  python investigar.py precio        prueba la rejilla de estrategias de precio/volumen SOLO en 2008-2018
  python investigar.py fundamentales prueba la rejilla de fundamentales SOLO en abr-2023 a dic-2024
  python investigar.py validar       evalúa UNA vez las finalistas elegidas en el periodo no visto

Todo lo probado queda en resultados/investigacion_*.csv (también lo que sale mal).
"""
import json
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

import estrategias_global as EG
from bt import estadistica as S
from bt import global_datos as GD
from bt import indicadores as I
from bt.motor_global import benchmark_equiponderado, ejecutar

RES = Path(__file__).resolve().parent / "resultados"
RES.mkdir(exist_ok=True)
REGLA_SELECCION = ("Mayor ratio de información frente al S&P 500 (EUR) en entrenamiento, con 12-250 compras/año "
                   "y caída máxima mejor que -50 %. Una finalista por familia.")


def log(m):
    print(f"[{time.strftime('%H:%M:%S')}] {m}", flush=True)


def preparar():
    t0 = time.time()
    d = GD.cargar()
    log(f"Datos: {d.close.shape[1]} valores, {d.close.shape[0]} sesiones ({time.time() - t0:.0f}s)")
    ind = I.calcular(d)
    sp = d.sp500_eur.ffill()
    regimen = (sp > sp.rolling(200, min_periods=180).mean())
    costes = GD.tabla_costes(d.universo)
    log(f"Indicadores listos ({time.time() - t0:.0f}s)")
    return d, ind, regimen, costes


def evaluar_entreno(est, d, ind, regimen, costes, columnas, extra=None, ew=None):
    r = ejecutar(est, d, ind, costes, columnas, extra, regimen, fin=est.fin_entrenamiento)
    eq = r.equity
    m = S.metricas_vs(eq, d.sp500_eur)
    m_ew = S.metricas_vs(eq, ew) if ew is not None else {}
    anios = m["anios"]
    return r, {**{k: v for k, v in est.parametros.items()}, "familia": est.familia,
               "cagr": m["cagr"], "cagr_sp500": m["cagr_bench"], "exceso_sp500": m["exceso"],
               "sharpe": m["sharpe"], "sharpe_sp500": m["sharpe_bench"], "ir_sp500": m["ir"], "t_sp500": m["t"],
               "maxdd": m["maxdd"], "exceso_universo": m_ew.get("exceso"), "t_universo": m_ew.get("t"),
               "compras_anio": len(r.operaciones) / anios if anios else np.nan,
               "aciertos": (r.operaciones["rentabilidad"] > 0).mean() if len(r.operaciones) else np.nan,
               "exposicion": r.exposicion.mean(), "semanas": m["semanas"]}


def buscar(familias, nombre, columnas, extra=None):
    d, ind, regimen, costes = preparar()
    filas = []
    ruta = RES / f"investigacion_{nombre}.csv"
    ew = None
    for i, est in enumerate(familias):
        if ew is None:
            ew = benchmark_equiponderado(ind, est.inicio, est.fin_entrenamiento, est.liquidez_min)
        t0 = time.time()
        _, fila = evaluar_entreno(est, d, ind, regimen, costes, columnas, extra, ew)
        filas.append(fila)
        log(f"{i + 1}: {EG.descripcion(est)} -> CAGR {fila['cagr']:.1%} vs S&P {fila['cagr_sp500']:.1%} | "
            f"Sharpe {fila['sharpe']:.2f} | IR {fila['ir_sp500']:.2f} | {fila['compras_anio']:.0f}/año | {time.time() - t0:.0f}s")
        pd.DataFrame(filas).to_csv(ruta, index=False)
    df = pd.DataFrame(filas)
    df["sharpe_deflactado_ir"] = [S.sharpe_deflactado(x, int(s), df["ir_sp500"].tolist())
                                  for x, s in zip(df["ir_sp500"], df["semanas"])]
    df.to_csv(ruta, index=False)
    return df


def preparar_fundamentales(d, ind, desde="2022-06-01"):
    """dict fecha -> tabla (ticker) con ratios point-in-time, métricas de precio y percentiles sectoriales."""
    from bt import fund_global as FG
    from bt.motor_global import fechas_revision
    fechas = pd.DatetimeIndex(sorted(fechas_revision(d.close.loc[desde:].index)))
    r, info = FG.ratios(d, fechas, ind)
    hoy = r[r["fecha"] == r["fecha"].max()]
    fiable = FG.control_cap(hoy, info, d.universo)
    malos = set(fiable.index[~fiable])
    log(f"Fundamentales: {r['ticker'].nunique()} valores con cuentas; {len(malos)} excluidos por nº de acciones dudoso")
    r = r[~r["ticker"].isin(malos)]
    ret = ind["px"].pct_change(fill_method=None)
    beta = I.beta_frente(ret.loc[pd.Timestamp(desde) - pd.Timedelta(days=420):], d.sp500_eur.pct_change())
    extra = {}
    for fecha, g in r.groupby("fecha"):
        g = g.set_index("ticker")
        g["volat_1a"] = ind["volat_1a"].loc[fecha].reindex(g.index)
        g["sharpe_1a"] = ind["sharpe_1a"].loc[fecha].reindex(g.index)
        g["beta_1a"] = beta.loc[fecha].reindex(g.index) if fecha in beta.index else np.nan
        extra[fecha] = FG.relativos(g)
    return extra, info, malos


def buscar_fundamentales(familias=None, nombre="fundamentales", columnas=None):
    d, ind, regimen, costes = preparar()
    extra, info, malos = preparar_fundamentales(d, ind)
    familias = familias if familias is not None else list(EG.rejilla_fundamental())
    columnas = columnas or EG.COLUMNAS_FUND
    filas, ruta, ew = [], RES / f"investigacion_{nombre}.csv", None
    for i, est in enumerate(familias):
        if ew is None:
            ew = benchmark_equiponderado(ind, est.inicio, est.fin_entrenamiento, est.liquidez_min)
        t0 = time.time()
        _, fila = evaluar_entreno(est, d, ind, regimen, costes, columnas, extra, ew)
        filas.append(fila)
        log(f"{i + 1}: {EG.descripcion(est)} -> CAGR {fila['cagr']:.1%} vs S&P {fila['cagr_sp500']:.1%} | "
            f"Sharpe {fila['sharpe']:.2f} | IR {fila['ir_sp500']:.2f} | {fila['compras_anio']:.0f}/año | {time.time() - t0:.0f}s")
        pd.DataFrame(filas).to_csv(ruta, index=False)
    df = pd.DataFrame(filas)
    df["sharpe_deflactado_ir"] = [S.sharpe_deflactado(x, int(s), df["ir_sp500"].tolist()) for x, s in zip(df["ir_sp500"], df["semanas"])]
    df.to_csv(ruta, index=False)
    return df


PARAM_COLS = ["maximo", "rvol", "salida", "n", "filtro_mercado", "senal", "banda", "mom", "rvol_min", "caida",
              "plazo", "salir", "stop", "top_mom", "pesos", "tendencia", "deuda_max", "insiders",
              "zona", "suavidad", "max_dia", "liquidez", "k", "rentable", "fmin", "quintil", "umbral", "decil", "contr",
              "peso_mom", "banda"]


def _params(fila):
    out = {}
    for c in PARAM_COLS:
        if c in fila and pd.notna(fila[c]):
            v = fila[c]
            if isinstance(v, (np.floating, float)) and float(v).is_integer() and c in ("n", "maximo", "plazo", "stop", "top_mom", "fmin"):
                v = int(v)
            elif isinstance(v, np.bool_):
                v = bool(v)
            elif isinstance(v, np.floating):
                v = float(v)
            out[c] = v
    return out


def validar(tipo="precio"):
    """Evalúa UNA vez en el periodo no visto las finalistas (mejor de cada familia con IR>0 en entrenamiento).
    La que se publica se elige por entrenamiento, no por validación."""
    import publicar as P
    import estrategias_deepvalue as DV
    import estrategias_raras as ER
    patron = "investigacion_precio*.csv" if tipo == "precio" else "investigacion_fundamentales*.csv"
    todas = pd.concat([pd.read_csv(p) for p in sorted(RES.glob(patron))], ignore_index=True)
    n_total = len(todas)
    fin = finalistas(todas)
    fin = fin[fin["ir_sp500"] > 0] if (fin["ir_sp500"] > 0).any() else fin.head(1)
    d, ind, regimen, costes = preparar()
    extra = preparar_fundamentales(d, ind)[0] if tipo != "precio" else None
    filas = []
    for _, f in fin.iterrows():
        cfg = {"familia": f["familia"], "parametros": _params(f)}
        est = P.construir(cfg)
        cols = DV.COLUMNAS_DV + [c for c in ["mom_12_1"] if c not in DV.COLUMNAS_DV] if est.usa_fundamentales else ER.COLUMNAS_PRECIO_4
        r = ejecutar(est, d, ind, costes, cols, extra, regimen)
        desde = pd.Timestamp(est.fin_entrenamiento) + pd.Timedelta(days=1)
        m = S.metricas_vs(r.equity, d.sp500_eur, desde)
        dsr = S.sharpe_deflactado(f["ir_sp500"], int(f["semanas"]), todas["ir_sp500"].tolist())
        filas.append({**cfg, "ir_entreno": f["ir_sp500"], "cagr_entreno": f["cagr"], "sharpe_entreno": f["sharpe"],
                      "cagr_validacion": m["cagr"], "cagr_sp500_validacion": m["cagr_bench"], "sharpe_validacion": m["sharpe"],
                      "sharpe_sp500_validacion": m["sharpe_bench"], "t_validacion": m["t"], "maxdd_validacion": m["maxdd"],
                      "sharpe_deflactado": dsr, "variantes": n_total})
        log(f"VALIDACIÓN {f['familia']} {cfg['parametros']}: CAGR {m['cagr']:.1%} vs S&P {m['cagr_bench']:.1%} | "
            f"Sharpe {m['sharpe']:.2f} vs {m['sharpe_bench']:.2f} | t {m['t']:.2f} | DSR {dsr:.0%}")
    v = pd.DataFrame(filas)
    v.to_csv(RES / f"validacion_{tipo}.csv", index=False)
    elegida = v.sort_values("ir_entreno", ascending=False).iloc[0]
    return v, elegida


def finalistas(df):
    ok = df[(df["compras_anio"].between(12, 250)) & (df["maxdd"] > -0.5)]
    return ok.sort_values("ir_sp500", ascending=False).groupby("familia").head(1)


if __name__ == "__main__":
    modo = sys.argv[1] if len(sys.argv) > 1 else "precio"
    if modo == "precio":
        df = buscar(list(EG.rejilla_precio()), "precio", EG.COLUMNAS_PRECIO)
        print(finalistas(df).to_string())
    elif modo == "precio2":
        df = buscar(list(EG.rejilla_precio_2()), "precio_ronda2", EG.COLUMNAS_PRECIO)
        print(finalistas(df).to_string())
    elif modo == "precio3":
        df = buscar(list(EG.rejilla_precio_3()), "precio_ronda3", EG.COLUMNAS_PRECIO)
        print(finalistas(df).to_string())
    elif modo == "precio4":
        import estrategias_raras as ER
        df = buscar(list(ER.rejilla()), "precio_ronda4", ER.COLUMNAS_PRECIO_4)
        print(finalistas(df).to_string())
    elif modo == "deepvalue":
        import estrategias_deepvalue as DV
        df = buscar_fundamentales(list(DV.rejilla()), "fundamentales_deepvalue", DV.COLUMNAS_DV)
        print(df.sort_values("ir_sp500", ascending=False).head(10).to_string())
    elif modo == "precio5":
        import estrategias_raras as ER
        df = buscar(list(ER.rejilla_5()), "precio_ronda5", ER.COLUMNAS_PRECIO_4)
        print(finalistas(df).to_string())
    elif modo == "deepvalue2":
        import estrategias_deepvalue as DV
        df = buscar_fundamentales(list(DV.rejilla_2()), "fundamentales_deepvalue2", DV.COLUMNAS_DV)
        print(df.sort_values("ir_sp500", ascending=False).head(10).to_string())
    elif modo == "precio6":
        import estrategias_raras as ER
        df = buscar(list(ER.rejilla_6()), "precio_ronda6", ER.COLUMNAS_PRECIO_4)
        print(finalistas(df).to_string())
    elif modo == "deepvalue3":
        import estrategias_deepvalue as DV
        df = buscar_fundamentales(list(DV.rejilla_3()), "fundamentales_deepvalue3", DV.COLUMNAS_DV)
        print(df.sort_values("ir_sp500", ascending=False).head(10).to_string())
    elif modo == "validar":
        v, e = validar(sys.argv[2] if len(sys.argv) > 2 else "precio")
        print(v.to_string())
        print("ELEGIDA (por entrenamiento):", e["familia"], e["parametros"])
    elif modo == "fundamentales":
        df = buscar_fundamentales()
        print(df.sort_values("ir_sp500", ascending=False).head(10).to_string())
