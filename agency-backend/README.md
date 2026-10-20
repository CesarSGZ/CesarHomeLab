# Backend de la Agencia (Scarlett Storm)

El equipo de agentes de la vista **06 · Agencia** del Mission Control. Corre en ServerCesar
(Python 3.12, sin permisos de administrador) y habla con Cloudflare solo por HTTPS saliente.

```text
Dashboard (/control/#agency) ── GET status · POST chat / command ──► Pages Functions ──► D1 (agency_*)
                                                                          ▲
ServerCesar · tarea «Scarlett Agency» ── POST /api/agent/agency cada 3–15 s ┘  (token AGENCY_AGENT_TOKEN)
      └─ Director       chat con César, directrices, órdenes al equipo (OpenAI)
```

## Agentes

| Agente | Qué hace |
| --- | --- |
| Director (`agents/director.py`) | Lee el chat, contesta con `gpt-6.1-sol` y puede guardar o retirar directrices, pausar, reanudar o pedir a un agente que trabaje ya. Las directrices se pasan a los trabajadores en cada tarea. |
| Karma Farmer (`agents/karma_farmer.py`) | Programa una pregunta diaria, lee Reddit con Playwright y guarda publicaciones y mediciones de karma en SQLite. |

Agente nuevo: subclase de `agents/base.py:Agent` añadida a `agents/__init__.py:TEAM`. El
Director lo conoce por su `description` y el dashboard le da el siguiente puesto libre de la oficina.

## Instalación y actualización

```powershell
cd C:\Homelab\repos\CesarHomeLab\agency-backend
.\install.ps1
```

Crea `%LOCALAPPDATA%\ScarlettAgency\` (venv, código, base de datos, registros, secretos) y la tarea
`Scarlett Agency`. La primera vez genera el token del backend, lo sube como secreto de GitHub y
lanza `agency-secrets.yml`, que lo copia al proyecto Pages y redespliega. Para actualizar el
código basta con volver a ejecutarlo.

El instalador deshabilita y detiene la tarea durante la actualización, guarda una copia del
código, ajustes y SQLite en `backups/`, retira el antiguo interruptor de configuración y conserva
los secretos DPAPI. Antes de arrancar comprueba la nube, el acceso a los modelos y la sesión real
de Reddit. Si falla, deja la tarea detenida para corregir la causa sin consumir generaciones.

Para preparar o recuperar Reddit, desde la carpeta instalada y con la tarea detenida:

```powershell
..\venv\Scripts\python.exe -m agency setup-reddit
..\venv\Scripts\python.exe -m agency check
# Prueba opcional de generación real, contabilizada en el presupuesto:
..\venv\Scripts\python.exe -m agency check --generate
```

La comprobación de modelos y sesión no genera texto. El Director solo genera al recibir chat;
Karma Farmer genera cuando vence su plan o recibe una orden explícita, después de leer Reddit.
El límite predeterminado es 1 USD y 20 peticiones por día, compartido por todo el equipo.
Cada petición reserva presupuesto en SQLite antes del envío; un corte conserva esa reserva.
Los límites son locales y dependen de las tarifas documentadas en `llm.py`; no sustituyen el
control de facturación de OpenAI. Las respuestas ambiguas no se reintentan automáticamente.

## Apagones y cortes de red

- La tarea arranca al iniciar sesión (el PC entra solo) y se relanza cada 5 minutos y tras un fallo;
  un candado impide dos instancias.
- Todo el estado vive en SQLite con `synchronous=FULL`: el plan del día, los posts, las fotos de karma,
  el chat, las directrices y la cola de eventos. Si no hay red, los eventos y las respuestas del
  Director se acumulan y se suben al volver; el dashboard marca la oficina «sin señal».
- La clave de OpenAI llega del secreto `OPENAI_API_KEY` de Pages y se guarda con DPAPI; si cambia, se
  vuelve a pedir sola.

## Comandos

```powershell
cd $env:LOCALAPPDATA\ScarlettAgency\app
..\venv\Scripts\python.exe -m agency status    # estado local en JSON
Get-Content $env:LOCALAPPDATA\ScarlettAgency\logs\agency.log -Tail 50
```
