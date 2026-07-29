[CmdletBinding()]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'agent-config.json')
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Get-TargetProcesses {
    param([Parameter(Mandatory)] $Config)

    $launchName = [IO.Path]::GetFileName($Config.LaunchScript)
    Get-CimInstance Win32_Process | Where-Object {
        $isServer = (
            $_.Name -ieq $Config.ProcessName -and
            $_.CommandLine -and
            $_.CommandLine.IndexOf(
                $Config.ProcessCommandContains,
                [StringComparison]::OrdinalIgnoreCase
            ) -ge 0
        )
        $isLauncher = (
            $_.Name -in @('cmd.exe', 'powershell.exe', 'pwsh.exe') -and
            $_.CommandLine -and
            $_.CommandLine.IndexOf(
                $launchName,
                [StringComparison]::OrdinalIgnoreCase
            ) -ge 0 -and
            $_.ProcessId -ne $PID
        )
        $isServer -or $isLauncher
    }
}

function Test-LocalPort {
    param(
        [Parameter(Mandatory)] [int]$Port,
        [int]$TimeoutMilliseconds = 900
    )

    $client = [Net.Sockets.TcpClient]::new()
    try {
        $attempt = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
        if (-not $attempt.AsyncWaitHandle.WaitOne($TimeoutMilliseconds)) {
            return $false
        }
        $client.EndConnect($attempt)
        return $client.Connected
    }
    catch {
        return $false
    }
    finally {
        $client.Dispose()
    }
}

function Stop-TargetTree {
    param([Parameter(Mandatory)] $Config)

    $targets = @(Get-TargetProcesses -Config $Config)
    foreach ($target in $targets) {
        & "$env:SystemRoot\System32\taskkill.exe" `
            /PID $target.ProcessId /T /F 2>&1 | Out-Null
    }

    $deadline = (Get-Date).AddSeconds(
        [Math]::Max(10, [int]$Config.ForceKillTimeoutSeconds)
    )
    do {
        $remaining = @(Get-TargetProcesses -Config $Config)
        if ($remaining.Count -eq 0) { return }
        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $deadline)

    foreach ($target in $remaining) {
        Stop-Process -Id $target.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
    if (@(Get-TargetProcesses -Config $Config).Count -gt 0) {
        throw 'Minecraft processes remained alive after the forced termination.'
    }
}

function Start-MinecraftServer {
    param([Parameter(Mandatory)] $Config)

    $launchScript = [IO.Path]::GetFullPath([string]$Config.LaunchScript)
    $workingDirectory = [IO.Path]::GetFullPath(
        [string]$Config.ServerWorkingDirectory
    )
    if (-not (Test-Path -LiteralPath $launchScript -PathType Leaf)) {
        throw "Launch script not found: $launchScript"
    }
    if (-not (Test-Path -LiteralPath $workingDirectory -PathType Container)) {
        throw "Server directory not found: $workingDirectory"
    }
    if (-not $launchScript.StartsWith(
        $workingDirectory.TrimEnd('\') + '\',
        [StringComparison]::OrdinalIgnoreCase
    )) {
        throw 'LaunchScript must be inside ServerWorkingDirectory.'
    }

    $extension = [IO.Path]::GetExtension($launchScript).ToLowerInvariant()
    switch ($extension) {
        '.bat' {
            Start-Process -FilePath "$env:SystemRoot\System32\cmd.exe" `
                -ArgumentList @('/d', '/c', "`"$launchScript`"") `
                -WorkingDirectory $workingDirectory `
                -WindowStyle Hidden | Out-Null
        }
        '.cmd' {
            Start-Process -FilePath "$env:SystemRoot\System32\cmd.exe" `
                -ArgumentList @('/d', '/c', "`"$launchScript`"") `
                -WorkingDirectory $workingDirectory `
                -WindowStyle Hidden | Out-Null
        }
        '.ps1' {
            Start-Process -FilePath 'powershell.exe' `
                -ArgumentList @(
                    '-NoLogo',
                    '-NoProfile',
                    '-ExecutionPolicy', 'Bypass',
                    '-File', "`"$launchScript`""
                ) `
                -WorkingDirectory $workingDirectory `
                -WindowStyle Hidden | Out-Null
        }
        '.exe' {
            Start-Process -FilePath $launchScript `
                -WorkingDirectory $workingDirectory `
                -WindowStyle Hidden | Out-Null
        }
        default {
            throw 'LaunchScript must be a .bat, .cmd, .ps1 or .exe file.'
        }
    }
}

if (-not (Test-Path -LiteralPath $ConfigPath -PathType Leaf)) {
    throw "Missing configuration: $ConfigPath"
}

$config = Get-Content -Raw -LiteralPath $ConfigPath | ConvertFrom-Json
if ([string]::IsNullOrWhiteSpace($config.ProcessCommandContains) -or
    $config.ProcessCommandContains.Length -lt 6) {
    throw 'ProcessCommandContains must contain at least six characters.'
}

Write-Output 'Stopping the previous Minecraft process tree.'
Stop-TargetTree -Config $config
Start-Sleep -Seconds 2

Write-Output 'Starting Minecraft.'
Start-MinecraftServer -Config $config

$startupDeadline = (Get-Date).AddSeconds(
    [Math]::Max(60, [int]$config.StartupTimeoutSeconds)
)
$processSeen = $false
do {
    $processSeen = @(Get-TargetProcesses -Config $config).Count -gt 0
    if ($processSeen -and (Test-LocalPort -Port ([int]$config.ServerPort))) {
        Write-Output "Minecraft is listening on port $($config.ServerPort)."
        exit 0
    }
    Start-Sleep -Seconds 2
} while ((Get-Date) -lt $startupDeadline)

if (-not $processSeen) {
    throw 'Minecraft did not create the expected Java process.'
}
throw "Minecraft started but did not listen on port $($config.ServerPort) before timeout."
