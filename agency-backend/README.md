# Backend de la Agencia (Scarlett Storm)

El equipo de agentes de la vista **06 · Agencia** del Mission Control. Corre en ServerCesar
(Python 3.12, sin permisos de administrador) y habla con Cloudflare solo por HTTPS saliente.

```text
Dashboard (/control/#agency) ── GET status · POST chat / command ──► Pages Functions ──► D1 (agency_*)
                                                                          ▲
ServerCesar · tarea «Scarlett Agency» ── POST /api/agent/agency cada 3–15 s ┘  (token AGENCY_AGENT_TOKEN)
      ├─ Director       chat con César, directrices, órdenes al equipo (OpenAI)
      └─ Karma Farmer   1 pregunta/día en r/AskReddit a hora aleatoria + karma (OpenAI + Playwright)
```

## Agentes

| Agente | Qué hace |
| --- | --- |
| Director (`agents/director.py`) | Lee el chat, contesta con `gpt-6.1-sol` y puede guardar o retirar directrices, pausar, reanudar o pedir a un agente que trabaje ya. Las directrices se pasan a los trabajadores en cada tarea. |
| Karma Farmer (`agents/karma_farmer.py`) | Cada día sortea una hora dentro de la ventana de `settings.json` (10:00–23:15 por defecto). A esa hora lee lo que hay en portada de r/AskReddit, genera candidatas con `gpt-6-luna`, descarta las que incumplen las normas del subreddit (sí/no, enlaces, temas vetados, parecidas a otras) y publica la mejor. Cada 3 h mide el karma de la cuenta y los votos y comentarios de sus posts. Máximo 2 posts en 24 h. |

Agente nuevo: subclase de `agents/base.py:Agent` añadida a `agents/__init__.py:TEAM`. El
Director lo conoce por su `description` y el dashboard le da el siguiente puesto libre de la oficina.

## Reddit

**PROTOCOLO OSIRIS:** Karma Farmer y Reddit se conservan desactivados mediante
`karma_farmer.enabled=false`. El módulo no ejecuta lecturas, generación ni envíos.

Se usa Chromium con `playwright.async_api` y un perfil persistente dedicado. Tanto las
publicaciones como los títulos, el historial y el karma se leen en páginas renderizadas de
`old.reddit.com`; no se utiliza PRAW ni la API de Reddit. Se mantienen el plan diario, las
directrices del Director y los límites de publicación existentes. La conexión a OpenAI y la
sincronización con Mission Control siguen usando sus clientes actuales.

Conectar la cuenta (una vez, en ServerCesar):

1. Detener la tarea `Scarlett Agency` antes de preparar el perfil.
2. En PowerShell:
   ```powershell
   cd $env:LOCALAPPDATA\ScarlettAgency\app
   ..\venv\Scripts\python.exe -m agency setup-reddit
   ```
   Pide el nombre de usuario y abre Chromium para iniciar sesión. Pulsa Enter en la consola
   después de entrar para guardar y cerrar el perfil. No pide credenciales de API.
3. Reiniciar la tarea `Scarlett Agency` para cargar los ajustes.

Instalación, selectores, ruta del perfil y conexión exacta al dashboard:
[`docs/karma-playwright.md`](../docs/karma-playwright.md).

## Instalación y actualización

```powershell
cd C:\Homelab\repos\CesarHomeLab\agency-backend
.\install.ps1
```

Crea `%LOCALAPPDATA%\ScarlettAgency\` (venv, código, base de datos, registros, secretos) y la tarea
`Scarlett Agency`. La primera vez genera el token del backend, lo sube como secreto de GitHub y
lanza `agency-secrets.yml`, que lo copia al proyecto Pages y redespliega. Para actualizar el
código basta con volver a ejecutarlo.

## Apagones y cortes de red

- La tarea arranca al iniciar sesión (el PC entra solo) y se relanza cada 5 minutos y tras un fallo;
  un candado impide dos instancias.
- Todo el estado vive en SQLite con `synchronous=FULL`: el plan del día, los posts, las fotos de karma,
  el chat, las directrices y la cola de eventos. Si no hay red, los eventos y las respuestas del
  Director se acumulan y se suben al volver; el dashboard marca la oficina «sin señal».
- Si a la hora prevista el PC estaba apagado o sin red, el Karma Farmer publica al volver (tras 3–15
  minutos de margen) mientras siga dentro de la ventana (+45 min). Si no, el día queda «perdido».
- Antes de enviar se anota el título. Si el clic queda sin confirmar, se marca Error y no se
  reintenta automáticamente. Una orden posterior primero busca ese título en los posts recientes;
  si no puede confirmarlo, mantiene el estado PROTOCOLO OSIRIS. Un historial incompleto
  puede requerir revisión local del marcador `karma:submitting`.
- La clave de OpenAI llega del secreto `OPENAI_API_KEY` de Pages y se guarda con DPAPI; si cambia, se
  vuelve a pedir sola.

## Comandos

```powershell
cd $env:LOCALAPPDATA\ScarlettAgency\app
..\venv\Scripts\python.exe -m agency status    # estado local en JSON
..\venv\Scripts\python.exe -m agency dry-run   # genera una pregunta sin publicarla
Get-Content $env:LOCALAPPDATA\ScarlettAgency\logs\agency.log -Tail 50
```
