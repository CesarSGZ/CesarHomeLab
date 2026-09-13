param([string]$NodePath)
$ErrorActionPreference='Stop'
$Config=Join-Path $env:LOCALAPPDATA 'CesarHomeLab/RemoteBrowser/settings.json'
if(!(Test-Path -LiteralPath $Config)){throw 'Run the installer first.'}
try {$null=Invoke-WebRequest -Uri 'http://127.0.0.1:18763/status' -TimeoutSec 2; Write-Output 'Remote Browser is already running.'; return} catch {}
$Node=if($NodePath){$NodePath}else{(Get-Command node -ErrorAction Stop).Source}
$HostFile=Join-Path $PSScriptRoot 'host.mjs'
Start-Process -FilePath $Node -ArgumentList ('"'+$HostFile+'" "'+$Config+'"') -WindowStyle Hidden -WorkingDirectory $PSScriptRoot
