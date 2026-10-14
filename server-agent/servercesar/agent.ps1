# ServerCesar agent: runs as SYSTEM from boot (scheduled task), with or without a user session.
# Every 30 s it keeps the Parsec and Tailscale services running, makes sure the guardian runs in
# SERVERCESAR's desktop, and posts the PC + app health to Mission Control over outbound HTTPS.
# Mission Control can hand back one command only: "reboot", which restarts Windows.
[CmdletBinding()]
param(
    [string]$Root = 'C:\ProgramData\ServerCesar'
)

$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Security

$AgentVersion = '1.0.0'
$SiteBaseUrl = 'https://cesar-solla.pages.dev'
$IntervalSeconds = 30
$GuardianTask = 'ServerCesar Guardian'
$statePath = Join-Path $Root 'state\apps.json'
$logPath = Join-Path $Root 'logs\agent.log'
$serviceRestarts = @{ Parsec = 0; Tailscale = 0 }
$pendingDone = $null
$lastStoreScan = ''

function Write-Log([string]$Message) {
    try {
        if ((Test-Path $logPath) -and (Get-Item $logPath).Length -gt 1MB) { Move-Item $logPath "$logPath.1" -Force }
        Add-Content -Path $logPath -Value ("{0:yyyy-MM-dd HH:mm:ss} {1}" -f (Get-Date), $Message) -Encoding UTF8
    } catch { }
}

function Read-AgentToken {
    $encrypted = [Convert]::FromBase64String((Get-Content -Raw (Join-Path $Root 'agent-token.enc')).Trim())
    $entropy = [Text.Encoding]::UTF8.GetBytes('ServerCesar-Agent-v1')
    $plain = [Security.Cryptography.ProtectedData]::Unprotect($encrypted, $entropy, [Security.Cryptography.DataProtectionScope]::LocalMachine)
    [Text.Encoding]::UTF8.GetString($plain)
}

function Repair-Services {
    foreach ($name in @($serviceRestarts.Keys)) {
        $svc = Get-Service $name -ErrorAction SilentlyContinue
        if (-not $svc) { continue }
        if ($svc.StartType -ne 'Automatic') { Set-Service $name -StartupType Automatic; Write-Log "$name set to Automatic" }
        if ($svc.Status -ne 'Running') {
            $serviceRestarts[$name]++
            Write-Log "$name service was $($svc.Status), starting"
            try { Start-Service $name -ErrorAction Stop } catch { Write-Log "start $name failed: $($_.Exception.Message)" }
        }
    }
}

function Test-UserSession {
    [bool](Get-CimInstance Win32_Process -Filter "Name='explorer.exe'" -ErrorAction SilentlyContinue |
        Where-Object { (Invoke-CimMethod -InputObject $_ -MethodName GetOwner -ErrorAction SilentlyContinue).User -eq 'SERVERCESAR' })
}

function Repair-Guardian([bool]$userSession) {
    if (-not $userSession) { return }
    $fresh = (Test-Path $statePath) -and ((Get-Date) - (Get-Item $statePath).LastWriteTime).TotalSeconds -lt 120
    $task = Get-ScheduledTask -TaskName $GuardianTask -ErrorAction SilentlyContinue
    if ($task -and (-not $fresh) -and $task.State -ne 'Running') {
        Write-Log 'guardian not running, starting it'
        Start-ScheduledTask -TaskName $GuardianTask
    }
}

# Asks the Microsoft Store to look for app updates (ChatGPT) once a day.
function Invoke-StoreScan {
    $day = (Get-Date).ToString('yyyy-MM-dd')
    if ((Get-Date).Hour -ne 4 -or $day -eq $script:lastStoreScan) { return }
    $script:lastStoreScan = $day
    try {
        Get-CimInstance -Namespace 'root\cimv2\mdm\dmmap' -ClassName 'MDM_EnterpriseModernAppManagement_AppManagement01' |
            Invoke-CimMethod -MethodName UpdateScanMethod | Out-Null
        Write-Log 'store update scan requested'
    } catch { Write-Log "store scan failed: $($_.Exception.Message)" }
}

function Get-Report([bool]$userSession) {
    $os = Get-CimInstance Win32_OperatingSystem
    $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
    $cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
    $report = [ordered]@{
        agentVersion = $AgentVersion
        bootTime = [double]([DateTimeOffset]$os.LastBootUpTime).ToUnixTimeMilliseconds()
        cpu = [double]$cpu
        ram = [double][Math]::Round(100 * (1 - $os.FreePhysicalMemory / $os.TotalVisibleMemorySize), 1)
        diskFreeGb = [double][Math]::Round($disk.FreeSpace / 1GB, 1)
        userSession = $userSession
        apps = [ordered]@{}
    }
    $guardian = $null
    if (Test-Path $statePath) {
        try { $guardian = Get-Content -Raw $statePath | ConvertFrom-Json } catch { }
    }
    $guardianFresh = $guardian -and ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $guardian.at) -lt 120000
    if ($guardian) { $report.guardianAt = [double]$guardian.at }
    foreach ($key in 'claude', 'chatgpt', 'parsec', 'tailscale') {
        $app = [ordered]@{}
        if ($guardianFresh -and $guardian.apps.$key) {
            foreach ($p in $guardian.apps.$key.PSObject.Properties) { $app[$p.Name] = $p.Value }
        } else {
            $app.running = $false
            $app.detail = $(if ($userSession) { 'El guardian no da senal' } else { 'Sin sesion de Windows iniciada' })
        }
        $report.apps[$key] = $app
    }
    # Services and the tailnet are checked by SYSTEM directly, so they are right even without a desktop session.
    foreach ($pair in @(@('parsec', 'Parsec'), @('tailscale', 'Tailscale'))) {
        $svc = Get-Service $pair[1] -ErrorAction SilentlyContinue
        $report.apps[$pair[0]].service = $(if ($svc) { $svc.Status.ToString().ToLowerInvariant() } else { 'missing' })
    }
    try {
        $ts = & "$env:ProgramFiles\Tailscale\tailscale.exe" status --json 2>$null | Out-String | ConvertFrom-Json
        $report.apps.tailscale.signedIn = $ts.BackendState -eq 'Running'
        $report.apps.tailscale.online = [bool]$ts.Self.Online
        $report.apps.tailscale.version = ($ts.Version -split '-')[0]
        $report.apps.tailscale.detail = $ts.BackendState
        if (-not $guardianFresh) { $report.apps.tailscale.running = $ts.BackendState -eq 'Running' }
    } catch { }
    $report
}

function Invoke-Reboot($command) {
    Write-Log "reboot requested ($($command.id))"
    & shutdown.exe /r /f /t 20 /d p:4:1 /c 'Reinicio solicitado desde Mission Control' 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        return @{ id = $command.id; ok = $true; detail = 'Reinicio de Windows programado en 20 s' }
    }
    return @{ id = $command.id; ok = $false; detail = "shutdown.exe devolvio $LASTEXITCODE" }
}

$token = Read-AgentToken
Write-Log "agent $AgentVersion started"

while ($true) {
    try {
        Repair-Services
        $userSession = Test-UserSession
        Repair-Guardian $userSession
        Invoke-StoreScan
        $body = @{ report = (Get-Report $userSession) }
        if ($pendingDone) { $body.done = $pendingDone }
        $json = $body | ConvertTo-Json -Depth 6 -Compress
        $response = Invoke-RestMethod -Method Post -Uri "$SiteBaseUrl/api/agent/servercesar" -Headers @{ Authorization = "Bearer $token" } `
            -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($json)) -TimeoutSec 20
        $pendingDone = $null
        if ($response.command -and $response.command.type -eq 'reboot') {
            $pendingDone = Invoke-Reboot $response.command
            # Report the result straight away: Windows goes down in 20 s.
            $body = @{ report = (Get-Report $userSession); done = $pendingDone }
            $json = $body | ConvertTo-Json -Depth 6 -Compress
            Invoke-RestMethod -Method Post -Uri "$SiteBaseUrl/api/agent/servercesar" -Headers @{ Authorization = "Bearer $token" } `
                -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($json)) -TimeoutSec 20 | Out-Null
            $pendingDone = $null
        }
    } catch {
        Write-Log "cycle failed: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds $IntervalSeconds
}
