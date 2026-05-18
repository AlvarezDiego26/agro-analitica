# DuckDB

Aqui vive el motor de datos actual basado en `DuckDB + Delta`.

El objetivo de esta carpeta es:

- leer tablas Delta sobre MinIO
- crear vistas reutilizables para backend
- guardar queries de negocio versionadas
- dejar el runtime de datos completo dentro del repo

## Estructura

```txt
duckdb/
├── runtime/
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── data/
│   ├── scripts/
│   ├── sql/
│   └── README.md
├── queries/
└── validation/
```

## Convencion

- `runtime/`
  - levanta el contenedor
  - persiste el archivo `.duckdb`
  - guarda los scripts base para extensiones, secreto S3 y vistas

- `queries/`
  - consultas SQL de referencia para backend o analitica

- `validation/`
  - scripts de prueba para verificar lectura de Delta y conectividad con MinIO

## Nota importante

Esta carpeta es la referencia principal del stack de datos del proyecto.
