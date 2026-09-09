import { chatAccess, ownerOf, fail } from "../../../_lib/chat.js";
import { json, readJson, methodNotAllowed } from "../../../_lib/http.js";

export async function onRequest(context) {
  const denied = chatAccess(context); if (denied) return denied;
  const { request, env } = context, owner = ownerOf(context), db = env.CONTROL_DB;
  try {
    if (request.method === "GET") {
      const id = new URL(request.url).searchParams.get("id");
      if (id) {
        const conversation = await db.prepare("SELECT id,title FROM ai_conversations WHERE id=? AND owner=?").bind(id,owner).first();
        if (!conversation) return fail("Conversation not found.",404);
        const messages = await db.prepare("SELECT id,role,content,created_at FROM ai_messages WHERE conversation_id=? ORDER BY id DESC LIMIT 100").bind(id).all();
        return json({ok:true,conversation,messages:messages.results.reverse()});
      }
      const rows = await db.prepare("SELECT id,title,updated_at FROM ai_conversations WHERE owner=? ORDER BY updated_at DESC LIMIT 100").bind(owner).all();
      return json({ok:true,conversations:rows.results});
    }
    if (request.method === "POST") {
      const count = await db.prepare("SELECT COUNT(*) AS n FROM ai_conversations WHERE owner=?").bind(owner).first();
      if (count.n >= 100) return fail("Conversation limit reached. Delete an old conversation to create a new one.",409);
      const id=crypto.randomUUID(), now=Date.now();
      await db.prepare("INSERT INTO ai_conversations(id,owner,title,created_at,updated_at) VALUES(?,?,'New conversation',?,?)").bind(id,owner,now,now).run();
      return json({ok:true,conversation:{id,title:"New conversation"}});
    }
    if (request.method === "DELETE") {
      let input; try {input=await readJson(request,1024);} catch{return fail("Invalid request.");}
      if (!input || typeof input !== "object") return fail("Invalid request.");
      const result = await db.prepare("DELETE FROM ai_conversations WHERE id=? AND owner=?").bind(String(input.id||""),owner).run();
      if (!result.meta.changes) return fail("Conversation not found.",404);
      return json({ok:true});
    }
    return methodNotAllowed(["GET","POST","DELETE"]);
  } catch {return fail("Conversation history is temporarily unavailable.",503);}
}
