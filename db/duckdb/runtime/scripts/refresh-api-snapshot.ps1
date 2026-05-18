param(
  [string]$ContainerName = "duckdb-agro"
)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $scriptRoot 'build-api-cache.ps1') -ContainerName $ContainerName
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& (Join-Path $scriptRoot 'publish-api-snapshot.ps1')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "[DuckDB] Refresh completo terminado."
