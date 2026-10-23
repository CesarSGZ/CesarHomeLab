<#
  Instala o actualiza el backend de la Agencia en ServerCesar (sin permisos de administrador).

  - Crea %LOCALAPPDATA%\ScarlettAgency\venv con Python 3.12 y las librerías de requirements.txt.
  - Copia el código a %LOCALAPPDATA%\ScarlettAgency\app (el servicio no corre desde el repositorio).
  - La primera vez crea el token del backend: lo guarda con DPAPI en el PC, lo sube como secreto
    AGENCY_AGENT_TOKEN de GitHub y lanza el workflow agency-secrets.yml, que lo copia a Cloudflare.
  - Registra la tarea «Scarlett Agency»: al iniciar sesión (el PC entra solo tras un apagón) y
    revivida cada 5 minutos; el propio servicio impide que haya dos a la vez.

  Uso:  .\install.ps1            instalar / actualizar
        .\install.ps1 -NewToken  rotar el token del backend
#>
param([switch]$NewToken)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Join-Path $env:LOCALAPPDATA 'ScarlettAgency'
$repo = 'CesarSGZ/CesarHomeLab'

$python = @("$env:LOCALAPPDATA\Programs\Python\Python312\python.exe", "$env:ProgramFiles\Python312\python.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $python) {
  winget install -e --id Python.Python.3.12 --scope user --silent --accept-package-agreements --accept-source-agreements --disable-interactivity | Out-Null
  $python = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
  if (-not (Test-Path $python)) { throw 'No se pudo instalar Python 3.12' }
}

New-Item -ItemType Directory -Force $root, "$root\app", "$root\logs" | Out-Null
# Keep the service stopped throughout the update; failures leave it disabled.
$existingTask = Get-ScheduledTask -TaskName 'Scarlett Agency' -ErrorAction SilentlyContinue
if ($existingTask) {
  Disable-ScheduledTask -TaskName 'Scarlett Agency' | Out-Null
  Stop-ScheduledTask -TaskName 'Scarlett Agency'
}
$venvPy = "$root\venv\Scripts\python.exe"
if (-not (Test-Path $venvPy)) { & $python -m venv "$root\venv"; if ($LASTEXITCODE) { throw 'venv' } }
& $venvPy -m pip install --disable-pip-version-check -q --upgrade pip
& $venvPy -m pip install --disable-pip-version-check -q -r "$here\requirements.txt"
if ($LASTEXITCODE) { throw 'pip install' }

# Para la versión anterior antes de copiar el código nuevo.
Get-ScheduledTask -TaskName 'Scarlett Agency' -ErrorAction SilentlyContinue | Stop-ScheduledTask -ErrorAction SilentlyContinue
Get-CimInstance Win32_Process -Filter "Name='pythonw.exe'" | Where-Object { $_.CommandLine -like '*-m agency run*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
$backup = Join-Path $root ('backups\' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
New-Item -ItemType Directory -Path $backup -Force | Out-Null
if (Test-Path -LiteralPath "$root\settings.json") { Copy-Item -LiteralPath "$root\settings.json" -Destination $backup }
if (Test-Path -LiteralPath "$root\agency.db") {
  & $venvPy -c 'import sqlite3,sys; a=sqlite3.connect(sys.argv[1]); b=sqlite3.connect(sys.argv[2]); a.backup(b); b.close(); a.close()' "$root\agency.db" "$backup\agency.db"
  if ($LASTEXITCODE) { throw 'No se pudo guardar una copia consistente de SQLite' }
}
if (Test-Path -LiteralPath "$root\app\agency") {
  Copy-Item -LiteralPath "$root\app\agency" -Destination "$backup\agency" -Recurse
}
$appTarget = [IO.Path]::GetFullPath((Join-Path $root 'app\agency'))
$appParent = [IO.Path]::GetFullPath((Join-Path $root 'app')) + [IO.Path]::DirectorySeparatorChar
if (-not $appTarget.StartsWith($appParent, [StringComparison]::OrdinalIgnoreCase)) { throw 'Destino de instalación no válido' }
robocopy "$here\agency" "$root\app\agency" /MIR /NFL /NDL /NJH /NJS /NP /XD __pycache__ | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy $LASTEXITCODE" }

Push-Location "$root\app"
try {
  & $venvPy -m agency migrate-settings
  if ($LASTEXITCODE) { throw 'No se pudo migrar settings.json' }
  & $venvPy -m agency has-token
  if ($LASTEXITCODE -ne 0 -or $NewToken) {
    & $venvPy -m agency new-token $repo
    if ($LASTEXITCODE) { throw 'new-token' }
  }
  & $venvPy -m agency check
  if ($LASTEXITCODE) { throw 'Comprobación fallida. La tarea queda detenida; revisa la conexión y vuelve a instalar.' }
} finally { Pop-Location }

$userId = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$every5min = { param($t) $t.Repetition = (New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)).Repetition; $t }
$triggers = @((New-ScheduledTaskTrigger -AtLogOn -User $userId), (& $every5min (New-ScheduledTaskTrigger -Daily -At '00:00')))
$action = New-ScheduledTaskAction -Execute "$root\venv\Scripts\pythonw.exe" -Argument '-m agency run' -WorkingDirectory "$root\app"
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'Scarlett Agency' -Description 'Backend de la Agencia (Director + Karma Farmer). Habla con Mission Control por HTTPS saliente.' `
  -Action $action -Trigger $triggers -Principal $principal -Settings $settings -Force | Out-Null
Enable-ScheduledTask -TaskName 'Scarlett Agency' | Out-Null
Start-ScheduledTask -TaskName 'Scarlett Agency'
Write-Host "Agencia instalada en $root. Registro: $root\logs\agency.log"
