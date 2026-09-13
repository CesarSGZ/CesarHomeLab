import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateInput,shareable,allowedNavigation,equalSecret} from "../remote-browser/protocol.mjs";
import relay,{BrowserRoom} from "../remote-browser/worker/index.mjs";
import {onRequest} from "../functions/control/api/remote/connect.js";
import {accessForUser} from "../functions/_lib/auth.js";
test("only CesarVapor has remote access; Minecraft permissions remain unchanged",()=>{
 assert(accessForUser({username:"CesarVapor"}).capabilities.includes("remote:use"));
 assert(!accessForUser({username:"SuperSanti86"}).capabilities.includes("remote:use"));
 assert(accessForUser({username:"SuperSanti86"}).capabilities.includes("minecraft:restart"));
 assert(!accessForUser({username:"other"}).capabilities.includes("remote:use"));
});
test("input allowlist rejects arbitrary browser, URL, file and OS commands",()=>{
 for(const input of [null,{}, {type:"eval",script:"alert(1)"},{type:"key",key:"F12"},{type:"key",key:"Control+L"},{type:"navigate",url:"file:///C:/"},{type:"pointer",action:"rightClick",x:5,y:5},{type:"resize",width:100000,height:900},{type:"text",text:"x".repeat(12001)}])assert.equal(validateInput(input),null);
 assert.deepEqual(validateInput({type:"text",text:"Hola",evil:"ignored"}),{type:"text",text:"Hola"});
 assert.deepEqual(validateInput({type:"key",key:"Enter",shift:false,ctrl:true}),{type:"key",key:"Enter",shift:false});
 assert(validateInput({type:"pointer",action:"down",x:120,y:90}));
 assert(validateInput({type:"resize",width:390,height:700}));
});
test("only ChatGPT is shared; authentication navigation is local-only",()=>{
 assert(shareable("https://chatgpt.com/c/123"));
 for(const url of ["http://chatgpt.com/","https://chatgpt.com.evil.test/","file:///C:/secret","https://auth.openai.com/","https://chatgpt.com/auth/login"])assert(!shareable(url));
 assert(allowedNavigation("https://auth.openai.com/",false));
 assert(!allowedNavigation("https://auth.openai.com/",true));
 assert(!allowedNavigation("https://evil.test/",false));
});
test("secret matching fails closed",()=>{
 assert(!equalSecret(undefined,undefined));assert(!equalSecret("",""));assert(!equalSecret("a","a"));
 assert(equalSecret("a".repeat(64),"a".repeat(64)));assert(!equalSecret("a".repeat(64),"b".repeat(64)));
});
function ctx(user="CesarVapor",origin="https://site.test"){
 return {request:new Request("https://site.test/control/api/remote/connect",{headers:{upgrade:"websocket",origin}}),
 data:{session:user?{user:{username:user},expiresAt:Date.now()+3600000}:null},
 env:{REMOTE_RELAY_URL:"https://example.workers.dev",REMOTE_VIEWER_SECRET:"test-secret"}};
}
test("portal requires authentication and exact origin; cannot target an arbitrary host",async()=>{
 assert.equal((await onRequest(ctx(null))).status,401);
 assert.equal((await onRequest(ctx("SuperSanti86"))).status,403);
 assert.equal((await onRequest(ctx("CesarVapor","https://evil.test"))).status,403);
 const invalid=ctx();invalid.env.REMOTE_RELAY_URL="https://attacker.test";
 assert.equal((await onRequest(invalid)).status,503);
});
test("portal sends a bounded lease and no user cookies to the relay",async()=>{
 const old=globalThis.fetch;
 try{
  globalThis.fetch=async(url,options)=>{
   assert.equal(url.toString(),"https://example.workers.dev/connect");
   assert.equal(options.headers.authorization,"Bearer test-secret");
   assert.equal(options.headers.cookie,undefined);
   assert(Number(options.headers["x-viewer-expires"])<=Date.now()+300000);
   return new Response("test relay");
  };
  assert.equal(await (await onRequest(ctx())).text(),"test relay");
 }finally{globalThis.fetch=old}
});
test("direct public relay access is rejected without secrets",async()=>{
 assert.equal((await relay.fetch(new Request("https://relay.test/connect",{headers:{upgrade:"websocket"}}),{})).status,401);
 assert.equal((await relay.fetch(new Request("https://relay.test/connect",{headers:{upgrade:"websocket","sec-websocket-protocol":"remote-v1, host.invalid"}}),{HOST_SECRET:"x".repeat(64)})).status,401);
 assert.equal((await relay.fetch(new Request("https://relay.test/"),{})).status,404);
});
test("relay drops invalid input and expires viewers before sending frames",()=>{
 const output=[];
 const host={readyState:1,send:x=>output.push(x)};
 const viewer={readyState:1,deserializeAttachment:()=>({role:"viewer",expires:Date.now()-1}),close:code=>output.push(code)};
 const room=new BrowserRoom({getWebSockets:role=>role==="host"?[host]:[viewer]});
 room.send("viewer",new Uint8Array([1,2]).buffer);assert.deepEqual(output,[4001]);
});
test("portal has all required remote controls and no API-key form",()=>{
 const html=readFileSync(new URL("../control/index.html",import.meta.url),"utf8");
 const js=readFileSync(new URL("../control/chat.js",import.meta.url),"utf8");
 for(const match of js.matchAll(/el\("([^"]+)"\)/g))assert(html.includes('id="'+match[1]+'"'),"Missing "+match[1]);
 assert(!html.includes('id="chat-api-key"'));
 assert(!js.includes("localStorage"));assert(!js.includes("innerHTML"));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length);
});
