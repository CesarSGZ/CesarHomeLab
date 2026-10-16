# ServerCesar agent: runs as SYSTEM from boot (scheduled task), with or without a user session.
# Every 120 s it keeps the Parsec and Tailscale services running, makes sure the guardian runs in
# SERVERCESAR's desktop, and posts the PC + app health to Mission Control over outbound HTTPS.
# Mission Control can hand back two commands only: "reboot" and "shutdown" (= low-power sleep, see Invoke-Power).
[CmdletBinding()]
param(
    [string]$Root = 'C:\ProgramData\ServerCesar'
)

$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Security

$AgentVersion = '1.5.0'
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

# "shutdown" puts the PC to sleep (S3) instead of powering it off (S5): apps, Minecraft and the
# Remote Control sessions are frozen instead of closed, and resume in seconds. Remote wake from these states is NOT verified.
# The web keeps shutdown disabled until real wake tests pass; UDP receipt while awake is insufficient.
function Invoke-Power($command) {
    Write-Log "$($command.type) requested ($($command.id))"
    if ($command.type -eq 'shutdown') {
        return @{ id = $command.id; ok = $true; detail = 'Suspension en bajo consumo en 10 s' }
    }
    & shutdown.exe /r /f /t 20 /d p:4:1 /c 'Reinicio solicitado desde Mission Control' 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        return @{ id = $command.id; ok = $true; detail = 'Reinicio de Windows programado en 20 s' }
    }
    return @{ id = $command.id; ok = $false; detail = "shutdown.exe devolvio $LASTEXITCODE" }
}

# Test safety net: if $Root\safety-wake-minutes.txt exists (admin-only folder), the next sleep also
# arms a wake timer N minutes later, so a failed Wake-on-LAN test never needs someone on site.
# The file is consumed by that sleep; normal "Apagar" leaves the PC asleep until woken.
function Register-SafetyWake {
    $flag = Join-Path $Root 'safety-wake-minutes.txt'
    if (-not (Test-Path $flag)) { return }
    $minutes = [int](Get-Content -Raw $flag).Trim()
    Remove-Item $flag -Force
    if ($minutes -lt 2 -or $minutes -gt 240) { return }
    $at = (Get-Date).AddMinutes($minutes)
    $action = New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\cmd.exe" -Argument '/c exit 0'
    $settings = New-ScheduledTaskSettingsSet -WakeToRun -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    Register-ScheduledTask -TaskName 'ServerCesar SafetyWake' -Action $action -Trigger (New-ScheduledTaskTrigger -Once -At $at) `
        -Settings $settings -User 'SYSTEM' -RunLevel Highest -Force | Out-Null
    Write-Log "safety wake timer armed for $($at.ToString('HH:mm:ss'))"
}

function Invoke-Sleep {
    Start-Sleep -Seconds 10
    Register-SafetyWake
    Write-Log 'suspending (S3)'
    Add-Type -AssemblyName System.Windows.Forms
    # Returns once the PC wakes up again.
    $ok = [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)
    Write-Log "resumed (suspend returned $ok)"
    Enable-KeepAwake
}

# A PC woken without anyone at the keyboard (Wake-on-LAN, wake timer) falls back to sleep after
# Windows' 2-minute "unattended" idle timeout. Holding ES_SYSTEM_REQUIRED from this always-running
# SYSTEM process keeps it awake; an explicit sleep (Invoke-Sleep) still works.
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
        $body = @{ report = (Get-Report $userSession) }
        if ($pendingDone) { $body.done = $pendingDone }
        $json = $body | ConvertTo-Json -Depth 6 -Compress
        $response = Invoke-RestMethod -Method Post -Uri "$SiteBaseUrl/api/agent/servercesar" -Headers @{ Authorization = "Bearer $token" } `
            -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($json)) -TimeoutSec 20
        $pendingDone = $null
        if ($response.command -and $response.command.type -in @('reboot', 'shutdown')) {
            $pendingDone = Invoke-Power $response.command
            # Report the result straight away: Windows goes down in 20 s.
            $body = @{ report = (Get-Report $userSession); done = $pendingDone }
            $json = $body | ConvertTo-Json -Depth 6 -Compress
            Invoke-RestMethod -Method Post -Uri "$SiteBaseUrl/api/agent/servercesar" -Headers @{ Authorization = "Bearer $token" } `
                -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($json)) -TimeoutSec 20 | Out-Null
            $pendingDone = $null
            if ($response.command.type -eq 'shutdown') { Invoke-Sleep; continue }
        }
    } catch {
        Write-Log "cycle failed: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds $IntervalSeconds
}
