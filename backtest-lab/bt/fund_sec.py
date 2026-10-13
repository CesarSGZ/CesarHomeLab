"""Fundamentales point-in-time a partir de las cuentas XBRL de la SEC (datos_global/sec/companyfacts).

Diferencias con los de Yahoo (bt/fund_global.py):
- Historia desde 2009-2011 (cuando la SEC hizo obligatorio el XBRL) en lugar de ~5 años.
- Cada cuenta se usa desde la FECHA REAL EN QUE SE PRESENTÓ, no con un retraso fijo.
- Se usa el valor tal como se publicó por primera vez (sin reexpresiones posteriores).
- Flujos (ventas, beneficio, EBIT...) en últimos 12 meses: acumulado del año + último año fiscal − acumulado del
  año anterior. Balance (patrimonio, deuda, caja...) al cierre del trimestre.
- Solo empresas que presentan a la SEC: las de EE. UU. (y algunas extranjeras con 20-F/40-F, solo anual).

Devuelve una tabla con las mismas columnas que fund_global.leer_todo(), para reutilizar fund_global.ratios().
"""
import gzip
import json
from pathlib import Path

import numpy as np
import pandas as pd

from .global_datos import DIR

SEC = DIR / "sec"

# concepto propio -> conceptos XBRL en orden de preferencia (us-gaap; los ifrs-full llevan prefijo)
FLUJO = {
    "ingresos": ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "RevenueFromContractWithCustomerIncludingAssessedTax",
                 "SalesRevenueNet", "SalesRevenueGoodsNet", "RevenuesNetOfInterestExpense", "InterestAndDividendIncomeOperating",
                 "ifrs-full:Revenue"],
    "beneficio": ["NetIncomeLossAvailableToCommonStockholdersBasic", "NetIncomeLoss", "ProfitLoss",
                  "ifrs-full:ProfitLossAttributableToOwnersOfParent", "ifrs-full:ProfitLoss"],
    "ebit": ["OperatingIncomeLoss", "ifrs-full:ProfitLossFromOperatingActivities"],
    "amortizacion": ["DepreciationDepletionAndAmortization", "DepreciationAndAmortization", "DepreciationAmortizationAndAccretionNet",
                     "Depreciation", "ifrs-full:DepreciationAndAmortisationExpense"],
    "beneficio_bruto": ["GrossProfit", "ifrs-full:GrossProfit"],
    "coste_ventas": ["CostOfRevenue", "CostOfGoodsAndServicesSold", "CostOfGoodsSold"],
    "acciones_medias": ["WeightedAverageNumberOfDilutedSharesOutstanding", "WeightedAverageNumberOfSharesOutstandingBasic"],
    "antes_impuestos": ["IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest",
                        "IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments",
                        "ifrs-full:ProfitLossBeforeTax"],
    "intereses": ["InterestExpense", "InterestExpenseDebt", "InterestExpenseNonoperating"],
    # flujo de caja (para caja libre y lo que se devuelve al accionista)
    "cfo": ["NetCashProvidedByUsedInOperatingActivities", "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
            "ifrs-full:CashFlowsFromUsedInOperatingActivities"],
    "capex": ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets",
              "ifrs-full:PurchaseOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities"],
    "recompras": ["PaymentsForRepurchaseOfCommonStock", "PaymentsForRepurchaseOfEquity"],
    "dividendos": ["PaymentsOfDividendsCommonStock", "PaymentsOfDividends", "ifrs-full:DividendsPaidClassifiedAsFinancingActivities"],
}
BALANCE = {
    "patrimonio": ["StockholdersEquity", "ifrs-full:EquityAttributableToOwnersOfParent"],
    "patrimonio_total": ["StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest", "ifrs-full:Equity"],
    "minoritarios": ["MinorityInterest", "ifrs-full:NoncontrollingInterests"],
    "deuda_lp_total": ["LongTermDebt", "LongTermDebtAndCapitalLeaseObligations"],
    "deuda_lp_nc": ["LongTermDebtNoncurrent", "LongTermDebtAndCapitalLeaseObligationsNoncurrent", "ifrs-full:NoncurrentPortionOfNoncurrentBorrowings"],
    "deuda_lp_c": ["LongTermDebtCurrent", "LongTermDebtAndCapitalLeaseObligationsCurrent", "ifrs-full:CurrentPortionOfNoncurrentBorrowings"],
    "deuda_cp": ["ShortTermBorrowings", "CommercialPaper", "DebtCurrent", "ifrs-full:CurrentBorrowings"],
    "caja": ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents", "Cash",
             "ifrs-full:CashAndCashEquivalents"],
    "inversiones_cp": ["ShortTermInvestments", "MarketableSecuritiesCurrent", "AvailableForSaleSecuritiesDebtSecuritiesCurrent"],
    "activo_corriente": ["AssetsCurrent", "ifrs-full:CurrentAssets"],
    "pasivo_corriente": ["LiabilitiesCurrent", "ifrs-full:CurrentLiabilities"],
    "activo_total": ["Assets", "ifrs-full:Assets"],
    "pasivo_total": ["Liabilities", "ifrs-full:Liabilities"],
    "acciones_balance": ["CommonStockSharesOutstanding"],
}
ANUAL = (340, 390)
TRAMOS = [(80, 100), (170, 195), (260, 285)]


def _hechos(facts, nombres, unidad_ok):
    """Todos los conceptos alternativos juntos; para cada (start, end) gana el de más preferencia y, dentro de él,
    el primer valor publicado. Así una empresa que cambia de concepto con los años no deja huecos."""
    partes = []
    for prioridad, n in enumerate(nombres):
        filas = facts.get(n)
        if filas:
            partes.append(pd.DataFrame(filas).assign(prioridad=prioridad))
    if not partes:
        return None
    df = pd.concat(partes, ignore_index=True)
    df = df[df["unidad"].map(unidad_ok)]
    if not len(df):
        return None
    df["end"] = pd.to_datetime(df["end"], errors="coerce")
    df["filed"] = pd.to_datetime(df["filed"], errors="coerce")
    df["start"] = pd.to_datetime(df["start"], errors="coerce") if "start" in df else pd.NaT
    df = df.dropna(subset=["end", "filed"]).sort_values(["prioridad", "filed"])
    df = df.drop_duplicates(["start", "end"], keep="first").sort_values("filed")
    df["dur"] = (df["end"] - df["start"]).dt.days
    return df


def _ttm(df, fin, publicado):
    """Últimos 12 meses terminados en 'fin' con lo publicado hasta 'publicado'."""
    if df is None:
        return np.nan
    x = df[df["filed"] <= publicado]
    a = x[(x["end"] == fin) & x["dur"].between(*ANUAL)]
    if len(a):
        return float(a["val"].iloc[-1])
    for lo, hi in reversed(TRAMOS):
        ytd = x[(x["end"] == fin) & x["dur"].between(lo, hi)]
        if not len(ytd):
            continue
        ini, v = ytd["start"].iloc[-1], float(ytd["val"].iloc[-1])
        prev_a = x[x["dur"].between(*ANUAL) & (x["end"] - ini).dt.days.between(-8, 0)]
        prev_y = x[x["dur"].between(lo, hi) & (x["start"] - (ini - pd.DateOffset(years=1))).dt.days.abs().le(10)
                   & (x["end"] - (fin - pd.DateOffset(years=1))).dt.days.abs().le(10)]
        if len(prev_a) and len(prev_y):
            return v + float(prev_a["val"].iloc[-1]) - float(prev_y["val"].iloc[-1])
    # último recurso: 4 trimestres sueltos
    q = x[x["dur"].between(80, 100) & (x["end"] <= fin) & (x["end"] > fin - pd.Timedelta(days=370))]
    q = q.drop_duplicates("end", keep="last")
    if len(q) == 4:
        return float(q["val"].sum())
    return np.nan


def _instante(df, fin, publicado):
    if df is None:
        return np.nan
    x = df[(df["filed"] <= publicado) & (df["end"] <= fin) & (df["end"] > fin - pd.Timedelta(days=100))]
    if not len(x):
        return np.nan
    x = x[x["end"] == x["end"].max()]
    return float(x.sort_values(["prioridad", "filed"])["val"].iloc[0])


def _acciones(facts, accn, fin, publicado, splits):
    """Acciones en circulación de la portada del informe (suma de clases), llevadas a la fecha de cierre del periodo."""
    filas = facts.get("dei:EntityCommonStockSharesOutstanding")
    if filas:
        df = pd.DataFrame(filas)
        df = df[df["accn"] == accn]
        if len(df):
            df["end"] = pd.to_datetime(df["end"], errors="coerce")
            ult = df["end"].max()
            n = float(df.loc[df["end"] == ult, "val"].drop_duplicates().sum())
            # si hubo un split entre el cierre y la fecha de portada, se deshace para que cuadre con el cierre
            for dia, factor in splits.items():
                if fin < dia <= ult:
                    n /= factor
            if n > 0:
                return n
    return np.nan


def empresa(ruta, splits):
    js = json.loads(gzip.open(ruta, "rt", encoding="utf-8").read())
    facts = js["facts"]
    # divisa de las cuentas: la más usada en el beneficio
    unidades = pd.Series([f["unidad"] for n in FLUJO["beneficio"] for f in facts.get(n, [])])
    divisa = unidades.mode().iloc[0] if len(unidades) else "USD"
    es_div = lambda u: u == divisa
    es_acc = lambda u: u == "shares"
    flujos = {k: _hechos(facts, v, es_acc if k == "acciones_medias" else es_div) for k, v in FLUJO.items()}
    balances = {k: _hechos(facts, v, es_acc if k == "acciones_balance" else es_div) for k, v in BALANCE.items()}
    ben = flujos["beneficio"]
    if ben is None:
        return None, divisa
    # un registro por informe: cierre = el periodo más reciente del beneficio en ese informe
    filas_ben = pd.DataFrame([f for n in FLUJO["beneficio"] for f in facts.get(n, [])])
    filas_ben = filas_ben[(filas_ben["unidad"] == divisa) & filas_ben["form"].isin(
        ["10-K", "10-Q", "10-KT", "20-F", "40-F", "10-K/A", "10-Q/A"])]
    filas_ben["end"] = pd.to_datetime(filas_ben["end"], errors="coerce")
    filas_ben["filed"] = pd.to_datetime(filas_ben["filed"], errors="coerce")
    informes = filas_ben.groupby("accn").agg(fin=("end", "max"), publicado=("filed", "min"), form=("form", "first")).reset_index()
    informes = informes.sort_values("publicado").drop_duplicates("fin", keep="first")
    out = []
    for inf in informes.itertuples():
        fila = {"periodo": inf.fin, "disponible": inf.publicado, "form": inf.form}
        for k, df in flujos.items():
            fila[k] = _ttm(df, inf.fin, inf.publicado)
        for k, df in balances.items():
            fila[k] = _instante(df, inf.fin, inf.publicado)
        fila["acciones"] = _acciones(facts, inf.accn, inf.fin, inf.publicado, splits)
        out.append(fila)
    t = pd.DataFrame(out)
    if not len(t):
        return None, divisa
    t["acciones"] = t["acciones"].fillna(t["acciones_balance"]).fillna(t["acciones_medias"])
    # control: si la portada dice algo muy distinto de las acciones medias del periodo (errores de escala, ADR que
    # cuentan acciones locales...), se usan las medias
    q = t["acciones"] / t["acciones_medias"]
    raro = (q > 1.6) | (q < 0.6)
    t.loc[raro, "acciones"] = t.loc[raro, "acciones_medias"]
    t["ebit"] = t["ebit"].fillna(t["antes_impuestos"] + t["intereses"].fillna(0))
    t["ebitda"] = t["ebit"] + t["amortizacion"].fillna(0)
    t["beneficio_bruto"] = t["beneficio_bruto"].fillna(t["ingresos"] - t["coste_ventas"])
    lp = t["deuda_lp_total"].fillna(t["deuda_lp_nc"].fillna(0) + t["deuda_lp_c"].fillna(0))
    t["deuda"] = lp.fillna(0) + t["deuda_cp"].fillna(0)
    t.loc[t[["deuda_lp_total", "deuda_lp_nc", "deuda_lp_c", "deuda_cp"]].isna().all(axis=1), "deuda"] = 0.0
    t["caja"] = t["caja"] + t["inversiones_cp"].fillna(0)
    t["patrimonio"] = t["patrimonio"].fillna(t["patrimonio_total"] - t["minoritarios"].fillna(0))
    t["pasivo_total"] = t["pasivo_total"].fillna(t["activo_total"] - t["patrimonio_total"])
    t["capital_invertido"] = t["patrimonio"] + t["deuda"] - t["caja"].fillna(0)
    return t, divisa


def _una(trabajo):
    """Una empresa (para el reparto entre procesos): (ticker, fotos con F-score, divisa)."""
    from .fund_global import _piotroski
    ruta, splits = trabajo
    tk = ruta.name[:-len(".json.gz")]
    try:
        t, divisa = empresa(ruta, splits)
    except Exception as e:  # noqa: BLE001
        print("fund_sec: error en", tk, e, flush=True)
        return tk, None, None
    if t is None:
        return tk, None, divisa
    anual = t[t["form"].isin(["10-K", "10-K/A", "10-KT", "20-F", "20-F/A", "40-F"])].set_index("periodo")
    t["fscore"] = np.nan
    if len(anual) >= 2:
        f = _piotroski(anual[~anual.index.duplicated(keep="last")]).reindex(t["periodo"])
        t["fscore"] = f.ffill().values          # el F-score del último año fiscal cerrado
    t["ticker"], t["tipo"] = tk, "ttm"
    return tk, t, divisa


def leer_todo(tickers=None, cache=True):
    """(fotos, info) con el mismo formato que fund_global.leer_todo().
    Caché por empresa (sec/fotos/<ticker>.parquet): solo se recalculan las empresas cuyas cuentas son más nuevas."""
    from concurrent.futures import ProcessPoolExecutor
    import os
    dir_fotos = SEC / "fotos"
    dir_fotos.mkdir(parents=True, exist_ok=True)
    rutas = [r for r in sorted((SEC / "companyfacts").glob("*.json.gz"))
             if tickers is None or r.name[:-len(".json.gz")] in tickers]
    nombre = lambda r: r.name[:-len(".json.gz")]
    pendientes = [r for r in rutas if not cache or not (dir_fotos / f"{nombre(r)}.parquet").exists()
                  or (dir_fotos / f"{nombre(r)}.parquet").stat().st_mtime < r.stat().st_mtime]
    if pendientes:
        precios = pd.read_parquet(DIR / "precios.parquet", columns=["date", "ticker", "stock_splits"])
        sp = {tk: g.set_index("date")["stock_splits"] for tk, g in precios[precios["stock_splits"] > 0].groupby("ticker")}
        trabajos = [(r, sp.get(nombre(r), pd.Series(dtype=float))) for r in pendientes]
        print(f"fund_sec: recalculando {len(pendientes)} de {len(rutas)} empresas", flush=True)
        with ProcessPoolExecutor(max_workers=max(1, (os.cpu_count() or 2) - 1)) as ex:
            for i, (tk, t, divisa) in enumerate(ex.map(_una, trabajos, chunksize=8)):
                if t is None:
                    t = pd.DataFrame({"ticker": [tk], "divisa_cuentas": [divisa], "vacia": [True]})
                else:
                    t["divisa_cuentas"] = divisa
                t.to_parquet(dir_fotos / f"{tk}.parquet")
                if i % 500 == 0:
                    print("fund_sec", i, len(pendientes), flush=True)
    partes = [pd.read_parquet(dir_fotos / f"{nombre(r)}.parquet") for r in rutas if (dir_fotos / f"{nombre(r)}.parquet").exists()]
    fotos = pd.concat(partes, ignore_index=True)
    divisas = fotos.groupby("ticker")["divisa_cuentas"].first()
    if "vacia" in fotos:
        fotos = fotos[fotos["vacia"].isna()].drop(columns="vacia")
    info = pd.read_csv(DIR.parent / "fichas_empresas.csv").set_index("ticker")
    info = info.reindex(info.index.union(divisas.index))
    info["financialCurrency"] = divisas.reindex(info.index).fillna(info.get("financialCurrency"))
    return fotos.sort_values(["ticker", "disponible"]), info
