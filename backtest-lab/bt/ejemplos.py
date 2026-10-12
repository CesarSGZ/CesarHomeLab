"""Ejemplos didácticos para la web: operaciones reales explicadas con los datos que se vieron al decidir."""
import math

import numpy as np
import pandas as pd

from .motor_global import fechas_revision, tabla_semana

SIMBOLO = {"EUR": "€", "USD": "$", "GBp": "p", "GBP": "£", "JPY": "¥", "HKD": "HK$", "CHF": "CHF", "SEK": "kr",
           "DKK": "kr", "NOK": "kr", "PLN": "zł", "SGD": "S$", "AUD": "A$", "CAD": "C$", "MXN": "MX$"}


def _f(x, dec=4):
    try:
        x = float(x)
    except (TypeError, ValueError):
        return None
    return round(x, dec) if math.isfinite(x) else None


def _senal(fecha, revisiones):
    """Viernes (cierre) en que se decidió la operación ejecutada en `fecha`."""
    antes = revisiones[revisiones < fecha]
    return antes[-1] if len(antes) else None


def _datos(est, t, tk, precio):
    """Lo que 'vio' la estrategia de ese valor ese día, en cifras sencillas."""
    if tk not in t.index:
        return {}
    r = t.loc[tk]
    punt = est.puntuacion(t)
    if est.elegibles is not None:
        punt = punt.where(est.elegibles(t))
    puesto = punt.dropna().rank(ascending=False)
    out = {"precio": _f(precio, 2),
           "sobreMedia200": _f(r["px_local"] / r["sma200_local"] - 1) if "px_local" in r and "sma200_local" in r else None,
           "mom6m": _f(r.get("mom_6m")), "puesto": int(puesto.get(tk)) if tk in puesto.index and pd.notna(puesto.get(tk)) else None,
           "candidatas": int(puesto.notna().sum())}
    for c in ["per", "pb", "ev_ebitda", "roe", "per_rel", "pb_rel", "ev_ebitda_rel"]:
        if c in r:
            out[c] = _f(r[c], 3)
    return out


def generar(est, res, d, ind, extra, columnas):
    ops = res.operaciones
    if ops.empty:
        return {}
    cerradas = ops[ops["motivo_salida"] != "abierta"].copy()
    revisiones = pd.DatetimeIndex(sorted(fechas_revision(d.close.loc[est.inicio:].index)))
    cols = list(dict.fromkeys(columnas + ["px_local", "sma200", "mom_6m"]))
    ind = dict(ind)
    ind["sma200_local"] = ind["sma200"]            # misma escala que px_local (índice de rentabilidad local)
    cols.append("sma200_local")
    uni = d.universo
    sp = d.sp500_eur

    def tabla(fecha):
        ex = extra.get(fecha) if extra is not None else None
        return tabla_semana(fecha, ind, cols, ex)

    def explica_venta(op):
        if op["motivo_salida"] in ("abierta", "sin datos", "mercado bajista"):
            return {"abierta": "Sigue en cartera", "sin datos": "Dejó de cotizar",
                    "mercado bajista": "El S&P 500 perdió su media de 200"}[op["motivo_salida"]]
        f = _senal(op["fecha_salida"], revisiones)
        t = tabla(f)
        tk = op["ticker"]
        if tk in t.index and t.at[tk, "px_local"] < t.at[tk, "sma200_local"]:
            return "El precio cayó por debajo de su media de 200 sesiones"
        punt = est.puntuacion(t)
        if est.elegibles is not None:
            punt = punt.where(est.elegibles(t) | (t.index == tk))
        p = punt.dropna().rank(ascending=False).get(tk)
        return f"Bajó al puesto {int(p)} del ranking" if pd.notna(p) else "Dejó de cumplir las condiciones"

    def caso(op, tipo):
        tk = op["ticker"]
        f_in, f_out = op["fecha_entrada"], op["fecha_salida"] if pd.notna(op["fecha_salida"]) else d.close.index[-1]
        s_in, s_out = _senal(f_in, revisiones), _senal(f_out, revisiones) if pd.notna(op["fecha_salida"]) else None
        c = d.close[tk].dropna()
        div = uni.at[tk, "divisa"] if tk in uni.index else "EUR"
        i0 = max(0, c.index.searchsorted(f_in) - 130)
        i1 = min(len(c), c.index.searchsorted(f_out) + 65)
        serie = c.iloc[i0:i1]
        paso = max(1, len(serie) // 260)
        serie = serie.iloc[::paso]
        p_in = d.open.at[f_in, tk] if np.isfinite(d.open.at[f_in, tk]) else c.loc[:f_in].iloc[-1]
        p_out = (d.open.at[f_out, tk] if pd.notna(op["fecha_salida"]) and np.isfinite(d.open.at[f_out, tk]) else c.loc[:f_out].iloc[-1])
        sp_ret = sp.loc[:f_out].dropna().iloc[-1] / sp.loc[:f_in].dropna().iloc[-1] - 1
        return {
            "tipo": tipo, "ticker": tk, "nombre": str(uni.at[tk, "nombre"])[:40] if tk in uni.index else tk,
            "zona": str(uni.at[tk, "zona"]) if tk in uni.index else "", "moneda": SIMBOLO.get(div, div),
            "serie": {"dates": [x.strftime("%Y-%m-%d") for x in serie.index], "close": [_f(v, 3) for v in serie.values]},
            "compra": {"fecha": f_in.strftime("%Y-%m-%d"), "precio": _f(p_in, 3),
                       "datos": _datos(est, tabla(s_in), tk, p_in) if s_in is not None else {}},
            "venta": {"fecha": f_out.strftime("%Y-%m-%d"), "precio": _f(p_out, 3), "abierta": pd.isna(op["fecha_salida"]),
                      "motivo": explica_venta(op)},
            "dias": int(op["dias"]), "ganancia": _f(op["rentabilidad"]),
            "subidaAccion": _f(p_out / p_in - 1), "subidaSP500": _f(sp_ret),
        }

    salida = {}
    recientes = cerradas[cerradas["fecha_entrada"] >= cerradas["fecha_entrada"].max() - pd.Timedelta(days=3 * 365)]
    recientes = recientes[recientes["dias"] >= 30]
    if len(recientes) >= 5:
        # ejemplos representativos, no los extremos: percentil 80 (ganadora típica) y 20 (perdedora típica)
        orden = recientes.sort_values("rentabilidad").reset_index(drop=True)
        salida["ganadora"] = caso(orden.iloc[int(len(orden) * 0.8)], "ganadora")
        salida["perdedora"] = caso(orden.iloc[int(len(orden) * 0.2)], "perdedora")

    # la empresa más operada: todas sus compras y ventas sobre su gráfico
    tk = ops["ticker"].value_counts().index[0]
    o = ops[ops["ticker"] == tk].sort_values("fecha_entrada")
    c = d.close[tk].dropna()
    ini = c.index.searchsorted(o["fecha_entrada"].min()) - 60
    fin = d.close.index[-1] if o["fecha_salida"].isna().any() else o["fecha_salida"].max()
    serie = c.iloc[max(0, ini): c.index.searchsorted(fin) + 40]
    paso = max(1, len(serie) // 400)
    serie = serie.iloc[::paso]
    compuesto = float(np.prod(1 + o["rentabilidad"].values) - 1)
    div = uni.at[tk, "divisa"] if tk in uni.index else "EUR"
    salida["repetida"] = {
        "ticker": tk, "nombre": str(uni.at[tk, "nombre"])[:40] if tk in uni.index else tk, "moneda": SIMBOLO.get(div, div),
        "serie": {"dates": [x.strftime("%Y-%m-%d") for x in serie.index], "close": [_f(v, 3) for v in serie.values]},
        "operaciones": [{"in": r.fecha_entrada.strftime("%Y-%m-%d"),
                         "out": None if pd.isna(r.fecha_salida) else r.fecha_salida.strftime("%Y-%m-%d"),
                         "ret": _f(r.rentabilidad)} for r in o.itertuples()],
        "gananciaEstrategia": _f(compuesto),
        "subidaAccion": _f(serie.iloc[-1] / serie.iloc[0] - 1),
    }

    # resumen de con qué se ha operado
    zonas = ops["ticker"].map(uni["zona"]).value_counts()
    top = ops.groupby("ticker")["rentabilidad"].agg(["count", lambda x: float(np.prod(1 + x) - 1)])
    top.columns = ["n", "total"]
    top = top.sort_values("n", ascending=False).head(10)
    salida["resumen"] = {
        "operaciones": int(len(ops)), "empresas": int(ops["ticker"].nunique()),
        "ganadoras": _f((cerradas["rentabilidad"] > 0).mean()),
        "mediaGanadora": _f(cerradas.loc[cerradas["rentabilidad"] > 0, "rentabilidad"].mean()),
        "mediaPerdedora": _f(cerradas.loc[cerradas["rentabilidad"] <= 0, "rentabilidad"].mean()),
        "diasMedios": _f(cerradas["dias"].mean(), 0),
        "zonas": {str(k): int(v) for k, v in zonas.items()},
        "masUsadas": [{"ticker": t_, "nombre": str(uni.at[t_, "nombre"])[:30] if t_ in uni.index else t_,
                       "n": int(r.n), "total": _f(r.total)} for t_, r in top.iterrows()],
    }
    return salida
