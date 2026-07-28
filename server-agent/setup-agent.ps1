[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$siteBaseUrl = 'https://cesar-solla.pages.dev'
$restartScript = Read-Host 'Full path to your dedicated restart-minecraft.ps1 script'
$processName = Read-Host 'Minecraft process name (default: java.exe)'
if ([string]::IsNullOrWhiteSpace($processName)) { $processName = 'java.exe' }
$commandFragment = Read-Host 'Unique text in the Minecraft Java command line (example: server.jar)'
$serverLabel = Read-Host 'Server label shown in Mission Control (default: Minecraft Java)'
if ([string]::IsNullOrWhiteSpace($serverLabel)) { $serverLabel = 'Minecraft Java' }

$fullRestartScript = [IO.Path]::GetFullPath($restartScript)
if (-not (Test-Path -LiteralPath $fullRestartScript -PathType Leaf)) {
    throw "The restart script does not exist: $fullRestartScript"
}
if ([IO.Path]::GetExtension($fullRestartScript) -ne '.ps1') {
    throw 'The restart script must be a .ps1 file.'
}
if ([string]::IsNullOrWhiteSpace($commandFragment)) {
    throw 'ProcessCommandContains cannot be empty.'
}

$token = Read-Host 'Paste the Mission Control agent token' -AsSecureString
$token | ConvertFrom-SecureString | Set-Content -Encoding UTF8 -LiteralPath (
    Join-Path $PSScriptRoot 'agent-token.enc'
)

$config = [ordered]@{
    SiteBaseUrl = $siteBaseUrl
    RestartScript = $fullRestartScript
    ProcessName = $processName
    ProcessCommandContains = $commandFragment
    ServerLabel = $serverLabel
    PollSeconds = 8
}

$config | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath (
    Join-Path $PSScriptRoot 'agent-config.json'
)

Write-Host 'Agent configuration created. The token is protected with Windows DPAPI.'
Write-Host 'Run mission-control-agent.ps1 once interactively to test it.'
