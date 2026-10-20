# Backend de la Agencia (Scarlett Storm)

El equipo de agentes de la vista **06 · Agencia** del Mission Control. Corre en ServerCesar
(Python 3.12, sin permisos de administrador) y habla con Cloudflare solo por HTTPS saliente.

```text
Dashboard (/control/#agency) ── GET status · POST chat / command ──► Pages Functions ──► D1 (agency_*)
                                                                          ▲
ServerCesar · tarea «Scarlett Agency» ── POST /api/agent/agency cada 3–15 s ┘  (token AGENCY_AGENT_TOKEN)
      ├─ Director       chat con César, directrices, órdenes al equipo (OpenAI)
      └─ Karma Farmer   1 pregunta/día en r/AskReddit a hora aleatoria + karma (OpenAI + API de Reddit)
```

## Agentes

| Agente | Qué hace |
| --- | --- |
| Director (`agents/director.py`) | Lee el chat, contesta con `gpt-6.1-sol` y puede guardar o retirar directrices, pausar, reanudar o pedir a un agente que trabaje ya. Las directrices se pasan a los trabajadores en cada tarea. |
| Karma Farmer (`agents/karma_farmer.py`) | Cada día sortea una hora dentro de la ventana de `settings.json` (10:00–23:15 por defecto). A esa hora lee lo que hay en portada de r/AskReddit, genera candidatas con `gpt-6-luna`, descarta las que incumplen las normas del subreddit (sí/no, enlaces, temas vetados, parecidas a otras) y publica la mejor. Cada 3 h mide el karma de la cuenta y los votos y comentarios de sus posts. Máximo 2 posts en 24 h. |

Agente nuevo: subclase de `agents/base.py:Agent` añadida a `agents/__init__.py:TEAM`. El
Director lo conoce por su `description` y el dashboard le da el siguiente puesto libre de la oficina.

## Reddit

Se usa la **API oficial** de Reddit con PRAW (app de tipo *script*), con un User-Agent que
identifica al cliente y los límites de ritmo de PRAW. No hay navegador automatizado ni ocultación
de huellas: es la vía que Reddit admite para automatizar una cuenta propia. Para que la cuenta no
acabe filtrada, el Karma Farmer publica poco (1 al día), solo preguntas que cumplen las normas de
r/AskReddit, y nunca enlaces ni promoción.

Conectar la cuenta (una vez, en ServerCesar):

1. Con la sesión de la cuenta abierta en el navegador, ir a <https://www.reddit.com/prefs/apps> y
   crear una app de tipo **script** (redirect uri: `http://localhost:8080`).
2. En PowerShell:
   ```powershell
   cd $env:LOCALAPPDATA\ScarlettAgency\app
   ..\venv\Scripts\python.exe -m agency setup-reddit
   ```
   Pide el *client id*, el *secret*, el usuario y la contraseña, comprueba que entra y lo guarda
   cifrado con DPAPI. El servicio lo detecta solo, sin reiniciar.

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
- Un corte en mitad de una publicación no la duplica: el título se anota antes de enviarlo y, al
  volver, se busca en los posts recientes de la cuenta.
- La clave de OpenAI llega del secreto `OPENAI_API_KEY` de Pages y se guarda con DPAPI; si cambia, se
  vuelve a pedir sola.

## Comandos

```powershell
cd $env:LOCALAPPDATA\ScarlettAgency\app
..\venv\Scripts\python.exe -m agency status    # estado local en JSON
..\venv\Scripts\python.exe -m agency dry-run   # genera una pregunta sin publicarla
Get-Content $env:LOCALAPPDATA\ScarlettAgency\logs\agency.log -Tail 50
```
