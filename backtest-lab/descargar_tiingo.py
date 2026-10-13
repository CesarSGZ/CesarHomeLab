"""
Precios diarios de Tiingo para empresas que ya no cotizan (sesgo de supervivencia). Corre en GitHub Actions con el
secreto TIINGO_API_KEY (la clave nunca sale de ahí). Se puede relanzar: no repite lo ya bajado.

  python descargar_tiingo.py tiingo_pedir.txt   -> datos_global/alternativos/tiingo/<ticker>.csv (+ _meta.json)

Si Tiingo devuelve 429 (límite del plan gratuito) se para y guarda lo hecho; el siguiente lanzamiento sigue.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
DIR = RAIZ / "datos_global" / "alternativos" / "tiingo"


def get(url):
    req = urllib.request.Request(url, headers={"Content-Type": "application/json", "Authorization": f"Token {os.environ['TIINGO_API_KEY']}"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read()), dict(r.headers)


def main():
    DIR.mkdir(parents=True, exist_ok=True)
    tickers = [t.strip() for t in (RAIZ / sys.argv[1]).read_text().splitlines() if t.strip()]
    meta_ruta = DIR / "_meta.json"
    meta = json.loads(meta_ruta.read_text()) if meta_ruta.exists() else {}
    hechos, limite = 0, time.time() + 5 * 3600
    for tk in tickers:
        if tk in meta or time.time() > limite:
            continue
        try:
            info, cab = get(f"https://api.tiingo.com/tiingo/daily/{tk.replace('-', '.')}")
            filas, _ = get(f"https://api.tiingo.com/tiingo/daily/{tk.replace('-', '.')}/prices?startDate=2006-01-01&resampleFreq=daily")
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"Límite de Tiingo alcanzado tras {hechos} valores: se sigue en el próximo lanzamiento", flush=True)
                break
            meta[tk] = {"error": e.code}
            continue
        except Exception as e:  # noqa: BLE001
            print(tk, "error", e, flush=True)
            continue
        if filas:
            cols = ["date", "open", "high", "low", "close", "volume", "adjOpen", "adjHigh", "adjLow", "adjClose", "adjVolume", "divCash", "splitFactor"]
            with open(DIR / f"{tk}.csv", "w", encoding="utf-8") as f:
                f.write(",".join(cols) + "\n")
                for r in filas:
                    f.write(",".join(str(r.get(c, "")) for c in cols) + "\n")
        meta[tk] = {"nombre": info.get("name"), "inicio": info.get("startDate"), "fin": info.get("endDate"), "filas": len(filas),
                    "bolsa": info.get("exchangeCode")}
        hechos += 1
        meta_ruta.write_text(json.dumps(meta, indent=0))
        if hechos == 1:
            print("Cabeceras de límite:", {k: v for k, v in cab.items() if "limit" in k.lower() or "ratelimit" in k.lower()}, flush=True)
        time.sleep(1.0)
    meta_ruta.write_text(json.dumps(meta, indent=0))
    print(f"Hecho: {hechos} nuevos; {sum(1 for m in meta.values() if 'filas' in m)} con precios de {len(tickers)} pedidos", flush=True)


if __name__ == "__main__":
    main()
