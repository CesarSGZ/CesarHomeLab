import { userCan } from "../../../_lib/auth.js";
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { appHealth, ensureTables, lastPowerCommand, lastPowerOn, lastWake, loadConnect, powerStatus, readConfig, readPlug, readReport, wakeResult, PLUG_FRESH_MS, SHUTDOWN_ENABLED, REBOOT_COOLDOWN_MS, REPORT_FRESH_MS, WAKE_COOLDOWN_MS } from "../../../_lib/servercesar.js";

// GET: ServerCesar power status, app health from its agent, last wake and reboot/shutdown, and (for the owner) its configuration.
export async function onRequest(context) {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"]);
  const session = context.data.session;
  if (!session) return json({ ok: false, error: "not_authenticated" }, { status: 401 });
  if (!userCan(session.user, "servercesar:read")) return json({ ok: false, error: "servercesar_not_authorized" }, { status: 403 });

  const db = context.env.CONTROL_DB;
  await ensureTables(db);
  const now = Date.now();
  const config = await readConfig(db, context.env);
  const report = await readReport(db);
  const power = await powerStatus(db, config, await loadConnect(), now, report?.receivedAt);
  const wake = await lastWake(db);
  const command = await lastPowerCommand(db);
  const plug = await readPlug(db);
  const powerOn = await lastPowerOn(db);
  const apps = report ? Object.fromEntries(Object.entries(report.apps || {}).map(([name, app]) => [name, { ...app, health: appHealth(app) }])) : {};
  return json({
    ok: true,
    power,
    agent: report ? { fresh: now - report.receivedAt < REPORT_FRESH_MS, receivedAt: report.receivedAt, bootTime: report.bootTime, resumeTime: report.resumeTime, wolPath: report.wolPath || null, cpu: report.cpu, ram: report.ram, diskFreeGb: report.diskFreeGb, userSession: report.userSession, guardianAt: report.guardianAt, version: report.agentVersion } : null,
    apps,
    lastResume: report?.lastResume || null,
    shutdownEnabled: SHUTDOWN_ENABLED,
    plug: plug ? { fresh: now - plug.receivedAt < PLUG_FRESH_MS, output: plug.output, apower: plug.apower, receivedAt: plug.receivedAt } : null,
    lastPowerOn: powerOn ? { by: powerOn.requested_by, at: powerOn.requested_at, completedAt: powerOn.completed_at, status: powerOn.status, result: powerOn.result } : null,
    lastWake: wake ? { by: wake.by_user, at: wake.at, ok: Boolean(wake.ok), detail: wake.detail, outcome: wakeResult(report, wake, now) } : null,
    lastPower: command ? { action: command.type, by: command.requested_by, at: command.requested_at, claimedAt: command.claimed_at, completedAt: command.completed_at, status: command.status, result: command.result } : null,
    cooldownUntil: wake ? wake.at + WAKE_COOLDOWN_MS : 0,
    powerCooldownUntil: command ? command.requested_at + REBOOT_COOLDOWN_MS : 0,
    canWake: userCan(session.user, "servercesar:wake"),
    config: config && userCan(session.user, "servercesar:wake") ? config : null,
  });
}
