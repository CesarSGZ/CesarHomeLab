"""Datos globales: tablas anchas (fecha x valor) en float32, todo convertido a EUR.

- Precio en divisa local corregido de splits que Yahoo no aplicó (mismo criterio que bt/datos.py).
- Índice de rentabilidad total propio (cierre + dividendos), en divisa local y en EUR.
- Londres cotiza en peniques (GBp): se divide entre 100.
- Calendario: unión de sesiones de todos los mercados; cada valor tiene NaN en sus festivos.
"""
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

DIR = Path(__file__).resolve().parent.parent / "datos_global"

# Costes de operar por mercado con IBKR (aproximados) + impuestos que pagaría un residente en Alemania.
# comision: % del importe y mínimo en EUR; imp_compra / imp_venta: impuestos sobre la operación.
COSTES_MERCADO = {
    "us": dict(com=0.0002, min=0.5),
    "ca": dict(com=0.0005, min=1.0), "mx": dict(com=0.001, min=5.0),
    "gb": dict(com=0.0005, min=3.0, imp_compra=0.005),          # stamp duty 0,5 %
    "ie": dict(com=0.0005, min=3.0, imp_compra=0.01),           # stamp duty 1 %
    "fr": dict(com=0.0005, min=3.0, imp_compra=0.003, cap_imp=1e9),   # TTF 0,3 % (> 1.000 M€)
    "it": dict(com=0.0005, min=3.0, imp_compra=0.001, cap_imp=5e8),   # Tobin italiana 0,1 %
    "es": dict(com=0.0005, min=3.0, imp_compra=0.002, cap_imp=1e9),   # ITF 0,2 % (> 1.000 M€)
    "de": dict(com=0.0005, min=3.0), "nl": dict(com=0.0005, min=3.0), "be": dict(com=0.0005, min=3.0),
    "ch": dict(com=0.0005, min=3.0), "pt": dict(com=0.0005, min=3.0), "at": dict(com=0.0005, min=3.0),
    "se": dict(com=0.0005, min=3.0), "dk": dict(com=0.0005, min=3.0), "no": dict(com=0.0005, min=3.0),
    "fi": dict(com=0.0005, min=3.0), "pl": dict(com=0.0010, min=3.0),
    "jp": dict(com=0.0008, min=1.0), "sg": dict(com=0.0008, min=3.0), "au": dict(com=0.0008, min=4.0),
    "hk": dict(com=0.0008, min=2.0, imp_compra=0.0011, imp_venta=0.0011),  # stamp duty + tasas
}
COSTE_CAMBIO_DIVISA = 0.0003        # IBKR cobra ~0,002 % + diferencial; se redondea al alza
TRAMOS_SLIPPAGE = ((50e6, 0.0003), (10e6, 0.0006), (2e6, 0.0012), (5e5, 0.0025), (0, 0.005))


@dataclass
class DatosGlobales:
    open: pd.DataFrame          # apertura local (ajustada por splits)
    close: pd.DataFrame         # cierre local (ajustado por splits)
    high: pd.DataFrame
    low: pd.DataFrame
    volume: pd.DataFrame
    tr_local: pd.DataFrame      # índice de rentabilidad total en divisa local
    tr_eur: pd.DataFrame        # índice de rentabilidad total en EUR (lo que gana un inversor en euros)
    open_eur_tr: pd.DataFrame   # apertura en la escala de tr_eur (para ejecutar órdenes)
    efectivo_eur: pd.DataFrame  # EUR negociados al día
    universo: pd.DataFrame      # ticker -> region, zona, divisa, cap_eur, nombre
    sp500_eur: pd.Series        # S&P 500 con dividendos, en EUR
    sp500_usd: pd.Series
    sp500_precio_eur: pd.Series

    # nombres que usa bt/motor.py
    @property
    def adj_open(self):
        return self.open_eur_tr


def _fx(mercado: pd.DataFrame, calendario) -> dict:
    fx = {"EUR": pd.Series(1.0, index=calendario)}
    for tk, g in mercado.groupby("ticker"):
        if tk.startswith("EUR") and tk.endswith("=X"):
            s = g.set_index("date")["close"].sort_index()
            s = s[~s.index.duplicated()]
            fx[tk[3:6]] = s.reindex(calendario).ffill().bfill()
    fx["GBp"] = fx["GBP"] * 100          # 1 EUR = X peniques
    return fx


def _corregir_splits_ancho(close, splits, otros):
    """Igual que bt/datos.py: salto >= x3 con un split registrado a +-10 sesiones de tamaño parecido."""
    correcciones = []
    ratio = close / close.ffill().shift(1)
    sospechosos = ((ratio >= 3) | (ratio <= 1 / 3)) & (splits.reindex_like(close).fillna(0) > 0).rolling(21, center=True, min_periods=1).max().astype(bool)
    for tk in sospechosos.columns[sospechosos.any()]:
        sp = splits[tk]
        sp = sp[(sp > 0) & (sp != 1)]
        for fecha_salto in sospechosos.index[sospechosos[tk]]:
            r = ratio.at[fecha_salto, tk]
            cerca = sp[(sp.index >= fecha_salto - pd.Timedelta(days=16)) & (sp.index <= fecha_salto + pd.Timedelta(days=16))]
            if cerca.empty or not any(abs(abs(np.log(r)) / abs(np.log(f)) - 1) < 0.25 for f in cerca):
                continue
            antes = close.index < fecha_salto
            for df in [close, *otros]:
                df.loc[antes, tk] = df.loc[antes, tk] * r
            correcciones.append((tk, fecha_salto.date(), float(r)))
            ratio[tk] = close[tk] / close[tk].ffill().shift(1)
    return correcciones


FACTORES_SPLIT = [2.5, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30, 40, 50, 100, 200, 250, 500, 1000, 10000]


def _limpiar(close, otros, volume):
    """Errores típicos de Yahoo en un universo grande:
    1) pico de un día que se deshace al siguiente (|r| > 40 % y vuelve a ±15 %): se borra ese día;
    2) salto que coincide con un factor de split exacto (x3, x10, 1/20...) sin split registrado:
       se reescala todo lo anterior (Yahoo no aplicó el split/contrasplit)."""
    log = {"picos": 0, "splits": 0}
    ratio = close / close.ffill().shift(1)
    nxt = ratio.shift(-1)
    pico = (ratio - 1).abs().gt(0.4) & ((ratio * nxt) - 1).abs().lt(0.15)
    if pico.any().any():
        log["picos"] = int(pico.sum().sum())
        for df in [close, *otros]:
            df[pico.reindex_like(df).fillna(False)] = np.nan
        volume[pico] = np.nan
        ratio = close / close.ffill().shift(1)
    lr = np.log(ratio.astype("float64"))
    grandes = lr.abs() >= np.log(2.4)
    for tk in grandes.columns[grandes.any()]:
        for fecha in grandes.index[grandes[tk]]:
            r = float(ratio.at[fecha, tk])
            f = r if r >= 1 else 1 / r
            if not any(abs(f / k - 1) < 0.02 for k in FACTORES_SPLIT):
                continue
            antes = close.index < fecha
            for df in [close, *otros]:
                df.loc[antes, tk] = df.loc[antes, tk] * r
            volume.loc[antes, tk] = volume.loc[antes, tk] / r
            log["splits"] += 1
    # 3) subida de más de x10 en un día que no es un split: ruptura de la serie (p. ej. Yahoo pega la
    #    acción de antes de una quiebra con la nueva). Se descarta lo anterior. Las caídas NO se tocan:
    #    un -90 % puede ser real y borrarlo inflaría los resultados.
    ratio = close / close.ffill().shift(1)
    ruptura = ratio >= 10
    log["rupturas"] = int(ruptura.sum().sum())
    for tk in ruptura.columns[ruptura.any()]:
        ultima = ruptura.index[ruptura[tk]][-1]
        antes = close.index < ultima
        for df in [close, *otros, volume]:
            df.loc[antes, tk] = np.nan
    return log


def _bajas_tiingo():
    """Empresas de EE. UU. que dejaron de cotizar, con precios de Tiingo (datos_global/alternativos/tiingo).
    Se pasan al formato de precios.parquet: OHLC ajustado SOLO por splits (como Yahoo), dividendos y splits aparte."""
    carpeta = DIR / "alternativos" / "tiingo"
    filas, uni = [], []
    for p in sorted(carpeta.glob("*.csv")):
        t = pd.read_csv(p)
        if len(t) < 120:
            continue
        t["date"] = pd.to_datetime(t["date"].str[:10])
        t = t.sort_values("date")
        sf = t["splitFactor"].fillna(1.0).replace(0, 1.0)
        # factor de los splits posteriores a cada día (para dejar el precio como lo da Yahoo)
        posterior = sf[::-1].cumprod()[::-1].shift(-1).fillna(1.0)
        tk = p.stem
        filas.append(pd.DataFrame({"date": t["date"], "ticker": tk, "open": t["open"] / posterior, "high": t["high"] / posterior,
                                   "low": t["low"] / posterior, "close": t["close"] / posterior, "adj_close": t["adjClose"],
                                   "volume": t["volume"] * posterior, "dividends": t["divCash"].fillna(0) / posterior,
                                   "stock_splits": sf.where(sf != 1.0, 0.0)}))
        uni.append({"ticker": tk, "nombre": f"{tk} (dejó de cotizar)", "region": "us", "zona": "EE. UU.", "bolsa": "", "divisa": "USD",
                    "cap_eur": np.nan, "volumen_3m": np.nan, "precio": np.nan, "efectivo_eur": np.nan})
    if not filas:
        return None, None
    return pd.concat(filas, ignore_index=True), pd.DataFrame(uni).set_index("ticker")


def cargar(desde="2006-01-01", min_sesiones=120, bajas=False) -> DatosGlobales:
    """bajas=True: añade las empresas que dejaron de cotizar (Tiingo), para investigar sin sesgo de supervivencia."""
    uni = pd.read_csv(DIR / "universo.csv").set_index("ticker")
    df = pd.read_parquet(DIR / "precios.parquet")
    if bajas:
        extra_df, extra_uni = _bajas_tiingo()
        if extra_df is not None:
            nuevos = [t for t in extra_uni.index if t not in uni.index]
            uni = pd.concat([uni, extra_uni.loc[nuevos]])
            df = pd.concat([df, extra_df[extra_df["ticker"].isin(nuevos)]], ignore_index=True)
    df = df[df["date"] >= pd.Timestamp(desde)]
    n = df.groupby("ticker").size()
    df = df[df["ticker"].isin(n.index[n >= min_sesiones]) & df["ticker"].isin(uni.index)]
    calendario = pd.DatetimeIndex(np.sort(df["date"].unique()))
    # solo días laborables (Yahoo a veces deja sábados sueltos en algunos mercados)
    calendario = calendario[calendario.dayofweek < 5]

    def ancha(col, tipo="float32"):
        return df.pivot(index="date", columns="ticker", values=col).reindex(calendario).astype(tipo)

    close, open_, high, low = ancha("close"), ancha("open"), ancha("high"), ancha("low")
    volume = ancha("volume", "float64")
    divs, splits = ancha("dividends").fillna(0), ancha("stock_splits").fillna(0)
    correcciones = _corregir_splits_ancho(close, splits, [open_, high, low])
    limpieza = _limpiar(close, [open_, high, low], volume)

    open_ = open_.where(open_ > 0)
    prev = close.ffill().shift(1)
    rend_div = (divs / prev).where(divs / prev < 0.25, 0.0).fillna(0)
    ret = (close.ffill() / prev - 1 + rend_div).where(close.notna())
    tr_local = (1 + ret.fillna(0)).cumprod().where(close.notna()).astype("float32")

    mercado = pd.read_parquet(DIR / "mercado.parquet")
    fx = _fx(mercado, calendario)
    divisa = uni["divisa"].reindex(close.columns).fillna("EUR")
    fx_tabla = pd.DataFrame({tk: fx.get(d, pd.Series(np.nan, index=calendario)).values
                             for tk, d in divisa.items()}, index=calendario).astype("float32")
    tr_eur = (tr_local / fx_tabla)
    tr_eur = (tr_eur / tr_eur.bfill().iloc[0]).astype("float32")
    factor = (tr_eur / close).ffill()
    open_eur_tr = (open_ * factor).astype("float32")
    efectivo = (close / fx_tabla * volume).astype("float32")

    def serie(tk):
        s = mercado[mercado["ticker"] == tk].set_index("date")["close"].sort_index()
        return s[~s.index.duplicated()].reindex(calendario).ffill()

    sp_usd = serie("^SP500TR")
    sp_eur = sp_usd / fx["USD"]
    datos = DatosGlobales(open_, close, high, low, volume, tr_local, tr_eur, open_eur_tr, efectivo,
                          uni.reindex(close.columns), sp_eur / sp_eur.dropna().iloc[0], sp_usd,
                          serie("^GSPC") / fx["USD"])
    datos.correcciones = correcciones
    datos.dividends = divs
    datos.fx_tabla = fx_tabla
    datos.limpieza = limpieza
    return datos


def tabla_costes(uni: pd.DataFrame) -> pd.DataFrame:
    """Por valor: comisión %, mínimo, impuesto compra/venta y coste de cambio de divisa."""
    filas = {}
    for tk, r in uni.iterrows():
        c = COSTES_MERCADO.get(r["region"], dict(com=0.001, min=5.0))
        imp_c = c.get("imp_compra", 0.0)
        if "cap_imp" in c and not (r.get("cap_eur", 0) > c["cap_imp"]):
            imp_c = 0.0
        filas[tk] = dict(com=c["com"], min=c["min"], imp_compra=imp_c, imp_venta=c.get("imp_venta", 0.0),
                         fx=0.0 if r["divisa"] == "EUR" else COSTE_CAMBIO_DIVISA)
    return pd.DataFrame.from_dict(filas, orient="index")
