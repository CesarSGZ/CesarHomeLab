# ServerCesar agent: runs as SYSTEM from boot (scheduled task), with or without a user session.
# Every 120 s it keeps the Parsec and Tailscale services running, makes sure the guardian runs in
# SERVERCESAR's desktop, and posts the PC + app health to Mission Control over outbound HTTPS.
# Mission Control can hand back two commands only: "reboot" and "shutdown" (full shutdown, disabled until S5 recovery is verified).
[CmdletBinding()]
param(
    [string]$Root = 'C:\ProgramData\ServerCesar'
)

$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Security

$AgentVersion = '1.6.0'
$SiteBaseUrl = 'https://cesar-solla.pages.dev'
# 120 s keeps the panel fresh enough for a homelab while keeping D1 operations well under the free tier.
$IntervalSeconds = 120
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
    $resume = Get-ResumeInfo
    $report = [ordered]@{
        agentVersion = $AgentVersion
        bootTime = [double]([DateTimeOffset]$os.LastBootUpTime).ToUnixTimeMilliseconds()
        resumeTime = $(if ($resume) { $resume.at } else { $null })
        lastResume = $resume
        wolPath = $script:WolPath
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

# Last resume cause from Windows, not inferred from a nearby wake request.
function Get-ResumeInfo {
    try {
        $e = Get-WinEvent -FilterHashtable @{ LogName = 'System'; ProviderName = 'Microsoft-Windows-Power-Troubleshooter'; Id = 1 } -MaxEvents 1 -ErrorAction Stop
        [xml]$xml = $e.ToXml()
        $data = @{}
        foreach ($item in $xml.Event.EventData.Data) { $data[[string]$item.Name] = [string]$item.'#text' }
        $kind = 'unknown'
        if ($data.WakeTimerOwner) { $kind = 'timer' }
        elseif ($data.WakeSourceText) {
            $kind = 'other'
            $names = @(Get-NetAdapter -Physical -ErrorAction Stop | Select-Object -ExpandProperty InterfaceDescription)
            if ($names -contains $data.WakeSourceText) { $kind = 'network' }
        }
        $from = switch ($data.EffectiveState) { '4' { 'S3' } '5' { 'S4' } default { $null } }
        return @{ at = [double]([DateTimeOffset]::Parse($data.WakeTime)).ToUnixTimeMilliseconds(); kind = $kind; from = $from }
    } catch { return $null }
}

# Full shutdown is gated locally as well as by the web until S5 recovery is verified.
function Invoke-Power($command) {
    Write-Log "$($command.type) requested ($($command.id))"
    if ($command.type -eq 'shutdown') {
        if (-not (Test-Path (Join-Path $Root 's5-wake-verified.txt'))) {
            return @{ id = $command.id; ok = $false; detail = 'Apagado bloqueado: recuperacion S5 pendiente de verificar' }
        }
        # The machine can stay online over Wi-Fi even when the wired WOL path is unplugged.
        try {
            $wakeTarget = Get-Content -Raw (Join-Path $Root 'wol-target.json') -ErrorAction Stop | ConvertFrom-Json
            $wakeMac = ($wakeTarget.mac -replace '[^0-9a-fA-F]', '').ToUpperInvariant()
            if ($wakeMac.Length -ne 12) { throw 'Invalid wake adapter' }
            $wired = @(Get-NetAdapter -Physical -ErrorAction Stop | Where-Object {
                ($_.MacAddress -replace '[^0-9a-fA-F]', '').ToUpperInvariant() -eq $wakeMac -and $_.Status -eq 'Up'
            })
            if ($wired.Count -ne 1) { throw 'Wake adapter has no link' }
        } catch {
            return @{ id = $command.id; ok = $false; detail = 'Apagado cancelado: la tarjeta de encendido remoto no tiene enlace de red comprobado' }
        }
        & "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'prepare-wake.ps1') 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            return @{ id = $command.id; ok = $false; detail = 'No se pudo preparar el router; apagado cancelado' }
        }
        & shutdown.exe /s /t 20 /d p:4:1 /c 'Apagado solicitado desde Mission Control' 2>&1 | Out-Null
        $detail = 'Apagado completo de Windows programado en 20 s'
    } elseif ($command.type -eq 'reboot') {
        & shutdown.exe /r /f /t 20 /d p:4:1 /c 'Reinicio solicitado desde Mission Control' 2>&1 | Out-Null
        $detail = 'Reinicio de Windows programado en 20 s'
    } else {
        return @{ id = $command.id; ok = $false; detail = 'Comando no reconocido' }
    }
    if ($LASTEXITCODE -eq 0) { return @{ id = $command.id; ok = $true; detail = $detail } }
    return @{ id = $command.id; ok = $false; detail = "shutdown.exe devolvio $LASTEXITCODE" }
}
# A PC woken without anyone at the keyboard (Wake-on-LAN, wake timer) falls back to sleep after
# Windows' 2-minute "unattended" idle timeout. Holding ES_SYSTEM_REQUIRED from this always-running
# SYSTEM process keeps it awake; explicit power transitions still work.
Add-Type -Namespace ServerCesar -Name Power -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);'
function Enable-KeepAwake {
    $ES_CONTINUOUS = [uint32]'0x80000000'; $ES_SYSTEM_REQUIRED = [uint32]1
    [void][ServerCesar.Power]::SetThreadExecutionState($ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED)
}

# Packet-delivery check while the PC is awake (NOT proof of remote wake): ask depicus (the same relay Mission Control
# uses) to send a magic packet to the public address, and listen for it on
# UDP 9. Target comes from $Root\wol-target.json ({"host","port","mac"}), which is never in the
# public repository. Runs at start and every 6 hours; the result is shown in Mission Control.
$script:WolPath = $null
$script:WolPathNext = (Get-Date).AddMinutes(2)
function Test-WolPath {
    if ((Get-Date) -lt $script:WolPathNext) { return }
    $script:WolPathNext = (Get-Date).AddHours(6)
    $rule = 'ServerCesar WoL route check'
    $result = @{ ok = $false; at = [double][DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); detail = '' }
    $listener = $null
    try {
        $target = Get-Content -Raw (Join-Path $Root 'wol-target.json') | ConvertFrom-Json
        New-NetFirewallRule -DisplayName $rule -Direction Inbound -Protocol UDP -LocalPort 9 -Action Allow -Profile Any | Out-Null
        $listener = [Net.Sockets.UdpClient]::new()
        $listener.Client.SetSocketOption([Net.Sockets.SocketOptionLevel]::Socket, [Net.Sockets.SocketOptionName]::ReuseAddress, $true)
        $listener.Client.Bind([Net.IPEndPoint]::new([Net.IPAddress]::Any, 9))
        $listener.Client.ReceiveTimeout = 20000
        $body = "macaddress=$($target.mac)&ip=$($target.host)&subnet=255.255.255.255&port=$($target.port)&secureon="
        Invoke-WebRequest -UseBasicParsing -Method Post -Uri 'https://www.depicus.com/wake-on-lan/woli-ajax.php' -Body $body `
            -ContentType 'application/x-www-form-urlencoded; charset=UTF-8' -TimeoutSec 15 `
            -Headers @{ 'x-requested-with' = 'XMLHttpRequest'; referer = 'https://www.depicus.com/wake-on-lan/woli' } | Out-Null
        $remote = [Net.IPEndPoint]::new([Net.IPAddress]::Any, 0)
        try {
            [void]$listener.Receive([ref]$remote)
            $result.ok = $true; $result.detail = 'El paquete llega desde Internet'
        } catch {
            $result.detail = 'El paquete no llega: revisa el reenvio UDP del router'
        }
    } catch {
        $result.detail = 'No se pudo comprobar: ' + $_.Exception.Message
    } finally {
        if ($listener) { $listener.Close() }
        Remove-NetFirewallRule -DisplayName $rule -ErrorAction SilentlyContinue
    }
    if (-not $result.ok) { $script:WolPathNext = (Get-Date).AddMinutes(30) }
    Write-Log "wol route check: $($result.ok) ($($result.detail))"
    $script:WolPath = $result
}

# What the website shows, minus the values that move every minute (CPU, RAM, disk, guardian clock).
# A change here means the full report is worth sending now.
function Get-ReportSignature($report) {
    $copy = [ordered]@{}
    foreach ($key in $report.Keys) { if ($key -notin 'cpu', 'ram', 'diskFreeGb', 'guardianAt') { $copy[$key] = $report[$key] } }
    $copy | ConvertTo-Json -Depth 6 -Compress
}
$script:LastSignature = $null
$script:LastFullAt = $null
$script:NeedReport = $true

$token = Read-AgentToken
Write-Log "agent $AgentVersion started"
Enable-KeepAwake

while ($true) {
    try {
        Repair-Services
        $userSession = Test-UserSession
        Repair-Guardian $userSession
        Invoke-StoreScan
        Test-WolPath
        $report = Get-Report $userSession
        $signature = Get-ReportSignature $report
        # Full report only when something meaningful changed, every 30 min (CPU/RAM/disk), or on request;
        # otherwise a bare heartbeat, which costs the website a single D1 row.
        $fullDue = $script:NeedReport -or $pendingDone -or $signature -ne $script:LastSignature -or
            -not $script:LastFullAt -or ((Get-Date) - $script:LastFullAt).TotalMinutes -ge 30
        $body = $(if ($fullDue) { @{ report = $report } } else { @{ heartbeat = $true } })
        if ($pendingDone) { $body.done = $pendingDone }
        $json = $body | ConvertTo-Json -Depth 6 -Compress
        $response = Invoke-RestMethod -Method Post -Uri "$SiteBaseUrl/api/agent/servercesar" -Headers @{ Authorization = "Bearer $token" } `
            -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($json)) -TimeoutSec 20
        if ($fullDue) { $script:LastSignature = $signature; $script:LastFullAt = Get-Date }
        $script:NeedReport = [bool]$response.needReport
        $pendingDone = $null
        if ($response.command -and $response.command.type -in @('reboot', 'shutdown')) {
            $pendingDone = Invoke-Power $response.command
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
