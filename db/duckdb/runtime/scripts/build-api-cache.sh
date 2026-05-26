#!/bin/sh
set -eu

BUILD_DB="${DUCKDB_BUILD_DATABASE_PATH:-/data/agro_build.duckdb}"
BUILD_SQL="${DUCKDB_BUILD_SQL_PATH:-/sql/51-build-api-cache-fast.sql}"
RENDERED_SQL="${DUCKDB_RENDERED_SQL_PATH:-/tmp/51-build-api-cache-fast.rendered.sql}"

echo "[DuckDB] Construyendo cache en ${BUILD_DB} desde ${BUILD_SQL}..."
node /scripts/render-sql.js "${BUILD_SQL}" "${RENDERED_SQL}"
/duckdb "${BUILD_DB}" -init "${RENDERED_SQL}" -c "SHOW TABLES;"

if [ ! -f "${BUILD_DB}" ]; then
  echo "[DuckDB] No se genero el archivo ${BUILD_DB}" >&2
  exit 1
fi

echo "[DuckDB] Cache construido correctamente en ${BUILD_DB}"
