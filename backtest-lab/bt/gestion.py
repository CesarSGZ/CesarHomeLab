"""Gestión del dinero: con las MISMAS acciones que elige una estrategia, ¿cuánto meter en cada una y qué hacer con la caja?

Toma la lista de operaciones del motor (qué acción se tiene y cuándo) y re-simula la cartera día a día con otra
política de dinero. La elección de acciones no cambia; cambian los importes:

  tamano       "igual" (cartera / n al comprar, como el motor) | "inv_vol" (más peso a lo menos volátil)
  rebalanceo   None (nunca: las ganadoras crecen) | "M" mensual | "Q" trimestral (todas vuelven a su peso)
  caja         "efectivo" (la caja no rinde) | "sp500" (la caja espera invertida en el S&P 500)
  vol_obj      None | 0.15, 0.20... exposición = min(1, objetivo / volatilidad reciente de la cartera)
  aporte       euros que entran el primer día de cada mes (ahorro)
  destino      a dónde va el aporte: "caja" (espera a la próxima compra) | "repartir" (a todas por igual) |
               "infra" (a las que están por debajo de su peso) | "ganadoras" (a las que más suben) | "sp500"
  piramide     None | x: al revisar, si una posición sube más de x desde la compra, se le añade medio hueco

Costes: comisión, impuestos, cambio de divisa y slippage del motor en cada compra/venta. Para comparar políticas
con aportes se usa la rentabilidad "tipo fondo" (por participación) y el patrimonio final.
"""
from dataclasses import dataclass

import numpy as np
import pandas as pd

from .motor_global import fechas_revision, slippage


@dataclass
class Politica:
    tamano: str = "igual"
    rebalanceo: str | None = None
    caja: str = "efectivo"
    vol_obj: float | None = None
    aporte: float = 0.0
    destino: str = "caja"
    piramide: float | None = None
    nombre: str = ""


def simular(ops: pd.DataFrame, d, ind, costes, n, capital=100_000.0, pol: Politica = Politica(), inicio=None, fin=None):
    tr = d.tr_eur
    ap = d.open_eur_tr
    sp = d.sp500_eur.ffill()
    efec = ind["efectivo_60d"]
    vol60 = ind["volat_60"] if "volat_60" in ind else None
    fechas = tr.loc[inicio or ops["fecha_entrada"].min(): fin].index
    revis = fechas_revision(fechas)
    meses = set(pd.Series(fechas, index=fechas).groupby(fechas.to_period("M")).min().values)
    trimestres = set(pd.Series(fechas, index=fechas).groupby(fechas.to_period("Q")).min().values)
    o = ops.copy()
    o["fecha_salida"] = o["fecha_salida"].fillna(fechas[-1] + pd.Timedelta(days=1))
    entradas = o.groupby("fecha_entrada")["ticker"].apply(list).to_dict()
    salidas = o.groupby("fecha_salida")["ticker"].apply(list).to_dict()
    com, cmin, imp_c, imp_v, cfx = costes["com"], costes["min"], costes["imp_compra"], costes["imp_venta"], costes["fx"]

    def coste(tk, importe, venta):
        imp = imp_v[tk] if venta else imp_c[tk]
        e = efec.at[dia, tk] if np.isfinite(efec.at[dia, tk]) else 0.0
        return importe * (slippage(e, importe) + imp + cfx[tk]) + max(cmin[tk], com[tk] * importe)

    def precio(tk, campo):
        s = (ap if campo == "open" else tr)[tk]
        p = s.at[dia]
        return p if np.isfinite(p) else tr[tk].loc[:dia].dropna().iloc[-1]

    caja, sp_u = capital, 0.0          # efectivo y participaciones del S&P 500 donde espera la caja
    pos = {}                            # ticker -> unidades
    compra = {}                         # ticker -> precio de compra (para pirámide/ganadoras)
    eq, nav, flujos = [], [], []
    participaciones = capital
    costes_tot = 0.0
    hist = []

    def total(campo="close"):
        v = sum(u * precio(t, campo) for t, u in pos.items())
        return caja + sp_u * sp.at[dia] + v

    def liquidez(importe):
        """Saca dinero del S&P si la caja no llega."""
        nonlocal caja, sp_u
        if caja < importe and sp_u > 0:
            vender = min(sp_u, (importe - caja) / sp.at[dia])
            caja += vender * sp.at[dia] * (1 - 0.0005)
            sp_u -= vender

    def comprar(tk, importe):
        nonlocal caja, costes_tot
        if importe <= 0:
            return
        liquidez(importe * 1.01)
        importe = min(importe, caja / 1.01)
        if importe < 50:
            return
        g = coste(tk, importe, False)
        caja -= importe + g
        costes_tot += g
        pos[tk] = pos.get(tk, 0.0) + importe / precio(tk, "open")

    def vender(tk, unidades):
        nonlocal caja, costes_tot
        unidades = min(unidades, pos.get(tk, 0.0))
        if unidades <= 0:
            return
        importe = unidades * precio(tk, "open")
        g = coste(tk, importe, True)
        caja += importe - g
        costes_tot += g
        pos[tk] -= unidades
        if pos[tk] <= 1e-12:
            del pos[tk]
            compra.pop(tk, None)

    def pesos_objetivo(tks):
        if pol.tamano == "inv_vol" and vol60 is not None:
            v = pd.Series({t: vol60.at[dia, t] for t in tks}).replace(0, np.nan)
            w = (1 / v).fillna((1 / v).median() if v.notna().any() else 1.0)
            w = (w / w.mean()).clip(0.5, 1.5)
            return w / w.mean()
        return pd.Series(1.0, index=list(tks))

    def exposicion():
        if pol.vol_obj is None or len(nav) < 40:
            return 1.0
        r = pd.Series(nav[-61:]).pct_change().dropna()
        v = r.std() * np.sqrt(252)
        return float(min(1.0, pol.vol_obj / v)) if v > 0 else 1.0

    def aparcar():
        nonlocal caja, sp_u
        if pol.caja == "sp500" and caja > 1000:
            x = caja - 500
            sp_u += x * (1 - 0.0005) / sp.at[dia]
            caja -= x

    for dia in fechas:
        flujo = 0.0
        # aportación del mes (antes de abrir)
        if pol.aporte and dia in meses and dia != fechas[0]:
            caja += pol.aporte
            flujo = pol.aporte
            participaciones += pol.aporte / (nav[-1] if nav else 1.0)
            if pol.destino == "sp500":
                sp_u += pol.aporte * (1 - 0.0005) / sp.at[dia]
                caja -= pol.aporte
            elif pol.destino in ("repartir", "infra", "ganadoras") and pos:
                v = total("open")
                f = exposicion()
                obj = v * f / n
                tks = list(pos)
                if pol.destino == "repartir":
                    for t in tks:
                        comprar(t, pol.aporte / len(tks))
                elif pol.destino == "infra":
                    falta = {t: max(0.0, obj - pos[t] * precio(t, "open")) for t in tks}
                    s = sum(falta.values())
                    for t, x in falta.items():
                        if s > 0:
                            comprar(t, pol.aporte * x / s)
                else:
                    gan = sorted(tks, key=lambda t: precio(t, "open") / compra.get(t, precio(t, "open")), reverse=True)[:max(1, len(tks) // 4)]
                    for t in gan:
                        comprar(t, pol.aporte / len(gan))
        # ventas y compras de la estrategia en la apertura
        for tk in salidas.get(dia, []):
            if tk in pos:
                vender(tk, pos[tk])
        nuevas = [t for t in entradas.get(dia, []) if t not in pos]
        if nuevas:
            v = total("open")
            f = exposicion()
            w = pesos_objetivo(list(pos) + nuevas)
            for tk in nuevas:
                comprar(tk, v * f / n * w[tk])
                compra[tk] = precio(tk, "open")
        # rebalanceo periódico (al peso objetivo) o ajuste de exposición
        toca = (pol.rebalanceo == "M" and dia in meses) or (pol.rebalanceo == "Q" and dia in trimestres) or \
               (pol.vol_obj is not None and dia in meses)
        if toca and pos:
            v = total("open")
            f = exposicion()
            w = pesos_objetivo(list(pos))
            for tk in list(pos):
                obj = v * f / n * w[tk]
                act = pos[tk] * precio(tk, "open")
                dif = obj - act
                if abs(dif) > 0.1 * v / n:                   # banda: no se mueven importes pequeños
                    if dif > 0:
                        comprar(tk, dif)
                    else:
                        vender(tk, -dif / precio(tk, "open"))
        # pirámide: añadir medio hueco a las que van ganando mucho
        if pol.piramide is not None and dia in revis and pos:
            v = total("open")
            for tk in list(pos):
                if precio(tk, "open") / compra.get(tk, np.inf) - 1 > pol.piramide and pos[tk] * precio(tk, "open") < 1.4 * v / n:
                    comprar(tk, 0.5 * v / n)
                    compra[tk] = precio(tk, "open") * 10        # solo una vez por posición
        aparcar()
        valor = total("close")
        eq.append(valor)
        nav.append(valor / participaciones)
        flujos.append(flujo)
        hist.append(len(pos))
    idx = fechas
    return {"patrimonio": pd.Series(eq, index=idx), "nav": pd.Series(nav, index=idx) * capital,
            "flujos": pd.Series(flujos, index=idx), "posiciones": pd.Series(hist, index=idx), "costes": costes_tot}


def tir(patrimonio: pd.Series, flujos: pd.Series, capital: float) -> float:
    """Rentabilidad anual del dinero aportado (TIR) con aportes en las fechas en que entraron."""
    t = (patrimonio.index - patrimonio.index[0]).days / 365.25
    cf = -flujos.values.copy()
    cf[0] -= capital
    cf[-1] += patrimonio.iloc[-1]
    lo, hi = -0.99, 1.0
    for _ in range(100):
        r = (lo + hi) / 2
        vpn = np.sum(cf / (1 + r) ** t)
        lo, hi = (r, hi) if vpn > 0 else (lo, r)
    return (lo + hi) / 2
