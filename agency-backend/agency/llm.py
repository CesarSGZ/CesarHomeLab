"""Responses API with durable budget reservations and no ambiguous retries."""
import json
import math

import requests

from . import vault

# Standard USD / million tokens, checked 2026-10-21.
# https://developers.openai.com/api/docs/pricing
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
        key = self.rt.cloud.openai_key()
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
        cap = float(cfg["daily_usd_cap"])
        request_cap = int(cfg.get("daily_request_cap", 20))
        if model not in RATES or not math.isfinite(cap) or cap <= 0 or request_cap <= 0:
            raise LLMError("Revisa el modelo y los límites de IA antes de generar")
        if not isinstance(max_out, int) or not 1 <= max_out <= 2000:
            raise LLMError("Salida de IA fuera del límite permitido")
        body = {
            "model": model, "instructions": instructions, "store": False,
            "service_tier": "default",
            "input": data if isinstance(data, str) else json.dumps(data, ensure_ascii=False),
            "reasoning": {"effort": "low" if deep else "none"}, "max_output_tokens": max_out,
            "text": {"format": {"type": "json_schema", "name": name, "strict": True, "schema": schema}},
        }
        size = len(json.dumps(body, ensure_ascii=False).encode("utf-8"))
        if size > 60_000:
            raise LLMError("Contexto demasiado grande; reduce las directrices o el historial")
        ri, ro = RATES[model]
        reserve = ((size + 4096) * ri + max_out * ro) / 1e6
        for attempt in range(2):
            try:
                key = self.key()
            except Exception as exc:
                raise LLMError(f'No se pudo cargar la clave de IA ({type(exc).__name__})') from exc
            today = self.rt.today()
            try:
                usage_id = self.rt.store.reserve_llm(today, agent, model, reserve, cap, request_cap)
            except ValueError as exc:
                raise LLMError(str(exc)) from exc
            try:
                r = requests.post("https://api.openai.com/v1/responses", json=body, timeout=(10, 90),
                                  headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
            except requests.RequestException as exc:
                raise LLMError(f"OpenAI no responde ({type(exc).__name__}); sin reintento automático") from exc
            if r.status_code == 401 and attempt == 0:
                self._forget_key()
                continue
            if not r.ok:
                raise LLMError(f"OpenAI HTTP {r.status_code}; sin reintento automático")
            try:
                result = r.json()
                usage = result.get("usage")
                if usage and all(isinstance(usage.get(k), int) and usage[k] >= 0
                                 for k in ("input_tokens", "output_tokens")):
                    tin, tout = usage["input_tokens"], usage["output_tokens"]
                    self.rt.store.x("UPDATE llm_usage SET input_tokens = ?, output_tokens = ?, usd = ? WHERE id = ?",
                                    (tin, tout, (tin * ri + tout * ro) / 1e6, usage_id))
                if result.get("status") != "completed":
                    raise LLMError("Respuesta de IA incompleta; sin reintento automático")
                text = next((c.get("text") for o in result.get("output", [])
                             for c in (o.get("content") or []) if c.get("type") == "output_text"), None)
                if not text:
                    raise LLMError("OpenAI no devolvió texto")
                parsed = json.loads(text)
                if not isinstance(parsed, dict):
                    raise LLMError("OpenAI no devolvió un objeto JSON")
                return parsed
            except (ValueError, TypeError, AttributeError) as exc:
                raise LLMError("OpenAI devolvió una respuesta no válida; sin reintento automático") from exc
        raise LLMError("OpenAI no disponible")
