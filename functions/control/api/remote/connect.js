import {userCan} from "../../../_lib/auth.js";
import {json} from "../../../_lib/http.js";
export async function onRequest(context){
 const {request,env,data}=context;
 if(!data.session)return json({ok:false,error:"not_authenticated"},{status:401});
 if(!userCan(data.session.user,"remote:use"))return json({ok:false,error:"not_authorised"},{status:403});
 if(request.method!=="GET"||request.headers.get("upgrade")?.toLowerCase()!=="websocket")return json({ok:false,error:"websocket_required"},{status:426});
 if(request.headers.get("origin")!==new URL(request.url).origin)return json({ok:false,error:"invalid_origin"},{status:403});
 if(!env.REMOTE_RELAY_URL||!env.REMOTE_VIEWER_SECRET)return json({ok:false,error:"remote_not_configured"},{status:503});
 try{
  const upstream=new URL("/connect",env.REMOTE_RELAY_URL);
  if(upstream.protocol!=="https:"||!upstream.hostname.endsWith(".workers.dev"))throw Error("Invalid relay");
  const response=await fetch(upstream,{
   headers:{"upgrade":"websocket","sec-websocket-protocol":"remote-v1","authorization":"Bearer "+env.REMOTE_VIEWER_SECRET,
    "x-viewer-expires":String(Math.min(data.session.expiresAt,Date.now()+300000))}
  });
  return response;
 }catch{return json({ok:false,error:"remote_unavailable"},{status:503})}
}
