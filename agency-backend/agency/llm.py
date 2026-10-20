"""Única puerta a OpenAI (Responses API con salida JSON estricta), con tope de gasto diario."""
import json
import time

import requests

from . import vault

# USD por millón de tokens (entrada, salida). Mismas tarifas que usaba la oficina de inversión.
RATES = {"gpt-6-luna": (0.1, 0.5), "gpt-6.1-sol": (2.0, 10.0)}


class LLMError(Exception):
    pass


class LLM:
    def __init__(self, rt):
        self.rt = rt
        self._key = None

    def key(self):
        if self._key:
            return self._key
        stored = vault.load("openai")
        if stored:
            self._key = stored
            return stored
        key = self.rt.cloud.openai_key()  # secreto OPENAI_API_KEY del proyecto Pages
        if not key:
            raise LLMError("Mission Control no tiene clave de OpenAI")
        vault.save("openai", key)
        self._key = key
        return key

    def ready(self):
        try:
            return bool(self.key())
        except Exception:
            return False

    def _forget_key(self):
        self._key = None
        vault.delete("openai")

    def call(self, agent, instructions, data, schema, deep=False, max_out=900, name="output"):
        cfg = self.rt.settings["llm"]
        model = cfg["deep"] if deep else cfg["light"]
        today = self.rt.today()
        if self.rt.store.llm_spent(today) >= float(cfg["daily_usd_cap"]):
            raise LLMError(f"Tope diario de IA alcanzado ({cfg['daily_usd_cap']} USD)")
        body = {
            "model": model, "instructions": instructions, "store": False,
            "input": data if isinstance(data, str) else json.dumps(data, ensure_ascii=False),
            "reasoning": {"effort": "low" if deep else "none"}, "max_output_tokens": max_out,
            "text": {"format": {"type": "json_schema", "name": name, "strict": True, "schema": schema}},
        }
        last = None
        for attempt in range(4):
            try:
                r = requests.post("https://api.openai.com/v1/responses", json=body, timeout=120,
                                  headers={"Authorization": "Bearer " + self.key(), "Content-Type": "application/json"})
            except requests.RequestException as e:
                last = LLMError(f"OpenAI no responde ({e.__class__.__name__})")
                time.sleep(5 * 2 ** attempt)
                continue
            if r.status_code == 401 and attempt == 0:
                self._forget_key()  # la clave cambió en Pages: se vuelve a pedir
                continue
            if r.status_code == 429 or r.status_code >= 500:
                last = LLMError(f"OpenAI HTTP {r.status_code}")
                time.sleep(8 * 2 ** attempt)
                continue
            if not r.ok:
                raise LLMError(f"OpenAI HTTP {r.status_code}: {r.text[:160]}")
            j = r.json()
            usage = j.get("usage") or {}
            ri, ro = RATES.get(model, (2.0, 10.0))
            tin, tout = int(usage.get("input_tokens", 0)), int(usage.get("output_tokens", 0))
            self.rt.store.x("INSERT INTO llm_usage (day, agent, model, input_tokens, output_tokens, usd, at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                            (today, agent, model, tin, tout, (tin * ri + tout * ro) / 1e6, int(time.time() * 1000)))
            text = next((c.get("text") for o in j.get("output", []) for c in (o.get("content") or []) if c.get("type") == "output_text"), None)
            if not text:
                raise LLMError("OpenAI no devolvió texto (¿max_output_tokens corto?)")
            try:
                return json.loads(text)
            except ValueError as e:
                raise LLMError("OpenAI devolvió JSON no válido") from e
        raise last or LLMError("OpenAI no disponible")
