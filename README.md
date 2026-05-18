# AgroAnalitica

Repositorio base del producto `AgroAnalitica`, organizado por capas de trabajo:

- `db/`: scripts SQL, runtime de DuckDB, migraciones y soporte de datos.
- `api/`: backend en Express + TypeScript para negocio, serving y endpoints.
- `ui/`: frontend en Next.js con App Router, enfoque mobile-first y estructura feature-driven.

## Estructura

```txt
agro-analitica/
??? db/
??? api/
??? ui/
```

## Estado actual

- `DuckDB + Delta` es la base del serving analitico.
- `api/` consume snapshots curados desde DuckDB.
- `ui/` consume los endpoints del backend.
