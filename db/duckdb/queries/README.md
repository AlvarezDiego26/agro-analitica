# Queries DuckDB

Aqui iran las consultas SQL pensadas para ejecutarse directamente sobre DuckDB.

La idea es reflejar las consultas analiticas reales del backend usando la sintaxis y flujo de `DuckDB + delta_scan(...)`.

## Convencion sugerida

- `sisap/`
  - consultas sobre precios y volumen

- `sunat/`
  - consultas sobre exportaciones

- `dashboard/`
  - consultas equivalentes al resumen principal del home

- `planner/`
  - consultas equivalentes al analisis base del planificador

Cuando una consulta sea suficientemente estable para negocio, debe vivir aqui aunque luego tambien exista una version embebida en backend.
