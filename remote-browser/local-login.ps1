# Human-only sign-in mode. Stops remote control before launching the same dedicated
# profile in a normal browser. No debugging/automation flags or cookie copying.
$ErrorActionPreference='Stop'
$Private=Join-Path $env:LOCALAPPDATA 'CesarHomeLab/RemoteBrowser'
$Config=Get-Content -LiteralPath (Join-Path $Private 'settings.json') -Raw | ConvertFrom-Json
$HostFile=Join-Path $PSScriptRoot 'host.mjs'
$Profile=Join-Path $Config.dataDirectory 'browser-profile'
$Task=Get-ScheduledTask -TaskName 'CesarHomeLab Remote Browser' -ErrorAction SilentlyContinue
if($Task -and $Task.State -eq 'Running'){Stop-ScheduledTask -TaskName 'CesarHomeLab Remote Browser'}
$Hosts=@(Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -and $_.CommandLine.Contains($HostFile) })
foreach($Item in $Hosts){Stop-Process -Id $Item.ProcessId -ErrorAction Stop}
Start-Sleep -Milliseconds 1500
$Dedicated=@(Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'msedge.exe' -and $_.CommandLine -and $_.CommandLine.Contains($Profile) -and $_.CommandLine -notmatch '--type=' })
foreach($Item in $Dedicated){
 $Process=Get-Process -Id $Item.ProcessId -ErrorAction SilentlyContinue
 if($Process){$null=$Process.CloseMainWindow()}
}
Start-Sleep -Milliseconds 1500
$Remaining=@(Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'msedge.exe' -and $_.CommandLine -and $_.CommandLine.Contains($Profile) -and $_.CommandLine -notmatch '--type=' })
if($Remaining.Count){throw 'Close only the dedicated ChatGPT browser window, then run this helper again.'}
Start-Process -FilePath $Config.browserPath -ArgumentList ('--user-data-dir="'+$Profile+'" --no-first-run --new-window https://chatgpt.com/')
Write-Output 'Normal Edge opened for manual sign-in. Remote sharing is stopped. After signing in to ChatGPT, close this dedicated window and run start-host.ps1.'
