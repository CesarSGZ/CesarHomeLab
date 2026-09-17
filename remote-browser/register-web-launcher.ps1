$ErrorActionPreference='Stop'
# Manual protocol handler only. No background listener, startup task or login trigger.
$Key='HKCU:\Software\Classes\cesar-remote'
$Shell=(Get-Command pwsh -ErrorAction Stop).Source
$Script=Join-Path $PSScriptRoot 'web-launcher.ps1'
$Private=Join-Path $env:LOCALAPPDATA 'CesarHomeLab/RemoteBrowser'
$Exe=Join-Path $Private 'CesarRemoteLauncher.exe'
$Compiler=Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
& $Compiler /nologo /target:winexe /reference:System.Windows.Forms.dll /reference:System.Drawing.dll ('/out:'+$Exe) (Join-Path $PSScriptRoot 'Launcher.cs')
if($LASTEXITCODE -ne 0){throw 'Could not compile the local launcher.'}
$Config='HKCU:\Software\CesarHomeLab\RemoteLauncher'
New-Item -Path $Config -Force | Out-Null
New-ItemProperty -Path $Config -Name 'PowerShell' -Value $Shell -Force | Out-Null
New-ItemProperty -Path $Config -Name 'Script' -Value $Script -Force | Out-Null
New-Item -Path "$Key\shell\open\command" -Force | Out-Null
Set-Item -Path $Key -Value 'URL:CesarPC Remote Browser'
New-ItemProperty -Path $Key -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
Set-Item -Path "$Key\shell\open\command" -Value ('"'+$Exe+'" "%1"')
New-Item -Path "$Key\Application" -Force | Out-Null
New-ItemProperty -Path "$Key\Application" -Name 'ApplicationName' -Value 'CesarPC Remote Browser' -Force | Out-Null
# Notify already-running browsers that Windows URL associations changed.
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class CesarAssociations { [DllImport("shell32.dll")] public static extern void SHChangeNotify(uint e, uint f, IntPtr a, IntPtr b); }'
[CesarAssociations]::SHChangeNotify(0x08000000,0,[IntPtr]::Zero,[IntPtr]::Zero)
$Task=Get-ScheduledTask -TaskName 'CesarHomeLab Remote Browser' -ErrorAction SilentlyContinue
if($Task){Disable-ScheduledTask -TaskName $Task.TaskName | Out-Null}
Write-Output 'Manual web launcher registered. Remote Browser automatic startup disabled.'
