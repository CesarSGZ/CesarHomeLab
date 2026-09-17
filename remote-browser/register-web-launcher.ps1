$ErrorActionPreference='Stop'
# Manual protocol handler only. No background listener, startup task or login trigger.
$Key='HKCU:\Software\Classes\cesar-remote'
$Shell=(Get-Command pwsh -ErrorAction Stop).Source
$Script=Join-Path $PSScriptRoot 'web-launcher.ps1'
New-Item -Path "$Key\shell\open\command" -Force | Out-Null
Set-Item -Path $Key -Value 'URL:CesarPC Remote Browser'
New-ItemProperty -Path $Key -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
Set-Item -Path "$Key\shell\open\command" -Value ('"'+$Shell+'" -NoProfile -WindowStyle Hidden -File "'+$Script+'" -Link "%1"')
$Task=Get-ScheduledTask -TaskName 'CesarHomeLab Remote Browser' -ErrorAction SilentlyContinue
if($Task){Disable-ScheduledTask -TaskName $Task.TaskName | Out-Null}
Write-Output 'Manual web launcher registered. Remote Browser automatic startup disabled.'
