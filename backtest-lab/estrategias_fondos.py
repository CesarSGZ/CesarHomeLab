"""Estrategias inspiradas en gestores de valor famosos, con las cuentas de la SEC (EE. UU., desde 2010).

Todas eligen las N mejores por una nota y venden cuando salen de las N x banda mejores (banda ancha = menos ventas,
menos impuestos). Necesitan los rasgos de bt/fund_largo.py en las tablas semanales.
"""
import itertools

import pandas as pd

from estrategias_deepvalue import SIN_EV, _mk, _zona

ZONA = "eeuu"


def _pct(t, c, alto=True, m=None):
    v = t[c] if m is None else t[c].where(m)
    return v.rank(pct=True, ascending=alto)


def _deuda_ok(t, x):
    return (t["deuda_ebitda"] <= x) | t["deuda_ebitda"].isna() | (t["caja_neta"] > 0)


def buffett(n=20, roe_min=0.12, nota="fcf", banda=2.0):
    """Negocios rentables de forma sostenida (ROE alto 5 años, sin años malos), poca deuda, a precio razonable."""
    def ok(t):
        return ((t["roe_med5"] >= 0.15) & (t["roe_min5"] >= roe_min) & _deuda_ok(t, 2.5) & (t["fcf_norm_yield"] > 0)
                & _zona(t, ZONA))
    col = {"fcf": "fcf_norm_yield", "beneficio": "ey_norm"}[nota]
    return _mk("Calidad a precio razonable (Buffett)", "buffett", ok, lambda t: t[col].where(ok(t)), n, banda, False,
               dict(n=n, roe_min=roe_min, nota=nota, banda=banda),
               [f"ROE mediano ≥ 15 % en 5 años y nunca por debajo del {roe_min:.0%}", "deuda neta ≤ 2,5x EBITDA o caja neta",
                f"las {n} con más {'caja libre media' if nota == 'fcf' else 'beneficio medio'} por euro de capitalización"])


def parames(n=20, cond="deprimido", banda=2.0):
    """Cíclicas en la parte baja: baratas sobre su beneficio medio de 5 años, con el beneficio actual deprimido o la
    acción muy caída, y balance que aguante (Cobas / Paramés)."""
    def ok(t):
        dep = t["deprimido"] < 0.8
        caida = t["dd_5a"] < -0.4
        c = {"deprimido": dep, "caida": caida, "ambas": dep & caida, "cualquiera": dep | caida}[cond]
        return c & (t["ey_norm"] > 0) & _deuda_ok(t, 3.0) & _zona(t, ZONA)
    return _mk("Cíclicas en mínimos (Paramés)", "parames", ok, lambda t: t["ebit_ev_norm"].where(ok(t)).fillna(t["ey_norm"].where(ok(t))),
               n, banda, False, dict(n=n, cond=cond, banda=banda),
               ["Baratas sobre su beneficio medio de 5 años", {"deprimido": "con el beneficio actual por debajo del 80 % del normal",
                "caida": "y caídas más del 40 % desde su máximo de 5 años", "ambas": "beneficio deprimido y acción caída > 40 %",
                "cualquiera": "beneficio deprimido o acción caída > 40 %"}[cond], "deuda neta ≤ 3x EBITDA o caja neta"])


def canibales(n=20, recompra=-0.05, banda=2.0):
    """Empresas que recompran muchas acciones (3 años) y siguen baratas por caja libre."""
    def ok(t):
        return (t["acc_3a"] <= recompra) & (t["fcf_yield"] > 0) & (t["roe_med5"] > 0) & _zona(t, ZONA)
    return _mk("Caníbales baratas", "canibales", ok, lambda t: (_pct(t, "fcf_yield") + _pct(t, "acc_3a", False)).where(ok(t)), n, banda, False,
               dict(n=n, recompra=recompra, banda=banda),
               [f"Han reducido su nº de acciones al menos un {-recompra:.0%} en 3 años", "las de más caja libre por euro"])


def accionista(n=20, banda=2.0):
    """Lo que más devuelve al accionista (dividendos + recompras) y lo puede pagar con caja libre."""
    def ok(t):
        return (t["shy"] > 0) & (t["fcf_norm_yield"] > 0) & (t["roe_med5"] > 0) & _zona(t, ZONA)
    return _mk("Rentabilidad para el accionista", "accionista", ok, lambda t: t["shy"].where(ok(t)), n, banda, False,
               dict(n=n, banda=banda), ["Las que más devuelven (dividendos + recompras) sobre su capitalización",
                                        "con caja libre positiva"])


def calidad_valor(n=20, valor="ebit", banda=2.0):
    """Novy-Marx: mucha rentabilidad bruta sobre activos y baratas, a partes iguales."""
    def ok(t):
        return (t["gp_a"] > 0) & ~t["sector"].isin(SIN_EV) & _zona(t, ZONA)
    v = {"ebit": "ebit_ev_norm", "contable": "pb"}[valor]
    return _mk("Calidad + valor (Novy-Marx)", "calidad_valor", ok,
               lambda t: (_pct(t, "gp_a", m=ok(t)) + _pct(t, v, valor != "contable", m=ok(t))).where(ok(t)), n, banda, False,
               dict(n=n, valor=valor, banda=banda), ["Mitad: beneficio bruto / activos alto", "mitad: barata"])


def qarp(n=20, peso_mom=0.0, banda=2.0):
    """Compuesto de gestor de valor: barata (beneficio y caja normalizados), buena (ROIC, rentabilidad bruta),
    poca deuda y sin diluir; opcionalmente con algo de tendencia."""
    def ok(t):
        return (t["ey_norm"] > 0) & (t["roic_med5"] > 0) & _zona(t, ZONA)

    def nota(t):
        m = ok(t)
        partes = [_pct(t, "ey_norm", m=m), _pct(t, "fcf_norm_yield", m=m), _pct(t, "roic_med5", m=m), _pct(t, "gp_a", m=m),
                  _pct(t, "acc_3a", False, m=m), _pct(t, "deuda_ebitda", False, m=m)]
        base = pd.concat(partes, axis=1).mean(axis=1, skipna=True)
        if peso_mom:
            base = (1 - peso_mom) * base + peso_mom * _pct(t, "mom_12_1", m=m)
        return base.where(m)
    return _mk("Valor de calidad (compuesto)", "qarp", ok, nota, n, banda, False, dict(n=n, peso_mom=peso_mom, banda=banda),
               ["Nota: beneficio y caja libre normales baratos, ROIC y margen bruto altos, poca deuda, sin diluir"]
               + ([f"{peso_mom:.0%} de la nota por la subida de 12 meses"] if peso_mom else []))


def caja_neta(n=20, banda=2.0):
    """Pabrai / Graham suave: caja neta positiva y EBIT normal barato."""
    def ok(t):
        return (t["caja_neta"] > 0) & (t["ebit_ev_norm"] > 0) & _zona(t, ZONA)
    return _mk("Caja neta y barata", "caja_neta", ok, lambda t: t["ebit_ev_norm"].where(ok(t)), n, banda, False,
               dict(n=n, banda=banda), ["Más caja que deuda", "las más baratas por EBIT medio de 5 años / valor empresa"])


def magica_normal(n=20, banda=2.0):
    """Greenblatt con EBIT medio del ciclo: barata y buena."""
    def ok(t):
        return (t["ebit_ev_norm"] > 0) & (t["roic_med5"] > 0) & ~t["sector"].isin(SIN_EV | {"Utilities"}) & _zona(t, ZONA)
    return _mk("Fórmula mágica sobre el ciclo", "magica_normal", ok,
               lambda t: (_pct(t, "ebit_ev_norm", m=ok(t)) + _pct(t, "roic_med5", m=ok(t))).where(ok(t)), n, banda, False,
               dict(n=n, banda=banda), ["Barata por EBIT medio de 5 años y con alto rendimiento del capital medio"])


FAMILIAS = {"buffett": buffett, "parames": parames, "canibales": canibales, "accionista": accionista,
            "calidad_valor": calidad_valor, "qarp": qarp, "caja_neta": caja_neta, "magica_normal": magica_normal}


def rejilla():
    for n, banda in itertools.product([20, 30], [2.0, 3.0]):
        for roe_min, nota in itertools.product([0.08, 0.12], ["fcf", "beneficio"]):
            yield "buffett", buffett(n, roe_min, nota, banda)
        for cond in ["deprimido", "caida", "ambas", "cualquiera"]:
            yield "parames", parames(n, cond, banda)
        for rec in [-0.03, -0.08]:
            yield "canibales", canibales(n, rec, banda)
        yield "accionista", accionista(n, banda)
        for v in ["ebit", "contable"]:
            yield "calidad_valor", calidad_valor(n, v, banda)
        for pm in [0.0, 0.25]:
            yield "qarp", qarp(n, pm, banda)
        yield "caja_neta", caja_neta(n, banda)
        yield "magica_normal", magica_normal(n, banda)


# --------------------------------------------------------------------------------------------
# Ronda 3: fundamentales + tendencia (lo que el mercado de 2019-hoy ha premiado), elegida igual: solo con 2010-2018
# --------------------------------------------------------------------------------------------
def _con_mercado(e, filtro):
    if filtro:
        e.filtro_mercado = True
        e.parametros["filtro_mercado"] = True
    return e


def calidad_momentum(n=20, mom="mom_12_1", liquidez=2e6, filtro=False, banda=2.0):
    """Momentum solo entre empresas de calidad: rentables 5 años, poca deuda, caja libre y sin diluir."""
    def ok(t):
        return ((t["roe_med5"] >= 0.10) & (t["fcf_norm_yield"] > 0) & _deuda_ok(t, 3.0)
                & ((t["acc_3a"] <= 0.05) | t["acc_3a"].isna()) & _zona(t, ZONA))
    e = _mk("Calidad con tendencia", "calidad_momentum", ok, lambda t: t[mom].where(ok(t)), n, banda, True,
            dict(n=n, mom=mom, liquidez=liquidez, banda=banda),
            ["Empresas de calidad: ROE mediano ≥ 10 % en 5 años, caja libre positiva, poca deuda, sin diluir",
             f"las {n} que más suben ({ {'mom_12_1': '12 meses', 'mom_6m': '6 meses'}[mom] })"], liquidez)
    return _con_mercado(e, filtro)


def valor_tendencia(n=20, peso_valor=0.5, liquidez=2e6, filtro=False, banda=2.0):
    """Barata sobre el beneficio y la caja normales + subiendo (el mercado empieza a reconocerla)."""
    def ok(t):
        return (t["ey_norm"] > 0) & (t["roe_med5"] > 0) & _zona(t, ZONA)

    def nota(t):
        m = ok(t)
        valor = (_pct(t, "ey_norm", m=m) + _pct(t, "fcf_norm_yield", m=m)) / 2
        return (peso_valor * valor + (1 - peso_valor) * _pct(t, "mom_12_1", m=m)).where(m)
    e = _mk("Valor con tendencia", "valor_tendencia", ok, nota, n, banda, True,
            dict(n=n, peso_valor=peso_valor, liquidez=liquidez, banda=banda),
            [f"Nota: {peso_valor:.0%} barata (beneficio y caja libre medios) + {1 - peso_valor:.0%} subida de 12 meses"], liquidez)
    return _con_mercado(e, filtro)


def garp(n=20, liquidez=2e6, filtro=False, banda=2.0):
    """Crecimiento a precio razonable (Lynch): vende cada vez más, rentable y no cara."""
    def ok(t):
        return (t["crec_ventas_5a"] > 0.08) & (t["roe_med5"] > 0.10) & (t["ey_norm"] > 0) & _zona(t, ZONA)

    def nota(t):
        m = ok(t)
        return (_pct(t, "crec_ventas_5a", m=m) + _pct(t, "ey_norm", m=m) + _pct(t, "mom_12_1", m=m)).where(m)
    e = _mk("Crecimiento a precio razonable", "garp", ok, nota, n, banda, True, dict(n=n, liquidez=liquidez, banda=banda),
            ["Ventas creciendo > 8 % al año en 5 años, ROE mediano > 10 %", "nota: crecimiento + barata + tendencia"], liquidez)
    return _con_mercado(e, filtro)


FAMILIAS.update({"calidad_momentum": calidad_momentum, "valor_tendencia": valor_tendencia, "garp": garp})


def rejilla_3():
    for liq, filtro in itertools.product([2e6, 50e6], [False, True]):
        for n, mom in itertools.product([15, 30], ["mom_12_1", "mom_6m"]):
            yield "calidad_momentum", calidad_momentum(n, mom, liq, filtro)
        for n, pv in itertools.product([20, 30], [0.3, 0.6]):
            yield "valor_tendencia", valor_tendencia(n, pv, liq, filtro)
        for n in [20, 30]:
            yield "garp", garp(n, liq, filtro)


# --------------------------------------------------------------------------------------------
# Ronda 4: copiar a los grandes inversores de valor (13F). Datos desde 2013: entrenamiento 2014-2018
# --------------------------------------------------------------------------------------------
def clon(n=20, nota="peso", min_gestores=1, banda=2.0, tendencia=False):
    """Las acciones con más convicción compartida entre ~25 gestores de valor (Berkshire, Pabrai, Li Lu, Akre…)."""
    def ok(t):
        return (t["clon_n"] >= min_gestores) & _zona(t, ZONA)
    col = {"peso": "clon_peso", "consenso": "clon_n"}[nota]
    return _mk("Copiar a los grandes de valor (13F)", "clon", ok,
               lambda t: (t[col] + (t["clon_peso"] * 1e-3 if nota == "consenso" else 0)).where(ok(t)), n, banda, tendencia,
               dict(n=n, nota=nota, min_gestores=min_gestores, banda=banda, tendencia=tendencia),
               ["Carteras declaradas a la SEC (13F) por ~25 gestores de valor, ya publicadas",
                f"las {n} con más {'peso total en sus carteras' if nota == 'peso' else 'gestores que la tienen'}"
                + (f" (al menos {min_gestores})" if min_gestores > 1 else "")])


FAMILIAS["clon"] = clon


def rejilla_4():
    for n, nota, mg, banda, tend in itertools.product([10, 20], ["peso", "consenso"], [1, 2], [2.0, 3.0], [False, True]):
        if nota == "consenso" and mg == 1:
            continue
        yield "clon", clon(n, nota, mg, banda, tend)


# --------------------------------------------------------------------------------------------
# Ronda 5: más gestores (13F ampliado + fondos españoles de la CNMV) y nota por convicción y antigüedad
# --------------------------------------------------------------------------------------------
PREFIJOS = {"13f": "c13", "ambos": "cam", "cnmv": "ces"}


def clon2(n=10, fuentes="13f", nota="consenso", min_gestores=2, banda=3.0):
    p = PREFIJOS[fuentes]
    zona = "eeuu" if fuentes == "13f" else "global"

    def ok(t):
        return (t[f"{p}_n"] >= min_gestores) & _zona(t, zona)

    def puntos(t):
        if nota == "consenso":
            v = t[f"{p}_n"] + t[f"{p}_peso"] * 1e-3
        elif nota == "peso":
            v = t[f"{p}_peso"]
        elif nota == "conviccion":
            v = t[f"{p}_conv"] + t[f"{p}_peso"] * 1e-3
        else:                                            # antigüedad: peso x trimestres seguidos en cartera
            v = t[f"{p}_antig"]
        return v.where(ok(t))
    origen = {"13f": "~50 gestores de valor de EE. UU. (13F)", "cnmv": "gestores de valor españoles (Cobas, Azvalor, Magallanes...)",
              "ambos": "~50 gestores de EE. UU. (13F) + gestores españoles (Cobas, Azvalor, Magallanes...)"}[fuentes]
    criterio = {"consenso": "más gestores que la tienen", "peso": "más peso total en sus carteras",
                "conviccion": "más gestores que la tienen con convicción (≥ 4 % de su cartera)",
                "antig": "más peso mantenido durante más tiempo"}[nota]
    return _mk("Copiar a los grandes de valor", "clon2", ok, puntos, n, banda, False,
               dict(n=n, fuentes=fuentes, nota=nota, min_gestores=min_gestores, banda=banda),
               [f"Carteras ya publicadas de {origen}", f"las {n} con {criterio}"
                + (f" (al menos {min_gestores} gestores)" if min_gestores > 1 else "")])


FAMILIAS["clon2"] = clon2


def rejilla_5():
    for fuentes, nota, n, mg in itertools.product(["13f", "ambos", "cnmv"], ["consenso", "peso", "conviccion", "antig"], [10, 20], [1, 2]):
        if nota == "consenso" and mg == 1:
            continue
        yield "clon2", clon2(n, fuentes, nota, mg, 3.0)
