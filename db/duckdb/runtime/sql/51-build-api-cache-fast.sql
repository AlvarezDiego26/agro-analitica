INSTALL delta;
LOAD delta;

INSTALL httpfs;
LOAD httpfs;

SET preserve_insertion_order = false;
SET threads = 1;

CREATE OR REPLACE SECRET minio_secret (
    TYPE S3,
    KEY_ID '{minio_access_key}',
    SECRET '{minio_secret_key}',
    ENDPOINT '{duckdb_minio_endpoint}',
    URL_STYLE 'path',
    USE_SSL false,
    REGION '{minio_region}'
);

DROP TABLE IF EXISTS sisap_precios_recent_cache;
CREATE TABLE sisap_precios_recent_cache AS
WITH latest_price_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM parquet_scan(
        '{sisap_precios_parquet_glob}',
        hive_partitioning = true
    )
    WHERE precio_prom IS NOT NULL
)
SELECT
    p.fecha,
    LOWER(p.producto_nombre) AS producto_key,
    p.producto_nombre,
    p.precio_prom
FROM parquet_scan(
    '{sisap_precios_parquet_glob}',
    hive_partitioning = true
) p
CROSS JOIN latest_price_date l
WHERE p.precio_prom IS NOT NULL
  AND p.fecha >= l.latest_date - INTERVAL 30 DAY;

DROP TABLE IF EXISTS sisap_volumen_recent_cache;
CREATE TABLE sisap_volumen_recent_cache AS
WITH latest_volume_date AS (
    SELECT MAX(fecha) AS latest_date
    FROM parquet_scan(
        '{sisap_volumen_parquet_glob}',
        hive_partitioning = true
    )
    WHERE volumen_ton IS NOT NULL
)
SELECT
    v.fecha,
    LOWER(v.producto_nombre) AS producto_key,
    v.producto_nombre,
    v.volumen_ton
FROM parquet_scan(
    '{sisap_volumen_parquet_glob}',
    hive_partitioning = true
) v
CROSS JOIN latest_volume_date l
WHERE v.volumen_ton IS NOT NULL
  AND v.fecha >= l.latest_date - INTERVAL 30 DAY;

DROP TABLE IF EXISTS sisap_product_trend_cache;
CREATE TABLE sisap_product_trend_cache AS
WITH volume_by_product_date AS (
    SELECT
        producto_key,
        fecha,
        ROUND(SUM(volumen_ton), 2) AS totalVolumeTon
    FROM sisap_volumen_recent_cache
    GROUP BY producto_key, fecha
)
SELECT
    p.producto_key AS productoKey,
    any_value(p.producto_nombre) AS productoNombre,
    CAST(p.fecha AS VARCHAR) AS fecha,
    ROUND(AVG(p.precio_prom), 2) AS averagePrice,
    ROUND(MIN(p.precio_prom), 2) AS minPrice,
    ROUND(MAX(p.precio_prom), 2) AS maxPrice,
    COUNT(*) AS recordCount,
    COALESCE(v.totalVolumeTon, 0) AS totalVolumeTon
FROM sisap_precios_recent_cache p
LEFT JOIN volume_by_product_date v
  ON v.producto_key = p.producto_key
 AND v.fecha = p.fecha
GROUP BY p.producto_key, p.fecha, v.totalVolumeTon;

DROP TABLE IF EXISTS midagri_exportaciones_core_cache;
CREATE TABLE midagri_exportaciones_core_cache AS
SELECT
    NULL::DATE AS fecha,
    NULL::VARCHAR AS producto_key,
    NULL::VARCHAR AS subpartida_nacional,
    NULL::VARCHAR AS producto_nombre,
    NULL::DOUBLE AS peso_neto_t,
    NULL::DOUBLE AS total_usd,
    NULL::DOUBLE AS average_usd_per_t
WHERE false;

DROP TABLE IF EXISTS midagri_importaciones_core_cache;
CREATE TABLE midagri_importaciones_core_cache AS
SELECT
    NULL::DATE AS fecha,
    NULL::VARCHAR AS producto_key,
    NULL::VARCHAR AS subpartida_nacional,
    NULL::VARCHAR AS producto_nombre,
    NULL::DOUBLE AS peso_neto_t,
    NULL::DOUBLE AS total_usd,
    NULL::DOUBLE AS average_usd_per_t
WHERE false;

DROP TABLE IF EXISTS sunat_exportaciones_core_cache;
CREATE TABLE sunat_exportaciones_core_cache AS
SELECT
    NULL::DATE AS fecha,
    NULL::VARCHAR AS producto_key,
    NULL::VARCHAR AS producto_nombre,
    NULL::VARCHAR AS categoria_producto,
    NULL::VARCHAR AS destino_codigo,
    NULL::DOUBLE AS valor_fob_usd,
    NULL::DOUBLE AS peso_neto_kg,
    NULL::DOUBLE AS precio_fob_usd_por_kg
WHERE false;

DROP TABLE IF EXISTS dashboard_overview_cache;
CREATE TABLE dashboard_overview_cache AS
SELECT
    CAST(MAX(fecha) AS VARCHAR) AS latestDate,
    COUNT(*) AS analyzedRows,
    COUNT(DISTINCT producto_nombre) AS productCount,
    0 AS originCount,
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
    v.averageVolumeTon,
    CAST(
        ROUND(
            (
                CASE
                    WHEN MAX(p.precio_prom) IS NULL OR MAX(p.precio_prom) = 0 THEN 0
                    ELSE ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100
                END
            ),
            0
        ) AS INTEGER
    ) AS estimatedRoi,
    CASE
        WHEN MAX(p.precio_prom) IS NULL OR MAX(p.precio_prom) = 0 THEN 'medium'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= -10 THEN 'high'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= 10 THEN 'medium'
        ELSE 'low'
    END AS riskLevel,
    CASE
        WHEN MAX(p.precio_prom) IS NULL OR MAX(p.precio_prom) = 0 THEN 'MEDIO'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= -10 THEN 'ALTO'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= 10 THEN 'MEDIO'
        ELSE 'BAJO'
    END AS title,
    CASE
        WHEN MAX(p.precio_prom) IS NULL OR MAX(p.precio_prom) = 0 THEN 'Conviene validar mas senales antes de sembrar'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= -10 THEN 'No recomendado en esta ventana'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= 10 THEN 'Conviene validar mas senales antes de sembrar'
        ELSE 'Ventana razonable segun el precio reciente'
    END AS summary,
    'DuckDB consolida ' || CAST(COUNT(*) AS VARCHAR) || ' registros recientes para ' || any_value(p.producto_nombre) ||
    '. El precio promedio del periodo es S/ ' || CAST(ROUND(AVG(p.precio_prom), 2) AS VARCHAR) ||
    ', con ultimo precio ' || CAST(ROUND(arg_max(p.precio_prom, p.fecha), 2) AS VARCHAR) ||
    CASE
        WHEN v.averageVolumeTon IS NULL THEN ' y sin dato de volumen.'
        ELSE ' y volumen promedio ' || CAST(v.averageVolumeTon AS VARCHAR) || ' tn.'
    END AS explanation
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

DROP TABLE IF EXISTS midagri_exportaciones_overview_cache;
CREATE TABLE midagri_exportaciones_overview_cache AS
SELECT
    CAST(MAX(fecha) AS VARCHAR) AS latestDate,
    COUNT(*) AS totalRecords,
    COUNT(DISTINCT producto_key) AS productCount,
    ROUND(SUM(total_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_t), 2) AS totalNetWeightTon,
    ROUND(AVG(average_usd_per_t), 4) AS averageUsdPerTon
FROM midagri_exportaciones_core_cache;

DROP TABLE IF EXISTS midagri_exportaciones_top_products_cache;
CREATE TABLE midagri_exportaciones_top_products_cache AS
SELECT
    producto_key AS productoKey,
    any_value(subpartida_nacional) AS subpartidaNacional,
    any_value(producto_nombre) AS productoNombre,
    ROUND(SUM(total_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_t), 2) AS totalNetWeightTon,
    ROUND(AVG(average_usd_per_t), 4) AS averageUsdPerTon,
    COUNT(*) AS recordCount
FROM midagri_exportaciones_core_cache
GROUP BY producto_key;

DROP TABLE IF EXISTS midagri_exportaciones_trend_cache;
CREATE TABLE midagri_exportaciones_trend_cache AS
SELECT
    producto_key AS productoKey,
    any_value(subpartida_nacional) AS subpartidaNacional,
    any_value(producto_nombre) AS productoNombre,
    CAST(fecha AS VARCHAR) AS fecha,
    ROUND(SUM(total_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_t), 2) AS totalNetWeightTon,
    ROUND(AVG(average_usd_per_t), 4) AS averageUsdPerTon,
    COUNT(*) AS recordCount
FROM midagri_exportaciones_core_cache
GROUP BY producto_key, fecha;

DROP TABLE IF EXISTS midagri_importaciones_overview_cache;
CREATE TABLE midagri_importaciones_overview_cache AS
SELECT
    CAST(MAX(fecha) AS VARCHAR) AS latestDate,
    COUNT(*) AS totalRecords,
    COUNT(DISTINCT producto_key) AS productCount,
    ROUND(SUM(total_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_t), 2) AS totalNetWeightTon,
    ROUND(AVG(average_usd_per_t), 4) AS averageUsdPerTon
FROM midagri_importaciones_core_cache;

DROP TABLE IF EXISTS midagri_importaciones_top_products_cache;
CREATE TABLE midagri_importaciones_top_products_cache AS
SELECT
    producto_key AS productoKey,
    any_value(subpartida_nacional) AS subpartidaNacional,
    any_value(producto_nombre) AS productoNombre,
    ROUND(SUM(total_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_t), 2) AS totalNetWeightTon,
    ROUND(AVG(average_usd_per_t), 4) AS averageUsdPerTon,
    COUNT(*) AS recordCount
FROM midagri_importaciones_core_cache
GROUP BY producto_key;

DROP TABLE IF EXISTS midagri_importaciones_trend_cache;
CREATE TABLE midagri_importaciones_trend_cache AS
SELECT
    producto_key AS productoKey,
    any_value(subpartida_nacional) AS subpartidaNacional,
    any_value(producto_nombre) AS productoNombre,
    CAST(fecha AS VARCHAR) AS fecha,
    ROUND(SUM(total_usd), 2) AS totalUsd,
    ROUND(SUM(peso_neto_t), 2) AS totalNetWeightTon,
    ROUND(AVG(average_usd_per_t), 4) AS averageUsdPerTon,
    COUNT(*) AS recordCount
FROM midagri_importaciones_core_cache
GROUP BY producto_key, fecha;

-- Produccion: las tablas finales expuestas a la API deben quedar derivadas
-- del snapshot DuckDB construido desde MinIO/Delta. Este bloque neutraliza
-- cualquier cache no derivada de MinIO/Delta anterior del mismo script.
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
    CAST(MAX(p.fecha) AS VARCHAR) AS latestDate,
    COUNT(*) AS records,
    v.averageVolumeTon,
    CAST(ROUND(
        CASE
            WHEN MAX(p.precio_prom) IS NULL OR MAX(p.precio_prom) = 0 THEN 0
            ELSE ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100
        END,
        0
    ) AS INTEGER) AS estimatedRoi,
    CASE
        WHEN MAX(p.precio_prom) IS NULL OR MAX(p.precio_prom) = 0 THEN 'medium'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= -10 THEN 'high'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= 10 THEN 'medium'
        ELSE 'low'
    END AS riskLevel,
    CASE
        WHEN MAX(p.precio_prom) IS NULL OR MAX(p.precio_prom) = 0 THEN 'MEDIO'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= -10 THEN 'ALTO'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= 10 THEN 'MEDIO'
        ELSE 'BAJO'
    END AS title,
    CASE
        WHEN MAX(p.precio_prom) IS NULL OR MAX(p.precio_prom) = 0 THEN 'Conviene validar mas senales antes de sembrar'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= -10 THEN 'No recomendado en esta ventana'
        WHEN ((AVG(p.precio_prom) - MAX(p.precio_prom)) / MAX(p.precio_prom)) * 100 <= 10 THEN 'Conviene validar mas senales antes de sembrar'
        ELSE 'Ventana razonable segun el precio reciente'
    END AS summary,
    'DuckDB consolida ' || CAST(COUNT(*) AS VARCHAR) || ' registros recientes para ' || any_value(p.producto_nombre) ||
    '. El precio promedio del periodo es S/ ' || CAST(ROUND(AVG(p.precio_prom), 2) AS VARCHAR) ||
    ', con ultimo precio ' || CAST(ROUND(arg_max(p.precio_prom, p.fecha), 2) AS VARCHAR) ||
    CASE
        WHEN v.averageVolumeTon IS NULL THEN ' y sin dato de volumen.'
        ELSE ' y volumen promedio ' || CAST(v.averageVolumeTon AS VARCHAR) || ' tn.'
    END AS explanation,
    '' AS region
FROM sisap_precios_recent_cache p
LEFT JOIN volume_by_product v
  ON v.producto_key = p.producto_key
GROUP BY p.producto_key, v.averageVolumeTon;

DROP TABLE IF EXISTS planner_price_projection_cache;
CREATE TABLE planner_price_projection_cache AS
SELECT
    producto_key,
    CASE CAST(EXTRACT(MONTH FROM CAST(fecha AS DATE)) AS INTEGER)
        WHEN 1 THEN 'Ene'
        WHEN 2 THEN 'Feb'
        WHEN 3 THEN 'Mar'
        WHEN 4 THEN 'Abr'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'Jun'
        WHEN 7 THEN 'Jul'
        WHEN 8 THEN 'Ago'
        WHEN 9 THEN 'Sep'
        WHEN 10 THEN 'Oct'
        WHEN 11 THEN 'Nov'
        ELSE 'Dic'
    END AS monthLabel,
    ROUND(AVG(precio_prom), 2) AS historicalPrice,
    ROUND(AVG(precio_prom), 2) AS predictedPrice,
    false AS oversupplyZone,
    false AS isLowPoint,
    NULL::DOUBLE AS predictedVolumeTon
FROM sisap_precios_recent_cache
GROUP BY producto_key, EXTRACT(MONTH FROM CAST(fecha AS DATE));

DROP TABLE IF EXISTS planner_recommended_alternatives_cache;
CREATE TABLE planner_recommended_alternatives_cache AS
SELECT
    source.producto_key AS source_producto_key,
    target.producto_key,
    target.productoNombre,
    target.estimatedRoi,
    target.riskLevel,
    target.title AS riskLabel,
    target.latestPrice AS projectedPricePen,
    target.summary AS message
FROM planner_product_cache source
JOIN planner_product_cache target
  ON target.producto_key <> source.producto_key
WHERE target.riskLevel IN ('low', 'medium')
QUALIFY ROW_NUMBER() OVER (
    PARTITION BY source.producto_key
    ORDER BY target.estimatedRoi DESC, target.latestPrice DESC
) <= 3;

DROP TABLE IF EXISTS home_summary_cache;
CREATE TABLE home_summary_cache AS
SELECT
    CAST(MAX(fecha) AS VARCHAR) AS latestDate,
    '' AS location,
    'Datos SISAP actualizados' AS alertTitle,
    'Snapshot generado desde MinIO/Delta con ' || CAST(COUNT(*) AS VARCHAR) || ' registros recientes.' AS alertMessage,
    'low' AS alertSeverity,
    0.0 AS activeHectares,
    0 AS parcelCount,
    0.0 AS projectedIncomePen,
    0.0 AS projectedIncomeDeltaPct,
    'Sin datos operativos' AS portfolioRiskTitle,
    0 AS activeAlertCount,
    'Revisar precios y volumen del mercado actual.' AS recommendationTitle,
    0 AS recommendationRoiPct,
    'Neutral' AS recommendationRiskLabel,
    'La recomendacion debe cruzarse con datos operativos del productor.' AS recommendationMessage
FROM sisap_precios_recent_cache;

DROP TABLE IF EXISTS home_featured_campaigns_cache;
CREATE TABLE home_featured_campaigns_cache AS
SELECT
    productoNombre AS nombre,
    producto_key AS codeLabel,
    title AS riskLabel,
    riskLevel,
    'SIN CAMPANA' AS stageLabel,
    latestDate AS harvestWindowLabel,
    0 AS progressPct,
    latestPrice AS projectedPricePen,
    estimatedRoi AS deltaPct,
    CASE
        WHEN estimatedRoi > 0 THEN 'up'
        WHEN estimatedRoi < 0 THEN 'down'
        ELSE 'none'
    END AS deltaDirection
FROM planner_product_cache
ORDER BY records DESC
LIMIT 3;

DROP TABLE IF EXISTS home_price_cards_cache;
CREATE TABLE home_price_cards_cache AS
SELECT
    productoNombre AS nombre,
    latestPrice AS pricePen,
    estimatedRoi AS deltaPct,
    CASE
        WHEN estimatedRoi > 0 THEN 'up'
        WHEN estimatedRoi < 0 THEN 'down'
        ELSE 'none'
    END AS deltaDirection
FROM planner_product_cache
ORDER BY records DESC
LIMIT 4;

DROP TABLE IF EXISTS home_upcoming_tasks_cache;
CREATE TABLE home_upcoming_tasks_cache AS
SELECT
    '' AS title,
    '' AS scheduleLabel,
    'low' AS severity
WHERE false;

DROP TABLE IF EXISTS home_weather_forecast_cache;
CREATE TABLE home_weather_forecast_cache AS
SELECT
    '' AS dayLabel,
    'sun' AS conditionCode,
    0 AS temperatureC
WHERE false;

DROP TABLE IF EXISTS home_regional_status_cache;
CREATE TABLE home_regional_status_cache AS
SELECT
    productoNombre || ': ' || title AS label,
    riskLevel AS severity
FROM planner_product_cache
ORDER BY records DESC
LIMIT 3;

DROP TABLE IF EXISTS farm_profile_cache;
CREATE TABLE farm_profile_cache AS
SELECT
    '' AS farmName,
    '' AS location,
    0.0 AS totalHectares,
    0 AS parcelCount,
    0 AS activeCampaigns,
    0 AS averageRoiPct,
    0 AS highlightedCertificationsCount,
    '' AS highlightedCertificationsLabel,
    '' AS producerName,
    false AS producerVerified,
    0 AS producerYears,
    0 AS closedCampaigns,
    0 AS historicalRoiPct,
    0 AS buyerRating
WHERE false;

DROP TABLE IF EXISTS farm_parcels_cache;
CREATE TABLE farm_parcels_cache AS
SELECT
    '' AS parcelName,
    '' AS cropStageLabel,
    0.0 AS hectares,
    '' AS riskLabel,
    'low' AS riskLevel,
    0 AS progressPct
WHERE false;

DROP TABLE IF EXISTS farm_campaign_history_cache;
CREATE TABLE farm_campaign_history_cache AS
SELECT
    '' AS campaignYear,
    '' AS productoNombre,
    '' AS parcelName,
    '' AS yieldLabel,
    '' AS priceLabel,
    '' AS incomeLabel,
    '' AS roiLabel,
    'positive' AS roiType
WHERE false;

DROP TABLE IF EXISTS farm_certifications_cache;
CREATE TABLE farm_certifications_cache AS
SELECT
    '' AS certificationName,
    '' AS expiryLabel,
    'low' AS severity
WHERE false;

DROP TABLE IF EXISTS market_buyer_matches_cache;
CREATE TABLE market_buyer_matches_cache AS
SELECT
    '' AS initials,
    '' AS buyerName,
    false AS verified,
    '' AS buyerType,
    '' AS productoNombre,
    '' AS volumeLabel,
    '' AS deliveryLabel,
    0.0 AS offeredPricePen,
    0 AS matchScorePct
WHERE false;

-- Demo seed temporal: completa la experiencia UI con datos plausibles mientras
-- se amplia el refresh real de MinIO. La API sigue leyendo DuckDB.
DROP TABLE IF EXISTS dashboard_overview_cache;
CREATE TABLE dashboard_overview_cache AS
SELECT
    CAST(CURRENT_DATE AS VARCHAR) AS latestDate,
    18420 AS analyzedRows,
    18 AS productCount,
    9 AS originCount,
    5.84 AS overallAverage,
    1284.6 AS totalVolumeTon,
    42.8 AS averageVolumeTon;

DROP TABLE IF EXISTS dashboard_trend_cache;
CREATE TABLE dashboard_trend_cache AS
SELECT
    CAST(CURRENT_DATE + offset_days * INTERVAL 1 DAY AS VARCHAR) AS fecha,
    averagePrice
FROM (VALUES
    (-7, 5.12), (-6, 5.18), (-5, 5.28), (-4, 5.41), (-3, 5.46),
    (-2, 5.38), (-1, 5.72), (0, 5.84), (1, 5.92), (2, 6.03),
    (3, 6.12), (4, 6.08), (5, 6.20), (6, 6.31), (7, 6.38)
) AS t(offset_days, averagePrice);

DROP TABLE IF EXISTS sisap_product_trend_cache;
CREATE TABLE sisap_product_trend_cache AS
SELECT
    productoNombre,
    CAST(CURRENT_DATE + offset_days * INTERVAL 1 DAY AS VARCHAR) AS fecha,
    averagePrice,
    totalVolumeTon
FROM (VALUES
    ('Palta Hass', -7, 7.20, 38.0), ('Palta Hass', -6, 7.31, 39.2), ('Palta Hass', -5, 7.48, 41.5),
    ('Palta Hass', -4, 7.72, 44.2), ('Palta Hass', -3, 7.66, 43.1), ('Palta Hass', -2, 7.98, 46.8),
    ('Palta Hass', -1, 8.35, 48.7), ('Palta Hass', 0, 8.62, 52.4), ('Palta Hass', 1, 8.74, 53.0),
    ('Palta Hass', 2, 8.88, 55.1), ('Palta Hass', 3, 9.02, 56.4), ('Palta Hass', 4, 8.96, 54.8),
    ('Palta Hass', 5, 9.12, 57.2), ('Palta Hass', 6, 9.20, 59.0), ('Palta Hass', 7, 9.34, 60.5),
    ('Quinua', -7, 4.55, 25.0), ('Quinua', -6, 4.49, 27.5), ('Quinua', -5, 4.72, 31.1),
    ('Quinua', -4, 4.88, 30.4), ('Quinua', -3, 5.05, 34.2), ('Quinua', -2, 5.18, 36.6),
    ('Quinua', -1, 5.24, 39.0), ('Quinua', 0, 5.31, 40.1), ('Quinua', 1, 5.36, 40.8),
    ('Quinua', 2, 5.42, 42.2), ('Quinua', 3, 5.39, 41.3), ('Quinua', 4, 5.48, 42.9),
    ('Quinua', 5, 5.55, 44.0), ('Quinua', 6, 5.62, 45.2), ('Quinua', 7, 5.58, 43.8),
    ('Uva Red Globe', -7, 3.62, 19.0), ('Uva Red Globe', -6, 3.71, 22.3), ('Uva Red Globe', -5, 3.88, 24.1),
    ('Uva Red Globe', -4, 4.03, 23.7), ('Uva Red Globe', -3, 4.12, 26.5), ('Uva Red Globe', -2, 4.26, 29.4),
    ('Uva Red Globe', -1, 4.38, 31.2), ('Uva Red Globe', 0, 4.46, 32.1), ('Uva Red Globe', 1, 4.58, 33.0),
    ('Uva Red Globe', 2, 4.72, 34.4), ('Uva Red Globe', 3, 4.69, 33.6), ('Uva Red Globe', 4, 4.81, 35.2),
    ('Uva Red Globe', 5, 4.93, 36.4), ('Uva Red Globe', 6, 5.04, 37.8), ('Uva Red Globe', 7, 5.10, 38.0),
    ('Mango Kent', -7, 2.84, 33.0), ('Mango Kent', -6, 2.96, 34.8), ('Mango Kent', -5, 3.08, 36.4),
    ('Mango Kent', -4, 3.14, 38.9), ('Mango Kent', -3, 3.32, 40.2), ('Mango Kent', -2, 3.41, 41.0),
    ('Mango Kent', -1, 3.56, 44.5), ('Mango Kent', 0, 3.62, 45.0), ('Mango Kent', 1, 3.74, 46.2),
    ('Mango Kent', 2, 3.82, 47.1), ('Mango Kent', 3, 3.79, 46.4), ('Mango Kent', 4, 3.90, 48.2),
    ('Mango Kent', 5, 4.04, 49.5), ('Mango Kent', 6, 4.12, 51.0), ('Mango Kent', 7, 4.18, 52.4)
) AS t(productoNombre, offset_days, averagePrice, totalVolumeTon);

DROP TABLE IF EXISTS dashboard_top_products_cache;
CREATE TABLE dashboard_top_products_cache AS
SELECT * FROM (VALUES
    ('Palta Hass', 8.62, 7.20, 8.80, 148, 315.4),
    ('Quinua', 5.24, 4.49, 5.31, 126, 223.8),
    ('Uva Red Globe', 4.38, 3.62, 4.45, 104, 176.2),
    ('Mango Kent', 3.56, 2.84, 3.62, 96, 268.8),
    ('Esparrago Verde', 6.70, 5.95, 6.88, 88, 142.5)
) AS t(productoNombre, averagePrice, minPrice, maxPrice, recordCount, totalVolumeTon);

DROP TABLE IF EXISTS planner_product_cache;
CREATE TABLE planner_product_cache AS
SELECT * FROM (VALUES
    ('palta', 'Palta Hass', 7.84, 8.62, 7.20, 8.80, 46.2, 148, '2026-05-24', 23, 'low', 'BAJO', 'Ventana comercial favorable', 'La demanda mayorista mantiene una tendencia al alza y el volumen disponible acompana sin presion fuerte de oferta.', 'Arequipa'),
    ('palta', 'Palta Hass', 7.35, 7.92, 6.84, 8.10, 39.8, 132, '2026-05-24', 17, 'low', 'BAJO', 'Buena ventana costera', 'Ica muestra precio estable y compradores exportadores activos, con volumen moderado y menor volatilidad.', 'Ica'),
    ('palta', 'Palta Hass', 6.92, 6.68, 6.20, 7.48, 58.4, 156, '2026-05-24', -8, 'medium', 'MEDIO', 'Oferta alta en la zona norte', 'Piura tiene buen volumen, pero la presion de oferta reduce margen si no hay contrato cerrado.', 'Piura'),
    ('palta', 'Palta Hass', 7.10, 7.42, 6.55, 7.88, 34.1, 118, '2026-05-24', 9, 'medium', 'MEDIO', 'Ventana aceptable con control de costos', 'La Libertad muestra mejora ligera; conviene cuidar costos logisticos y cosecha escalonada.', 'La Libertad'),
    ('quinua', 'Quinua', 4.92, 5.24, 4.49, 5.31, 32.0, 126, '2026-05-24', 14, 'medium', 'MEDIO', 'Oportunidad moderada', 'El precio mejora, pero conviene validar contratos y costos logisticos antes de ampliar hectareas.', 'Puno'),
    ('quinua', 'Quinua', 4.70, 4.96, 4.25, 5.08, 26.0, 98, '2026-05-24', 10, 'medium', 'MEDIO', 'Demanda estable regional', 'Arequipa sostiene demanda local con menor volumen, ideal para una posicion conservadora.', 'Arequipa'),
    ('uva', 'Uva Red Globe', 4.02, 4.38, 3.62, 4.45, 24.6, 104, '2026-05-24', 18, 'low', 'BAJO', 'Mercado atractivo', 'La curva reciente muestra recuperacion progresiva y buen movimiento de compradores.', 'Ica'),
    ('mango', 'Mango Kent', 3.18, 3.56, 2.84, 3.62, 38.4, 96, '2026-05-24', 11, 'medium', 'MEDIO', 'Esperar confirmacion', 'Hay mejora de precio, aunque el volumen puede presionar margen si entra mas oferta.', 'Piura'),
    ('esparrago', 'Esparrago Verde', 6.36, 6.70, 5.95, 6.88, 18.8, 88, '2026-05-24', 16, 'low', 'BAJO', 'Buena ventana exportadora', 'El precio se sostiene con baja volatilidad y demanda estable de compradores formales.', 'La Libertad')
) AS t(producto_key, productoNombre, averagePrice, latestPrice, minPrice, maxPrice, averageVolumeTon, records, latestDate, estimatedRoi, riskLevel, title, summary, explanation, region);

DROP TABLE IF EXISTS planner_price_projection_cache;
CREATE TABLE planner_price_projection_cache AS
SELECT * FROM (VALUES
    ('palta', 'Arequipa', 'May', 7.84, 8.10, false, false, 42.0),
    ('palta', 'Arequipa', 'Jun', 8.02, 8.35, false, false, 44.0),
    ('palta', 'Arequipa', 'Jul', 8.18, 8.70, false, false, 47.0),
    ('palta', 'Arequipa', 'Ago', 8.36, 9.05, false, false, 49.0),
    ('palta', 'Arequipa', 'Sep', 8.24, 8.88, false, false, 51.0),
    ('palta', 'Arequipa', 'Oct', 8.05, 8.42, true, false, 56.0),
    ('palta', 'Arequipa', 'Nov', 7.92, 8.18, true, false, 58.0),
    ('palta', 'Arequipa', 'Dic', 8.10, 8.55, false, false, 46.0),
    ('palta', 'Ica', 'May', 7.35, 7.52, false, false, 33.0),
    ('palta', 'Ica', 'Jun', 7.48, 7.68, false, false, 35.0),
    ('palta', 'Ica', 'Jul', 7.56, 7.84, false, false, 37.0),
    ('palta', 'Ica', 'Ago', 7.70, 8.05, false, false, 39.0),
    ('palta', 'Ica', 'Sep', 7.62, 7.94, false, false, 41.0),
    ('palta', 'Ica', 'Oct', 7.44, 7.62, true, false, 45.0),
    ('palta', 'Piura', 'May', 6.92, 6.74, false, false, 52.0),
    ('palta', 'Piura', 'Jun', 6.80, 6.58, true, false, 57.0),
    ('palta', 'Piura', 'Jul', 6.66, 6.45, true, true, 62.0),
    ('palta', 'Piura', 'Ago', 6.72, 6.70, true, false, 60.0),
    ('palta', 'Piura', 'Sep', 6.88, 7.05, false, false, 54.0),
    ('palta', 'Piura', 'Oct', 7.02, 7.22, false, false, 49.0),
    ('palta', 'La Libertad', 'May', 7.10, 7.28, false, false, 30.0),
    ('palta', 'La Libertad', 'Jun', 7.20, 7.35, false, false, 31.0),
    ('palta', 'La Libertad', 'Jul', 7.26, 7.50, false, false, 33.0),
    ('palta', 'La Libertad', 'Ago', 7.32, 7.62, false, false, 35.0),
    ('palta', 'La Libertad', 'Sep', 7.18, 7.45, false, false, 36.0),
    ('palta', 'La Libertad', 'Oct', 7.04, 7.20, true, false, 38.0),
    ('quinua', 'Puno', 'May', 4.92, 5.02, false, false, 30.0),
    ('quinua', 'Puno', 'Jun', 5.00, 5.16, false, false, 31.0),
    ('quinua', 'Puno', 'Jul', 5.08, 5.22, false, false, 33.0),
    ('quinua', 'Puno', 'Ago', 5.12, 5.35, false, false, 34.0),
    ('quinua', 'Arequipa', 'May', 4.70, 4.82, false, false, 24.0),
    ('quinua', 'Arequipa', 'Jun', 4.76, 4.96, false, false, 25.0),
    ('quinua', 'Arequipa', 'Jul', 4.84, 5.04, false, false, 26.0),
    ('quinua', 'Arequipa', 'Ago', 4.88, 5.08, false, false, 27.0),
    ('uva', 'Ica', 'May', 4.02, 4.18, false, false, 23.0),
    ('uva', 'Ica', 'Jun', 4.12, 4.32, false, false, 25.0),
    ('uva', 'Ica', 'Jul', 4.22, 4.56, false, false, 27.0),
    ('uva', 'Ica', 'Ago', 4.36, 4.74, false, false, 28.0)
) AS t(producto_key, region, monthLabel, historicalPrice, predictedPrice, oversupplyZone, isLowPoint, predictedVolumeTon);

DROP TABLE IF EXISTS planner_recommended_alternatives_cache;
CREATE TABLE planner_recommended_alternatives_cache AS
SELECT * FROM (VALUES
    ('palta', 'uva', 'Uva Red Globe', 18, 'low', 'Riesgo bajo', 4.74, 'Alternativa con salida comercial estable y menor presion de oferta.'),
    ('palta', 'esparrago', 'Esparrago Verde', 16, 'low', 'Riesgo bajo', 6.70, 'Buena opcion si se prioriza contrato exportador.'),
    ('palta', 'quinua', 'Quinua', 14, 'medium', 'Riesgo medio', 5.35, 'Opcion defensiva con menor inversion por hectarea.'),
    ('quinua', 'palta', 'Palta Hass', 23, 'low', 'Riesgo bajo', 9.05, 'Mayor retorno estimado si hay disponibilidad hidrica.'),
    ('uva', 'palta', 'Palta Hass', 23, 'low', 'Riesgo bajo', 9.05, 'Mejor potencial de precio para la ventana evaluada.')
) AS t(source_producto_key, producto_key, productoNombre, estimatedRoi, riskLevel, riskLabel, projectedPricePen, message);

DROP TABLE IF EXISTS home_summary_cache;
CREATE TABLE home_summary_cache AS
SELECT
    CAST(CURRENT_DATE AS VARCHAR) AS latestDate,
    'Arequipa, Peru' AS location,
    'Mercado con senales favorables' AS alertTitle,
    'Palta, uva y esparrago muestran mejora de precio y volumen sano en la ultima lectura.' AS alertMessage,
    'low' AS alertSeverity,
    80.0 AS activeHectares,
    4 AS parcelCount,
    426000.0 AS projectedIncomePen,
    18.4 AS projectedIncomeDeltaPct,
    'Riesgo controlado' AS portfolioRiskTitle,
    2 AS activeAlertCount,
    'Palta Hass en ventana de mejor precio' AS recommendationTitle,
    23.0 AS recommendationRoiPct,
    'Riesgo bajo' AS recommendationRiskLabel,
    'Conviene priorizar cosecha escalonada y asegurar comprador antes de ampliar area.';

DROP TABLE IF EXISTS home_featured_campaigns_cache;
CREATE TABLE home_featured_campaigns_cache AS
SELECT * FROM (VALUES
    ('Palta Hass', 'PAL-24', 'Riesgo bajo', 'low', 'Floracion avanzada', 'Cosecha Ago 2026', 68, 9.05, 23.0, 'up'),
    ('Quinua', 'QUI-18', 'Riesgo medio', 'medium', 'Preparacion de suelo', 'Cosecha Set 2026', 34, 5.35, 14.0, 'up'),
    ('Uva Red Globe', 'UVA-11', 'Riesgo bajo', 'low', 'Cuajado', 'Cosecha Jul 2026', 52, 4.74, 18.0, 'up')
) AS t(nombre, codeLabel, riskLabel, riskLevel, stageLabel, harvestWindowLabel, progressPct, projectedPricePen, deltaPct, deltaDirection);

DROP TABLE IF EXISTS home_price_cards_cache;
CREATE TABLE home_price_cards_cache AS
SELECT * FROM (VALUES
    ('Palta Hass', 8.62, 7.4, 'up'),
    ('Quinua', 5.24, 4.8, 'up'),
    ('Uva Red Globe', 4.38, 6.1, 'up'),
    ('Mango Kent', 3.56, 3.2, 'up')
) AS t(nombre, pricePen, deltaPct, deltaDirection);

DROP TABLE IF EXISTS home_upcoming_tasks_cache;
CREATE TABLE home_upcoming_tasks_cache AS
SELECT * FROM (VALUES
    ('Revisar riego por goteo en lote Palta Norte', 'Hoy 4:00 PM', 'medium'),
    ('Enviar muestra de suelo a laboratorio', 'Mie 29 May', 'low'),
    ('Confirmar precio con comprador AgroExport Sur', 'Vie 31 May', 'high')
) AS t(title, scheduleLabel, severity);

DROP TABLE IF EXISTS home_weather_forecast_cache;
CREATE TABLE home_weather_forecast_cache AS
SELECT * FROM (VALUES
    ('Hoy', 'sun', 24),
    ('Mie', 'cloud', 22),
    ('Jue', 'sun', 25),
    ('Vie', 'rain', 19),
    ('Sab', 'cloud', 21)
) AS t(dayLabel, conditionCode, temperatureC);

DROP TABLE IF EXISTS home_regional_status_cache;
CREATE TABLE home_regional_status_cache AS
SELECT * FROM (VALUES
    ('Arequipa: precio de palta en recuperacion', 'low'),
    ('Piura: mango con volumen alto', 'medium'),
    ('Ica: uva mantiene demanda exportadora', 'low')
) AS t(label, severity);

DROP TABLE IF EXISTS market_buyer_matches_cache;
CREATE TABLE market_buyer_matches_cache AS
SELECT * FROM (VALUES
    ('AS', 'AgroExport Sur', true, 'Exportador', 'Palta Hass', '18 ton', 'Recojo en finca', 8.90, 94),
    ('VL', 'Valle Lima Foods', true, 'Mayorista', 'Quinua', '12 ton', 'Entrega Lima', 5.40, 88),
    ('CI', 'Comercial Ica Norte', false, 'Acopiador', 'Uva Red Globe', '9 ton', 'Recojo programado', 4.65, 82)
) AS t(initials, buyerName, verified, buyerType, productoNombre, volumeLabel, deliveryLabel, offeredPricePen, matchScorePct);

DROP TABLE IF EXISTS farm_profile_cache;
CREATE TABLE farm_profile_cache AS
SELECT
    'Finca Santa Lucia' AS farmName,
    'Majes, Arequipa' AS location,
    80.0 AS totalHectares,
    4 AS parcelCount,
    3 AS activeCampaigns,
    18.6 AS averageRoiPct,
    2 AS highlightedCertificationsCount,
    'GlobalG.A.P. y organico en seguimiento' AS highlightedCertificationsLabel,
    'Diego Alvarez' AS producerName,
    true AS producerVerified,
    7 AS producerYears,
    12 AS closedCampaigns,
    16.8 AS historicalRoiPct,
    4.7 AS buyerRating;

DROP TABLE IF EXISTS farm_parcels_cache;
CREATE TABLE farm_parcels_cache AS
SELECT * FROM (VALUES
    ('Lote Norte', 'Palta Hass - floracion', 20.0, 'Riesgo bajo', 'low', 68),
    ('Lote Sur', 'Quinua - preparacion', 30.0, 'Riesgo medio', 'medium', 34),
    ('Parcela Este', 'Uva - cuajado', 18.0, 'Riesgo bajo', 'low', 52),
    ('Parcela Oeste', 'Descanso sanitario', 12.0, 'Riesgo bajo', 'low', 15)
) AS t(parcelName, cropStageLabel, hectares, riskLabel, riskLevel, progressPct);

DROP TABLE IF EXISTS farm_campaign_history_cache;
CREATE TABLE farm_campaign_history_cache AS
SELECT * FROM (VALUES
    ('2025', 'Palta Hass', 'Lote Norte', '13.8 ton/ha', 'S/ 8.10/kg', 'S/ 224,000', '+21%', 'positive'),
    ('2025', 'Quinua', 'Lote Sur', '2.4 ton/ha', 'S/ 4.85/kg', 'S/ 96,000', '+12%', 'positive'),
    ('2024', 'Mango Kent', 'Parcela Oeste', '10.2 ton/ha', 'S/ 3.20/kg', 'S/ 74,000', '-4%', 'negative')
) AS t(campaignYear, productoNombre, parcelName, yieldLabel, priceLabel, incomeLabel, roiLabel, roiType);

DROP TABLE IF EXISTS farm_certifications_cache;
CREATE TABLE farm_certifications_cache AS
SELECT * FROM (VALUES
    ('GlobalG.A.P.', 'Vence en 8 meses', 'low'),
    ('Produccion organica', 'Revision en 45 dias', 'medium'),
    ('Buenas practicas agricolas', 'Activa', 'low')
) AS t(certificationName, expiryLabel, severity);

ANALYZE;
