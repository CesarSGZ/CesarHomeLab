import {userCan,validCsrf} from '../../../_lib/auth.js';
import {json} from '../../../_lib/http.js';
export async function onRequest({request,env,data,params}){
  if(!data.session)return json({ok:false,error:'not_authenticated'},{status:401});
  if(!userCan(data.session.user,'trading:manage'))return json({ok:false,error:'not_authorised'},{status:403});
  if(request.method==='POST'&&!validCsrf(request,data.session))return json({ok:false,error:'invalid_csrf'},{status:403});
  const path='/'+(Array.isArray(params.path)?params.path.join('/'):params.path||'status');
  if(!['/status','/key','/bridge-token','/config','/control','/mode','/agent','/event','/close','/run','/advance'].includes(path))return json({ok:false},{status:404});
  if(!env.TRADING_SERVICE)return json({ok:false,error:'Servicio Trading Lab pendiente de despliegue'},{status:503});
  return env.TRADING_SERVICE.fetch(new Request('https://trading.internal'+path,{method:request.method,headers:{'content-type':'application/json'},body:request.method==='POST'?await request.text():undefined}));
}
