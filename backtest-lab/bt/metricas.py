import numpy as np
import pandas as pd


def metricas(eq: pd.Series, exposicion: pd.Series | None = None,
             ops: pd.DataFrame | None = None) -> dict:
    eq = eq.dropna()
    if len(eq) < 2:
        return {}
    r = eq.pct_change().dropna()
    anios = (eq.index[-1] - eq.index[0]).days / 365.25
    cagr = (eq.iloc[-1] / eq.iloc[0]) ** (1 / anios) - 1 if anios > 0 else np.nan
    vol = r.std() * np.sqrt(252)
    dd = eq / eq.cummax() - 1
    m = {
        "Periodo": f"{eq.index[0]:%Y-%m-%d} a {eq.index[-1]:%Y-%m-%d}",
        "Anios": round(anios, 1),
        "Rentabilidad total": eq.iloc[-1] / eq.iloc[0] - 1,
        "CAGR": cagr,
        "Volatilidad": vol,
        "Sharpe (rf=0)": (r.mean() * 252) / vol if vol > 0 else np.nan,
        "Drawdown maximo": dd.min(),
        "Calmar": cagr / abs(dd.min()) if dd.min() < 0 else np.nan,
    }
    if exposicion is not None:
        m["Exposicion media"] = exposicion.loc[eq.index[0]: eq.index[-1]].mean()
    if ops is not None:
        o = ops[(ops["fecha_entrada"] >= eq.index[0]) & (ops["fecha_entrada"] <= eq.index[-1])]
        cerradas = o[o["motivo_salida"] != "abierta"]
        m["Operaciones (compras)"] = len(o)
        m["Operaciones/anio"] = len(o) / anios if anios > 0 else np.nan
        m["% aciertos"] = (cerradas["rentabilidad"] > 0).mean() if len(cerradas) else np.nan
        m["Ganancia media"] = cerradas.loc[cerradas.rentabilidad > 0, "rentabilidad"].mean()
        m["Perdida media"] = cerradas.loc[cerradas.rentabilidad <= 0, "rentabilidad"].mean()
        m["Dias medios en cartera"] = cerradas["dias"].mean()
    return m


def rentabilidad_anual(series: dict[str, pd.Series]) -> pd.DataFrame:
    out = {}
    for nombre, eq in series.items():
        eq = eq.dropna()
        fin_anio = eq.groupby(eq.index.year).last()
        ini = pd.concat([pd.Series([eq.iloc[0]], index=[fin_anio.index[0] - 1]), fin_anio])
        out[nombre] = (ini / ini.shift(1) - 1).iloc[1:]
    return pd.DataFrame(out)


def tramo(eq: pd.Series, desde=None, hasta=None) -> pd.Series:
    s = eq.loc[desde:hasta].dropna()
    return s / s.iloc[0] if len(s) else s
