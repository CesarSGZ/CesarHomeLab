#Requires -RunAsAdministrator
# Installs the ServerCesar agent (SYSTEM, at boot) and guardian (SERVERCESAR, at logon).
#   install.ps1 -TokenFile <file with SERVERCESAR_AGENT_TOKEN>   first install; the file is deleted afterwards
#   install.ps1                                                   update the scripts, keep the stored token
#   install.ps1 -WolHost <ddns> -WolPort <router UDP port> -WolMac <MAC>   set the route the agent checks
[CmdletBinding()]
param(
    [string]$TokenFile,
    [string]$WolHost,
    [int]$WolPort,
    [string]$WolMac,
    [string]$UserId = 'SERVERCESAR',
    [string]$Root = 'C:\ProgramData\ServerCesar'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security

$bin = Join-Path $Root 'bin'
$state = Join-Path $Root 'state'
$logs = Join-Path $Root 'logs'
New-Item -ItemType Directory -Force $Root, $bin, $state, $logs | Out-Null

# Root, bin and logs: only SYSTEM and Administrators can write (the agent runs as SYSTEM from here).
# state: the guardian (unelevated user) writes apps.json there.
& icacls.exe $Root /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' '*S-1-5-32-545:(OI)(CI)RX' | Out-Null
& icacls.exe $state /grant "${UserId}:(OI)(CI)M" | Out-Null

Copy-Item (Join-Path $PSScriptRoot 'agent.ps1'), (Join-Path $PSScriptRoot 'guardian.ps1'), (Join-Path $PSScriptRoot 'prepare-wake.ps1') -Destination $bin -Force

if ($TokenFile) {
    $token = (Get-Content -Raw -LiteralPath $TokenFile).Trim()
    if ($token.Length -lt 32) { throw 'The agent token is too short.' }
    $encrypted = [Security.Cryptography.ProtectedData]::Protect(
        [Text.Encoding]::UTF8.GetBytes($token),
        [Text.Encoding]::UTF8.GetBytes('ServerCesar-Agent-v1'),
        [Security.Cryptography.DataProtectionScope]::LocalMachine)
    [Convert]::ToBase64String($encrypted) | Set-Content -Encoding ASCII -LiteralPath (Join-Path $Root 'agent-token.enc')
    & icacls.exe (Join-Path $Root 'agent-token.enc') /inheritance:r /grant:r '*S-1-5-18:F' '*S-1-5-32-544:F' | Out-Null
    Remove-Item -LiteralPath $TokenFile -Force
}
if (-not (Test-Path (Join-Path $Root 'agent-token.enc'))) { throw 'No agent token stored yet: pass -TokenFile.' }

# Wake-on-LAN route the agent verifies end to end (kept on the PC only: the repository is public).
if ($WolHost -and $WolPort -and $WolMac) {
    [ordered]@{ host = $WolHost; port = $WolPort; mac = $WolMac } | ConvertTo-Json -Compress |
        Set-Content -Encoding ASCII -LiteralPath (Join-Path $Root 'wol-target.json')
}

$powershell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$conhost = "$env:SystemRoot\System32\conhost.exe"
$every5min = { param($t) $t.Repetition = (New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)).Repetition; $t }

# Agent: SYSTEM, at boot, revived every 5 minutes if it ever stops.
$agentAction = New-ScheduledTaskAction -Execute $powershell -WorkingDirectory $bin `
    -Argument "-NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$bin\agent.ps1`""
$agentTriggers = @((New-ScheduledTaskTrigger -AtStartup), (& $every5min (New-ScheduledTaskTrigger -Daily -At '00:00')))
$agentSettings = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'ServerCesar Agent' -Description 'Reports ServerCesar and its apps to Mission Control, keeps Parsec/Tailscale services up, remote reboot.' `
    -Action $agentAction -Trigger $agentTriggers -Settings $agentSettings -User 'SYSTEM' -RunLevel Highest -Force | Out-Null

# Guardian: the user's desktop session, unelevated (apps must not run as admin), hidden console.
$guardianAction = New-ScheduledTaskAction -Execute $conhost -WorkingDirectory $bin `
    -Argument "--headless `"$powershell`" -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$bin\guardian.ps1`""
$guardianTriggers = @((New-ScheduledTaskTrigger -AtLogOn -User $UserId), (& $every5min (New-ScheduledTaskTrigger -Daily -At '00:00')))
$guardianPrincipal = New-ScheduledTaskPrincipal -UserId $UserId -LogonType Interactive -RunLevel Limited
$guardianSettings = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'ServerCesar Guardian' -Description 'Keeps Claude, ChatGPT, Parsec and Tailscale open and signed in on ServerCesar.' `
    -Action $guardianAction -Trigger $guardianTriggers -Principal $guardianPrincipal -Settings $guardianSettings -Force | Out-Null

# Never sleep or hibernate on mains power; keep Tailscale up without a logged-in user and auto-updating.
& powercfg.exe /change standby-timeout-ac 0
& powercfg.exe /change hibernate-timeout-ac 0
# Hidden "System unattended sleep timeout": after an unattended wake (Wake-on-LAN, timer) Windows
# goes back to sleep after 2 minutes without input. 0 = never.
$unattended = '7bc4a2f9-d8fc-4469-b07b-33eb785aaca0'
& powercfg.exe /attributes SUB_SLEEP $unattended -ATTRIB_HIDE
& powercfg.exe /setacvalueindex SCHEME_CURRENT SUB_SLEEP $unattended 0
& powercfg.exe /setactive SCHEME_CURRENT
& "$env:ProgramFiles\Tailscale\tailscale.exe" set --unattended=true --auto-update=true 2>&1 | Out-Null

# Restart the running copies so they pick up new scripts.
foreach ($name in 'ServerCesar Agent', 'ServerCesar Guardian') {
    Stop-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
}
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.CommandLine -match 'ServerCesar\\bin\\(agent|guardian)\.ps1' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-ScheduledTask -TaskName 'ServerCesar Agent'
Start-ScheduledTask -TaskName 'ServerCesar Guardian'
Write-Host 'ServerCesar agent and guardian installed and started.'
