import { userCan, validCsrf } from "../../../_lib/auth.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { cloudPowerOn, ensureTables, lastWake, queuePowerOn, readCloudConfig, readConfig, readReport, recordEvent, sendMagicPacket, wakeTargets, WAKE_COOLDOWN_MS } from "../../../_lib/servercesar.js";

// POST: sends the Wake-on-LAN magic packet to ServerCesar (owner only, CSRF-protected, 60 s cooldown),
// to the DDNS host and to the last public IP its agent reported from. If the smart plug is online it
// also queues a power-on: the plug cuts power for a few seconds only if the PC is still off.
export async function onRequest(context) {
  if (context.request.method !== "POST") return methodNotAllowed(["POST"]);
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "servercesar:wake")) return json({ ok: false, error: "wake_not_authorized" }, { status: 403 });
  if (!validCsrf(context.request, session)) return json({ ok: false, error: "invalid_csrf" }, { status: 403 });

  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  const config = await readConfig(db, context.env);
  if (!config) return json({ ok: false, error: "not_configured" }, { status: 409 });
  const previous = await lastWake(db);
  if (previous && Date.now() - previous.at < WAKE_COOLDOWN_MS) {
    return json({ ok: false, error: "cooldown", retryAt: previous.at + WAKE_COOLDOWN_MS }, { status: 429 });
  }

  const results = [];
  for (const host of wakeTargets(config, await readReport(db))) {
    try {
      results.push(await sendMagicPacket({ ...config, host }));
    } catch {
      results.push({ ok: false, message: "No se pudo contactar con el servicio de Wake-on-LAN" });
    }
  }
  const plug = await queuePowerOn(db, session.user.username);
  let plugNote = plug.ok ? "Enchufe: encenderá el PC si sigue apagado" : plug.error === "plug_offline" ? "Enchufe sin conexión con la web" : null;
  // The plug cannot reach this site (usually a LaLiga IP block): switch it through Shelly Cloud instead.
  let cloud = null;
  if (plug.error === "plug_offline") {
    const cloudConfig = await readCloudConfig(db);
    if (cloudConfig) {
      try { cloud = await cloudPowerOn(cloudConfig); } catch (error) { cloud = { ok: false, message: `Nube de Shelly: ${String(error.message).slice(0, 80)}` }; }
      plugNote = cloud.message;
    }
  }
  const ok = results.some((r) => r.ok) || plug.ok || Boolean(cloud?.ok);
  const message = [...results.map((r) => r.message), plugNote].filter(Boolean).join(" · ").slice(0, 280);
  await recordEvent(db, "wake", session.user.username, ok, message);
  return json({ ok, message, plugQueued: plug.ok, cloudPowerOn: Boolean(cloud?.ok), sentAt: Date.now() }, { status: ok ? 200 : 502 });
}
