#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"

sh "${SCRIPT_DIR}/build-api-cache.sh"
sh "${SCRIPT_DIR}/publish-api-snapshot.sh"

echo "[DuckDB] Refresh completo terminado."
