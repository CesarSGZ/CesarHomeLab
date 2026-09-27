param([string]$Link,[switch]$Check,[switch]$Confirmed)
$ErrorActionPreference='Stop'
$Log=Join-Path $env:LOCALAPPDATA 'CesarHomeLab/RemoteBrowser/launcher.log'
function Record([string]$Message){Add-Content -LiteralPath $Log -Value ((Get-Date -Format o)+' '+$Message)}
Record 'Launcher invoked'
Add-Type -AssemblyName System.Windows.Forms
try {
 if($Link -notmatch '^cesar-remote://(login|start|stop)/?$'){throw 'Invalid launcher action.'}
 if($Check){Write-Output 'Launcher ready. No action executed.';exit 0}
 $Mode=$Matches[1]
 Record ('Validated action: '+$Mode)
 $Labels=@{login='Abrir el navegador dedicado para iniciar sesion en ChatGPT';start='Activar Remote Browser en este PC';stop='Apagar Remote Browser en este PC'}
 if(!$Confirmed -and [System.Windows.Forms.MessageBox]::Show($Labels[$Mode]+'?','CesarPC - Remote Browser','YesNo','Question','Button2','DefaultDesktopOnly') -ne 'Yes'){Record 'Cancelled';exit}
 if($Mode -eq 'login'){
  & (Join-Path $PSScriptRoot 'local-login.ps1')
  if(!$Confirmed){[System.Windows.Forms.MessageBox]::Show('Inicia sesion en la ventana de Edge que se ha abierto. Cuando veas tus conversaciones, cierra esa ventana y pulsa Activar en tu web.','Paso siguiente') | Out-Null}
  exit
 }
 $HostFile=Join-Path $PSScriptRoot 'host.mjs'
 if($Mode -eq 'stop'){
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {$_.CommandLine -and $_.CommandLine.Contains($HostFile)} | ForEach-Object {Stop-Process -Id $_.ProcessId}
 }
 $Running=$false
 try {$null=Invoke-WebRequest 'http://127.0.0.1:18763/status' -UseBasicParsing -TimeoutSec 2; $Running=$true} catch {}
 if(!$Running){
  $Config=Get-Content -LiteralPath (Join-Path $env:LOCALAPPDATA 'CesarHomeLab/RemoteBrowser/settings.json') -Raw | ConvertFrom-Json
  $Profile=Join-Path $Config.dataDirectory $(if($Config.profileDirectory){$Config.profileDirectory}else{'browser-profile'})
  $BrowserProcess=[IO.Path]::GetFileName($Config.browserPath)
  # A profile may own several windows. Close each gracefully before taking its lock.
  for($Attempt=0;$Attempt -lt 20;$Attempt++){
   $Dedicated=@(Get-CimInstance Win32_Process | Where-Object {$_.Name -eq $BrowserProcess -and $_.CommandLine -and $_.CommandLine.Contains($Profile) -and $_.CommandLine -notmatch '--type='})
   if(!$Dedicated.Count){break}
   foreach($Item in $Dedicated){$Process=Get-Process -Id $Item.ProcessId -ErrorAction SilentlyContinue;if($Process){$null=$Process.CloseMainWindow()}}
   Start-Sleep -Milliseconds 500
  }
  $Remaining=@(Get-CimInstance Win32_Process | Where-Object {$_.Name -eq $BrowserProcess -and $_.CommandLine -and $_.CommandLine.Contains($Profile) -and $_.CommandLine -notmatch '--type='})
  if($Remaining.Count){throw 'Close all dedicated Remote Browser windows, then activate again. Your normal Brave windows can stay open.'}
 }
 if($Mode -eq 'start'){
  $Node=Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
  & (Join-Path $PSScriptRoot 'start-host.ps1') -NodePath $Node
 }
} catch {Record ('Error: '+$_.Exception.Message);if($Confirmed){Write-Error $_ -ErrorAction Continue}else{[System.Windows.Forms.MessageBox]::Show($_.Exception.Message,'Remote Browser - Error','OK','Error','Button1','DefaultDesktopOnly') | Out-Null};exit 1}
