"""Carga de los CSV descargados y validacion de calidad."""
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
DIR_DATOS = RAIZ / "datos"

INDICE = "^IBEX"
ETF_IBEX = "BBVAI.MC"          # proxy del IBEX 35 con dividendos (cierre ajustado del ETF)
ETF_IBEX_ALT = "LYXIB.MC"
FX = "EURUSD=X"
NO_ACCIONES = {INDICE, ETF_IBEX, ETF_IBEX_ALT, FX}


@dataclass
class Precios:
    """Tablas anchas (fecha x ticker). Calendario = sesiones del IBEX."""
    open: pd.DataFrame
    close: pd.DataFrame        # ajustado por splits, no por dividendos (precio "real" salvo splits)
    adj_close: pd.DataFrame    # ajustado por splits y dividendos (rentabilidad total)
    adj_open: pd.DataFrame
    volume: pd.DataFrame
    splits: pd.DataFrame
    dividends: pd.DataFrame
    efectivo: pd.DataFrame     # euros negociados al dia (close * volume)
    fx_eurusd: pd.Series
    indice: pd.Series          # ^IBEX (solo precio)
    etf_ibex: pd.Series        # cierre ajustado del ETF (con dividendos)

    @property
    def tickers(self):
        return list(self.close.columns)


CORRECCIONES = []   # se rellena al cargar: splits que Yahoo no ha aplicado al historico


def _corregir_splits(g: pd.DataFrame) -> pd.DataFrame:
    """Yahoo a veces registra un split/contrasplit pero no ajusta el historico (o lo fecha mal).
    Si hay un salto de precio >=3x y un split registrado a +-10 sesiones de tamano parecido,
    se reescala todo lo anterior al salto para que la serie sea continua."""
    g = g.sort_values("date").reset_index(drop=True)
    g["volume"] = g["volume"].astype(float)
    splits = g.loc[g["stock_splits"].fillna(0) > 0, ["date", "stock_splits"]]
    if splits.empty:
        return g
    ratio = g["close"] / g["close"].shift(1)
    for _, (fs, f) in splits.iterrows():
        if f == 1:
            continue
        i_split = g.index[g["date"] == fs][0]
        ventana = ratio.iloc[max(1, i_split - 10): i_split + 11]
        cand = ventana[(np.log(ventana).abs() >= np.log(3))]
        cand = cand[(np.log(cand).abs() / abs(np.log(f)) - 1).abs() < 0.25]
        if cand.empty:
            continue
        i_salto = cand.index[0]
        r = ratio.loc[i_salto]
        cols = ["open", "high", "low", "close", "adj_close"]
        g.loc[: i_salto - 1, cols] = g.loc[: i_salto - 1, cols] * r
        g.loc[: i_salto - 1, "volume"] = g.loc[: i_salto - 1, "volume"] / r
        CORRECCIONES.append({"ticker": g["ticker"].iloc[0], "fecha_salto": g.loc[i_salto, "date"].date(),
                             "split_registrado": fs.date(), "factor_split": f, "reescalado": round(r, 4)})
        ratio = g["close"] / g["close"].shift(1)
    return g


def cargar_precios(dir_datos: Path = DIR_DATOS) -> Precios:
    df = pd.read_csv(dir_datos / "precios.csv.gz", parse_dates=["date"])
    df = df.drop_duplicates(["ticker", "date"], keep="last")
    CORRECCIONES.clear()
    df = pd.concat([_corregir_splits(g) for _, g in df.groupby("ticker")], ignore_index=True)
    calendario = pd.DatetimeIndex(sorted(df.loc[df.ticker == INDICE, "date"].unique()))

    def ancha(col):
        return df.pivot(index="date", columns="ticker", values=col).reindex(calendario)

    close_all = ancha("close")
    adj_all = ancha("adj_close")
    acciones = [c for c in close_all.columns if c not in NO_ACCIONES]

    close = close_all[acciones]
    open_ = ancha("open")[acciones]
    vol = ancha("volume")[acciones]
    divs = ancha("dividends")[acciones].fillna(0.0)
    # Rentabilidad total propia (cierre + dividendo), en vez del adj_close de Yahoo, que
    # tiene saltos erroneos en algunos valores. Dividendos > 25% del precio se descartan.
    prev = close.ffill().shift(1)
    rend_div = (divs / prev).where(divs / prev < 0.25, 0.0).fillna(0.0)
    ret_tot = (close.ffill() / prev - 1 + rend_div).where(close.notna())
    adj = (1 + ret_tot.fillna(0)).cumprod().where(close.notna())
    # reescala para que el ultimo valor coincida con el cierre (solo estetico)
    adj = adj / adj.ffill().iloc[-1] * close.ffill().iloc[-1]
    # Yahoo a veces deja open=0 o NaN en dias sin negociacion: usa el cierre previo
    open_ = open_.where(open_ > 0)
    factor = (adj / close).ffill()
    adj_open = open_ * factor

    fx = df.loc[df.ticker == FX].set_index("date")["close"].sort_index()
    fx = fx[~fx.index.duplicated()].reindex(calendario, method="ffill")

    return Precios(
        open=open_, close=close, adj_close=adj, adj_open=adj_open, volume=vol,
        splits=ancha("stock_splits")[acciones].fillna(0.0),
        dividends=divs,
        efectivo=(close * vol),
        fx_eurusd=fx,
        indice=close_all[INDICE],
        etf_ibex=_rent_total(close_all[ETF_IBEX], ancha("dividends")[ETF_IBEX].fillna(0.0)),
    )


def _rent_total(close: pd.Series, divs: pd.Series) -> pd.Series:
    prev = close.ffill().shift(1)
    r = (close.ffill() / prev - 1 + (divs / prev).fillna(0)).fillna(0)
    return (1 + r).cumprod().where(close.ffill().notna())


def cargar_info(dir_datos: Path = DIR_DATOS) -> pd.DataFrame:
    info = pd.read_csv(dir_datos / "info.csv").set_index("ticker")
    info["sector"] = info["sector"].fillna("Desconocido")
    info["industry"] = info["industry"].fillna("Desconocido")
    info["financialCurrency"] = info["financialCurrency"].fillna("EUR")
    return info


# ---------------------------------------------------------------- validacion

def validar_precios(p: Precios) -> pd.DataFrame:
    filas = []
    ret = p.adj_close.pct_change(fill_method=None)
    ret_close = p.close.pct_change(fill_method=None)
    hace_1a = p.close.index[-1] - pd.Timedelta(days=365)
    for tk in p.tickers:
        c = p.close[tk]
        validos = c.dropna()
        if validos.empty:
            filas.append({"ticker": tk, "sesiones": 0})
            continue
        ini, fin = validos.index[0], validos.index[-1]
        vida = c.loc[ini:fin]
        huecos = vida.isna()
        # racha maxima de sesiones sin dato
        rachas = huecos.groupby((~huecos).cumsum()).sum()
        v = p.volume[tk].loc[ini:fin]
        r = ret[tk].loc[ini:fin]
        rc = ret_close[tk].loc[ini:fin]
        sp = p.splits[tk]
        sp = sp[sp > 0]
        # saltos sospechosos: movimiento diario > 40% con el precio ajustado por splits
        saltos = rc[rc.abs() > 0.40]
        # dias en que el ajuste por dividendos cambia >25% de golpe (dividendo/ajuste raro)
        fac = (p.adj_close[tk] / c).loc[ini:fin]
        salto_fac = fac.pct_change(fill_method=None).abs()
        filas.append({
            "ticker": tk,
            "desde": ini.date(), "hasta": fin.date(),
            "anios": round((fin - ini).days / 365.25, 1),
            "sesiones": int(vida.notna().sum()),
            "pct_huecos": round(100 * huecos.mean(), 2),
            "max_hueco_sesiones": int(rachas.max()) if len(rachas) else 0,
            "pct_dias_vol0_ult_anio": round(100 * (v.loc[hace_1a:] .fillna(0) == 0).mean(), 1),
            "efectivo_mediano_ult_anio_keur": round((c * v).loc[hace_1a:].median() / 1e3, 0),
            "n_splits": int(len(sp)),
            "splits": "; ".join(f"{d:%Y-%m-%d}:{x:.3g}" for d, x in sp.items()),
            "saltos_40pct": int(len(saltos)),
            "fechas_saltos": "; ".join(f"{d:%Y-%m-%d}:{x:+.0%}" for d, x in saltos.head(5).items()),
            "saltos_ajuste_div": int((salto_fac > 0.25).sum()),
            "precio_min": round(float(validos.min()), 4),
            "precio_max": round(float(validos.max()), 4),
            "precio_no_positivo": int((validos <= 0).sum()),
            "ret_max_dia": round(float(r.max()), 3) if r.notna().any() else np.nan,
            "ret_min_dia": round(float(r.min()), 3) if r.notna().any() else np.nan,
            "ultimo_dato_desfasado": fin < p.close.index[-1] - pd.Timedelta(days=10),
        })
    return pd.DataFrame(filas).set_index("ticker")


def dias_anomalos(p: Precios, umbral: float = 3.0) -> pd.DataFrame:
    """True en sesiones con salto de precio >= umbral (x3 o /3) sin explicacion.
    El motor no abre posiciones en un valor durante 60 sesiones tras uno de estos dias."""
    r = p.close / p.close.ffill().shift(1)
    return (r >= umbral) | (r <= 1 / umbral)
