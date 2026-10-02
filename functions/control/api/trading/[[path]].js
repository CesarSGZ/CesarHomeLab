import {userCan,validCsrf} from '../../../_lib/auth.js';
import {json} from '../../../_lib/http.js';
import {status} from '../../../../trading-worker/engine.js';
export async function onRequest({request,env,data,params}){
  if(!data.session)return json({ok:false,error:'not_authenticated'},{status:401});
  if(!userCan(data.session.user,'trading:manage'))return json({ok:false,error:'not_authorised'},{status:403});
  if(request.method==='POST'&&!validCsrf(request,data.session))return json({ok:false,error:'invalid_csrf'},{status:403});
  const path='/'+(Array.isArray(params.path)?params.path.join('/'):params.path||'status');
  if(!['/status','/key','/bridge-token','/config','/control','/mode','/agent','/event','/close','/run','/advance'].includes(path))return json({ok:false},{status:404});
  if(!env.TRADING_SERVICE)return json({ok:false,error:'Servicio Trading Lab pendiente de despliegue'},{status:503});
  try{const response=await env.TRADING_SERVICE.fetch(new Request('https://trading.internal'+path,{method:request.method,headers:{'content-type':'application/json'},body:request.method==='POST'?await request.text():undefined}));if(path==='/status'&&!response.headers.get('content-type')?.includes('application/json'))throw Error('El servicio devolvió HTTP '+response.status+' sin estado JSON');return response;}
  catch(error){if(path==='/status'){try{const live=await status(env);live.lastError='Incidencia del servicio: '+String(error.message).slice(0,160);live.connections.serviceHealthy=false;return json(live);}catch(readError){return json({ok:false,error:'No se pudo leer el estado: '+String(readError.message).slice(0,160)},{status:503});}}return json({ok:false,error:'Servicio temporalmente no disponible: '+String(error.message).slice(0,160)},{status:503});}
}
