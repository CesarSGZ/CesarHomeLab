"""Ratios fundamentales historicos 'point-in-time'.

Para cada empresa se construyen "fotos" de sus cuentas (anuales y, cuando hay 4 trimestres
seguidos, TTM trimestral). Cada foto solo es utilizable desde su FECHA DE DISPONIBILIDAD:
  - la primera fecha de publicacion de resultados (Yahoo earnings dates) posterior al cierre
    del periodo y como mucho 120 dias despues, + 1 sesion (no sabemos si publico antes de
    abrir o tras el cierre);
  - si no hay fecha de publicacion: cierre del periodo + 90 dias (retraso conservador).
Los ratios diarios cruzan la ultima foto disponible con el precio y el numero de acciones
de ese dia (capitalizacion = precio x acciones del periodo, corrigiendo splits posteriores).
"""
import numpy as np
import pandas as pd

from .datos import DIR_DATOS, Precios

RETRASO_SIN_FECHA = 90       # dias tras cierre de periodo si no hay fecha de publicacion
MAX_DIAS_PUBLICACION = 120

# alias de conceptos de Yahoo, por orden de preferencia
CONCEPTOS = {
    "ingresos": ["Total Revenue", "Operating Revenue"],
    "ebitda": ["EBITDA", "Normalized EBITDA"],
    "ebit": ["EBIT", "Operating Income"],
    "amortizacion": ["Reconciled Depreciation", "Depreciation And Amortization In Income Statement"],
    "beneficio": ["Net Income Common Stockholders", "Net Income",
                  "Net Income From Continuing Operation Net Minority Interest"],
    "patrimonio": ["Stockholders Equity", "Common Stock Equity"],
    "deuda": ["Total Debt"],
    "caja": ["Cash Cash Equivalents And Short Term Investments", "Cash And Cash Equivalents"],
    "minoritarios": ["Minority Interest"],
    "acciones": ["Ordinary Shares Number", "Share Issued"],
    "acciones_medias": ["Diluted Average Shares", "Basic Average Shares"],
}
FLUJOS = ["ingresos", "ebitda", "ebit", "amortizacion", "beneficio"]


def _pivot(fund, estados):
    f = fund[fund.estado.isin(estados)]
    w = f.pivot_table(index=["ticker", "periodo"], columns="concepto", values="valor", aggfunc="last")
    out = pd.DataFrame(index=w.index)
    for nombre, alias in CONCEPTOS.items():
        s = pd.Series(np.nan, index=w.index)
        for a in alias:
            if a in w.columns:
                s = s.fillna(w[a])
        out[nombre] = s
    # EBITDA de respaldo: EBIT + amortizaciones
    out["ebitda"] = out["ebitda"].fillna(out["ebit"] + out["amortizacion"])
    out["acciones"] = out["acciones"].fillna(out["acciones_medias"])
    return out.reset_index()


def construir_fotos(dir_datos=DIR_DATOS) -> pd.DataFrame:
    fund = pd.read_csv(dir_datos / "fundamentales.csv.gz", parse_dates=["periodo"])
    anual = _pivot(fund, ["resultados_anual", "balance_anual"])
    anual["tipo"] = "anual"
    trim = _pivot(fund, ["resultados_trim", "balance_trim"])

    # TTM: suma de 4 trimestres consecutivos (separados ~3 meses) de flujos; balance del ultimo
    ttm = []
    for tk, g in trim.groupby("ticker"):
        g = g.sort_values("periodo").reset_index(drop=True)
        for i in range(3, len(g)):
            v = g.iloc[i - 3: i + 1]
            saltos = v["periodo"].diff().dt.days.dropna()
            if not saltos.between(80, 100).all():
                continue
            if v[["ingresos", "beneficio"]].isna().any().any():
                continue
            fila = g.iloc[i].copy()
            for c in FLUJOS:
                fila[c] = v[c].sum(min_count=4)
            fila["tipo"] = "ttm"
            ttm.append(fila)
    if ttm:
        ttm = pd.DataFrame(ttm).sort_values("periodo")
        # Huecos de la foto TTM (p. ej. EBITDA no publicado por trimestres): se rellenan con
        # la ultima cuenta anual del mismo valor cuyo cierre sea anterior al del trimestre.
        an = anual.sort_values("periodo")
        rell = pd.merge_asof(ttm[["ticker", "periodo"]].reset_index(), an, on="periodo", by="ticker",
                             direction="backward", allow_exact_matches=True).set_index("index")
        for col in list(CONCEPTOS):
            if col in ttm and col in rell:
                ttm[col] = ttm[col].fillna(rell[col])
        fotos = pd.concat([anual, ttm], ignore_index=True)
    else:
        fotos = anual

    # una foto sin cuenta de resultados (p. ej. columna de balance suelta) no sirve: fuera
    fotos = fotos.dropna(subset=["beneficio"])

    # crecimiento interanual (solo entre fotos anuales consecutivas)
    fotos = fotos.sort_values(["ticker", "tipo", "periodo"])
    for c in ["ingresos", "beneficio", "ebitda"]:
        prev = fotos.groupby(["ticker", "tipo"])[c].shift(1)
        prev_per = fotos.groupby(["ticker", "tipo"])["periodo"].shift(1)
        ok = (fotos["periodo"] - prev_per).dt.days.between(330, 400)
        fotos[f"crec_{c}"] = np.where(ok & (prev.abs() > 0), fotos[c] / prev.abs() - np.sign(prev), np.nan)

    fotos["disponible"] = _fechas_disponibilidad(fotos, dir_datos)
    return fotos.sort_values(["ticker", "disponible"]).reset_index(drop=True)


def _fechas_disponibilidad(fotos, dir_datos):
    try:
        fr = pd.read_csv(dir_datos / "fechas_resultados.csv", parse_dates=["fecha"])
        fr = fr.dropna(subset=["fecha"])
        fr = fr[fr["fecha"] <= pd.Timestamp.today()]
    except FileNotFoundError:
        fr = pd.DataFrame(columns=["ticker", "fecha"])
    por_tk = {tk: np.sort(g["fecha"].dt.normalize().values) for tk, g in fr.groupby("ticker")}
    disp = []
    for tk, per in zip(fotos["ticker"], fotos["periodo"]):
        fallback = per + pd.Timedelta(days=RETRASO_SIN_FECHA)
        fechas = por_tk.get(tk)
        d = fallback
        if fechas is not None:
            i = np.searchsorted(fechas, np.datetime64(per), side="right")
            if i < len(fechas):
                f = pd.Timestamp(fechas[i])
                if (f - per).days <= MAX_DIAS_PUBLICACION:
                    d = f + pd.offsets.BDay(1)
        disp.append(d)
    return pd.to_datetime(disp)


def ratios_diarios(fotos: pd.DataFrame, p: Precios, info: pd.DataFrame,
                   fechas: pd.DatetimeIndex | None = None) -> pd.DataFrame:
    """Tabla larga (fecha, ticker) con ratios usando solo informacion ya publicada."""
    fechas = p.close.index if fechas is None else fechas
    salida = []
    splits = p.splits
    for tk, f in fotos.groupby("ticker"):
        if tk not in p.close.columns:
            continue
        # para cada fecha, la foto mas reciente ya disponible (prefiere la de periodo mas nuevo)
        f = f.sort_values(["disponible", "periodo"]).drop_duplicates("disponible", keep="last")
        f = f.assign(periodo_max=f["periodo"].cummax())
        f = f[f["periodo"] == f["periodo_max"]]       # no retroceder a periodos mas antiguos
        base = pd.DataFrame({"fecha": fechas})
        m = pd.merge_asof(base, f, left_on="fecha", right_on="disponible", direction="backward")
        m = m.dropna(subset=["periodo"])
        if m.empty:
            continue
        close = p.close[tk].reindex(m["fecha"]).ffill().values
        # factor de splits posteriores al periodo (Close de Yahoo esta ajustado por todos los splits)
        sp = splits[tk]
        sp = sp[sp > 0]
        fac = np.ones(len(m))
        for d, x in sp.items():
            fac = np.where(m["periodo"].values < np.datetime64(d), fac * x, fac)
        cap = close * m["acciones"].values * fac
        divisa = info["financialCurrency"].get(tk, "EUR") if tk in info.index else "EUR"
        if divisa == "USD":
            cap = cap * p.fx_eurusd.reindex(m["fecha"]).values
        elif divisa not in ("EUR", None) and isinstance(divisa, str):
            cap = cap * np.nan   # divisa no soportada
        r = pd.DataFrame({"fecha": m["fecha"].values, "ticker": tk})
        r["periodo"] = m["periodo"].values
        r["tipo_foto"] = m["tipo"].values
        r["capitalizacion"] = cap
        deuda_neta = m["deuda"].fillna(0).values - m["caja"].fillna(0).values
        ev = cap + deuda_neta + m["minoritarios"].fillna(0).values
        ebitda = m["ebitda"].values
        bfo = m["beneficio"].values
        pat = m["patrimonio"].values
        ing = m["ingresos"].values
        with np.errstate(divide="ignore", invalid="ignore"):
            r["per"] = np.where(bfo > 0, cap / bfo, np.nan)
            r["ev_ebitda"] = np.where(ebitda > 0, ev / ebitda, np.nan)
            r["p_vc"] = np.where(pat > 0, cap / pat, np.nan)
            r["dn_ebitda"] = np.where(ebitda > 0, deuda_neta / ebitda, np.nan)
            r["roe"] = np.where(pat > 0, bfo / pat, np.nan)
            r["margen_neto"] = np.where(ing > 0, bfo / ing, np.nan)
            r["margen_ebitda"] = np.where(ing > 0, ebitda / ing, np.nan)
        r["beneficio_positivo"] = bfo > 0
        r["crec_ingresos"] = m["crec_ingresos"].values
        r["crec_beneficio"] = m["crec_beneficio"].values
        salida.append(r)
    out = pd.concat(salida, ignore_index=True)
    out["sector"] = out["ticker"].map(info["sector"]).fillna("Desconocido")
    out["industria"] = out["ticker"].map(info["industry"]).fillna("Desconocido")
    return out


def control_capitalizacion(fotos, p: Precios, info: pd.DataFrame, tolerancia=0.30) -> pd.DataFrame:
    """Compara la capitalizacion reconstruida HOY con la de Yahoo. Si difiere mas de la
    tolerancia, el numero de acciones de Yahoo no es fiable y el valor se excluye de las
    estrategias con fundamentales (todos sus ratios historicos estarian mal escalados)."""
    r = ratios_diarios(fotos, p, info, fechas=p.close.index[-1:]).set_index("ticker")
    c = pd.DataFrame({"cap_reconstruida": r["capitalizacion"], "cap_yahoo": info["marketCap"]})
    c["ratio"] = c["cap_reconstruida"] / c["cap_yahoo"]
    c["fiable"] = c["ratio"].between(1 - tolerancia, 1 + tolerancia)
    return c


def resumen_cobertura(fotos: pd.DataFrame, info: pd.DataFrame) -> pd.DataFrame:
    a = fotos[fotos.tipo == "anual"]
    g = a.groupby("ticker")
    res = pd.DataFrame({
        "anios_cuentas": g["periodo"].nunique(),
        "primer_periodo": g["periodo"].min().dt.date,
        "ultimo_periodo": g["periodo"].max().dt.date,
        "anios_con_beneficio": g["beneficio"].apply(lambda s: s.notna().sum()),
        "anios_con_ebitda": g["ebitda"].apply(lambda s: s.notna().sum()),
        "anios_con_deuda": g["deuda"].apply(lambda s: s.notna().sum()),
        "anios_con_acciones": g["acciones"].apply(lambda s: s.notna().sum()),
    })
    t = fotos[fotos.tipo == "ttm"].groupby("ticker")["periodo"].nunique()
    res["fotos_ttm"] = t.reindex(res.index).fillna(0).astype(int)
    res["sector"] = info["sector"].reindex(res.index)
    res["divisa_cuentas"] = info["financialCurrency"].reindex(res.index)
    return res
