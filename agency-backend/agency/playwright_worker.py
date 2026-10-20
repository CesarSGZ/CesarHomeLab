"""Async UI worker. Python >=3.11; one instance/event loop per profile."""
from __future__ import annotations

import asyncio
import logging
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from playwright.async_api import (
    Error as PlaywrightError,
    TimeoutError as PlaywrightTimeoutError,
    async_playwright,
)

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class WorkerResult:
    status: Literal["Completado", "Error"]
    phase: str
    code: str
    message: str
    submitted: bool
    # After clicking, a timeout may mean the server accepted the submission.
    submission_uncertain: bool = False
    final_url: str | None = None

    def to_dict(self) -> dict:
        return asdict(self)


class PlaywrightWorker:
    def __init__(
        self,
        profile_dir: str | Path,
        *,
        headless: bool = False,
        timeout_ms: int = 30_000,
        launch_timeout_ms: int = 60_000,
        task_timeout_s: float = 180,
        typing_delay_ms: int = 55,
    ) -> None:
        self.profile_dir = Path(profile_dir).expanduser().resolve()
        self.headless = headless
        self.timeout_ms = timeout_ms
        self.launch_timeout_ms = launch_timeout_ms
        self.task_timeout_s = task_timeout_s
        self.typing_delay_ms = typing_delay_ms
        self._lock = asyncio.Lock()

    async def execute(
        self,
        url: str,
        text: str,
        *,
        input_selector: str,
        submit_selector: str,
        success_selector: str | None = None,
        success_url_pattern: str | None = None,
        account_selector: str | None = None,
        expected_account: str | None = None,
    ) -> WorkerResult:
        """Success requires a visible, fresh confirmation after the click.

        success_selector must identify a confirmation that is initially hidden
        or absent. Use a selector specific to the current operation when possible.
        No automatic submission retries: they could duplicate an external action.
        """
        phase = "validation"
        click_started = False
        submitted = False
        confirmed = False
        try:
            parsed = urlsplit(url)
            if parsed.scheme not in {"http", "https"} or not parsed.hostname:
                raise ValueError("URL must use http or https and contain a host")
            if not text or not all((input_selector, submit_selector)):
                raise ValueError("Text and input/submit selectors are required")
            if not success_selector and not success_url_pattern:
                raise ValueError("A success selector or success URL pattern is required")
            success_url = re.compile(success_url_pattern) if success_url_pattern else None
            # All calls on this instance are serialized; queueing time is excluded
            # from the browser task deadline. This lock is process-local.
            async with self._lock:
                phase = "launch"
                async with asyncio.timeout(self.task_timeout_s):
                    self.profile_dir.mkdir(parents=True, exist_ok=True)
                    async with async_playwright() as playwright:
                        context = await playwright.chromium.launch_persistent_context(
                            user_data_dir=str(self.profile_dir),
                            headless=self.headless,
                            timeout=self.launch_timeout_ms,
                            accept_downloads=False,
                        )
                        try:
                            context.set_default_timeout(self.timeout_ms)
                            context.set_default_navigation_timeout(self.timeout_ms)
                            page = await context.new_page()
                            phase = "navigation"
                            response = await page.goto(url, wait_until="domcontentloaded")
                            if response is not None and response.status >= 400:
                                raise RuntimeError(f"Target returned HTTP {response.status}")
                            if expected_account:
                                phase = "account"
                                if not account_selector:
                                    raise ValueError("Account selector is required")
                                account = page.locator(account_selector).filter(
                                    has_text=re.compile('^' + re.escape(expected_account) + '$', re.I))
                                await account.first.wait_for(state="visible")
                            field = page.locator(input_selector)
                            confirmation = page.locator(success_selector) if success_selector else None
                            phase = "input"
                            await field.wait_for(state="visible")
                            await field.fill("")
                            # type(..., delay=...) as requested. For new code,
                            # press_sequentially(text, delay=...) is the modern API.
                            await field.type(text, delay=self.typing_delay_ms)
                            phase = "confirmation_precondition"
                            if confirmation:
                                await confirmation.wait_for(state="hidden")
                            if success_url and success_url.search(page.url):
                                raise ValueError("Success URL already matches before submission")
                            phase = "submit"
                            click_started = True
                            await page.locator(submit_selector).click()
                            submitted = True
                            phase = "confirmation"
                            if success_url:
                                await page.wait_for_url(success_url, wait_until="domcontentloaded")
                            if confirmation:
                                await confirmation.wait_for(state="visible")
                            final_url = page.url
                            confirmed = True
                            phase = "cleanup"
                        finally:
                            # Saves persistent browser state and releases the profile.
                            await context.close()
                return WorkerResult("Completado", "confirmation", "ok",
                                    "Submission confirmed in the UI", True, final_url=final_url)
        except asyncio.CancelledError:
            # Preserve cancellation for the backend's shutdown handler.
            raise
        except (PlaywrightTimeoutError, TimeoutError):
            return WorkerResult("Error", phase, "timeout",
                                "Operation exceeded its timeout", submitted,
                                click_started and not confirmed)
        except ValueError as exc:
            return WorkerResult("Error", phase, "invalid_input", str(exc), submitted)
        except re.error:
            return WorkerResult("Error", phase, "invalid_input", "Invalid success URL pattern", submitted)
        except (PlaywrightError, OSError, RuntimeError) as exc:
            # Avoid returning browser traces, profile paths or target data to clients.
            logger.error("UI worker failed in phase=%s exception=%s", phase, type(exc).__name__)
            return WorkerResult("Error", phase, "browser_error",
                                "Browser operation failed; inspect local logs", submitted,
                                click_started and not confirmed)
        except Exception as exc:
            logger.error("UI worker unexpected failure phase=%s exception=%s", phase, type(exc).__name__)
            return WorkerResult("Error", phase, "internal_error",
                                "Unexpected worker failure", submitted,
                                click_started and not confirmed)


async def run_ui_task(url: str, text: str, *, profile_dir: str | Path, **selectors) -> WorkerResult:
    """Entry point for an async backend task that owns this profile exclusively."""
    return await PlaywrightWorker(profile_dir).execute(url, text, **selectors)


async def login_profile(url: str) -> None:
    import json
    from .config import DATA_DIR, SETTINGS_PATH, load_settings
    settings = load_settings()
    cfg = settings["karma_farmer"]["browser"]
    profile = Path(cfg["profile_dir"])
    if not profile.is_absolute():
        profile = DATA_DIR / profile
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(str(profile), headless=False)
        try:
            page = await context.new_page()
            response = await page.goto(url, wait_until="domcontentloaded")
            if response is not None and response.status >= 400:
                raise RuntimeError(f'Reddit devolvió HTTP {response.status}; revisa la sesión')
            await asyncio.to_thread(input, "Inicia sesión y pulsa Enter para guardar y cerrar: ")
            username = settings['karma_farmer']['username']
            response = await page.goto(f'https://old.reddit.com/user/{username}/', wait_until='domcontentloaded')
            if response is not None and response.status >= 400:
                raise RuntimeError(f'Reddit devolvió HTTP {response.status}; revisa la sesión')
            await page.locator(cfg['account_selector']).filter(
                has_text=re.compile('^' + re.escape(username) + '$', re.I)).first.wait_for(state='visible')
            cfg['session_ready'], cfg['session_error'] = True, ''
            SETTINGS_PATH.write_text(json.dumps(settings, indent=2, ensure_ascii=False), encoding='utf-8')
        finally:
            await context.close()


if __name__ == "__main__":
    import sys
    asyncio.run(login_profile(sys.argv[1] if len(sys.argv) > 1 else "https://www.reddit.com/login/"))
