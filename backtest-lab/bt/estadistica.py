"""Métricas frente a un benchmark y corrección por haber probado muchas variantes."""
import math

import numpy as np
import pandas as pd
from statistics import NormalDist

N = NormalDist()


def metricas_vs(eq: pd.Series, bench: pd.Series, desde=None, hasta=None) -> dict:
    a = eq.loc[desde:hasta].dropna()
    b = bench.reindex(a.index).ffill()
    a, b = a / a.iloc[0], b / b.iloc[0]
    anios = (a.index[-1] - a.index[0]).days / 365.25
    ra, rb = a.resample("W-FRI").last().pct_change().dropna(), b.resample("W-FRI").last().pct_change().dropna()
    ex = (ra - rb).dropna()
    cagr = a.iloc[-1] ** (1 / anios) - 1
    cagr_b = b.iloc[-1] ** (1 / anios) - 1
    vol = ra.std() * np.sqrt(52)
    vol_b = rb.std() * np.sqrt(52)
    te = ex.std() * np.sqrt(52)
    ir = ex.mean() * 52 / te if te > 0 else np.nan
    return {
        "anios": anios, "cagr": cagr, "cagr_bench": cagr_b, "exceso": cagr - cagr_b,
        "sharpe": ra.mean() * 52 / vol if vol > 0 else np.nan,
        "sharpe_bench": rb.mean() * 52 / vol_b if vol_b > 0 else np.nan,
        "maxdd": (a / a.cummax() - 1).min(), "maxdd_bench": (b / b.cummax() - 1).min(),
        "ir": ir, "t": ir * math.sqrt(len(ex) / 52) if np.isfinite(ir) else np.nan,
        "semanas": len(ex),
    }


def sharpe_deflactado(sr_anual: float, n_semanas: int, sr_pruebas: list, asimetria=0.0, curtosis=3.0) -> float:
    """Probabilidad de que el ratio (anualizado) sea > 0 de verdad, teniendo en cuenta que es el mejor
    de len(sr_pruebas) intentos (Bailey y López de Prado, 2014). Se trabaja en unidades semanales."""
    k = len(sr_pruebas)
    if k < 2 or n_semanas < 10:
        return float("nan")
    sr = sr_anual / math.sqrt(52)
    v = np.nanvar(np.array(sr_pruebas) / math.sqrt(52))
    g = 0.5772156649
    sr0 = math.sqrt(v) * ((1 - g) * N.inv_cdf(1 - 1 / k) + g * N.inv_cdf(1 - 1 / (k * math.e)))
    den = math.sqrt(max(1e-12, 1 - asimetria * sr + (curtosis - 1) / 4 * sr ** 2))
    return N.cdf((sr - sr0) * math.sqrt(n_semanas - 1) / den)


def p_valor(t: float) -> float:
    return 1 - N.cdf(t) if np.isfinite(t) else float("nan")
