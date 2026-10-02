import {json} from '../../_lib/http.js';
export async function onRequest(){
  return json({ok:false,error:'Puente local retirado. Las cotizaciones se obtienen en Cloudflare.'},{status:410});
}
