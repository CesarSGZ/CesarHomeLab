"""
ISIN de las carteras de la CNMV -> ticker de nuestro universo (Yahoo), con OpenFIGI.

OpenFIGI da un ticker por bolsa; se elige la cotización que tenemos con precios (sufijo de Yahoo por bolsa).
Los códigos internos de la CNMV (empiezan por XX) se intentan casar por nombre.

  python mapear_isin.py   -> isin_ticker.json (versionado) y datos_global/alternativos/cnmv/carteras.parquet con 'ticker'
"""
import json
import re
import time
import urllib.request
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent
DIR = RAIZ / "datos_global" / "alternativos" / "cnmv"
# código de bolsa de Bloomberg/OpenFIGI -> sufijo de Yahoo
SUFIJO = {"US": "", "UN": "", "UW": "", "UQ": "", "UA": "", "UR": "", "GY": ".DE", "GR": ".F", "GF": ".F", "SM": ".MC",
          "SQ": ".MC", "LN": ".L", "FP": ".PA", "IM": ".MI", "NA": ".AS", "SW": ".SW", "SE": ".SW", "VX": ".SW", "JT": ".T",
          "JP": ".T", "HK": ".HK", "KS": ".KS", "KQ": ".KQ", "AU": ".AX", "AT": ".AX", "CN": ".TO", "CT": ".TO", "SS": ".ST",
          "NO": ".OL", "DC": ".CO", "FH": ".HE", "BB": ".BR", "PL": ".LS", "AV": ".VI", "ID": ".IR", "PW": ".WA",
          "SP": ".SI", "NZ": ".NZ", "MM": ".MX", "BZ": ".SA", "IT": ".TA", "TT": ".TW", "GA": ".AT", "SJ": ".JO", "TI": ".IS"}


def norma(n):
    n = re.sub(r"[^A-Z0-9 ]", " ", str(n).upper())
    n = re.sub(r"\b(ACCIONES|INC|CORP|CORPORATION|CO|COMPANY|LTD|PLC|SA|S A|AG|SE|NV|N V|SPA|S P A|HOLDINGS?|GROUP|THE|ASA|AB|OYJ|LIMITED)\b", " ", n)
    return re.sub(r"\s+", " ", n).strip()


def figi(isins, validos):
    ruta = RAIZ / "isin_ticker.json"
    mapa = json.loads(ruta.read_text()) if ruta.exists() else {}
    faltan = [i for i in isins if i not in mapa]
    for k in range(0, len(faltan), 10):
        lote = faltan[k:k + 10]
        cuerpo = json.dumps([{"idType": "ID_ISIN", "idValue": i} for i in lote]).encode()
        for intento in range(5):
            try:
                req = urllib.request.Request("https://api.openfigi.com/v3/mapping", data=cuerpo, headers={"Content-Type": "application/json"})
                res = json.loads(urllib.request.urlopen(req, timeout=60).read())
                for i, r in zip(lote, res):
                    elegido = None
                    for x in r.get("data", []):
                        suf = SUFIJO.get(x.get("exchCode"))
                        if suf is None or not x.get("ticker"):
                            continue
                        base = x["ticker"].split(" ")[0].replace("/", "-")
                        if suf == ".HK":
                            base = base.zfill(4)
                        cand = base + suf
                        if cand in validos:
                            elegido = cand
                            break
                    mapa[i] = elegido
                break
            except Exception:  # noqa: BLE001
                time.sleep(20 * (intento + 1))
        time.sleep(3.2)
        if k % 200 == 0:
            ruta.write_text(json.dumps(mapa))
            print(f"OpenFIGI {k}/{len(faltan)}", flush=True)
    ruta.write_text(json.dumps(mapa))
    return mapa


def por_emisor(isins, uni):
    """Segunda pasada: para los ISIN sin cotización en nuestro universo (p. ej. preferentes de BMW o Hyundai), el nombre del
    emisor de OpenFIGI se casa con la acción ordinaria de esa empresa en el universo (si hay una sola coincidencia)."""
    nombres = {}
    for r in uni.itertuples():
        nombres.setdefault(norma(r.nombre), set()).add(r.ticker)
    # también por las dos primeras palabras (los nombres de Yahoo y de Bloomberg no siempre coinciden del todo)
    cortos = {}
    for k, v in nombres.items():
        cortos.setdefault(" ".join(k.split()[:2]), set()).update(v)
    out = {}
    for k in range(0, len(isins), 10):
        lote = isins[k:k + 10]
        cuerpo = json.dumps([{"idType": "ID_ISIN", "idValue": i} for i in lote]).encode()
        for intento in range(5):
            try:
                req = urllib.request.Request("https://api.openfigi.com/v3/mapping", data=cuerpo, headers={"Content-Type": "application/json"})
                res = json.loads(urllib.request.urlopen(req, timeout=60).read())
                for i, r in zip(lote, res):
                    nom = next((x.get("name") for x in r.get("data", []) if x.get("name")), None)
                    if not nom:
                        continue
                    n = norma(nom)
                    cand = nombres.get(n) or cortos.get(" ".join(n.split()[:2]))
                    if cand and len(cand) <= 3:
                        # si la empresa cotiza en varias bolsas, la de su país (sufijo coherente con el ISIN)
                        pais = i[:2]
                        pref = {"DE": ".DE", "FR": ".PA", "IT": ".MI", "ES": ".MC", "GB": ".L", "NL": ".AS", "KR": ".KS",
                                "JP": ".T", "HK": ".HK", "CH": ".SW", "US": "", "SE": ".ST", "NO": ".OL", "DK": ".CO"}.get(pais)
                        elegido = sorted(cand, key=lambda x: (0 if pref is not None and (x.endswith(pref) if pref else "." not in x) else 1, x))[0]
                        out[i] = elegido
                break
            except Exception:  # noqa: BLE001
                time.sleep(20 * (intento + 1))
        time.sleep(3.2)
    return out


def main():
    t = pd.read_parquet(DIR / "carteras.parquet")
    uni = pd.read_csv(RAIZ / "datos_global" / "universo.csv")
    validos = set(uni["ticker"])
    t["peso"] = t["valor"] / t.groupby(["fecha_datos", "registro"])["valor"].transform("sum")
    reales = t[~t["isin"].fillna("").str.startswith("XX")]
    # solo lo que pesa algo en algún fondo (lo demás no entraría nunca en una cartera de 10-20)
    importantes = sorted(reales.groupby("isin")["peso"].max().loc[lambda s: s >= 0.005].index)
    print(f"ISIN con peso >= 0,5 % en algún fondo: {len(importantes)}", flush=True)
    mapa = figi(importantes, validos)
    sin_mapa = [i for i in importantes if not mapa.get(i)]
    print(f"Segunda pasada por emisor: {len(sin_mapa)} ISIN", flush=True)
    extra = por_emisor(sin_mapa, uni)
    mapa.update(extra)
    (RAIZ / "isin_ticker.json").write_text(json.dumps(mapa))
    print(f"  recuperados por emisor: {len(extra)}", flush=True)
    t["ticker"] = t["isin"].map(mapa)
    # los códigos internos y los que no se encontraron: por nombre
    nombres = {}
    for r in uni.itertuples():
        nombres.setdefault(norma(r.nombre), []).append(r.ticker)
    sin = t["ticker"].isna()
    desc = t.loc[sin, "descripcion"].fillna("").str.split("|").str[-1]
    t.loc[sin, "ticker"] = [(nombres.get(norma(x)) or [None])[0] if len(nombres.get(norma(x), [])) == 1 else None for x in desc]
    t.to_parquet(DIR / "carteras.parquet")
    peso_con = t.loc[t["ticker"].notna(), "valor"].sum() / t["valor"].sum()
    print(f"Con ticker: {t['ticker'].notna().mean():.0%} de las posiciones, {peso_con:.0%} del dinero", flush=True)
    print(t.groupby("gestora").apply(lambda g: g.loc[g["ticker"].notna(), "valor"].sum() / g["valor"].sum()).round(2).to_string())


if __name__ == "__main__":
    main()
