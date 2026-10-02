import {authorisedDeveloper,developmentAction} from './development.js';
import {refreshMarket} from './market-data.js';
import {status,load,locked,cycle,storeSecret,secret,validateConfig,log} from './engine.js';
import {id,eligible,sell,day,freshQuote} from './core.js';
import {json} from '../functions/_lib/http.js';
export default {
  async fetch(request,env,ctx){
    const path=new URL(request.url).pathname;
    try{
      if(path==='/development'){if(request.method!=='POST'||!await authorisedDeveloper(request,env))return json({ok:false,error:'No autorizado'},{status:401});const body=await request.json();if(body.action==='deployment-auth'){if(typeof body.config==='string'){if(body.config.length>12000||!body.config.includes('refresh_token'))throw Error('Credencial de despliegue inválida');await storeSecret(env,'deployment_oauth',body.config);return json({ok:true});}return json({ok:true,config:await secret(env,'deployment_oauth')});}let result;await locked(env,async s=>{result=developmentAction(s,body);});return json(result);}
      if(path==='/bridge'||path==='/bridge-token')return json({ok:false,error:'Puente retirado; datos públicos en Cloudflare'},{status:410});
      if(path==='/status'&&request.method==='GET')return json(await status(env));
      if(request.method!=='POST')return json({ok:false,error:'Método no permitido'},{status:405});
      const text=await request.text();if(text.length>25000)return json({ok:false,error:'Petición demasiado grande'},{status:413});const body=text?JSON.parse(text):{};
      if(path==='/key'){const key=String(body.key||'');if(key&&(!key.startsWith('sk-')||key.length<20||key.length>300))throw Error('Formato de clave no válido');await storeSecret(env,'openai',key);return json({ok:true,configured:!!key});}
      if(path==='/advance')throw Error('La demostración sintética está deshabilitada');if(path==='/run'){await cycle(env,{manual:true});return json({ok:true,completed:true});}
      await locked(env,async s=>{
        if(path==='/config'){s.config=validateConfig(body,s.config);log(s,'system','Configuración guardada');}
        else if(path==='/control'){if(typeof body.paused==='boolean')s.paused=body.paused;if(typeof body.automatic==='boolean')s.automatic=body.automatic;log(s,'system',s.paused?'Nuevas entradas pausadas':'Nuevas entradas activadas');}
        else if(path==='/mode'){if(body.mode!=='real')throw Error('Modo inválido');s.mode=body.mode;for(const a of s.agents){a.status=a.paused?'pausado':'esperando';a.task='Esperando próximo ciclo';}log(s,'system',`Modo ${body.mode}: cartera independiente`);}
        else if(path==='/agent'){const a=s.agents.find(a=>a.id===body.id);if(!a||typeof body.paused!=='boolean')throw Error('Agente inválido');a.paused=body.paused;a.status=a.paused?'pausado':'esperando';log(s,a.id,a.paused?'Agente pausado':'Agente activado');}
        else if(path==='/event'){
          if(s.mode!=='real')throw Error('Los eventos verificados se añaden en modo real');const symbol=String(body.symbol||'').toUpperCase();if(!s.real.assets.some(a=>a.symbol===symbol&&!eligible(a,s.config)))throw Error('Símbolo fuera del universo');
          const date=Date.parse(body.date);if(!Number.isFinite(date)||date<=Date.now()||date>Date.now()+s.config.horizonDays*864e5)throw Error('Fecha fuera de la ventana');const source=new URL(body.source);if(source.protocol!=='https:')throw Error('La fuente debe ser HTTPS');if(!body.confirmed||String(body.summary||'').length<50)throw Error('Confirma la fuente y aporta evidencia suficiente');
          const old=s.real.events.find(e=>e.symbol===symbol&&day(Date.parse(e.date))===day(date));const event={id:old?.id||id(symbol,date,body.kind),symbol,date:new Date(date).toISOString(),kind:String(body.kind||'Catalizador').slice(0,80),title:String(body.title||'Catalizador verificado').slice(0,200),summary:String(body.summary).slice(0,12000),source:source.href,confirmed:true,estimated:false,status:'nuevo',plan:null,review:null,reasons:[],createdAt:Date.now()};
          if(old&&s.real.book.orders.some(o=>o.eventId===old.id))throw Error('Este evento ya tiene operaciones; no se puede reabrir');if(old)Object.assign(old,event);else s.real.events.unshift(event);log(s,'scout',`${symbol}: evidencia añadida por el propietario`);
        }else if(path==='/close'){if(s.mode==='real')await refreshMarket(s);const data=s[s.mode],p=data.book.positions.find(p=>p.id===body.id);if(!p)throw Error('Posición no encontrada');const q=data.quotes[p.symbol],t=s.mode==='demo'?data.time:Date.now();const trade=sell(data.book,p,q,s.config,t,'manual');if(!trade)throw Error('No hay precios recientes para cerrar');log(s,'operator',`${p.symbol}: cierre manual simulado`);}
        else throw Error('Acción desconocida');
      });return json({ok:true});
    }catch(e){return json({ok:false,error:e.message==='Ya hay una tarea en ejecución'?e.message:String(e.message).slice(0,200)},{status:400});}
  },
  async scheduled(_event,env,ctx){ctx.waitUntil(cycle(env).catch(()=>{}));}
};
