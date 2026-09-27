param([string]$NodePath)
$ErrorActionPreference='Stop'
$Config=Join-Path $env:LOCALAPPDATA 'CesarHomeLab/RemoteBrowser/settings.json'
if(!(Test-Path -LiteralPath $Config)){throw 'Run the installer first.'}
$Existing=$null
try {$Existing=Invoke-RestMethod -Uri 'http://127.0.0.1:18763/status' -TimeoutSec 2} catch {}
if($Existing){
 if($Existing.ready -and $Existing.connected){Write-Output 'Remote Browser is already connected.';return}
 throw 'Remote Browser is running but not ready. Use Apagar, then Iniciar sesion or Activar again.'
}
$Node=if($NodePath){$NodePath}else{(Get-Command node -ErrorAction Stop).Source}
$HostFile=Join-Path $PSScriptRoot 'host.mjs'
$Private=Split-Path $Config
$OutputLog=Join-Path $Private 'host-output.log'
$ErrorLog=Join-Path $Private 'host-error.log'
# Do not inherit the GUI launcher's redirected pipes: it waits for their EOF.
$HostProcess=Start-Process -FilePath $Node -ArgumentList ('"'+$HostFile+'" "'+$Config+'"') -WindowStyle Hidden -WorkingDirectory $PSScriptRoot -RedirectStandardOutput $OutputLog -RedirectStandardError $ErrorLog -PassThru
$Deadline=(Get-Date).AddSeconds(55)
do {
 Start-Sleep -Milliseconds 500
 $HostProcess.Refresh()
 if($HostProcess.HasExited){throw "Remote Browser exited. Details: $ErrorLog"}
 try {$State=Invoke-RestMethod 'http://127.0.0.1:18763/status' -TimeoutSec 2} catch {continue}
 if($State.ready -and $State.connected){Write-Output 'Browser ready and connected to Mission Control.';return}
} while((Get-Date) -lt $Deadline)
throw "Remote Browser did not become ready within 55 seconds. Details: $OutputLog and $ErrorLog"
