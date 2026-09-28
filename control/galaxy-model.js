// Shared by the deployment snapshot, authenticated endpoint, and visual explorer.
export const REPOSITORY = 'CesarSGZ/CesarHomeLab';
export const BRANCH = 'main';
export const RETIRED_PATH = /(^|\/)(ebay|bigbuy|marketplace|pdf-tools|chatgpt-remote|remote-browser)([\/.-]|$)|^migrations\/000[3-7]_|^constellation\.css$/i;
export function activeFiles(files) {
  return [...new Set(files.map(file => typeof file === 'string' ? file : file.path))]
    .filter(path => path && !RETIRED_PATH.test(path)).sort();
}
export const SYSTEMS = [
  {id:'source',number:'01',name:'GitHub',tag:'SOURCE OF TRUTH',colour:'#bba8f1',icon:'git',x:15,y:16,
    summary:'The blueprint. Every change starts here.',
    explanation:'CesarHomeLab stores the website code, server-agent scripts and deployment configuration. The main branch is the version used for production. GitHub stores the instructions; it does not run the Minecraft server.',
    input:'Code changes committed to main.',output:'Versioned source code for the deployment workflow.',
    matches:path=>path.startsWith('.github/')||path==='README.md'||path.startsWith('docs/')},
  {id:'deploy',number:'02',name:'GitHub Actions',tag:'AUTOMATIC DEPLOYMENT',colour:'#bba8f1',icon:'rocket',x:15,y:43,
    summary:'Turns a saved change into a published website.',
    explanation:'The deploy workflow checks out main, builds the Galaxy snapshot, and uses Wrangler to upload the site and its Functions to Cloudflare Pages. It runs on pushes and on the configured schedule. A successful GitHub workflow is deployment evidence, not a health check for every service.',
    input:'A push, a scheduled run, or a manual workflow run.',output:'A new Cloudflare Pages deployment.',
    matches:path=>path.startsWith('.github/workflows/')||path.startsWith('scripts/')||path==='wrangler.jsonc'||path==='.assetsignore'},
  {id:'edge',number:'03',name:'Cloudflare Pages',tag:'THE PUBLIC FRONT DOOR',colour:'#83d7ed',icon:'cloud',x:46,y:30,
    summary:'One address. The public website and private portal.',
    explanation:'cesar-solla.pages.dev serves the portfolio and Mission Control. Static HTML, styles, JavaScript and images are delivered here; requests under /control/ and /api/agent/ are routed through Pages Functions. Public browsing does not require CesarPC to be switched on.',
    input:'An HTTPS request from a visitor’s browser.',output:'Website assets or a request handled by a Function.',
    matches:path=>['_routes.json','_headers','wrangler.jsonc'].includes(path)},
  {id:'portfolio',number:'04',name:'Public portfolio',tag:'OPEN TO EVERYONE',colour:'#d5e99a',icon:'person',x:81,y:13,
    summary:'The CV, trajectory and interactive capabilities.',
    explanation:'The public page runs in the visitor’s browser. It presents the CV, the three capability disciplines and credentials. Career durations are calculated from the current date; the 3D gallery loads only when it approaches the screen.',
    input:'Public HTML, CSS, JavaScript and local artwork.',output:'An interactive CV, without a login.',
    matches:path=>!path.includes('/')&&/\.(html|css|js)$/.test(path)||path.startsWith('assets/')},
  {id:'portal',number:'05',name:'Mission Control',tag:'PRIVATE WORKSPACE',colour:'#d5e99a',icon:'dashboard',x:81,y:43,
    summary:'A personal workspace with user-specific access.',
    explanation:'Mission Control is the authenticated interface. The session determines which sections each user sees. CesarVapor can access GitHub Galaxy, Infrastructure and Thermal Lab; SuperSanti86 has the shared Minecraft controls. Thermal Lab uses the project’s model and evidence assets, not a live hardware sensor feed.',
    input:'A valid user session and its allowed capabilities.',output:'The sections and read-only information available to that user.',
    matches:path=>path.startsWith('control/')&&!path.startsWith('control/vendor/')&&!path.startsWith('control/data/')},
  {id:'api',number:'06',name:'Pages Functions',tag:'PERMISSIONS & LOGIC',colour:'#83d7ed',icon:'code',x:49,y:64,
    summary:'Checks access before doing anything sensitive.',
    explanation:'Server-side Functions validate sessions and permissions. They handle sign-in, read server status, queue authorised restart requests and serve the read-only GitHub snapshot. A hidden button is not a security boundary: the API checks permission again.',
    input:'Authenticated browser requests or authenticated agent messages.',output:'Validated responses and controlled database updates.',
    matches:path=>path.startsWith('functions/')},
  {id:'database',number:'07',name:'Cloudflare D1',tag:'SHARED APPLICATION STATE',colour:'#83d7ed',icon:'database',x:81,y:82,
    summary:'Remembers sessions, server signals and queued commands.',
    explanation:'D1 is the database used by the Functions. The active application stores users, expiring sessions, agent status and a queue of Minecraft commands. This node describes the storage architecture; Galaxy does not read or expose database contents, passwords or tokens.',
    input:'Validated reads and writes from Pages Functions.',output:'Persistent application state and queued commands.',
    matches:path=>/^migrations\/000[12]_/.test(path)||path==='wrangler.jsonc'},
  {id:'server',number:'08',name:'ServerCesar',tag:'MINECRAFT EXECUTION',colour:'#efbe8c',icon:'server',x:15,y:82,
    summary:'The machine that actually runs Minecraft.',
    explanation:'The PowerShell agent on ServerCesar contacts Cloudflare using outbound HTTPS. It reports state, polls for an authorised restart command, executes the local restart script and reports the result. Galaxy only illustrates this flow: exploring this node never restarts anything.',
    input:'A restricted command obtained by the authenticated agent.',output:'Minecraft status and command completion sent back to Cloudflare.',
    matches:path=>path.startsWith('server-agent/')}
];
export const CONNECTIONS = [
  {from:'source',to:'deploy',label:'push to main'},
  {from:'deploy',to:'edge',label:'deploy with Wrangler'},
  {from:'edge',to:'portfolio',label:'public assets'},
  {from:'edge',to:'portal',label:'protected route'},
  {from:'portal',to:'api',label:'session + request'},
  {from:'api',to:'database',label:'read / write state'},
  {from:'server',to:'api',label:'outbound HTTPS polling'}
];
export const JOURNEYS = [
  {id:'publish',label:'Publish a change',description:'From a commit to the page a visitor sees.',steps:[
    ['source','Save the change','A change is committed to main. The source now has a new version.'],
    ['deploy','Build and deploy','GitHub Actions prepares the snapshot and uploads the website with Wrangler.'],
    ['edge','Serve the new version','Cloudflare Pages receives the deployment and serves it at the usual address.'],
    ['portfolio','See it in the browser','The visitor loads the updated portfolio. Mission Control uses the same deployment.']]},
  {id:'visit',label:'Open Mission Control',description:'Why sign-in and permissions are separate checks.',steps:[
    ['edge','Arrive at the front door','The browser asks Cloudflare for /control/.'],
    ['api','Check the session','The middleware validates the session before serving the protected page.'],
    ['database','Read session state','D1 provides the session and user record; capabilities are assigned by the application.'],
    ['portal','Show the right workspace','The portal shows the permitted sections. Sensitive API requests are checked again.']]},
  {id:'restart',label:'Understand a restart',description:'An explanation only. No commands will be sent.',steps:[
    ['portal','Request an action','An authorised operator can ask for a restart in Infrastructure. This tour does not send that request.'],
    ['api','Validate the request','The API checks the session, restart capability and request protections.'],
    ['database','Queue the command','The approved command is stored for the server agent to collect.'],
    ['server','Execute on ServerCesar','The agent polls over HTTPS, runs the local restart script and reports completion.'],
    ['api','Report the result','The status endpoint supplies the latest agent signal to Infrastructure.']]}
];
