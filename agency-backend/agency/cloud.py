"""Cliente de Mission Control. Solo HTTPS saliente: el PC nunca abre un puerto."""
import requests

from . import VERSION


class CloudError(Exception):
    pass


class MissionControl:
    def __init__(self, base_url, token):
        self.url = base_url.rstrip("/") + "/api/agent/agency"
        self.token = token
        self.http = requests.Session()
        self.http.headers.update({"User-Agent": f"ScarlettAgency/{VERSION}", "Content-Type": "application/json"})

    def _post(self, body, timeout=25):
        if not self.token:
            raise CloudError("Falta el token del backend (ejecuta install.ps1)")
        try:
            r = self.http.post(self.url, json=body, headers={"Authorization": "Bearer " + self.token}, timeout=timeout)
        except requests.RequestException as e:
            raise CloudError(f"Sin conexión con Mission Control: {e.__class__.__name__}") from e
        if r.status_code == 401:
            raise CloudError("Mission Control rechaza el token del backend (401)")
        try:
            data = r.json()
        except ValueError as e:
            raise CloudError(f"Respuesta no válida de Mission Control (HTTP {r.status_code})") from e
        if not r.ok or not data.get("ok"):
            raise CloudError(f"Mission Control HTTP {r.status_code}: {data.get('error', '')}")
        return data

    def sync(self, state=None, events=(), replies=(), done=()):
        body = {"action": "sync", "events": list(events), "replies": list(replies), "done": list(done)}
        if state is not None:
            body["state"] = state
        return self._post(body)

    def openai_key(self):
        return self._post({"action": "openai-key"}).get("key")
