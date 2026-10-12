"""
Familias de estrategias para el universo global. Cada familia es una función que, con unos parámetros,
devuelve una EstrategiaG. investigar.py recorre las rejillas SOLO en el periodo de entrenamiento.

Columnas disponibles en la tabla semanal `t` (una fila por acción):
  precio/técnica: px, sma50, sma200, sobre_sma200, mom_1m/3m/6m/12m, mom_12_1, volat_1a, volat_60,
                  sharpe_1a, ruptura_55, ruptura_252, dist_max_252
  volumen:        rvol_5_50, rvol_20_100, vol_alcista_50, cmf_20, obv_tend_50, pico_alcista_5d, pico_bajista_5d
  posición:       dias_en_cartera, caida_desde_max, ret_desde_entrada (solo en las que están en cartera)
  fundamentales:  ver bt/fund_global.py (per_rel, pb_rel, ev_ebitda_rel, roe, ... y su percentil en el sector)
"""
import itertools

import pandas as pd

from bt.motor_global import EstrategiaG

PRECIO_INICIO, PRECIO_FIN_ENTRENO = "2008-01-01", "2018-12-31"
FUND_INICIO, FUND_FIN_ENTRENO = "2023-04-03", "2024-12-31"
COLUMNAS_PRECIO = ["px", "vivo", "efectivo_60d", "anomalia_reciente", "sma50", "sma200", "sobre_sma200",
                   "mom_1m", "mom_3m", "mom_6m", "mom_12m", "mom_12_1", "volat_1a", "volat_60", "sharpe_1a",
                   "ruptura_55", "ruptura_252", "dist_max_252", "rvol_5_50", "rvol_20_100", "vol_alcista_50",
                   "cmf_20", "obv_tend_50", "pico_alcista_5d", "pico_bajista_5d"]
NOMBRE_SENAL = {"vol_alcista_50": "más volumen en días de subida que de bajada",
                "cmf_20": "flujo de dinero (Chaikin) positivo", "obv_tend_50": "volumen acumulado (OBV) creciente"}


LIQUIDEZ = 2e6


def operable(t):
    """Lo mismo que exige el motor para comprar: liquidez y datos sanos. Los rankings se hacen aquí dentro."""
    return (t["efectivo_60d"] >= LIQUIDEZ) & ~t["anomalia_reciente"].fillna(True).astype(bool)




# --------------------------------------------------------------------------------------------
# A) Ruptura con volumen: nuevo máximo con mucho más volumen del habitual
# --------------------------------------------------------------------------------------------
def ruptura_volumen(maximo=55, rvol=1.5, salida="sma50", n=20, filtro_mercado=False):
    col_rup = f"ruptura_{maximo}"

    def entrada(t):
        return t[col_rup].fillna(False).astype(bool) & (t["rvol_5_50"] >= rvol) & (t["px"] > t["sma200"])

    def mantener(t):
        if salida == "sma50":
            return t["px"] > t["sma50"]
        stop = -int(salida[4:]) / 100
        return (t["caida_desde_max"] > stop) & (t["px"] > t["sma200"])

    sal = ("el precio cae por debajo de su media de 50 sesiones" if salida == "sma50"
           else f"cae un {salida[4:]} % desde su máximo desde la compra")
    return EstrategiaG(
        nombre="Ruptura con volumen", familia="ruptura", entrada=entrada, mantener=mantener,
        puntuacion=lambda t: t["rvol_5_50"], n_posiciones=n, filtro_mercado=filtro_mercado,
        inicio=PRECIO_INICIO, fin_entrenamiento=PRECIO_FIN_ENTRENO,
        parametros=dict(maximo=maximo, rvol=rvol, salida=salida, n=n, filtro_mercado=filtro_mercado),
        reglas={"compra": [f"Marca un máximo de {'1 año' if maximo == 252 else '~3 meses'}",
                           f"con un volumen semanal {rvol:g}× su media",
                           "y está sobre su media de 200 sesiones"],
                "venta": [f"Vende si {sal}"] + (["No compra si el S&P 500 está bajo su media de 200"] if filtro_mercado else [])})


# --------------------------------------------------------------------------------------------
# B) Acumulación: las acciones donde el volumen "empuja" hacia arriba
# --------------------------------------------------------------------------------------------
def acumulacion(senal="vol_alcista_50", n=20, banda=2.0, filtro_mercado=False):
    def candidatas(t):
        return (t["px"] > t["sma200"]) & (t["mom_6m"] > 0) & operable(t)

    def entrada(t):
        c = candidatas(t)
        return c & (t[senal].where(c).rank(ascending=False) <= n)

    def mantener(t):
        c = candidatas(t)
        return (t["px"] > t["sma200"]) & (t[senal].where(c).rank(ascending=False) <= n * banda)

    return EstrategiaG(
        nombre="Acumulación por volumen", familia="acumulacion", entrada=entrada, mantener=mantener,
        puntuacion=lambda t: t[senal], n_posiciones=n, filtro_mercado=filtro_mercado,
        inicio=PRECIO_INICIO, fin_entrenamiento=PRECIO_FIN_ENTRENO,
        parametros=dict(senal=senal, n=n, banda=banda, filtro_mercado=filtro_mercado),
        reglas={"compra": [f"Las {n} con {NOMBRE_SENAL[senal]} más fuerte", "en tendencia alcista (sobre su media de 200 y subiendo en 6 meses)"],
                "venta": [f"Sale de las {int(n * banda)} mejores o pierde la media de 200"] + (["No compra si el S&P 500 está bajo su media de 200"] if filtro_mercado else [])})


# --------------------------------------------------------------------------------------------
# C) Momentum confirmado por volumen
# --------------------------------------------------------------------------------------------
def momentum_volumen(mom="mom_12_1", rvol_min=1.0, n=20, banda=2.5, filtro_mercado=False):
    def entrada(t):
        c = (t["px"] > t["sma200"]) & (t["rvol_20_100"] >= rvol_min) & operable(t)
        return c & (t[mom].where(c).rank(ascending=False) <= n)

    def mantener(t):
        return (t["px"] > t["sma200"]) & (t[mom].where(operable(t)).rank(ascending=False) <= n * banda)

    nombre_mom = {"mom_12_1": "12 meses (sin el último)", "mom_6m": "6 meses", "mom_3m": "3 meses"}[mom]
    return EstrategiaG(
        nombre="Momentum con volumen", familia="momentum_volumen", entrada=entrada, mantener=mantener,
        puntuacion=lambda t: t[mom], n_posiciones=n, filtro_mercado=filtro_mercado,
        inicio=PRECIO_INICIO, fin_entrenamiento=PRECIO_FIN_ENTRENO,
        parametros=dict(mom=mom, rvol_min=rvol_min, n=n, banda=banda, filtro_mercado=filtro_mercado),
        reglas={"compra": [f"Las {n} acciones que más han subido en {nombre_mom}",
                           ("con más volumen del habitual en el último mes" if rvol_min == 1 else
                            f"con un volumen en el último mes {rvol_min:g} veces el habitual") if rvol_min > 0 else "sin exigir volumen",
                           "sobre su media de 200"],
                "venta": ["Cae por debajo de su media de 200 sesiones", f"o deja de estar entre las {int(n * banda)} que más suben"] + (["No compra si el S&P 500 está bajo su media de 200"] if filtro_mercado else [])})


# --------------------------------------------------------------------------------------------
# D) Capitulación: desplome con volumen enorme dentro de una tendencia alcista (rebote)
# --------------------------------------------------------------------------------------------
def capitulacion(caida=-0.10, plazo=21, n=20, filtro_mercado=True):
    def entrada(t):
        return t["pico_bajista_5d"].fillna(False).astype(bool) & (t["mom_1m"] <= caida) & (t["mom_12m"] > 0)

    def mantener(t):
        return t["dias_en_cartera"] < plazo

    return EstrategiaG(
        nombre="Rebote tras capitulación", familia="capitulacion", entrada=entrada, mantener=mantener,
        puntuacion=lambda t: -t["mom_1m"], n_posiciones=n, filtro_mercado=filtro_mercado,
        inicio=PRECIO_INICIO, fin_entrenamiento=PRECIO_FIN_ENTRENO,
        parametros=dict(caida=caida, plazo=plazo, n=n, filtro_mercado=filtro_mercado),
        reglas={"compra": [f"Cae más de un {abs(caida):.0%} en un mes con un día de volumen ≥ 2× su media",
                           "pero sube en el último año"],
                "venta": [f"Vende a los {plazo} días"]})


def rejilla_precio():
    for maximo, rvol, salida, n, fm in itertools.product([55, 252], [1.3, 2.0], ["sma50", "stop10", "stop20"], [20, 40], [False, True]):
        yield ruptura_volumen(maximo, rvol, salida, n, fm)
    for senal, n, banda, fm in itertools.product(["vol_alcista_50", "cmf_20", "obv_tend_50"], [20, 40], [2.0, 3.0], [False, True]):
        yield acumulacion(senal, n, banda, fm)
    for mom, rv, n, fm in itertools.product(["mom_12_1", "mom_6m", "mom_3m"], [0.0, 1.0, 1.2], [20, 40], [False, True]):
        yield momentum_volumen(mom, rv, n, 2.5, fm)
    for caida, plazo, n, fm in itertools.product([-0.10, -0.20], [10, 21, 42], [20, 40], [False, True]):
        yield capitulacion(caida, plazo, n, fm)


def descripcion(est: EstrategiaG) -> str:
    return f"{est.nombre} " + ", ".join(f"{k}={v}" for k, v in est.parametros.items())


# --------------------------------------------------------------------------------------------
# F) Fundamentales + precio: nota compuesta frente a su sector (percentiles; 1 = el mejor del grupo)
# --------------------------------------------------------------------------------------------
PESOS = {
    "valor": {"per_pct": 1, "pb_pct": 1, "ev_ebitda_pct": 1},
    "calidad": {"roe_pct": 1, "margen_neto_pct": 1, "deuda_ebitda_pct": 1},
    "equilibrado": {"per_pct": 1, "pb_pct": 1, "ev_ebitda_pct": 1, "roe_pct": 1, "margen_neto_pct": 1,
                    "deuda_ebitda_pct": 1, "volat_1a_pct": 1, "beta_1a_pct": 1, "sharpe_1a_pct": 1},
    "calidad_barata": {"per_pct": 1, "ev_ebitda_pct": 1, "roe_pct": 1.5, "margen_neto_pct": 1, "deuda_ebitda_pct": 1},
    "baja_volatilidad": {"volat_1a_pct": 1.5, "beta_1a_pct": 1, "roe_pct": 1, "per_pct": 1},
    "calidad_momentum": {"roe_pct": 1, "margen_neto_pct": 1, "sharpe_1a_pct": 1.5, "ev_ebitda_pct": 1},
}
NOMBRE_METRICA = {"per_pct": "PER", "pb_pct": "P/VC", "ev_ebitda_pct": "EV/EBITDA", "roe_pct": "ROE",
                  "margen_neto_pct": "margen neto", "deuda_ebitda_pct": "deuda/EBITDA", "volat_1a_pct": "volatilidad",
                  "beta_1a_pct": "beta", "sharpe_1a_pct": "Sharpe 1 año", "insiders_pct": "% de insiders"}
COLUMNAS_FUND = ["px", "vivo", "efectivo_60d", "anomalia_reciente", "sma200", "sma50", "mom_6m"]


def fundamental(pesos="equilibrado", tendencia=True, n=30, banda=2.0, deuda_max=4.0, insiders=0.0):
    w = dict(PESOS[pesos])
    if insiders:
        w["insiders_pct"] = insiders * sum(w.values())

    def nota(t):
        cols = [c for c in w if c in t]
        m = t[cols]
        peso = pd.Series(w)[cols]
        # media ponderada de los percentiles disponibles (exige al menos 2/3 de las métricas)
        suma = (m * peso).sum(axis=1, min_count=1)
        base = m.notna().mul(peso).sum(axis=1)
        return (suma / base).where(m.notna().sum(axis=1) >= max(2, int(len(cols) * 2 / 3)))

    def filtros(t, holgura=0.0):
        ok = (t["per"] > 0) & (t["roe"] > 0)
        ok &= (t["deuda_ebitda"] <= deuda_max + holgura) | t["deuda_ebitda"].isna()
        if tendencia:
            ok &= t["px"] > t["sma200"]
        return ok

    def entrada(t):
        s = nota(t).where(filtros(t) & operable(t))
        return s.rank(ascending=False) <= n

    def mantener(t):
        s = nota(t).where(filtros(t, 0.5) & operable(t))
        return s.rank(ascending=False) <= n * banda

    metricas = ", ".join(NOMBRE_METRICA[c] for c in w)
    return EstrategiaG(
        nombre="Fundamentales + precio", familia="fundamental", entrada=entrada, mantener=mantener,
        puntuacion=nota, n_posiciones=n, usa_fundamentales=True, liquidez_min=2e6,
        inicio=FUND_INICIO, fin_entrenamiento=FUND_FIN_ENTRENO,
        parametros=dict(pesos=pesos, tendencia=tendencia, n=n, banda=banda, deuda_max=deuda_max, insiders=insiders),
        reglas={"compra": [f"Las {n} con mejor nota frente a su sector en: {metricas}",
                           f"PER y ROE positivos, deuda neta ≤ {deuda_max:g}× EBITDA"] + (["sobre su media de 200 sesiones"] if tendencia else []),
                "venta": [f"Sale de las {int(n * banda)} mejores o deja de cumplir los filtros"]})


def rejilla_fundamental():
    for pesos, tend, n, ins in itertools.product(list(PESOS), [True, False], [20, 40], [0.0, 0.15]):
        yield fundamental(pesos, tend, n, 2.0, 4.0, ins)


# --------------------------------------------------------------------------------------------
# Ronda 2 (añadida tras la ronda 1, siempre evaluada solo en entrenamiento)
# --------------------------------------------------------------------------------------------
def _sal_mercado(fm, salir):
    if salir:
        return ["Se pasa a liquidez si el S&P 500 pierde su media de 200"]
    return ["No compra si el S&P 500 está bajo su media de 200"] if fm else []


def cerca_maximos(n=30, banda=2.0, rvol_min=1.0, filtro_mercado=True, salir=False):
    """Acciones pegadas a su máximo de 1 año con volumen creciente (efecto 52-week high)."""
    def base(t):
        return (t["px"] > t["sma200"]) & (t["rvol_20_100"] >= rvol_min) & operable(t)

    def entrada(t):
        return base(t) & (t["dist_max_252"].where(base(t)).rank(ascending=False) <= n)

    def mantener(t):
        return (t["px"] > t["sma200"]) & (t["dist_max_252"].where(operable(t)).rank(ascending=False) <= n * banda * 2)

    return EstrategiaG(
        nombre="Cerca de máximos con volumen", familia="cerca_maximos", entrada=entrada, mantener=mantener,
        puntuacion=lambda t: t["dist_max_252"], n_posiciones=n, filtro_mercado=filtro_mercado or salir,
        vender_si_mercado_bajista=salir, inicio=PRECIO_INICIO, fin_entrenamiento=PRECIO_FIN_ENTRENO,
        parametros=dict(n=n, banda=banda, rvol_min=rvol_min, filtro_mercado=filtro_mercado, salir=salir),
        reglas={"compra": [f"Las {n} más cerca de su máximo de 1 año",
                           f"con el volumen del último mes ≥ {rvol_min:g}× el del trimestre", "sobre su media de 200"],
                "venta": ["Se aleja de máximos (sale del grupo de cabeza) o pierde la media de 200"] + _sal_mercado(filtro_mercado, salir)})


def volumen_anomalo(n=30, rvol_min=2.0, plazo=28, filtro_mercado=True, salir=False):
    """Semana con volumen muy por encima de lo normal y subida (prima de volumen alto)."""
    def entrada(t):
        c = (t["rvol_5_50"] >= rvol_min) & (t["mom_1m"] > 0) & (t["px"] > t["sma50"]) & operable(t)
        return c & (t["rvol_5_50"].where(c).rank(ascending=False) <= n)

    def mantener(t):
        return (t["dias_en_cartera"] < plazo) & (t["px"] > t["sma50"])

    return EstrategiaG(
        nombre="Volumen anómalo al alza", familia="volumen_anomalo", entrada=entrada, mantener=mantener,
        puntuacion=lambda t: t["rvol_5_50"], n_posiciones=n, filtro_mercado=filtro_mercado or salir,
        vender_si_mercado_bajista=salir, inicio=PRECIO_INICIO, fin_entrenamiento=PRECIO_FIN_ENTRENO,
        parametros=dict(n=n, rvol_min=rvol_min, plazo=plazo, filtro_mercado=filtro_mercado, salir=salir),
        reglas={"compra": [f"Volumen de la semana ≥ {rvol_min:g}× su media de 50 sesiones", "y sube en el último mes, sobre su media de 50"],
                "venta": [f"A los {plazo} días o si pierde la media de 50"] + _sal_mercado(filtro_mercado, salir)})


def momentum_riesgo(n=30, banda=2.0, rvol_min=0.0, filtro_mercado=True, salir=False):
    """Las que más suben por unidad de riesgo (rentabilidad 12 meses / volatilidad)."""
    def entrada(t):
        c = (t["px"] > t["sma200"]) & (t["rvol_20_100"] >= rvol_min) & operable(t)
        return c & (t["sharpe_1a"].where(c).rank(ascending=False) <= n)

    def mantener(t):
        return (t["px"] > t["sma200"]) & (t["sharpe_1a"].where(operable(t)).rank(ascending=False) <= n * banda)

    return EstrategiaG(
        nombre="Momentum ajustado por riesgo", familia="momentum_riesgo", entrada=entrada, mantener=mantener,
        puntuacion=lambda t: t["sharpe_1a"], n_posiciones=n, filtro_mercado=filtro_mercado or salir,
        vender_si_mercado_bajista=salir, inicio=PRECIO_INICIO, fin_entrenamiento=PRECIO_FIN_ENTRENO,
        parametros=dict(n=n, banda=banda, rvol_min=rvol_min, filtro_mercado=filtro_mercado, salir=salir),
        reglas={"compra": [f"Las {n} que más suben en 1 año por unidad de volatilidad"]
                + ([f"con volumen del último mes ≥ {rvol_min:g}× el del trimestre"] if rvol_min else []) + ["sobre su media de 200"],
                "venta": [f"Sale de las {int(n * banda)} mejores o pierde la media de 200"] + _sal_mercado(filtro_mercado, salir)})


def rejilla_precio_2():
    for n, banda, rv, fm, sal in itertools.product([20, 40], [2.0], [0.0, 1.0, 1.2], [True], [False, True]):
        yield cerca_maximos(n, banda, rv, fm, sal)
    for n, rv, plazo, sal in itertools.product([20, 40], [1.5, 2.0, 3.0], [21, 42], [False, True]):
        yield volumen_anomalo(n, rv, plazo, True, sal)
    for n, rv, sal in itertools.product([20, 40], [0.0, 1.0, 1.2], [False, True]):
        yield momentum_riesgo(n, 2.0, rv, True, sal)
    # familias de la ronda 1 que fallaban por el error del ranking, ya corregidas
    for senal, n, sal in itertools.product(["vol_alcista_50", "cmf_20", "obv_tend_50"], [20, 40], [False, True]):
        e = acumulacion(senal, n, 2.0, True)
        e.vender_si_mercado_bajista = sal
        e.parametros["salir"] = sal
        yield e
    for mom, rv, n, sal in itertools.product(["mom_12_1", "mom_6m"], [0.0, 1.0, 1.2], [20, 40], [False, True]):
        e = momentum_volumen(mom, rv, n, 2.5, True)
        e.vender_si_mercado_bajista = sal
        e.parametros["salir"] = sal
        yield e
    for maximo, rvol, n, sal in itertools.product([55, 252], [1.5, 2.0], [20, 40], [False, True]):
        e = ruptura_volumen(maximo, rvol, "stop20", n, True)
        e.vender_si_mercado_bajista = sal
        e.parametros["salir"] = sal
        yield e


def ruptura_momentum(n=20, rvol=1.5, stop=20, top_mom=100, filtro_mercado=True):
    """Ruptura de máximo anual con volumen, solo entre las que más suben en 12 meses."""
    def entrada(t):
        lider = t["mom_12_1"].where(operable(t)).rank(ascending=False) <= top_mom
        return t["ruptura_252"].fillna(False).astype(bool) & (t["rvol_5_50"] >= rvol) & (t["px"] > t["sma200"]) & lider

    def mantener(t):
        return (t["caida_desde_max"] > -stop / 100) & (t["px"] > t["sma200"])

    return EstrategiaG(
        nombre="Ruptura de líderes con volumen", familia="ruptura_momentum", entrada=entrada, mantener=mantener,
        puntuacion=lambda t: t["mom_12_1"], n_posiciones=n, filtro_mercado=filtro_mercado,
        inicio=PRECIO_INICIO, fin_entrenamiento=PRECIO_FIN_ENTRENO,
        parametros=dict(n=n, rvol=rvol, stop=stop, top_mom=top_mom, filtro_mercado=filtro_mercado),
        reglas={"compra": [f"Está entre las {top_mom} que más han subido en 12 meses", "marca un máximo de 1 año",
                           f"con un volumen semanal ≥ {rvol:g}× su media"],
                "venta": [f"Cae un {stop} % desde su máximo desde la compra o pierde la media de 200",
                          "No compra si el S&P 500 está bajo su media de 200"]})


def rejilla_precio_3():
    for n, banda in [(30, 1.5), (30, 2.5), (30, 4.0), (40, 1.5), (40, 4.0), (60, 1.5), (60, 2.5), (60, 4.0)]:
        yield momentum_volumen("mom_12_1", 1.0, n, banda, True)
    for rvol, stop, n in itertools.product([1.5, 2.0], [15, 25], [20, 30]):
        yield ruptura_volumen(252, rvol, f"stop{stop}", n, True)
    for n, stop, top_mom in itertools.product([20, 30], [15, 20], [100, 300]):
        yield ruptura_momentum(n, 1.5, stop, top_mom, True)
