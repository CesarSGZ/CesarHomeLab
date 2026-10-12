"""Deep value: comprar lo más barato del mercado con algún seguro contra las trampas de valor.
Fundamentales solo desde abril de 2023 (Yahoo da 4 ejercicios): entrenamiento abr-2023 a dic-2024."""
import itertools

import pandas as pd

from bt.motor_global import EstrategiaG
from estrategias_global import FUND_FIN_ENTRENO, FUND_INICIO, operable

COLUMNAS_DV = ["px", "vivo", "efectivo_60d", "anomalia_reciente", "sma200", "sma50", "mom_3m", "mom_6m",
               "mom_12_1", "es_eeuu"]
SIN_EV = {"Financial Services", "Real Estate"}   # bancos, aseguradoras e inmobiliarias: EV/EBIT no tiene sentido
NOMBRE_ZONA = {"global": "todo el mundo", "eeuu": "EE. UU.", "exeeuu": "fuera de EE. UU."}


def _zona(t, zona):
    us = t["es_eeuu"].fillna(False).astype(bool)
    return {"global": pd.Series(True, index=t.index), "eeuu": us, "exeeuu": ~us}[zona]


def _mk(nombre, familia, ok, puntuacion, n, banda, tendencia, params, compra, liquidez=2e6):
    def base(t, b=1.0):
        m = ok(t) & operable(t) & (t["efectivo_60d"] >= liquidez)
        if tendencia:
            m &= t["px"] > t["sma200"]
        return m

    def entrada(t):
        return puntuacion(t).where(base(t)).rank(ascending=False) <= n

    def mantener(t):
        return puntuacion(t).where(base(t)).rank(ascending=False) <= n * banda

    return EstrategiaG(nombre=nombre, familia=familia, entrada=entrada, mantener=mantener, puntuacion=puntuacion,
                       n_posiciones=n, usa_fundamentales=True, liquidez_min=liquidez, filtro_mercado=False,
                       inicio=FUND_INICIO, fin_entrenamiento=FUND_FIN_ENTRENO, parametros=params,
                       reglas={"compra": compra + (["sobre su media de 200 (que el mercado empiece a reconocerla)"] if tendencia else []),
                               "venta": [f"Deja de estar entre las {int(n * banda)} más baratas"]})


def acquirers_multiple(n=30, tendencia=False, zona="global", banda=2.0, liquidez=2e6):
    ok = lambda t: (t["ev_ebit"] > 0) & ~t["sector"].isin(SIN_EV) & _zona(t, zona)
    return _mk("Múltiplo del adquirente", "acquirer", ok, lambda t: -t["ev_ebit"], n, banda, tendencia,
               dict(n=n, tendencia=tendencia, zona=zona, banda=banda, liquidez=liquidez),
               [f"Las {n} con el EV/EBIT más bajo ({NOMBRE_ZONA[zona]}): lo que pagarías por comprar la empresa entera frente a lo que gana"],
               liquidez)


def formula_magica(n=30, tendencia=False, zona="global", banda=2.0, liquidez=2e6):
    ok = lambda t: (t["rend_ebit"] > 0) & (t["roc"] > 0) & ~t["sector"].isin(SIN_EV | {"Utilities"}) & _zona(t, zona)

    def nota(t):
        m = ok(t)
        return -(t["rend_ebit"].where(m).rank(ascending=False) + t["roc"].where(m).rank(ascending=False))

    return _mk("Fórmula mágica (Greenblatt)", "magica", ok, nota, n, banda, tendencia,
               dict(n=n, tendencia=tendencia, zona=zona, banda=banda, liquidez=liquidez),
               [f"Las {n} mejores combinando barata (EBIT / valor empresa) y buena (EBIT / capital invertido)",
                f"({NOMBRE_ZONA[zona]})"], liquidez)


def net_net(k=1.0, n=30, liquidez=5e5, rentable=False, tendencia=False):
    ok = lambda t: (t["cap_ncav"] > 0) & (t["cap_ncav"] <= k) & ((t["per"] > 0) if rentable else True)
    return _mk("Net-net de Graham", "netnet", ok, lambda t: -t["cap_ncav"], n, 1.5, tendencia,
               dict(k=k, n=n, liquidez=liquidez, rentable=rentable, tendencia=tendencia),
               [f"Vale en bolsa menos de {k:g}× su activo corriente menos TODAS sus deudas"] + (["y gana dinero"] if rentable else []),
               liquidez)


def piotroski(n=30, fmin=5, quintil=0.2, tendencia=False, zona="global"):
    def ok(t):
        barata = t["pb"].where((t["pb"] > 0) & _zona(t, zona)).rank(pct=True) <= quintil
        return barata & (t["fscore"] >= fmin) & _zona(t, zona)

    return _mk("Valor contable barato + Piotroski", "piotroski", ok, lambda t: t["fscore"] - t["pb"].rank(pct=True), n, 2.0, tendencia,
               dict(n=n, fmin=fmin, quintil=quintil, tendencia=tendencia, zona=zona),
               [f"Entre el {quintil:.0%} con menor precio / valor contable ({NOMBRE_ZONA[zona]})",
                f"y una salud que mejora: ≥ {fmin} de 7 puntos Piotroski (rentable, menos deuda, más margen…)"])


def extremo_sectorial(n=30, umbral=0.8, deuda_max=3.0, tendencia=False, zona="global"):
    cols = ["per_pct", "pb_pct", "ev_ebitda_pct"]

    def ok(t):
        barata = (t[cols] >= umbral).sum(axis=1) >= 2
        return barata & (t["roe"] > 0) & ((t["deuda_ebitda"] <= deuda_max) | t["deuda_ebitda"].isna()) & _zona(t, zona)

    return _mk("Valor extremo frente a su sector", "extremo", ok, lambda t: t[cols].mean(axis=1), n, 2.0, tendencia,
               dict(n=n, umbral=umbral, deuda_max=deuda_max, tendencia=tendencia, zona=zona),
               [f"Entre el {1 - umbral:.0%} más barato de su sector en al menos 2 de: PER, P/VC, EV/EBITDA",
                f"ROE positivo y deuda neta ≤ {deuda_max:g}× EBITDA ({NOMBRE_ZONA[zona]})"])


def valor_giro(n=30, decil=0.1, zona="global"):
    """Lo más barato por EV/EBIT, pero solo cuando el precio ya se ha girado al alza (catalizador)."""
    def ok(t):
        b = (t["ev_ebit"] > 0) & ~t["sector"].isin(SIN_EV) & _zona(t, zona)
        barata = t["ev_ebit"].where(b).rank(pct=True) <= decil
        return barata & (t["mom_3m"] > 0) & (t["px"] > t["sma50"])

    return _mk("Valor con giro al alza", "giro", ok, lambda t: t["mom_3m"], n, 2.0, False,
               dict(n=n, decil=decil, zona=zona),
               [f"Entre el {decil:.0%} más barato por EV/EBIT ({NOMBRE_ZONA[zona]})",
                "y que ya sube en los últimos 3 meses (sobre su media de 50)"])


FAMILIAS = {"acquirer": acquirers_multiple, "magica": formula_magica, "netnet": net_net, "piotroski": piotroski,
            "extremo": extremo_sectorial, "giro": valor_giro}


def rejilla():
    yield from rejilla_compuesta()
    for n, tend, zona in itertools.product([20, 40], [False, True], ["global", "eeuu", "exeeuu"]):
        yield acquirers_multiple(n, tend, zona)
    for n, tend, zona in itertools.product([20, 40], [False, True], ["global", "eeuu", "exeeuu"]):
        yield formula_magica(n, tend, zona)
    for k, rentable, tend in itertools.product([1.0, 1.5], [False, True], [False, True]):
        yield net_net(k, 30, 5e5, rentable, tend)
    for n, fmin, tend in itertools.product([20, 40], [5, 6], [False, True]):
        yield piotroski(n, fmin, 0.2, tend)
    for n, umbral, tend in itertools.product([20, 40], [0.8, 0.9], [False, True]):
        yield extremo_sectorial(n, umbral, 3.0, tend)
    for n, decil, zona in itertools.product([20, 40], [0.1, 0.2], ["global", "eeuu"]):
        yield valor_giro(n, decil, zona)


def rejilla_compuesta():
    """Tu idea inicial (nota frente al sector con PER, P/VC, EV/EBITDA, deuda, ROE, margen, volatilidad, beta,
    Sharpe) en sus versiones más 'value'. Sin insiders: Yahoo solo da el dato de hoy (sería mirar al futuro)."""
    from estrategias_global import fundamental
    for pesos, tend, n in itertools.product(["valor", "calidad_barata", "equilibrado"], [False, True], [20, 40]):
        yield fundamental(pesos, tend, n, 2.0, 3.0, 0.0)


def valor_momentum(n=20, peso_mom=0.5, liquidez=2e6, zona="global", tendencia=True):
    """Nota = mitad valor extremo frente a su sector, mitad momentum de 6 meses (value + catalizador)."""
    cols = ["per_pct", "pb_pct", "ev_ebitda_pct"]

    def ok(t):
        return (t["roe"] > 0) & (t["per"] > 0) & _zona(t, zona) & (t[cols].notna().sum(axis=1) >= 2)

    def nota(t):
        m = ok(t) & operable(t) & (t["efectivo_60d"] >= liquidez)
        valor = t[cols].mean(axis=1).where(m).rank(pct=True)
        mom = t["mom_6m"].where(m).rank(pct=True)
        return (1 - peso_mom) * valor + peso_mom * mom

    e = _mk("Valor + momentum", "valor_momentum", ok, nota, n, 2.0, tendencia,
            dict(n=n, peso_mom=peso_mom, liquidez=liquidez, zona=zona, tendencia=tendencia),
            [f"Nota = {1 - peso_mom:.0%} lo barata que es frente a su sector (PER, P/VC, EV/EBITDA) "
             f"+ {peso_mom:.0%} lo que ha subido en 6 meses",
             f"Compra las {n} con mejor nota ({NOMBRE_ZONA[zona]})", "Solo empresas con beneficios (PER y ROE positivos)"],
            liquidez)
    e.reglas["venta"] = [f"Deja de estar entre las {n * 2} con mejor nota"]
    return e


def rejilla_2():
    for n, pm, liq, zona in itertools.product([20, 40], [0.3, 0.5], [2e6, 50e6], ["global", "eeuu"]):
        yield valor_momentum(n, pm, liq, zona, True)
    for n in [20, 40]:
        yield acquirers_multiple(n, True, "eeuu", 2.0, 50e6)
        yield formula_magica(n, True, "eeuu", 2.0, 50e6)


FAMILIAS["valor_momentum"] = valor_momentum


def rejilla_3():
    """Ajuste alrededor de valor + momentum (el único con ventaja en entrenamiento)."""
    for n, pm, tend in itertools.product([10, 15, 30], [0.2, 0.3, 0.4], [True, False]):
        yield valor_momentum(n, pm, 2e6, "global", tend)
    for zona, pm in itertools.product(["exeeuu"], [0.2, 0.3]):
        yield valor_momentum(20, pm, 2e6, zona, True)
    for liq in [5e5, 10e6]:
        yield valor_momentum(20, 0.3, liq, "global", True)
