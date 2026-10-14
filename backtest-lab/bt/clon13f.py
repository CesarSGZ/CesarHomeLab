"""Copiar a los grandes inversores de valor: 13F de la SEC (EE. UU.) y carteras de la CNMV (fondos españoles).

Para cada fecha solo se usa el último informe de cada gestor YA PUBLICADO:
  13F   fecha de presentación real (~45 días tras el trimestre)
  CNMV  cierre + 75 días (plazo de los informes trimestrales/semestrales)
Rasgos por acción:
  clon_peso    suma, entre gestores, del peso de la acción en la cartera de cada uno
  clon_n       cuántos gestores la tienen
  clon_conv    cuántos la tienen con convicción (≥ 4 % de su cartera)
  clon_antig   suma de peso x antigüedad (trimestres seguidos en cartera, hasta 8) / 8: convicción mantenida
"""
import numpy as np
import pandas as pd

from .global_datos import DIR

RUTA = DIR / "alternativos" / "13f" / "carteras.parquet"
RUTA_CNMV = DIR / "alternativos" / "cnmv" / "carteras.parquet"
CONVICCION = 0.04
# los 26 gestores con los que se eligió y validó la estrategia 1 (octubre de 2026); la lista ampliada es solo para investigar
ORIGINALES = ("Berkshire (Buffett)", "Pabrai", "Li Lu (Himalaya)", "Akre", "Baupost (Klarman)", "Greenlight (Einhorn)",
              "Fairholme (Berkowitz)", "Southeastern (Longleaf)", "Tweedy Browne", "Ruane Cunniff (Sequoia)", "Markel (Gayner)",
              "Fairfax (Watsa)", "Scion (Burry)", "Aquamarine (Spier)", "Semper Augustus", "Third Avenue", "Pershing Square (Ackman)",
              "ValueAct", "Oakmark (Harris)", "Gardner Russo", "Wedgewood", "Giverny", "Patient Capital (Miller)", "Chou", "Mar Vista",
              "Gotham (Greenblatt)")


def _13f():
    t = pd.read_parquet(RUTA)
    t = t.dropna(subset=["ticker", "FILING_DATE", "VALUE"])
    t = t[t["VALUE"] > 0]
    t["peso"] = t["VALUE"] / t.groupby("ACCESSION_NUMBER")["VALUE"].transform("sum")
    ult = t.groupby(["gestor", "PERIODOFREPORT"])["FILING_DATE"].transform("max")
    t = t[t["FILING_DATE"] == ult]
    t = t.groupby(["gestor", "PERIODOFREPORT", "FILING_DATE", "ticker"], as_index=False)["peso"].sum()
    return t.rename(columns={"PERIODOFREPORT": "periodo", "FILING_DATE": "disponible"}).assign(fuente="13f")


def _cnmv():
    if not RUTA_CNMV.exists():
        return pd.DataFrame()
    t = pd.read_parquet(RUTA_CNMV)
    t = t[(t["valor"] > 0)]
    # la gestora como un solo inversor: suma de todos sus fondos de renta variable
    t["peso"] = t["valor"] / t.groupby(["gestora", "cierre"])["valor"].transform("sum")
    t = t.dropna(subset=["ticker"])
    t = t.groupby(["gestora", "cierre", "disponible", "ticker"], as_index=False)["peso"].sum()
    return t.rename(columns={"gestora": "gestor", "cierre": "periodo"}).assign(fuente="cnmv")


def tabla(fuentes=("13f",), gestores=None):
    partes = []
    if "13f" in fuentes:
        partes.append(_13f())
    if "cnmv" in fuentes:
        partes.append(_cnmv())
    t = pd.concat([p for p in partes if len(p)], ignore_index=True)
    if gestores is not None:
        t = t[t["gestor"].isin(gestores)]
    # antigüedad: informes seguidos del mismo gestor con la acción en cartera
    t = t.sort_values(["gestor", "ticker", "periodo"])
    orden = t.groupby("gestor")["periodo"].rank(method="dense")
    t["_n"] = orden
    nuevo = t.groupby(["gestor", "ticker"])["_n"].diff().ne(1)
    t["antig"] = t.groupby(["gestor", "ticker", nuevo.cumsum()]).cumcount() + 1
    return t.drop(columns="_n")


def anadir_a_extra(extra: dict, universo_tickers=None, fuentes=("13f",), prefijo="clon", gestores=None):
    """universo_tickers: acciones con precios; las que tienen los gestores pero no cuentas de la SEC (ADR, fondos
    europeos...) se añaden a la tabla semanal (sin fundamentales) para que puedan entrar."""
    t = tabla(fuentes, gestores)
    informes = t[["gestor", "periodo", "disponible", "fuente"]].drop_duplicates(["gestor", "periodo"])
    validos = set(universo_tickers) if universo_tickers is not None else None
    for fecha in list(extra):
        tab = extra[fecha]
        f = pd.Timestamp(fecha)
        edad = np.where(informes["fuente"] == "cnmv", 290, 220)       # la CNMV es semestral desde 2022
        vivos = informes[(informes["disponible"] <= f) & ((f - informes["periodo"]).dt.days <= edad)]
        vivos = vivos.sort_values("disponible").groupby("gestor").tail(1)
        x = t.merge(vivos[["gestor", "periodo"]], on=["gestor", "periodo"])
        x["conv"] = (x["peso"] >= CONVICCION).astype(int)
        x["pa"] = x["peso"] * np.minimum(x["antig"], 8) / 8
        agg = x.groupby("ticker").agg(peso=("peso", "sum"), n=("gestor", "nunique"), conv=("conv", "sum"), antig=("pa", "sum"))
        if validos is not None:
            nuevos = [k for k in agg.index if k in validos and k not in tab.index]
            if nuevos:
                tab = tab.reindex(tab.index.append(pd.Index(nuevos)))
                extra[fecha] = tab
        tab[f"{prefijo}_peso"] = agg["peso"].reindex(tab.index)
        tab[f"{prefijo}_n"] = agg["n"].reindex(tab.index)
        tab[f"{prefijo}_conv"] = agg["conv"].reindex(tab.index)
        tab[f"{prefijo}_antig"] = agg["antig"].reindex(tab.index)
        tab[f"{prefijo}_gestores"] = len(vivos)
    return extra
