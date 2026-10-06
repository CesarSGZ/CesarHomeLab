# TRD-01 · Agent Office (v2)

Módulo privado en `/control/#trading`. Seis agentes de IA llevan una empresa de inversión
simulada: dinero ficticio, precios reales de la bolsa de EEUU. No existe conexión a ningún bróker.

## La regla del juego

- Capital ficticio en EUR (la cartera no se reinicia entre meses).
- Alquiler: 10.000 € ficticios de beneficio por mes natural (día de Nueva York), equivalentes a
  los 10 € reales de tokens de OpenAI que tiene el equipo para ese mes.
- Al cambiar de mes se anota si el alquiler se pagó (`v2.months`). No se descuenta de la caja.

## Dónde corre

| Pieza | Sitio |
| --- | --- |
| Ciclo cada ~5 min | GitHub Actions (`office-cloud-cycle.yml` + relevo) ejecutando `scripts/office-cloud-cycle.mjs` |
| Estado, ledger de tokens, cola de órdenes | Cloudflare D1, a través del puente `runtime-db` (lista cerrada de SQL) |
| Dashboard y API | Cloudflare Pages + Functions |

El PC no interviene. La clave de OpenAI está cifrada en D1.

## Motor (`trading-worker/v2/`)

| Archivo | Qué hace |
| --- | --- |
| `cycle.js` | Ciclo, reparto de turnos, órdenes pendientes, diario, `status()` para el dashboard |
| `agents.js` | Un turno de un empleado: contexto por puesto → una llamada ligera → acciones validadas |
| `meeting.js` | Reuniones: una intervención por asistente, votos, cierre de Augusto, acuerdos aplicados |
| `company.js` | Plantilla, reglas modificables y sus límites, ideas, cronología, ánimo |
| `book.js` | Contabilidad: compra/venta, margen, stops y objetivos |
| `llm.js` | Única puerta a OpenAI: reserva el coste antes y liquida con el uso real |

Cada ciclo: (1) datos sin IA — radar de señales (SEC 8-K, PR Newswire, calendario de resultados),
cambio BCE, precios Yahoo, stops/objetivos/plazos y órdenes pendientes; (2) IA — reunión si toca y,
si no, turnos de los empleados con trabajo o a los que les toca ronda; (3) diario y estado.

### Empleados

Santi (explorador) trae candidatas; Pedro (analista) las convierte en plan; María (riesgo) aprueba,
recorta o veta; Yari (trader) ejecuta y gestiona posiciones; Augusto (dirección) saca lecciones,
cambia reglas, convoca reuniones y puede levantar vetos; Cadaqui (finanzas y tokens) controla el
ritmo de gasto, escribe el resumen diario y decide gastos de oficina.

### Libertad del equipo

Pueden cambiar, por acción directa de Augusto o por acuerdo de reunión: nombre y foco de la
estrategia, reglas de la casa, tamaño por posición (2–100 % del capital), posiciones máximas (1–12),
apalancamiento (×1–×2), stop, objetivo y plazo por defecto, si María debe aprobar (`riskGate`),
ritmo de trabajo y número de reuniones. Una propuesta rechazada por mayoría no puede aplicarse en
esa reunión. No modifican código: la autoprogramación de la versión anterior está retirada.

Intocable: precios reales y recientes para ejecutar (referencia de menos de 35 min en sesión
regular), caja o margen suficiente, deslizamiento de 25 pb y 1 USD de comisión por lado, máximo el
10 % del volumen medio diario por compra, solo posiciones largas, y el presupuesto de 10 €.
Con apalancamiento, si el capital cae por debajo del 30 % de lo invertido se liquida todo.

### Presupuesto de IA

Asignación diaria = saldo restante / días restantes × ritmo (ahorro 0,6 · normal 1 · intensivo 1,5).
Turnos por ciclo: hasta 3 en sesión y 1 fuera (2/1 en ahorro, 4/2 en intensivo); de noche solo si
alguien tiene trabajo pendiente. Si el saldo de hoy no alcanza, los turnos se espacian; agotado,
solo quedan las rutinas por código. Un turno usa `gpt-6-luna` (~0,0003 €); la búsqueda web de Santi
es la única llamada cara (límite diario 1/3/6 según ritmo, y se desactiva tras dos fallos).

## Dashboard (`control/office/`)

`art.js` dibuja el pixel art por código (sin imágenes), `office.js` es la simulación visual y
`app.js` los paneles. La oficina representa los eventos reales de `timeline` (traspasos, compras,
reuniones con su transcripción, cambios de estrategia); el lote que llega cada ciclo se reparte en
el tiempo. Cafés, paseos y charlas de pasillo son vida local sin IA, y su tono depende del ánimo
real (ritmo del alquiler, resultado del día y tokens). César puede escribir al equipo, convocar una
reunión, pausar compras o empleados y cerrar posiciones.

## Infraestructura (`trading-worker/`)

| Archivo | Qué hace |
| --- | --- |
| `store.js` | Estado en D1: carga, bloqueo con lease, secretos cifrados y presupuesto del mes |
| `core.js` | Contabilidad base: capital, ventas, stops/objetivos/plazos, validez de precios |
| `radar.js`, `discovery.js`, `fundamentals.js` | Radar sin IA: catálogo Nasdaq, calendario de resultados, SEC 8-K, PR Newswire y fichas financieras |
| `market-data.js` | Sesión de Nueva York y lectura de precios de Yahoo |
| `runtime-db.js` | Puente SQL del ejecutor: lista cerrada de sentencias con parámetros validados |
| `index.js`, `auth.js`, `public-data-proxy.js` | Servicio interno (órdenes de César en cola, clave de IA, proxy de datos públicos) |

Workflows: `office-cloud-cycle.yml` ejecuta un ciclo y pasa el relevo a `office-watchdog.yml`, que
comprueba que el motor va al día (y lo recupera si no) y devuelve el relevo. Ninguno despliega nada
ni escribe en el repositorio. El motor anterior (gobierno, lanzamiento, autoprogramación) se eliminó;
al cargar el estado se descartan sus datos y se conservan cartera, ledger y `v2`.

## Verificación

`node --test tests/*.test.mjs`. `tests/office-v2.test.mjs` ejecuta ciclos completos sobre SQLite
con el validador real del puente y una IA simulada.
