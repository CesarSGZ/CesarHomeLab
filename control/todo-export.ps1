# Copia todas tus listas de Microsoft To Do (con pasos, notas, fechas y repeticiones) a un archivo
# para importarlo en Mission Control > Tareas. Solo lee: no cambia nada en To Do.
# Uso: clic derecho > "Ejecutar con PowerShell", o en una consola:
#   powershell -ExecutionPolicy Bypass -File .\todo-export.ps1
$ErrorActionPreference = 'Stop'

if (-not (Get-Module -ListAvailable -Name Microsoft.Graph.Authentication)) {
  Write-Host 'Instalando el modulo oficial de Microsoft Graph (solo la primera vez)...'
  Install-Module Microsoft.Graph.Authentication -Scope CurrentUser -Force -AllowClobber
}
Import-Module Microsoft.Graph.Authentication

Write-Host 'Se abrira el navegador para entrar con tu cuenta de Microsoft (permiso: leer tus tareas).'
Connect-MgGraph -Scopes 'Tasks.Read' -NoWelcome

# Las fechas llegan en la zona horaria de este PC, no en UTC.
$tz = [System.TimeZoneInfo]::Local.Id
$headers = @{ Prefer = "outlook.timezone=`"$tz`"" }

function Get-All([string]$uri) {
  $items = @()
  while ($uri) {
    $page = Invoke-MgGraphRequest -Method GET -Uri $uri -Headers $headers -OutputType PSObject
    $items += @($page.value)
    $uri = $page.'@odata.nextLink'
  }
  return ,$items
}

$lists = @()
foreach ($list in (Get-All 'https://graph.microsoft.com/v1.0/me/todo/lists')) {
  $tasks = Get-All "https://graph.microsoft.com/v1.0/me/todo/lists/$($list.id)/tasks?`$expand=checklistItems"
  Write-Host ("  {0}: {1} tareas" -f $list.displayName, $tasks.Count)
  $lists += [ordered]@{ id = $list.id; displayName = $list.displayName; wellknownListName = $list.wellknownListName; tasks = $tasks }
}

$folder = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Claude\Datos'
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$file = Join-Path $folder 'microsoft-todo.json'
[ordered]@{ source = 'microsoft-todo'; exported = (Get-Date).ToString('o'); timeZone = $tz; lists = $lists } |
  ConvertTo-Json -Depth 20 | Set-Content -Path $file -Encoding UTF8
Disconnect-MgGraph | Out-Null

Write-Host ''
Write-Host "Listo: $file"
Write-Host 'Ahora abre Mission Control > Tareas > Importar y elige ese archivo.'
Read-Host 'Pulsa Enter para cerrar'
