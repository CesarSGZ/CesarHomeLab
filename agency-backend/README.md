# Agencia Scarlett Storm

El servicio de Windows prepara contenido para que César lo adapte y publique manualmente.
No utiliza una sesión de Reddit ni publica, vota o mide karma automáticamente.

## Equipo y cadencia

- Reddit Planner (`karma-farmer`, ID conservado por compatibilidad) prepara una propuesta diaria a las 09:00 en Europe/Madrid.
- El Director revisa cada propuesta y responde al chat. Las directrices del chat se usan en las siguientes propuestas.
- El resultado contiene título, instrucciones, revisión y fecha. Se muestra en Mission Control y se exporta a `deliveries/reddit-drafts.json` y CSV.
- Una automatización diaria de Codex sincroniza los IDs nuevos con Google Sheets a las 09:15 usando la conexión de Google Drive de la tarea. Conserva los estados, enlaces y notas de filas existentes. El PC y Codex deben estar disponibles. La automatización se administra en Codex; este repositorio no incluye credenciales de Google.

La hoja tiene Estado, URL publicada, Fecha publicación y Notas de César. Marcar una propuesta como preparada no significa que se haya publicado. César realiza y registra esa acción.

## Instalación

```powershell
cd C:\Homelab\repos\CesarHomeLab\agency-backend
.\install.ps1
```

El instalador detiene la tarea, guarda código, ajustes y SQLite en `backups/`, actualiza el entorno y copia el backend a `%LOCALAPPDATA%\ScarlettAgency\app`.
Reutiliza los secretos DPAPI existentes. Migra los antiguos ajustes de Reddit al bloque `planning` y comprueba el acceso a la nube y a ambos modelos antes de habilitar y arrancar Scarlett Agency.
La URL de la hoja y el modo `sheet_sync=codex_daily` viven en settings.json, fuera del repositorio.

```powershell
cd "$env:LOCALAPPDATA\ScarlettAgency\app"
..\venv\Scripts\python.exe -m agency status
..\venv\Scripts\python.exe -m agency check
# Solo con la tarea detenida: prepara o recupera la propuesta de hoy.
..\venv\Scripts\python.exe -m agency prepare
```

## Consumo y recuperación

El límite local predeterminado compartido es 1 USD y 20 peticiones de OpenAI al día.
Una propuesta usa una generación ligera y una revisión del Director. El Director en reposo y la sincronización de estado no generan texto.
Cada llamada reserva presupuesto en SQLite antes del envío. Las solicitudes ambiguas conservan la reserva y no se repiten automáticamente. La estimación depende de las tarifas de `llm.py`; no sustituye la facturación de OpenAI.
La sincronización diaria de la hoja utiliza además una ejecución breve de Codex, independiente del presupuesto de la API.

SQLite conserva chat, directrices, eventos, publicaciones históricas y propuestas. El día tiene una clave única: los reinicios y órdenes repetidas no crean otro borrador ni vuelven a generar uno ya terminado.
Si falla la revisión, Preparar ahora recupera el título guardado y solo repite la fase pendiente. Un fallo queda visible y requiere una orden explícita; el servicio no entra en un bucle de generación.

## Comprobaciones

```powershell
python -m unittest discover -s tests -v
cd ..
node --test tests/*.test.mjs
```

Las pruebas cubren presupuesto, concurrencia, recuperación del chat y de las propuestas, entregas sin cliente de Reddit, deduplicación, horarios, pausas, sanitización y controles de la interfaz.
