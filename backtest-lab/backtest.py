"""
Lanza todo: validacion de datos, ratios historicos, backtests, benchmarks e informe.

Uso:
    python backtest.py                         (todo; informe HTML en resultados/informe.html)
    python backtest.py --sin-rejilla           (reutiliza la seleccion de parametros ya hecha)
    python backtest.py --params p.json         (parametros cambiados, p. ej. desde la web)
    python backtest.py --web salida.json       (ademas, JSON compacto para Mission Control)
    python backtest.py --sin-informe           (no genera el HTML)

Formato de --params (todo opcional):
    {"vct": {"n": 12, "holgura": 1.15, "dn_max": 3, "liquidez_min": 1000000, "capital": 50000},
     "momentum": {"modo": "auto" | "manual", "n": 15, "momentum": "mom_3m", "banda": 2.5, ...}}
"""
import argparse
import json
import time
from pathlib import Path

import pandas as pd

import estrategias as E
from bt import datos as D
from bt import fundamentales as F
from bt.metricas import metricas, rentabilidad_anual, tramo
from bt.motor import benchmark_equiponderado, benchmark_ibex, ejecutar, fechas_revision
from bt.senales import indicadores_precio

RES = Path(__file__).resolve().parent / "resultados"
RES.mkdir(exist_ok=True)


def log(m):
    print(f"[{time.strftime('%H:%M:%S')}] {m}", flush=True)


def validar_parametros(bruto: dict) -> dict:
    """Solo deja pasar parametros conocidos y dentro de limites (vienen de la web)."""
    limpio = {"vct": {}, "momentum": {}}
    for est, reglas in E.PARAMETROS_WEB.items():
        for k, v in (bruto or {}).get(est, {}).items():
            if k not in reglas:
                continue
            tipo, *lim = reglas[k]
            if tipo is str:
                if v in lim[0]:
                    limpio[est][k] = v
            else:
                try:
                    x = tipo(v)
                except (TypeError, ValueError):
                    continue
                if lim[0] <= x <= lim[1]:
                    limpio[est][k] = x
    modo = (bruto or {}).get("momentum", {}).get("modo", "auto")
    limpio["momentum_modo"] = "manual" if modo == "manual" else "auto"
    return limpio


def evaluar(res, p, ind):
    """Metricas de estrategia y benchmarks en periodo completo, entrenamiento y validacion."""
    est = res.estrategia
    eq = res.equity / res.equity.iloc[0]
    ini, fin_tr = eq.index[0], pd.Timestamp(est.fin_entrenamiento)
    bm = {
        "IBEX 35 con dividendos (ETF)": benchmark_ibex(p, ini, None).reindex(eq.index).ffill(),
        "Equiponderada universo": benchmark_equiponderado(p, ind, ini, None, est.liquidez_min).reindex(eq.index).ffill(),
    }
    tramos = {"Completo": (None, None), "Entrenamiento": (None, fin_tr),
              "Validacion (fuera de muestra)": (fin_tr + pd.Timedelta(days=1), None)}
    tabla = {}
    for nt, (a, b) in tramos.items():
        tabla[(nt, "Estrategia")] = metricas(tramo(eq, a, b), res.exposicion, res.operaciones)
        for nb, s in bm.items():
            tabla[(nt, nb)] = metricas(tramo(s, a, b))
    anual = rentabilidad_anual({"Estrategia": eq, **bm})
    return eq, bm, tabla, anual


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--params")
    ap.add_argument("--web")
    ap.add_argument("--origen", default="local")
    ap.add_argument("--sin-rejilla", action="store_true")
    ap.add_argument("--sin-informe", action="store_true")
    args = ap.parse_args()
    params = validar_parametros(json.loads(Path(args.params).read_text(encoding="utf-8")) if args.params else {})
    log(f"Parametros: {params}")

    t0 = time.time()
    log("Cargando precios y validando...")
    p = D.cargar_precios()
    info = D.cargar_info()
    calidad = D.validar_precios(p)
    calidad.to_csv(RES / "calidad_precios.csv")
    correcciones = pd.DataFrame(D.CORRECCIONES)
    anomalos = D.dias_anomalos(p)
    ind = indicadores_precio(p.adj_close, p.close, p.efectivo, anomalos)

    log("Reconstruyendo fundamentales point-in-time...")
    fotos = F.construir_fotos()
    control = F.control_capitalizacion(fotos, p, info)
    cobertura = F.resumen_cobertura(fotos, info).join(control[["ratio", "fiable"]])
    cobertura.to_csv(RES / "cobertura_fundamentales.csv")
    fiables = set(control.index[control["fiable"]])
    fotos_ok = fotos[fotos["ticker"].isin(fiables)]
    rev = fechas_revision(p.close.loc["2021-06-01":].index)
    ratios = F.ratios_diarios(fotos_ok, p, info, fechas=rev)
    ratios_por_fecha = {d: g.set_index("ticker") for d, g in ratios.groupby("fecha")}
    cob_temporal = ratios.groupby("fecha").apply(
        lambda g: pd.Series({"con_PER": g["per"].notna().sum(), "con_EV_EBITDA": g["ev_ebitda"].notna().sum()}))

    resultados = {}

    # --- 1) estrategia fundamental
    est = E.valor_calidad_tendencia(**params["vct"])
    log(f"Backtest: {est.nombre} desde {est.inicio}...")
    r = ejecutar(est, p, ind, info, ratios_por_fecha)
    resultados["vct"] = (r, *evaluar(r, p, ind))

    # --- 2) estrategia de precio
    pm = dict(params["momentum"])
    comunes = {k: v for k, v in pm.items() if k in ("banda", "liquidez_min", "capital")}
    rejilla = []
    if params["momentum_modo"] == "manual":
        e = E.tendencia_momentum(**pm)
        log(f"Momentum en modo manual: {e.parametros}")
        rr = ejecutar(e, p, ind, info)
        resultados["momentum"] = (rr, *evaluar(rr, p, ind))
    else:
        # rejilla SOLO en entrenamiento, eleccion por Sharpe; la validacion no se usa para elegir
        ruta_rejilla = RES / "rejilla_precio.json"
        if args.sin_rejilla and ruta_rejilla.exists() and not comunes:
            rejilla = json.loads(ruta_rejilla.read_text())
        else:
            for prm in E.REJILLA_PRECIO:
                e = E.tendencia_momentum(**prm, **comunes)
                log(f"Rejilla (solo entrenamiento): {e.nombre}")
                rr = ejecutar(e, p, ind, info, fin=e.fin_entrenamiento)
                m = metricas(rr.equity, rr.exposicion, rr.operaciones)
                rejilla.append({**prm, "Sharpe entrenamiento": m["Sharpe (rf=0)"], "CAGR entrenamiento": m["CAGR"],
                                "DD max entrenamiento": m["Drawdown maximo"], "Oper./anio": m["Operaciones/anio"]})
            if not comunes:
                ruta_rejilla.write_text(json.dumps(rejilla, indent=1))
        elegido = max(rejilla, key=lambda x: x["Sharpe entrenamiento"])
        prm = {"n": elegido["n"], "momentum": elegido["momentum"]}
        for fila in rejilla:
            e = E.tendencia_momentum(n=fila["n"], momentum=fila["momentum"], **comunes)
            rr = ejecutar(e, p, ind, info)
            m = metricas(tramo(rr.equity, pd.Timestamp(e.fin_entrenamiento) + pd.Timedelta(days=1)))
            fila["Sharpe validacion"] = m["Sharpe (rf=0)"]
            fila["CAGR validacion"] = m["CAGR"]
            fila["elegida"] = fila["n"] == prm["n"] and fila["momentum"] == prm["momentum"]
            if fila["elegida"]:
                resultados["momentum"] = (rr, *evaluar(rr, p, ind))
        log(f"Parametros elegidos en entrenamiento: {prm}")

    for clave, (res, *_) in resultados.items():
        if not res.operaciones.empty:
            res.operaciones.to_csv(RES / f"operaciones_{clave}.csv", index=False)

    if not args.sin_informe:
        from bt import informe
        log("Generando informe...")
        informe.generar(RES / "informe.html", resultados, rejilla, calidad, correcciones, cobertura,
                        cob_temporal, control, p, info)
    if args.web:
        from bt import web
        tam = web.exportar(args.web, resultados, rejilla, calidad, cobertura, control, p, params, args.origen)
        log(f"JSON web: {args.web} ({tam / 1024:.0f} KB)")

    lineas = []
    for clave, (res, eq, bm, tabla, anual) in resultados.items():
        lineas.append(f"== {res.estrategia.nombre}")
        df = pd.DataFrame(tabla).T[["CAGR", "Volatilidad", "Sharpe (rf=0)", "Drawdown maximo",
                                    "Operaciones/anio", "% aciertos", "Exposicion media"]]
        lineas.append(df.to_string(float_format=lambda x: f"{x:.3f}"))
        lineas.append(f"Costes totales: {res.costes_totales:,.0f} EUR")
    (RES / "metricas.txt").write_text("\n".join(lineas), encoding="utf-8")
    print("\n".join(lineas))
    log(f"Hecho en {time.time() - t0:.0f} s")


if __name__ == "__main__":
    main()
