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
        $ping = Get-MinecraftStatusPing -Port ([int]$script:Config.ServerPort)
        $portOpen = $null -ne $ping -or (
            Test-LocalPort -Port ([int]$script:Config.ServerPort)
        )
        return @{
            serverStatus = $(if ($portOpen) { 'online' } else { 'starting' })
            playersOnline = $(if ($ping) { $ping.PlayersOnline } else { $null })
            playersMax = $(if ($ping) { $ping.PlayersMax } else { $null })
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

function ConvertTo-VarIntBytes {
    param([Parameter(Mandatory)] [int]$Value)

    $bytes = [Collections.Generic.List[byte]]::new()
    [uint32]$remaining = $Value
    do {
        [byte]$current = $remaining -band 0x7F
        $remaining = $remaining -shr 7
        if ($remaining -ne 0) { $current = $current -bor 0x80 }
        $bytes.Add($current)
    } while ($remaining -ne 0)
    return $bytes.ToArray()
}

function Read-VarInt {
    param([Parameter(Mandatory)] [IO.Stream]$Stream)

    $result = 0
    $numRead = 0
    do {
        $read = $Stream.ReadByte()
        if ($read -lt 0) {
            throw 'Unexpected end of Minecraft status response.'
        }
        $result = $result -bor (($read -band 0x7F) -shl (7 * $numRead))
        $numRead += 1
        if ($numRead -gt 5) { throw 'Minecraft VarInt is too large.' }
    } while (($read -band 0x80) -ne 0)
    return $result
}

function Get-MinecraftStatusPing {
    param([Parameter(Mandatory)] [int]$Port)

    $client = [Net.Sockets.TcpClient]::new()
    try {
        $attempt = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
        if (-not $attempt.AsyncWaitHandle.WaitOne(1500)) { return $null }
        $client.EndConnect($attempt)
        $stream = $client.GetStream()
        $stream.ReadTimeout = 2000
        $stream.WriteTimeout = 2000

        $payload = [Collections.Generic.List[byte]]::new()
        $payload.AddRange([byte[]](ConvertTo-VarIntBytes -Value 0))
        $payload.AddRange([byte[]](ConvertTo-VarIntBytes -Value 767))
        $hostBytes = [Text.Encoding]::UTF8.GetBytes('127.0.0.1')
        $payload.AddRange([byte[]](
            ConvertTo-VarIntBytes -Value $hostBytes.Length
        ))
        $payload.AddRange($hostBytes)
        $payload.Add([byte](($Port -shr 8) -band 0xFF))
        $payload.Add([byte]($Port -band 0xFF))
        $payload.AddRange([byte[]](ConvertTo-VarIntBytes -Value 1))

        $packet = [Collections.Generic.List[byte]]::new()
        $packet.AddRange([byte[]](
            ConvertTo-VarIntBytes -Value $payload.Count
        ))
        $packet.AddRange($payload.ToArray())
        $wire = $packet.ToArray()
        $stream.Write($wire, 0, $wire.Length)

        $request = [byte[]](1, 0)
        $stream.Write($request, 0, $request.Length)
        $stream.Flush()

        $packetLength = Read-VarInt -Stream $stream
        $packetId = Read-VarInt -Stream $stream
        if ($packetId -ne 0) {
            throw "Unexpected Minecraft status packet ID: $packetId"
        }
        $jsonLength = Read-VarInt -Stream $stream
        if ($jsonLength -lt 2 -or
            $jsonLength -gt 1048576 -or
            $jsonLength -gt $packetLength) {
            throw 'Invalid Minecraft status response length.'
        }

        $buffer = New-Object byte[] $jsonLength
        $offset = 0
        while ($offset -lt $jsonLength) {
            $read = $stream.Read($buffer, $offset, $jsonLength - $offset)
            if ($read -le 0) {
                throw 'Incomplete Minecraft status response.'
            }
            $offset += $read
        }
        $status = [Text.Encoding]::UTF8.GetString($buffer) |
            ConvertFrom-Json
        if ($null -eq $status.players.online -or
            $null -eq $status.players.max) {
            return $null
        }
        return [pscustomobject]@{
            PlayersOnline = [int]$status.players.online
            PlayersMax = [int]$status.players.max
        }
    }
    catch {
        return $null
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
