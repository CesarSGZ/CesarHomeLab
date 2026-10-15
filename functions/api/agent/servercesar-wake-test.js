import { constantTimeEqual } from "../../_lib/auth.js";
import { json, methodNotAllowed, readJson } from "../../_lib/http.js";
import { ensureTables, readConfig, readReport, recordEvent, requireServerAgent, sendMagicPacket, wakeTargets } from "../../_lib/servercesar.js";

// POST {delaySeconds} from the ServerCesar agent right before it puts the PC to sleep: answers at
// once and sends the magic packet a few seconds later, while the PC is already asleep. Lets the
// agent test a real remote wake on its own (Cloudflare keeps the request alive up to ~30 s).
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!requireServerAgent(context.request, context.env, constantTimeEqual)) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body;
  try { body = await readJson(context.request); } catch { return json({ ok: false, error: "invalid_json" }, { status: 400 }); }
  const delay = Math.min(25, Math.max(5, Number(body.delaySeconds) || 20));
  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  const config = await readConfig(db, context.env);
  if (!config) return json({ ok: false, error: "not_configured" }, { status: 409 });
  const targets = wakeTargets(config, await readReport(db));

  context.waitUntil((async () => {
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    const results = [];
    for (const host of targets) {
      try { results.push(await sendMagicPacket({ ...config, host })); } catch { results.push({ ok: false, message: "relay unreachable" }); }
    }
    await recordEvent(db, "wake-test", "agent", results.some((r) => r.ok), results.map((r) => r.message).join(" · "));
  })());

  return json({ ok: true, delaySeconds: delay, targets: targets.length }, { status: 202 });
}
