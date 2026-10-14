"""
Robot para la cuenta PAPER de Interactive Brokers.

Lleva la cuenta paper a la cartera objetivo que calcula cada semana GitHub Actions (backtest-lab.yml):
  - vende lo que ya no está en la cartera objetivo;
  - compra lo nuevo con una parte igual del dinero de cada estrategia (patrimonio de la estrategia / n);
  - no vende nada más (sin rebalanceos: cada venta con ganancia paga impuestos).
El dinero se gestiona con el plan de plan_dinero.json (bt/plan.py, el mismo código que el backtest): reserva de
liquidez, ahorro mensual a la estrategia más por debajo de su peso y uso de la reserva cuando el S&P 500 cae.
En la cuenta paper el ahorro mensual se simula con una bolsa "por aportar" que se aparta al arrancar el plan.

Uso (con IB Gateway abierto y conectado a la cuenta PAPER):
  python ibkr_paper.py                       simulación: enseña las órdenes, no envía nada
  python ibkr_paper.py --ejecutar            envía las órdenes a la cuenta paper
  python ibkr_paper.py --aporte 1000         registra un ingreso real hecho este mes (cuenta sin bolsa simulada)
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

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bt import plan as PL  # noqa: E402

REPO = "CesarSGZ/CesarHomeLab"
DIR = Path(__file__).resolve().parent / "ibkr"
DIR.mkdir(exist_ok=True)
PUERTOS_PAPER = {4002, 7497}
DIRECTAS = {"WSE"}

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
    if bolsa in DIRECTAS:
        return Stock(simbolo, bolsa, divisa)            # bolsas sin enrutado SMART en IBKR
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


import os
LIBRO = Path(os.environ["IBKR_LIBRO"]) if os.environ.get("IBKR_LIBRO") else DIR / "libro.json"
CAPITAL_INICIAL = 1_000_000.0


def leer_libro():
    """Libreta local: capital inicial, peso y nombre de cada estrategia, a qué estrategia pertenece cada
    acción (se anota al comprarla) y lo ganado/perdido en ventas cerradas (por ejecución, sin duplicar)."""
    libro = {"capitalInicial": CAPITAL_INICIAL, "pesos": {"fundamental": 0.5, "precio": 0.5},
             "nombres": {"fundamental": "Valor + momentum", "precio": "Momentum en EE. UU."},
             "asignacion": {}, "realizado": {}, "entradas": {}, "cerradas": [], "semaforo": {}}
    if LIBRO.exists():
        libro.update(json.loads(LIBRO.read_text(encoding="utf-8")))
    return libro


def guardar_libro(libro):
    LIBRO.write_text(json.dumps(libro, ensure_ascii=False, indent=1), encoding="utf-8")


def caida_sp_hoy():
    """Caída del S&P 500 (rentabilidad total en EUR) desde su máximo de 1 año, como en el backtest del plan."""
    import yfinance as yf
    x = yf.download(["^SP500TR", "EURUSD=X"], period="2y", progress=False)["Close"].ffill().dropna()
    return float(PL.caida_sp(x["^SP500TR"] / x["EURUSD=X"]).iloc[-1])


def cuadrar_plan(estado, efectivo, valores, aporte_real=0.0):
    """La liquidez de la cuenta = reserva + bolsa por aportar + caja de cada estrategia. Lo que no cuadra desde la
    última vez (dividendos, cambio de divisa, precio real de las órdenes, intereses) se reparte entre las estrategias
    según su tamaño. Un ingreso real del mes (aporte_real) no se reparte aquí: lo reparte el plan."""
    cajas = estado["cajas"]
    dif = efectivo - aporte_real - (estado["reserva"] + estado["porAportar"] + sum(cajas.values()))
    total = sum(max(0.0, valores.get(k, 0.0)) for k in cajas)
    for k in cajas:
        cajas[k] += dif * max(0.0, valores.get(k, 0.0)) / total if total > 0 else dif / len(cajas)
    return dif


def arrancar_plan(plan, papel, efectivo, valores, patrimonio):
    """Primera vez: se aparta la bolsa por aportar (solo paper) y la reserva; el resto de la liquidez va a las
    estrategias más por debajo de su peso. Nada se vende para ello."""
    libre = max(0.0, efectivo)
    bolsa = min(float(papel.get("bolsa", 0.0)), libre)
    reserva = max(0.0, min(plan.reserva * (patrimonio - bolsa), libre - bolsa))
    cajas = PL.repartir(libre - bolsa - reserva, valores, plan.pesos)
    cajas = {k: cajas.get(k, 0.0) + min(0.0, efectivo) * plan.pesos[k] for k in plan.pesos}
    aportado = {k: valores.get(k, 0.0) + cajas[k] for k in plan.pesos}
    return {"inicio": datetime.now().date().isoformat(), "reserva": reserva, "porAportar": bolsa,
            "aporteSimulado": float(papel.get("aporteMensual", 0.0)), "cajas": cajas, "aportado": aportado,
            "unidades": dict(aportado), "ultimoMes": datetime.now().strftime("%Y-%m"), "usados": [], "aportes": []}


def semana_plan(plan, estado, valores, caida, aporte_real=0.0):
    """Aplica el plan de la semana (ahorro del mes y disparos por caída). Devuelve (dinero nuevo por estrategia, ahorro)."""
    mes = datetime.now().strftime("%Y-%m")
    aporte = 0.0
    if mes != estado["ultimoMes"]:
        simulado = min(estado.get("aporteSimulado", 0.0), estado["porAportar"])
        estado["porAportar"] -= simulado
        aporte = simulado
        estado["ultimoMes"] = mes
    aporte += aporte_real
    totales = {k: valores.get(k, 0.0) + estado["cajas"][k] for k in plan.pesos}
    nuevo, estado["reserva"], estado["usados"] = PL.paso(plan, totales, estado["reserva"], caida, estado["usados"], aporte)
    for k, x in nuevo.items():
        if x > 0:
            u = estado["unidades"].get(k) or 0.0
            precio_u = totales[k] / u if u > 0 and totales[k] > 0 else 1.0
            estado["unidades"][k] = u + x / precio_u
            estado["aportado"][k] = estado["aportado"].get(k, 0.0) + x
            estado["cajas"][k] += x
    if aporte or any(nuevo.values()):
        estado["aportes"] = (estado.get("aportes", []) + [{"fecha": datetime.now().date().isoformat(), "aporte": round(aporte, 2),
                             "caidaSP": round(caida, 4), **{k: round(v, 2) for k, v in nuevo.items()}}])[-120:]
    return nuevo, aporte


def compras_estrategia(n, mantenidas, nuevas, caja, minimo=500.0):
    """Importes de compra de una estrategia: cada acción nueva recibe (patrimonio de la estrategia / n) mientras haya
    caja; la caja que sobra, salvo la de los huecos vacíos, completa las que estén por debajo de su parte."""
    patrimonio = sum(mantenidas.values()) + caja
    parte = patrimonio / n if n else 0.0
    compras = {}
    for tk in nuevas:
        x = min(parte, max(0.0, caja))
        if x >= minimo:
            compras[tk] = x
            caja -= x
    huecos = max(0, n - len(mantenidas) - len(compras))
    sobra = caja - huecos * parte
    for tk, v in sorted(mantenidas.items(), key=lambda kv: kv[1]):
        falta = parte - v
        if sobra < minimo:
            break
        if falta >= max(minimo, 0.1 * parte):
            x = min(falta, sobra)
            compras[tk] = x
            sobra -= x
    return compras


def semaforo_corto(s):
    """Lo que se enseña en la web del semáforo de una compra: alertas y datos que faltaron."""
    return {"alertas": s.get("alertas", []), "sinDato": s.get("sinDato", []), "fecha": s.get("fecha"),
            **({"aprox": True} if s.get("aprox") else {})} if s else None


def semaforos_de_cartera(cartera):
    """ticker -> semáforo calculado al publicar la cartera (la primera estrategia que la tenga)."""
    out = {}
    for e in cartera.get("estrategias", []):
        for v in e["valores"]:
            if v.get("semaforo") and v["ticker"] not in out:
                out[v["ticker"]] = v["semaforo"]
    return out


def asignar_desde_cartera(libro, cartera):
    """Para acciones ya en cuenta sin estrategia anotada: la deduce de la cartera objetivo."""
    for e in cartera.get("estrategias", []):
        libro["nombres"][e["id"]] = e.get("nombre", e["id"])
        for v in e["valores"]:
            c = contrato(v["ticker"])
            if c is not None:
                libro["asignacion"].setdefault(c.symbol, e["id"])


def foto(puerto, enviar=True, salida=None):
    """Foto de la cuenta paper para la web: valor, posiciones, operaciones recientes y S&P 500 del día.
    Se manda a GitHub (workflow ibkr-paper-foto.yml), que la guarda en la base de datos de la web."""
    import yfinance as yf
    from ib_async import IB, ExecutionFilter
    ib = IB()
    ib.connect("127.0.0.1", puerto, clientId=21, readonly=True, timeout=20)
    cuentas = ib.managedAccounts()
    if not cuentas or not all(c.startswith("DU") for c in cuentas):
        ib.disconnect()
        raise SystemExit(f"Cuentas {cuentas}: no parecen PAPER. Me paro.")
    cuenta = cuentas[0]
    res = {v.tag: v for v in ib.accountSummary(cuenta)}
    num = lambda tag: round(float(res[tag].value), 2) if tag in res and res[tag].value not in ("", None) else None
    posiciones = []
    for it in ib.portfolio(cuenta):
        c = it.contract
        coste = it.averageCost * it.position
        posiciones.append({"simbolo": c.symbol, "divisa": c.currency, "bolsa": c.primaryExchange or c.exchange,
                           "acciones": round(it.position, 4), "precioMedio": round(it.averageCost, 4),
                           "precio": round(it.marketPrice, 4), "valor": round(it.marketValue, 2),
                           "ganancia": round(it.unrealizedPNL, 2),
                           "gananciaPct": round(it.unrealizedPNL / coste, 4) if coste else None})
    # IBKR trocea cada orden en muchas ejecuciones: se agrupan por valor, sentido y día (precio medio ponderado)
    grupos = {}
    for f in ib.reqExecutions(ExecutionFilter()):
        e = f.execution
        clave = (e.time.date().isoformat(), f.contract.symbol, e.side)
        g = grupos.setdefault(clave, {"fecha": e.time.date().isoformat(), "simbolo": f.contract.symbol,
                                      "lado": "compra" if e.side == "BOT" else "venta", "acciones": 0.0,
                                      "importe": 0.0, "divisa": f.contract.currency})
        g["acciones"] += e.shares
        g["importe"] += e.shares * e.price
    ejecuciones = [{**{k: v for k, v in g.items() if k != "importe"}, "acciones": round(g["acciones"], 4),
                    "precio": round(g["importe"] / g["acciones"], 4)} for g in grupos.values() if g["acciones"]]
    libro = leer_libro()
    if any(p["simbolo"] not in libro["asignacion"] for p in posiciones):
        local = Path(__file__).resolve().parent / "resultados" / "cartera_objetivo.json"
        try:
            asignar_desde_cartera(libro, json.loads(local.read_text(encoding="utf-8")) if local.exists() else descargar_cartera())
        except Exception as e:  # noqa: BLE001
            log(f"Aviso: no pude deducir la estrategia de algunas posiciones ({e})")
    primeras = {}
    for f in ib.fills():
        if f.execution.side == "BOT":
            d = f.execution.time.date().isoformat()
            primeras[f.contract.symbol] = min(primeras.get(f.contract.symbol, d), d)
    realizadas_nuevas = []
    for f in ib.fills():
        cr = f.commissionReport
        pnl = getattr(cr, "realizedPNL", 0.0) if cr else 0.0
        if pnl and abs(pnl) < 1e100 and f.execution.execId not in libro["realizado"]:
            realizadas_nuevas.append((f.execution.execId, f.contract.symbol, f.contract.currency, pnl))
    pendientes = len(ib.openTrades())
    ib.disconnect()
    divisas = sorted({p["divisa"] for p in posiciones} | {r[2] for r in realizadas_nuevas} | {"USD"})
    cambios = yf.download(["^SP500TR"] + [f"EUR{d}=X" for d in divisas if d != "EUR"], period="10d", progress=False)["Close"].ffill()
    eur = {"EUR": 1.0, **{d: 1 / float(cambios[f"EUR{d}=X"].dropna().iloc[-1]) for d in divisas if d != "EUR"}}
    sp_eur = float(cambios["^SP500TR"].dropna().iloc[-1] * eur["USD"])
    for execid, sim, div, pnl in realizadas_nuevas:
        libro["realizado"][execid] = {"simbolo": sim, "eur": round(pnl * eur.get(div, float("nan")), 2),
                                      "fecha": datetime.now().date().isoformat()}
    estrategias = {}
    for k, w in libro["pesos"].items():
        estrategias[k] = {"nombre": libro["nombres"].get(k, k), "asignado": round(libro["capitalInicial"] * w, 2),
                          "invertido": 0.0, "noRealizada": 0.0, "realizada": 0.0, "posiciones": 0}
    # tiempo en cartera: entrada de cada posición y cierre de las que ya no están
    hoy = datetime.now().date()
    abiertas = {p["simbolo"] for p in posiciones}
    for sim in abiertas:
        libro["entradas"].setdefault(sim, primeras.get(sim, hoy.isoformat()))
    for sim in [s_ for s_ in libro["entradas"] if s_ not in abiertas]:
        desde = libro["entradas"].pop(sim)
        ganancia = sum(r["eur"] for r in libro["realizado"].values()
                       if r["simbolo"] == sim and r.get("fecha", hoy.isoformat()) >= desde and r["eur"] == r["eur"])
        sem = libro.setdefault("semaforo", {}).pop(sim, None)
        libro["cerradas"].append({"simbolo": sim, "estrategia": libro["asignacion"].get(sim), "desde": desde,
                                  "hasta": hoy.isoformat(), "dias": (hoy - datetime.fromisoformat(desde).date()).days,
                                  "gananciaEur": round(ganancia, 2),
                                  **({"semaforo": semaforo_corto(sem)} if sem else {})})
    for p in posiciones:
        p["desde"] = libro["entradas"].get(p["simbolo"])
        p["dias"] = (hoy - datetime.fromisoformat(p["desde"]).date()).days if p["desde"] else None
        f_eur = eur.get(p["divisa"], float("nan"))
        p["valorEur"] = round(p["valor"] * f_eur, 2)
        p["gananciaEur"] = round(p["ganancia"] * f_eur, 2)
        p["estrategia"] = libro["asignacion"].get(p["simbolo"])
        if libro.get("semaforo", {}).get(p["simbolo"]):
            p["semaforo"] = semaforo_corto(libro["semaforo"][p["simbolo"]])
        if p["estrategia"] in estrategias:
            e = estrategias[p["estrategia"]]
            e["invertido"] += p["valorEur"]
            e["noRealizada"] += p["gananciaEur"]
            e["posiciones"] += 1
    for r in libro["realizado"].values():
        k = libro["asignacion"].get(r["simbolo"])
        if k in estrategias and r["eur"] == r["eur"]:
            estrategias[k]["realizada"] += r["eur"]
    plan = libro.get("plan")
    for k, e in estrategias.items():
        if plan and k in plan["cajas"]:
            # con el plan del dinero: lo que vale = acciones + su caja; lo puesto = capital inicial + ahorro recibido
            e["asignado"] = round(plan["aportado"].get(k, 0.0), 2)
            e["caja"] = round(plan["cajas"][k], 2)
            e["valor"] = round(e["invertido"] + plan["cajas"][k], 2)
            u = plan["unidades"].get(k)
            e["indice"] = round(e["valor"] / u, 6) if u else None
        else:
            e["valor"] = round(e["asignado"] + e["noRealizada"] + e["realizada"], 2)
        for c in ("invertido", "noRealizada", "realizada"):
            e[c] = round(e[c], 2)
    resumen_plan = None
    if plan:
        try:
            caida = round(caida_sp_hoy(), 4)
        except Exception:  # noqa: BLE001
            caida = None
        resumen_plan = {"inicio": plan["inicio"], "reserva": round(plan["reserva"], 2), "porAportar": round(plan["porAportar"], 2),
                        "aporteMensual": plan.get("aporteSimulado", 0.0), "caidaSP": caida, "disparosUsados": len(plan["usados"]),
                        "reglas": PL.Plan.leer().como_dict(), "aportes": plan.get("aportes", [])[-24:]}
    for x in ejecuciones:
        x["estrategia"] = libro["asignacion"].get(x["simbolo"])
    guardar_libro(libro)
    datos = {"fecha": datetime.now(timezone.utc).isoformat(timespec="seconds"), "cuenta": cuenta,
             "divisa": res["NetLiquidation"].currency, "valor": num("NetLiquidation"), "efectivo": num("TotalCashValue"),
             "gananciaNoRealizada": num("UnrealizedPnL"), "gananciaRealizada": num("RealizedPnL"),
             "sp500eur": round(sp_eur, 4), "ordenesPendientes": pendientes,
             "capitalInicial": libro["capitalInicial"], "estrategias": estrategias, "plan": resumen_plan,
             "cerradas": libro["cerradas"][-300:],
             "posiciones": sorted(posiciones, key=lambda x: -(x["valor"] or 0)),
             "ejecuciones": sorted(ejecuciones, key=lambda x: x["fecha"], reverse=True)[:60]}
    texto = json.dumps(datos, ensure_ascii=False, separators=(",", ":"))
    (DIR / "fotos").mkdir(exist_ok=True)
    (DIR / "fotos" / f"{datetime.now():%Y-%m-%d_%H%M}.json").write_text(texto, encoding="utf-8")
    log(f"Foto: valor {datos['valor']:,.0f} {datos['divisa']}, {len(posiciones)} posiciones, "
        f"{len(ejecuciones)} ejecuciones recientes, {pendientes} órdenes pendientes ({len(texto)} bytes)")
    if salida:
        Path(salida).write_text(texto, encoding="utf-8")
        log(f"Foto guardada en {salida}")
    elif enviar:
        subprocess.run(["gh", "workflow", "run", "ibkr-paper-foto.yml", "-R", REPO, "--ref", "main", "-f", f"foto={texto}"],
                       check=True)
        log("Foto enviada a GitHub; en 1-2 minutos aparece en la web.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ejecutar", action="store_true", help="enviar las órdenes (si no, solo simulación)")
    ap.add_argument("--puerto", type=int, default=4002)
    ap.add_argument("--cartera", help="fichero cartera_objetivo.json local")
    ap.add_argument("--aporte", type=float, default=0.0, help="ingreso real hecho este mes (EUR)")
    ap.add_argument("--max-dias", type=int, default=9, help="no operar con una cartera más antigua que esto")
    ap.add_argument("--foto", action="store_true", help="solo sacar la foto de la cuenta y mandarla a la web")
    ap.add_argument("--sin-enviar", action="store_true", help="con --foto: guardarla en local sin mandarla")
    ap.add_argument("--salida-foto", help="con --foto: escribirla en este fichero (lo usa GitHub Actions)")
    args = ap.parse_args()
    if args.foto:
        if args.puerto not in PUERTOS_PAPER:
            raise SystemExit("Puerto no paper. Me paro.")
        return foto(args.puerto, enviar=not args.sin_enviar, salida=args.salida_foto)
    if args.puerto not in PUERTOS_PAPER:
        raise SystemExit(f"Puerto {args.puerto} no es de paper trading ({sorted(PUERTOS_PAPER)}). Me paro.")
    plan = PL.Plan.leer()
    papel = json.loads(PL.RUTA.read_text(encoding="utf-8")).get("papel", {})
    pesos = plan.pesos

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
    efectivo = float(resumen["TotalCashValue"].value)
    base = resumen["NetLiquidation"].currency
    log(f"Cuenta paper {cuenta}: valor {liquidez:,.0f} {base}, liquidez {efectivo:,.0f}")
    if base != "EUR":
        log(f"Aviso: la divisa base de la cuenta es {base}; los importes se tratan como si fueran EUR.")
    libro = leer_libro()
    semaforos = semaforos_de_cartera(cartera)
    asignar_desde_cartera(libro, cartera)       # las que ya teníamos sin anotar

    estrategias = {e["id"]: e for e in cartera["estrategias"] if pesos.get(e["id"], 0) > 0}
    contratos = {}
    for e in estrategias.values():
        for v in e["valores"]:
            tk = v["ticker"]
            if tk in contratos:
                continue
            c = contrato(tk)
            q = ib.qualifyContracts(c) if c is not None else []
            if q:
                contratos[tk] = q[0]
            else:
                log(f"  {tk}: no encuentro el valor en IBKR, se omite")
    precio, fx = precios_eur(list(contratos))

    # posiciones actuales en EUR, por estrategia
    cartera_ib = {it.contract.conId: it for it in ib.portfolio(cuenta) if it.position}
    objetivo_ids = {c.conId for c in contratos.values()}
    ventas, mantenidas = [], {k: {} for k in pesos}
    valores_antes = {k: 0.0 for k in pesos}
    for it in cartera_ib.values():
        k = libro["asignacion"].get(it.contract.symbol)
        v = it.marketValue * fx.get(it.contract.currency, math.nan)
        if k in valores_antes and math.isfinite(v):
            valores_antes[k] += v
        if it.contract.conId not in objetivo_ids and it.position > 0:
            ventas.append((it, k, v))
        elif k in mantenidas and math.isfinite(v):
            mantenidas[k][it.contract.conId] = v

    # plan del dinero (bt/plan.py)
    caida = caida_sp_hoy()
    estado = libro.get("plan")
    if estado is None:
        estado = arrancar_plan(plan, papel, efectivo + sum(v for _, _, v in ventas if math.isfinite(v)),
                               {k: sum(m.values()) for k, m in mantenidas.items()}, liquidez)
        log(f"Plan del dinero arrancado: reserva {estado['reserva']:,.0f}, por aportar {estado['porAportar']:,.0f}, "
            f"cajas {', '.join(f'{k} {x:,.0f}' for k, x in estado['cajas'].items())}")
    else:
        dif = cuadrar_plan(estado, efectivo, valores_antes, args.aporte)
        log(f"Liquidez cuadrada con el plan (diferencia de {dif:,.0f} repartida entre las estrategias)")
        for _, k, v in ventas:
            if k in estado["cajas"] and math.isfinite(v):
                estado["cajas"][k] += v
    nuevo, aporte = semana_plan(plan, estado, {k: sum(m.values()) for k, m in mantenidas.items()}, caida, args.aporte)
    log(f"S&P 500 a {caida:.1%} de su máximo de 1 año · ahorro de este mes {aporte:,.0f} · dinero nuevo "
        f"{', '.join(f'{k} {x:,.0f}' for k, x in nuevo.items())} · reserva {estado['reserva']:,.0f} · "
        f"por aportar {estado['porAportar']:,.0f}")

    # compras por estrategia: las nuevas con su parte y, con la caja que sobre, completar las que van cortas
    ya = {it.contract.conId for it in cartera_ib.values() if it.position > 0}
    importes = {}
    for k, e in estrategias.items():
        tk_de_id = {contratos[v["ticker"]].conId: v["ticker"] for v in e["valores"] if v["ticker"] in contratos}
        nuevas = [tk for i, tk in tk_de_id.items() if i not in ya]
        mant = {tk_de_id[i]: v for i, v in mantenidas[k].items() if i in tk_de_id}
        for tk, x in compras_estrategia(e["posiciones"], mant, nuevas, estado["cajas"][k]).items():
            o = importes.setdefault(tk, {"eur": 0.0, "estrategias": [], "nueva": tk in nuevas})
            o["eur"] += x
            o["estrategias"].append(k)
            estado["cajas"][k] -= x

    ordenes = [("VENDER", it.contract, abs(it.position), "ya no está en la cartera objetivo") for it, _, _ in ventas]
    for tk, o in importes.items():
        c = contratos[tk]
        px, eur_por_unidad = precio.get(tk), fx.get(c.currency)
        if not (px and eur_por_unidad and math.isfinite(px) and math.isfinite(eur_por_unidad)):
            log(f"  {tk}: sin precio, se omite")
            for k in o["estrategias"]:
                estado["cajas"][k] += o["eur"] / len(o["estrategias"])
            continue
        if tk.endswith(".L"):
            px = px / 100                                           # Yahoo da Londres en peniques
        lote = 100 if c.exchange == "TSEJ" or getattr(c, "primaryExchange", "") == "TSEJ" else 1
        detalles = ib.reqContractDetails(c)
        if detalles and getattr(detalles[0], "sizeIncrement", None):
            lote = max(lote, int(float(detalles[0].sizeIncrement) or 1))
        acciones = int(o["eur"] / (px * eur_por_unidad) // lote * lote)
        gastado = acciones * px * eur_por_unidad
        for k in o["estrategias"]:                                  # lo que no llega a un lote vuelve a la caja
            estado["cajas"][k] += (o["eur"] - gastado) / len(o["estrategias"])
        if acciones <= 0:
            log(f"  {tk}: el importe no llega a un lote de {lote}, se omite")
            continue
        motivo = "nueva" if o["nueva"] else "completa su parte"
        ordenes.append(("COMPRAR", c, acciones, f"{motivo} en {', '.join(o['estrategias'])} "
                                               f"(~{gastado:,.0f} EUR a {px:,.2f} {c.currency})"))

    log(f"{len(ordenes)} órdenes ({'SE ENVÍAN' if args.ejecutar else 'SIMULACIÓN, no se envía nada'}):")
    filas = []
    for accion, c, n, porque in ordenes:
        log(f"  {accion:8s} {n:>8,} {c.symbol:<8s} {c.currency}  · {porque}")
        fila = {"fecha": datetime.now().isoformat(timespec="seconds"), "cuenta": cuenta, "accion": accion,
                "simbolo": c.symbol, "bolsa": getattr(c, "primaryExchange", c.exchange), "divisa": c.currency,
                "acciones": n, "motivo": porque, "enviada": args.ejecutar, "estado": ""}
        if args.ejecutar:
            if accion == "COMPRAR" and c.conId not in ya:
                tk = next(t for t, k in contratos.items() if k.conId == c.conId)
                libro["asignacion"][c.symbol] = importes[tk]["estrategias"][0]
                libro["entradas"][c.symbol] = datetime.now().date().isoformat()
                if semaforos.get(tk):
                    libro.setdefault("semaforo", {})[c.symbol] = semaforos[tk]
            t = ib.placeOrder(c, MarketOrder("SELL" if accion == "VENDER" else "BUY", n, tif="DAY"))
            ib.sleep(1)
            fila["estado"] = t.orderStatus.status
        filas.append(fila)
    log("Cajas tras las órdenes: " + ", ".join(f"{k} {x:,.0f}" for k, x in estado["cajas"].items()))
    if args.ejecutar:
        libro["pesos"] = pesos
        libro["plan"] = estado
        # posiciones que ya estaban antes de anotar el semáforo: se les pone el de esta semana, marcado como aproximado
        tk_de = {k.conId: t for t, k in contratos.items()}
        for it in cartera_ib.values():
            t = tk_de.get(it.contract.conId)
            if it.position > 0 and t and semaforos.get(t) and it.contract.symbol not in libro.setdefault("semaforo", {}):
                libro["semaforo"][it.contract.symbol] = {**semaforos[t], "aprox": True}
        guardar_libro(libro)
    if filas:
        reg = DIR / "registro_ordenes.csv"
        pd.DataFrame(filas).to_csv(reg, mode="a", header=not reg.exists(), index=False)
        log(f"Registro: {reg}")
    ib.disconnect()


if __name__ == "__main__":
    sys.exit(main())
