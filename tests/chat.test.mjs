import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { onRequest as config } from "../functions/control/api/chat/config.js";
import { onRequest as conversations } from "../functions/control/api/chat/conversations.js";
import { onRequest as message } from "../functions/control/api/chat/message.js";
import { accessForUser } from "../functions/_lib/auth.js";
import { contextMessages, responseText } from "../functions/_lib/chat.js";
import { encryptSecret, decryptSecret } from "../functions/_lib/crypto-store.js";

function database() {
  const sqlite=new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys=ON");
  sqlite.exec(readFileSync(new URL("../migrations/0007_private_chat.sql",import.meta.url),"utf8"));
  // The deploy workflow may apply this migration repeatedly.
  sqlite.exec(readFileSync(new URL("../migrations/0007_private_chat.sql",import.meta.url),"utf8"));
  const db={
    prepare(sql){let args=[];return {
      bind(...values){args=values;return this},
      async first(){return sqlite.prepare(sql).get(...args)||null},
      async all(){return {results:sqlite.prepare(sql).all(...args)}},
      async run(){const out=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(out.changes)}}}
    }},
    async batch(statements){
      sqlite.exec("BEGIN");
      try{const results=[];for(const statement of statements)results.push(await statement.run());sqlite.exec("COMMIT");return results}
      catch(error){sqlite.exec("ROLLBACK");throw error}
    }
  };
  return {db,sqlite};
}
function context(db,path,method="GET",body,username="CesarVapor",headers={}){
  return {
    request:new Request("https://example.test/control/api/chat/"+path,{method,headers:{"content-type":"application/json","x-csrf-token":"test-csrf",...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})}),
    data:{session:username?{user:{username},csrfToken:"test-csrf"}:null},
    env:{CONTROL_DB:db,TOKEN_ENCRYPTION_SECRET:"test-only-encryption-secret-not-a-real-key"}
  };
}
async function create(db){return (await (await conversations(context(db,"conversations","POST",{}))).json()).conversation.id}

test("chat is owner only, without altering shared Minecraft permissions",()=>{
 assert(accessForUser({username:"CesarVapor"}).capabilities.includes("chat:use"));
 assert(!accessForUser({username:"SuperSanti86"}).capabilities.includes("chat:use"));
 assert(accessForUser({username:"SuperSanti86"}).capabilities.includes("minecraft:restart"));
 assert(!accessForUser({username:"someone"}).capabilities.includes("chat:use"));
 assert(!accessForUser({username:"CesarVapor"}).views.includes("ebay"));
});
test("all chat routes reject anonymous, other users, CSRF and cross-origin writes",async()=>{
 const {db}=database();
 for(const route of [config,conversations,message]){
  assert.equal((await route(context(db,"test","GET",undefined,null))).status,401);
  assert.equal((await route(context(db,"test","GET",undefined,"SuperSanti86"))).status,403);
  assert.equal((await route(context(db,"test","POST",{},"CesarVapor",{"x-csrf-token":"wrong"}))).status,403);
  assert.equal((await route(context(db,"test","POST",{},"CesarVapor",{origin:"https://attacker.test"}))).status,403);
 }
});
test("keys are encrypted and settings do not return them",async()=>{
 const {db,sqlite}=database(), secret="test-only-encryption-secret-not-a-real-key", key="sk-test-not-a-real-key-1234567890";
 const encrypted=await encryptSecret(key,secret);
 assert.notEqual(encrypted.cipher,key);
 assert.equal(await decryptSecret(encrypted.cipher,encrypted.iv,secret),key);
 await assert.rejects(decryptSecret(encrypted.cipher,encrypted.iv,"a-different-secret-with-enough-length"));
 const oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=async(url,init)=>{assert.equal(url,"https://api.openai.com/v1/models/gpt-5-mini");assert.equal(init.headers.Authorization,"Bearer "+key);return Response.json({id:"gpt-5-mini"})};
  assert.equal((await config(context(db,"config","POST",{apiKey:key}))).status,200);
  const state=await (await config(context(db,"config"))).json();
  assert.equal(state.ready,true);assert(!JSON.stringify(state).includes(key));
  assert(!JSON.stringify(sqlite.prepare("SELECT * FROM ai_settings").get()).includes(key));
  assert.equal((await config(context(db,"config","DELETE",{}))).status,200);
  assert.equal((await (await config(context(db,"config"))).json()).ready,false);
 }finally{globalThis.fetch=oldFetch}
});
test("conversations persist across requests and enforce ownership and cascading deletion",async()=>{
 const {db,sqlite}=database(), id=await create(db);
 const list=await (await conversations(context(db,"conversations"))).json();
 assert.equal(list.conversations[0].id,id);
 sqlite.prepare("INSERT INTO ai_messages(conversation_id,role,content,created_at) VALUES(?,'user','hello',1)").run(id);
 const fetched=await (await conversations(context(db,"conversations?id="+id))).json();
 assert.equal(fetched.messages[0].content,"hello");
 sqlite.prepare("UPDATE ai_conversations SET owner='another-owner' WHERE id=?").run(id);
 assert.equal((await conversations(context(db,"conversations?id="+id))).status,404);
 assert.equal((await conversations(context(db,"conversations","DELETE",{id}))).status,404);
 sqlite.prepare("UPDATE ai_conversations SET owner='cesarvapor' WHERE id=?").run(id);
 assert.equal((await conversations(context(db,"conversations","DELETE",{id}))).status,200);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM ai_messages").get().n,0);
});
test("message handling validates input, missing setup and foreign conversations",async()=>{
 const {db}=database(), id=await create(db);
 assert.equal((await message(context(db,"message","POST",null))).status,400);
 assert.equal((await config(context(db,"config","POST",null))).status,400);
 assert.equal((await message(context(db,"message","POST",{conversationId:id,requestId:crypto.randomUUID(),message:"x".repeat(12001)}))).status,400);
 assert.equal((await message(context(db,"message","POST",{conversationId:id,requestId:crypto.randomUUID(),message:"Hello"}))).status,503);
 assert.equal((await message(context(db,"message","POST",{conversationId:"foreign",requestId:crypto.randomUUID(),message:"Hello"}))).status,404);
});
test("provider reply saves both turns, retries are idempotent and limits are enforced",async()=>{
 const {db,sqlite}=database(), id=await create(db), requestId=crypto.randomUUID(), oldFetch=globalThis.fetch;
 let calls=0;
 try{
  globalThis.fetch=async(url,init)=>{
   calls++;assert.equal(url,"https://api.openai.com/v1/responses");
   const body=JSON.parse(init.body);assert.equal(body.store,false);assert.equal(body.model,"gpt-5-mini");assert.equal(body.tools,undefined);
   assert.equal(body.input.at(-1).content,"Hola");
   return Response.json({status:"completed",output:[{type:"message",content:[{type:"output_text",text:"¡Hola!"}]}]});
  };
  const make=()=>{const c=context(db,"message","POST",{conversationId:id,requestId,message:"Hola"});c.env.OPENAI_API_KEY="fake-test-key";return c};
  assert.equal((await message(make())).status,200);
  const duplicate=await (await message(make())).json();
  assert.equal(duplicate.duplicate,true);assert.equal(calls,1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM ai_messages").get().n,2);
  assert.equal(sqlite.prepare("SELECT lock_until FROM ai_limits").get().lock_until,0);
  sqlite.prepare("UPDATE ai_limits SET request_count=30").run();
  const limited=make();limited.request=new Request("https://example.test/control/api/chat/message",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":"test-csrf"},body:JSON.stringify({conversationId:id,requestId:crypto.randomUUID(),message:"Hola"})});
  assert.equal((await message(limited)).status,429);assert.equal(calls,1);
 }finally{globalThis.fetch=oldFetch}
});
test("provider failure never exposes body/secret and releases the request lock",async()=>{
 const {db,sqlite}=database(),id=await create(db),oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=async()=>Response.json({error:{message:"sensitive provider diagnostic"}},{status:401});
  const c=context(db,"message","POST",{conversationId:id,requestId:crypto.randomUUID(),message:"Hello"});
  c.env.OPENAI_API_KEY="test-secret-not-real";
  const result=await message(c),text=await result.text();
  assert.equal(result.status,502);assert(!text.includes("sensitive"));assert(!text.includes("test-secret"));
  assert.equal(sqlite.prepare("SELECT lock_until FROM ai_limits").get().lock_until,0);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM ai_messages").get().n,0);
 }finally{globalThis.fetch=oldFetch}
});
test("response extraction handles multiple blocks and context stays bounded",()=>{
 assert.equal(responseText({output:[{type:"reasoning",content:[]},{type:"message",content:[{type:"output_text",text:"a"},{type:"output_text",text:"b"}]}]}),"a\nb");
 const result=contextMessages(Array.from({length:30},(_,i)=>({role:i%2?"user":"assistant",content:"x".repeat(5000)})),"last");
 assert(result.length<=21);assert(result.reduce((n,r)=>n+r.content.length,0)<=40000);
 assert.equal(result.at(-1).content,"last");
});
test("chat markup and scripts preserve safe rendering and existing modules",()=>{
 const html=readFileSync(new URL("../control/index.html",import.meta.url),"utf8");
 const js=readFileSync(new URL("../control/chat.js",import.meta.url),"utf8");
 assert(!/ebay/i.test(html));assert(!/innerHTML|window\.open|localStorage/.test(js));
 for(const match of js.matchAll(/el\("([^"]+)"\)/g))assert(html.includes('id="'+match[1]+'"'),"Missing element "+match[1]);
 for(const id of ["overview","infrastructure","github","thermal","pdf","chat"])assert(html.includes('id="'+id+'"'));
 assert(html.indexOf('src="chat.js')<html.indexOf('src="control.js'));
});
