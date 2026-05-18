# DuckDB Runtime

Este runtime usa dos archivos DuckDB distintos:

- `agro_build.duckdb`: se usa para construir o refrescar tablas curadas desde Delta.
- `agro_api_snapshot.duckdb`: se usa solo para lectura desde el backend.

## Flujo recomendado

1. El scraping deja Delta limpia en MinIO.
2. DuckDB construye tablas cacheadas en `agro_build.duckdb`.
3. Se publica una copia a `agro_api_snapshot.duckdb`.
4. La API lee solo `agro_api_snapshot.duckdb` en modo `READ_ONLY`.

## Scripts

### Construir cache

```powershell
cd C:\Users\diego\Documents\EMPRESA\agro-analitica\db\duckdb\runtime
powershell -ExecutionPolicy Bypass -File .\scripts\build-api-cache.ps1
```

### Publicar snapshot para la API

```powershell
cd C:\Users\diego\Documents\EMPRESA\agro-analitica\db\duckdb\runtime
powershell -ExecutionPolicy Bypass -File .\scripts\publish-api-snapshot.ps1
```

### Hacer refresh completo

```powershell
cd C:\Users\diego\Documents\EMPRESA\agro-analitica\db\duckdb\runtime
powershell -ExecutionPolicy Bypass -File .\scripts\refresh-api-snapshot.ps1
```

## Nota operativa

Para publicar el snapshot sin conflictos, conviene detener la API antes de copiar `agro_build.duckdb` a `agro_api_snapshot.duckdb`, y luego volver a levantarla.
