# Esquema del Backend

## Estructura base

```txt
src/
├── @types/
├── app.ts
├── bootstrap.ts
├── container.ts
├── main.ts
├── application/
│   ├── dashboard/
│   │   ├── dtos/
│   │   └── use-cases/
│   ├── planner/
│   │   ├── dtos/
│   │   └── use-cases/
│   └── sunat/
│       ├── dtos/
│       └── use-cases/
├── domain/
│   ├── dashboard/
│   │   ├── entities/
│   │   └── ports/
│   ├── planner/
│   │   ├── entities/
│   │   └── ports/
│   └── sunat/
│       ├── entities/
│       └── ports/
├── infrastructure/
│   ├── config/
│   └── persistence/
│       └── duckdb/
│           ├── clients/
│           └── repositories/
└── interfaces/
    └── http/
        ├── controllers/
        ├── dtos/
        ├── mappers/
        ├── middlewares/
        └── routes/
```

## Que va en cada capa

- `domain`
  - entidades del negocio
  - contratos o puertos
  - nada de Express
  - nada de DuckDB

- `application`
  - casos de uso
  - DTOs internos de aplicacion
  - orquestacion entre puertos

- `infrastructure`
  - implementaciones concretas
  - cliente de DuckDB
  - consultas SQL
  - configuracion de entorno

- `interfaces/http`
  - controladores
  - DTOs de entrada HTTP
  - middlewares
  - rutas
  - mapeos request/response si hicieran falta

## Regla sobre genericos

Usar genericos solo cuando reduzcan duplicacion tecnica sin ocultar el significado del negocio.

### Donde si usar genericos

- helpers tecnicos de infraestructura
- ejecutores de consultas
- piezas reutilizables de bajo nivel
- middlewares reutilizables de validacion

Ejemplo actual:

- `DuckDbQueryExecutor.execute<T>()`
- `validateRequest(source, schema)`

### Donde no usar genericos

- casos de uso
- puertos de repositorio
- repositorios concretos
- controladores
- entidades

### Por que

- `GetDashboardOverviewUseCase` debe hablar de dashboard, no de `UseCase<TIn, TOut>`
- `PlannerRepository` debe hablar de analisis de campana, no de CRUD generico
- nombres explicitos hacen el codigo mas entendible para el equipo

## Convenciones practicas

- los controladores deben ser delgados
- la validacion HTTP vive en `interfaces/http/dtos` y `interfaces/http/middlewares`
- los controladores no hacen `parse()` ni `try/catch` por endpoint
- los errores HTTP se resuelven en un middleware comun
- los casos de uso viven en `application/.../use-cases`
- los puertos viven en `domain/.../ports`
- la implementacion real vive en `infrastructure/...`
- el wiring vive en `container.ts`
- el arranque del servidor vive en `bootstrap.ts` y `main.ts`

## Flujo real de una ruta

1. La ruta entra por `interfaces/http/routes`.
2. Si hace falta, un middleware valida `query`, `body` o `params`.
3. El controller recibe datos ya validados.
4. El controller llama al caso de uso.
5. El caso de uso depende de un puerto del dominio.
6. La implementacion real del puerto vive en infraestructura.
7. Si algo falla, el error lo resuelve el middleware global.

## Nota importante

La arquitectura hexagonal vive en `src/`.

- `src/` es el codigo fuente real
- `dist/` es solo salida compilada
- `dist/` no se usa para disenar ni mantener la arquitectura
