"""Copiar a los grandes inversores de valor con sus 13F (lo que declaran a la SEC cada trimestre, ~45 días después).

Para cada fecha solo se usa el último 13F de cada gestor YA PRESENTADO (y de menos de ~7 meses).
  clon_peso   suma, entre gestores, del peso de la acción en la cartera de cada uno (convicción compartida)
  clon_n      cuántos gestores la tienen
"""
import numpy as np
import pandas as pd

from .global_datos import DIR

RUTA = DIR / "alternativos" / "13f" / "carteras.parquet"


def tabla():
    t = pd.read_parquet(RUTA)
    t = t.dropna(subset=["ticker", "FILING_DATE", "VALUE"])
    t = t[t["VALUE"] > 0]
    # peso de cada valor dentro de su informe
    t["peso"] = t["VALUE"] / t.groupby("ACCESSION_NUMBER")["VALUE"].transform("sum")
    # si un gestor presenta dos 13F del mismo trimestre, vale el último
    ult = t.groupby(["gestor", "PERIODOFREPORT"])["FILING_DATE"].transform("max")
    return t[t["FILING_DATE"] == ult]


def anadir_a_extra(extra: dict, universo_tickers=None):
    t = tabla()
    informes = t[["gestor", "ACCESSION_NUMBER", "FILING_DATE", "PERIODOFREPORT"]].drop_duplicates("ACCESSION_NUMBER")
    for fecha, tab in extra.items():
        f = pd.Timestamp(fecha)
        vivos = informes[(informes["FILING_DATE"] <= f) & (informes["PERIODOFREPORT"] > f - pd.Timedelta(days=220))]
        vivos = vivos.sort_values("FILING_DATE").groupby("gestor").tail(1)
        x = t[t["ACCESSION_NUMBER"].isin(vivos["ACCESSION_NUMBER"])]
        agg = x.groupby("ticker").agg(clon_peso=("peso", "sum"), clon_n=("gestor", "nunique"))
        tab["clon_peso"] = agg["clon_peso"].reindex(tab.index)
        tab["clon_n"] = agg["clon_n"].reindex(tab.index)
        tab["clon_gestores"] = len(vivos)
    return extra
