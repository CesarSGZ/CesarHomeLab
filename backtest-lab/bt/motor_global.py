"""Motor de backtesting global (universo multi-mercado, todo en EUR).

Reglas (las mismas que el motor español, verificado contra comprar y mantener):
  - Señales con el cierre del último día de cada semana; órdenes en la apertura de la sesión siguiente
    de ese valor (si su bolsa está cerrada, la compra se reintenta hasta 3 sesiones).
  - Ventas primero; compras hasta completar n posiciones; cada compra = cartera / n.
  - Costes por mercado (comisión IBKR aprox., impuestos a la compra/venta, cambio de divisa) + slippage
    según liquidez + impacto si la orden pesa más del 1 % del efectivo diario.
  - Dividendos reinvertidos en el valor (rentabilidad total en EUR), sin impuestos.
"""
from dataclasses import dataclass, field
from typing import Callable

import numpy as np
import pandas as pd

from .global_datos import TRAMOS_SLIPPAGE


@dataclass
class EstrategiaG:
    nombre: str
    entrada: Callable[[pd.DataFrame], pd.Series]
    mantener: Callable[[pd.DataFrame], pd.Series]
    puntuacion: Callable[[pd.DataFrame], pd.Series]
    n_posiciones: int = 20
    inicio: str = "2008-01-01"
    fin_entrenamiento: str = "2018-12-31"
    liquidez_min: float = 2e6
    capital_inicial: float = 100_000
    filtro_mercado: bool = False          # sin compras nuevas si el S&P 500 (EUR) está bajo su media de 200
    vender_si_mercado_bajista: bool = False
    usa_fundamentales: bool = False
    parametros: dict = field(default_factory=dict)
    reglas: dict = field(default_factory=dict)
    familia: str = ""
    frecuencia: str = "W"                 # "W": revisa cada viernes; "D": cada sesión


@dataclass
class ResultadoG:
    estrategia: EstrategiaG
    equity: pd.Series
    exposicion: pd.Series
    n_posiciones: pd.Series
    operaciones: pd.DataFrame
    costes_totales: float


def fechas_revision(indice):
    s = pd.Series(indice, index=indice)
    return set(s.groupby(indice.to_period("W-FRI")).max().values)


def slippage(efectivo, importe):
    e = efectivo if np.isfinite(efectivo) else 0.0
    s = next(c for u, c in TRAMOS_SLIPPAGE if e >= u)
    if e > 0 and importe / e > 0.01:
        s += 0.005
    return s


def tabla_semana(fecha, ind, columnas, extra=None):
    t = pd.DataFrame({k: ind[k].loc[fecha] for k in columnas})
    if extra is not None:
        t = t.join(extra, how="left")
    return t


def ejecutar(est: EstrategiaG, d, ind, costes: pd.DataFrame, columnas, extra_por_fecha=None,
             regimen: pd.Series | None = None, fin=None) -> ResultadoG:
    fechas = d.close.loc[est.inicio: fin].index
    revisiones = set(fechas) if est.frecuencia == "D" else fechas_revision(fechas)
    px, apertura, vol = ind["px"], d.adj_open, d.volume
    efec = ind["efectivo_60d"]
    com, cmin = costes["com"], costes["min"]
    imp_c, imp_v, cfx = costes["imp_compra"], costes["imp_venta"], costes["fx"]

    caja = est.capital_inicial
    unidades, abiertas, maximo = {}, {}, {}
    ventas_pend, compras_pend = {}, []
    ops, eq, expo, npos = [], [], [], []
    costes_tot = 0.0
    ultimo = {}

    def coste_compra(tk, importe, e):
        return importe * (slippage(e, importe) + imp_c[tk] + cfx[tk]) + max(cmin[tk], com[tk] * importe)

    for d_ in fechas:
        # ---------- ejecución en la apertura
        if ventas_pend:
            for tk, motivo in list(ventas_pend.items()):
                p = apertura.at[d_, tk]
                if not (np.isfinite(p) and vol.at[d_, tk] > 0):
                    if motivo != "sin datos":
                        continue
                    p = px[tk].loc[:d_].dropna().iloc[-1]
                importe = unidades[tk] * p
                gasto = importe * (slippage(efec.at[d_, tk], importe) + imp_v[tk] + cfx[tk]) + max(cmin[tk], com[tk] * importe)
                caja += importe - gasto
                costes_tot += gasto
                op = abiertas.pop(tk)
                op.update(fecha_salida=d_, motivo_salida=motivo, importe_salida=importe - gasto,
                          rentabilidad=(importe - gasto) / op["coste_total"] - 1, dias=(d_ - op["fecha_entrada"]).days)
                ops.append(op)
                del unidades[tk], ventas_pend[tk], maximo[tk]
        if compras_pend:
            valor = caja + sum(u * (apertura.at[d_, t] if np.isfinite(apertura.at[d_, t]) else px[t].loc[:d_].dropna().iloc[-1])
                               for t, u in unidades.items())
            objetivo = valor / est.n_posiciones
            quedan = []
            for tk, intentos in compras_pend:
                if tk in unidades or len(unidades) >= est.n_posiciones:
                    continue
                p = apertura.at[d_, tk]
                if not (np.isfinite(p) and vol.at[d_, tk] > 0):
                    if intentos > 1:
                        quedan.append((tk, intentos - 1))
                    continue
                e = efec.at[d_, tk]
                importe = objetivo
                gasto_extra = coste_compra(tk, importe, e)
                if importe + gasto_extra > caja:
                    importe = max(0.0, caja - gasto_extra)
                if importe < 0.5 * objetivo:
                    continue
                gasto_extra = coste_compra(tk, importe, e)
                caja -= importe + gasto_extra
                costes_tot += gasto_extra
                unidades[tk] = importe / p
                maximo[tk] = p
                abiertas[tk] = dict(ticker=tk, fecha_entrada=d_, precio_entrada=d.open.at[d_, tk],
                                    coste_total=importe + gasto_extra, px_entrada=p)
            compras_pend = quedan

        # ---------- valoración al cierre
        valor_pos = 0.0
        for tk, u in unidades.items():
            p = px.at[d_, tk]
            if np.isfinite(p):
                ultimo[tk] = d_
                maximo[tk] = max(maximo[tk], p)
            else:
                p = px[tk].loc[:d_].dropna().iloc[-1]
            valor_pos += u * p
        total = caja + valor_pos
        eq.append(total)
        expo.append(valor_pos / total if total > 0 else 0.0)
        npos.append(len(unidades))

        # ---------- señales al cierre del último día de la semana
        if d_ not in revisiones:
            continue
        extra = extra_por_fecha.get(d_) if extra_por_fecha is not None else None
        if est.usa_fundamentales and extra is None:
            continue
        t = tabla_semana(d_, ind, columnas, extra)
        # estado de las posiciones abiertas, por si la estrategia usa stops o plazos
        t["dias_en_cartera"] = np.nan
        t["caida_desde_max"] = np.nan
        t["ret_desde_entrada"] = np.nan
        for tk in unidades:
            p = px.at[d_, tk] if np.isfinite(px.at[d_, tk]) else px[tk].loc[:d_].dropna().iloc[-1]
            t.at[tk, "dias_en_cartera"] = (d_ - abiertas[tk]["fecha_entrada"]).days
            t.at[tk, "caida_desde_max"] = p / maximo[tk] - 1
            t.at[tk, "ret_desde_entrada"] = p / abiertas[tk]["px_entrada"] - 1
        mercado_ok = True if regimen is None or not est.filtro_mercado else bool(regimen.get(d_, True))
        mantener = est.mantener(t).reindex(t.index).fillna(False).astype(bool)
        for tk in list(unidades):
            if tk in ventas_pend:
                continue
            if (d_ - ultimo.get(tk, d_)).days > 10:
                ventas_pend[tk] = "sin datos"
            elif not mantener.get(tk, False):
                ventas_pend[tk] = "regla de venta"
            elif est.vender_si_mercado_bajista and not mercado_ok:
                ventas_pend[tk] = "mercado bajista"
        libres = est.n_posiciones - (len(unidades) - len(ventas_pend))
        if libres > 0 and mercado_ok:
            ok = (t["vivo"].fillna(False).astype(bool) & (t["efectivo_60d"] >= est.liquidez_min)
                  & ~t["anomalia_reciente"].fillna(True).astype(bool) & ~t.index.isin(list(unidades)))
            cand = est.entrada(t).reindex(t.index).fillna(False).astype(bool) & ok
            if cand.any():
                orden = est.puntuacion(t[cand]).sort_values(ascending=False).index[:libres]
                compras_pend = [(tk, 3) for tk in orden]

    for tk, op in abiertas.items():
        p = px[tk].loc[:fechas[-1]].dropna().iloc[-1]
        op.update(fecha_salida=pd.NaT, motivo_salida="abierta", importe_salida=unidades[tk] * p,
                  rentabilidad=unidades[tk] * p / op["coste_total"] - 1, dias=(fechas[-1] - op["fecha_entrada"]).days)
        ops.append(op)
    o = pd.DataFrame(ops)
    if not o.empty:
        o = o.sort_values("fecha_entrada").reset_index(drop=True)
    idx = fechas
    return ResultadoG(est, pd.Series(eq, index=idx), pd.Series(expo, index=idx), pd.Series(npos, index=idx), o, costes_tot)


def benchmark_equiponderado(ind, inicio, fin, liquidez_min):
    """Toda acción líquida del universo con el mismo peso, rebalanceo diario, sin costes (en EUR)."""
    elig = (ind["efectivo_60d"] >= liquidez_min) & ind["px"].notna() & ~ind["anomalia_reciente"]
    elig = elig.shift(1, fill_value=False)
    ret = ind["px"].pct_change(fill_method=None)
    r = ret.where(elig).mean(axis=1).fillna(0).loc[inicio:fin]
    return (1 + r).cumprod()
