// Shared by the deployment snapshot, the authenticated endpoint and the map.
// The map describes what exists today, where it lives, what runs by itself and how the pieces talk.
export const REPOSITORY = 'CesarSGZ/CesarHomeLab';
export const BRANCH = 'main';
export const RETIRED_PATH = /(^|\/)(ebay|bigbuy|marketplace|pdf-tools|chatgpt-remote|remote-browser)([\/.-]|$)|^migrations\/000[3-7]_|^constellation\.css$/i;
export function activeFiles(files) {
  return [...new Set(files.map(file => typeof file === 'string' ? file : file.path))]
    .filter(path => path && !RETIRED_PATH.test(path)).sort();
}

// Where things run. One column each on a wide screen, one block each on a phone.
export const ZONES = [
  { id: 'casa', name: 'En tu casa', note: 'Tu PC servidor y Claude, que programa', colour: '#efbe8c' },
  { id: 'github', name: 'En GitHub', note: 'El código y las tareas que se ejecutan solas', colour: '#bba8f1' },
  { id: 'cloudflare', name: 'En Cloudflare', note: 'La web, sus APIs y la base de datos', colour: '#83d7ed' },
  { id: 'fuera', name: 'Servicios de fuera', note: 'Google, el bróker y los datos de bolsa', colour: '#d5e99a' }
];
export const KINDS = { agente: 'Agente', tarea: 'Tarea automática', web: 'Web', codigo: 'Código', datos: 'Datos', servicio: 'Servicio externo' };

// Cron times are UTC in GitHub; the page shows them in Madrid time for today's date.
export const NODES = [
  { id: 'servercesar', zone: 'casa', kind: 'agente', name: 'ServerCesar',
    what: 'El PC de casa. Dos programas lo vigilan y avisan a la web de cómo está.',
    detail: 'El agente arranca con Windows y cada 2 minutos manda a Cloudflare el estado del PC y de sus apps, y recoge las órdenes de reiniciar o apagar que hayas dado desde Infraestructura. El guardián, al iniciar sesión, comprueba cada 20 segundos que Claude, ChatGPT, Parsec y Tailscale siguen abiertos y los vuelve a abrir si se cierran. Solo hacen conexiones de salida: no hay ningún puerto abierto en casa. Para encenderlo, un enchufe Shelly corta y devuelve la corriente.',
    where: ['server-agent/servercesar/ en el repo', 'C:\\ProgramData\\ServerCesar (registros y token cifrado)'],
    when: 'Agente cada 2 min · guardián cada 20 s', links: ['apis', 'shelly'],
    matches: path => path.startsWith('server-agent/') },
  { id: 'claude', zone: 'casa', kind: 'agente', name: 'Claude Code',
    what: 'El que programa: cambia el código, lo prueba y abre las PR.',
    detail: 'Funciona en la app de Claude de tu PC. Trabaja sobre los repositorios, prueba los cambios en un navegador simulado y los sube a GitHub con una PR que tú fusionas. Lo que genera fuera del código (datos, vídeos, documentos, pruebas) va a la carpeta Claude del escritorio.',
    where: ['Escritorio\\Claude', 'Los repositorios CesarHomeLab y marialopoda'],
    when: 'Cuando se lo pides', links: ['repo', 'marialopoda'], matches: path => path === 'CLAUDE.md' },
  { id: 'repo', zone: 'github', kind: 'codigo', name: 'CesarHomeLab',
    what: 'Todo el código de la web, las APIs, el Backtest Lab y el agente del server.',
    detail: 'Es la fuente de la verdad: lo que está en la rama main es lo que se publica. Aquí viven la web pública, Mission Control, las APIs, los scripts de Python del Backtest Lab y del robot, y los scripts del PC. GitHub guarda el código y ejecuta las tareas automáticas; no ejecuta nada en tu casa.',
    where: ['github.com/CesarSGZ/CesarHomeLab, rama main'], when: 'Cambia con cada PR que fusionas', links: ['deploy', 'backtest', 'robot', 'manual', 'claude'],
    matches: path => path === 'README.md' || path.startsWith('docs/') || path === '.gitignore' },
  { id: 'marialopoda', zone: 'github', kind: 'web', name: 'Marialópoda',
    what: 'La app de entreno de María. GitHub Pages la sirve tal cual.',
    detail: 'Es otro repositorio. La app funciona en el móvil de María aunque no haya cobertura y escribe directamente en su Sheet con su propio código de conexión. Para el pique pide tu resumen a la API de Cloudflare, enseñando su clave; nunca recibe tus series.',
    where: ['github.com/CesarSGZ/marialopoda', 'cesarsgz.github.io/marialopoda'], when: 'Se publica sola al subir a main', links: ['sheetMaria', 'apis', 'claude'], matches: () => false },
  { id: 'deploy', zone: 'github', kind: 'tarea', name: 'Publicar la web', workflow: 'deploy.yml',
    what: 'Pasa los tests y sube la web y las APIs a Cloudflare.',
    detail: 'Cada vez que algo entra en main, esta tarea descarga el código, pasa todos los tests, prepara la foto del repositorio que usa este mapa y sube el resultado a Cloudflare Pages con Wrangler. Si un test falla, no se publica nada.',
    where: ['.github/workflows/deploy.yml'], when: 'Cada vez que algo entra en main', links: ['repo', 'pages'],
    matches: path => path === '.github/workflows/deploy.yml' || /^scripts\/build-/.test(path) || path === 'wrangler.jsonc' || path.startsWith('tests/') },
  { id: 'backtest', zone: 'github', kind: 'tarea', name: 'Backtest Lab', workflow: 'backtest-lab.yml',
    what: 'Descarga datos de bolsa y prueba estrategias en Python.',
    detail: 'Cada 10 minutos mira en la base de datos si has pedido un backtest desde Mission Control; si lo hay, lo marca como en marcha, descarga los precios, ejecuta el motor en Python y publica el informe en la base de datos. Los sábados recalcula todo con los parámetros por defecto y los datos completos. Solo simula: no toca ningún bróker.',
    where: ['backtest-lab/', '.github/workflows/backtest-lab.yml', 'scripts/backtest-lab.mjs'],
    when: { text: 'Cada 10 min mira si hay petición · sábados {05:17} recalcula todo' }, links: ['d1', 'datos'],
    matches: path => (path.startsWith('backtest-lab/') && !/ibkr/i.test(path)) || /backtest-lab\.(yml|mjs)$/.test(path) || /tiingo/.test(path) },
  { id: 'robot', zone: 'github', kind: 'tarea', name: 'Robot IBKR (paper)', workflow: 'ibkr-paper-robot.yml',
    what: 'Opera la cuenta de prueba de Interactive Brokers sin tu PC.',
    detail: 'Arranca IB Gateway en un contenedor con las credenciales de la cuenta paper guardadas como secretos de GitHub. Los lunes aplica la cartera objetivo de la semana enviando órdenes; de lunes a viernes, al cierre de Wall Street, solo saca una foto de la cuenta para Mission Control. Al acabar apaga el contenedor.',
    where: ['backtest-lab/ibkr_paper.py', '.github/workflows/ibkr-paper-robot.yml', 'scripts/ibkr-paper-*.mjs'],
    when: { text: 'Lunes {07:40} órdenes · lunes a viernes {20:45} foto' }, links: ['ibkr', 'd1'],
    matches: path => /ibkr/i.test(path) },
  { id: 'manual', zone: 'github', kind: 'tarea', name: 'Tareas a mano', workflow: ['ibkr-paper-foto.yml', 'tiingo.yml', 'servercesar-secrets.yml', 'servercesar-wake-test.yml'],
    what: 'Foto de IBKR, precios de Tiingo, claves del server y prueba de encendido.',
    detail: 'Cuatro tareas que solo se ejecutan cuando las lanzas desde GitHub: sacar una foto de la cuenta paper, descargar precios de empresas que ya no cotizan (Tiingo), copiar el token del agente a Cloudflare y probar el encendido remoto de ServerCesar.',
    where: ['.github/workflows/'], when: 'Solo cuando las lanzas', links: ['repo', 'servercesar'],
    matches: path => /servercesar-(secrets|wake-test)\.yml$|ibkr-paper-foto\.yml$|tiingo\.yml$/.test(path) },
  { id: 'pages', zone: 'cloudflare', kind: 'web', name: 'Web y Mission Control',
    what: 'cesar-solla.pages.dev: tu CV público y este panel privado.',
    detail: 'La parte pública es tu CV y funciona sin iniciar sesión. Mission Control, debajo de /control, pide sesión, y cada cuenta ve solo sus secciones: tú ves Galaxy, Infraestructura, Thermal Lab, Training y Backtest Lab. No depende de que tu PC esté encendido.',
    where: ['cesar-solla.pages.dev', 'control/ en el repo'], when: 'Siempre encendida', links: ['deploy', 'apis'],
    matches: path => (!path.includes('/') && /\.(html|css|js)$/.test(path)) || path.startsWith('assets/') || (path.startsWith('control/') && !path.startsWith('control/vendor/') && !path.startsWith('control/data/')) || ['_routes.json', '_headers'].includes(path) },
  { id: 'apis', zone: 'cloudflare', kind: 'codigo', name: 'APIs (Functions)',
    what: 'Comprueban quién eres antes de leer o escribir nada.',
    detail: 'Pequeños programas en Cloudflare. Sesión e inicio de sesión; Training (tu Sheet, renombrar ejercicios y el pique); Backtest (pedir y leer backtests); ServerCesar (estado, encender con el enchufe, reiniciar y apagar); este mapa; el puente con la base de datos para las tareas de GitHub; la entrada del agente del server, y /api/pique, que da tu resumen a la app de María si enseña su clave. El juego de las puertas sigue aquí, oculto.',
    where: ['functions/'], when: 'Cuando alguien las llama', links: ['pages', 'd1', 'sheetCesar', 'sheetMaria', 'shelly', 'servercesar', 'marialopoda'],
    matches: path => path.startsWith('functions/') },
  { id: 'd1', zone: 'cloudflare', kind: 'datos', name: 'Base de datos D1',
    what: 'Sesiones, el estado del server, las colas y las conexiones a los Sheets.',
    detail: 'Guarda usuarios y sesiones, el último informe y las órdenes pendientes de ServerCesar, las peticiones y resultados del Backtest Lab, el libro del robot de IBKR y las conexiones a tu Sheet y al de María. Este mapa explica qué hay, pero nunca lee ni enseña su contenido.',
    where: ['cesar-mission-control (Cloudflare D1)', 'migrations/ en el repo'], when: 'Siempre disponible', links: ['apis', 'backtest', 'robot'],
    matches: path => path.startsWith('migrations/') },
  { id: 'sheetCesar', zone: 'fuera', kind: 'datos', name: 'Tu Sheet de entreno',
    what: 'Rutina, alternativas y registro de series desde 2018.',
    detail: 'Un Google Sheet con un Apps Script que hace de puerta: la API de Training le habla con la clave guardada en la base de datos. Lo que apuntas en la app se escribe aquí, y si editas la rutina en el Sheet, la app la lee al abrirse.',
    where: ['Google Sheets', 'training-backend/Code.gs'], when: 'Cada vez que abres o apuntas', links: ['apis'],
    matches: path => path.startsWith('training-backend/') },
  { id: 'sheetMaria', zone: 'fuera', kind: 'datos', name: 'Sheet de María',
    what: 'Lo mismo para Marialópoda: su app le escribe directamente.',
    detail: 'Su propio Google Sheet con su Apps Script. Su app lo lee y escribe sin pasar por Cloudflare. Tu panel solo lee de él el resumen del pique, con el código que conectaste una vez.',
    where: ['Google Sheets', 'marialopoda/backend/Code.gs'], when: 'Cada vez que María abre o apunta', links: ['marialopoda', 'apis'], matches: () => false },
  { id: 'ibkr', zone: 'fuera', kind: 'servicio', name: 'Interactive Brokers',
    what: 'Cuenta paper: dinero ficticio con órdenes de verdad en el simulador.',
    detail: 'El robot se conecta a la cuenta de prueba a través de IB Gateway solo mientras dura su tarea. No hay ninguna cuenta real conectada.',
    where: ['Cuenta paper de IBKR'], when: 'Solo durante el robot', links: ['robot'], matches: () => false },
  { id: 'datos', zone: 'fuera', kind: 'servicio', name: 'Datos de bolsa',
    what: 'Yahoo Finance, SEC, 13F, Tiingo y CNMV.',
    detail: 'Fuentes gratuitas de precios, cuentas de empresas y carteras de fondos que descarga el Backtest Lab. Se guardan en la caché de GitHub Actions para no descargarlo todo cada vez.',
    where: ['Caché de GitHub Actions'], when: 'Durante cada backtest', links: ['backtest'], matches: () => false },
  { id: 'shelly', zone: 'fuera', kind: 'servicio', name: 'Enchufe Shelly',
    what: 'Enciende ServerCesar cortando y devolviendo la corriente.',
    detail: 'La BIOS del PC está configurada para encenderse al volver la corriente. Mission Control pide al enchufe, a través de Shelly Cloud, que haga ese corte cuando el PC está apagado.',
    where: ['Shelly Cloud'], when: 'Cuando pulsas encender', links: ['apis', 'servercesar'],
    matches: path => /shelly/i.test(path) }
];
// Each pair once, whichever side names it.
const pairs = new Map();
NODES.forEach(n => n.links.forEach(to => pairs.set([n.id, to].sort().join('|'), { from: n.id, to })));
export const LINKS = [...pairs.values()];
export const neighboursOf = id => [...new Set(LINKS.filter(l => l.from === id || l.to === id).map(l => (l.from === id ? l.to : l.from)))];

// What happens, step by step: [node, title, explanation].
export const PROCESSES = [
  { id: 'publicar', name: 'Publicar un cambio', steps: [
    ['claude', 'Claude hace el cambio', 'Cambia el código, lo prueba y abre una PR.'],
    ['repo', 'Lo fusionas en main', 'Desde ese momento es la versión oficial.'],
    ['deploy', 'GitHub lo comprueba', 'Pasa todos los tests; si uno falla, se para aquí.'],
    ['pages', 'Cloudflare lo sirve', 'En uno o dos minutos ya está en cesar-solla.pages.dev.']] },
  { id: 'serie', name: 'Apuntar una serie', steps: [
    ['pages', 'Pulsas «Serie hecha»', 'La app la guarda en el móvil al instante, por si no hay cobertura.'],
    ['apis', 'La API comprueba que eres tú', 'Sesión, permiso y protección contra peticiones falsas.'],
    ['sheetCesar', 'Se escribe en tu Sheet', 'El Apps Script la añade al Registro con su ID, sin duplicados.']] },
  { id: 'pique', name: 'El pique con María', steps: [
    ['marialopoda', 'María abre su app', 'Su app pide tu resumen enseñando su clave.'],
    ['apis', 'La API la reconoce', 'Compara su clave con la guardada y lee tu Sheet.'],
    ['sheetCesar', 'Solo sale el resumen', 'Días entrenados, marcas superadas y caminadora. Nada de series ni notas.'],
    ['sheetMaria', 'Y al revés', 'Tu panel lee el resumen de María desde su Sheet.']] },
  { id: 'backtest', name: 'Un backtest', steps: [
    ['pages', 'Lo pides en Backtest Lab', 'Eliges los parámetros y pulsas ejecutar.'],
    ['d1', 'Queda en cola', 'La petición se guarda en la base de datos.'],
    ['backtest', 'GitHub la recoge', 'En menos de 10 minutos, descarga datos y ejecuta el motor.'],
    ['datos', 'Usa datos gratuitos', 'Yahoo, SEC y compañía, con caché.'],
    ['d1', 'Publica el informe', 'Y Mission Control lo dibuja.']] },
  { id: 'robot', name: 'El robot de IBKR', steps: [
    ['robot', 'Se despierta solo', 'Los lunes por la mañana, o cada tarde para la foto.'],
    ['d1', 'Lee su libro', 'Qué cartera toca y qué hizo la última vez.'],
    ['ibkr', 'Opera la cuenta paper', 'Envía las órdenes de la semana o solo mira la cuenta.'],
    ['pages', 'Lo ves en Mission Control', 'La foto queda guardada para el panel.']] },
  { id: 'server', name: 'Encender o apagar el server', steps: [
    ['pages', 'Pulsas en Infraestructura', 'Encender, reiniciar o apagar.'],
    ['apis', 'Se comprueba el permiso', 'Solo tu cuenta puede hacerlo.'],
    ['shelly', 'Para encender, el enchufe', 'Corta y devuelve la corriente; el PC arranca solo.'],
    ['servercesar', 'Para apagar, el agente', 'Recoge la orden en su siguiente aviso, la ejecuta y lo cuenta.']] }
];
