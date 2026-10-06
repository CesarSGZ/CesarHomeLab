import {runtimeDatabase,readRuntimeBody} from './runtime-db.js';
import {auditLiveOffice} from './live-audit.js';
import {publicDataUrl} from './public-data-proxy.js';
import {authorisedDeveloper,developmentAction} from './development.js';
import {load,locked,storeSecret,secret,validateConfig,log} from './engine.js';
import {status,cycle,ownerCommand,processOrders,refreshQuotes} from './v2/cycle.js';
import {initCompany} from './v2/company.js';
import {id,eligible,day} from './core.js';
import {json} from '../functions/_lib/http.js';
export default {
  async fetch(request,env,ctx){
    const path=new URL(request.url).pathname;
    try{
      if(path==='/runtime-db'){
        if(request.method!=='POST')return json({ok:false,error:'Método no permitido'},{status:405});
        try{
          if(!await authorisedDeveloper(request,env))return json({ok:false,error:'No autorizado'},{status:401});
          const {body}=await readRuntimeBody(request);
          return json(await runtimeDatabase(env,body));
        }catch(error){return json({ok:false,success:false,error:String(error.message).slice(0,200)},{status:error.status||503});}
      }
      if(path==='/development'){if(request.method!=='POST'||!await authorisedDeveloper(request,env))return json({ok:false,error:'No autorizado'},{status:401});const body=await request.json();if(body.action==='audit')return json(await auditLiveOffice(env));if(body.action==='deployment-auth'){if(typeof body.config==='string'){if(body.config.length>12000||!body.config.includes('refresh_token'))throw Error('Credencial de despliegue inválida');await storeSecret(env,'deployment_oauth',body.config);return json({ok:true});}return json({ok:true,config:await secret(env,'deployment_oauth')});}if(body.action==='lease'){const lock=await env.CONTROL_DB.prepare('SELECT lock_until FROM trading_state WHERE id=1').first();if(lock?.lock_until>Date.now())return json({ok:true,job:null,busy:true});}let result;await locked(env,async s=>{result=developmentAction(s,body);});return json(result);}
      if(path==='/bridge'||path==='/bridge-token')return json({ok:false,error:'Puente retirado; datos públicos en Cloudflare'},{status:410});
      if(path==='/runtime-key'){if(!await authorisedDeveloper(request,env))return json({ok:false},{status:401});return json({ok:true,key:await secret(env,'openai')});}
      if(path==='/data'){if(!await authorisedDeveloper(request,env))return json({ok:false},{status:401});const url=publicDataUrl((await request.json()).url);return fetch(url,{redirect:'error',headers:{'Accept':'application/json, application/xml, text/xml, */*','User-Agent':url.hostname.endsWith('sec.gov')?'Cesar Agent Office research https://cesar-solla.pages.dev':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)});}
      if(path==='/status'&&request.method==='GET'){const cached=await env.CONTROL_DB.prepare('SELECT payload FROM trading_status_cache WHERE id=1').first();return cached?new Response(cached.payload,{headers:{'content-type':'application/json','cache-control':'no-store'}}):json(await status(env));}
      if(request.method!=='POST')return json({ok:false,error:'Método no permitido'},{status:405});
      const text=await request.text();if(text.length>25000)return json({ok:false,error:'Petición demasiado grande'},{status:413});const body=text?JSON.parse(text):{};
      if(path==='/key'){const key=String(body.key||'');if(key&&(!key.startsWith('sk-')||key.length<20||key.length>300))throw Error('Formato de clave no válido');await storeSecret(env,'openai',key);return json({ok:true,configured:!!key});}
      if(path==='/advance')throw Error('La demostración sintética está deshabilitada');if(path==='/run'){await cycle(env,{manual:true});return json({ok:true,completed:true});}
      await locked(env,async s=>{
        if(path==='/config'){s.config=validateConfig(body,s.config);log(s,'system','Configuración guardada');}
        else if(path==='/control'){if(typeof body.paused==='boolean')s.paused=body.paused;if(typeof body.automatic==='boolean')s.automatic=body.automatic;log(s,'system',s.paused?'Nuevas entradas pausadas':'Nuevas entradas activadas');}
        else if(path==='/mode'){if(body.mode!=='real')throw Error('Modo inválido');s.mode=body.mode;for(const a of s.agents){a.status=a.paused?'pausado':'esperando';a.task='Esperando próximo ciclo';}log(s,'system',`Modo ${body.mode}: cartera independiente`);}
        else if(path==='/agent'){const a=s.agents.find(a=>a.id===body.id);if(!a||typeof body.paused!=='boolean')throw Error('Agente inválido');a.paused=body.paused;a.status=a.paused?'pausado':'esperando';initCompany(s).agents[a.id].paused=body.paused;log(s,a.id,a.paused?'Agente pausado':'Agente activado');}
        else if(path==='/owner'||path==='/meeting'){ownerCommand(s,path,body);log(s,'boss',path==='/owner'?'Mensaje de César al equipo':'César convoca reunión');}
        else if(path==='/event'){
          if(s.mode!=='real')throw Error('Los eventos verificados se añaden en modo real');const symbol=String(body.symbol||'').toUpperCase();if(!s.real.assets.some(a=>a.symbol===symbol&&!eligible(a,s.config)))throw Error('Símbolo fuera del universo');
          const date=Date.parse(body.date);if(!Number.isFinite(date)||date<=Date.now()||date>Date.now()+s.config.horizonDays*864e5)throw Error('Fecha fuera de la ventana');const source=new URL(body.source);if(source.protocol!=='https:')throw Error('La fuente debe ser HTTPS');if(!body.confirmed||String(body.summary||'').length<50)throw Error('Confirma la fuente y aporta evidencia suficiente');
          const old=s.real.events.find(e=>e.symbol===symbol&&day(Date.parse(e.date))===day(date));const event={id:old?.id||id(symbol,date,body.kind),symbol,date:new Date(date).toISOString(),kind:String(body.kind||'Catalizador').slice(0,80),title:String(body.title||'Catalizador verificado').slice(0,200),summary:String(body.summary).slice(0,12000),source:source.href,confirmed:true,estimated:false,status:'nuevo',plan:null,review:null,reasons:[],createdAt:Date.now()};
          if(old&&s.real.book.orders.some(o=>o.eventId===old.id))throw Error('Este evento ya tiene operaciones; no se puede reabrir');if(old)Object.assign(old,event);else s.real.events.unshift(event);log(s,'scout',`${symbol}: evidencia añadida por el propietario`);
        }else if(path==='/close'){const v2=initCompany(s),p=s.real.book.positions.find(p=>p.id===body.id);if(!p)throw Error('Posición no encontrada');await refreshQuotes(s,[p.symbol]);if(!v2.orders.some(o=>o.side==='sell'&&o.symbol===p.symbol))v2.orders.push({id:'o'+(++v2.seq),side:'sell',symbol:p.symbol,by:'cesar',at:Date.now(),expiresAt:Date.now()+30*3600e3,said:'Cierre ordenado por César'});processOrders(s);log(s,'boss',`${p.symbol}: César ordena cerrar`);}
        else throw Error('Acción desconocida');
      });return json({ok:true});
    }catch(e){return json({ok:false,error:e.message==='Ya hay una tarea en ejecución'?e.message:String(e.message).slice(0,200)},{status:400});}
  },
  async scheduled(){/* Cloud computation is scheduled by the isolated GitHub runner. */}
};
