// Script for the Shelly Plug S Gen3 that feeds ServerCesar (installed by install-shelly.ps1).
// Every minute it reports the relay state and power draw to Mission Control and runs a queued
// "poweron": with the BIOS set to power on after AC loss, a 10 s power cut boots the PC from a
// full shutdown. It refuses to cut power while the PC draws more than OFF_WATTS, so a running PC
// is never switched off from the web. The token lives in the plug's KVS (key "sc_token").
let URL = "https://cesar-solla.pages.dev/api/agent/servercesar-plug";
let OFF_WATTS = 20;
let token = null;
let done = null;
let busy = false;

function runPowerOn(id) {
  let s = Shelly.getComponentStatus("switch", 0);
  if (!s.output) {
    Shelly.call("Switch.Set", { id: 0, on: true });
    done = { id: id, ok: true, detail: "La corriente estaba cortada: restablecida" };
  } else if (s.apower > OFF_WATTS) {
    done = { id: id, ok: false, detail: "El PC ya consume " + Math.round(s.apower) + " W: no se corta la corriente" };
  } else {
    Shelly.call("Switch.Set", { id: 0, on: false, toggle_after: 10 });
    done = { id: id, ok: true, detail: "Corriente cortada 10 s y restablecida (" + Math.round(s.apower) + " W antes)" };
  }
}

function poll() {
  if (busy || !token) return;
  busy = true;
  let s = Shelly.getComponentStatus("switch", 0);
  let body = JSON.stringify({ output: s.output, apower: s.apower, done: done });
  Shelly.call("HTTP.Request", {
    method: "POST",
    url: URL,
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: body,
    timeout: 15
  }, function (res, code) {
    busy = false;
    if (code !== 0 || !res || res.code !== 200) return;
    done = null;
    let answer = JSON.parse(res.body);
    if (answer && answer.command && answer.command.type === "poweron") runPowerOn(answer.command.id);
  });
}

Shelly.call("KVS.Get", { key: "sc_token" }, function (res) {
  if (res && res.value) { token = res.value; poll(); }
});
Timer.set(60000, true, poll);
