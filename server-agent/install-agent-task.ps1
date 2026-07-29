#Requires -RunAsAdministrator
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$agentScript = Join-Path $PSScriptRoot 'mission-control-agent.ps1'
$configPath = Join-Path $PSScriptRoot 'agent-config.json'
$logPath = Join-Path $PSScriptRoot 'agent.log'

if (-not (Test-Path -LiteralPath $configPath)) {
    throw 'Run setup-agent.ps1 before installing the scheduled task.'
}

$escapedAgentScript = $agentScript.Replace("'", "''")
$escapedLogPath = $logPath.Replace("'", "''")
$agentCommand = "& '$escapedAgentScript' *>> '$escapedLogPath'"
$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoLogo -NoProfile -ExecutionPolicy Bypass -Command `"$agentCommand`"" `
    -WorkingDirectory $PSScriptRoot
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet `
    -RestartCount 99 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName 'CSG Mission Control Agent' `
    -Description 'Polls the authenticated Mission Control queue for Minecraft restart requests.' `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -User 'SYSTEM' `
    -RunLevel Highest `
    -Force

Write-Host 'Scheduled task installed: CSG Mission Control Agent'
