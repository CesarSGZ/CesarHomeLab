import {validateInput,equalSecret} from "../protocol.mjs";
const denied=()=>new Response("Not authorised",{status:401,headers:{"cache-control":"no-store"}});
export default {
 async fetch(request,env){
  if(new URL(request.url).pathname!=="/connect" || request.headers.get("upgrade")?.toLowerCase()!=="websocket")return new Response("Not found",{status:404});
  const hostToken=(request.headers.get("sec-websocket-protocol")||"").split(",").map(s=>s.trim()).find(s=>s.startsWith("host."))?.slice(5);
  const isHost=equalSecret(hostToken,env.HOST_SECRET);
  const isViewer=equalSecret(request.headers.get("authorization")?.replace(/^Bearer /,""),env.VIEWER_SECRET);
  if(!isHost&&!isViewer)return denied();
  const headers=new Headers({"upgrade":"websocket","x-role":isHost?"host":"viewer"});
  if(isViewer&&!isHost){
   const expires=Number(request.headers.get("x-viewer-expires"));
   if(!Number.isFinite(expires)||expires<=Date.now())return denied();
   headers.set("x-expires",String(Math.min(expires,Date.now()+300000)));
  }
  return env.BROWSER_ROOM.get(env.BROWSER_ROOM.idFromName("CesarPC")).fetch(new Request("https://room/connect",{headers}));
 }
};
export class BrowserRoom {
 constructor(ctx){this.ctx=ctx;}
 sockets(role){return this.ctx.getWebSockets(role).filter(ws=>ws.readyState===1);}
 send(role,message){
  for(const ws of this.sockets(role)){
   const info=ws.deserializeAttachment();
   if(role==="viewer"&&info.expires<=Date.now()){ws.close(4001,"Renew HomeLab session");continue}
   try{ws.send(message)}catch{}
  }
 }
 async fetch(request){
  const role=request.headers.get("x-role");
  if(!["host","viewer"].includes(role))return denied();
  for(const previous of this.sockets(role))previous.close(4002,"Connected from another window");
  const pair=new WebSocketPair(),client=pair[0],server=pair[1];
  this.ctx.acceptWebSocket(server,[role]);
  server.serializeAttachment({role,expires:role==="viewer"?Number(request.headers.get("x-expires")):0,window:Date.now(),count:0});
  server.send(JSON.stringify({type:"connected",hostOnline:this.sockets("host").length>0}));
  this.send("host",JSON.stringify({type:"viewer",active:this.sockets("viewer").length>0}));
  return new Response(null,{status:101,webSocket:client,headers:{"sec-websocket-protocol":"remote-v1"}});
 }
 webSocketMessage(ws,message){
  const info=ws.deserializeAttachment();if(!info)return ws.close(1008,"Invalid session");
  if(info.role==="viewer"&&info.expires<=Date.now())return ws.close(4001,"Renew HomeLab session");
  const size=typeof message==="string"?message.length:message.byteLength;
  if(size>(info.role==="host"?1200000:50000))return ws.close(1009,"Message too large");
  const now=Date.now();if(now-info.window>1000){info.window=now;info.count=0}
  info.count++;ws.serializeAttachment(info);
  if(info.count>(info.role==="host"?12:80))return ws.close(1008,"Rate limit");
  if(info.role==="host"){
   if(typeof message!=="string")return this.send("viewer",message);
   let data;try{data=JSON.parse(message)}catch{return}
   if(data.type==="status")this.send("viewer",JSON.stringify({type:"status",ready:data.ready===true,paused:data.paused===true,width:data.width,height:data.height}));
   return;
  }
  let data;try{data=JSON.parse(message)}catch{return}
  const input=validateInput(data);
  if(input)this.send("host",JSON.stringify(input));
 }
 webSocketClose(ws,code,reason){
  try{ws.close(code,reason)}catch{}
  const info=ws.deserializeAttachment();
  if(info?.role==="host")this.send("viewer",JSON.stringify({type:"offline"}));
  if(info?.role==="viewer")this.send("host",JSON.stringify({type:"viewer",active:this.sockets("viewer").length>0}));
 }
 webSocketError(ws){try{ws.close(1011,"Connection error")}catch{}}
}
