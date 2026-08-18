import { requireEbayWrite } from "../../../../_lib/ebay.js";
import { json, methodNotAllowed, readJson } from "../../../../_lib/http.js";

const ACTIONS = new Set(["approve", "reject"]);

export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const denied = requireEbayWrite(context);
  if (denied) return denied;
  let body;
  try { body = await readJson(context.request); } catch { return json({ ok: false, error: "invalid_request" }, { status: 400 }); }
  if (!ACTIONS.has(body.action)) return json({ ok: false, error: "invalid_action" }, { status: 400 });
  const id = String(context.params.id || "");
  const existing = await context.env.CONTROL_DB.prepare("SELECT id, status FROM ebay_opportunities WHERE id = ?").bind(id).first();
  if (!existing) return json({ ok: false, error: "opportunity_not_found" }, { status: 404 });
  if (existing.status !== "pending") return json({ ok: false, error: "opportunity_not_pending" }, { status: 409 });
  const status = body.action === "approve" ? "approved" : "rejected";
  const now = Date.now();
  await context.env.CONTROL_DB.batch([
    context.env.CONTROL_DB.prepare("UPDATE ebay_opportunities SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, id),
    context.env.CONTROL_DB.prepare("INSERT INTO ebay_activity_log (id, entity_type, entity_id, action, actor, created_at, detail) VALUES (?, 'opportunity', ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), id, status, context.data.session.user.username, now, "Manual review from Mission Control"),
  ]);
  return json({ ok: true, id, status });
}
