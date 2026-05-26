#!/bin/sh
set -eu

BUILD_DB="${DUCKDB_BUILD_DATABASE_PATH:-/data/agro_build.duckdb}"
API_DB="${DUCKDB_API_DATABASE_PATH:-/data/agro_api_snapshot.duckdb}"
TMP_DB="${API_DB}.tmp"

if [ ! -f "${BUILD_DB}" ]; then
  echo "[DuckDB] No existe el archivo de build: ${BUILD_DB}" >&2
  exit 1
fi

cp "${BUILD_DB}" "${TMP_DB}"
mv "${TMP_DB}" "${API_DB}"
echo "[DuckDB] Snapshot publicado en ${API_DB}"
