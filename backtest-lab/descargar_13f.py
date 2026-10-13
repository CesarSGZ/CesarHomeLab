"""
Carteras declaradas a la SEC (formulario 13F) de gestores de valor conocidos, desde 2013, y su ticker.

  python descargar_13f.py        -> datos_global/alternativos/13f/carteras.parquet  (una fila por gestor, informe y valor)

Solo los 13F-HR originales. Se guarda la FECHA DE PRESENTACIÓN (la cartera se conoce ~45 días después del trimestre).
CUSIP -> ticker con OpenFIGI (gratis, sin clave, con límite de peticiones).
"""
import io
import json
import re
import time
import urllib.request
import zipfile
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent
DIR = RAIZ / "datos_global" / "alternativos" / "13f"
UA = {"User-Agent": "CesarHomeLab Research Bot"}
GESTORES = {   # patrón del nombre del gestor en la portada del 13F -> nombre corto
    r"^BERKSHIRE HATHAWAY INC": "Berkshire (Buffett)", r"DALAL STREET": "Pabrai", r"HIMALAYA CAPITAL": "Li Lu (Himalaya)",
    r"AKRE CAPITAL": "Akre", r"BAUPOST": "Baupost (Klarman)", r"GREENLIGHT CAPITAL": "Greenlight (Einhorn)",
    r"FAIRHOLME CAPITAL": "Fairholme (Berkowitz)", r"SOUTHEASTERN ASSET": "Southeastern (Longleaf)", r"TWEEDY.{0,3}BROWNE": "Tweedy Browne",
    r"RUANE.{0,3}CUNNIFF": "Ruane Cunniff (Sequoia)", r"^MARKEL": "Markel (Gayner)", r"FAIRFAX FINANCIAL": "Fairfax (Watsa)",
    r"SCION ASSET": "Scion (Burry)", r"AQUAMARINE": "Aquamarine (Spier)", r"SEMPER AUGUSTUS": "Semper Augustus",
    r"THIRD AVENUE": "Third Avenue", r"PERSHING SQUARE": "Pershing Square (Ackman)", r"VALUEACT": "ValueAct",
    r"HARRIS ASSOCIATES": "Oakmark (Harris)", r"GARDNER RUSSO": "Gardner Russo", r"WEDGEWOOD PARTNERS": "Wedgewood",
    r"GIVERNY CAPITAL": "Giverny", r"PATIENT CAPITAL": "Patient Capital (Miller)", r"CHOU ASSOCIATES": "Chou",
    r"MAR VISTA": "Mar Vista", r"GOTHAM ASSET": "Gotham (Greenblatt)",
}


def get(url, timeout=600):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read()


def lotes():
    pagina = get("https://www.sec.gov/dera/data/form-13f", 60).decode("utf-8", "ignore")
    return sorted(set(re.findall(r'href="([^"]+13f[^"]*\.zip)"', pagina, re.I)))


def leer_lote(url):
    z = zipfile.ZipFile(io.BytesIO(get("https://www.sec.gov" + url)))
    miembro = lambda n: next(x for x in z.namelist() if x.upper().endswith(n.upper()))      # a veces van en una carpeta
    leer = lambda n, cols: pd.read_csv(z.open(miembro(n)), sep="\t", dtype=str, usecols=cols, on_bad_lines="skip")
    sub = leer("SUBMISSION.tsv", ["ACCESSION_NUMBER", "FILING_DATE", "SUBMISSIONTYPE", "CIK", "PERIODOFREPORT"])
    sub = sub[sub["SUBMISSIONTYPE"] == "13F-HR"]
    cov = leer("COVERPAGE.tsv", ["ACCESSION_NUMBER", "FILINGMANAGER_NAME"])
    cov["gestor"] = None
    for patron, corto in GESTORES.items():
        cov.loc[cov["FILINGMANAGER_NAME"].str.upper().str.contains(patron, regex=True, na=False), "gestor"] = corto
    cov = cov.dropna(subset=["gestor"])
    s = sub.merge(cov, on="ACCESSION_NUMBER")
    if not len(s):
        return pd.DataFrame()
    info = leer("INFOTABLE.tsv", ["ACCESSION_NUMBER", "NAMEOFISSUER", "TITLEOFCLASS", "CUSIP", "VALUE", "PUTCALL"])
    info = info[info["ACCESSION_NUMBER"].isin(s["ACCESSION_NUMBER"]) & info["PUTCALL"].isna()]
    info["VALUE"] = pd.to_numeric(info["VALUE"], errors="coerce")
    m = info.merge(s, on="ACCESSION_NUMBER")
    return m[["gestor", "CIK", "FILING_DATE", "PERIODOFREPORT", "NAMEOFISSUER", "TITLEOFCLASS", "CUSIP", "VALUE", "ACCESSION_NUMBER"]]


def figi(cusips):
    """CUSIP -> ticker de EE. UU. con OpenFIGI (10 por petición, ~20 peticiones por minuto sin clave)."""
    ruta = DIR / "cusip_ticker.json"
    semilla = RAIZ / "cusip_ticker.json"                 # copia versionada: GitHub no tiene que rehacer las ~5.000 consultas
    mapa = json.loads(semilla.read_text()) if semilla.exists() else {}
    if ruta.exists():
        mapa.update(json.loads(ruta.read_text()))
    faltan = [c for c in cusips if c not in mapa]
    for i in range(0, len(faltan), 10):
        lote = faltan[i:i + 10]
        cuerpo = json.dumps([{"idType": "ID_CUSIP", "idValue": c, "exchCode": "US"} for c in lote]).encode()
        for intento in range(5):
            try:
                req = urllib.request.Request("https://api.openfigi.com/v3/mapping", data=cuerpo,
                                             headers={"Content-Type": "application/json"})
                res = json.loads(urllib.request.urlopen(req, timeout=60).read())
                for c, r in zip(lote, res):
                    datos = [x for x in r.get("data", []) if x.get("ticker")]
                    mapa[c] = datos[0]["ticker"].replace("/", "-") if datos else None
                break
            except Exception:  # noqa: BLE001 - límite de peticiones: esperar
                time.sleep(20 * (intento + 1))
        time.sleep(3.2)
        if i % 200 == 0:
            ruta.write_text(json.dumps(mapa))
            print(f"OpenFIGI {i}/{len(faltan)}", flush=True)
    ruta.write_text(json.dumps(mapa))
    return mapa


def main():
    DIR.mkdir(parents=True, exist_ok=True)
    partes = []
    for u in lotes():
        nombre = u.rsplit("/", 1)[-1].replace(".zip", "")
        ruta = DIR / f"{nombre}.csv"
        if not ruta.exists():
            try:
                t0 = time.time()
                lote = leer_lote(u)
                lote.to_csv(ruta, index=False)
                print(f"{nombre}: {len(lote)} posiciones de {lote['gestor'].nunique() if len(lote) else 0} gestores ({time.time() - t0:.0f}s)", flush=True)
            except Exception as e:  # noqa: BLE001
                print(f"{nombre}: error {e}", flush=True)
                continue
        if ruta.stat().st_size > 10:
            partes.append(pd.read_csv(ruta, dtype=str))
    t = pd.concat(partes, ignore_index=True)
    t["VALUE"] = pd.to_numeric(t["VALUE"], errors="coerce")
    claves = ["gestor", "CIK", "FILING_DATE", "PERIODOFREPORT", "ACCESSION_NUMBER", "CUSIP"]
    t = t.groupby(claves, as_index=False).agg(VALUE=("VALUE", "sum"), NAMEOFISSUER=("NAMEOFISSUER", "first"))
    t["FILING_DATE"] = pd.to_datetime(t["FILING_DATE"], format="mixed", dayfirst=True, errors="coerce")
    t["PERIODOFREPORT"] = pd.to_datetime(t["PERIODOFREPORT"], format="mixed", dayfirst=True, errors="coerce")
    mapa = figi(sorted(t["CUSIP"].dropna().str.upper().unique()))
    t["ticker"] = t["CUSIP"].str.upper().map(mapa)
    t.to_parquet(DIR / "carteras.parquet")
    print(f"Hecho: {len(t)} filas, {t['gestor'].nunique()} gestores, {t['ticker'].notna().mean():.0%} con ticker", flush=True)


if __name__ == "__main__":
    main()
