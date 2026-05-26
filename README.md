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

El proyecto puede levantarse separado por servicio desde la raiz.

Primero refresca el snapshot DuckDB que consulta la API:

```bash
docker compose --profile jobs run --rm duckdb-refresh
```

Luego levanta API y UI:

```bash
docker compose up --build
```

Eso arranca:

- `ui` en [http://localhost:3000](http://localhost:3000)
- `api` en [http://localhost:3001](http://localhost:3001)

Para levantar por separado:

```bash
docker compose up --build api
docker compose up --build ui
```

Para abrir DuckDB como herramienta de inspeccion:

```bash
docker compose --profile tools up duckdb
docker compose exec duckdb /duckdb /data/agro_api_snapshot.duckdb
```

Antes de levantar, valida estos archivos:

- [api/.env](C:/Users/diego/Documents/EMPRESA/agro-analitica/api/.env)
- [db/duckdb/runtime/.env](C:/Users/diego/Documents/EMPRESA/agro-analitica/db/duckdb/runtime/.env)

Notas:

- `api` lee su configuracion sensible desde `api/.env`
- `ui` usa `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` en navegador
- `ui` usa `INTERNAL_API_BASE_URL=http://api:3001` cuando hace fetch desde el contenedor
- `duckdb-refresh` reconstruye `agro_build.duckdb` desde MinIO/Delta y publica `agro_api_snapshot.duckdb`
- `api` debe leer `agro_api_snapshot.duckdb` en modo `READ_ONLY`
- `duckdb` queda dentro del compose como contenedor de soporte para inspeccion y validacion del runtime
- `52-build-api-cache-dummy.sql` queda solo como script de demo local; produccion usa `51-build-api-cache-fast.sql` para refrescar y `00-node-backend-init.sql` para iniciar la API

## Yarn

El proyecto quedo estandarizado para Yarn Classic.

Comandos base:

```bash
cd api
corepack yarn build

cd ../ui
corepack yarn build
```

En produccion no se usa `yarn dev`: primero se valida `yarn build`,
luego se levanta cada servicio con `yarn start` o con Docker Compose.

Para instalar dependencias:

```bash
cd api
corepack yarn install

cd ../ui
corepack yarn install
```
