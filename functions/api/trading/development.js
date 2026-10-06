import {authorisedDeveloper} from '../../../trading-worker/development.js';
import {auditLiveOffice} from '../../../trading-worker/live-audit.js';
import {publicDataUrl} from '../../../trading-worker/public-data-proxy.js';
import {runtimeDatabase,readRuntimeBody} from '../../../trading-worker/runtime-db.js';
// Pages' D1 binding also supports infrastructure operations when a deployment
// token cannot access D1. Authenticate before reading a potentially large body.
export async function onRequest({request,env}){
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 try{
  if(!await authorisedDeveloper(request,env))return new Response('Unauthorized',{status:401});
  const {body,bytes}=await readRuntimeBody(request),action=body?.action;
  if(action==='runtime-db')return Response.json(await runtimeDatabase(env,body),{headers:{'cache-control':'no-store'}});
  if(bytes>20000)return new Response('Too large',{status:413});
  if(action==='data'){
   let url=publicDataUrl(body.url);
   for(let i=0;i<4;i++){
    const response=await fetch(url.href,{redirect:'manual',headers:{'Accept':'application/json,application/rss+xml,application/atom+xml','User-Agent':url.hostname.endsWith('sec.gov')?'CesarHomeLab Research https://cesar-solla.pages.dev/':'Mozilla/5.0'},signal:AbortSignal.timeout(20000)});
    if(![301,302,303,307,308].includes(response.status))return response;
    url=publicDataUrl(new URL(response.headers.get('location'),url).href);
   }
   return new Response('Too many redirects',{status:502});
  }
  if(action==='audit')return Response.json(await auditLiveOffice(env),{headers:{'cache-control':'no-store'}});
  if(!env.TRADING_SERVICE)return new Response('Unavailable',{status:503});
  return env.TRADING_SERVICE.fetch(new Request('https://internal/'+(['runtime-key','data'].includes(action)?action:'development'),{method:'POST',headers:{'content-type':'application/json',authorization:request.headers.get('authorization')},body:JSON.stringify(body)}));
 }catch(error){return Response.json({ok:false,success:false,error:String(error.message).slice(0,200)},{status:error.status||503,headers:{'cache-control':'no-store'}});}
}
