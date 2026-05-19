CREATE SCHEMA IF NOT EXISTS serving;

CREATE TABLE IF NOT EXISTS serving.dashboard_overview (
    latest_date DATE,
    analyzed_rows BIGINT NOT NULL,
    product_count BIGINT NOT NULL,
    origin_count BIGINT NOT NULL,
    overall_average NUMERIC(18, 4),
    total_volume_ton NUMERIC(18, 4),
    average_volume_ton NUMERIC(18, 4),
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.dashboard_trend (
    fecha DATE NOT NULL PRIMARY KEY,
    average_price NUMERIC(18, 4) NOT NULL,
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.dashboard_top_products (
    producto_nombre TEXT NOT NULL PRIMARY KEY,
    average_price NUMERIC(18, 4),
    min_price NUMERIC(18, 4),
    max_price NUMERIC(18, 4),
    record_count BIGINT NOT NULL,
    total_volume_ton NUMERIC(18, 4),
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.planner_product_analysis (
    producto_key TEXT NOT NULL PRIMARY KEY,
    producto_nombre TEXT NOT NULL,
    average_price NUMERIC(18, 4) NOT NULL,
    latest_price NUMERIC(18, 4),
    min_price NUMERIC(18, 4),
    max_price NUMERIC(18, 4),
    latest_date DATE,
    records BIGINT NOT NULL,
    average_volume_ton NUMERIC(18, 4),
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS planner_product_analysis_producto_nombre_idx
    ON serving.planner_product_analysis (LOWER(producto_nombre));

CREATE TABLE IF NOT EXISTS serving.sunat_overview (
    latest_date DATE,
    total_records BIGINT NOT NULL,
    product_count BIGINT NOT NULL,
    destination_count BIGINT NOT NULL,
    total_usd NUMERIC(18, 2),
    total_net_weight_kg NUMERIC(18, 2),
    average_usd_per_kg NUMERIC(18, 4),
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.sunat_top_products (
    producto_key TEXT NOT NULL PRIMARY KEY,
    producto_nombre TEXT NOT NULL,
    categoria_producto TEXT,
    total_usd NUMERIC(18, 2),
    total_net_weight_kg NUMERIC(18, 2),
    average_usd_per_kg NUMERIC(18, 4),
    operation_count BIGINT NOT NULL,
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.sunat_top_destinations (
    destino_codigo TEXT NOT NULL PRIMARY KEY,
    destino_nombre TEXT NOT NULL,
    total_usd NUMERIC(18, 2),
    total_net_weight_kg NUMERIC(18, 2),
    operation_count BIGINT NOT NULL,
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.sunat_product_trend (
    producto_key TEXT NOT NULL,
    fecha DATE NOT NULL,
    total_usd NUMERIC(18, 2),
    total_net_weight_kg NUMERIC(18, 2),
    average_usd_per_kg NUMERIC(18, 4),
    operation_count BIGINT NOT NULL,
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (producto_key, fecha)
);

CREATE INDEX IF NOT EXISTS sunat_product_trend_producto_key_fecha_idx
    ON serving.sunat_product_trend (producto_key, fecha DESC);

CREATE TABLE IF NOT EXISTS serving.sisap_overview (
    latest_date DATE,
    analyzed_rows BIGINT NOT NULL,
    product_count BIGINT NOT NULL,
    origin_count BIGINT NOT NULL,
    overall_average NUMERIC(18, 4),
    total_volume_ton NUMERIC(18, 4),
    average_volume_ton NUMERIC(18, 4),
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.sisap_top_products (
    producto_nombre TEXT NOT NULL PRIMARY KEY,
    average_price NUMERIC(18, 4),
    min_price NUMERIC(18, 4),
    max_price NUMERIC(18, 4),
    record_count BIGINT NOT NULL,
    total_volume_ton NUMERIC(18, 4),
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.sisap_product_trend (
    producto_key TEXT NOT NULL,
    fecha DATE NOT NULL,
    producto_nombre TEXT NOT NULL,
    average_price NUMERIC(18, 4),
    min_price NUMERIC(18, 4),
    max_price NUMERIC(18, 4),
    record_count BIGINT NOT NULL,
    total_volume_ton NUMERIC(18, 4),
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (producto_key, fecha)
);

CREATE INDEX IF NOT EXISTS sisap_product_trend_producto_key_fecha_idx
    ON serving.sisap_product_trend (producto_key, fecha DESC);

CREATE TABLE IF NOT EXISTS serving.midagri_exports_overview (
    latest_date DATE,
    total_records BIGINT NOT NULL,
    product_count BIGINT NOT NULL,
    total_usd NUMERIC(18, 2),
    total_net_weight_ton NUMERIC(18, 2),
    average_usd_per_ton NUMERIC(18, 4),
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.midagri_exports_top_products (
    producto_key TEXT NOT NULL PRIMARY KEY,
    subpartida_nacional TEXT,
    producto_nombre TEXT NOT NULL,
    total_usd NUMERIC(18, 2),
    total_net_weight_ton NUMERIC(18, 2),
    average_usd_per_ton NUMERIC(18, 4),
    record_count BIGINT NOT NULL,
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.midagri_exports_trend (
    producto_key TEXT NOT NULL,
    fecha DATE NOT NULL,
    subpartida_nacional TEXT,
    producto_nombre TEXT NOT NULL,
    total_usd NUMERIC(18, 2),
    total_net_weight_ton NUMERIC(18, 2),
    average_usd_per_ton NUMERIC(18, 4),
    record_count BIGINT NOT NULL,
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (producto_key, fecha)
);

CREATE INDEX IF NOT EXISTS midagri_exports_trend_producto_key_fecha_idx
    ON serving.midagri_exports_trend (producto_key, fecha DESC);

CREATE TABLE IF NOT EXISTS serving.midagri_imports_overview (
    latest_date DATE,
    total_records BIGINT NOT NULL,
    product_count BIGINT NOT NULL,
    total_usd NUMERIC(18, 2),
    total_net_weight_ton NUMERIC(18, 2),
    average_usd_per_ton NUMERIC(18, 4),
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.midagri_imports_top_products (
    producto_key TEXT NOT NULL PRIMARY KEY,
    subpartida_nacional TEXT,
    producto_nombre TEXT NOT NULL,
    total_usd NUMERIC(18, 2),
    total_net_weight_ton NUMERIC(18, 2),
    average_usd_per_ton NUMERIC(18, 4),
    record_count BIGINT NOT NULL,
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS serving.midagri_imports_trend (
    producto_key TEXT NOT NULL,
    fecha DATE NOT NULL,
    subpartida_nacional TEXT,
    producto_nombre TEXT NOT NULL,
    total_usd NUMERIC(18, 2),
    total_net_weight_ton NUMERIC(18, 2),
    average_usd_per_ton NUMERIC(18, 4),
    record_count BIGINT NOT NULL,
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (producto_key, fecha)
);

CREATE INDEX IF NOT EXISTS midagri_imports_trend_producto_key_fecha_idx
    ON serving.midagri_imports_trend (producto_key, fecha DESC);
