# ServerCesar guardian: runs in SERVERCESAR's interactive session (scheduled task at logon).
# Keeps Claude, ChatGPT, Parsec and Tailscale open, relaunches them when they close or hang,
# applies staged Claude/ChatGPT updates at night and writes their health to state\apps.json
# for the SYSTEM agent, which reports it to Mission Control.
# Login checks only test whether each app's session file exists; no credential is read out.
[CmdletBinding()]
param(
    [string]$StateDir = 'C:\ProgramData\ServerCesar\state',
    [int]$IntervalSeconds = 20,
    [int]$UpdateHour = 5
)

$ErrorActionPreference = 'Continue'
$mutex = New-Object Threading.Mutex($false, 'Local\ServerCesarGuardian')
if (-not $mutex.WaitOne(0)) { exit 0 }

$session = (Get-Process -Id $PID).SessionId
$logPath = Join-Path $StateDir 'guardian.log'
$statePath = Join-Path $StateDir 'apps.json'
$restarts = @{ claude = 0; chatgpt = 0; parsec = 0; tailscale = 0 }
$hung = @{ claude = 0; chatgpt = 0; parsec = 0; tailscale = 0 }
$lastLaunch = @{}
$lastUpdateDay = ''

function Write-Log([string]$Message) {
    try {
        if ((Test-Path $logPath) -and (Get-Item $logPath).Length -gt 1MB) { Move-Item $logPath "$logPath.1" -Force }
        Add-Content -Path $logPath -Value ("{0:yyyy-MM-dd HH:mm:ss} {1}" -f (Get-Date), $Message) -Encoding UTF8
    } catch { }
}

$apps = [ordered]@{
    claude = @{
        Name = 'claude'; Match = '\\AnthropicClaude\\app-'
        Launch = { Start-Process -FilePath "$env:LOCALAPPDATA\AnthropicClaude\claude.exe" }
    }
    chatgpt = @{
        Name = 'ChatGPT'; Match = '\\OpenAI\.Codex_'
        Launch = { Start-Process -FilePath 'explorer.exe' -ArgumentList 'shell:AppsFolder\OpenAI.Codex_2p2nqsd0c76g0!App' }
    }
    parsec = @{
        Name = 'parsecd'; Match = '\\Parsec\\parsecd\.exe$'
        Launch = { Start-Process -FilePath "$env:ProgramFiles\Parsec\parsecd.exe" }
    }
    tailscale = @{
        Name = 'tailscale-ipn'; Match = '\\Tailscale\\tailscale-ipn\.exe$'
        Launch = { Start-Process -FilePath "$env:ProgramFiles\Tailscale\tailscale-ipn.exe" }
    }
}

# Processes of one app in this desktop session (the Claude Code CLI is also claude.exe: excluded by path).
function Get-AppProcesses($app) {
    @(Get-Process -Name $app.Name -ErrorAction SilentlyContinue | Where-Object {
        $_.SessionId -eq $session -and $_.Path -and $_.Path -match $app.Match
    })
}

function Test-FileMatch([string]$Path, [string]$Pattern) {
    try { return [bool](Select-String -LiteralPath $Path -Pattern $Pattern -Quiet -ErrorAction Stop) } catch { return $false }
}

function Get-SignedIn([string]$key) {
    switch ($key) {
        'claude' { return Test-FileMatch "$env:APPDATA\Claude\config.json" '"oauth:tokenCacheV2"\s*:\s*"[^"]{20,}' }
        'chatgpt' { $f = Get-Item "$env:USERPROFILE\.codex\auth.json" -ErrorAction SilentlyContinue; return [bool]($f -and $f.Length -gt 100) }
        'parsec' { $f = Get-Item "$env:ProgramData\Parsec\user.bin" -ErrorAction SilentlyContinue; return [bool]($f -and $f.Length -gt 0) }
    }
    return $null
}

function Get-TailscaleStatus {
    try {
        $raw = & "$env:ProgramFiles\Tailscale\tailscale.exe" status --json 2>$null | Out-String
        return $raw | ConvertFrom-Json
    } catch { return $null }
}

function Restart-App([string]$key, [string]$reason) {
    Get-AppProcesses $apps[$key] | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    $lastLaunch.Remove($key)
    Start-App $key $reason
}

function Start-App([string]$key, [string]$reason) {
    # Leave each launch a minute to show up before trying again.
    if ($lastLaunch[$key] -and ((Get-Date) - $lastLaunch[$key]).TotalSeconds -lt 60) { return }
    $lastLaunch[$key] = Get-Date
    $restarts[$key]++
    Write-Log "launch $key ($reason)"
    try { & $apps[$key].Launch } catch { Write-Log "launch $key failed: $($_.Exception.Message)" }
}

# Staged updates: Claude (Squirrel) applies its download on the next launch; a Store update of
# ChatGPT installs a new package version while the old one keeps running. Restart both at night.
function Update-StagedApps {
    $day = (Get-Date).ToString('yyyy-MM-dd')
    if ((Get-Date).Hour -ne $UpdateHour -or $day -eq $script:lastUpdateDay) { return }
    $script:lastUpdateDay = $day
    try {
        $cfg = Get-Content -Raw "$env:APPDATA\Claude\config.json" | ConvertFrom-Json
        $staged = $cfg.updaterBannerStagedAt.version
        $running = (Get-AppProcesses $apps.claude | Select-Object -First 1).Path -replace '.*\\app-([^\\]+)\\.*', '$1'
        if ($staged -and $running -and $staged -ne $running) { Write-Log "claude update $running -> $staged"; Restart-App 'claude' 'update' }
    } catch { }
    try {
        $installed = (Get-AppxPackage OpenAI.Codex).Version
        $proc = Get-AppProcesses $apps.chatgpt | Select-Object -First 1
        if ($proc -and $installed -and $proc.Path -notmatch [regex]::Escape("_$installed`_")) { Write-Log "chatgpt update -> $installed"; Restart-App 'chatgpt' 'update' }
    } catch { }
}

Write-Log "guardian started in session $session"
Start-Sleep -Seconds 20   # let the normal startup items open first

while ($true) {
    $state = [ordered]@{ at = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); apps = [ordered]@{} }
    $ts = Get-TailscaleStatus
    foreach ($key in $apps.Keys) {
        $procs = Get-AppProcesses $apps[$key]
        $windowed = $procs | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
        $responding = if ($windowed) { [bool]$windowed.Responding } else { $null }
        if (-not $procs) { Start-App $key 'not running' }
        elseif ($responding -eq $false) {
            $hung[$key]++
            if ($hung[$key] -ge 4) { $hung[$key] = 0; Write-Log "$key not responding"; Restart-App $key 'hung' }
        } else { $hung[$key] = 0 }

        $entry = [ordered]@{ running = [bool]$procs; responding = $responding; restarts = $restarts[$key] }
        switch ($key) {
            'claude' {
                $entry.signedIn = Get-SignedIn 'claude'
                $entry.remoteControl = Test-FileMatch "$env:APPDATA\Claude\claude_desktop_config.json" '"ccRemoteControlDefaultEnabled"\s*:\s*true'
                if ($procs) { $entry.version = $procs[0].Path -replace '.*\\app-([^\\]+)\\.*', '$1' }
            }
            'chatgpt' {
                $entry.signedIn = Get-SignedIn 'chatgpt'
                $entry.version = [string](Get-AppxPackage OpenAI.Codex -ErrorAction SilentlyContinue).Version
            }
            'parsec' {
                $entry.signedIn = Get-SignedIn 'parsec'
                $entry.service = [string](Get-Service Parsec -ErrorAction SilentlyContinue).Status
                $dll = Get-ChildItem "$env:ProgramData\Parsec\parsecd-*.dll" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
                if ($dll) { $entry.version = $dll.BaseName -replace '^parsecd-', '' }
            }
            'tailscale' {
                $entry.service = [string](Get-Service Tailscale -ErrorAction SilentlyContinue).Status
                if ($ts) {
                    $entry.signedIn = $ts.BackendState -eq 'Running'
                    $entry.online = [bool]$ts.Self.Online
                    $entry.version = ($ts.Version -split '-')[0]
                    $entry.detail = $ts.BackendState
                }
            }
        }
        if ($entry.service) { $entry.service = $entry.service.ToLowerInvariant() }
        $state.apps[$key] = $entry
    }
    Update-StagedApps
    try {
        $tmp = "$statePath.tmp"
        $state | ConvertTo-Json -Depth 4 -Compress | Set-Content -LiteralPath $tmp -Encoding UTF8
        Move-Item -LiteralPath $tmp -Destination $statePath -Force
    } catch { Write-Log "state write failed: $($_.Exception.Message)" }
    Start-Sleep -Seconds $IntervalSeconds
}
