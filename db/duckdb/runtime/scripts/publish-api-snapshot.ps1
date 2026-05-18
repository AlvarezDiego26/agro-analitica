$runtimePath = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$buildDb = Join-Path $runtimePath 'data\agro_build.duckdb'
$apiDb = Join-Path $runtimePath 'data\agro_api_snapshot.duckdb'

if (-not (Test-Path $buildDb)) {
  throw "No existe el archivo de build: $buildDb"
}

Copy-Item -LiteralPath $buildDb -Destination $apiDb -Force
Write-Host "[DuckDB] Snapshot publicado en $apiDb"
