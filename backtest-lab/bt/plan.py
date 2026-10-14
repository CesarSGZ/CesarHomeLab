"""Plan del dinero: cómo se reparte el patrimonio entre las estrategias, la reserva de liquidez y el ahorro mensual.

Las MISMAS funciones las usan el backtest (simular) y el robot (ibkr_paper.py), para que lo probado sea lo que se hace.

Reglas (nunca se vende para reequilibrar: en Alemania cada venta con ganancia paga un 26,375 %):
  1. Reserva: se mantiene `reserva` (fracción del patrimonio) en liquidez, en un monetario que rinde ~€STR.
  2. Ahorro del mes: primero rellena la reserva hasta su objetivo (salvo durante una caída), el resto va a la
     estrategia que más lejos esté de su peso objetivo (las que estén por encima no reciben nada).
  3. Caídas: cuando el S&P 500 cae desde su máximo de 1 año por debajo de cada umbral de `disparos`, se invierte esa
     fracción de la reserva (igual que el ahorro: a la estrategia más por debajo de su peso). Los disparos se rearman
     cuando la caída se recupera por encima de `rearme`; entonces el ahorro vuelve a rellenar la reserva.
Dentro de cada estrategia el dinero nuevo compra las acciones nuevas de la semana y completa las que estén por debajo
de su parte (patrimonio de la estrategia / n), sin vender nada.
"""
import json
from dataclasses import asdict, dataclass, field
from pathlib import Path

import numpy as np
import pandas as pd

RUTA = Path(__file__).resolve().parent.parent / "plan_dinero.json"

# tipo medio del monetario en euros (€STR / EONIA, media del año, menos 0,1 de comisiones)
ESTR = {2008: 3.8, 2009: 0.6, 2010: 0.35, 2011: 0.8, 2012: 0.15, 2013: 0.0, 2014: 0.0, 2015: -0.2, 2016: -0.42,
        2017: -0.46, 2018: -0.46, 2019: -0.5, 2020: -0.57, 2021: -0.67, 2022: -0.1, 2023: 3.1, 2024: 3.55, 2025: 2.1,
        2026: 1.8}


@dataclass
class Plan:
    pesos: dict = field(default_factory=lambda: {"fundamental": 0.5, "precio": 0.5})
    reserva: float = 0.10
    aporte: float = 0.0
    disparos: tuple = ((-0.15, 1.0),)                   # (caída del S&P desde su máximo de 1 año, fracción de la reserva)
    rearme: float = -0.05
    nombre: str = ""

    @staticmethod
    def leer(ruta=RUTA):
        js = json.loads(Path(ruta).read_text(encoding="utf-8"))
        return Plan(pesos=js["pesos"], reserva=js["reserva"], aporte=js.get("aporteMensual", 0.0),
                    disparos=tuple((d["caidaSP"], d["fraccion"]) for d in js["disparos"]), rearme=js["rearme"],
                    nombre=js.get("nombre", ""))

    def como_dict(self):
        d = asdict(self)
        d["disparos"] = [{"caidaSP": a, "fraccion": b} for a, b in self.disparos]
        return d


def caida_sp(sp: pd.Series) -> pd.Series:
    """Caída del S&P 500 desde su máximo de 1 año (0 = en máximos, -0,2 = un 20 % por debajo)."""
    sp = sp.ffill()
    return sp / sp.rolling(252, min_periods=60).max() - 1


def repartir(importe: float, valores: dict, pesos: dict) -> dict:
    """Reparte dinero nuevo entre estrategias SIN vender: primero a las que están por debajo de su peso objetivo
    (en proporción a lo que les falta); si sobra, con los pesos objetivo."""
    if importe <= 0:
        return {k: 0.0 for k in pesos}
    total = sum(valores.get(k, 0.0) for k in pesos) + importe
    falta = {k: max(0.0, pesos[k] * total - valores.get(k, 0.0)) for k in pesos}
    s = sum(falta.values())
    if s <= 0:
        return {k: importe * pesos[k] for k in pesos}
    return {k: importe * falta[k] / s for k in pesos}


def paso(plan: Plan, valores: dict, reserva: float, caida: float, usados: list, aporte: float):
    """Una revisión (semanal) del plan. Devuelve (dinero nuevo por estrategia, reserva nueva, disparos usados).
    `aporte` es el ahorro que entra en esta revisión (0 si no es la primera del mes)."""
    usados = list(usados)
    if caida > plan.rearme:
        usados = []                                          # recuperado: disparos rearmados
    a_invertir = 0.0
    en_caida = bool(usados) or any(caida <= u for u, _ in plan.disparos)   # hasta el rearme no se rellena
    if aporte > 0:
        patrimonio = sum(valores.values()) + reserva + aporte
        hueco = 0.0 if en_caida else max(0.0, plan.reserva * patrimonio - reserva)
        a_reserva = min(aporte, hueco)
        reserva += a_reserva
        a_invertir += aporte - a_reserva
    for i, (umbral, fraccion) in enumerate(plan.disparos):
        if caida <= umbral and i not in usados:
            # fracción acumulada: el segundo disparo invierte hasta 'fraccion' de la reserva que había al empezar
            previa = max([plan.disparos[j][1] for j in usados] + [0.0])
            parte = (fraccion - previa) / (1 - previa) if previa < 1 else 0.0
            x = reserva * parte
            reserva -= x
            a_invertir += x
            usados.append(i)
    return repartir(a_invertir, valores, plan.pesos), reserva, usados


def simular(navs: pd.DataFrame, sp: pd.Series, plan: Plan, capital=100_000.0, inicio=None, fin=None):
    """navs: valor diario de cada estrategia (columnas = claves de plan.pesos). Revisión semanal (primer día de cada
    semana), ahorro el primer día de cada mes. La reserva rinde el tipo del monetario. Al empezar se invierte
    (1 - reserva) del capital con los pesos objetivo."""
    navs = navs.loc[inicio:fin].dropna()
    ret = navs.pct_change().fillna(0.0)
    cae = caida_sp(sp).reindex(navs.index).ffill().fillna(0.0)
    fechas = navs.index
    semana = fechas.to_period("W")
    mes = fechas.to_period("M")
    tipo = pd.Series([ESTR.get(f.year, 0.0) / 100 / 252 for f in fechas], index=fechas)
    reserva = capital * plan.reserva
    valores = {k: capital * (1 - plan.reserva) * w for k, w in plan.pesos.items()}
    usados, unid, ultimo_mes = [], capital, mes[0]
    pat, nav, flujos, res_s = [], [], [], []
    for i, dia in enumerate(fechas):
        if i > 0:
            for k in valores:
                valores[k] *= 1 + ret.at[dia, k]
            reserva *= 1 + tipo.at[dia]
        flujo = 0.0
        if i > 0 and semana[i] != semana[i - 1]:
            # el ahorro del mes entra en la primera revisión del mes (como el robot, que opera los lunes)
            aporte = plan.aporte if mes[i] != ultimo_mes else 0.0
            ultimo_mes = mes[i]
            if aporte:
                unid += aporte / (nav[-1] / capital)
                flujo = aporte
            nuevo, reserva, usados = paso(plan, valores, reserva, float(cae.at[dia]), usados, aporte)
            for k, x in nuevo.items():
                valores[k] += x
        total = sum(valores.values()) + reserva
        pat.append(total)
        nav.append(total / unid * capital)
        flujos.append(flujo)
        res_s.append(reserva / total)
    idx = fechas
    return {"patrimonio": pd.Series(pat, index=idx), "nav": pd.Series(nav, index=idx),
            "flujos": pd.Series(flujos, index=idx), "reserva": pd.Series(res_s, index=idx)}
