"""Indicadores diarios de precio y volumen (fecha x valor), calculados solo con datos hasta ese cierre.

La técnica (medias, momentum, rupturas) usa el índice de rentabilidad total en divisa local: es lo que
"ve" el gráfico de la acción. La rentabilidad del inversor se mide aparte en EUR.
"""
import numpy as np
import pandas as pd


def _f32(df):
    return df.astype("float32")


def calcular(d, anomalia_umbral=3.0) -> dict:
    px = d.tr_local.ffill(limit=5)
    vivo = d.close.notna()
    ret = px.pct_change(fill_method=None)
    vol = d.volume.where(d.volume > 0)
    vol_f = vol.ffill(limit=5)
    ind = {"px": d.tr_eur.ffill(limit=5), "px_local": px}

    # --- precio
    ind["sma50"] = _f32(px.rolling(50, min_periods=45).mean())
    ind["sma200"] = _f32(px.rolling(200, min_periods=180).mean())
    ind["sobre_sma200"] = _f32(px / ind["sma200"] - 1)
    for n, dias in [("1m", 21), ("3m", 63), ("6m", 126), ("12m", 252)]:
        ind[f"mom_{n}"] = _f32(px / px.shift(dias) - 1)
    ind["mom_12_1"] = _f32(px.shift(21) / px.shift(252) - 1)
    ind["volat_1a"] = _f32(ret.rolling(252, min_periods=150).std() * np.sqrt(252))
    ind["volat_60"] = _f32(ret.rolling(60, min_periods=40).std() * np.sqrt(252))
    ind["sharpe_1a"] = _f32(ind["mom_12m"] / ind["volat_1a"])
    ind["max_55"] = _f32(px.shift(1).rolling(55, min_periods=40).max())
    ind["max_252"] = _f32(px.shift(1).rolling(252, min_periods=150).max())
    ind["ruptura_55"] = px >= ind["max_55"]
    ind["ruptura_252"] = px >= ind["max_252"]
    ind["dist_max_252"] = _f32(px / px.rolling(252, min_periods=150).max() - 1)

    # --- volumen
    v5 = vol_f.rolling(5, min_periods=3).mean()
    v20 = vol_f.rolling(20, min_periods=15).mean()
    v50 = vol_f.rolling(50, min_periods=35).mean()
    v100 = vol_f.rolling(100, min_periods=70).mean()
    ind["rvol_5_50"] = _f32(v5 / v50)                 # volumen de la última semana frente a su media
    ind["rvol_20_100"] = _f32(v20 / v100)             # participación del último mes frente al trimestre
    sube = ret > 0
    baja = ret < 0
    vu = vol_f.where(sube, 0).rolling(50, min_periods=35).sum()
    vd = vol_f.where(baja, 0).rolling(50, min_periods=35).sum()
    ind["vol_alcista_50"] = _f32(vu / vd.replace(0, np.nan))   # volumen en días de subida / bajada
    rango = (d.high - d.low).replace(0, np.nan)
    clv = ((d.close - d.low) - (d.high - d.close)) / rango    # dónde cierra dentro del rango del día
    ind["cmf_20"] = _f32((clv * vol).rolling(20, min_periods=15).sum() / vol.rolling(20, min_periods=15).sum())
    obv = (np.sign(ret).fillna(0) * vol.fillna(0)).cumsum()
    ind["obv_tend_50"] = _f32((obv - obv.shift(50)) / (v50 * 50))
    # día de volumen excepcional con subida en la última semana (posible entrada institucional)
    pico_alcista = (vol >= 2 * v50.shift(1)) & (ret > 0.02)
    ind["pico_alcista_5d"] = pico_alcista.rolling(5, min_periods=1).max().astype(bool)
    pico_bajista = (vol >= 2 * v50.shift(1)) & (ret < -0.04)
    ind["pico_bajista_5d"] = pico_bajista.rolling(5, min_periods=1).max().astype(bool)

    # --- ideas "raras" (ronda 4)
    sube_d = (ret > 0).astype("float32").where(ret.notna())
    baja_d = (ret < 0).astype("float32").where(ret.notna())
    p_up = sube_d.rolling(252, min_periods=150).mean()
    p_dn = baja_d.rolling(252, min_periods=150).mean()
    # "rana en la olla": negativo = la subida vino de muchos días pequeños (continua), positivo = a saltos
    ind["discrecion"] = _f32(np.sign(ind["mom_12_1"]) * (p_dn - p_up))
    ind["max_dia_21"] = _f32(ret.rolling(21, min_periods=15).max())          # efecto "lotería" (MAX)
    divs12 = d.dividends.rolling(252, min_periods=1).sum()
    ind["rent_div"] = _f32((divs12 / d.close.ffill()).where(vivo))           # dividendo de 12 meses / precio
    hueco = d.open / d.close.ffill().shift(1) - 1
    salto = (hueco >= 0.05) & (vol >= 3 * v50.shift(1)) & (d.close >= d.open)
    ind["salto_vol_5d"] = salto.rolling(5, min_periods=1).max().astype(bool)
    ind["salto_vol_63d"] = salto.rolling(63, min_periods=1).max().astype(bool)
    ind["contraccion"] = _f32(ind["volat_60"] / ind["volat_1a"])           # < 1: la volatilidad se ha encogido
    ind["mom_1s"] = _f32(px / px.shift(5) - 1)
    # zonas (constantes por valor)
    zona = d.universo["zona"].reindex(px.columns)
    for nombre, z in [("es_eeuu", "EE. UU."), ("es_europa", "Europa"), ("es_asia", "Asia-Pacífico")]:
        ind[nombre] = pd.DataFrame(np.broadcast_to((zona == z).values, px.shape), index=px.index, columns=px.columns)
    # índice equiponderado por zona (momentum de 6 meses) para la rotación entre zonas
    liq = (d.efectivo_eur.rolling(60, min_periods=40).median() >= 2e6).shift(1, fill_value=False)
    reteur = d.tr_eur.pct_change(fill_method=None).where(liq)
    zona_lider = pd.DataFrame(False, index=px.index, columns=px.columns)
    mom_z = {}
    for z in ["EE. UU.", "Europa", "Asia-Pacífico"]:
        cols = zona.index[zona == z]
        idx = (1 + reteur[cols].mean(axis=1).fillna(0)).cumprod()
        mom_z[z] = idx / idx.shift(126) - 1
    mz = pd.DataFrame(mom_z)
    lider = mz.fillna(-np.inf).idxmax(axis=1).where(mz.max(axis=1) > 0)
    for z in mz.columns:
        zona_lider.loc[lider == z, zona.index[zona == z]] = True
    ind["zona_lider"] = zona_lider
    # calendario: últimos 4 y primeros 3 días hábiles de cada mes (efecto cambio de mes)
    fechas = px.index.to_series()
    mes = fechas.dt.to_period("M")
    pos = fechas.groupby(mes).cumcount()
    desde_fin = fechas.groupby(mes).cumcount(ascending=False)
    tom = ((desde_fin < 4) | (pos < 3)).values
    ind["cambio_mes"] = pd.DataFrame(np.broadcast_to(tom[:, None], px.shape), index=px.index, columns=px.columns)

    # --- liquidez y calidad de datos
    ind["efectivo_60d"] = _f32(d.efectivo_eur.rolling(60, min_periods=40).median())
    r = d.close / d.close.ffill().shift(1)
    anom = (r >= anomalia_umbral) | (r <= 1 / anomalia_umbral)
    ind["anomalia_reciente"] = anom.rolling(60, min_periods=1).max().astype(bool)
    ind["vivo"] = vivo
    ind.update(semaforo_precio(d))
    return ind


def semaforo_precio(d) -> dict:
    """Alertas de precio del semáforo (análisis de perdedoras, octubre de 2026), con rentabilidad total en EUR:
      r2_mercado  R² con el S&P 500 a 1 año (bajo = 'va por libre')
      max5_21     media de los 5 mejores días del último mes ('días de lotería'); solo en el cierre de cada semana
    """
    from .motor_global import fechas_revision
    r = np.log(d.tr_eur.astype("float64")).diff().where(d.close.notna())
    sp_r = np.log(d.sp500_eur.ffill()).diff()
    r2 = r.rolling(252, min_periods=150).corr(sp_r) ** 2
    fechas = pd.DatetimeIndex(sorted(fechas_revision(d.close.index)))
    pos = d.close.index.get_indexer(fechas)
    R = r.values
    max5 = np.full((len(fechas), R.shape[1]), np.nan)
    for i, p in enumerate(pos):
        if p < 21:
            continue
        w = R[p - 20:p + 1]
        nn = np.isfinite(w).sum(axis=0)
        top = -np.sort(-np.where(np.isfinite(w), w, -np.inf), axis=0)[:5]
        with np.errstate(invalid="ignore"):
            m = np.where(np.isfinite(top), top, np.nan).mean(axis=0)
        max5[i] = np.where(nn >= 15, m, np.nan)
    max5 = pd.DataFrame(max5, index=fechas, columns=d.close.columns).reindex(d.close.index).ffill()
    return {"r2_mercado": _f32(r2), "max5_21": _f32(max5)}


def beta_frente(ret_valores: pd.DataFrame, ret_ref: pd.Series, ventana=252) -> pd.DataFrame:
    """Beta móvil de cada valor frente a una referencia (rentabilidades diarias en EUR)."""
    rr = ret_ref.reindex(ret_valores.index).fillna(0)
    x = ret_valores.fillna(0)
    m = lambda df: df.rolling(ventana, min_periods=150).mean()
    cov = m(x.mul(rr, axis=0)) - m(x).mul(m(rr), axis=0)   # E[xy] - E[x]E[y], vectorizado
    var = m(rr * rr) - m(rr) ** 2
    return _f32(cov.div(var, axis=0).where(ret_valores.notna()))
