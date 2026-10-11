"""
Construye el universo global de acciones con el screener de Yahoo Finance (gratuito, sin registro).

Solo mercados que Interactive Brokers ofrece a un cliente particular europeo, solo la bolsa
principal de cada país (no Frankfurt/OTC), capitalización >= MIN_CAP_EUR (España: todas).
Si una empresa cotiza en varias bolsas, se queda la cotización más líquida.

Uso:  python universo.py        -> datos_global/universo.csv
"""
import re
import time
from pathlib import Path

import pandas as pd
import yfinance as yf
from yfinance import EquityQuery as Q

DIR = Path(__file__).resolve().parent / "datos_global"
DIR.mkdir(exist_ok=True)
MIN_CAP_EUR = 300e6

# region Yahoo -> (bolsas principales admitidas, zona)
MERCADOS = {
    "us": (["NYQ", "NMS", "NGM", "NCM", "ASE"], "EE. UU."),
    "ca": (["TOR"], "América"), "mx": (["MEX"], "América"),
    "gb": (["LSE"], "Europa"), "de": (["GER"], "Europa"), "fr": (["PAR"], "Europa"),
    "nl": (["AMS"], "Europa"), "be": (["BRU"], "Europa"), "ch": (["EBS"], "Europa"),
    "it": (["MIL"], "Europa"), "es": (["MCE"], "Europa"), "pt": (["LIS"], "Europa"),
    "se": (["STO"], "Europa"), "dk": (["CPH"], "Europa"), "no": (["OSL"], "Europa"),
    "fi": (["HEL"], "Europa"), "at": (["VIE"], "Europa"), "ie": (["ISE"], "Europa"),
    "pl": (["WSE"], "Europa"),
    "jp": (["JPX"], "Asia-Pacífico"), "hk": (["HKG"], "Asia-Pacífico"),
    "sg": (["SES"], "Asia-Pacífico"), "au": (["ASX"], "Asia-Pacífico"),
}
# divisa del precio -> EUR por unidad aproximado (solo para el umbral; luego se usa el FX histórico)
FX_APROX = {"EUR": 1, "USD": 0.92, "GBp": 0.0117, "GBP": 1.17, "CHF": 1.05, "SEK": 0.087, "DKK": 0.134,
            "NOK": 0.086, "PLN": 0.23, "JPY": 0.0062, "HKD": 0.118, "SGD": 0.69, "AUD": 0.6, "CAD": 0.67,
            "MXN": 0.05}


def pedir(query, maximo=10000):
    out = []
    for off in range(0, maximo, 250):
        for intento in range(4):
            try:
                r = yf.screen(query, size=250, offset=off, sortField="intradaymarketcap", sortAsc=False)
                break
            except Exception:  # noqa: BLE001
                time.sleep(3 * (intento + 1))
        else:
            raise RuntimeError("screener sin respuesta")
        qs = r.get("quotes", [])
        out += qs
        if len(qs) < 250:
            break
        time.sleep(0.4)
    return out


def nombre_normal(s):
    s = re.sub(r"[^a-z0-9 ]", " ", str(s).lower())
    s = re.sub(r"\b(inc|corp|corporation|plc|ag|sa|se|nv|n v|ltd|limited|co|company|group|holdings?|the|class [a-z]|spa|ab|asa|oyj|a s|as)\b", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def construir():
    filas = []
    for region, (bolsas, zona) in MERCADOS.items():
        for bolsa in bolsas:
            q = Q("and", [Q("eq", ["region", region]), Q("eq", ["exchange", bolsa])])
            quotes = pedir(q)
            n0 = len(filas)
            for x in quotes:
                cur = x.get("currency")
                cap = x.get("marketCap") or 0
                # en Londres el precio va en peniques (GBp) pero la capitalización en libras
                cap_eur = cap * FX_APROX.get("GBP" if cur == "GBp" else cur, float("nan"))
                sym = x.get("symbol", "")
                if region == "es":
                    # Latibex (X...), clases duplicadas y derechos fuera; el resto entra todo
                    if sym.startswith("X") or "-" in sym or cur != "EUR":
                        continue
                elif not (cap_eur >= MIN_CAP_EUR):
                    continue
                if x.get("quoteType") != "EQUITY":
                    continue
                filas.append({
                    "ticker": sym, "nombre": x.get("longName") or x.get("shortName") or x.get("displayName"),
                    "region": region, "zona": zona, "bolsa": bolsa, "divisa": cur,
                    "cap_eur": cap_eur, "volumen_3m": x.get("averageDailyVolume3Month"),
                    "precio": x.get("regularMarketPrice"),
                })
            print(f"{region}/{bolsa}: {len(quotes)} cotizaciones, {len(filas) - n0} dentro", flush=True)
    df = pd.DataFrame(filas)
    df["efectivo_eur"] = df["volumen_3m"].fillna(0) * df["precio"].fillna(0) * df["divisa"].map(FX_APROX)
    # una empresa cotizada en varias bolsas: se queda la cotización más líquida
    df["clave"] = df["nombre"].map(nombre_normal)
    df = df.sort_values("efectivo_eur", ascending=False)
    dup = df["clave"].ne("") & df.duplicated("clave", keep="first")
    print(f"Duplicados por cotizar en varias bolsas: {int(dup.sum())}")
    df = df[~dup].drop(columns="clave").sort_values(["zona", "region", "cap_eur"], ascending=[True, True, False])
    df.to_csv(DIR / "universo.csv", index=False)
    print(df.groupby("zona").size().to_string(), f"\nTotal: {len(df)}")
    return df


if __name__ == "__main__":
    construir()
