"""
Descarga datos gratuitos de Yahoo Finance para el mercado continuo espanol.

Genera en la carpeta datos/:
  precios.csv.gz              precios diarios desde 2006 (OHLC, cierre ajustado, volumen,
                              dividendos y splits) de los valores, indices, ETF y tipo de cambio
  fundamentales.csv.gz        cuentas anuales y trimestrales (formato largo)
  info.csv                    sector, industria, divisa de las cuentas, n. de acciones...
  fechas_resultados.csv       fechas de publicacion de resultados (Yahoo, ~2020 en adelante)
  acciones_historico.csv.gz   numero de acciones en circulacion a lo largo del tiempo
  registro.txt                que se ha descargado y que ha fallado

Uso:  python descargar_datos.py            (todo, ~10-15 min)
      python descargar_datos.py --precios  (solo precios, ~3 min)
      python descargar_datos.py --fundamentales  (solo cuentas, info y fechas)
"""
import sys
import time
from datetime import datetime
from pathlib import Path

import pandas as pd
import yfinance as yf

INICIO = "2006-01-01"
DIR = Path(__file__).resolve().parent / "datos"
DIR.mkdir(exist_ok=True)

# Lista revisada contra Yahoo en octubre de 2026.
IBEX35 = """ACS ACX AENA AMS ANA ANE BBVA BKT CABK CLNX COL ELE ENG FDR FER GRF IAG IBE
IDR ITX LOG MAP MEL MRL MTS NTGY PUIG RED REP ROVI SAB SAN SCYR SLR TEF UNI""".split()

RESTO = """A3M ADX ADZ AEDAS AI ALM ALNT AMP APAM ARM ART ATRY AZK BKY CAF CASH CBAV CCEP
CIE CIRSA CLEO CMO COXG DESA DIA DOM EAT EBRO ECR EDR EIDF ENC ENER ENO EZE FAE FCC GAM
GEST GRE GSJ HBX HOME IBG IMC ISUR IZER LDA LGT LIB MCM MDF MTB MVC NEA NTH NXT NYE OHLA
OLE ORY PHM PRM PRS PSG PVA R4 REN RIO RJF RLIA SOL SQRL TLGO TRE TRG TUB UBS VID VIS VOC""".split()

# Ya no cotizan y Yahoo no tiene su historico (se dejan anotadas para el informe de sesgos):
# ALB (Alba), APPS (Applus), GCO (Catalana Occidente), LRE (Lar Espana), NHH (NH Hotels),
# ZOT (Zardoya), POP (Popular), ABG (Abengoa), SGRE (Siemens Gamesa), BKIA (Bankia), TL5 (Mediaset)...
# Se excluyen GRF-P (clase B de Grifols, duplicaria la empresa) y los valores de BME Growth.

TICKERS = sorted({t + ".MC" for t in IBEX35 + RESTO})
# ^IBEX: indice de precios. BBVAI/LYXIB: ETF del IBEX 35 (su cierre ajustado incluye dividendos).
OTROS = ["^IBEX", "BBVAI.MC", "LYXIB.MC", "EURUSD=X"]

log_lineas = []


def log(msg):
    print(msg, flush=True)
    log_lineas.append(msg)


def reintentar(fn, intentos=3, espera=3):
    for i in range(intentos):
        try:
            return fn()
        except Exception:  # noqa: BLE001
            if i == intentos - 1:
                raise
            time.sleep(espera * (i + 1))


def bajar_precios():
    filas, fallos = [], []
    todos = TICKERS + OTROS
    for n, tk in enumerate(todos, 1):
        try:
            h = reintentar(lambda: yf.Ticker(tk).history(
                start=INICIO, interval="1d", auto_adjust=False, actions=True))
            if h is None or h.empty:
                raise ValueError("sin datos")
            h = h.reset_index()
            h["Date"] = pd.to_datetime(h["Date"]).dt.tz_localize(None).dt.normalize()
            h.insert(0, "ticker", tk)
            filas.append(h)
            log(f"[{n}/{len(todos)}] precios {tk}: {len(h)} sesiones desde {h['Date'].iloc[0]:%Y-%m-%d}")
        except Exception as e:  # noqa: BLE001
            fallos.append(tk)
            log(f"[{n}/{len(todos)}] precios {tk}: FALLO ({e})")
        time.sleep(0.2)
    if filas:
        df = pd.concat(filas, ignore_index=True)
        df.columns = [c.lower().replace(" ", "_") for c in df.columns]
        df = df.drop(columns=[c for c in ["capital_gains"] if c in df.columns])
        df.to_csv(DIR / "precios.csv.gz", index=False)
    return fallos


ESTADOS = {
    "resultados_anual": "income_stmt",
    "balance_anual": "balance_sheet",
    "caja_anual": "cashflow",
    "resultados_trim": "quarterly_income_stmt",
    "balance_trim": "quarterly_balance_sheet",
    "caja_trim": "quarterly_cashflow",
}

CAMPOS_INFO = ["shortName", "longName", "sector", "industry", "currency", "financialCurrency",
               "marketCap", "enterpriseValue", "sharesOutstanding", "floatShares",
               "trailingPE", "priceToBook", "enterpriseToEbitda", "dividendYield",
               "firstTradeDateEpochUtc"]


def bajar_fundamentales():
    fund, infos, fechas, acciones, fallos = [], [], [], [], []
    for n, tk in enumerate(TICKERS, 1):
        t = yf.Ticker(tk)
        ok = 0
        for nombre, attr in ESTADOS.items():
            try:
                df = reintentar(lambda: getattr(t, attr))
                if df is None or df.empty:
                    continue
                # stack en vez de melt: melt falla en pandas 3 con columnas de fechas
                largo = df.stack().rename("valor").reset_index()
                largo.columns = ["concepto", "periodo", "valor"]
                largo = largo.dropna(subset=["valor"])
                largo["periodo"] = pd.to_datetime(largo["periodo"]).dt.date
                largo.insert(0, "estado", nombre)
                largo.insert(0, "ticker", tk)
                fund.append(largo)
                ok += 1
            except Exception as e:  # noqa: BLE001
                log(f"    {tk} {nombre}: fallo ({e})")
        try:
            inf = reintentar(lambda: t.info) or {}
            fila = {"ticker": tk}
            fila.update({c: inf.get(c) for c in CAMPOS_INFO})
            infos.append(fila)
        except Exception as e:  # noqa: BLE001
            log(f"    {tk} info: fallo ({e})")
        try:
            ed = reintentar(lambda: t.get_earnings_dates(limit=40))
            if ed is not None and not ed.empty:
                ed = ed.reset_index()
                ed.columns = ["fecha", "eps_estimado", "eps_real", "sorpresa"][:len(ed.columns)]
                ed["fecha"] = pd.to_datetime(ed["fecha"], utc=True).dt.tz_convert("Europe/Madrid")
                ed["fecha"] = ed["fecha"].dt.tz_localize(None)
                ed.insert(0, "ticker", tk)
                fechas.append(ed)
        except Exception:  # noqa: BLE001
            pass
        try:
            sh = t.get_shares_full(start=INICIO)
            if sh is not None and len(sh):
                sh = sh[~sh.index.duplicated(keep="last")]
                s = pd.DataFrame({"ticker": tk,
                                  "fecha": pd.to_datetime(sh.index).tz_localize(None).normalize(),
                                  "acciones": sh.values})
                acciones.append(s)
        except Exception:  # noqa: BLE001
            pass
        if ok == 0:
            fallos.append(tk)
        log(f"[{n}/{len(TICKERS)}] fundamentales {tk}: {ok}/6 estados")
        time.sleep(0.5)
    if fund:
        pd.concat(fund, ignore_index=True).to_csv(DIR / "fundamentales.csv.gz", index=False)
    if infos:
        pd.DataFrame(infos).to_csv(DIR / "info.csv", index=False)
    if fechas:
        pd.concat(fechas, ignore_index=True).to_csv(DIR / "fechas_resultados.csv", index=False)
    if acciones:
        pd.concat(acciones, ignore_index=True).to_csv(DIR / "acciones_historico.csv.gz", index=False)
    return fallos


def main():
    solo_precios = "--precios" in sys.argv
    solo_fund = "--fundamentales" in sys.argv
    log(f"Inicio {datetime.now():%Y-%m-%d %H:%M}  yfinance {yf.__version__}  {len(TICKERS)} valores")
    f1 = [] if solo_fund else bajar_precios()
    f2 = [] if solo_precios else bajar_fundamentales()
    log("")
    log(f"Sin precios ({len(f1)}): {' '.join(f1) or '-'}")
    log(f"Sin fundamentales ({len(f2)}): {' '.join(f2) or '-'}")
    log(f"Fin {datetime.now():%Y-%m-%d %H:%M}")
    (DIR / "registro.txt").write_text("\n".join(log_lineas), encoding="utf-8")


if __name__ == "__main__":
    main()
