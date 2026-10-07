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

### Cantera, España y estrategias paralelas

- `pipeline` (1–12, por defecto 6): candidatas vivas que debe mantener Santi. Mientras falten, es
  trabajo pendiente suyo y puede traer hasta tres por turno.
- Bolsa española (`spain.js`): 45 valores líquidos con sufijo `.MC`, en euros y sin conversión de
  divisa; sesión de 9:00 a 17:30 de Madrid. No hay radar de noticias: se siguen sus precios por
  tandas y Santi ve los que más se mueven.
- Estrategias paralelas (`playbook` / `retire`): hasta cuatro además de la principal, cada una con
  su foco, tamaño, stop, objetivo y plazo. Cada plan dice a cuál pertenece y el resultado se apunta ahí.

### Presupuesto de IA

Asignación diaria = saldo restante / días restantes × ritmo (ahorro 0,6 · normal 1 · intensivo 1,5).
Turnos por ciclo: hasta 3 en sesión y 1 fuera (2/1 en ahorro, 4/2 en intensivo); de noche solo si
alguien tiene trabajo pendiente. Si el saldo de hoy no alcanza, los turnos se espacian; agotado,
solo quedan las rutinas por código. Un turno usa `gpt-6-luna` (~0,0003 €); la búsqueda web de Santi
es la única llamada cara (límite diario 1/3/6 según ritmo, y se desactiva tras dos fallos).

## Dashboard (`control/office/`)

`art.js` dibuja el pixel art por código (sin imágenes), `office.js` es la simulación visual,
`gags.js` el guion de la vida de oficina y `app.js` los paneles. La oficina representa los eventos
reales de `timeline` (traspasos, compras, reuniones con su transcripción, cambios de estrategia); el
lote que llega cada ciclo se reparte en el tiempo. Nada del dashboard llama a la IA.

César es jugable: WASD/flechas mueven, **E** habla con un empleado (contesta con su tarea, lo que
piensa, sus notas y su historial reales) o usa el objeto que tenga delante (café, nevera, bidón de
tokens, sofá, tablero → Cartera, pizarra → Estrategia, estantería → Diario, sala → convocar reunión,
su mesa → llamar a alguien o regalar algo, recreativa, acuario, campana, diana, puerta), **Espacio**
saluda o arenga, **F** choca los cinco, **1–6** llama a un empleado y **H** abre la ayuda. Con ratón o
dedo: clic en el suelo para ir, en un objeto para usarlo, en un personaje para su ficha.

Las bromas y carteles salen de `status().life` y de las reglas vigentes: días sin operar (telarañas
en la mesa de Yari), rachas, último stop, vetos de María, tokens bajos, apalancamiento, filtro de
riesgo apagado, cola de candidatas, meses pagados (trofeos), ánimo (plantas mustias o en flor,
felpudo), pilas de papel según el trabajo pendiente, etc. Las compras de oficina (`OFFICE_CATALOG`)
se ven y se usan; César puede regalar cualquiera sin tocar la caja (`/gift`).

### Pulso sin IA

`lifeStats()` (en `company.js`) calcula por código días sin operar, rachas, mejor y peor cierre,
contadores por empleado y resultado por nombre de estrategia. Va al dashboard (`life`) y, resumido
en una línea (`pulso`), al contexto de cada turno. Ahorro de tokens: una ronda solo se gasta si hay
algo nuevo (eventos, radar recién barrido o precios movidos un 1,5 %); si no, se espera cuatro veces
más. Un descanso pedido con el mismo trabajo delante se respeta y un cierre se revisa una sola vez.
Regla nueva a disposición del equipo: `trailPct`, un stop que persigue al precio.

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
