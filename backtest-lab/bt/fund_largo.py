"""Rasgos de largo plazo con las cuentas de la SEC (lo que miran los gestores de valor "de autor").

Para cada informe, con lo publicado hasta ese momento (los 5 años anteriores):
  roe_med5 / roe_min5   rentabilidad sobre fondos propios mediana y mínima (calidad sostenida, Buffett)
  roic_med5             EBIT / capital invertido mediano
  mb_std5               variabilidad del margen bruto (foso: márgenes estables)
  ben_norm5, ebit_norm5 beneficio y EBIT medios del ciclo (Paramés/Cobas: valorar sobre el beneficio normal)
  deprimido             beneficio actual / beneficio medio (< 1: está en la parte baja del ciclo)
  fcf, fcf_norm5        caja libre (flujo de explotación - inversiones) actual y media
  acc_3a                cambio del nº de acciones en 3 años, corregido de splits ("caníbales" si baja)
  crec_ventas_5a        crecimiento anual de ventas
  gp_a                  beneficio bruto / activos (Novy-Marx)
Y, ya con el precio de cada semana (anadir_a_extra):
  ey_norm, per_norm, ev_ebit_norm, fcf_yield, fcf_norm_yield, shy (dividendos + recompras / capitalización),
  caja_neta (caja - deuda) / capitalización, dd_5a (caída desde el máximo de 5 años).
"""
import numpy as np
import pandas as pd

from .global_datos import DIR


def _splits():
    p = pd.read_parquet(DIR / "precios.parquet", columns=["date", "ticker", "stock_splits"])
    p = p[p["stock_splits"] > 0]
    return {tk: g.set_index("date")["stock_splits"].sort_index() for tk, g in p.groupby("ticker")}


def rasgos(fotos: pd.DataFrame) -> pd.DataFrame:
    sp = _splits()
    out = []
    for tk, g in fotos.groupby("ticker"):
        g = g.sort_values("disponible").reset_index(drop=True)
        per = g["periodo"].values.astype("datetime64[D]")
        ben, pat, ebit = g["beneficio"].values, g["patrimonio"].values, g["ebit"].values
        capinv, mb = g["capital_invertido"].values, (g["beneficio_bruto"] / g["ingresos"]).values
        fcf = (g["cfo"] - g["capex"].fillna(0)).values
        acc, ing = g["acciones"].values, g["ingresos"].values
        s = sp.get(tk)
        with np.errstate(divide="ignore", invalid="ignore"):
            roe = np.where(pat > 0, ben / pat, np.nan)
            roic = np.where(capinv > 0, ebit / capinv, np.nan)
        filas = []
        for i in range(len(g)):
            v = (per <= per[i]) & (per > per[i] - np.timedelta64(1826, "D"))
            v[i + 1:] = False                                    # solo lo ya publicado
            n = int(v.sum())
            f = {"ticker": tk, "disponible": g.at[i, "disponible"], "n_hist": n}
            if n >= 8:
                r = roe[v]
                f["roe_med5"], f["roe_min5"] = np.nanmedian(r) if np.isfinite(r).any() else np.nan, np.nanmin(r) if np.isfinite(r).any() else np.nan
                ri = roic[v]
                f["roic_med5"] = np.nanmedian(ri) if np.isfinite(ri).any() else np.nan
                m = mb[v]
                f["mb_std5"] = np.nanstd(m) if np.isfinite(m).sum() >= 4 else np.nan
                f["ben_norm5"] = np.nanmean(ben[v]) if np.isfinite(ben[v]).sum() >= 6 else np.nan
                f["ebit_norm5"] = np.nanmean(ebit[v]) if np.isfinite(ebit[v]).sum() >= 6 else np.nan
                f["fcf_norm5"] = np.nanmean(fcf[v]) if np.isfinite(fcf[v]).sum() >= 6 else np.nan
                if f["ben_norm5"] and f["ben_norm5"] > 0 and np.isfinite(ben[i]):
                    f["deprimido"] = ben[i] / f["ben_norm5"]
            # acciones y ventas de hace ~3 y ~5 años (mismo informe o el más cercano)
            for anos, clave in ((3, "acc"), (5, "ven")):
                objetivo = per[i] - np.timedelta64(int(365.25 * anos), "D")
                cand = np.where((np.abs((per - objetivo).astype(int)) <= 120) & (np.arange(len(g)) < i))[0]
                if len(cand):
                    j = cand[np.argmin(np.abs((per[cand] - objetivo).astype(int)))]
                    if clave == "acc" and acc[j] > 0 and acc[i] > 0:
                        fac = 1.0
                        if s is not None:
                            fac = float(np.prod(s[(s.index > pd.Timestamp(per[j])) & (s.index <= pd.Timestamp(per[i]))].values)) or 1.0
                        f["acc_3a"] = acc[i] / (acc[j] * fac) - 1
                    if clave == "ven" and ing[j] > 0 and ing[i] > 0:
                        f["crec_ventas_5a"] = (ing[i] / ing[j]) ** (1 / 5) - 1
            filas.append(f)
        t = pd.DataFrame(filas)
        t["fcf"] = fcf
        t["gp_a"] = (g["beneficio_bruto"] / g["activo_total"]).values
        t["devuelto"] = (g["recompras"].fillna(0) + g["dividendos"].fillna(0)).values
        t["caja_menos_deuda"] = (g["caja"].fillna(0) - g["deuda"].fillna(0)).values
        t["ev_extra"] = (g["deuda"].fillna(0) - g["caja"].fillna(0) + g["minoritarios"].fillna(0)).values
        t["divisa_cuentas"] = g["divisa_cuentas"].values
        out.append(t)
    return pd.concat(out, ignore_index=True)


def anadir_a_extra(extra: dict, fotos: pd.DataFrame, d, ind):
    """Pega los rasgos largos (última cuenta publicada) a cada tabla semanal y calcula los rendimientos con el precio."""
    from .fund_global import _fx_divisa
    r = rasgos(fotos)
    fx = _fx_divisa(d)
    px = ind["px"]
    dd5 = (px / px.rolling(1260, min_periods=500).max() - 1)
    r = r.sort_values("disponible")
    r["disponible"] = r["disponible"].astype("datetime64[ns]")
    for fecha, t in extra.items():
        base = pd.DataFrame({"ticker": t.index, "fecha": pd.Timestamp(fecha)})
        m = pd.merge_asof(base.sort_values("fecha"), r, left_on="fecha", right_on="disponible", by="ticker", direction="backward")
        m = m[(pd.Timestamp(fecha) - m["disponible"]).dt.days <= 460].set_index("ticker")
        if not len(m):
            continue
        a_eur = m["divisa_cuentas"].map(lambda c: 1 / float(fx[c].asof(fecha)) if c in fx else np.nan)
        cap = t["cap_eur"].reindex(m.index)
        ev = cap + m["ev_extra"] * a_eur
        with np.errstate(divide="ignore", invalid="ignore"):
            nuevos = pd.DataFrame({
                "roe_med5": m["roe_med5"], "roe_min5": m["roe_min5"], "roic_med5": m["roic_med5"], "mb_std5": m["mb_std5"],
                "deprimido": m["deprimido"], "acc_3a": m["acc_3a"], "crec_ventas_5a": m["crec_ventas_5a"], "gp_a": m["gp_a"],
                "ey_norm": (m["ben_norm5"] * a_eur / cap).where(cap > 0),
                "ebit_ev_norm": (m["ebit_norm5"] * a_eur / ev).where(ev > 0),
                "fcf_yield": (m["fcf"] * a_eur / cap).where(cap > 0),
                "fcf_norm_yield": (m["fcf_norm5"] * a_eur / cap).where(cap > 0),
                "shy": (m["devuelto"] * a_eur / cap).where(cap > 0),
                "caja_neta": (m["caja_menos_deuda"] * a_eur / cap).where(cap > 0),
            }, index=m.index)
        nuevos["dd_5a"] = dd5.loc[fecha].reindex(nuevos.index) if fecha in dd5.index else np.nan
        # valores imposibles (errores de datos): fuera
        for c, lo, hi in [("ey_norm", -1, 0.5), ("ebit_ev_norm", -1, 0.6), ("fcf_yield", -2, 0.6), ("fcf_norm_yield", -2, 0.6),
                          ("shy", 0, 0.5), ("caja_neta", -20, 2), ("roe_med5", -5, 2), ("roic_med5", -5, 3)]:
            nuevos.loc[(nuevos[c] < lo) | (nuevos[c] > hi), c] = np.nan
        for c in nuevos.columns:
            t[c] = nuevos[c].reindex(t.index)
    return extra
