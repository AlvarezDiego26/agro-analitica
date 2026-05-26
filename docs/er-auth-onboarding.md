# ER Inicial - Supabase App Core

Este es el modelo base recomendado para la parte transaccional de AgroAnalitica:
- visitante con exploracion publica
- registro/login basico por email y password
- usuario nuevo sin finca ni campanas
- onboarding guiado
- datos operativos en Supabase Postgres
- analitica y senales en DuckDB

```mermaid
erDiagram
    USERS ||--|| PROFILES : tiene
    USERS ||--o{ USER_SESSIONS : abre
    USERS ||--o{ FARMS : registra
    FARMS ||--o{ PARCELS : contiene
    FARMS ||--o{ CAMPAIGNS : agrupa
    PARCELS ||--o{ CAMPAIGNS : ejecuta
    USERS ||--o{ WATCHLIST_ITEMS : guarda
    USERS ||--o{ ONBOARDING_EVENTS : completa

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string auth_status
        datetime created_at
        datetime updated_at
        datetime last_login_at
    }

    PROFILES {
        uuid user_id PK,FK
        string full_name
        string phone
        string region_code
        string valley_name
        string producer_type
        string primary_crop
        datetime created_at
        datetime updated_at
    }

    USER_SESSIONS {
        uuid id PK
        uuid user_id FK
        string session_token_hash
        string user_agent
        string ip_address
        datetime expires_at
        datetime revoked_at
        datetime created_at
    }

    FARMS {
        uuid id PK
        uuid user_id FK
        string farm_name
        string region_code
        string province_name
        string district_name
        string location_label
        decimal total_hectares
        string water_source
        datetime created_at
        datetime updated_at
    }

    PARCELS {
        uuid id PK
        uuid farm_id FK
        string parcel_name
        decimal hectares
        string soil_type
        string irrigation_type
        string current_crop_name
        string current_stage
        string status
        datetime created_at
        datetime updated_at
    }

    CAMPAIGNS {
        uuid id PK
        uuid farm_id FK
        uuid parcel_id FK
        string crop_name
        date sowing_date
        date estimated_harvest_date
        decimal hectares
        string market_type
        string campaign_status
        decimal estimated_roi_pct
        string planner_risk_level
        datetime created_at
        datetime updated_at
    }

    WATCHLIST_ITEMS {
        uuid id PK
        uuid user_id FK
        string item_type
        string source_key
        string label
        string source_module
        datetime created_at
    }

    ONBOARDING_EVENTS {
        uuid id PK
        uuid user_id FK
        string step_key
        boolean completed
        datetime completed_at
        jsonb metadata
        datetime created_at
    }
```

## Que resuelve este modelo

### 1. Visitante publico
No necesita fila en base de datos.
Puede ver:
- mercado
- precios de referencia
- cultivos con mejor senal
- tendencias publicas

### 2. Registro basico
Se crea:
- `users`
- `profiles`
- primera `user_sessions`

### 3. Usuario nuevo
Puede existir sin:
- `farms`
- `parcels`
- `campaigns`

Eso permite que el home no se vea vacio y el backend pueda responder:
- `is_new_user = true`
- `recommended_next_steps = [...]`

### 4. Usuario activo
Cuando registra:
- finca
- parcelas
- campanas

entonces el dashboard pasa a ser personalizado.

## Reglas de modelado

- `users` guarda solo lo minimo de autenticacion.
- `profiles` guarda metadata de negocio del productor.
- `farms` representa el predio o unidad productiva.
- `parcels` divide la finca en unidades manejables.
- `campaigns` guarda cada campana de siembra/produccion a lo largo del tiempo.
- `watchlist_items` sirve para seguir productos, compradores o referencias de mercado.
- `onboarding_events` evita meter estados raros en `users` y deja trazabilidad.

## Que no meter aqui

Estas cosas no deberian vivir en Supabase:
- caches analiticos de DuckDB
- tablas crudas de SUNAT
- tablas crudas de SISAP
- tablas crudas de MIDAGRI
- series pesadas de mercado historico

Eso debe seguir en DuckDB y MinIO.

## Separacion recomendada

- `Supabase Postgres`: operacion de la app
- `DuckDB`: analitica, tendencias y senales
- `API backend`: une ambos mundos
