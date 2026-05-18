# Interfaces

Aqui viven los adaptadores de entrada del backend.

Contenido esperado:

- `controllers/`
- `dtos/`
- `mappers/`
- `middlewares/`
- `routes/`

Reglas:

- transforma HTTP hacia casos de uso
- no mete logica de negocio
- no resuelve SQL
- no depende de detalles de DuckDB

## Rol de cada carpeta HTTP

- `controllers/`
  - reciben request y responden JSON
  - llaman al caso de uso
  - deben ser delgados

- `dtos/`
  - schemas de entrada HTTP
  - validacion de query, params o body

- `middlewares/`
  - validacion reutilizable
  - manejo comun de errores
  - not found
  - wrappers asincronos

- `routes/`
  - conectan ruta + middleware + controller
