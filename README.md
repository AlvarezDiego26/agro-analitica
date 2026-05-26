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

## Docker Compose

El proyecto ya puede levantarse desde la raiz con:

```bash
docker compose up --build
```

Eso arranca:

- `ui` en [http://localhost:3000](http://localhost:3000)
- `api` en [http://localhost:3001](http://localhost:3001)
- `duckdb` como contenedor utilitario de soporte

Antes de levantar, valida estos archivos:

- [api/.env](C:/Users/diego/Documents/EMPRESA/agro-analitica/api/.env)
- [db/duckdb/runtime/.env](C:/Users/diego/Documents/EMPRESA/agro-analitica/db/duckdb/runtime/.env)

Notas:

- `api` lee su configuracion sensible desde `api/.env`
- `ui` usa `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` en navegador
- `ui` usa `INTERNAL_API_BASE_URL=http://api:3001` cuando hace fetch desde el contenedor
- `duckdb` queda dentro del compose como contenedor de soporte para inspeccion y validacion del runtime

## Yarn

El proyecto quedo estandarizado para Yarn Classic.

Comandos base:

```bash
cd api
corepack yarn build

cd ../ui
corepack yarn build
```

Para instalar dependencias:

```bash
cd api
corepack yarn install

cd ../ui
corepack yarn install
```
