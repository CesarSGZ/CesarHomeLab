"""Fundamentales globales point-in-time a partir de datos_global/fundamentales/*.json.

- Una cuenta solo se usa desde: cierre del periodo + 90 días (anual) o + 75 días (trimestral TTM).
  Sin fechas de publicación (pedirlas para 8.000 valores es inviable): retraso fijo y conservador.
- Capitalización = precio de ese día x acciones del periodo (corrigiendo splits posteriores), en EUR.
- Cuentas convertidas a EUR con el tipo de cambio de la fecha de evaluación.
- Comparación con la mediana de su sector dentro de su zona (EE. UU., Europa, Asia-Pacífico, América).
- Insiders: Yahoo solo da el % ACTUAL -> usarlo en el pasado es mirar al futuro (se marca como tal).
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

from .fundamentales import CONCEPTOS, FLUJOS
from .global_datos import DIR

RETRASO_ANUAL, RETRASO_TRIM = 90, 75
# conceptos extra para deep value (Graham, Greenblatt, Piotroski)
CONCEPTOS_EXT = {**CONCEPTOS,
                 "activo_corriente": ["Current Assets"], "pasivo_corriente": ["Current Liabilities"],
                 "activo_total": ["Total Assets"], "pasivo_total": ["Total Liabilities Net Minority Interest"],
                 "beneficio_bruto": ["Gross Profit"], "capital_invertido": ["Invested Capital"]}
FLUJOS_EXT = FLUJOS + ["beneficio_bruto"]


def _piotroski(a: pd.DataFrame) -> pd.Series:
    """F-score de Piotroski adaptado (7 de 9 criterios: Yahoo no da flujo de caja en esta descarga)."""
    a = a.sort_index()
    roa = a["beneficio"] / a["activo_total"]
    apal = a["deuda"] / a["activo_total"]
    liq = a["activo_corriente"] / a["pasivo_corriente"]
    mb = a["beneficio_bruto"] / a["ingresos"]
    rot = a["ingresos"] / a["activo_total"]
    acc = a["acciones"]
    puntos = [(roa > 0), (roa.diff() > 0), (apal.diff() < 0), (liq.diff() > 0), (acc.diff() <= 0),
              (mb.diff() > 0), (rot.diff() > 0)]
    validos = pd.concat([roa.diff(), apal.diff(), liq.diff(), mb.diff(), rot.diff()], axis=1).notna().sum(axis=1)
    f = sum(p.astype(int) for p in puntos)
    return f.where(validos >= 3)


def _tabla(estado: dict) -> pd.DataFrame:
    if not estado:
        return pd.DataFrame()
    df = pd.DataFrame(estado).T            # filas = periodos, columnas = conceptos
    df.index = pd.to_datetime(df.index)
    out = pd.DataFrame(index=df.index)
    for nombre, alias in CONCEPTOS_EXT.items():
        s = pd.Series(np.nan, index=df.index)
        for a in alias:
            if a in df.columns:
                s = s.fillna(pd.to_numeric(df[a], errors="coerce"))
        out[nombre] = s
    out["ebitda"] = out["ebitda"].fillna(out["ebit"] + out["amortizacion"])
    out["acciones"] = out["acciones"].fillna(out["acciones_medias"])
    return out.sort_index()


def leer_todo():
    fotos, info = [], {}
    for ruta in (DIR / "fundamentales").glob("*.json"):
        j = json.loads(ruta.read_text(encoding="utf-8"))
        tk = j["ticker"]
        info[tk] = j.get("info", {})
        e = j.get("estados", {})
        rs, bs = _tabla(_invertir(e.get("resultados_anual"))), _tabla(_invertir(e.get("balance_anual")))
        anual = rs.combine_first(bs) if not rs.empty else bs
        if not anual.empty:
            a = anual.dropna(subset=["beneficio"]).copy()
            a["fscore"] = _piotroski(a)
            a["tipo"], a["disponible"] = "anual", a.index + pd.Timedelta(days=RETRASO_ANUAL)
            fotos.append(a.assign(ticker=tk))
        rq, bq = _tabla(_invertir(e.get("resultados_trim"))), _tabla(_invertir(e.get("balance_trim")))
        trim = rq.combine_first(bq) if not rq.empty else pd.DataFrame()
        if len(trim) >= 4:
            ttm = []
            for i in range(3, len(trim)):
                v = trim.iloc[i - 3:i + 1]
                if not pd.Series(v.index).diff().dt.days.dropna().between(80, 100).all():
                    continue
                if v["beneficio"].isna().any() or v["ingresos"].isna().any():
                    continue
                fila = trim.iloc[i].copy()
                for c in FLUJOS_EXT:
                    fila[c] = v[c].sum(min_count=4)
                ttm.append(fila)
            if ttm:
                t = pd.DataFrame(ttm)
                if not anual.empty:   # huecos del TTM (p. ej. EBITDA) con la última cuenta anual
                    an = anual.copy()
                    an["fscore"] = _piotroski(an.dropna(subset=["beneficio"])).reindex(an.index)
                    rell = an.reindex(t.index, method="ffill")
                    t = t.fillna(rell)
                t["tipo"], t["disponible"] = "ttm", t.index + pd.Timedelta(days=RETRASO_TRIM)
                fotos.append(t.assign(ticker=tk))
    f = pd.concat(fotos).rename_axis("periodo").reset_index()
    info = pd.DataFrame.from_dict(info, orient="index")
    # Yahoo bloquea la ficha de empresa a los servidores de GitHub: se completa con la copia versionada
    # (sector, divisa de las cuentas, capitalización...), que apenas cambia.
    respaldo = DIR.parent / "fichas_empresas.csv"
    if respaldo.exists():
        r = pd.read_csv(respaldo).set_index("ticker")
        info = info.reindex(info.index.union(r.index))
        for c in r.columns:
            if c not in info:
                info[c] = np.nan
            info[c] = info[c].where(info[c].notna(), r[c].reindex(info.index))
    return f.sort_values(["ticker", "disponible"]), info


def _invertir(estado):
    """El JSON guarda {concepto: {periodo: valor}}; _tabla espera {periodo: {concepto: valor}}."""
    if not estado:
        return {}
    out = {}
    for concepto, valores in estado.items():
        for periodo, v in valores.items():
            out.setdefault(periodo, {})[concepto] = v
    return out


def _fx_divisa(d):
    """Unidades de cada divisa por 1 EUR (series diarias en el calendario de d)."""
    from .global_datos import _fx
    return _fx(pd.read_parquet(DIR / "mercado.parquet"), d.close.index)


def ratios(d, fechas, ind):
    """Tabla larga (fecha, ticker) con ratios point-in-time en EUR y sus relativos sectoriales."""
    fotos, info = leer_todo()
    fx = _fx_divisa(d)
    uni = d.universo
    salida = []
    precios = pd.read_parquet(DIR / "precios.parquet", columns=["date", "ticker", "stock_splits"])
    splits = precios[precios["stock_splits"] > 0]
    sp_por_tk = {tk: g.set_index("date")["stock_splits"] for tk, g in splits.groupby("ticker")}
    base = pd.DataFrame({"fecha": pd.DatetimeIndex(fechas).astype("datetime64[ns]")})
    for tk, f in fotos.groupby("ticker"):
        if tk not in d.close.columns:
            continue
        f = f.assign(disponible=f["disponible"].astype("datetime64[ns]"), periodo=f["periodo"].astype("datetime64[ns]"))
        f = f.sort_values(["disponible", "periodo"]).drop_duplicates("disponible", keep="last")
        f = f[f["periodo"] == f["periodo"].cummax()]
        m = pd.merge_asof(base, f, left_on="fecha", right_on="disponible", direction="backward").dropna(subset=["periodo"])
        if m.empty:
            continue
        close = d.close[tk].reindex(m["fecha"]).ffill().values
        fac = np.ones(len(m))
        for dia, x in sp_por_tk.get(tk, pd.Series(dtype=float)).items():
            fac = np.where(m["periodo"].values < np.datetime64(dia), fac * x, fac)
        div_precio = uni.at[tk, "divisa"]
        div_cuentas = (info.at[tk, "financialCurrency"] if tk in info.index else None) or ("GBP" if div_precio == "GBp" else div_precio)
        fx_p = fx.get(div_precio)
        fx_c = fx.get(div_cuentas)
        if fx_p is None or fx_c is None:
            continue
        a_eur_p = 1 / fx_p.reindex(m["fecha"]).values          # EUR por unidad de la divisa del precio
        a_eur_c = 1 / fx_c.reindex(m["fecha"]).values
        cap = close * m["acciones"].values * fac * a_eur_p
        deuda_neta = (m["deuda"].fillna(0).values - m["caja"].fillna(0).values) * a_eur_c
        ebitda, bfo = m["ebitda"].values * a_eur_c, m["beneficio"].values * a_eur_c
        pat, ing = m["patrimonio"].values * a_eur_c, m["ingresos"].values * a_eur_c
        ev = cap + deuda_neta + m["minoritarios"].fillna(0).values * a_eur_c
        with np.errstate(divide="ignore", invalid="ignore"):
            r = pd.DataFrame({
                "fecha": m["fecha"].values, "ticker": tk, "cap_eur": cap,
                "per": np.where(bfo > 0, cap / bfo, np.nan), "pb": np.where(pat > 0, cap / pat, np.nan),
                "ev_ebitda": np.where(ebitda > 0, ev / ebitda, np.nan),
                "deuda_ebitda": np.where(ebitda > 0, deuda_neta / ebitda, np.nan),
                "roe": np.where(pat > 0, bfo / pat, np.nan), "margen_neto": np.where(ing > 0, bfo / ing, np.nan),
                "beneficio_pos": bfo > 0,
            })
            ebit = m["ebit"].values * a_eur_c
            ncav = (m["activo_corriente"].values - m["pasivo_total"].values) * a_eur_c
            capinv = m["capital_invertido"].values * a_eur_c
            r["ev_ebit"] = np.where(ebit > 0, ev / ebit, np.nan)                    # "acquirer's multiple"
            r["rend_ebit"] = np.where(ev > 0, ebit / ev, np.nan)                    # earnings yield (Greenblatt)
            r["roc"] = np.where(capinv > 0, ebit / capinv, np.nan)                 # rentabilidad del capital
            r["cap_ncav"] = np.where(ncav > 0, cap / ncav, np.nan)                 # < 1: net-net de Graham
            r["fscore"] = m["fscore"].values if "fscore" in m else np.nan
        salida.append(r)
    out = pd.concat(salida, ignore_index=True)
    out["sector"] = out["ticker"].map(info["sector"]).fillna("Desconocido")
    out["zona"] = out["ticker"].map(uni["zona"])
    out["insiders"] = out["ticker"].map(pd.to_numeric(info["heldPercentInsiders"], errors="coerce"))
    return out, info


def control_cap(r_hoy: pd.DataFrame, info: pd.DataFrame, uni: pd.DataFrame, tol=0.35) -> pd.Series:
    """True si la capitalización reconstruida hoy cuadra con la de Yahoo (si no, el nº de acciones no es fiable)."""
    from .global_datos import _fx
    mercado = pd.read_parquet(DIR / "mercado.parquet")
    fx = _fx(mercado, pd.DatetimeIndex([r_hoy["fecha"].max()]))
    ok = {}
    for row in r_hoy.itertuples():
        mc = pd.to_numeric(info.at[row.ticker, "marketCap"], errors="coerce") if row.ticker in info.index else np.nan
        div = uni.at[row.ticker, "divisa"]
        div = "GBP" if div == "GBp" else div
        mc_eur = mc / float(fx[div].iloc[-1]) if div in fx and np.isfinite(mc) else np.nan
        ok[row.ticker] = np.isfinite(mc_eur) and np.isfinite(row.cap_eur) and abs(row.cap_eur / mc_eur - 1) <= tol
    return pd.Series(ok)


def relativos(t: pd.DataFrame, min_grupo=8) -> pd.DataFrame:
    """Percentil de cada métrica dentro de su sector y zona (1 = el mejor del grupo)."""
    t = t.copy()
    t["grupo"] = t["sector"].astype(str) + "|" + t["zona"].astype(str)
    n = t.groupby("grupo")["per"].transform("count")
    t.loc[n < min_grupo, "grupo"] = t["sector"].astype(str)
    mejor_bajo = ["per", "pb", "ev_ebitda", "deuda_ebitda", "volat_1a", "beta_1a"]
    mejor_alto = ["roe", "margen_neto", "sharpe_1a", "insiders"]
    for c in mejor_bajo + mejor_alto:
        if c not in t:
            continue
        v = t[c].where(np.isfinite(t[c]))
        if c in ("per", "pb", "ev_ebitda"):
            v = v.where(v > 0)
        # 1 = la mejor del grupo (la más barata, la más rentable, la menos volátil...)
        t[f"{c}_pct"] = v.groupby(t["grupo"]).rank(pct=True, ascending=c in mejor_alto)
        med = v.groupby(t["grupo"]).transform("median")
        t[f"{c}_rel"] = v / med
    return t
