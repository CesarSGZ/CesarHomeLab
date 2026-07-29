[CmdletBinding()]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'agent-config.json')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security

function Read-AgentToken {
    $encryptedPath = Join-Path $PSScriptRoot 'agent-token.enc'
    if (-not (Test-Path -LiteralPath $encryptedPath)) {
        throw "Missing agent-token.enc. Run setup-agent.ps1 first."
    }

    $encrypted = [Convert]::FromBase64String(
        (Get-Content -Raw -LiteralPath $encryptedPath).Trim()
    )
    $entropy = [Text.Encoding]::UTF8.GetBytes('CSG-Mission-Control-Agent-v1')
    $plain = [Security.Cryptography.ProtectedData]::Unprotect(
        $encrypted,
        $entropy,
        [Security.Cryptography.DataProtectionScope]::LocalMachine
    )
    return [Text.Encoding]::UTF8.GetString($plain)
}

function Invoke-ControlApi {
    param(
        [Parameter(Mandatory)] [string]$Path,
        [Parameter(Mandatory)] [hashtable]$Body
    )

    $uri = "$($script:Config.SiteBaseUrl.TrimEnd('/'))$Path"
    $json = $Body | ConvertTo-Json -Compress -Depth 5
    Invoke-RestMethod `
        -Method Post `
        -Uri $uri `
        -Headers @{ Authorization = "Bearer $script:AgentToken" } `
        -ContentType 'application/json' `
        -Body $json `
        -TimeoutSec 20
}

function Get-MinecraftState {
    $processes = Get-CimInstance Win32_Process -Filter "Name='$($script:Config.ProcessName)'"
    $match = $processes | Where-Object {
        $_.CommandLine -and $_.CommandLine.Contains($script:Config.ProcessCommandContains)
    } | Select-Object -First 1

    if ($match) {
        $portOpen = Test-LocalPort -Port ([int]$script:Config.ServerPort)
        return @{
            serverStatus = $(if ($portOpen) { 'online' } else { 'starting' })
            playersOnline = $null
            playersMax = $null
            version = $script:Config.ServerLabel
        }
    }

    return @{
        serverStatus = 'offline'
        playersOnline = $null
        playersMax = $null
        version = $script:Config.ServerLabel
    }
}

function Test-LocalPort {
    param([Parameter(Mandatory)] [int]$Port)
    $client = [Net.Sockets.TcpClient]::new()
    try {
        $attempt = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
        if (-not $attempt.AsyncWaitHandle.WaitOne(700)) { return $false }
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

function Send-Heartbeat {
    Invoke-ControlApi -Path '/api/agent/heartbeat' -Body (Get-MinecraftState) | Out-Null
}

function Complete-Command {
    param(
        [Parameter(Mandatory)] [string]$Id,
        [Parameter(Mandatory)] [bool]$Succeeded,
        [Parameter(Mandatory)] [string]$Result
    )

    Invoke-ControlApi -Path '/api/agent/complete' -Body @{
        id = $Id
        succeeded = $Succeeded
        result = $Result
    } | Out-Null
}

function Invoke-Restart {
    param([Parameter(Mandatory)] [string]$CommandId)

    try {
        $restartScript = [IO.Path]::GetFullPath($script:Config.RestartScript)
        if (-not (Test-Path -LiteralPath $restartScript -PathType Leaf)) {
            throw "Configured restart script does not exist."
        }
        if ([IO.Path]::GetExtension($restartScript) -ne '.ps1') {
            throw "RestartScript must point to a PowerShell .ps1 file."
        }

        $stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        $outputPath = Join-Path $env:TEMP "csg-mc-restart-$stamp.out"
        $errorPath = Join-Path $env:TEMP "csg-mc-restart-$stamp.err"
        $restart = Start-Process -FilePath 'powershell.exe' `
            -ArgumentList @(
                '-NoLogo',
                '-NoProfile',
                '-ExecutionPolicy', 'Bypass',
                '-File', "`"$restartScript`"",
                '-ConfigPath', "`"$ConfigPath`""
            ) `
            -WindowStyle Hidden `
            -RedirectStandardOutput $outputPath `
            -RedirectStandardError $errorPath `
            -PassThru
        # Windows PowerShell can return a null ExitCode after the child exits
        # unless its native process handle is retained while it is running.
        $null = $restart.Handle

        while (-not $restart.HasExited) {
            Invoke-ControlApi -Path '/api/agent/heartbeat' -Body @{
                serverStatus = 'starting'
                playersOnline = $null
                playersMax = $null
                version = $script:Config.ServerLabel
            } | Out-Null
            Start-Sleep -Seconds $pollSeconds
            $restart.Refresh()
        }
        $restart.WaitForExit()
        $restart.Refresh()
        $restartExitCode = $restart.ExitCode

        $output = if (Test-Path -LiteralPath $outputPath) {
            $rawOutput = Get-Content -Raw -LiteralPath $outputPath
            if ($null -eq $rawOutput) { '' } else { $rawOutput.Trim() }
        } else { '' }
        $errors = if (Test-Path -LiteralPath $errorPath) {
            $rawErrors = Get-Content -Raw -LiteralPath $errorPath
            if ($null -eq $rawErrors) { '' } else { $rawErrors.Trim() }
        } else { '' }
        Remove-Item -LiteralPath $outputPath, $errorPath -Force -ErrorAction SilentlyContinue

        if ($restartExitCode -ne 0) {
            throw $(if ($errors) { $errors } elseif ($output) { $output } else {
                "Restart script exited with code $restartExitCode."
            })
        }

        $result = if ($output) { $output } else { 'Hard restart completed.' }
        Complete-Command -Id $CommandId -Succeeded $true -Result $result
        Send-Heartbeat
    }
    catch {
        Complete-Command -Id $CommandId -Succeeded $false -Result $_.Exception.Message
    }
}

if (-not (Test-Path -LiteralPath $ConfigPath)) {
    throw "Missing agent-config.json. Run setup-agent.ps1 first."
}

$script:Config = Get-Content -Raw -LiteralPath $ConfigPath | ConvertFrom-Json
$script:AgentToken = Read-AgentToken

if ($script:Config.SiteBaseUrl -ne 'https://cesar-solla.pages.dev') {
    throw "Unexpected SiteBaseUrl. Refusing to start."
}

$pollSeconds = [Math]::Max(5, [int]$script:Config.PollSeconds)

while ($true) {
    try {
        Send-Heartbeat
        $next = Invoke-ControlApi -Path '/api/agent/next' -Body @{}
        if ($next.command) {
            if ($next.command.type -eq 'restart') {
                Invoke-Restart -CommandId $next.command.id
            }
            else {
                Complete-Command `
                    -Id $next.command.id `
                    -Succeeded $false `
                    -Result 'Unsupported command type.'
            }
        }
    }
    catch {
        Write-Warning "Mission Control connection failed: $($_.Exception.Message)"
    }

    Start-Sleep -Seconds $pollSeconds
}
