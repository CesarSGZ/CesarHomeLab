"""Semáforo de alertas de cada compra (solo se anota: NO cambia qué compra la estrategia).

Sale del análisis de operaciones perdedoras (octubre de 2026). Rasgos que se repetían en las compras que acababan mal:

  Momentum EE. UU.            Valor + momentum
  - va por libre (R² < 0,095) - volatilidad propia alta (> 36 %)
  - días de lotería (> 4 %)   - días de lotería (> 4 %)
  - diluye acciones (> 3 %)   - no bate el BPA (menos de 3 de 4 trimestres)
  - pico en Wikipedia (> 1,5x)- no paga dividendo

Se guardan para comprobar en la cuenta paper, con dinero ficticio y sin mirar atrás, si las compras con 2 o más alertas
salen peor. Cualquier dato que no se pueda conseguir queda como "sin dato" y no cuenta como alerta.
"""
import json
import math
import urllib.parse
import urllib.request
from datetime import timedelta
from pathlib import Path

import numpy as np
import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "CesarHomeLab-research/1.0 (https://github.com/CesarSGZ/CesarHomeLab)"}
UA_SEC = {"User-Agent": "CesarHomeLab Research Bot"}          # la SEC rechaza identificadores con URL

ALERTAS = {
    "precio": {"va_por_libre": "Va por libre (R² con el S&P < 0,095)", "loteria": "Días de lotería (5 mejores días > 4 %)",
               "diluye": "Ha emitido > 3 % de acciones en un año", "pico_wiki": "Pico de visitas en Wikipedia (> 1,5x)"},
    "fundamental": {"vol_propia": "Volatilidad propia > 36 %", "loteria": "Días de lotería (5 mejores días > 4 %)",
                    "no_bate_bpa": "No bate el BPA en 3 de 4 trimestres", "sin_dividendo": "No paga dividendo"},
}


def _get(url, timeout=30):
    req = urllib.request.Request(url, headers=UA_SEC if "sec.gov" in url else UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


# ---------------------------------------------------------------- precio
def rasgos_precio(d, ind, tk, fecha):
    """R² con el S&P y volatilidad propia a 1 año, media de los 5 mejores días del último mes (rentabilidad total en EUR)."""
    if tk not in d.tr_eur.columns:
        return {}
    tr = d.tr_eur[tk].loc[:fecha].dropna().astype(float)
    if len(tr) < 160:
        return {}
    r = np.log(tr).diff().dropna()
    sp = np.log(d.sp500_eur.ffill()).diff().reindex(r.index)
    x = pd.concat([r.iloc[-252:], sp.iloc[-252:]], axis=1).dropna()
    out = {"max5_21": float(r.iloc[-21:].nlargest(5).mean())}
    if len(x) > 150:
        c = np.corrcoef(x.iloc[:, 0], x.iloc[:, 1])[0, 1]
        out["r2_mercado"] = float(c * c)
        out["vol_idio"] = float(x.iloc[:, 0].std() * math.sqrt(252) * math.sqrt(max(0.0, 1 - c * c)))
    if "rent_div" in ind and tk in ind["rent_div"].columns:
        v = ind["rent_div"][tk].loc[:fecha].dropna()
        if len(v):
            out["rent_div"] = float(v.iloc[-1])
    return out


# ---------------------------------------------------------------- SEC (solo EE. UU.)
_CIK = None


def _cik(tk):
    global _CIK
    if _CIK is None:
        js = _get("https://www.sec.gov/files/company_tickers.json")
        _CIK = {v["ticker"].upper(): int(v["cik_str"]) for v in js.values()}
    return _CIK.get(tk.upper().replace("-", "."), _CIK.get(tk.upper()))


def acciones_crec(tk, fecha):
    """Crecimiento interanual de las acciones diluidas medias (último 10-K presentado antes de la fecha)."""
    if "." in tk:
        return None
    cik = _cik(tk)
    if not cik:
        return None
    js = _get(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik:010d}.json", timeout=60)
    filas = js.get("facts", {}).get("us-gaap", {}).get("WeightedAverageNumberOfDilutedSharesOutstanding", {}).get("units", {})
    filas = next(iter(filas.values()), [])
    df = pd.DataFrame([f for f in filas if f.get("form") in ("10-K", "10-K/A", "10-KT", "20-F", "20-F/A", "40-F")])
    if not len(df):
        return None
    for c in ("start", "end", "filed"):
        df[c] = pd.to_datetime(df[c], errors="coerce")
    df = df[(df["filed"] <= fecha) & ((df["end"] - df["start"]).dt.days.between(340, 390))]
    df = df.sort_values(["end", "filed"]).drop_duplicates("end", keep="last")
    if len(df) < 2 or (fecha - df["end"].iloc[-1]).days > 500 or (df["end"].iloc[-1] - df["end"].iloc[-2]).days > 400:
        return None
    a, b = df["val"].iloc[-1], df["val"].iloc[-2]
    return float(a / b - 1) if b else None


# ---------------------------------------------------------------- Wikipedia
_ARTICULOS = None


def pico_wiki(tk, fecha):
    """Visitas del último mes frente a la media del año (log). Artículo de Wikipedia según wiki_articulos.json."""
    global _ARTICULOS
    if _ARTICULOS is None:
        ruta = RAIZ / "wiki_articulos.json"
        _ARTICULOS = json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else {}
    art = _ARTICULOS.get(tk)
    if not art:
        return None
    ini, fin = (fecha - timedelta(days=400)).strftime("%Y%m%d"), fecha.strftime("%Y%m%d")
    url = ("https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/"
           f"{urllib.parse.quote(art, safe='')}/daily/{ini}/{fin}")
    v = pd.Series({x["timestamp"][:8]: x["views"] for x in _get(url).get("items", [])}, dtype=float)
    if len(v) < 300:
        return None
    v.index = pd.to_datetime(v.index)
    v = v.asfreq("D").fillna(0)
    return float(np.log((v.iloc[-30:].mean() + 1) / (v.iloc[-365:].mean() + 1)))


# ---------------------------------------------------------------- resultados (Yahoo)
def batidas_4(tk, fecha):
    """Cuántos de los últimos 4 resultados publicados batieron el BPA esperado."""
    import yfinance as yf
    e = yf.Ticker(tk).get_earnings_dates(limit=12)
    if e is None or not len(e):
        return None
    e = e.reset_index()
    e.columns = ["fecha", "estimado", "real", "sorpresa"][:len(e.columns)] + list(e.columns[4:])
    e["fecha"] = pd.to_datetime(e["fecha"].astype(str).str[:10])
    e = e[(e["fecha"] <= fecha) & e["real"].notna()].sort_values("fecha")
    if not len(e) or (fecha - e["fecha"].iloc[-1]).days > 200:
        return None
    s = e["sorpresa"].tail(4)
    return int((s > 0).sum()) if s.notna().any() else None


def _seguro(f, *a):
    try:
        return f(*a)
    except Exception:  # noqa: BLE001 - un dato que falta no debe parar la publicación
        return None


def semaforo(estrategia, d, ind, tk, fecha):
    """{'alertas': [claves], 'sinDato': [claves], 'datos': {...}} para una compra de 'precio' o 'fundamental'."""
    fecha = pd.Timestamp(fecha)
    p = _seguro(rasgos_precio, d, ind, tk, fecha) or {}
    datos, alertas, sin = dict(p), [], []

    def marca(clave, valor, cond):
        if valor is None or (isinstance(valor, float) and not math.isfinite(valor)):
            sin.append(clave)
        elif cond(valor):
            alertas.append(clave)

    if estrategia == "precio":
        datos["acciones_crec"] = _seguro(acciones_crec, tk, fecha)
        datos["wiki_30_vs_365"] = _seguro(pico_wiki, tk, fecha)
        marca("va_por_libre", p.get("r2_mercado"), lambda v: v < 0.0952)
        marca("loteria", p.get("max5_21"), lambda v: v > 0.0404)
        marca("diluye", datos["acciones_crec"], lambda v: v > 0.03)
        marca("pico_wiki", datos["wiki_30_vs_365"], lambda v: v > math.log(1.5))
    else:
        datos["batidas_4"] = _seguro(batidas_4, tk, fecha)
        marca("vol_propia", p.get("vol_idio"), lambda v: v > 0.3606)
        marca("loteria", p.get("max5_21"), lambda v: v > 0.0406)
        marca("no_bate_bpa", datos["batidas_4"], lambda v: v < 3)
        marca("sin_dividendo", p.get("rent_div"), lambda v: not v > 0)
    datos = {k: (round(v, 4) if isinstance(v, float) else v) for k, v in datos.items() if v is not None}
    return {"alertas": alertas, "sinDato": sin, "datos": datos, "fecha": fecha.strftime("%Y-%m-%d")}
