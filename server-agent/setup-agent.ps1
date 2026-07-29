[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$siteBaseUrl = 'https://cesar-solla.pages.dev'
$serverDirectory = Read-Host 'Full path to the Minecraft server folder'
$launchScript = Read-Host 'Full path to the server launch script (usually run.bat)'
$processName = Read-Host 'Minecraft process name (default: java.exe)'
if ([string]::IsNullOrWhiteSpace($processName)) { $processName = 'java.exe' }
$commandFragment = Read-Host 'Unique text in the Minecraft Java command line (example: @user_jvm_args.txt or neoforge)'
$serverLabel = Read-Host 'Server label shown in Mission Control (default: Minecraft Java)'
if ([string]::IsNullOrWhiteSpace($serverLabel)) { $serverLabel = 'Minecraft Java' }
$serverPort = Read-Host 'Minecraft server port (default: 25565)'
if ([string]::IsNullOrWhiteSpace($serverPort)) { $serverPort = '25565' }

$fullServerDirectory = [IO.Path]::GetFullPath($serverDirectory)
$fullLaunchScript = [IO.Path]::GetFullPath($launchScript)
$restartScript = Join-Path $PSScriptRoot 'restart-minecraft.ps1'
if (-not (Test-Path -LiteralPath $fullServerDirectory -PathType Container)) {
    throw "The server directory does not exist: $fullServerDirectory"
}
if (-not (Test-Path -LiteralPath $fullLaunchScript -PathType Leaf)) {
    throw "The launch script does not exist: $fullLaunchScript"
}
if (-not $fullLaunchScript.StartsWith(
    $fullServerDirectory.TrimEnd('\') + '\',
    [StringComparison]::OrdinalIgnoreCase
)) {
    throw 'The launch script must be inside the Minecraft server directory.'
}
if ([string]::IsNullOrWhiteSpace($commandFragment) -or
    $commandFragment.Length -lt 6) {
    throw 'ProcessCommandContains must contain at least six characters.'
}
$parsedPort = 0
if (-not [int]::TryParse($serverPort, [ref]$parsedPort) -or
    $parsedPort -lt 1 -or $parsedPort -gt 65535) {
    throw 'Server port must be between 1 and 65535.'
}

$token = Read-Host 'Paste the Mission Control agent token'
if ($token.Length -lt 32) { throw 'The agent token is too short.' }
$plain = [Text.Encoding]::UTF8.GetBytes($token)
$entropy = [Text.Encoding]::UTF8.GetBytes('CSG-Mission-Control-Agent-v1')
$encrypted = [Security.Cryptography.ProtectedData]::Protect(
    $plain,
    $entropy,
    [Security.Cryptography.DataProtectionScope]::LocalMachine
)
[Convert]::ToBase64String($encrypted) | Set-Content -Encoding ASCII -LiteralPath (
    Join-Path $PSScriptRoot 'agent-token.enc'
)

$config = [ordered]@{
    SiteBaseUrl = $siteBaseUrl
    RestartScript = $restartScript
    ServerWorkingDirectory = $fullServerDirectory
    LaunchScript = $fullLaunchScript
    ProcessName = $processName
    ProcessCommandContains = $commandFragment
    ServerLabel = $serverLabel
    ServerPort = $parsedPort
    StartupTimeoutSeconds = 360
    ForceKillTimeoutSeconds = 20
    PollSeconds = 8
}

$config | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath (
    Join-Path $PSScriptRoot 'agent-config.json'
)

Write-Host 'Agent configuration created. The token is protected with machine-scoped Windows DPAPI.'
Write-Host 'Run mission-control-agent.ps1 once interactively to test it.'
