# Arquitectura del Backend

## Flujo actual

`UI -> HTTP -> controller -> use-case -> repository port -> DuckDB repository -> DuckDB cache`

Hoy el backend quedó reducido al flujo real que usa la app:

- `dashboard/overview`
- `showcase/home`
- `showcase/market-buyers`
- `showcase/farm`
- `planner/analysis`
- `sunat/exports/overview`

## Regla de capas

- `controller`: recibe request, valida y responde JSON.
- `use-case`: orquesta la aplicación y aplica lógica de negocio.
- `repository port`: define lo que el caso de uso necesita.
- `repository implementation`: consulta DuckDB y mapea resultados.
- `domain`: define contratos y estructuras sin Express ni SQL.

## Estructura actual

```text
api/
├─ src/
│  ├─ app.ts
│  ├─ bootstrap.ts
│  ├─ container.ts
│  ├─ main.ts
│  ├─ application/
│  │  ├─ dashboard/
│  │  │  └─ use-cases/
│  │  ├─ planner/
│  │  │  ├─ services/
│  │  │  └─ use-cases/
│  │  ├─ showcase/
│  │  │  ├─ services/
│  │  │  └─ use-cases/
│  │  └─ sunat/
│  │     └─ use-cases/
│  ├─ domain/
│  │  ├─ dashboard/
│  │  │  ├─ entities/
│  │  │  └─ ports/
│  │  ├─ planner/
│  │  │  ├─ entities/
│  │  │  └─ ports/
│  │  ├─ showcase/
│  │  │  ├─ entities/
│  │  │  └─ ports/
│  │  └─ sunat/
│  │     ├─ entities/
│  │     └─ ports/
│  ├─ infrastructure/
│  │  ├─ config/
│  │  └─ persistence/
│  │     ├─ duckdb/
│  │     │  ├─ clients/
│  │     │  └─ repositories/
│  │     └─ shared/
│  └─ interfaces/
│     └─ http/
│        ├─ controllers/
│        ├─ dtos/
│        ├─ middlewares/
│        └─ routes/
```

## Decisiones de limpieza

- Se eliminó `postgres` completo del flujo.
- Se eliminaron `midagri` y `sisap`.
- Se eliminaron endpoints no usados de `sunat` como `trend` y `top-products`.
- Se eliminaron scripts y artefactos locales que no aportaban al runtime actual.

## Qué sí hace el backend ahora

- expone una API HTTP mínima para la UI
- consulta caches/tablas de DuckDB
- valida inputs
- aplica lógica de negocio puntual en `planner`
- entrega responses listas para el frontend

## Qué no debería volver a entrar

- ramas paralelas de persistencia que no se usan
- scripts con credenciales hardcodeadas
- módulos analíticos no conectados al frontend actual
- endpoints “por si acaso” sin consumidor real

## Regla práctica

Si una nueva pantalla necesita backend:

1. agrega `domain/<modulo>/entities` y `ports`
2. agrega `application/<modulo>/use-cases`
3. agrega `interfaces/http/controllers` y `dtos`
4. implementa el puerto en `infrastructure/persistence/duckdb/repositories`
5. registra todo en `container.ts`

## Antipatrones a evitar

- controller con lógica de negocio
- use-case con SQL embebido
- repository devolviendo respuestas HTTP
- infraestructura con ramas de datasource que no se usan
- código “future-proof” sin flujo real en la app
