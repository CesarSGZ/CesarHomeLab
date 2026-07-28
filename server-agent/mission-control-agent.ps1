[CmdletBinding()]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'agent-config.json')
)

$ErrorActionPreference = 'Stop'

function Read-AgentToken {
    $encryptedPath = Join-Path $PSScriptRoot 'agent-token.enc'
    if (-not (Test-Path -LiteralPath $encryptedPath)) {
        throw "Missing agent-token.enc. Run setup-agent.ps1 first."
    }

    $secure = Get-Content -Raw -LiteralPath $encryptedPath | ConvertTo-SecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
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
        return @{
            serverStatus = 'online'
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

        & $restartScript
        if (-not $?) { throw "Restart script returned a failure status." }

        Complete-Command -Id $CommandId -Succeeded $true -Result 'Restart script completed.'
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
