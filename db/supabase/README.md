# Supabase

Esta carpeta ya queda reservada para la base transaccional de la app.

## Objetivo

Usar `Supabase Postgres` para:
- autenticacion basica
- perfiles
- fincas
- parcelas
- campanas
- watchlist
- onboarding

Mientras tanto, `DuckDB + MinIO + Delta` siguen resolviendo:
- SISAP
- SUNAT
- MIDAGRI
- tendencias
- senales
- analitica

## Archivos

- `schema.sql`: primer corte del esquema operacional de la app

## Orden recomendado

1. Crear un proyecto en Supabase
2. Abrir el SQL Editor
3. Ejecutar `schema.sql`
4. Guardar las credenciales en el backend
5. Conectar el `api` a Supabase para auth/farms/campaigns

Variables recomendadas:
- `SUPABASE_URL=https://<project-ref>.supabase.co`
- `SUPABASE_SECRET_KEY=sb_secret_...`

## Regla importante

No mover las tablas analiticas a Supabase.

La separacion sana es:
- `Supabase`: transacciones de la app
- `DuckDB`: consultas e inteligencia de negocio
