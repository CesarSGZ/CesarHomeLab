"""Motor de backtesting propio, semanal, con ejecucion en la apertura de la sesion siguiente.

Reglas:
  - Senales con el cierre del ultimo dia de cada semana (tabla_transversal de ese dia).
  - Ordenes a la APERTURA de la sesion siguiente (precio de apertura + slippage + comision).
  - Ventas primero; despues compras hasta completar n_posiciones, por orden de puntuacion.
  - Equiponderado: cada compra = valor total de la cartera / n_posiciones (no se rebalancean
    las posiciones ya abiertas, para no generar operaciones innecesarias).
  - No se puede operar un valor en una sesion sin volumen (suspendido): la venta se reintenta
    al dia siguiente; la compra se descarta.
  - Dividendos reinvertidos en el propio valor (precio de rentabilidad total), sin impuestos.
"""
from dataclasses import dataclass, field
from typing import Callable

import numpy as np
import pandas as pd

from .datos import Precios
from .senales import tabla_transversal

INICIO_ITF = pd.Timestamp("2021-01-16")   # Impuesto sobre Transacciones Financieras (0,2% compras)


@dataclass
class Costes:
    # Aproximacion a la tarifa fija de IBKR para BME: 0,05% del importe, minimo 3 EUR por orden.
    comision_pct: float = 0.0005
    comision_min: float = 3.0
    # ITF espanol: 0,2% en compras de empresas espanolas con capitalizacion > 1.000 M EUR
    itf_pct: float = 0.002
    itf_cap_min: float = 1e9
    # slippage por lado segun efectivo medio diario negociado (EUR): (umbral, coste)
    tramos_slippage: tuple = ((20e6, 0.0005), (5e6, 0.0010), (1e6, 0.0020), (0, 0.0040))
    # coste extra si la orden supera este % del efectivo diario
    impacto_umbral: float = 0.02
    impacto_extra: float = 0.0050

    def slippage(self, efectivo_diario: float, importe: float) -> float:
        e = efectivo_diario if np.isfinite(efectivo_diario) else 0.0
        s = next(c for u, c in self.tramos_slippage if e >= u)
        if e > 0 and importe / e > self.impacto_umbral:
            s += self.impacto_extra
        return s

    def comision(self, importe: float) -> float:
        return max(self.comision_min, self.comision_pct * importe)


@dataclass
class Estrategia:
    nombre: str
    descripcion: str
    entrada: Callable[[pd.DataFrame], pd.Series]      # True = candidata a comprar
    mantener: Callable[[pd.DataFrame], pd.Series]     # False = vender
    puntuacion: Callable[[pd.DataFrame], pd.Series]   # mayor = mejor (para elegir entre candidatas)
    n_posiciones: int = 12
    usa_fundamentales: bool = False
    inicio: str = "2008-01-01"
    fin_entrenamiento: str = "2016-12-31"   # a partir de aqui: validacion fuera de muestra
    liquidez_min: float = 1e6               # efectivo mediano diario 60 sesiones (EUR)
    capital_inicial: float = 50_000
    costes: Costes = field(default_factory=Costes)
    parametros: dict = field(default_factory=dict)
    reglas: dict = field(default_factory=dict)   # explicacion en lenguaje llano: compra / venta / cartera


@dataclass
class Resultado:
    estrategia: Estrategia
    equity: pd.Series
    exposicion: pd.Series
    n_posiciones: pd.Series
    operaciones: pd.DataFrame
    costes_totales: float


def fechas_revision(indice: pd.DatetimeIndex) -> pd.DatetimeIndex:
    """Ultima sesion de cada semana."""
    s = pd.Series(indice, index=indice)
    semana = indice.to_period("W-FRI")
    return pd.DatetimeIndex(s.groupby(semana).max().values)


def filtro_universo(t: pd.DataFrame, liquidez_min: float) -> pd.Series:
    ok = t["precio"].notna() & t["px"].notna() & (t["efectivo_60d"] >= liquidez_min)
    if "anomalia_reciente" in t:
        ok &= ~t["anomalia_reciente"].fillna(False).astype(bool)
    return ok


def ejecutar(est: Estrategia, p: Precios, ind: dict, info: pd.DataFrame,
             ratios_por_fecha: dict | None = None, fin: str | None = None) -> Resultado:
    c = est.costes
    fechas = p.close.loc[est.inicio: fin].index
    revisiones = set(fechas_revision(fechas))
    adj_open, adj_close, vol = p.adj_open, ind["px"], p.volume
    efectivo60 = ind["efectivo_60d"]

    caja = est.capital_inicial
    unidades: dict[str, float] = {}
    abiertas: dict[str, dict] = {}
    ventas_pend: dict[str, str] = {}
    compras_pend: list[tuple[str, float]] = []   # (ticker, capitalizacion)
    operaciones = []
    eq, expo, npos = [], [], []
    costes_tot = 0.0
    ultimo_dato = {}

    for d in fechas:
        # ---------------- 1) ejecucion en la apertura
        if ventas_pend or compras_pend:
            for tk, motivo in list(ventas_pend.items()):
                px = adj_open.at[d, tk]
                if not np.isfinite(px) or not (vol.at[d, tk] > 0):
                    px = adj_close.at[d, tk] if motivo == "sin datos" else np.nan
                if not np.isfinite(px):
                    continue   # suspendido: se reintenta manana
                importe = unidades[tk] * px
                s = c.slippage(efectivo60.at[d, tk], importe)
                com = c.comision(importe)
                neto = importe * (1 - s) - com
                caja += neto
                costes_tot += importe * s + com
                op = abiertas.pop(tk)
                px_real = p.open.at[d, tk] if np.isfinite(p.open.at[d, tk]) else p.close[tk].loc[:d].dropna().iloc[-1]
                op.update(fecha_salida=d, precio_salida=px_real, importe_salida=neto, motivo_salida=motivo,
                          rentabilidad=neto / op["coste_total"] - 1,
                          dias=(d - op["fecha_entrada"]).days)
                operaciones.append(op)
                del unidades[tk]
                del ventas_pend[tk]

            if compras_pend:
                valor = caja + sum(u * _precio(adj_open, adj_close, d, tk) for tk, u in unidades.items())
                objetivo = valor / est.n_posiciones
                for tk, cap in compras_pend:
                    if tk in unidades or len(unidades) >= est.n_posiciones:
                        continue
                    px = adj_open.at[d, tk]
                    if not np.isfinite(px) or not (vol.at[d, tk] > 0):
                        continue
                    s = c.slippage(efectivo60.at[d, tk], objetivo)
                    itf = c.itf_pct if (d >= INICIO_ITF and np.isfinite(cap) and cap > c.itf_cap_min) else 0.0
                    coste_pct = s + itf
                    importe = min(objetivo, (caja - c.comision_min) / (1 + coste_pct + c.comision_pct))
                    if importe < 0.5 * objetivo:
                        continue
                    com = c.comision(importe)
                    gasto = importe * (1 + coste_pct) + com
                    caja -= gasto
                    costes_tot += gasto - importe
                    unidades[tk] = importe / px
                    abiertas[tk] = dict(ticker=tk, fecha_entrada=d, precio_entrada=p.open.at[d, tk],
                                        importe_entrada=importe, coste_total=gasto)
                compras_pend = []

        # ---------------- 2) valoracion al cierre
        valor_pos = 0.0
        for tk, u in unidades.items():
            px = adj_close.at[d, tk]
            if np.isfinite(px):
                ultimo_dato[tk] = d
            else:
                px = adj_close[tk].loc[:d].dropna().iloc[-1]
            valor_pos += u * px
        total = caja + valor_pos
        eq.append(total)
        expo.append(valor_pos / total if total > 0 else 0.0)
        npos.append(len(unidades))

        # ---------------- 3) senales al cierre del ultimo dia de la semana
        if d in revisiones:
            rd = ratios_por_fecha.get(d) if ratios_por_fecha is not None else None
            if est.usa_fundamentales and rd is None:
                continue
            t = tabla_transversal(d, ind, rd, info)
            universo = filtro_universo(t, est.liquidez_min)
            mantener = est.mantener(t).reindex(t.index).fillna(False).astype(bool)
            for tk in list(unidades):
                if tk in ventas_pend:
                    continue
                sin_datos = (d - ultimo_dato.get(tk, d)).days > 7
                if sin_datos:
                    ventas_pend[tk] = "sin datos"
                elif not mantener.get(tk, False):
                    debajo = t.at[tk, "px"] < t.at[tk, "sma200"] if tk in t.index else False
                    ventas_pend[tk] = "pierde media 200" if debajo else "deja de cumplir criterios"
            libres = est.n_posiciones - (len(unidades) - len(ventas_pend))
            if libres > 0:
                cand = est.entrada(t).reindex(t.index).fillna(False).astype(bool) & universo
                cand = cand & ~t.index.isin(list(unidades))
                if cand.any():
                    punt = est.puntuacion(t[cand]).sort_values(ascending=False)
                    cap = t["capitalizacion"] if "capitalizacion" in t else t["cap_aprox"]
                    cap = cap.fillna(t["cap_aprox"])
                    compras_pend = [(tk, cap.get(tk, np.nan)) for tk in punt.index[:libres]]

    fechas_eq = fechas
    for tk, op in abiertas.items():
        px = adj_close[tk].loc[:fechas_eq[-1]].dropna().iloc[-1]
        op.update(fecha_salida=pd.NaT, precio_salida=p.close[tk].loc[:fechas_eq[-1]].dropna().iloc[-1],
                  importe_salida=unidades[tk] * px,
                  motivo_salida="abierta", rentabilidad=unidades[tk] * px / op["coste_total"] - 1,
                  dias=(fechas_eq[-1] - op["fecha_entrada"]).days)
        operaciones.append(op)

    ops = pd.DataFrame(operaciones)
    if not ops.empty:
        ops["nombre"] = ops["ticker"].map(info["shortName"]) if "shortName" in info else ""
        ops["sector"] = ops["ticker"].map(info["sector"])
        ops = ops.sort_values("fecha_entrada").reset_index(drop=True)
    return Resultado(est, pd.Series(eq, index=fechas_eq), pd.Series(expo, index=fechas_eq),
                     pd.Series(npos, index=fechas_eq), ops, costes_tot)


def _precio(adj_open, adj_close, d, tk):
    px = adj_open.at[d, tk]
    if not np.isfinite(px):
        s = adj_close[tk].loc[:d].dropna()
        px = s.iloc[-1] if len(s) else 0.0
    return px


# ------------------------------------------------------------------ benchmarks

def benchmark_equiponderado(p: Precios, ind: dict, inicio: str, fin: str | None,
                            liquidez_min: float) -> pd.Series:
    """Cartera equiponderada de todo el universo liquido, rebalanceo diario, sin costes.
    La elegibilidad se decide con datos del cierre anterior."""
    px = ind["px"]
    elig = (ind["efectivo_60d"] >= liquidez_min) & px.notna()
    if "anomalia_reciente" in ind:
        elig &= ~ind["anomalia_reciente"]
    elig = elig.shift(1).fillna(False).astype(bool)
    ret = px.pct_change(fill_method=None)
    r = ret.where(elig).mean(axis=1).fillna(0).loc[inicio:fin]
    return (1 + r).cumprod()


def benchmark_ibex(p: Precios, inicio: str, fin: str | None) -> pd.Series:
    s = p.etf_ibex.loc[inicio:fin].ffill().dropna()
    return s / s.iloc[0]
