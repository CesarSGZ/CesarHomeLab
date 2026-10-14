"""
Carteras de los fondos de valor españoles (Cobas, Azvalor, Magallanes, Bestinver...) desde 2012, de los ficheros de
información individual de IIC de la CNMV (FONDCART: composición de cartera de cada fondo, trimestral).

  python descargar_cnmv.py   -> datos_global/alternativos/cnmv/carteras.parquet (gestora, fondo, ISIN, valor, fecha)

La cartera de fin de trimestre se conoce cuando el fondo publica su informe (1 mes después el trimestral, 2 meses el
semestral): para usarla sin mirar al futuro se toma como disponible 75 días después del cierre (DISPONIBLE_DIAS).
"""
import io
import re
import time
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from html import unescape
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent
DIR = RAIZ / "datos_global" / "alternativos" / "cnmv"
UA = {"User-Agent": "Mozilla/5.0 (CesarHomeLab research)"}
DISPONIBLE_DIAS = 75
GESTORAS = {   # patrón en la denominación de la gestora -> nombre corto
    "COBAS": "Cobas (Paramés)", "AZVALOR": "Azvalor", "MAGALLANES": "Magallanes", "BESTINVER": "Bestinver",
    "TRUE VALUE": "True Value", "HOROS": "Horos", "VALENTUM": "Valentum", "METAGESTION": "Metagestión (Metavalor)",
    "ABACO": "Ábaco", "BUY & HOLD": "Buy & Hold", "BUY&HOLD": "Buy & Hold",
}
MESES = {"Marzo": 3, "Junio": 6, "Septiembre": 9, "Diciembre": 12}


def get(url, timeout=300):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read()


def enlaces(anio):
    s = get(f"https://www.cnmv.es/portal/Publicaciones/descarga-informacion-individual.aspx?ejercicio={anio}", 60).decode("utf-8", "ignore")
    out = {}
    for fila in re.findall(r"<tr[^>]*>(.*?)</tr>", s, re.S):
        texto = re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", fila))).strip()
        mes = next((m for m in MESES if texto.startswith(m)), None)
        url = re.findall(r'href="([^"]+)"', fila)
        if mes and url:
            out[MESES[mes]] = unescape(url[0])
    return out


def leer(zip_bytes):
    z = zipfile.ZipFile(io.BytesIO(zip_bytes))
    base = lambda n: n.split(".")[0]
    nombre = lambda n: next(x for x in z.namelist() if x.upper().split("/")[-1].startswith(base(n)) and x.upper().endswith(".XML"))
    reg = ET.parse(z.open(nombre("FONDREGISTRO.XML"))).getroot()
    fondos = {}
    for e in reg.findall("Entidad"):
        g = (e.findtext("Gestora/DenominacionGestora") or "").upper()
        corto = next((v for k, v in GESTORAS.items() if k in g), None)
        if corto:
            fondos[e.findtext("NumeroRegistro")] = (corto, e.findtext("Denominacion"))
    car = ET.parse(z.open(nombre("FONDCART.XML"))).getroot()
    fecha = car.findtext("FechaDatos")
    filas = []
    for e in car.findall("Entidad"):
        num = e.findtext("NumeroRegistro")
        if num not in fondos:
            continue
        for inv in e.iter("InversionesFinancieras"):
            desc_if = inv.findtext("DescripcionIF") or ""
            if "Renta Variable" not in desc_if:
                continue
            filas.append({"fecha_datos": fecha, "gestora": fondos[num][0], "fondo": fondos[num][1], "registro": num,
                          "isin": inv.findtext("CodigoISIN"), "descripcion": inv.findtext("DescripcionValor"),
                          "divisa": inv.findtext("Divisa"), "valor": float(inv.findtext("ValorMercado") or 0)})
    return pd.DataFrame(filas)


def main():
    DIR.mkdir(parents=True, exist_ok=True)
    for anio in range(2012, 2027):
        try:
            ls = enlaces(anio)
        except Exception as e:  # noqa: BLE001
            print(anio, "sin listado", e, flush=True)
            continue
        for mes, url in sorted(ls.items()):
            ruta = DIR / f"{anio}{mes:02d}.csv"
            if ruta.exists():
                continue
            try:
                t0 = time.time()
                t = leer(get(url))
                t.to_csv(ruta, index=False)
                print(f"{anio}-{mes:02d}: {len(t)} posiciones de {t['gestora'].nunique() if len(t) else 0} gestoras ({time.time() - t0:.0f}s)", flush=True)
            except Exception as e:  # noqa: BLE001
                print(f"{anio}-{mes:02d}: error {e}", flush=True)
    partes = [pd.read_csv(p, dtype={"fecha_datos": str, "registro": str}) for p in sorted(DIR.glob("2*.csv")) if p.stat().st_size > 10]
    t = pd.concat(partes, ignore_index=True)
    t["cierre"] = pd.to_datetime(t["fecha_datos"], format="%Y%m") + pd.offsets.MonthEnd(0)
    t["disponible"] = t["cierre"] + pd.Timedelta(days=DISPONIBLE_DIAS)
    t.to_parquet(DIR / "carteras.parquet")
    print(f"Hecho: {len(t)} filas, {t['gestora'].nunique()} gestoras, {t['isin'].nunique()} valores", flush=True)
    print(t.groupby("gestora")["cierre"].agg(["min", "max", "nunique"]).to_string())


if __name__ == "__main__":
    main()
