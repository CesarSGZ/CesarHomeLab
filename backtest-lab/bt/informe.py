"""Informe HTML autocontenido (graficos plotly incrustados)."""
import html
import re
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

COLORES = {"Estrategia": "#1f5aa6", "IBEX 35 con dividendos (ETF)": "#d0661f", "Equiponderada universo": "#6b8e23"}

CSS = """
:root{--fg:#1d2329;--muted:#5b6670;--bg:#ffffff;--panel:#f5f7f9;--line:#dde3e8;--accent:#1f5aa6;--bad:#b3261e;--good:#1b7a3a}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--fg);background:var(--bg);margin:0;line-height:1.5}
main{max-width:1180px;margin:0 auto;padding:24px 16px 80px}
h1{font-size:1.7rem;margin:.2em 0}h2{font-size:1.35rem;margin-top:2.2em;border-bottom:2px solid var(--line);padding-bottom:.3em}
h3{font-size:1.1rem;margin-top:1.6em}.muted{color:var(--muted)}
nav a{margin-right:14px;color:var(--accent);text-decoration:none;font-size:.95rem}
table{border-collapse:collapse;font-size:.85rem;margin:.6em 0;font-variant-numeric:tabular-nums;display:block;overflow-x:auto;max-width:100%}
th{white-space:normal!important;min-width:70px}
th,td{border-bottom:1px solid var(--line);padding:4px 8px;text-align:right;white-space:nowrap}
th{background:var(--panel);position:sticky;top:0}td:first-child,th:first-child{text-align:left}
.scroll{max-height:460px;overflow:auto;border:1px solid var(--line);border-radius:6px}
.wide{overflow-x:auto}.neg{color:var(--bad)}.pos{color:var(--good)}
.nota{background:var(--panel);border-left:4px solid var(--accent);padding:10px 14px;border-radius:4px;margin:1em 0}
.aviso{background:#fff4e5;border-left:4px solid #d0661f;padding:10px 14px;border-radius:4px;margin:1em 0}
.resumen{font-size:1rem}.resumen li{margin:.3em 0}
"""


def _pct(x, dec=1):
    if x is None or (isinstance(x, float) and not np.isfinite(x)):
        return "–"
    cls = "neg" if x < 0 else ""
    return f'<span class="{cls}">{x * 100:.{dec}f}%</span>'


def _num(x, dec=2):
    if x is None or (isinstance(x, float) and not np.isfinite(x)):
        return "–"
    return f"{x:,.{dec}f}"


FORMATO = {"Rentabilidad total": _pct, "CAGR": _pct, "Volatilidad": _pct, "Drawdown maximo": _pct,
           "Exposicion media": _pct, "% aciertos": lambda x: _pct(x, 0), "Ganancia media": _pct,
           "Perdida media": _pct, "Sharpe (rf=0)": _num, "Calmar": _num, "Operaciones/anio": lambda x: _num(x, 1),
           "Dias medios en cartera": lambda x: _num(x, 0), "Operaciones (compras)": lambda x: _num(x, 0),
           "Anios": lambda x: _num(x, 1)}


def _tabla_metricas(tabla: dict) -> str:
    claves = ["Periodo", "Anios", "Rentabilidad total", "CAGR", "Volatilidad", "Sharpe (rf=0)", "Drawdown maximo",
              "Calmar", "Exposicion media", "Operaciones/anio", "% aciertos", "Ganancia media", "Perdida media",
              "Dias medios en cartera"]
    cols = list(tabla.keys())
    h = ["<div class='wide'><table><tr><th>Metrica</th>"]
    tramo_prev = None
    for (t, s) in cols:
        h.append(f"<th>{html.escape(t) if t != tramo_prev else ''}<br>{html.escape(s)}</th>")
        tramo_prev = t
    h.append("</tr>")
    for k in claves:
        h.append(f"<tr><td>{k}</td>")
        for c in cols:
            v = tabla[c].get(k)
            f = FORMATO.get(k)
            h.append(f"<td>{f(v) if (f and v is not None) else (html.escape(str(v)) if v is not None else '')}</td>")
        h.append("</tr>")
    h.append("</table></div>")
    return "".join(h)


def _df_html(df: pd.DataFrame, formatos: dict | None = None, clase="") -> str:
    formatos = formatos or {}
    d = df.copy()
    for c, f in formatos.items():
        if c in d:
            d[c] = d[c].map(lambda x: f(x) if pd.notna(x) else "–")
    return f"<div class='{clase}'>" + d.to_html(escape=False, border=0, na_rep="–") + "</div>"


def _grafico_equity(eq, bm, fin_tr, titulo, primero):
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True, row_heights=[0.72, 0.28], vertical_spacing=0.04)
    series = {"Estrategia": eq, **bm}
    for n, s in series.items():
        fig.add_trace(go.Scatter(x=s.index, y=s.values, name=n, line=dict(color=COLORES.get(n), width=2 if n == "Estrategia" else 1.4)), 1, 1)
        dd = s / s.cummax() - 1
        fig.add_trace(go.Scatter(x=dd.index, y=dd.values, name=f"DD {n}", showlegend=False,
                                 line=dict(color=COLORES.get(n), width=1)), 2, 1)
    fig.add_vrect(x0=eq.index[0], x1=fin_tr, fillcolor="#888", opacity=0.07, line_width=0,
                  annotation_text="entrenamiento", annotation_position="top left")
    fig.add_vrect(x0=fin_tr, x1=eq.index[-1], fillcolor="#1f5aa6", opacity=0.05, line_width=0,
                  annotation_text="validación fuera de muestra", annotation_position="top left")
    fig.update_yaxes(type="log", title_text="Capital (inicio = 1, escala log)", row=1, col=1)
    fig.update_yaxes(tickformat=".0%", title_text="Drawdown", row=2, col=1)
    fig.update_layout(title=titulo, height=620, margin=dict(l=60, r=20, t=60, b=30),
                      legend=dict(orientation="h", y=1.08), hovermode="x unified", template="plotly_white")
    return fig.to_html(full_html=False, include_plotlyjs=primero)


def _grafico_exposicion(res):
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    fig.add_trace(go.Scatter(x=res.exposicion.index, y=res.exposicion.values, name="Exposición (% invertido)",
                             line=dict(color="#1f5aa6", width=1)), secondary_y=False)
    fig.add_trace(go.Scatter(x=res.n_posiciones.index, y=res.n_posiciones.values, name="N.º posiciones",
                             line=dict(color="#999", width=1)), secondary_y=True)
    fig.update_yaxes(tickformat=".0%", secondary_y=False)
    fig.update_layout(height=260, margin=dict(l=60, r=40, t=30, b=30), template="plotly_white",
                      legend=dict(orientation="h", y=1.15))
    return fig.to_html(full_html=False, include_plotlyjs=False)


def _md(texto: str) -> str:
    """Markdown minimo: #, -, **negrita**, parrafos."""
    out, lista = [], False
    for linea in texto.splitlines():
        l = html.escape(linea.rstrip())
        l = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", l)
        l = re.sub(r"`(.+?)`", r"<code>\1</code>", l)
        if l.startswith("- "):
            if not lista:
                out.append("<ul>"); lista = True
            out.append(f"<li>{l[2:]}</li>"); continue
        if lista:
            out.append("</ul>"); lista = False
        if l.startswith("### "):
            out.append(f"<h3>{l[4:]}</h3>")
        elif l.startswith("## "):
            out.append(f"<h3>{l[3:]}</h3>")
        elif l.startswith("# "):
            continue
        elif l.strip():
            out.append(f"<p>{l}</p>")
    if lista:
        out.append("</ul>")
    return "\n".join(out)


# Empresas que salieron de la bolsa espanola y que Yahoo ya no tiene (lista orientativa, no exhaustiva)
SALIDAS = [
    ("Martinsa-Fadesa", "2008", "Concurso de acreedores", "pérdida ~total"),
    ("Banco de Valencia", "2012-13", "Intervenido y vendido por 1 €", "pérdida ~total"),
    ("Bankia", "2012 / 2021", "Nacionalización; luego absorbida por CaixaBank", "pérdida >90% desde la OPV"),
    ("La Seda de Barcelona", "2013-14", "Concurso de acreedores", "pérdida ~total"),
    ("Reyal Urbis", "2013", "Concurso de acreedores", "pérdida ~total"),
    ("Vértice 360", "2015", "Concurso de acreedores", "pérdida ~total"),
    ("Abengoa", "2015-21", "Reestructuraciones y concurso", "pérdida ~total"),
    ("Banco Popular", "2017", "Resolución (vendido a Santander por 1 €)", "pérdida total"),
    ("Sniace", "2019-20", "Concurso y liquidación", "pérdida ~total"),
    ("Codere", "2021-22", "Reestructuración y exclusión", "pérdida ~total"),
    ("Iberia", "2011", "Fusión con British Airways (IAG)", "canje"),
    ("Abertis", "2018", "OPA (Atlantia/ACS)", "prima"),
    ("Hispania, Saeta Yield", "2018", "OPA", "prima"),
    ("Telepizza, Parques Reunidos", "2019-20", "OPA", "prima"),
    ("BME, MásMóvil", "2020", "OPA", "prima"),
    ("Euskaltel, Solarpack", "2021", "OPA", "prima"),
    ("Liberbank", "2021", "Fusión con Unicaja", "canje"),
    ("Zardoya Otis", "2022", "OPA de exclusión", "prima"),
    ("Siemens Gamesa, Opdenergy", "2023", "OPA de exclusión", "prima"),
    ("Mediaset España", "2023", "Fusión en MFE", "canje"),
    ("Applus", "2024", "OPA", "prima"),
    ("Alba, Catalana Occidente, Lar España, NH Hotels", "2025-26", "Ya no disponibles en Yahoo (OPA/exclusión)", "prima (prob.)"),
]


def generar(ruta: Path, resultados, rejilla, calidad, correcciones, cobertura, cob_temporal, control, p, info):
    partes = [f"<!doctype html><html lang='es'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
              f"<title>Backtesting mercado continuo</title><style>{CSS}</style></head><body><main>"]
    partes.append(f"<h1>Backtesting · mercado continuo español</h1><p class='muted'>Generado el {datetime.now():%d/%m/%Y %H:%M} · "
                  f"datos hasta {p.close.index[-1]:%d/%m/%Y} · fuente: Yahoo Finance (gratuita)</p>")
    partes.append("<nav><a href='#resumen'>Resumen</a><a href='#vct'>Valor+calidad+tendencia</a><a href='#momentum'>Tendencia+momentum</a>"
                  "<a href='#sesgos'>Sesgos</a><a href='#datos'>Calidad de datos</a></nav>")

    resumen_md = ruta.parent / "resumen.md"
    if resumen_md.exists():
        partes.append(f"<h2 id='resumen'>Resumen en lenguaje llano</h2><div class='resumen'>{_md(resumen_md.read_text(encoding='utf-8'))}</div>")

    primero = True
    for clave, (res, eq, bm, tabla, anual) in resultados.items():
        est = res.estrategia
        fin_tr = pd.Timestamp(est.fin_entrenamiento)
        partes.append(f"<h2 id='{clave}'>{html.escape(est.nombre)}</h2><p>{html.escape(est.descripcion)}</p>")
        partes.append(f"<p class='muted'>Capital inicial {est.capital_inicial:,.0f} € · liquidez mínima {est.liquidez_min / 1e6:.1f} M€/día "
                      f"(mediana 60 sesiones) · entrenamiento hasta {fin_tr:%d/%m/%Y}, validación después · "
                      f"costes totales pagados: {res.costes_totales:,.0f} €</p>")
        partes.append(_grafico_equity(eq, bm, fin_tr, f"{est.nombre}: capital frente a benchmarks", "cdn" if False else primero))
        primero = False
        partes.append("<h3>Métricas</h3>" + _tabla_metricas(tabla))
        partes.append("<h3>Exposición y número de posiciones</h3>" + _grafico_exposicion(res))
        a = anual.copy()
        a["Estrategia - IBEX"] = a["Estrategia"] - a["IBEX 35 con dividendos (ETF)"]
        a.index.name = "Año"
        partes.append("<h3>Rentabilidad por año</h3>" + _df_html(a, {c: _pct for c in a.columns}))
        ops = res.operaciones.copy()
        if not ops.empty:
            por_motivo = ops.groupby("motivo_salida")["rentabilidad"].agg(["count", "mean"]).rename(
                columns={"count": "operaciones", "mean": "rentab. media"})
            partes.append("<h3>Salidas por motivo</h3>" + _df_html(por_motivo, {"rentab. media": _pct}))
            mejores = ops.groupby("ticker")["rentabilidad"].agg(["count", "sum"]).sort_values("sum")
            ops_v = ops[["fecha_entrada", "ticker", "nombre", "sector", "precio_entrada", "fecha_salida", "precio_salida",
                         "dias", "motivo_salida", "importe_entrada", "rentabilidad"]].copy()
            ops_v["fecha_entrada"] = ops_v["fecha_entrada"].dt.strftime("%Y-%m-%d")
            ops_v["fecha_salida"] = ops_v["fecha_salida"].dt.strftime("%Y-%m-%d").fillna("abierta")
            partes.append(f"<h3>Lista de operaciones ({len(ops_v)})</h3><p class='muted'>Precios de mercado ajustados por splits "
                          "(no por dividendos). La rentabilidad incluye dividendos y todos los costes.</p>")
            partes.append(_df_html(ops_v, {"precio_entrada": lambda x: _num(x, 3), "precio_salida": lambda x: _num(x, 3),
                                           "importe_entrada": lambda x: _num(x, 0), "rentabilidad": _pct}, "scroll"))
            partes.append("<h3>Valores que más aportaron y restaron (suma de rentabilidades por operación)</h3>"
                          + _df_html(pd.concat([mejores.head(5), mejores.tail(5)]).rename(columns={"count": "operaciones", "sum": "suma rentab."}),
                                     {"suma rentab.": _pct}))
        if clave == "momentum" and rejilla:
            rj = pd.DataFrame(rejilla)
            partes.append("<h3>Selección de parámetros (sin mirar la validación)</h3><p>Se probaron estas combinaciones "
                          "<strong>solo en el periodo de entrenamiento</strong>; se eligió la de mayor Sharpe en entrenamiento. "
                          "Las columnas de validación se calculan después y se muestran solo para que veas la dispersión: "
                          "no se usaron para elegir.</p>")
            partes.append(_df_html(rj, {"Sharpe entrenamiento": _num, "CAGR entrenamiento": _pct, "DD max entrenamiento": _pct,
                                        "Oper./anio": lambda x: _num(x, 1), "Sharpe validacion": _num, "CAGR validacion": _pct}))
        if clave == "vct":
            ct = cob_temporal.copy()
            ct.index = ct.index.strftime("%Y-%m-%d")
            muestra = ct.iloc[::13]
            partes.append("<h3>Empresas con ratios disponibles a lo largo del tiempo</h3><p class='muted'>Antes de marzo de 2023 "
                          "casi ninguna empresa tiene ratios: por eso esta estrategia solo empieza en abril de 2023.</p>"
                          + _df_html(muestra.T))

    partes.append(_seccion_sesgos(resultados, p))
    partes.append(_seccion_datos(calidad, correcciones, cobertura, control))
    partes.append("</main></body></html>")
    ruta.write_text("\n".join(partes), encoding="utf-8")
    return ruta


def _seccion_sesgos(resultados, p):
    h = ["<h2 id='sesgos'>Cómo se han tratado los sesgos</h2>"]
    h.append("""<h3>1. Mirar al futuro (look-ahead)</h3><ul>
<li>Las señales se calculan con el <strong>cierre del último día de cada semana</strong> y las órdenes se ejecutan en la
<strong>apertura de la sesión siguiente</strong>, con su slippage.</li>
<li>Cada cuenta (anual o TTM trimestral) solo se usa desde su <strong>fecha de publicación</strong> (fechas de resultados de Yahoo) + 1 sesión.
Si no hay fecha, desde <strong>cierre del periodo + 90 días</strong>. Nunca se usan los ratios actuales de Yahoo como si fueran históricos:
los ratios se reconstruyen cada semana con el precio de ese día y las acciones del periodo publicado.</li>
<li>Riesgos residuales: (a) Yahoo da las cuentas tal como están hoy, que pueden incluir <strong>reexpresiones</strong> posteriores;
(b) el <strong>sector</strong> de cada empresa es el actual; (c) para el ITF se usa una capitalización aproximada con acciones actuales.
Son efectos pequeños.</li></ul>""")
    desde_2008 = int((p.close.loc[:"2008-01-31"].notna().any()).sum())
    total = p.close.shape[1]
    h.append(f"""<h3>2. Supervivencia</h3>
<p>Yahoo solo tiene empresas que <strong>siguen cotizando hoy</strong>. De los {total} valores del universo, solo
<strong>{desde_2008}</strong> cotizaban ya en enero de 2008, cuando el mercado continuo tenía <strong>del orden de 130 empresas</strong> (cifra aproximada).
Es decir, en 2008 falta aproximadamente <strong>un tercio o más del universo real</strong>, y faltan precisamente las que lo hicieron peor
(quiebras) y algunas de las que recibieron una OPA (con prima). No se puede corregir con datos gratuitos.</p>""")
    df = pd.DataFrame(SALIDAS, columns=["Empresa", "Año", "Qué pasó", "Efecto para el accionista"])
    h.append("<p>Ejemplos de salidas que no están en los datos (lista orientativa, no exhaustiva):</p>" + df.to_html(index=False, border=0))
    filas = []
    for clave, (res, eq, *_ ) in resultados.items():
        n = res.estrategia.n_posiciones
        anios = (eq.index[-1] - eq.index[0]).days / 365.25
        for k in (1, 2, 4):
            filas.append({"Estrategia": res.estrategia.nombre, "Quiebras sufridas en cartera": k,
                          "Pérdida de capital": 1 - (1 - 1 / n) ** k,
                          "Resta al CAGR (pp/año)": np.log((1 - 1 / n) ** k) / anios})
    s = pd.DataFrame(filas)
    h.append("<p><strong>Sensibilidad:</strong> cuánto restaría al resultado haber tenido en cartera k valores que acaban a cero "
             "(cada posición pesa 1/N). La regla de vender al perder la media de 200 sesiones suele sacar a la estrategia antes "
             "del desplome final, así que el impacto real esperado es menor que el de esta tabla, pero la cartera equiponderada "
             "del universo (benchmark) sí está claramente sobrevalorada en los años antiguos.</p>"
             + _df_html(s, {"Pérdida de capital": _pct, "Resta al CAGR (pp/año)": lambda x: f"{x * 100:.2f}"}))
    c = list(resultados.values())[0][0].estrategia.costes
    h.append(f"""<h3>3. Costes</h3><ul>
<li>Comisión tipo IBKR (tarifa fija, acciones españolas): {c.comision_pct:.2%} del importe, mínimo {c.comision_min:.0f} € por orden (aproximación; revisa tu tarifa real).</li>
<li><strong>ITF</strong> (impuesto sobre transacciones financieras): {c.itf_pct:.1%} en compras de empresas españolas con capitalización &gt; 1.000 M€, desde 2021.</li>
<li>Slippage por lado según liquidez (efectivo medio diario): &ge;20 M€: 0,05 %; 5-20 M€: 0,10 %; 1-5 M€: 0,20 %; &lt;1 M€: 0,40 %;
+0,50 % extra si la orden supera el 2 % del volumen diario.</li>
<li>Filtro de liquidez: solo se compran valores con al menos 1 M€ negociados al día (mediana de 60 sesiones). No se opera en días sin volumen (suspensiones).</li>
<li>No incluidos: impuestos sobre dividendos y plusvalías (en Alemania, Abgeltungsteuer + retención española en origen), coste de cambio de divisa (no aplica, todo en EUR).</li></ul>""")
    h.append("""<h3>4. Sobreajuste</h3><ul>
<li>Cada estrategia tiene un periodo de <strong>entrenamiento</strong> y otro de <strong>validación fuera de muestra</strong> (zona azul en los gráficos).</li>
<li>Valor+calidad+tendencia: umbrales fijados <strong>a priori</strong>, sin optimizar (con 3,5 años de datos no hay margen para optimizar nada).</li>
<li>Tendencia+momentum: 6 combinaciones de parámetros probadas solo en 2008-2016; la elegida se aplica sin cambios a 2017-hoy.</li>
<li>Para las próximas variantes: <strong>decidir con el periodo de entrenamiento y mirar la validación una sola vez</strong>. Cada vez que se mira la validación y se cambia algo, deja de ser fuera de muestra.</li></ul>""")
    return "\n".join(h)


def _seccion_datos(calidad, correcciones, cobertura, control):
    h = ["<h2 id='datos'>Calidad de los datos</h2>"]
    n = len(calidad)
    anios = calidad["anios"]
    h.append(f"""<ul><li><strong>{n}</strong> valores con precios diarios. Historia: {(anios >= 15).sum()} con 15+ años,
{((anios >= 10) & (anios < 15)).sum()} con 10-15, {((anios >= 5) & (anios < 10)).sum()} con 5-10, {(anios < 5).sum()} con menos de 5.</li>
<li>Huecos: mediana {calidad['pct_huecos'].median():.2f}% de sesiones sin dato dentro de la vida de cada valor; hueco máximo {int(calidad['max_hueco_sesiones'].max())} sesiones.</li>
<li>Saltos diarios &gt;40%: {int((calidad['saltos_40pct'] > 0).sum())} valores (casi todos pequeños/ilíquidos: reanudaciones tras suspensión, ampliaciones, contrasplits).
El motor no abre posiciones en un valor en las 60 sesiones siguientes a un salto x3 o /3.</li>
<li>Splits no aplicados por Yahoo y corregidos automáticamente: {len(correcciones)}.</li>
<li>Rentabilidad total reconstruida con cierre + dividendos (el "Adj Close" de Yahoo tiene errores en algunos valores).</li>
<li>Fundamentales: Yahoo da cuenta de resultados anual de solo <strong>4 ejercicios</strong> (2022-2025) para
{int((cobertura['anios_cuentas'] >= 4).sum())} empresas ({int((cobertura['anios_cuentas'] < 4).sum())} con menos); del ejercicio 2021 solo hay balance.
Como el ejercicio 2022 se publicó en febrero-abril de 2023, <strong>los ratios históricos solo existen desde abril de 2023</strong>.
TTM trimestral para {int((cobertura['fotos_ttm'] > 0).sum())} empresas (Yahoo da ~5-6 trimestres). EBITDA no disponible en bancos y aseguradoras (normal).</li>
<li>Capitalización reconstruida vs. la actual de Yahoo: {int(control['fiable'].sum())} valores cuadran (±30%); se excluyen de la estrategia fundamental:
{', '.join(control.index[~control['fiable']]) or '–'}.</li></ul>""")
    if len(correcciones):
        h.append("<h3>Splits corregidos</h3>" + correcciones.to_html(index=False, border=0))
    cols = ["desde", "anios", "pct_huecos", "max_hueco_sesiones", "efectivo_mediano_ult_anio_keur", "pct_dias_vol0_ult_anio",
            "n_splits", "saltos_40pct", "fechas_saltos", "ultimo_dato_desfasado"]
    h.append("<h3>Detalle por valor (precios)</h3>" + _df_html(calidad[cols].sort_values("efectivo_mediano_ult_anio_keur", ascending=False), {}, "scroll"))
    h.append("<h3>Detalle por valor (fundamentales)</h3>" + _df_html(cobertura.drop(columns=["fiable"]).rename(columns={"ratio": "cap. reconstruida / Yahoo"}),
                                                                       {"cap. reconstruida / Yahoo": lambda x: _num(x, 2)}, "scroll"))
    return "\n".join(h)
