import {status,load,locked,cycle,storeSecret,secret,validateConfig,log,readBridge} from './engine.js';
import {id,eligible,sell,day,freshQuote} from './core.js';
import {json} from '../functions/_lib/http.js';
const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const equal=(a,b)=>{let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;};
async function bridge(request,env,ctx){
  const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');const expected=await secret(env,'bridge-hash');if(!expected||!equal(await hash(token),expected))return json({ok:false,error:'Puente no autorizado'},{status:401});
  const {state:s}=await load(env);const real=s.real;
  if(request.method==='GET'){
    const symbols=[...new Set([...real.book.positions.map(p=>p.symbol),...real.events.filter(e=>e.confirmed).map(e=>e.symbol),...real.events.map(e=>e.symbol)])].slice(0,40);
    return json({ok:true,symbols:symbols.map(symbol=>{const a=real.assets.find(a=>a.symbol===symbol);return {symbol,exchange:a?.exchange};}),mode:s.mode});
  }
  if(request.method!=='POST')return json({ok:false},{status:405});
  const body=await request.text();if(body.length>100000)return json({ok:false},{status:413});const input=JSON.parse(body);const allowed=new Set([...real.assets.map(a=>a.symbol),...real.book.positions.map(p=>p.symbol)]);const quotes={};const contracts={};
  for(const [symbol,c] of Object.entries(input.contracts||{}).slice(0,50)){if(allowed.has(symbol)&&Number.isSafeInteger(c.conid)&&c.conid>0)contracts[symbol]={conid:c.conid};}
  for(const [symbol,q] of Object.entries(input.quotes||{}).slice(0,50)){if(!allowed.has(symbol))continue;if(!['bid','ask','time','dollarVolume'].every(k=>Number.isFinite(q[k]))||q.time>Date.now()+5000||q.ask<q.bid||q.bid<=0||q.dollarVolume<0)continue;quotes[symbol]={bid:q.bid,ask:q.ask,time:q.time,dollarVolume:q.dollarVolume,realtime:q.realtime===true,source:'IBKR · puente local'};}
  await env.CONTROL_DB.prepare('INSERT INTO trading_bridge(id,payload,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at').bind(JSON.stringify({quotes,contracts,status:String(input.status||'Puente conectado').slice(0,160)}),Date.now()).run();
  ctx.waitUntil(cycle(env,{quotesOnly:true}).catch(()=>{}));return json({ok:true,accepted:Object.keys(quotes).length});
}
export default {
  async fetch(request,env,ctx){
    const path=new URL(request.url).pathname;
    try{
      if(path==='/bridge')return await bridge(request,env,ctx);
      if(path==='/status'&&request.method==='GET')return json(await status(env));
      if(request.method!=='POST')return json({ok:false,error:'Método no permitido'},{status:405});
      const text=await request.text();if(text.length>25000)return json({ok:false,error:'Petición demasiado grande'},{status:413});const body=text?JSON.parse(text):{};
      if(path==='/key'){const key=String(body.key||'');if(key&&(!key.startsWith('sk-')||key.length<20||key.length>300))throw Error('Formato de clave no válido');await storeSecret(env,'openai',key);return json({ok:true,configured:!!key});}
      if(path==='/bridge-token'){const token=crypto.randomUUID()+crypto.randomUUID();await storeSecret(env,'bridge-hash',await hash(token));return json({ok:true,token});}
      if(path==='/run'||path==='/advance'){if(path==='/advance'&&(await status(env)).mode!=='demo')throw Error('El avance de tiempo solo funciona en demo');await cycle(env,{manual:true,advance:path==='/advance'});return json({ok:true,completed:true});}
      await locked(env,async s=>{
        if(path==='/config'){s.config=validateConfig(body,s.config);log(s,'system','Configuración guardada');}
        else if(path==='/control'){if(typeof body.paused==='boolean')s.paused=body.paused;if(typeof body.automatic==='boolean')s.automatic=body.automatic;log(s,'system',s.paused?'Nuevas entradas pausadas':'Nuevas entradas activadas');}
        else if(path==='/mode'){if(!['demo','real'].includes(body.mode))throw Error('Modo inválido');s.mode=body.mode;for(const a of s.agents){a.status=a.paused?'pausado':'esperando';a.task='Esperando próximo ciclo';}log(s,'system',`Modo ${body.mode}: cartera independiente`);}
        else if(path==='/agent'){const a=s.agents.find(a=>a.id===body.id);if(!a||typeof body.paused!=='boolean')throw Error('Agente inválido');a.paused=body.paused;a.status=a.paused?'pausado':'esperando';log(s,a.id,a.paused?'Agente pausado':'Agente activado');}
        else if(path==='/event'){
          if(s.mode!=='real')throw Error('Los eventos verificados se añaden en modo real');const symbol=String(body.symbol||'').toUpperCase();if(!s.real.assets.some(a=>a.symbol===symbol&&!eligible(a,s.config)))throw Error('Símbolo fuera del universo');
          const date=Date.parse(body.date);if(!Number.isFinite(date)||date<=Date.now()||date>Date.now()+s.config.horizonDays*864e5)throw Error('Fecha fuera de la ventana');const source=new URL(body.source);if(source.protocol!=='https:')throw Error('La fuente debe ser HTTPS');if(!body.confirmed||String(body.summary||'').length<50)throw Error('Confirma la fuente y aporta evidencia suficiente');
          const old=s.real.events.find(e=>e.symbol===symbol&&day(Date.parse(e.date))===day(date));const event={id:old?.id||id(symbol,date,body.kind),symbol,date:new Date(date).toISOString(),kind:String(body.kind||'Catalizador').slice(0,80),title:String(body.title||'Catalizador verificado').slice(0,200),summary:String(body.summary).slice(0,12000),source:source.href,confirmed:true,estimated:false,status:'nuevo',plan:null,review:null,reasons:[],createdAt:Date.now()};
          if(old&&s.real.book.orders.some(o=>o.eventId===old.id))throw Error('Este evento ya tiene operaciones; no se puede reabrir');if(old)Object.assign(old,event);else s.real.events.unshift(event);log(s,'scout',`${symbol}: evidencia añadida por el propietario`);
        }else if(path==='/close'){if(s.mode==='real')await readBridge(env,s);const data=s[s.mode],p=data.book.positions.find(p=>p.id===body.id);if(!p)throw Error('Posición no encontrada');const q=data.quotes[p.symbol],t=s.mode==='demo'?data.time:Date.now();const trade=sell(data.book,p,q,s.config,t,'manual');if(!trade)throw Error('No hay precios recientes para cerrar');log(s,'operator',`${p.symbol}: cierre manual simulado`);}
        else throw Error('Acción desconocida');
      });return json({ok:true});
    }catch(e){return json({ok:false,error:e.message==='Ya hay una tarea en ejecución'?e.message:String(e.message).slice(0,200)},{status:400});}
  },
  async scheduled(_event,env,ctx){ctx.waitUntil(cycle(env).catch(()=>{}));}
};
