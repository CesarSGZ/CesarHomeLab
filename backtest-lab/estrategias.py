"""
ESTRATEGIAS: aqui se definen las reglas. Es el unico fichero que hay que tocar para probar variantes.

Cada estrategia recibe, cada viernes al cierre, una tabla `t` con una fila por empresa y columnas:
  precio, px (precio con dividendos), sma50, sma200, mom_3m, mom_6m, mom_12m, mom_12_1,
  vol_60d, efectivo_60d (EUR negociados/dia), dist_max (distancia al maximo de 1 anio),
  sector, es_financiera,
  y si usa_fundamentales=True: capitalizacion, per, ev_ebitda, p_vc, dn_ebitda (deuda neta/EBITDA),
  roe, margen_neto, margen_ebitda, crec_ingresos, crec_beneficio, y los relativos a la mediana
  de su sector: per_rel, ev_ebitda_rel, p_vc_rel  (1.0 = igual que la mediana; <1 = mas barata).

Y define tres funciones sobre esa tabla:
  entrada(t)    -> True si la empresa es candidata a comprar
  mantener(t)   -> False si hay que venderla
  puntuacion(t) -> numero; si hay mas candidatas que huecos se compran las de mayor puntuacion
El motor ya aplica por su cuenta el filtro de liquidez y el bloqueo tras datos anomalos.
"""
from bt.motor import Estrategia
from bt.senales import SECTORES_DEUDA_ALTA

NOMBRES_MOMENTUM = {"mom_3m": "3 meses", "mom_6m": "6 meses", "mom_12m": "12 meses",
                    "mom_12_1": "12 meses sin el último mes"}


def _m(x):
    return f"{x / 1e6:g} M€".replace(".", ",")


# ------------------------------------------------------------------------------------------
# 1) Valor + calidad + tendencia (fundamentales; solo hay datos desde abril de 2023)
# ------------------------------------------------------------------------------------------
def valor_calidad_tendencia(n=12, dn_max=3.0, dn_max_sectores_deuda=4.5, holgura=1.15,
                            liquidez_min=1e6, capital=50_000,
                            inicio="2023-04-03", fin_entrenamiento="2024-12-31"):
    # Yahoo solo da cuenta de resultados anual desde el ejercicio 2022, publicado en feb-abr 2023:
    # antes de esa fecha casi ninguna empresa tiene ratios, por eso empieza en abril de 2023.
    def limite_deuda(t):
        return t["sector"].isin(SECTORES_DEUDA_ALTA).map({True: dn_max_sectores_deuda, False: dn_max})

    def cumple(t, h, extra_deuda):
        tendencia = t["px"] > t["sma200"]
        rentable = (t["roe"] > 0) & (t["per"] > 0)
        # empresas no financieras: EV/EBITDA y PER bajo la mediana del sector, deuda contenida
        no_fin = (~t["es_financiera"] & (t["ev_ebitda_rel"] < h) & (t["per_rel"] < h)
                  & (t["dn_ebitda"] <= limite_deuda(t) + extra_deuda))
        # bancos y aseguradoras: EV/EBITDA no aplica -> PER y precio/valor contable bajo la mediana
        fin = t["es_financiera"] & (t["per_rel"] < h) & (t["p_vc_rel"] < h)
        return tendencia & rentable & (no_fin | fin)

    def puntuacion(t):
        valor = t["ev_ebitda_rel"].where(~t["es_financiera"], t["p_vc_rel"])
        return -(t["per_rel"] + valor) / 2      # mas barata respecto a su sector = mejor

    hol = f"{(holgura - 1) * 100:.0f} %"
    reglas = {
        "compra": [
            "Está más barata que la mediana de su sector por EV/EBITDA y por PER.",
            f"Su deuda neta es como mucho {dn_max:g} veces su EBITDA ({dn_max_sectores_deuda:g} en eléctricas, inmobiliarias y telecos).",
            "Gana dinero: ROE positivo.",
            "Está en tendencia alcista: precio por encima de su media de 200 sesiones.",
            "Bancos y aseguradoras: en lugar de EV/EBITDA y deuda, se exige PER y precio/valor contable bajo la mediana del sector.",
        ],
        "venta": [
            "El precio cae por debajo de su media de 200 sesiones.",
            f"O deja de ser barata (con un margen del {hol} sobre la mediana, para no vender por ruido), "
            "su deuda se dispara o deja de ganar dinero.",
        ],
        "cartera": [
            f"{n} posiciones como máximo, mismo importe en cada una.",
            "Se revisa cada viernes al cierre y se opera el lunes en la apertura.",
            "Si hay más candidatas que huecos, entran las más baratas respecto a su sector.",
            f"Solo valores con al menos {_m(liquidez_min)} negociados al día.",
        ],
    }
    return Estrategia(
        nombre="Valor + calidad + tendencia",
        descripcion=(f"Compra: EV/EBITDA y PER bajo la mediana de su sector (bancos/aseguradoras: PER y "
                     f"P/VC), deuda neta/EBITDA <= {dn_max} ({dn_max_sectores_deuda} en utilities, "
                     f"inmobiliario y telecos), ROE > 0, precio > media 200. Venta: pierde la media 200 o "
                     f"deja de cumplir (holgura {holgura:.0%} en valoracion y +0,5x en deuda para no rotar "
                     f"por ruido). {n} posiciones equiponderadas, revision semanal."),
        entrada=lambda t: cumple(t, 1.0, 0.0),
        mantener=lambda t: cumple(t, holgura, 0.5),
        puntuacion=puntuacion,
        n_posiciones=n, usa_fundamentales=True, inicio=inicio, fin_entrenamiento=fin_entrenamiento,
        liquidez_min=liquidez_min, capital_inicial=capital,
        parametros=dict(n=n, dn_max=dn_max, holgura=holgura, liquidez_min=liquidez_min, capital=capital),
        reglas=reglas,
    )


# ------------------------------------------------------------------------------------------
# 2) Solo precio: tendencia + momentum (historico largo, desde 2008)
# ------------------------------------------------------------------------------------------
def tendencia_momentum(n=12, momentum="mom_6m", banda=2.5, liquidez_min=1e6, capital=50_000,
                       inicio="2008-01-01", fin_entrenamiento="2016-12-31"):
    def ranking(t):
        liquido = t["efectivo_60d"] >= liquidez_min
        return t[momentum].where(liquido).rank(ascending=False)

    def entrada(t):
        return ((t["px"] > t["sma200"]) & (t["sma50"] > t["sma200"]) & (t[momentum] > 0)
                & (ranking(t) <= n))

    def mantener(t):
        # se mantiene mientras siga sobre la media 200 y entre los n*banda mejores por momentum
        return (t["px"] > t["sma200"]) & (ranking(t) <= n * banda)

    lb = NOMBRES_MOMENTUM.get(momentum, momentum)
    reglas = {
        "compra": [
            "Precio por encima de su media de 200 sesiones (tendencia de fondo alcista).",
            "Media de 50 sesiones por encima de la de 200 (la tendencia se confirma).",
            f"Ha subido en los últimos {lb} y está entre las {n} que más han subido del mercado.",
        ],
        "venta": [
            "El precio cae por debajo de su media de 200 sesiones.",
            f"O deja de estar entre las {int(n * banda)} que más suben.",
        ],
        "cartera": [
            f"{n} posiciones como máximo, mismo importe en cada una.",
            "Se revisa cada viernes al cierre y se opera el lunes en la apertura.",
            "No mira ninguna cuenta de resultados: solo precios. Por eso puede probarse desde 2008.",
            f"Solo valores con al menos {_m(liquidez_min)} negociados al día.",
        ],
    }
    return Estrategia(
        nombre=f"Tendencia + momentum ({lb}, {n} pos.)",
        descripcion=(f"Compra: precio > media 200, media 50 > media 200, momentum {momentum} positivo y "
                     f"entre los {n} mejores del universo liquido. Venta: pierde la media 200 o cae fuera "
                     f"de los {int(n * banda)} mejores. {n} posiciones equiponderadas, revision semanal."),
        entrada=entrada, mantener=mantener, puntuacion=lambda t: t[momentum],
        n_posiciones=n, inicio=inicio, fin_entrenamiento=fin_entrenamiento, liquidez_min=liquidez_min,
        capital_inicial=capital,
        parametros=dict(n=n, momentum=momentum, banda=banda, liquidez_min=liquidez_min, capital=capital),
        reglas=reglas,
    )


# Rejilla de parametros que se prueba SOLO en el periodo de entrenamiento (2008-2016);
# la mejor por Sharpe se evalua despues en 2017-hoy sin tocarla.
REJILLA_PRECIO = [dict(n=n, momentum=m) for m in ("mom_3m", "mom_6m", "mom_12_1") for n in (10, 15)]

# Parametros que se pueden cambiar desde la web (y sus limites). backtest.py --params los valida.
PARAMETROS_WEB = {
    "vct": {"n": (int, 5, 20), "holgura": (float, 1.0, 1.5), "dn_max": (float, 1.0, 6.0),
            "liquidez_min": (float, 2.5e5, 1e7), "capital": (float, 5e3, 1e6)},
    "momentum": {"n": (int, 5, 25), "momentum": (str, tuple(NOMBRES_MOMENTUM)), "banda": (float, 1.0, 4.0),
                 "liquidez_min": (float, 2.5e5, 1e7), "capital": (float, 5e3, 1e6)},
}

# Estrategias que se ejecutan con `python backtest.py`
ESTRATEGIAS = {
    "vct": valor_calidad_tendencia,
    "momentum": tendencia_momentum,
}
