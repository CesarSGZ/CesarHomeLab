"""
Cuentas de la SEC (XBRL "companyfacts") de todas las empresas de EE. UU. del universo.

Gratis y con la FECHA EN QUE SE PRESENTÓ cada dato (point-in-time de verdad), desde 2009 aprox.
Se guarda todo lo de los informes 10-K/10-Q (y 20-F/40-F de extranjeras) por empresa, comprimido:

  datos_global/sec/companyfacts/<ticker>.json.gz   {cik, nombre, facts: {concepto: [{start,end,val,filed,form,fy,fp,accn,unidad}]}}
  datos_global/sec/cik.json                        ticker -> CIK

  python descargar_sec.py            descarga lo que falte (se puede relanzar), empresa a empresa
  python descargar_sec.py --todo     vuelve a bajar todo, empresa a empresa
  python descargar_sec.py --zip      baja el fichero completo de la SEC (~1,4 GB, se actualiza a diario) y reescribe
                                     solo las empresas cuyas cuentas cambiaron (lo usa GitHub Actions cada semana)
"""
import argparse
import gzip
import json
import time
import urllib.request
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent
DIR = RAIZ / "datos_global" / "sec"
UA = {"User-Agent": "CesarHomeLab Research Bot"}         # la SEC exige identificarse; rechaza agentes "de navegador"
FORMULARIOS = {"10-K", "10-K/A", "10-Q", "10-Q/A", "10-KT", "20-F", "20-F/A", "40-F", "40-F/A"}


def get(url, intentos=4):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(5 * (i + 1))
        except Exception:  # noqa: BLE001
            time.sleep(5 * (i + 1))
    return None


def compactar(js):
    facts = {}
    for tax in ("us-gaap", "dei", "ifrs-full"):
        for concepto, v in js.get("facts", {}).get(tax, {}).items():
            filas = []
            for unidad, xs in v.get("units", {}).items():
                for f in xs:
                    if f.get("form") in FORMULARIOS:
                        filas.append({k: f.get(k) for k in ("start", "end", "val", "filed", "form", "fy", "fp", "accn")} | {"unidad": unidad})
            if filas:
                facts[f"{tax}:{concepto}" if tax != "us-gaap" else concepto] = filas
    return {"cik": js.get("cik"), "nombre": js.get("entityName"), "facts": facts}


def desde_zip(mapa):
    """Fichero completo companyfacts.zip -> nuestras empresas. Solo se escribe lo que ha cambiado."""
    import shutil
    import tempfile
    import zipfile
    ruta_zip = Path(tempfile.gettempdir()) / "companyfacts.zip"
    req = urllib.request.Request("https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip", headers=UA)
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=600) as r, open(ruta_zip, "wb") as f:
        shutil.copyfileobj(r, f, length=16 * 1024 * 1024)
    print(f"zip descargado ({ruta_zip.stat().st_size / 1e9:.2f} GB, {time.time() - t0:.0f}s)", flush=True)
    nuevas = cambiadas = iguales = 0
    with zipfile.ZipFile(ruta_zip) as z:
        nombres = set(z.namelist())
        for t, c in sorted(mapa.items()):
            miembro = f"CIK{c:010d}.json"
            if miembro not in nombres:
                continue
            texto = json.dumps(compactar(json.loads(z.read(miembro))), separators=(",", ":"))
            ruta = DIR / "companyfacts" / f"{t}.json.gz"
            if ruta.exists():
                try:
                    if gzip.open(ruta, "rt", encoding="utf-8").read() == texto:
                        iguales += 1
                        continue
                except Exception:  # noqa: BLE001 - fichero roto: se reescribe
                    pass
                cambiadas += 1
            else:
                nuevas += 1
            tmp = ruta.with_suffix(".tmp")
            with gzip.open(tmp, "wt", encoding="utf-8") as f:
                f.write(texto)
            tmp.replace(ruta)
    ruta_zip.unlink(missing_ok=True)
    print(f"SEC: {nuevas} nuevas, {cambiadas} con cuentas nuevas, {iguales} sin cambios ({time.time() - t0:.0f}s)", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--zip", action="store_true")
    ap.add_argument("--todo", action="store_true")
    ap.add_argument("--parte", default="0/1", help="k/n: descarga solo una de n partes (para ir en paralelo)")
    args = ap.parse_args()
    (DIR / "companyfacts").mkdir(parents=True, exist_ok=True)
    uni = pd.read_csv(RAIZ / "datos_global" / "universo.csv")
    tickers = sorted(uni.loc[uni["zona"] == "EE. UU.", "ticker"])
    tabla = get("https://www.sec.gov/files/company_tickers.json")
    cik = {v["ticker"].upper(): int(v["cik_str"]) for v in tabla.values()}
    mapa = {t: cik.get(t.upper().replace("-", "."), cik.get(t.upper())) for t in tickers}
    mapa = {t: c for t, c in mapa.items() if c}
    (DIR / "cik.json").write_text(json.dumps(mapa, indent=0), encoding="utf-8")
    print(f"{len(mapa)} de {len(tickers)} empresas de EE. UU. con CIK", flush=True)
    if args.zip:
        return desde_zip(mapa)
    hechos = 0
    k, n = map(int, args.parte.split("/"))
    for i, (t, c) in enumerate(sorted(mapa.items())[k::n]):
        ruta = DIR / "companyfacts" / f"{t}.json.gz"
        if ruta.exists() and not args.todo:
            continue
        js = get(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{c:010d}.json")
        if js is not None:
            with gzip.open(ruta, "wt", encoding="utf-8") as f:
                json.dump(compactar(js), f, separators=(",", ":"))
            hechos += 1
        time.sleep(0.3)
        if i % 200 == 0:
            print(time.strftime("%H:%M:%S"), i, t, flush=True)
    print(f"Hecho: {hechos} empresas descargadas", flush=True)


if __name__ == "__main__":
    main()
