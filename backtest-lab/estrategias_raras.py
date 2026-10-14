"""Ronda 4: ideas de precio más "raras". Se eligen igual que las demás: solo con 2008-2018."""
import itertools

import pandas as pd

from bt.motor_global import EstrategiaG
from estrategias_global import COLUMNAS_PRECIO, PRECIO_FIN_ENTRENO, PRECIO_INICIO, operable

COLUMNAS_PRECIO_4 = COLUMNAS_PRECIO + ["discrecion", "max_dia_21", "rent_div", "salto_vol_5d", "salto_vol_63d",
                                       "contraccion", "mom_1s", "es_eeuu", "es_europa", "es_asia", "zona_lider",
                                       "cambio_mes", "r2_mercado", "max5_21"]
ZONAS = {"global": None, "eeuu": "es_eeuu", "europa": "es_europa", "asia": "es_asia"}
NOMBRE_ZONA = {"global": "todo el mundo", "eeuu": "EE. UU.", "europa": "Europa", "asia": "Asia-Pacífico"}


def _en_zona(t, zona):
    return t[ZONAS[zona]].fillna(False).astype(bool) if ZONAS.get(zona) else pd.Series(True, index=t.index)


def _base(nombre, familia, entrada, mantener, puntuacion, n, params, reglas, filtro_mercado=True, liquidez=2e6, frecuencia="W"):
    return EstrategiaG(nombre=nombre, familia=familia, entrada=entrada, mantener=mantener, puntuacion=puntuacion,
                       n_posiciones=n, filtro_mercado=filtro_mercado, liquidez_min=liquidez, frecuencia=frecuencia,
                       inicio=PRECIO_INICIO, fin_entrenamiento=PRECIO_FIN_ENTRENO, parametros=params, reglas=reglas)


def rana_olla(n=30, zona="global", suavidad=0.3, filtro_mercado=True):
    """Momentum continuo: sube a base de muchos días pequeños (los inversores reaccionan tarde)."""
    def elegibles(t):
        ok = operable(t) & _en_zona(t, zona) & (t["px"] > t["sma200"]) & (t["mom_12_1"] > 0)
        top = t["mom_12_1"].where(ok).rank(ascending=False, pct=True) <= 0.2
        return ok & top & (t["discrecion"].where(ok & top).rank(pct=True) <= suavidad)

    return _base("Momentum continuo", "rana_olla", elegibles,
                 lambda t: (t["px"] > t["sma200"]) & (t["mom_12_1"] > 0),
                 lambda t: -t["discrecion"], n, dict(n=n, zona=zona, suavidad=suavidad, filtro_mercado=filtro_mercado),
                 {"compra": [f"Entre el 20 % que más sube en 12 meses ({NOMBRE_ZONA[zona]})",
                             "las que han subido a base de muchos días pequeños, sin saltos"],
                  "venta": ["Pierde la media de 200 o el año se vuelve negativo"]}, filtro_mercado)


def salto_resultados(n=30, plazo=63, zona="global", filtro_mercado=True):
    """Salto de apertura >= 5 % con volumen x3 que aguanta el día (típico de unos buenos resultados)."""
    return _base("Deriva tras salto con volumen", "salto",
                 lambda t: t["salto_vol_5d"].fillna(False).astype(bool) & operable(t) & _en_zona(t, zona) & (t["px"] > t["sma50"]),
                 lambda t: t["dias_en_cartera"] < plazo * 7 / 5,
                 lambda t: t["rvol_5_50"], n, dict(n=n, plazo=plazo, zona=zona, filtro_mercado=filtro_mercado),
                 {"compra": ["Abre con un salto de al menos un 5 % y el triple de volumen", "y aguanta la subida en el día"],
                  "venta": [f"Vende a las {plazo} sesiones"]}, filtro_mercado)


def perros_dividendo(n=30, liquidez=10e6, tendencia=True, zona="global", filtro_mercado=True):
    def ok(t):
        b = operable(t) & (t["efectivo_60d"] >= liquidez) & _en_zona(t, zona) & (t["rent_div"] < 0.25)
        return b & (t["px"] > t["sma200"]) if tendencia else b

    return _base("Perros del dividendo", "perros",
                 lambda t: t["rent_div"].where(ok(t)).rank(ascending=False) <= n,
                 lambda t: t["rent_div"].where(ok(t)).rank(ascending=False) <= n * 2.5,
                 lambda t: t["rent_div"], n, dict(n=n, liquidez=liquidez, tendencia=tendencia, zona=zona, filtro_mercado=filtro_mercado),
                 {"compra": [f"Las {n} grandes con mayor dividendo ({NOMBRE_ZONA[zona]})"] + (["sobre su media de 200"] if tendencia else []),
                  "venta": [f"Sale de las {int(n * 2.5)} de más dividendo" + (" o pierde la media de 200" if tendencia else "")]},
                 filtro_mercado, liquidez)


def momentum_sin_loteria(n=30, max_dia=0.08, zona="global", filtro_mercado=True):
    def ok(t):
        return operable(t) & _en_zona(t, zona) & (t["px"] > t["sma200"]) & (t["max_dia_21"] <= max_dia)

    return _base("Momentum sin lotería", "sin_loteria",
                 lambda t: t["mom_12_1"].where(ok(t)).rank(ascending=False) <= n,
                 lambda t: (t["px"] > t["sma200"]) & (t["mom_12_1"].where(operable(t) & _en_zona(t, zona)).rank(ascending=False) <= n * 3),
                 lambda t: t["mom_12_1"], n, dict(n=n, max_dia=max_dia, zona=zona, filtro_mercado=filtro_mercado),
                 {"compra": [f"Las {n} que más suben en 12 meses ({NOMBRE_ZONA[zona]})",
                             f"sin ningún día de más de +{max_dia:.0%} en el último mes"],
                  "venta": ["Pierde la media de 200 o deja de estar entre las que más suben"]}, filtro_mercado)


# semáforo (fase 3/8): no se compra si 'va por libre' (R² con el S&P < 0,0952) o tiene 'días de lotería' (> 4,04 %)
SEMAFORO_R2, SEMAFORO_MAX5 = 0.0952, 0.0404


def alerta_precio(t):
    return (t["r2_mercado"] < SEMAFORO_R2) | (t["max5_21"] > SEMAFORO_MAX5)


def megacaps(n=10, mom="mom_12_1", liquidez=100e6, filtro_mercado=True, semaforo=False):
    def ok(t):
        return operable(t) & t["es_eeuu"].fillna(False).astype(bool) & (t["efectivo_60d"] >= liquidez) & (t["px"] > t["sma200"])

    def entrada(t):
        e = t[mom].where(ok(t)).rank(ascending=False) <= n
        # la alerta solo impide comprar: el hueco espera en liquidez a la semana siguiente (sin ventas extra)
        return e & ~alerta_precio(t) if semaforo else e

    e = _base("Momentum en EE. UU. (las más negociadas)", "megacaps",
                 entrada,
                 lambda t: (t["px"] > t["sma200"]) & (t[mom].where(ok(t)).rank(ascending=False) <= n * 2.5),
                 lambda t: t[mom], n, dict(n=n, mom=mom, liquidez=liquidez, filtro_mercado=filtro_mercado, semaforo=semaforo),
                 {"compra": [f"Entre las acciones de EE. UU. con más de {liquidez / 1e6:g} M€ negociados al día",
                             f"compra las {n} que más han subido en " + {"mom_6m": "6 meses", "mom_12_1": "12 meses", "mom_3m": "3 meses"}.get(mom, mom),
                             "si están por encima de su media de 200 sesiones"]
                            + (["salvo si va por libre del mercado (R² < 0,095) o ha tenido días de lotería (5 mejores días del mes > 4 %)"]
                               if semaforo else []),
                  "venta": ["Cae por debajo de su media de 200", f"o deja de estar entre las {int(n * 2.5)} que más suben"]},
                 filtro_mercado, liquidez)
    e.elegibles = ok
    return e


def cambio_mes(n=30, liquidez=50e6, mom=True):
    def ok(t):
        return operable(t) & (t["efectivo_60d"] >= liquidez) & (t["px"] > t["sma200"])

    def entrada(t):
        if not bool(t["cambio_mes"].iloc[0]):
            return pd.Series(False, index=t.index)
        orden = t["mom_12_1"] if mom else t["efectivo_60d"]
        return orden.where(ok(t)).rank(ascending=False) <= n

    return _base("Efecto cambio de mes", "cambio_mes", entrada,
                 lambda t: t["cambio_mes"].fillna(False).astype(bool),
                 lambda t: t["mom_12_1"], n, dict(n=n, liquidez=liquidez, mom=mom),
                 {"compra": ["Solo los últimos 4 días de cada mes y los 3 primeros del siguiente",
                             f"las {n} grandes con más momentum" if mom else f"las {n} más negociadas"],
                  "venta": ["Al tercer día del mes; el resto del tiempo, liquidez"]}, False, liquidez, "D")


def rotacion_zonas(n=30, filtro_mercado=True):
    def ok(t):
        return operable(t) & t["zona_lider"].fillna(False).astype(bool) & (t["px"] > t["sma200"])

    return _base("Rotación entre zonas", "rotacion",
                 lambda t: t["mom_12_1"].where(ok(t)).rank(ascending=False) <= n,
                 lambda t: t["zona_lider"].fillna(False).astype(bool) & (t["px"] > t["sma200"]),
                 lambda t: t["mom_12_1"], n, dict(n=n, filtro_mercado=filtro_mercado),
                 {"compra": ["Elige la zona (EE. UU., Europa o Asia) que más ha subido en 6 meses",
                             f"y compra sus {n} acciones con más momentum"],
                  "venta": ["Cambia la zona líder o la acción pierde la media de 200", "Liquidez si ninguna zona sube"]}, filtro_mercado)


def caida_lider(n=20, caida=-0.08, plazo=21, filtro_mercado=True):
    def ok(t):
        lider = t["mom_12_1"].where(operable(t)).rank(ascending=False, pct=True) <= 0.1
        return operable(t) & lider & (t["mom_1s"] <= caida) & (t["px"] > t["sma200"])

    return _base("Comprar la caída de los líderes", "caida_lider", ok,
                 lambda t: t["dias_en_cartera"] < plazo * 7 / 5,
                 lambda t: -t["mom_1s"], n, dict(n=n, caida=caida, plazo=plazo, filtro_mercado=filtro_mercado),
                 {"compra": ["Está entre el 10 % que más sube en el año", f"y cae más de un {abs(caida):.0%} en una semana"],
                  "venta": [f"Vende a las {plazo} sesiones"]}, filtro_mercado)


def contraccion_ruptura(n=20, contr=0.7, stop=15, filtro_mercado=True):
    def ok(t):
        return (operable(t) & (t["contraccion"] <= contr) & t["ruptura_252"].fillna(False).astype(bool)
                & (t["rvol_5_50"] >= 1.3) & (t["px"] > t["sma200"]))

    return _base("Contracción y ruptura", "vcp", ok,
                 lambda t: (t["caida_desde_max"] > -stop / 100) & (t["px"] > t["sma50"]),
                 lambda t: -t["contraccion"], n, dict(n=n, contr=contr, stop=stop, filtro_mercado=filtro_mercado),
                 {"compra": ["Su volatilidad se ha encogido (calma)", "y rompe su máximo de 1 año con volumen"],
                  "venta": [f"Cae un {stop} % desde su máximo o pierde la media de 50"]}, filtro_mercado)


FAMILIAS = {"rana_olla": rana_olla, "salto": salto_resultados, "perros": perros_dividendo, "sin_loteria": momentum_sin_loteria,
            "megacaps": megacaps, "cambio_mes": cambio_mes, "rotacion": rotacion_zonas, "caida_lider": caida_lider,
            "vcp": contraccion_ruptura}


def rejilla():
    for n, zona, su in itertools.product([20, 40], ["global", "eeuu"], [0.3, 0.5]):
        yield rana_olla(n, zona, su)
    for n, plazo, zona in itertools.product([20, 40], [21, 63], ["global", "eeuu"]):
        yield salto_resultados(n, plazo, zona)
    for n, tend, zona in itertools.product([20, 40], [True, False], ["global", "eeuu"]):
        yield perros_dividendo(n, 10e6, tend, zona)
    for n, md, zona in itertools.product([20, 40], [0.05, 0.08], ["global", "eeuu"]):
        yield momentum_sin_loteria(n, md, zona)
    for n, mom, fm in itertools.product([10, 20], ["mom_12_1", "mom_6m"], [True, False]):
        yield megacaps(n, mom, 100e6, fm)
    for n, mom in itertools.product([30, 60], [True, False]):
        yield cambio_mes(n, 50e6, mom)
    for n in [20, 40]:
        yield rotacion_zonas(n)
    for caida, plazo in itertools.product([-0.08, -0.12], [10, 21]):
        yield caida_lider(20, caida, plazo)
    for contr, stop in itertools.product([0.6, 0.8], [15, 25]):
        yield contraccion_ruptura(20, contr, stop)


def rejilla_5():
    """Ajuste fino alrededor de las dos mejores de la ronda 4 (solo con 2008-2018)."""
    for n, md, zona in itertools.product([10, 15, 30], [0.04, 0.05, 0.06], ["global"]):
        yield momentum_sin_loteria(n, md, zona)
    for n, mom, liq in itertools.product([5, 10, 15], ["mom_6m", "mom_3m"], [50e6, 200e6]):
        yield megacaps(n, mom, liq, True)
    for n in [10, 30]:
        yield salto_resultados(n, 63, "eeuu")


def megacaps_plus(n=15, mom="mom_6m", liquidez=50e6, salir=False, stop=None, max_dia=None, filtro_mercado=True):
    """Mega-caps de EE. UU. con momentum + protecciones (ajuste fino de la ronda 6)."""
    def ok(t):
        b = operable(t) & t["es_eeuu"].fillna(False).astype(bool) & (t["efectivo_60d"] >= liquidez) & (t["px"] > t["sma200"])
        if max_dia:
            b &= t["max_dia_21"] <= max_dia
        return b

    def mantener(t):
        m = (t["px"] > t["sma200"]) & (t[mom].where(ok(t) | t["dias_en_cartera"].notna()).rank(ascending=False) <= n * 2.5)
        if stop:
            m &= t["caida_desde_max"] > -stop
        return m

    e = _base("Mega-caps de EE. UU. con momentum", "megacaps_plus",
              lambda t: t[mom].where(ok(t)).rank(ascending=False) <= n, mantener,
              lambda t: t[mom], n, dict(n=n, mom=mom, liquidez=liquidez, salir=salir, stop=stop, max_dia=max_dia, filtro_mercado=filtro_mercado),
              {"compra": [f"Las {n} grandes de EE. UU. (más de {liquidez / 1e6:g} M€ negociados al día) que más han subido en "
                          + {"mom_6m": "6 meses", "mom_12_1": "12 meses", "mom_3m": "3 meses", "mom_12m": "12 meses"}[mom],
                          "sobre su media de 200"] + ([f"sin días de más de +{max_dia:.0%} en el último mes"] if max_dia else []),
               "venta": ["Pierde la media de 200 o deja de estar entre las que más suben"]
               + ([f"Cae un {stop:.0%} desde su máximo"] if stop else [])
               + (["Todo a liquidez si el S&P 500 pierde su media de 200"] if salir else ["No compra si el S&P 500 está bajo su media de 200"])},
              filtro_mercado or salir, liquidez)
    e.vender_si_mercado_bajista = salir
    return e


FAMILIAS["megacaps_plus"] = megacaps_plus


def rejilla_6():
    # variaciones gordas primero
    for salir, stop, max_dia in itertools.product([False, True], [None, 0.15, 0.25], [None, 0.08]):
        yield megacaps_plus(15, "mom_6m", 50e6, salir, stop, max_dia)
    for mom, n in itertools.product(["mom_12_1", "mom_12m"], [10, 15, 25]):
        yield megacaps_plus(n, mom, 50e6)
    for liq in [20e6, 100e6]:
        yield megacaps_plus(15, "mom_6m", liq)
