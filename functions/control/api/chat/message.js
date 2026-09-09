import { chatAccess, ownerOf, connection, fail, responseText, providerError, contextMessages } from "../../../_lib/chat.js";
import { json, readJson, methodNotAllowed } from "../../../_lib/http.js";

export async function onRequest(context) {
  const denied=chatAccess(context); if(denied)return denied;
  if(context.request.method!=="POST")return methodNotAllowed(["POST"]);
  let input; try{input=await readJson(context.request,50000);}catch{return fail("Invalid message.");}
  if(!input || typeof input!=="object" || Array.isArray(input))return fail("Invalid message.");
  const message=typeof input.message==="string"?input.message.trim():"";
  const id=String(input.conversationId||""), requestId=String(input.requestId||"");
  if(!message||message.length>12000||!id||!/^[a-f0-9-]{36}$/i.test(requestId))return fail("Enter a message of up to 12,000 characters.");
  const owner=ownerOf(context), db=context.env.CONTROL_DB, now=Date.now();
  let locked=false;
  try{
    const conversation=await db.prepare("SELECT id FROM ai_conversations WHERE id=? AND owner=?").bind(id,owner).first();
    if(!conversation)return fail("Conversation not found.",404);
    const previous=await db.prepare("SELECT status,answer FROM ai_requests WHERE id=? AND owner=? AND conversation_id=?").bind(requestId,owner,id).first();
    if(previous?.status==="complete")return json({ok:true,answer:previous.answer,duplicate:true});
    if(previous)return fail("That request has already been submitted. Refresh the conversation before sending again.",409);
    const config=await connection(context.env,owner);
    if(!config.key)return fail("Connect your OpenAI API key above before sending a message.",503);
    await db.prepare("INSERT OR IGNORE INTO ai_limits(owner) VALUES(?)").bind(owner).run();
    const lock=await db.prepare("UPDATE ai_limits SET lock_id=?,lock_until=?,request_count=CASE WHEN window_start<? THEN 1 ELSE request_count+1 END,window_start=CASE WHEN window_start<? THEN ? ELSE window_start END WHERE owner=? AND lock_until<? AND (window_start<? OR request_count<30)")
      .bind(requestId,now+90000,now-3600000,now-3600000,now,owner,now,now-3600000).run();
    if(!lock.meta.changes)return fail("A reply is in progress, or the 30-requests-per-hour safety limit has been reached. Try again later.",429);
    locked=true;
    await db.prepare("INSERT INTO ai_requests(id,owner,conversation_id,status,created_at) VALUES(?,?,?,'pending',?)").bind(requestId,owner,id,now).run();
    const history=await db.prepare("SELECT role,content FROM ai_messages WHERE conversation_id=? ORDER BY id DESC LIMIT 20").bind(id).all();
    const response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",headers:{"Authorization":"Bearer "+config.key,"Content-Type":"application/json"},
      body:JSON.stringify({model:config.model,store:false,max_output_tokens:4000,reasoning:{effort:"low"},
        instructions:"You are a helpful assistant in Cesar HomeLab. Reply in the user's language. You have no access to their ChatGPT history, files, accounts or homelab services. Do not claim to have performed actions or accessed live information. Be clear about uncertainty.",
        input:contextMessages(history.results,message)}),signal:AbortSignal.timeout(55000)
    });
    if(!response.ok){
      await db.prepare("UPDATE ai_requests SET status='failed' WHERE id=?").bind(requestId).run();
      return fail(providerError(response.status),502);
    }
    const data=await response.json(), answer=responseText(data);
    if(!answer){
      await db.prepare("UPDATE ai_requests SET status='failed' WHERE id=?").bind(requestId).run();
      return fail("The model returned no text. Try a shorter or more specific message.",502);
    }
    const suffix=data.status==="incomplete"?"\n\n[Response reached its output limit. Ask to continue if needed.]":"";
    const finalAnswer=answer+suffix;
    await db.batch([
      db.prepare("INSERT INTO ai_messages(conversation_id,role,content,created_at) VALUES(?,'user',?,?)").bind(id,message,now),
      db.prepare("INSERT INTO ai_messages(conversation_id,role,content,created_at) VALUES(?,'assistant',?,?)").bind(id,finalAnswer,Date.now()),
      db.prepare("UPDATE ai_conversations SET title=CASE WHEN title='New conversation' THEN ? ELSE title END,updated_at=? WHERE id=? AND owner=?").bind(message.slice(0,70),Date.now(),id,owner),
      db.prepare("UPDATE ai_requests SET status='complete',answer=? WHERE id=?").bind(finalAnswer,requestId)
    ]);
    return json({ok:true,answer:finalAnswer});
  }catch{
    return fail("The reply could not be confirmed. Refresh this conversation before retrying; API usage may still have been charged.",503);
  }finally{
    if(locked)try{await db.prepare("UPDATE ai_limits SET lock_until=0,lock_id=NULL WHERE owner=? AND lock_id=?").bind(owner,requestId).run();}catch{/* The bounded lock expires automatically. */}
  }
}
