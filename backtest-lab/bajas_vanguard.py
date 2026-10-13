"""
Empresas de EE. UU. que fueron grandes y dejaron de cotizar (para corregir el sesgo de supervivencia de momentum).
Fuente: la cartera 13F de Vanguard (tiene casi todo el mercado) desde 2013.

  python bajas_vanguard.py  -> datos_global/alternativos/13f/vanguard.parquet y pedir_tiingo_momentum.txt
"""
import io
import json
import zipfile
from pathlib import Path

import pandas as pd

import completar_13f as C
import descargar_13f as D

RAIZ = Path(__file__).resolve().parent
DIR = D.DIR


def main():
    partes = []
    for u in D.lotes():
        z = zipfile.ZipFile(io.BytesIO(D.get("https://www.sec.gov" + u)))
        m = lambda n: next(x for x in z.namelist() if x.upper().endswith(n))
        cov = pd.read_csv(z.open(m("COVERPAGE.TSV")), sep="\t", dtype=str, usecols=["ACCESSION_NUMBER", "FILINGMANAGER_NAME"])
        cov = cov[cov["FILINGMANAGER_NAME"].str.upper().str.startswith("VANGUARD GROUP", na=False)]
        sub = pd.read_csv(z.open(m("SUBMISSION.TSV")), sep="\t", dtype=str, usecols=["ACCESSION_NUMBER", "SUBMISSIONTYPE", "PERIODOFREPORT"])
        sub = sub[sub["SUBMISSIONTYPE"] == "13F-HR"].merge(cov, on="ACCESSION_NUMBER")
        if not len(sub):
            continue
        inf = pd.read_csv(z.open(m("INFOTABLE.TSV")), sep="\t", dtype=str, usecols=["ACCESSION_NUMBER", "NAMEOFISSUER", "CUSIP", "VALUE", "PUTCALL"])
        inf = inf[inf["ACCESSION_NUMBER"].isin(sub["ACCESSION_NUMBER"]) & inf["PUTCALL"].isna()].merge(sub, on="ACCESSION_NUMBER")
        inf["VALUE"] = pd.to_numeric(inf["VALUE"], errors="coerce")
        partes.append(inf)
        print(u.rsplit("/", 1)[-1], len(inf), flush=True)
    v = pd.concat(partes, ignore_index=True)
    v["PERIODOFREPORT"] = pd.to_datetime(v["PERIODOFREPORT"], format="mixed", dayfirst=True, errors="coerce")
    v = v.groupby(["PERIODOFREPORT", "CUSIP"], as_index=False).agg(VALUE=("VALUE", "sum"), NAMEOFISSUER=("NAMEOFISSUER", "first"))
    # el valor está en miles hasta 2022 y en dólares desde 2023: se usa el puesto dentro de cada trimestre
    v["puesto"] = v.groupby("PERIODOFREPORT")["VALUE"].rank(ascending=False)
    v.to_parquet(DIR / "vanguard.parquet")
    ultimo = v["PERIODOFREPORT"].max()
    vivos = set(v.loc[v["PERIODOFREPORT"] == ultimo, "CUSIP"])
    grandes = v[v["puesto"] <= 1500].groupby("CUSIP").agg(mejor=("puesto", "min"), hasta=("PERIODOFREPORT", "max"),
                                                          nombre=("NAMEOFISSUER", "first"))
    bajas = grandes[~grandes.index.isin(vivos) & (grandes["hasta"] < ultimo - pd.Timedelta(days=200))].sort_values("mejor")
    print(f"Grandes (top 1.500 algún trimestre) que desaparecen: {len(bajas)}", flush=True)
    mapa = json.loads((RAIZ / "cusip_ticker.json").read_text())
    falta = [c for c in bajas.index if c.upper() not in mapa]
    mapa.update({c: t for c, t in C.figi_sin_bolsa(falta).items() if t})
    (RAIZ / "cusip_ticker.json").write_text(json.dumps(mapa))
    bajas["ticker"] = [mapa.get(c.upper()) for c in bajas.index]
    precios = set(pd.read_parquet(RAIZ / "datos_global" / "precios.parquet", columns=["ticker"])["ticker"].unique())
    bajas = bajas.dropna(subset=["ticker"])
    bajas = bajas[~bajas["ticker"].isin(precios)]
    bajas.to_csv(DIR / "bajas_vanguard.csv")
    (DIR / "pedir_tiingo_momentum.txt").write_text("\n".join(bajas["ticker"].drop_duplicates()))
    print(f"Con ticker y sin precios nuestros: {bajas['ticker'].nunique()}", flush=True)


if __name__ == "__main__":
    main()
