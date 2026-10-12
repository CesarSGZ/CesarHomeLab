"""
Robot para la cuenta PAPER de Interactive Brokers.

Lleva la cuenta paper a la cartera objetivo que calcula cada semana GitHub Actions (backtest-lab.yml):
  - vende lo que ya no está en la cartera objetivo;
  - compra lo nuevo con una parte igual del capital asignado a cada estrategia;
  - no toca lo que sigue (igual que el backtest: sin rebalanceos innecesarios).

Uso (con IB Gateway abierto y conectado a la cuenta PAPER):
  python ibkr_paper.py                       simulación: enseña las órdenes, no envía nada
  python ibkr_paper.py --ejecutar            envía las órdenes a la cuenta paper
  python ibkr_paper.py --pesos fundamental=0.5 precio=0.5
  python ibkr_paper.py --cartera ruta.json   usa un fichero de cartera local en vez de descargarlo

Seguridad: solo se conecta al puerto paper (4002 por defecto) y se para si alguna cuenta no empieza
por "DU" (las cuentas paper de IBKR). Nunca opera en una cuenta real.
"""
import argparse
import json
import math
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

REPO = "CesarSGZ/CesarHomeLab"
DIR = Path(__file__).resolve().parent / "ibkr"
DIR.mkdir(exist_ok=True)
PUERTOS_PAPER = {4002, 7497}

# sufijo de Yahoo -> (bolsa principal en IBKR, divisa)
MERCADOS = {
    "": ("SMART", "USD"), ".TO": ("TSE", "CAD"), ".MX": ("MEXI", "MXN"), ".L": ("LSE", "GBP"),
    ".DE": ("IBIS", "EUR"), ".PA": ("SBF", "EUR"), ".AS": ("AEB", "EUR"), ".BR": ("ENEXT.BE", "EUR"),
    ".SW": ("EBS", "CHF"), ".MI": ("BVME", "EUR"), ".MC": ("BM", "EUR"), ".LS": ("BVL", "EUR"),
    ".ST": ("SFB", "SEK"), ".CO": ("CSE", "DKK"), ".OL": ("OSE", "NOK"), ".HE": ("HEX", "EUR"),
    ".VI": ("VSE", "EUR"), ".IR": ("ISED", "EUR"), ".WA": ("WSE", "PLN"), ".T": ("TSEJ", "JPY"),
    ".HK": ("SEHK", "HKD"), ".SI": ("SGX", "SGD"), ".AX": ("ASX", "AUD"),
}


def log(m):
    print(f"[{datetime.now():%H:%M:%S}] {m}", flush=True)


def contrato(ticker):
    from ib_async import Stock
    sufijo = "." + ticker.rsplit(".", 1)[1] if "." in ticker else ""
    if sufijo not in MERCADOS:
        return None
    bolsa, divisa = MERCADOS[sufijo]
    simbolo = ticker[: -len(sufijo)] if sufijo else ticker
    if sufijo == ".HK":
        simbolo = simbolo.lstrip("0")                      # 0005.HK -> 5
    simbolo = simbolo.replace("-", ".") if sufijo == "" else simbolo.replace("-", " ")
    if sufijo == "":
        return Stock(simbolo, "SMART", "USD")
    return Stock(simbolo, "SMART", divisa, primaryExchange=bolsa)


def descargar_cartera():
    """Cartera objetivo del último cálculo de GitHub que la tenga (necesita `gh` con sesión iniciada)."""
    runs = json.loads(subprocess.run(
        ["gh", "run", "list", "-R", REPO, "--workflow", "backtest-lab.yml", "--status", "success", "--limit", "60",
         "--json", "databaseId,createdAt"], capture_output=True, text=True, check=True).stdout)
    for r in runs:
        destino = Path(tempfile.mkdtemp(prefix="cartera-"))
        res = subprocess.run(["gh", "run", "download", str(r["databaseId"]), "-R", REPO, "-n", "cartera-objetivo",
                              "-D", str(destino)], capture_output=True, text=True)
        f = destino / "cartera_objetivo.json"
        if res.returncode == 0 and f.exists():
            log(f"Cartera objetivo del cálculo {r['databaseId']} ({r['createdAt']})")
            return json.loads(f.read_text(encoding="utf-8"))
    raise SystemExit("No hay ninguna cartera objetivo descargable en GitHub (¿ha corrido ya el cálculo semanal?).")


def precios_eur(tickers):
    """Último cierre (divisa local) y euros por unidad de divisa, con Yahoo (solo para calcular cuántas acciones)."""
    import yfinance as yf
    datos = yf.download(tickers, period="5d", auto_adjust=False, progress=False, group_by="ticker", threads=True)
    precio = {}
    for tk in tickers:
        try:
            s = (datos[tk]["Close"] if len(tickers) > 1 else datos["Close"]).dropna()
            precio[tk] = float(s.iloc[-1])
        except Exception:  # noqa: BLE001
            precio[tk] = math.nan
    divisas = {d for _, d in MERCADOS.values()} - {"EUR"}
    fx = {"EUR": 1.0}
    cambios = yf.download([f"EUR{d}=X" for d in divisas], period="5d", progress=False, group_by="ticker")
    for d in divisas:
        try:
            fx[d] = 1 / float(cambios[f"EUR{d}=X"]["Close"].dropna().iloc[-1])
        except Exception:  # noqa: BLE001
            fx[d] = math.nan
    return precio, fx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ejecutar", action="store_true", help="enviar las órdenes (si no, solo simulación)")
    ap.add_argument("--puerto", type=int, default=4002)
    ap.add_argument("--cartera", help="fichero cartera_objetivo.json local")
    ap.add_argument("--pesos", nargs="*", default=["fundamental=0.5", "precio=0.5"])
    ap.add_argument("--max-dias", type=int, default=9, help="no operar con una cartera más antigua que esto")
    args = ap.parse_args()
    if args.puerto not in PUERTOS_PAPER:
        raise SystemExit(f"Puerto {args.puerto} no es de paper trading ({sorted(PUERTOS_PAPER)}). Me paro.")
    pesos = {k: float(v) for k, v in (p.split("=") for p in args.pesos)}

    cartera = json.loads(Path(args.cartera).read_text(encoding="utf-8")) if args.cartera else descargar_cartera()
    edad = (datetime.now(timezone.utc) - datetime.fromisoformat(cartera["generatedAt"])).days
    if edad > args.max_dias:
        raise SystemExit(f"La cartera objetivo tiene {edad} días. No opero con datos viejos.")

    from ib_async import IB, MarketOrder
    ib = IB()
    ib.connect("127.0.0.1", args.puerto, clientId=17, readonly=not args.ejecutar, timeout=20)
    cuentas = ib.managedAccounts()
    if not cuentas or not all(c.startswith("DU") for c in cuentas):
        ib.disconnect()
        raise SystemExit(f"Cuentas {cuentas}: no parecen PAPER (deben empezar por DU). Me paro.")
    cuenta = cuentas[0]
    resumen = {v.tag: v for v in ib.accountSummary(cuenta)}
    liquidez = float(resumen["NetLiquidation"].value)
    base = resumen["NetLiquidation"].currency
    log(f"Cuenta paper {cuenta}: valor {liquidez:,.0f} {base}")

    # objetivo: por estrategia, capital * peso / nº de posiciones, en EUR
    objetivo = {}
    for e in cartera["estrategias"]:
        w = pesos.get(e["id"], 0.0)
        if w <= 0:
            continue
        rebanada = liquidez * w / e["posiciones"]
        for v in e["valores"]:
            o = objetivo.setdefault(v["ticker"], {"eur": 0.0, "estrategias": []})
            o["eur"] += rebanada
            o["estrategias"].append(e["id"])
    if base != "EUR":
        log(f"Aviso: la divisa base de la cuenta es {base}; los importes se tratan como si fueran EUR.")

    posiciones = {}
    for p in ib.positions(cuenta):
        posiciones[p.contract.conId] = p
    contratos = {}
    for tk in objetivo:
        c = contrato(tk)
        q = ib.qualifyContracts(c) if c is not None else []
        if q:
            contratos[tk] = q[0]
        else:
            log(f"  {tk}: no encuentro el valor en IBKR, se omite")
    precio, fx = precios_eur(list(contratos))

    ordenes = []
    objetivo_ids = {c.conId for c in contratos.values()}
    for p in posiciones.values():                                   # 1) ventas
        if p.contract.conId not in objetivo_ids and p.position != 0:
            ordenes.append(("VENDER", p.contract, abs(p.position), "ya no está en la cartera objetivo"))
    for tk, c in contratos.items():                                 # 2) compras de lo nuevo
        if c.conId in posiciones and posiciones[c.conId].position > 0:
            continue                                                # ya la tenemos: no se toca
        px, eur_por_unidad = precio.get(tk), fx.get(c.currency)
        if not (px and eur_por_unidad and math.isfinite(px) and math.isfinite(eur_por_unidad)):
            log(f"  {tk}: sin precio, se omite")
            continue
        if tk.endswith(".L"):
            px = px / 100                                           # Yahoo da Londres en peniques
        lote = 100 if c.exchange == "TSEJ" or getattr(c, "primaryExchange", "") == "TSEJ" else 1
        detalles = ib.reqContractDetails(c)
        if detalles and getattr(detalles[0], "sizeIncrement", None):
            lote = max(lote, int(float(detalles[0].sizeIncrement) or 1))
        acciones = int(objetivo[tk]["eur"] / (px * eur_por_unidad) // lote * lote)
        if acciones <= 0:
            log(f"  {tk}: el importe no llega a un lote de {lote}, se omite")
            continue
        ordenes.append(("COMPRAR", c, acciones, f"nueva en {', '.join(objetivo[tk]['estrategias'])} "
                                               f"(~{objetivo[tk]['eur']:,.0f} EUR a {px:,.2f} {c.currency})"))

    log(f"{len(ordenes)} órdenes ({'SE ENVÍAN' if args.ejecutar else 'SIMULACIÓN, no se envía nada'}):")
    filas = []
    for accion, c, n, porque in ordenes:
        log(f"  {accion:8s} {n:>8,} {c.symbol:<8s} {c.currency}  · {porque}")
        fila = {"fecha": datetime.now().isoformat(timespec="seconds"), "cuenta": cuenta, "accion": accion,
                "simbolo": c.symbol, "bolsa": getattr(c, "primaryExchange", c.exchange), "divisa": c.currency,
                "acciones": n, "motivo": porque, "enviada": args.ejecutar, "estado": ""}
        if args.ejecutar:
            t = ib.placeOrder(c, MarketOrder("SELL" if accion == "VENDER" else "BUY", n, tif="DAY"))
            ib.sleep(1)
            fila["estado"] = t.orderStatus.status
        filas.append(fila)
    if filas:
        reg = DIR / "registro_ordenes.csv"
        pd.DataFrame(filas).to_csv(reg, mode="a", header=not reg.exists(), index=False)
        log(f"Registro: {reg}")
    ib.disconnect()


if __name__ == "__main__":
    sys.exit(main())
