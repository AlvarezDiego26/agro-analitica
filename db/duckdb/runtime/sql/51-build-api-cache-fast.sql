INSTALL delta;
LOAD delta;

INSTALL httpfs;
LOAD httpfs;

SET preserve_insertion_order = false;
SET threads = 4;

CREATE OR REPLACE SECRET minio_secret (
    TYPE S3,
    KEY_ID 'oX3JYQssZtFM5rGC0xhK',
    SECRET 'xYsQ0Ty3CIAVmqfn7Uaob123uKN13gxQUviY5mSl',
    ENDPOINT '38.210.246.165:30090',
    URL_STYLE 'path',
    USE_SSL false,
    REGION 'us-east-1'
);

DROP TABLE IF EXISTS sisap_precios_recent_cache;
CREATE TABLE sisap_precios_recent_cache AS
WITH latest_price_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/')
    WHERE precio_prom IS NOT NULL
)
SELECT
    p.fecha,
    LOWER(p.producto_nombre) AS producto_key,
    p.producto_nombre,
    p.procedencia,
    p.precio_prom
FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/') p
CROSS JOIN latest_price_date l
WHERE p.precio_prom IS NOT NULL
  AND p.fecha >= l.latest_date - INTERVAL 30 DAY;

DROP TABLE IF EXISTS sisap_volumen_recent_cache;
CREATE TABLE sisap_volumen_recent_cache AS
WITH latest_volume_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/')
    WHERE volumen_ton IS NOT NULL
)
SELECT
    v.fecha,
    LOWER(v.producto_nombre) AS producto_key,
    v.producto_nombre,
    v.volumen_ton
FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/') v
CROSS JOIN latest_volume_date l
WHERE v.volumen_ton IS NOT NULL
  AND v.fecha >= l.latest_date - INTERVAL 30 DAY;

DROP TABLE IF EXISTS sunat_exportaciones_core_cache;
CREATE TABLE sunat_exportaciones_core_cache AS
SELECT
    fecha,
    LOWER(producto_key) AS producto_key,
    producto_nombre_catalogo AS producto_nombre,
    categoria_producto,
    codigo_pais_destino AS destino_codigo,
    valor_fob_usd,
    peso_neto_kg,
    precio_fob_usd_por_kg
FROM delta_scan('s3://agro-productos/Landing/sunat/exportaciones_filtradas/')
WHERE fecha IS NOT NULL
  AND producto_key IS NOT NULL;

DROP TABLE IF EXISTS dashboard_overview_cache;
CREATE TABLE dashboard_overview_cache AS
SELECT
    CAST(MAX(fecha) AS VARCHAR) AS latestDate,
    COUNT(*) AS analyzedRows,
    COUNT(DISTINCT producto_nombre) AS productCount,
    COUNT(DISTINCT procedencia) AS originCount,
    ROUND(AVG(precio_prom), 2) AS overallAverage,
    (SELECT ROUND(SUM(volumen_ton), 2) FROM sisap_volumen_recent_cache) AS totalVolumeTon,
    (SELECT ROUND(AVG(volumen_ton), 2) FROM sisap_volumen_recent_cache) AS averageVolumeTon
FROM sisap_precios_recent_cache;

DROP TABLE IF EXISTS dashboard_trend_cache;
CREATE TABLE dashboard_trend_cache AS
SELECT
    CAST(fecha AS VARCHAR) AS fecha,
    ROUND(AVG(precio_prom), 2) AS averagePrice
FROM sisap_precios_recent_cache
GROUP BY fecha;

DROP TABLE IF EXISTS dashboard_top_products_cache;
CREATE TABLE dashboard_top_products_cache AS
WITH volume_by_product AS (
    SELECT
        producto_key,
        ROUND(SUM(volumen_ton), 2) AS totalVolumeTon
    FROM sisap_volumen_recent_cache
    GROUP BY producto_key
)
SELECT
    p.producto_nombre AS productoNombre,
    ROUND(AVG(p.precio_prom), 2) AS averagePrice,
    ROUND(MIN(p.precio_prom), 2) AS minPrice,
    ROUND(MAX(p.precio_prom), 2) AS maxPrice,
    COUNT(*) AS recordCount,
    COALESCE(v.totalVolumeTon, 0) AS totalVolumeTon
FROM sisap_precios_recent_cache p
LEFT JOIN volume_by_product v
  ON v.producto_key = p.producto_key
GROUP BY p.producto_nombre, v.totalVolumeTon;

DROP TABLE IF EXISTS planner_product_cache;
CREATE TABLE planner_product_cache AS
WITH volume_by_product AS (
    SELECT
        producto_key,
        ROUND(AVG(volumen_ton), 2) AS averageVolumeTon
    FROM sisap_volumen_recent_cache
    GROUP BY producto_key
)
SELECT
    p.producto_key,
    any_value(p.producto_nombre) AS productoNombre,
    ROUND(AVG(p.precio_prom), 2) AS averagePrice,
    arg_max(p.precio_prom, p.fecha) AS latestPrice,
    ROUND(MIN(p.precio_prom), 2) AS minPrice,
    ROUND(MAX(p.precio_prom), 2) AS maxPrice,
    MAX(p.fecha) AS latestDate,
    COUNT(*) AS records,
    v.averageVolumeTon
FROM sisap_precios_recent_cache p
LEFT JOIN volume_by_product v
  ON v.producto_key = p.producto_key
GROUP BY p.producto_key, v.averageVolumeTon;

DROP TABLE IF EXISTS sunat_overview_cache;
CREATE TABLE sunat_overview_cache AS
SELECT
    CAST(MAX(fecha) AS VARCHAR) AS latestDate,
    COUNT(*) AS totalRecords,
    COUNT(DISTINCT producto_key) AS productCount,
    COUNT(DISTINCT destino_codigo) AS destinationCount,
    ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
    ROUND(AVG(precio_fob_usd_por_kg), 4) AS averageUsdPerKg
FROM sunat_exportaciones_core_cache;

DROP TABLE IF EXISTS sunat_top_products_cache;
CREATE TABLE sunat_top_products_cache AS
SELECT
    producto_key AS productoKey,
    producto_nombre AS productoNombre,
    categoria_producto AS categoriaProducto,
    ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
    ROUND(AVG(precio_fob_usd_por_kg), 4) AS averageUsdPerKg,
    COUNT(*) AS operationCount
FROM sunat_exportaciones_core_cache
GROUP BY producto_key, producto_nombre, categoria_producto;

DROP TABLE IF EXISTS sunat_top_destinations_cache;
CREATE TABLE sunat_top_destinations_cache AS
SELECT
    destino_codigo AS destinoCodigo,
    destino_codigo AS destinoNombre,
    ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
    COUNT(*) AS operationCount
FROM sunat_exportaciones_core_cache
GROUP BY destino_codigo;

DROP TABLE IF EXISTS sunat_product_trend_cache;
CREATE TABLE sunat_product_trend_cache AS
SELECT
    producto_key AS productoKey,
    CAST(fecha AS VARCHAR) AS fecha,
    ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
    ROUND(AVG(precio_fob_usd_por_kg), 4) AS averageUsdPerKg,
    COUNT(*) AS operationCount
FROM sunat_exportaciones_core_cache
GROUP BY producto_key, fecha;

ANALYZE;
