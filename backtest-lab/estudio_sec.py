"""
Valor + momentum con las cuentas de la SEC (EE. UU., desde 2010): ¿funcionaba la idea antes de 2023?

La estrategia se diseñó mirando abril 2023 - diciembre 2024 con cuentas de Yahoo (todo el mundo). Aquí se ejecuta
EXACTAMENTE con los mismos parámetros, pero solo en EE. UU. y con las cuentas de la SEC, desde julio de 2010.
Los años 2010-2022 nunca se usaron para diseñarla: son una prueba fuera de muestra "hacia atrás".

  python estudio_sec.py validar     compara los ratios SEC con los de Yahoo donde coinciden (2023-2026)
  python estudio_sec.py backtest    ejecuta la estrategia y escribe resultados/estudio_sec.json
  python estudio_sec.py rejilla     REENTRENA: ~90 variantes grandes de todas las familias de valor, elegidas SOLO con
                                    2010-2018; las finalistas se miden en 2019-hoy -> resultados/rejilla_sec.csv/json
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


FIN_ENTRENO = "2018-12-31"


def variantes():
    """Variaciones GRANDES (no ajuste fino) de cada familia de valor, todas en EE. UU."""
    import itertools
    from estrategias_global import fundamental
    for n, pm, tend, liq, salir in itertools.product([20, 40], [0.0, 0.3, 0.5, 0.7], [True, False], [2e6, 50e6], [False, True]):
        if salir and not tend:
            continue
        e = DV.valor_momentum(n, pm, liq, "eeuu", tend)
        if salir:
            e.vender_si_mercado_bajista = True
            e.filtro_mercado = True
            e.parametros["salir"] = True
        yield "valor_momentum", e
    for n, tend in itertools.product([20, 40], [False, True]):
        yield "acquirer", DV.acquirers_multiple(n, tend, "eeuu")
        yield "magica", DV.formula_magica(n, tend, "eeuu")
    for n, fmin, tend in itertools.product([20, 40], [5, 6], [False, True]):
        yield "piotroski", DV.piotroski(n, fmin, 0.2, tend, "eeuu")
    for k, rentable, tend in itertools.product([1.0, 1.5], [False, True], [False, True]):
        yield "netnet", DV.net_net(k, 30, 5e5, rentable, tend)
    for n, umbral, tend in itertools.product([20, 40], [0.8, 0.9], [False, True]):
        yield "extremo", DV.extremo_sectorial(n, umbral, 3.0, tend, "eeuu")
    for n, decil in itertools.product([20, 40], [0.1, 0.2]):
        yield "giro", DV.valor_giro(n, decil, "eeuu")
    for pesos, tend, n in itertools.product(["valor", "calidad_barata", "equilibrado", "calidad_momentum"], [True, False], [20, 40]):
        yield "fundamental", fundamental(pesos, tend, n, 2.0, 4.0, 0.0)


def rejilla():
    from estrategias_global import COLUMNAS_FUND
    t0 = time.time()
    d, ind, regimen, costes = IV.preparar()
    extra = IV.preparar_fundamentales(d, ind, desde="2010-01-01", lector=FS.leer_todo, max_edad=EDAD)[0]
    filas, ew = [], {}
    ruta = RES / "rejilla_sec.csv"
    for i, (fam, est) in enumerate(variantes()):
        est.inicio, est.fin_entrenamiento = INICIO, FIN_ENTRENO
        if est.liquidez_min not in ew:
            ew[est.liquidez_min] = benchmark_equiponderado(ind, INICIO, FIN_ENTRENO, est.liquidez_min)
        cols = COLUMNAS_FUND + ["es_eeuu"] if fam == "fundamental" else DV.COLUMNAS_DV
        if fam == "fundamental":                         # la nota compuesta no tiene filtro de zona: se le pone aquí
            entrada, mantener = est.entrada, est.mantener
            est.entrada = lambda t, f=entrada: f(t[t["es_eeuu"].fillna(False).astype(bool)])
            est.mantener = lambda t, f=mantener: f(t[t["es_eeuu"].fillna(False).astype(bool)])
        _, fila = IV.evaluar_entreno(est, d, ind, regimen, costes, cols, extra, ew[est.liquidez_min])
        fila["familia"] = fam
        fila["nombre"] = est.nombre
        filas.append(fila)
        pd.DataFrame(filas).to_csv(ruta, index=False)
        IV.log(f"{i + 1} {fam} {est.parametros}: {fila['cagr']:.1%} vs S&P {fila['cagr_sp500']:.1%} | Sharpe {fila['sharpe']:.2f} "
               f"| IR {fila['ir_sp500']:.2f} | {fila['compras_anio']:.0f}/año")
    df = pd.DataFrame(filas)
    df["sharpe_deflactado_ir"] = [S.sharpe_deflactado(x, int(w), df["ir_sp500"].tolist()) for x, w in zip(df["ir_sp500"], df["semanas"])]
    df.to_csv(ruta, index=False)
    IV.log(f"Rejilla hecha en {time.time() - t0:.0f}s")


def finalistas(k=5):
    """Las k mejores SOLO por entrenamiento (IR frente al S&P 2010-2018); ahora sí se miran en 2019-hoy."""
    from estrategias_global import COLUMNAS_FUND
    rej = pd.read_csv(RES / "rejilla_sec.csv")
    top = rej.sort_values("ir_sp500", ascending=False).head(k).index.tolist()
    vs = list(variantes())
    d, ind, regimen, costes = IV.preparar()
    extra = IV.preparar_fundamentales(d, ind, desde="2010-01-01", lector=FS.leer_todo, max_edad=EDAD)[0]
    sp = d.sp500_eur
    out = []
    for pos, i in enumerate(top):
        fam, est = vs[i]
        est.inicio, est.fin_entrenamiento = INICIO, FIN_ENTRENO
        cols = COLUMNAS_FUND + ["es_eeuu"] if fam == "fundamental" else DV.COLUMNAS_DV
        res = ejecutar(est, d, ind, costes, cols, extra, regimen)
        ew = benchmark_equiponderado(ind, INICIO, None, est.liquidez_min)
        tramos = {}
        for t, (a, b) in {"entreno": (INICIO, FIN_ENTRENO), "validacion": ("2019-01-01", None), "todo": (INICIO, None)}.items():
            m = S.metricas_vs(res.equity, sp, a, b)
            o = res.operaciones
            o = o[(o["fecha_entrada"] >= pd.Timestamp(a)) & ((o["fecha_entrada"] <= pd.Timestamp(b)) if b else True)]
            c = o[o["motivo_salida"] != "abierta"]
            tramos[t] = {"cagr": m["cagr"], "cagr_sp500": m["cagr_bench"], "exceso": m["exceso"], "t": m["t"], "sharpe": m["sharpe"],
                         "sharpe_sp500": m["sharpe_bench"], "maxdd": m["maxdd"], "cagr_equiponderada": S.metricas_vs(res.equity, ew, a, b)["cagr_bench"],
                         "ops_anio": len(o) / m["anios"], "aciertos": float((c["rentabilidad"] > 0).mean()) if len(c) else None,
                         "dias_medios": float(c["dias"].mean()) if len(c) else None}
        anual = res.equity.resample("YE").last()
        anual = pd.concat([pd.Series([res.equity.iloc[0]], index=[res.equity.index[0]]), anual]).pct_change().dropna()
        spa = sp.reindex(res.equity.index).ffill()
        spa = pd.concat([pd.Series([spa.iloc[0]], index=[spa.index[0]]), spa.resample("YE").last()]).pct_change().dropna()
        out.append({"puesto_entreno": pos + 1, "familia": fam, "nombre": est.nombre, "parametros": est.parametros, "reglas": est.reglas,
                    "tramos": tramos, "anual": {str(k_.year): [round(float(v), 4), round(float(spa.get(k_, np.nan)), 4)] for k_, v in anual.items()},
                    "deflactado_entreno": float(rej.loc[i, "sharpe_deflactado_ir"])})
        e, v = tramos["entreno"], tramos["validacion"]
        IV.log(f"#{pos + 1} {fam} {est.parametros}: ent {e['cagr']:.1%} vs {e['cagr_sp500']:.1%} | VAL {v['cagr']:.1%} vs S&P "
               f"{v['cagr_sp500']:.1%} (t={v['t']:.2f}) Sharpe {v['sharpe']:.2f} vs {v['sharpe_sp500']:.2f} DD {v['maxdd']:.0%}")
        res.equity.to_csv(RES / f"finalista_{pos + 1}_equity.csv")
    (RES / "rejilla_sec.json").write_text(json.dumps({"elegida": out[0], "finalistas": out, "variantes": len(rej),
                                                      "fin_entreno": FIN_ENTRENO}, ensure_ascii=False, indent=1, default=float),
                                          encoding="utf-8")


IMPUESTO = 0.26375          # Abgeltungsteuer + Soli en Alemania (sin iglesia)


def despues_de_impuestos(equity: pd.Series, ops: pd.DataFrame, tr: pd.DataFrame, liquidar=True):
    """Patrimonio de un tramo tras pagar cada año el impuesto alemán sobre las ganancias realizadas (las pérdidas se
    compensan con años siguientes). Lo que ya se tenía al empezar el tramo cuenta como comprado ese día, y al final
    (liquidar=True) se vende todo y también se paga por esas ganancias."""
    a, b = equity.index[0], equity.index[-1]
    eq = equity.copy()
    if ops.empty:
        return eq
    def valor(op, dia):
        s = tr[op.ticker].loc[:dia].dropna()
        e = tr[op.ticker].loc[:op.fecha_entrada].dropna()
        return op.coste_total * s.iloc[-1] / e.iloc[-1] if len(s) and len(e) else np.nan
    gan_anio, latente = {}, 0.0
    for op in ops.itertuples():
        salida = op.fecha_salida if pd.notna(op.fecha_salida) else None
        if op.fecha_entrada > b or (salida is not None and salida < a):
            continue
        base = op.coste_total if op.fecha_entrada >= a else valor(op, a)
        if salida is not None and salida <= b:
            g = op.importe_salida - base
            gan_anio[salida.year] = gan_anio.get(salida.year, 0.0) + g
        else:
            latente += valor(op, b) - base
    factor, perdidas, acumulado = pd.Series(1.0, index=eq.index), 0.0, 1.0
    for anio in sorted(set(eq.index.year)):
        g = gan_anio.get(anio, 0.0) - perdidas
        perdidas = max(0.0, -g)
        impuesto = max(0.0, g) * IMPUESTO
        fin = eq[eq.index.year == anio]
        if len(fin) and impuesto > 0:
            acumulado *= 1 - impuesto / (fin.iloc[-1] * acumulado)
        factor[eq.index.year > anio] = acumulado
    out = eq * factor
    if liquidar:
        out.iloc[-1] -= max(0.0, latente - perdidas) * IMPUESTO * factor.iloc[-1]
    return out


def sp500_despues_de_impuestos(sp: pd.Series):
    """ETF de acumulación comprado al principio y vendido al final (se paga solo al vender, sin exención parcial)."""
    out = sp.copy()
    out.iloc[-1] = sp.iloc[0] + (sp.iloc[-1] - sp.iloc[0]) * (1 - IMPUESTO)
    return out


RONDAS = {"fondos": "rejilla", "tendencia": "rejilla_3", "clon": "rejilla_4"}
INICIO_RONDA = {"clon": "2014-03-03"}       # los 13F estructurados empiezan a mediados de 2013


def rejilla_fondos(ronda="fondos"):
    """Ideas de gestores de valor famosos (estrategias_fondos.py), elegidas SOLO con 2010-2018."""
    import estrategias_fondos as EF
    from bt import fund_largo as FL
    t0 = time.time()
    d, ind, regimen, costes = IV.preparar()
    extra = IV.preparar_fundamentales(d, ind, desde="2010-01-01", lector=FS.leer_todo, max_edad=EDAD)[0]
    fotos, _ = FS.leer_todo()
    extra = FL.anadir_a_extra(extra, fotos, d, ind)
    if ronda == "clon":
        from bt import clon13f
        extra = clon13f.anadir_a_extra(extra, d.close.columns)
    inicio = INICIO_RONDA.get(ronda, INICIO)
    IV.log(f"Rasgos largos listos ({time.time() - t0:.0f}s)")
    ew = benchmark_equiponderado(ind, inicio, FIN_ENTRENO, 2e6)
    filas, ruta = [], RES / ("rejilla_fondos.csv" if ronda == "fondos" else f"rejilla_{ronda}.csv")
    for i, (fam, est) in enumerate(getattr(EF, RONDAS[ronda])()):
        est.inicio, est.fin_entrenamiento = inicio, FIN_ENTRENO
        _, fila = IV.evaluar_entreno(est, d, ind, regimen, costes, DV.COLUMNAS_DV, extra, ew)
        fila.update(familia=fam, nombre=est.nombre, i=i)
        filas.append(fila)
        pd.DataFrame(filas).to_csv(ruta, index=False)
        IV.log(f"{i + 1} {fam} {est.parametros}: {fila['cagr']:.1%} vs S&P {fila['cagr_sp500']:.1%} | Sharpe {fila['sharpe']:.2f} "
               f"| IR {fila['ir_sp500']:.2f} | {fila['compras_anio']:.0f}/año")
    df = pd.DataFrame(filas)
    previas = [RES / "rejilla_sec.csv", RES / "rejilla_fondos.csv"]
    todos = df["ir_sp500"].tolist() + sum((pd.read_csv(p)["ir_sp500"].tolist() for p in previas if p.exists() and p != ruta), [])
    df["sharpe_deflactado_ir"] = [S.sharpe_deflactado(x, int(w), todos) for x, w in zip(df["ir_sp500"], df["semanas"])]
    df.to_csv(ruta, index=False)
    IV.log(f"Hecho en {time.time() - t0:.0f}s")


def finalistas_fondos(k=5, ronda="fondos"):
    """Las k mejores de la rejilla de fondos SOLO por entrenamiento; ahora se miran en 2019-hoy (con y sin impuestos)."""
    import estrategias_fondos as EF
    from bt import fund_largo as FL
    nombre = "rejilla_fondos" if ronda == "fondos" else f"rejilla_{ronda}"
    rej = pd.read_csv(RES / f"{nombre}.csv")
    top = rej.sort_values("ir_sp500", ascending=False).head(k)["i"].astype(int).tolist()
    vs = list(getattr(EF, RONDAS[ronda])())
    d, ind, regimen, costes = IV.preparar()
    extra = IV.preparar_fundamentales(d, ind, desde="2010-01-01", lector=FS.leer_todo, max_edad=EDAD)[0]
    extra = FL.anadir_a_extra(extra, FS.leer_todo()[0], d, ind)
    if ronda == "clon":
        from bt import clon13f
        extra = clon13f.anadir_a_extra(extra, d.close.columns)
    inicio = INICIO_RONDA.get(ronda, INICIO)
    sp = d.sp500_eur
    out = []
    for pos, i in enumerate(top):
        fam, est = vs[i]
        est.inicio, est.fin_entrenamiento = inicio, FIN_ENTRENO
        res = ejecutar(est, d, ind, costes, DV.COLUMNAS_DV, extra, regimen)
        tramos = {}
        for t, (a, b) in {"entreno": (inicio, FIN_ENTRENO), "validacion": ("2019-01-01", None), "todo": (inicio, None)}.items():
            m = S.metricas_vs(res.equity, sp, a, b)
            eq = res.equity.loc[a:b]
            o = res.operaciones
            o = o[(o["fecha_entrada"] >= eq.index[0]) & (o["fecha_entrada"] <= eq.index[-1])]
            c = o[o["motivo_salida"] != "abierta"]
            eq_imp = despues_de_impuestos(eq, res.operaciones, d.tr_eur)
            spt = sp.reindex(eq.index).ffill()
            anios = (eq.index[-1] - eq.index[0]).days / 365.25
            tramos[t] = {"cagr": m["cagr"], "cagr_sp500": m["cagr_bench"], "t": m["t"], "sharpe": m["sharpe"], "sharpe_sp500": m["sharpe_bench"],
                         "maxdd": m["maxdd"], "ops_anio": len(o) / anios, "aciertos": float((c["rentabilidad"] > 0).mean()) if len(c) else None,
                         "dias_medios": float(c["dias"].mean()) if len(c) else None,
                         "cagr_neto": (eq_imp.iloc[-1] / eq_imp.iloc[0]) ** (1 / anios) - 1,
                         "cagr_sp500_neto": (sp500_despues_de_impuestos(spt).iloc[-1] / spt.iloc[0]) ** (1 / anios) - 1}
        anual = res.equity.resample("YE").last()
        anual = pd.concat([pd.Series([res.equity.iloc[0]], index=[res.equity.index[0]]), anual]).pct_change().dropna()
        spa = sp.reindex(res.equity.index).ffill()
        spa = pd.concat([pd.Series([spa.iloc[0]], index=[spa.index[0]]), spa.resample("YE").last()]).pct_change().dropna()
        out.append({"puesto_entreno": pos + 1, "familia": fam, "nombre": est.nombre, "parametros": est.parametros, "reglas": est.reglas,
                    "tramos": tramos, "deflactado_entreno": float(rej.loc[rej["i"] == i, "sharpe_deflactado_ir"].iloc[0]),
                    "anual": {str(k_.year): [round(float(v), 4), round(float(spa.get(k_, np.nan)), 4)] for k_, v in anual.items()}})
        e, v = tramos["entreno"], tramos["validacion"]
        IV.log(f"#{pos + 1} {fam} {est.parametros}: ent {e['cagr']:.1%} vs {e['cagr_sp500']:.1%} | VAL {v['cagr']:.1%} vs {v['cagr_sp500']:.1%} "
               f"(t={v['t']:.2f}) Sh {v['sharpe']:.2f} vs {v['sharpe_sp500']:.2f} DD {v['maxdd']:.0%} | neto VAL {v['cagr_neto']:.1%} vs "
               f"{v['cagr_sp500_neto']:.1%} | {v['ops_anio']:.0f} ops/año, {v['dias_medios'] or 0:.0f} días")
    (RES / f"{nombre}.json").write_text(json.dumps({"finalistas": out, "variantes": len(rej)}, ensure_ascii=False, indent=1, default=float),
                                             encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) > 2:
        {"rejilla_fondos": rejilla_fondos, "finalistas_fondos": lambda: finalistas_fondos(5, sys.argv[2])}.get(
            sys.argv[1], lambda: rejilla_fondos(sys.argv[2]))() if sys.argv[1] == "finalistas_fondos" else rejilla_fondos(sys.argv[2])
        sys.exit()
    {"rejilla_fondos": rejilla_fondos, "finalistas_fondos": finalistas_fondos, "validar": validar, "backtest": backtest, "rejilla": rejilla, "finalistas": finalistas}[sys.argv[1]]()
