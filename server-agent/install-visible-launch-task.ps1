#Requires -RunAsAdministrator
[CmdletBinding()]
param(
    [string]$UserId = "$env:USERDOMAIN\$env:USERNAME",
    [string]$TaskName = 'CSG Minecraft Interactive Launcher'
)

$ErrorActionPreference = 'Stop'
$configPath = Join-Path $PSScriptRoot 'agent-config.json'
if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
    throw 'Run setup-agent.ps1 before installing the interactive launch task.'
}

$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
$launchScript = [IO.Path]::GetFullPath([string]$config.LaunchScript)
$workingDirectory = [IO.Path]::GetFullPath(
    [string]$config.ServerWorkingDirectory
)
if (-not (Test-Path -LiteralPath $launchScript -PathType Leaf)) {
    throw "Launch script not found: $launchScript"
}

$extension = [IO.Path]::GetExtension($launchScript).ToLowerInvariant()
if ($extension -notin @('.bat', '.cmd')) {
    throw 'The interactive launcher currently supports .bat and .cmd files.'
}

$action = New-ScheduledTaskAction `
    -Execute "$env:SystemRoot\System32\cmd.exe" `
    -Argument "/d /c `"`"$launchScript`"`"" `
    -WorkingDirectory $workingDirectory
$principal = New-ScheduledTaskPrincipal `
    -UserId $UserId `
    -LogonType Interactive `
    -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName $TaskName `
    -Description 'Launches the Minecraft console in the SERVERCESAR interactive desktop session.' `
    -Action $action `
    -Principal $principal `
    -Settings $settings `
    -Force | Out-Null

$config | Add-Member `
    -NotePropertyName InteractiveLaunchTaskName `
    -NotePropertyValue $TaskName `
    -Force
$config | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath $configPath

Write-Host "Interactive Minecraft launch task installed for $UserId."
