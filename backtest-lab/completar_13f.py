"""
Completa el mapa CUSIP -> ticker de los 13F para no perder empresas (sesgo de supervivencia):

  1. Reintenta en OpenFIGI los CUSIP sin ticker SIN exigir que coticen hoy (devuelve tickers antiguos: PCP, DTV...).
  2. Los que siguen sin ticker se casan por nombre con el universo actual (cambios de CUSIP: GE, Exxon...).
  3. Las clases de una misma acción se unifican con la que tenemos con precios (BRK-A -> BRK-B, GOOG -> GOOGL).
  4. Lista de tickers que no están en nuestros precios pero sí en Tiingo (empresas que dejaron de cotizar):
     datos_global/alternativos/13f/pedir_tiingo.txt (para el workflow de Tiingo).

  python completar_13f.py   -> cusip_ticker.json (versionado) y carteras.parquet actualizados
"""
import json
import re
import time
import urllib.request
import zipfile
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent
DIR = RAIZ / "datos_global" / "alternativos" / "13f"


def norma(nombre):
    n = re.sub(r"[^A-Z0-9 ]", " ", str(nombre).upper())
    n = re.sub(r"\b(INC|CORP|CORPORATION|CO|COMPANY|LTD|PLC|HLDGS?|HOLDINGS?|GROUP|GRP|THE|NEW|DEL|CL A|CL B|COM|CLASS [AB]|N V|NV|SA|AG|LP|LLC|L P)\b", " ", n)
    return re.sub(r"\s+", " ", n).strip()


def figi_sin_bolsa(cusips):
    out = {}
    for i in range(0, len(cusips), 10):
        lote = cusips[i:i + 10]
        cuerpo = json.dumps([{"idType": "ID_CUSIP", "idValue": c} for c in lote]).encode()
        for intento in range(5):
            try:
                req = urllib.request.Request("https://api.openfigi.com/v3/mapping", data=cuerpo, headers={"Content-Type": "application/json"})
                res = json.loads(urllib.request.urlopen(req, timeout=60).read())
                for c, r in zip(lote, res):
                    datos = [x for x in r.get("data", []) if x.get("ticker") and x.get("exchCode") in ("US", "UN", "UW", "UQ", "UA", "UR", "UV", "UP")]
                    datos = datos or [x for x in r.get("data", []) if x.get("ticker") and x.get("marketSector") == "Equity"]
                    out[c] = datos[0]["ticker"].split(" ")[0].replace("/", "-") if datos else None
                break
            except Exception:  # noqa: BLE001
                time.sleep(20 * (intento + 1))
        time.sleep(3.2)
        if i % 200 == 0:
            print(f"OpenFIGI {i}/{len(cusips)}", flush=True)
    return out


def main():
    mapa = json.loads((RAIZ / "cusip_ticker.json").read_text())
    t = pd.read_parquet(DIR / "carteras.parquet")
    precios = set(pd.read_parquet(RAIZ / "datos_global" / "precios.parquet", columns=["ticker"])["ticker"].unique())
    uni = pd.read_csv(RAIZ / "datos_global" / "universo.csv")
    uni = uni[uni["zona"] == "EE. UU."]
    # 1) reintento OpenFIGI sin bolsa para los CUSIP sin ticker que pesan algo en alguna cartera
    t["peso"] = t["VALUE"] / t.groupby("ACCESSION_NUMBER")["VALUE"].transform("sum")
    sin = t[t["CUSIP"].str.upper().map(lambda c: mapa.get(c) is None)]
    importantes = sorted(sin.groupby(sin["CUSIP"].str.upper())["peso"].max().loc[lambda s: s >= 0.005].index)
    print(f"CUSIP sin ticker con peso >= 0,5 % en alguna cartera: {len(importantes)}", flush=True)
    nuevos = figi_sin_bolsa(importantes)
    mapa.update({c: tk for c, tk in nuevos.items() if tk})
    # 2) por nombre, para los que siguen sin ticker
    nombres_uni = {}
    for r in uni.itertuples():
        nombres_uni.setdefault(norma(r.nombre), []).append(r.ticker)
    emisor = t.groupby(t["CUSIP"].str.upper())["NAMEOFISSUER"].first()
    por_nombre = 0
    for c in importantes:
        if mapa.get(c):
            continue
        cand = nombres_uni.get(norma(emisor.get(c, "")), [])
        if len(cand) == 1:
            mapa[c] = cand[0]
            por_nombre += 1
    # 3) clases de la misma acción: si el ticker no tiene precios y otro del mismo emisor sí, se usa ese
    t["ticker"] = t["CUSIP"].str.upper().map(mapa)
    alias = {}
    for nombre, g in t.dropna(subset=["ticker"]).groupby(t["NAMEOFISSUER"].map(norma)):
        tks = set(g["ticker"])
        con = [x for x in tks if x in precios]
        for x in tks - set(con):
            if len(con) == 1:
                alias[x] = con[0]
    for c, tk in list(mapa.items()):
        if tk in alias:
            mapa[c] = alias[tk]
    (RAIZ / "cusip_ticker.json").write_text(json.dumps(mapa))
    t["ticker"] = t["CUSIP"].str.upper().map(mapa)
    t.drop(columns=["peso"]).to_parquet(DIR / "carteras.parquet")
    # 4) qué pedir a Tiingo: con ticker, sin precios nuestros, y que Tiingo tenga como acción de EE. UU. ya retirada
    st_zip = DIR / "supported_tickers.zip"
    if not st_zip.exists():
        urllib.request.urlretrieve("https://apimedia.tiingo.com/docs/tiingo/daily/supported_tickers.zip", st_zip)
    st = pd.read_csv(zipfile.ZipFile(st_zip).open("supported_tickers.csv"))
    st = st[(st["assetType"] == "Stock") & st["exchange"].isin(["NYSE", "NASDAQ", "NYSE MKT", "AMEX", "NYSE ARCA", "BATS"])]
    st["endDate"] = pd.to_datetime(st["endDate"], errors="coerce")
    retiradas = set(st.loc[st["endDate"] < pd.Timestamp.today() - pd.Timedelta(days=30), "ticker"].str.upper())
    g = t.dropna(subset=["ticker"])
    g = g[~g["ticker"].isin(precios)]
    imp = g.groupby("ticker").agg(peso=("VALUE", "sum"), gestores=("gestor", "nunique")).sort_values("peso", ascending=False)
    imp = imp[imp.index.str.upper().isin(retiradas)]
    (DIR / "pedir_tiingo.txt").write_text("\n".join(imp.index[:400]))
    print(f"OpenFIGI recuperó {sum(1 for v in nuevos.values() if v)} | por nombre {por_nombre} | alias de clase {len(alias)} | "
          f"para Tiingo: {len(imp)} retiradas (se piden las 400 con más peso)", flush=True)
    print("con ticker ahora:", f"{t['ticker'].notna().mean():.0%} de las filas")


if __name__ == "__main__":
    main()
