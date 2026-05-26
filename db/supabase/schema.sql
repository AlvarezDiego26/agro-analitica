create extension if not exists "pgcrypto";

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    password_hash text not null,
    auth_status text not null default 'active' check (auth_status in ('active', 'disabled', 'pending')),
    last_login_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
    user_id uuid primary key references public.users(id) on delete cascade,
    full_name text not null,
    phone text,
    region_code text,
    valley_name text,
    producer_type text,
    primary_crop text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.user_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    session_token_hash text not null unique,
    user_agent text,
    ip_address text,
    expires_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_user_sessions_user_id on public.user_sessions(user_id);
create index if not exists idx_user_sessions_expires_at on public.user_sessions(expires_at);

create table if not exists public.farms (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    farm_name text not null,
    region_code text not null,
    province_name text,
    district_name text,
    location_label text,
    total_hectares numeric(12,2) not null default 0 check (total_hectares >= 0),
    water_source text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_farms_user_id on public.farms(user_id);

create table if not exists public.parcels (
    id uuid primary key default gen_random_uuid(),
    farm_id uuid not null references public.farms(id) on delete cascade,
    parcel_name text not null,
    hectares numeric(12,2) not null check (hectares > 0),
    soil_type text,
    irrigation_type text,
    current_crop_name text,
    current_stage text,
    status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_parcels_farm_id on public.parcels(farm_id);

create table if not exists public.campaigns (
    id uuid primary key default gen_random_uuid(),
    farm_id uuid not null references public.farms(id) on delete cascade,
    parcel_id uuid not null references public.parcels(id) on delete restrict,
    crop_name text not null,
    sowing_date date not null,
    estimated_harvest_date date,
    hectares numeric(12,2) not null check (hectares > 0),
    market_type text not null default 'local' check (market_type in ('local', 'exportacion', 'industrial')),
    campaign_status text not null default 'draft' check (campaign_status in ('draft', 'planned', 'active', 'completed', 'cancelled')),
    estimated_roi_pct numeric(8,2),
    planner_risk_level text check (planner_risk_level in ('low', 'medium', 'high')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_campaigns_farm_id on public.campaigns(farm_id);
create index if not exists idx_campaigns_parcel_id on public.campaigns(parcel_id);
create index if not exists idx_campaigns_sowing_date on public.campaigns(sowing_date);

create table if not exists public.watchlist_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    item_type text not null check (item_type in ('product', 'buyer', 'supply', 'trend')),
    source_key text not null,
    label text not null,
    source_module text not null check (source_module in ('dashboard', 'marketplace', 'planner', 'sunat', 'sisap', 'midagri')),
    created_at timestamptz not null default now(),
    unique (user_id, item_type, source_key)
);

create index if not exists idx_watchlist_items_user_id on public.watchlist_items(user_id);

create table if not exists public.onboarding_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    step_key text not null,
    completed boolean not null default false,
    completed_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    unique (user_id, step_key)
);

create index if not exists idx_onboarding_events_user_id on public.onboarding_events(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_farms_updated_at on public.farms;
create trigger trg_farms_updated_at
before update on public.farms
for each row
execute function public.set_updated_at();

drop trigger if exists trg_parcels_updated_at on public.parcels;
create trigger trg_parcels_updated_at
before update on public.parcels
for each row
execute function public.set_updated_at();

drop trigger if exists trg_campaigns_updated_at on public.campaigns;
create trigger trg_campaigns_updated_at
before update on public.campaigns
for each row
execute function public.set_updated_at();
