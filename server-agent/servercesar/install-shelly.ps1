# Installs shelly-plug.js on the Shelly plug in front of ServerCesar and gives it its token.
# Run elevated on ServerCesar (the agent token is DPAPI LocalMachine). The plug token is
# HMAC-SHA256(agent token, "servercesar-plug"), the same value the website derives; it is never printed.
param([string]$Plug = '192.168.33.1')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security
$rpc = "http://$Plug/rpc"
function Send-Rpc($method, $params) {
    Invoke-RestMethod -Method Post -Uri "$rpc/$method" -ContentType 'application/json' -Body ($params | ConvertTo-Json -Depth 6 -Compress) -TimeoutSec 15
}

$encrypted = [Convert]::FromBase64String((Get-Content -Raw 'C:\ProgramData\ServerCesar\agent-token.enc').Trim())
$entropy = [Text.Encoding]::UTF8.GetBytes('ServerCesar-Agent-v1')
$agentToken = [Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect($encrypted, $entropy, 'LocalMachine'))
$hmac = New-Object Security.Cryptography.HMACSHA256 (,[Text.Encoding]::UTF8.GetBytes($agentToken))
$plugToken = -join ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes('servercesar-plug')) | ForEach-Object { $_.ToString('x2') })
Send-Rpc 'KVS.Set' @{ key = 'sc_token'; value = $plugToken } | Out-Null
$agentToken = $null; $plugToken = $null

$code = Get-Content -Raw (Join-Path $PSScriptRoot 'shelly-plug.js')
$existing = @((Invoke-RestMethod "$rpc/Script.List").scripts | Where-Object { $_.name -eq 'servercesar' })
$id = if ($existing) { $existing[0].id } else { (Send-Rpc 'Script.Create' @{ name = 'servercesar' }).id }
try { Send-Rpc 'Script.Stop' @{ id = $id } | Out-Null } catch { }
$append = $false
for ($i = 0; $i -lt $code.Length; $i += 1024) {
    Send-Rpc 'Script.PutCode' @{ id = $id; code = $code.Substring($i, [Math]::Min(1024, $code.Length - $i)); append = $append } | Out-Null
    $append = $true
}
Send-Rpc 'Script.SetConfig' @{ id = $id; config = @{ enable = $true } } | Out-Null
Send-Rpc 'Script.Start' @{ id = $id } | Out-Null
Write-Output "script $id instalado y en marcha"
