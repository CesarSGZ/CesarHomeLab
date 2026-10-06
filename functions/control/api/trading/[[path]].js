import {userCan,validCsrf} from '../../../_lib/auth.js';
import {json} from '../../../_lib/http.js';
import {status} from '../../../../trading-worker/v2/cycle.js';
export async function onRequest({request,env,data,params}){
  if(!data.session)return json({ok:false,error:'not_authenticated'},{status:401});
  if(!userCan(data.session.user,'trading:manage'))return json({ok:false,error:'not_authorised'},{status:403});
  if(request.method==='POST'&&!validCsrf(request,data.session))return json({ok:false,error:'invalid_csrf'},{status:403});
  const path='/'+(Array.isArray(params.path)?params.path.join('/'):params.path||'status');
  if(!['/status','/key','/control','/agent','/close','/run','/owner','/meeting'].includes(path))return json({ok:false},{status:404});
  if(path==='/status'){const cached=await env.CONTROL_DB.prepare('SELECT payload FROM trading_status_cache WHERE id=1').first();if(cached)return new Response(cached.payload,{headers:{'content-type':'application/json','cache-control':'no-store'}});}
  if(request.method==='POST'&&['/control','/agent','/close','/run','/owner','/meeting'].includes(path)){const body=await request.text();if(body.length>25000)return json({ok:false,error:'Petición demasiado grande'},{status:413});try{JSON.parse(body||'{}');}catch{return json({ok:false,error:'JSON inválido'},{status:400});}const id=crypto.randomUUID();await env.CONTROL_DB.prepare('INSERT INTO trading_command_queue(id,path,body,created_at) VALUES(?,?,?,?)').bind(id,path,body||'{}',Date.now()).run();return json({ok:true,queued:true,id});}
  if(!env.TRADING_SERVICE)return json({ok:false,error:'Servicio Trading Lab pendiente de despliegue'},{status:503});
  try{const response=await env.TRADING_SERVICE.fetch(new Request('https://trading.internal'+path,{method:request.method,headers:{'content-type':'application/json'},body:request.method==='POST'?await request.text():undefined}));if(path==='/status'&&!response.headers.get('content-type')?.includes('application/json'))throw Error('El servicio devolvió HTTP '+response.status+' sin estado JSON');return response;}
  catch(error){if(path==='/status'){try{const live=await status(env);live.lastError='Incidencia del servicio: '+String(error.message).slice(0,160);live.connections.serviceHealthy=false;return json(live);}catch(readError){return json({ok:false,error:'No se pudo leer el estado: '+String(readError.message).slice(0,160)},{status:503});}}return json({ok:false,error:'Servicio temporalmente no disponible: '+String(error.message).slice(0,160)},{status:503});}
}
