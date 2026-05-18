# API

Backend en Express + TypeScript.

Mantiene separacion por:

- `application`
- `domain`
- `infrastructure`
- `interfaces`

La logica analitica pesada se resuelve en DuckDB sobre vistas Delta leidas desde MinIO. La API expone payloads ligeros para dashboard, planificador y mercado/exportaciones.
