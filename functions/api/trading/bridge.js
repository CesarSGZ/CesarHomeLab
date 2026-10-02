import {json} from '../../_lib/http.js';
export async function onRequest({request,env}){
  if(!['GET','POST'].includes(request.method))return json({ok:false},{status:405});
  if(!env.TRADING_SERVICE)return json({ok:false,error:'Servicio pendiente'},{status:503});
  const text=request.method==='POST'?await request.text():undefined;if(text?.length>100000)return json({ok:false},{status:413});
  return env.TRADING_SERVICE.fetch(new Request('https://trading.internal/bridge',{method:request.method,headers:{authorization:request.headers.get('authorization')||'','content-type':'application/json'},body:text}));
}
