param(
 [Parameter(Mandatory=$true)][string]$RelayUrl,
 [string]$NodePath = (Get-Command node -ErrorAction Stop).Source,
 [string]$PlaywrightPath = "$env:USERPROFILE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core"
)
$ErrorActionPreference = 'Stop'
$Repo = Split-Path $PSScriptRoot -Parent
$Private = Join-Path $env:LOCALAPPDATA 'CesarHomeLab/RemoteBrowser'
$ConfigFile = Join-Path $Private 'settings.json'
if (Test-Path -LiteralPath $ConfigFile) { throw 'Already provisioned. Reuse the existing private settings; do not rotate them by reinstalling.' }
if ($env:COMPUTERNAME -ne 'CesarPC') { throw 'Install this host only on CesarPC.' }
$Browser = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
if (!(Test-Path -LiteralPath $Browser)) { throw 'Microsoft Edge was not found.' }
New-Item -ItemType Directory -Path $Private -Force | Out-Null
$Identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
& icacls.exe $Private /inheritance:r /grant:r "${Identity}:(OI)(CI)F" 'SYSTEM:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not protect the private host folder.' }
$HostSecret = [Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLower()
$ViewerSecret = [Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLower()
$Config = @{dataDirectory=$Private;hostSecret=$HostSecret;relayUrl=$RelayUrl.TrimEnd('/');browserPath=$Browser;playwrightPath=$PlaywrightPath;localPort=18763}
$Config | ConvertTo-Json | Set-Content -LiteralPath $ConfigFile -Encoding UTF8
Push-Location $Repo
try {
 $HostSecret | & pnpm.cmd dlx wrangler@4.124.0 secret put HOST_SECRET --config remote-browser/worker/wrangler.jsonc
 if ($LASTEXITCODE -ne 0) {throw 'Host relay secret setup failed.'}
 $ViewerSecret | & pnpm.cmd dlx wrangler@4.124.0 secret put VIEWER_SECRET --config remote-browser/worker/wrangler.jsonc
 if ($LASTEXITCODE -ne 0) {throw 'Viewer relay secret setup failed.'}
 $ViewerSecret | & pnpm.cmd dlx wrangler@4.124.0 pages secret put REMOTE_VIEWER_SECRET --project-name cesar-solla
 if ($LASTEXITCODE -ne 0) {throw 'Portal secret setup failed.'}
 $RelayUrl.TrimEnd('/') | & pnpm.cmd dlx wrangler@4.124.0 pages secret put REMOTE_RELAY_URL --project-name cesar-solla
 if ($LASTEXITCODE -ne 0) {throw 'Portal relay address setup failed.'}
} finally {Pop-Location}
& (Join-Path $PSScriptRoot 'register-web-launcher.ps1')
Write-Output 'Installed in manual mode. Use the links in Mission Control on CesarPC to sign in or start sharing.'
