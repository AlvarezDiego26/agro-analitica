param(
  [string]$ContainerName = "duckdb-agro"
)

$runtimePath = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$buildDb = Join-Path $runtimePath 'data\agro_build.duckdb'

Write-Host "[DuckDB] Construyendo cache en agro_build.duckdb..."
docker exec $ContainerName /duckdb /data/agro_build.duckdb -init /sql/51-build-api-cache-fast.sql -c "SHOW TABLES;"
if ($LASTEXITCODE -ne 0) {
  throw "Fallo la construccion del cache DuckDB."
}

if (-not (Test-Path $buildDb)) {
  throw "No se genero el archivo $buildDb"
}

Write-Host "[DuckDB] Cache construido correctamente en $buildDb"
