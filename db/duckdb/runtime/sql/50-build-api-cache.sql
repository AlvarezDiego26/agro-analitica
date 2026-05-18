INSTALL delta;
LOAD delta;

INSTALL httpfs;
LOAD httpfs;

SET preserve_insertion_order = false;
SET threads = 2;

CREATE OR REPLACE SECRET minio_secret (
    TYPE S3,
    KEY_ID 'oX3JYQssZtFM5rGC0xhK',
    SECRET 'xYsQ0Ty3CIAVmqfn7Uaob123uKN13gxQUviY5mSl',
    ENDPOINT '38.210.246.165:30090',
    URL_STYLE 'path',
    USE_SSL false,
    REGION 'us-east-1'
);

DROP TABLE IF EXISTS dashboard_overview_cache;
CREATE TABLE dashboard_overview_cache AS
WITH latest_price_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/')
    WHERE precio_prom IS NOT NULL
),
latest_volume_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/')
    WHERE volumen_ton IS NOT NULL
),
recent_prices AS (
    SELECT
        p.fecha,
        p.producto_nombre,
        p.procedencia,
        p.precio_prom
    FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/') p
    CROSS JOIN latest_price_date l
    WHERE p.precio_prom IS NOT NULL
      AND p.fecha >= l.latest_date - INTERVAL 30 DAY
),
recent_volume AS (
    SELECT
        v.volumen_ton
    FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/') v
    CROSS JOIN latest_volume_date l
    WHERE v.volumen_ton IS NOT NULL
      AND v.fecha >= l.latest_date - INTERVAL 30 DAY
)
SELECT
    CAST(MAX(fecha) AS VARCHAR) AS latestDate,
    COUNT(*) AS analyzedRows,
    COUNT(DISTINCT producto_nombre) AS productCount,
    COUNT(DISTINCT procedencia) AS originCount,
    ROUND(AVG(precio_prom), 2) AS overallAverage,
    (SELECT ROUND(SUM(volumen_ton), 2) FROM recent_volume) AS totalVolumeTon,
    (SELECT ROUND(AVG(volumen_ton), 2) FROM recent_volume) AS averageVolumeTon
FROM recent_prices;

DROP TABLE IF EXISTS dashboard_trend_cache;
CREATE TABLE dashboard_trend_cache AS
WITH latest_price_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/')
    WHERE precio_prom IS NOT NULL
)
SELECT
    CAST(p.fecha AS VARCHAR) AS fecha,
    ROUND(AVG(p.precio_prom), 2) AS averagePrice
FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/') p
CROSS JOIN latest_price_date l
WHERE p.precio_prom IS NOT NULL
  AND p.fecha >= l.latest_date - INTERVAL 30 DAY
GROUP BY p.fecha;

DROP TABLE IF EXISTS dashboard_top_products_cache;
CREATE TABLE dashboard_top_products_cache AS
WITH latest_price_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/')
    WHERE precio_prom IS NOT NULL
),
latest_volume_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/')
    WHERE volumen_ton IS NOT NULL
),
recent_prices AS (
    SELECT
        p.producto_nombre,
        p.precio_prom
    FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/') p
    CROSS JOIN latest_price_date l
    WHERE p.precio_prom IS NOT NULL
      AND p.fecha >= l.latest_date - INTERVAL 30 DAY
),
recent_volume AS (
    SELECT
        LOWER(v.producto_nombre) AS producto_key,
        ROUND(SUM(v.volumen_ton), 2) AS totalVolumeTon
    FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/') v
    CROSS JOIN latest_volume_date l
    WHERE v.volumen_ton IS NOT NULL
      AND v.fecha >= l.latest_date - INTERVAL 30 DAY
    GROUP BY LOWER(v.producto_nombre)
)
SELECT
    p.producto_nombre AS productoNombre,
    ROUND(AVG(p.precio_prom), 2) AS averagePrice,
    ROUND(MIN(p.precio_prom), 2) AS minPrice,
    ROUND(MAX(p.precio_prom), 2) AS maxPrice,
    COUNT(*) AS recordCount,
    COALESCE(v.totalVolumeTon, 0) AS totalVolumeTon
FROM recent_prices p
LEFT JOIN recent_volume v
  ON v.producto_key = LOWER(p.producto_nombre)
GROUP BY p.producto_nombre, v.totalVolumeTon;

DROP TABLE IF EXISTS planner_product_cache;
CREATE TABLE planner_product_cache AS
WITH latest_price_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/')
    WHERE precio_prom IS NOT NULL
),
latest_volume_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/')
    WHERE volumen_ton IS NOT NULL
),
price_rows AS (
    SELECT
        LOWER(producto_nombre) AS producto_key,
        producto_nombre,
        fecha,
        precio_prom
    FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/') p
    CROSS JOIN latest_price_date l
    WHERE precio_prom IS NOT NULL
      AND fecha >= l.latest_date - INTERVAL 30 DAY
),
volume_rows AS (
    SELECT
        LOWER(producto_nombre) AS producto_key,
        ROUND(AVG(volumen_ton), 2) AS averageVolumeTon
    FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/') v
    CROSS JOIN latest_volume_date l
    WHERE volumen_ton IS NOT NULL
      AND fecha >= l.latest_date - INTERVAL 30 DAY
    GROUP BY LOWER(producto_nombre)
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
FROM price_rows p
LEFT JOIN volume_rows v
  ON v.producto_key = p.producto_key
GROUP BY p.producto_key, v.averageVolumeTon;

DROP TABLE IF EXISTS sunat_overview_cache;
CREATE TABLE sunat_overview_cache AS
SELECT
    CAST(MAX(fecha) AS VARCHAR) AS latestDate,
    COUNT(*) AS totalRecords,
    COUNT(DISTINCT producto_key) AS productCount,
    COUNT(DISTINCT codigo_pais_destino) AS destinationCount,
    ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
    ROUND(AVG(precio_fob_usd_por_kg), 4) AS averageUsdPerKg
FROM delta_scan('s3://agro-productos/Landing/sunat/exportaciones_filtradas/')
WHERE fecha IS NOT NULL;

DROP TABLE IF EXISTS sunat_top_products_cache;
CREATE TABLE sunat_top_products_cache AS
SELECT
    producto_key AS productoKey,
    producto_nombre_catalogo AS productoNombre,
    categoria_producto AS categoriaProducto,
    ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
    ROUND(AVG(precio_fob_usd_por_kg), 4) AS averageUsdPerKg,
    COUNT(*) AS operationCount
FROM delta_scan('s3://agro-productos/Landing/sunat/exportaciones_filtradas/')
WHERE fecha IS NOT NULL
  AND producto_key IS NOT NULL
GROUP BY producto_key, producto_nombre_catalogo, categoria_producto;

DROP TABLE IF EXISTS sunat_top_destinations_cache;
CREATE TABLE sunat_top_destinations_cache AS
SELECT
    codigo_pais_destino AS destinoCodigo,
    codigo_pais_destino AS destinoNombre,
    ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
    COUNT(*) AS operationCount
FROM delta_scan('s3://agro-productos/Landing/sunat/exportaciones_filtradas/')
WHERE fecha IS NOT NULL
  AND codigo_pais_destino IS NOT NULL
GROUP BY codigo_pais_destino;

DROP TABLE IF EXISTS sunat_product_trend_cache;
CREATE TABLE sunat_product_trend_cache AS
SELECT
    LOWER(producto_key) AS productoKey,
    CAST(fecha AS VARCHAR) AS fecha,
    ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
    ROUND(AVG(precio_fob_usd_por_kg), 4) AS averageUsdPerKg,
    COUNT(*) AS operationCount
FROM delta_scan('s3://agro-productos/Landing/sunat/exportaciones_filtradas/')
WHERE fecha IS NOT NULL
  AND producto_key IS NOT NULL
GROUP BY LOWER(producto_key), fecha;
