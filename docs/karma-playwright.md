# Karma Farmer con Playwright

Implementación sobre `CesarSGZ/CesarHomeLab`, base
`098c76a14adbc774f45a46a3190a1241b4edb76e`.

## Destino bloqueado: r/AskReddit

La [regla 11 de r/AskReddit](https://www.reddit.com/r/AskReddit/wiki/rules/)
prohíbe bots, contenido generado por máquinas y karma farming. El agente muestra
ese motivo como `blocked`, no programa publicaciones allí y rechaza `run-now`.
El adaptador bloquea también el envío directo antes de abrir el navegador.
El módulo genérico sigue disponible para destinos donde se permita automatizar.
No se incorporan plugins stealth ni técnicas para eludir restricciones.

## Qué cambia

El mismo Karma Farmer genera las preguntas con el cliente OpenAI existente y usa
Chromium para publicar y leer Reddit. No se añade un agente ni un servidor HTTP.
Se elimina PRAW de `agency-backend/requirements.txt` y se sustituye su adaptador
por lecturas de DOM en `agency/platforms/reddit.py`.

`agency/playwright_worker.py` contiene la operación asíncrona reutilizable:

```python
from agency.playwright_worker import PlaywrightWorker

result = await PlaywrightWorker(profile_dir=r'C:\ruta\perfil-dedicado').execute(
    url=target_url,
    text=generated_text,
    input_selector='textarea[name="title"]',
    submit_selector='button[type="submit"]',
    success_url_pattern=r'^https://old\.reddit\.com/r/AskReddit/comments/[a-z0-9]+/',
)
payload = result.to_dict()
```

También admite `success_selector` para páginas que confirman el envío sin cambiar
de URL. Exige que la confirmación no esté presente antes del clic. Devuelve
`status` (`Completado`/`Error`), `phase`, `code`, `message`, `submitted`,
`submission_uncertain` y `final_url`. Escribe mediante `type(text, delay=55)`.
`type` está obsoleta en Playwright; la alternativa moderna equivalente es
`press_sequentially(text, delay=55)`.

## Conexión exacta con el backend existente

1. El botón «Publicar ahora» de `control/agency/app.js` ya envía
   `POST /control/api/agency/command` con
   `{"agent":"karma-farmer","type":"run-now"}`. Usa la sesión y el CSRF existentes.
2. `functions/control/api/agency/[[path]].js` llama a `queueCommand()` y guarda
   la orden en `agency_commands` de D1.
3. `agency/__main__.py:Runtime.run()` llama periódicamente a
   `POST /api/agent/agency` y recoge la orden con el token actual del servicio.
4. `Runtime.handle_commands()` llama a `KarmaFarmer.handle_command('run-now')`;
   `Agent.start()` ejecuta `KarmaFarmer.run()` en un hilo. El servicio puede seguir
   sincronizando mientras trabaja el navegador.
5. `write_question()` usa el cliente OpenAI existente. `Reddit.submit()` llama a
   `asyncio.run(submit_async(...))` exclusivamente dentro del hilo del agente;
   `submit_async()` hace `await PlaywrightWorker.execute(...)`.
6. Al confirmar la URL de la publicación, el agente guarda el post y el resultado
   en el SQLite local, se pone en `completed` y emite un evento `ok`. Si falla,
   usa `error` y emite un evento `error`.
7. El siguiente intercambio sincroniza el snapshot y los eventos a las tablas
   actuales `agency_state` y `agency_events` de D1. El sondeo del dashboard a
   `GET /control/api/agency/status` pinta «Completado» o «Error» en la tarjeta y el
   personaje. No se necesita una migración D1.

La orden de D1 pasa a `done` cuando se acepta el trabajo; la terminación real se
lee en el estado del agente y sus eventos. `karma:last_ui_result` conserva el
resultado detallado localmente. El registro y los snapshots se reenvían por el
canal que ya tiene el proyecto; no se entregan tokens de Cloudflare al navegador.

## Instalación local en Windows

Extrae el ZIP en una carpeta aparte. Desde tu copia del repositorio aplica el
parche incluido (sustituye la ruta de descarga):

```powershell
cd C:\ruta\CesarHomeLab
git apply --check C:\descargas\karma-farmer-playwright.patch
git apply C:\descargas\karma-farmer-playwright.patch
```

El ZIP contiene también los archivos modificados con su estructura original para
revisarlos. Si tu rama ha cambiado respecto a la base indicada, resuelve primero
los conflictos que indique `git apply --check`.

En una copia del repositorio que tenga aplicado el parche:

```powershell
cd C:\ruta\CesarHomeLab\agency-backend
python -m pip install -r requirements.txt
python -m playwright install chromium
```

Los comandos mínimos son `pip install playwright` y `playwright install chromium`.
El parche fija Playwright 1.64.0, usado en la verificación local.

Para la instalación administrada por el proyecto, `install.ps1` ya instala las
dependencias y ahora instala también Chromium antes de copiar el código. El script
original gestiona la tarea de Windows y los tokens de despliegue; no se ha ejecutado
en esta entrega. Puedes revisar y aplicar sus pasos con tu procedimiento habitual.

Preparación de sesión en la instalación existente, después de actualizar su código:

```powershell
Stop-ScheduledTask -TaskName 'Scarlett Agency'
cd "$env:LOCALAPPDATA\ScarlettAgency\app"
..\venv\Scripts\python.exe -m agency setup-reddit
Start-ScheduledTask -TaskName 'Scarlett Agency'
```

Escribe tu usuario, inicia sesión en la ventana Chromium y pulsa Enter en la
consola. El candado del servicio evita que sus relanzamientos programados usen el
perfil durante esta preparación. Nunca se solicita client ID ni secreto de Reddit.

Los ajustes nuevos se combinan con los ya existentes en
`%LOCALAPPDATA%\ScarlettAgency\settings.json`. Campos importantes:

```json
{
  "karma_farmer": {
    "username": "TU_USUARIO",
    "browser": {
      "profile_dir": "reddit-browser-profile",
      "headless": false,
      "timeout_ms": 30000,
      "typing_delay_ms": 55,
      "input_selector": "#title-field textarea[name=\"title\"]",
      "submit_selector": "#newlink button[type=\"submit\"]"
    }
  }
}
```

La ruta relativa del perfil se resuelve dentro de `AGENCY_DATA_DIR`, que por
defecto es `%LOCALAPPDATA%\ScarlettAgency`. Puedes usar una ruta absoluta a un
perfil dedicado ya preparado. `launch_persistent_context` reutiliza sus cookies
y localStorage, pero abre su propio proceso: no controla ventanas ya abiertas
ni admite compartir el perfil entre procesos simultáneos. No uses el perfil
principal de Chrome. Las cookies permanecen solo en el PC.

## Selectores y límites comprobables

Los valores por defecto apuntan al HTML de `old.reddit.com`. No se ha abierto tu
sesión ni publicado en Reddit durante esta entrega: hay que validar esos
selectores en tu cuenta antes de activar el plan diario. Configura también los
selectores de cuenta, títulos, comentarios y karma definidos en `config.py` si
el HTML de tu sesión es distinto. Las lecturas y los envíos fallan explícitamente
si no pueden verificar la sesión o los elementos esperados.

Se comprueba que el usuario visible coincide con el configurado antes de escribir.
El envío solo se considera confirmado al llegar a la URL de un post del subreddit
esperado. Una confirmación de URL no acredita aprobación posterior por moderación.
No hay fallback a la API de Reddit. OpenAI y el intercambio de estado con Cloudflare
continúan usando HTTP como antes.

Los campos de karma se aceptan solo como enteros completos, sin interpretar valores
abreviados como «1.2k». La actualización de posts consulta el listado renderizado
de la cuenta y conserva las mediciones previas de IDs que no aparecen en esa página;
no se implementa paginación completa. Los datos ocultos/no leídos se guardan como
`None`, sin inventar cifras. Los selectores o sesiones que caduquen requieren
ajuste local.

Si hay un clic sin confirmación, el plan queda en `failed` y no se vuelve a enviar
solo. El marcador `karma:submitting` sobrevive a reinicios. Al pedir otra ejecución,
primero se intenta recuperar el post visible por título y fecha; si no se encuentra,
se mantiene el error. Revisa el sitio y el marcador local antes de permitir otro
intento; no se borra automáticamente por antigüedad.

## Verificación

```powershell
cd C:\ruta\CesarHomeLab\agency-backend
python -m unittest discover -s tests -v
cd ..
node --test tests/agency.test.mjs
```

Las pruebas Python usan Chromium real con todas las peticiones interceptadas para
servir páginas de prueba; no publican ni consultan Reddit real y simulan la salida
de OpenAI. Verifican lecturas DOM, publicación, registro local, confirmación,
timeout antes del clic y recuperación de un envío incierto sin duplicarlo.
Las pruebas JS verifican el viaje de estados/eventos y la etiqueta «Completado».

Referencias: [perfiles persistentes](https://playwright.dev/python/docs/api/class-browsertype#browser-type-launch-persistent-context),
[Locator.type](https://playwright.dev/python/docs/api/class-locator#locator-type),
[instalación](https://playwright.dev/python/docs/intro).
