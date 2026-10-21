param([int]$port = 8080)

$targetDir = Join-Path $PSScriptRoot "OBUMSJ Website"
if (-not (Test-Path $targetDir)) {
    $targetDir = $PSScriptRoot
}

$serverScript = Join-Path $targetDir "server.ps1"
if (Test-Path $serverScript) {
    & $serverScript -port $port
} else {
    Write-Error "Could not find server script in $targetDir"
}
