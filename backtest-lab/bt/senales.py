"""Indicadores y tabla de senales.

Este modulo NO sabe nada del backtest: recibe precios/ratios y devuelve, para una fecha,
una tabla con una fila por empresa (la "foto transversal"). Las estrategias (estrategias.py)
deciden sobre esa tabla. En vivo con ib_async bastara con construir la misma tabla con los
datos del dia y aplicar la misma estrategia para obtener la cartera objetivo.
"""
import numpy as np
import pandas as pd

SECTORES_FINANCIEROS = {"Financial Services"}
SECTORES_DEUDA_ALTA = {"Utilities", "Real Estate", "Communication Services"}


def indicadores_precio(adj_close: pd.DataFrame, close: pd.DataFrame, efectivo: pd.DataFrame,
                       anomalos: pd.DataFrame | None = None) -> dict[str, pd.DataFrame]:
    """Indicadores diarios (fecha x ticker) calculados solo con datos hasta ese cierre."""
    px = adj_close.ffill(limit=5)
    ind = {
        "precio": close.ffill(limit=5),
        "sma50": px.rolling(50, min_periods=45).mean(),
        "sma200": px.rolling(200, min_periods=180).mean(),
        "px": px,
        "mom_3m": px / px.shift(63) - 1,
        "mom_6m": px / px.shift(126) - 1,
        "mom_12m": px / px.shift(252) - 1,
        "mom_12_1": px.shift(21) / px.shift(252) - 1,
        "vol_60d": px.pct_change(fill_method=None).rolling(60, min_periods=40).std() * np.sqrt(252),
        "efectivo_60d": efectivo.rolling(60, min_periods=40).median(),
        "max_252": px.rolling(252, min_periods=120).max(),
    }
    ind["dist_max"] = px / ind["max_252"] - 1
    if anomalos is not None:
        # True si hubo un salto anomalo en las ultimas 60 sesiones
        ind["anomalia_reciente"] = anomalos.astype(float).rolling(60, min_periods=1).max() > 0
    return ind


def relativo_sector(df: pd.DataFrame, col: str, grupo: str = "grupo", min_n: int = 4) -> pd.Series:
    """Ratio dividido por la mediana de su grupo (sector). Si el grupo tiene menos de min_n
    empresas con dato, usa la mediana de todo el universo no financiero / financiero."""
    validos = df[col].where(df[col] > 0)
    med_grupo = validos.groupby(df[grupo]).transform("median")
    n_grupo = validos.groupby(df[grupo]).transform("count")
    med_amplia = validos.groupby(df["es_financiera"]).transform("median")
    med = med_grupo.where(n_grupo >= min_n, med_amplia)
    return validos / med


def tabla_transversal(fecha: pd.Timestamp, ind: dict[str, pd.DataFrame],
                      ratios_dia: pd.DataFrame | None, info: pd.DataFrame) -> pd.DataFrame:
    """Foto de todas las empresas en una fecha (con datos hasta su cierre).
    ratios_dia: ratios fundamentales point-in-time de esa fecha, indexados por ticker."""
    t = pd.DataFrame({k: v.loc[fecha] for k, v in ind.items()})
    t.index.name = "ticker"
    t["sector"] = info["sector"].reindex(t.index).fillna("Desconocido")
    t["es_financiera"] = t["sector"].isin(SECTORES_FINANCIEROS)
    t["grupo"] = t["sector"]
    # capitalizacion aproximada (acciones actuales x precio) para cuando no hay fundamentales
    t["cap_aprox"] = t["precio"] * info["sharesOutstanding"].reindex(t.index)
    if ratios_dia is not None:
        r = ratios_dia
        cols = ["capitalizacion", "per", "ev_ebitda", "p_vc", "dn_ebitda", "roe", "margen_neto",
                "margen_ebitda", "crec_ingresos", "crec_beneficio", "periodo"]
        t = t.join(r[cols], how="left")
        # el "universo" para medianas: empresas con precio vivo ese dia
        vivo = t["precio"].notna()
        for c in ["per", "ev_ebitda", "p_vc"]:
            t[f"{c}_rel"] = np.nan
            t.loc[vivo, f"{c}_rel"] = relativo_sector(t.loc[vivo], c)
    return t
