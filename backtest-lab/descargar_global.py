"""
Descarga masiva de Yahoo Finance para el universo global (datos_global/universo.csv).

  python descargar_global.py precios        precios diarios desde 2006 por lotes (reanudable)
  python descargar_global.py actualizar     solo el último mes de precios (rápido, para cada semana)
  python descargar_global.py fundamentales  cuentas, sector, beta, insiders... (reanudable, lento)
  python descargar_global.py mercado        tipos de cambio y benchmarks (S&P 500 con dividendos)

Todo queda en datos_global/. Los lotes ya descargados no se repiten.
"""
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import pandas as pd
import yfinance as yf

DIR = Path(__file__).resolve().parent / "datos_global"
PARTES = DIR / "precios_lotes"
FUND = DIR / "fundamentales"
INICIO = "2006-01-01"
LOTE = 150
CAMPOS = ["Open", "Close", "Adj Close", "Volume", "Dividends", "Stock Splits"]
DIVISAS = ["USD", "GBP", "CHF", "SEK", "DKK", "NOK", "PLN", "JPY", "HKD", "SGD", "AUD", "CAD", "MXN"]
BENCHMARKS = ["^SP500TR", "^GSPC", "^IBEX", "URTH"]


def universo():
    return pd.read_csv(DIR / "universo.csv")


def _a_largo(df, tickers):
    """yf.download con varios tickers -> formato largo (ticker, date, campos)."""
    if df is None or df.empty:
        return pd.DataFrame()
    if not isinstance(df.columns, pd.MultiIndex):
        df.columns = pd.MultiIndex.from_product([tickers[:1], df.columns])
    nivel_ticker = 0 if set(tickers) & set(df.columns.get_level_values(0)) else 1
    largo = df.stack(level=nivel_ticker, future_stack=True).reset_index()
    largo = largo.rename(columns={largo.columns[0]: "date", largo.columns[1]: "ticker"})
    largo.columns = [str(c).lower().replace(" ", "_") for c in largo.columns]
    largo = largo.dropna(subset=["close"])
    largo["date"] = pd.to_datetime(largo["date"]).dt.tz_localize(None).dt.normalize()
    for c in ["open", "high", "low", "close", "adj_close", "dividends", "stock_splits"]:
        if c in largo:
            largo[c] = largo[c].astype("float32")
    largo["volume"] = largo["volume"].astype("float64")
    return largo


def bajar_lote(tickers, inicio=INICIO, periodo=None):
    for intento in range(4):
        try:
            kw = dict(period=periodo) if periodo else dict(start=inicio)
            df = yf.download(tickers, interval="1d", auto_adjust=False, actions=True, group_by="ticker",
                             threads=8, progress=False, **kw)
            return _a_largo(df, tickers)
        except Exception as e:  # noqa: BLE001
            print("   reintento", intento + 1, str(e)[:100], flush=True)
            time.sleep(10 * (intento + 1))
    return pd.DataFrame()


def precios():
    PARTES.mkdir(parents=True, exist_ok=True)
    tks = universo()["ticker"].tolist()
    lotes = [tks[i:i + LOTE] for i in range(0, len(tks), LOTE)]
    for n, lote in enumerate(lotes):
        ruta = PARTES / f"lote_{n:03d}.parquet"
        if ruta.exists():
            continue
        t0 = time.time()
        df = bajar_lote(lote)
        if df.empty:
            print(f"[{n + 1}/{len(lotes)}] lote vacío, se reintentará en otra ejecución", flush=True)
            continue
        df.to_parquet(ruta, index=False)
        print(f"[{n + 1}/{len(lotes)}] {df['ticker'].nunique()}/{len(lote)} valores, {len(df):,} filas, "
              f"{time.time() - t0:.0f}s", flush=True)
        time.sleep(2)
    unir()


def unir():
    partes = sorted(PARTES.glob("lote_*.parquet")) + sorted(PARTES.glob("act_*.parquet"))
    df = pd.concat([pd.read_parquet(p) for p in partes], ignore_index=True)
    df = df.sort_values(["ticker", "date"]).drop_duplicates(["ticker", "date"], keep="last")
    df.to_parquet(DIR / "precios.parquet", index=False)
    print(f"precios.parquet: {df['ticker'].nunique()} valores, {len(df):,} filas, "
          f"{df['date'].min():%Y-%m-%d} a {df['date'].max():%Y-%m-%d}")


def actualizar():
    """Último mes para todo el universo (los splits recientes obligan a revisar todo el histórico:
    si Yahoo marca un split en el último mes, se vuelve a bajar ese valor entero)."""
    PARTES.mkdir(parents=True, exist_ok=True)
    tks = universo()["ticker"].tolist()
    nuevos = []
    for i in range(0, len(tks), LOTE):
        df = bajar_lote(tks[i:i + LOTE], periodo="1mo")
        if not df.empty:
            nuevos.append(df)
    df = pd.concat(nuevos, ignore_index=True)
    con_split = df.loc[df["stock_splits"].fillna(0) > 0, "ticker"].unique().tolist()
    if con_split:
        print("Splits recientes, se rehace el histórico de:", con_split)
        df = pd.concat([df[~df["ticker"].isin(con_split)], bajar_lote(con_split)], ignore_index=True)
    df.to_parquet(PARTES / f"act_{time.strftime('%Y%m%d')}.parquet", index=False)
    unir()


def mercado():
    tks = [f"EUR{d}=X" for d in DIVISAS] + BENCHMARKS
    df = bajar_lote(tks)
    df.to_parquet(DIR / "mercado.parquet", index=False)
    print(df.groupby("ticker")["date"].agg(["min", "max", "count"]).to_string())


# ------------------------------------------------------------------ fundamentales (por valor, reanudable)
CAMPOS_INFO = ["shortName", "longName", "sector", "industry", "country", "currency", "financialCurrency",
               "marketCap", "sharesOutstanding", "beta", "heldPercentInsiders", "heldPercentInstitutions",
               "trailingPE", "priceToBook", "enterpriseToEbitda", "returnOnEquity", "profitMargins"]
ESTADOS = {"resultados_anual": "income_stmt", "balance_anual": "balance_sheet",
           "resultados_trim": "quarterly_income_stmt", "balance_trim": "quarterly_balance_sheet"}


def fundamentales_valor(tk, forzar=False):
    ruta = FUND / f"{tk.replace('^', '_')}.json"
    if ruta.exists() and not forzar:
        return tk, "ya"
    t = yf.Ticker(tk)
    salida = {"ticker": tk, "info": {}, "estados": {}}
    for intento in range(3):
        try:
            inf = t.info or {}
            salida["info"] = {c: inf.get(c) for c in CAMPOS_INFO}
            for nombre, attr in ESTADOS.items():
                df = getattr(t, attr)
                if df is not None and not df.empty:
                    df = df.copy()
                    df.columns = [pd.Timestamp(c).strftime("%Y-%m-%d") for c in df.columns]
                    salida["estados"][nombre] = {k: {c: (None if pd.isna(v) else float(v)) for c, v in row.items()}
                                                 for k, row in df.iterrows()}
            break
        except Exception as e:  # noqa: BLE001
            if "Too Many Requests" in str(e) or "Rate" in str(e):
                time.sleep(60 * (intento + 1))
            else:
                time.sleep(5)
    else:
        return tk, "fallo"
    ruta.write_text(json.dumps(salida), encoding="utf-8")
    return tk, "ok"


def fundamentales(hilos=4, max_minutos=None, refrescar_dias=None):
    """Descarga las que faltan; con refrescar_dias, también rehace las más antiguas (primero las más viejas).
    Con max_minutos se para a tiempo (la siguiente ejecución sigue donde lo dejó)."""
    FUND.mkdir(parents=True, exist_ok=True)
    tks = universo()["ticker"].tolist()
    pendientes = [(t, False) for t in tks if not (FUND / f"{t}.json").exists()]
    if refrescar_dias:
        limite = time.time() - refrescar_dias * 86400
        viejas = sorted(((FUND / f"{t}.json").stat().st_mtime, t) for t in tks if (FUND / f"{t}.json").exists())
        pendientes += [(t, True) for m, t in viejas if m < limite]
    print(f"Fundamentales: {len(pendientes)} por descargar o renovar", flush=True)
    hechos, fallos, t0 = 0, 0, time.time()
    fin = t0 + max_minutos * 60 if max_minutos else None
    with ThreadPoolExecutor(max_workers=hilos) as ex:
        futuros = []
        for t, forzar in pendientes:
            futuros.append(ex.submit(lambda t=t, f=forzar: (fundamentales_valor(t, f) if not fin or time.time() < fin else (t, "sin tiempo"))))
        for f in as_completed(futuros):
            tk, estado = f.result()
            hechos += 1
            fallos += estado == "fallo"
            if hechos % 100 == 0:
                ritmo = hechos / (time.time() - t0)
                print(f"  {hechos}/{len(pendientes)} ({fallos} fallos) · {ritmo:.1f}/s · "
                      f"quedan ~{(len(pendientes) - hechos) / max(ritmo, 1e-6) / 60:.0f} min", flush=True)
    print(f"Fundamentales terminados: {hechos - fallos} ok, {fallos} fallos")


def reparar_info(pausa=1.5):
    """Segunda pasada, despacio, para los valores cuya ficha (sector, divisa, insiders...) llegó vacía
    porque Yahoo limitó las peticiones."""
    rutas = [r for r in FUND.glob("*.json")]
    pendientes = []
    for r in rutas:
        j = json.loads(r.read_text(encoding="utf-8"))
        if not (j.get("info") or {}).get("sector") and not (j.get("info") or {}).get("marketCap"):
            pendientes.append((r, j))
    print(f"Fichas vacías: {len(pendientes)}", flush=True)
    ok = 0
    for i, (r, j) in enumerate(pendientes, 1):
        for intento in range(3):
            try:
                inf = yf.Ticker(j["ticker"]).info or {}
                if inf.get("marketCap") or inf.get("sector"):
                    j["info"] = {c: inf.get(c) for c in CAMPOS_INFO}
                    r.write_text(json.dumps(j), encoding="utf-8")
                    ok += 1
                break
            except Exception as e:  # noqa: BLE001
                time.sleep(30 * (intento + 1) if "Too Many" in str(e) else 3)
        time.sleep(pausa)
        if i % 100 == 0:
            print(f"  {i}/{len(pendientes)} ({ok} reparadas)", flush=True)
    print(f"Fichas reparadas: {ok}/{len(pendientes)}")


if __name__ == "__main__":
    accion = sys.argv[1] if len(sys.argv) > 1 else "precios"
    if accion == "semanal":
        # lo que hace GitHub Actions cada semana: precios del último mes y fundamentales por tandas
        mercado()
        actualizar() if (DIR / "precios.parquet").exists() else precios()
        fundamentales(hilos=3, max_minutos=float(sys.argv[2]) if len(sys.argv) > 2 else 120, refrescar_dias=45)
        sys.exit(0)
    {"precios": precios, "actualizar": actualizar, "fundamentales": fundamentales, "mercado": mercado,
     "reparar_info": reparar_info,
     "unir": unir}[accion]()
