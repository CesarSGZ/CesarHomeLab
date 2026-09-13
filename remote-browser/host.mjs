import {createRequire} from "node:module";
import {readFileSync,mkdirSync} from "node:fs";
import {join} from "node:path";
import {createServer} from "node:http";
import {randomBytes} from "node:crypto";
import {validateInput,shareable,allowedNavigation} from "./protocol.mjs";
import {UploadReceiver} from "./uploads.mjs";
const uploads=new UploadReceiver(async file=>{
 if(!viewing||paused||!status().ready)throw Error("Browser unavailable. Reconnect and try again.");
 const inputs=page.locator('input[type="file"]');
 if(!await inputs.count())throw Error("Open ChatGPT's attachment menu, then try Upload file again.");
 await inputs.first().setInputFiles(file,{timeout:15000});
});

const settingsPath=process.argv[2];
if(!settingsPath)throw Error("A private configuration path is required.");
const settings=JSON.parse(readFileSync(settingsPath,"utf8"));
const require=createRequire(import.meta.url),{chromium}=require(settings.playwrightPath);
const profile=join(settings.dataDirectory,"browser-profile");mkdirSync(profile,{recursive:true});
let browser,page,socket,viewing=false,paused=false,capturing=false,inputChain=Promise.resolve(),stopping=false;
let width=1280,height=850;
const localToken=randomBytes(24).toString("hex");
const status=()=>({type:"status",ready:!!page&&!page.isClosed()&&shareable(page.url()),paused,width,height});
function send(value){if(socket?.readyState===1&&socket.bufferedAmount<1500000)socket.send(typeof value==="object"&&!Buffer.isBuffer(value)?JSON.stringify(value):value)}
async function openBrowser(){
 if(page&&!page.isClosed()){await page.bringToFront();return}
 browser=await chromium.launchPersistentContext(profile,{
  executablePath:settings.browserPath,headless:false,chromiumSandbox:true,
  viewport:{width,height},acceptDownloads:false,permissions:[],
  args:["--no-first-run","--no-default-browser-check","--disable-session-crashed-bubble"]
 });
 page=browser.pages()[0]||await browser.newPage();
 await browser.route("**/*",async route=>{
  const request=route.request(),url=request.url();
  let u;try{u=new URL(url)}catch{return route.abort()}
  if(["file:","ftp:"].includes(u.protocol)||["localhost","127.0.0.1","[::1]"].includes(u.hostname)||/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(u.hostname))return route.abort();
  if(request.isNavigationRequest() && !request.frame().parentFrame() && !allowedNavigation(url,viewing))return route.abort();
  return route.continue();
 });
 browser.on("page",popup=>{if(viewing)popup.close().catch(()=>{})});
 page.on("filechooser",chooser=>chooser.setFiles([]).catch(()=>{}));
 page.on("download",download=>download.cancel().catch(()=>{}));
 page.on("dialog",dialog=>dialog.dismiss().catch(()=>{}));
 browser.on("close",()=>{page=null;browser=null;send(status())});
 await page.goto("https://chatgpt.com/",{waitUntil:"domcontentloaded",timeout:45000}).catch(()=>{});
 send(status());
}
async function handleInput(data){
 const input=validateInput(data);if(!input)return;
 if(input.type==="upload"){
  if(!viewing||paused||!status().ready){uploads.clear();send({type:"upload-result",id:input.id,ok:false,message:"Browser unavailable. Reconnect and try again."});return}
  send(await uploads.receive(input));return;
 }
 if(!viewing||paused||!status().ready)return;
 if(input.type==="resize"){width=input.width;height=input.height;await page.setViewportSize({width,height});send(status());return}
 if(input.type==="home"){await page.goto("https://chatgpt.com/",{waitUntil:"domcontentloaded",timeout:30000});return}
 if(input.type==="pointer"){
  if(input.x>width||input.y>height)return;
  await page.mouse.move(input.x,input.y);
  if(input.action==="down")await page.mouse.down({button:"left"});
  if(input.action==="up")await page.mouse.up({button:"left"});
 }
 if(input.type==="wheel")await page.mouse.wheel(input.dx,input.dy);
 if(input.type==="text")await page.keyboard.insertText(input.text);
 if(input.type==="key")await page.keyboard.press((input.shift?"Shift+":"")+input.key);
}
function connect(){
 if(stopping)return;
 socket=new WebSocket(settings.relayUrl.replace(/^https:/,"wss:")+"/connect",["remote-v1","host."+settings.hostSecret]);
 socket.addEventListener("open",()=>{send(status())});
 socket.addEventListener("message",event=>{
  let data;try{data=JSON.parse(event.data)}catch{return}
  if(data.type==="viewer"){viewing=data.active===true;uploads.clear();send(status());return}
  inputChain=inputChain.then(()=>handleInput(data)).catch(()=>send(status()));
 });
 socket.addEventListener("close",()=>{viewing=false;uploads.clear();if(!stopping)setTimeout(connect,5000)});
 socket.addEventListener("error",()=>{});
}
setInterval(()=>send(status()),10000).unref();
setInterval(async()=>{
 if(!viewing||paused||capturing||!status().ready||socket?.readyState!==1||socket.bufferedAmount>500000)return;
 capturing=true;
 try{const frame=await page.screenshot({type:"jpeg",quality:72,timeout:5000});if(viewing&&!paused&&status().ready)send(frame)}catch{send(status())}finally{capturing=false}
},800).unref();
const html=()=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CesarPC · ChatGPT Remote</title><style>body{background:#0d1922;color:#eef3f7;font:17px/1.7 system-ui;max-width:700px;margin:70px auto;padding:24px}button{padding:15px 20px;border:1px solid #688c9c;background:#213743;color:white;border-radius:9px;margin:8px 8px 0 0;cursor:pointer}p{color:#b1c1cb}small{color:#a5b6c2}</style></head><body><h1>ChatGPT on CesarPC</h1><p>This dedicated browser is the only window shared with your private HomeLab account. Sign in here on CesarPC. Your normal browser profile and desktop are not shared.</p><p id="state"></p><button onclick="act('open')">Open ChatGPT locally</button><button onclick="act('pause')">Pause / resume sharing</button><p>Keep CesarPC awake and your Windows session signed in. Locking or minimising Windows may affect capture; do not sign out. ChatGPT may occasionally require you to sign in again.</p><small>No microphone, file uploads, downloads or system clipboard sharing.</small><script>async function act(action){await fetch('/'+action,{method:'POST',headers:{'x-local-token':'${localToken}'}});refresh()}async function refresh(){const r=await fetch('/status');const s=await r.json();document.getElementById('state').textContent=(s.paused?'Sharing paused. ':s.ready?'ChatGPT window ready. ':'Open ChatGPT and sign in locally. ')+(s.connected?'Cloud connection online.':'Cloud connection reconnecting.')}refresh();setInterval(refresh,3000)</script></body></html>`;
const local=createServer(async(req,res)=>{
 const headers={"cache-control":"no-store","x-frame-options":"DENY","content-security-policy":"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'none'"};
 if(req.headers.host!=="127.0.0.1:"+settings.localPort){res.writeHead(403);return res.end()}
 if(req.method==="GET"&&req.url==="/"){res.writeHead(200,{...headers,"content-type":"text/html; charset=utf-8"});return res.end(html())}
 if(req.method==="GET"&&req.url==="/status"){res.writeHead(200,{...headers,"content-type":"application/json"});return res.end(JSON.stringify({...status(),connected:socket?.readyState===1}))}
 if(req.method==="POST"&&req.headers["x-local-token"]===localToken&&req.headers.origin==="http://127.0.0.1:"+settings.localPort){
  if(req.url==="/pause"){paused=!paused;send(status());res.writeHead(204);return res.end()}
  if(req.url==="/open"){try{await openBrowser();res.writeHead(204)}catch{res.writeHead(503)}return res.end()}
 }
 res.writeHead(403,headers);res.end();
});
local.listen(settings.localPort,"127.0.0.1",()=>{console.log("Local control ready on 127.0.0.1:"+settings.localPort);connect();openBrowser().catch(()=>console.log("Open the local control page to retry browser launch."))});
async function shutdown(){stopping=true;socket?.close();await browser?.close().catch(()=>{});local.close();process.exit(0)}
process.on("SIGINT",shutdown);process.on("SIGTERM",shutdown);
