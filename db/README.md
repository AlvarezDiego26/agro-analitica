# DB

Esta carpeta concentra los artefactos de datos del proyecto.

Hoy el stack de datos esta centrado en `DuckDB + Delta`, leyendo tablas Delta desde MinIO y generando snapshots para el backend.

## Estructura actual

```txt
db/
??? duckdb/
?   ??? runtime/
?   ??? queries/
?   ??? validation/
??? migrations/
??? supabase/
```

## Que va en cada carpeta

- `duckdb/runtime/`
  - stack operativo de DuckDB en Docker
  - scripts SQL para extensiones, MinIO y tablas de serving
  - archivos `.duckdb` locales solo para runtime, no para versionado

- `duckdb/queries/`
  - consultas SQL de referencia para backend y analitica

- `duckdb/validation/`
  - pruebas de conectividad y lectura sobre Delta en MinIO

- `migrations/`
  - cambios SQL versionados

- `supabase/`
  - reservado para integraciones futuras

## Regla practica

La logica pesada de datos debe vivir en SQL dentro de `db/`, no escondida en el backend.

## Estado actual

- `DuckDB` es el motor SQL del proyecto.
- `Delta + MinIO` son la fuente de datos.
- `api/` consume snapshots ya curados.
