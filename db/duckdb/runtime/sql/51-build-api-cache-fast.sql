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
    fecha_particion AS fecha,
    LOWER(subpartida_nacional) AS producto_key,
    subpartida_nacional,
    descripcion AS producto_nombre,
    peso_neto_t,
    valor_fob_miles_usd * 1000.0 AS total_usd,
    COALESCE(
        precio_fob_usd_t,
        CASE
            WHEN peso_neto_t IS NULL OR peso_neto_t = 0 OR valor_fob_miles_usd IS NULL THEN NULL
            ELSE (valor_fob_miles_usd * 1000.0) / peso_neto_t
        END
    ) AS average_usd_per_t
FROM delta_scan('s3://agro-productos/Landing/midagri_comercio_exterior/comercio_exportacion_agrario/')
WHERE fecha_particion IS NOT NULL
  AND frecuencia = 'mensual'
  AND nivel_agregacion = 'subpartida'
  AND COALESCE(es_total, false) = false
  AND subpartida_nacional IS NOT NULL
  AND descripcion IS NOT NULL;

DROP TABLE IF EXISTS midagri_importaciones_core_cache;
CREATE TABLE midagri_importaciones_core_cache AS
SELECT
    fecha_particion AS fecha,
    LOWER(subpartida_nacional) AS producto_key,
    subpartida_nacional,
    descripcion AS producto_nombre,
    peso_neto_t,
    valor_cif_miles_usd * 1000.0 AS total_usd,
    COALESCE(
        precio_cif_usd_t,
        CASE
            WHEN peso_neto_t IS NULL OR peso_neto_t = 0 OR valor_cif_miles_usd IS NULL THEN NULL
            ELSE (valor_cif_miles_usd * 1000.0) / peso_neto_t
        END
    ) AS average_usd_per_t
FROM delta_scan('s3://agro-productos/Landing/midagri_comercio_exterior/comercio_importacion_agrario/')
WHERE fecha_particion IS NOT NULL
  AND frecuencia = 'mensual'
  AND nivel_agregacion = 'subpartida'
  AND COALESCE(es_total, false) = false
  AND subpartida_nacional IS NOT NULL
  AND descripcion IS NOT NULL;

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
    any_value(p.procedencia) AS region
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
    COALESCE(any_value(procedencia), '') AS location,
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
    productoNombre AS name,
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

ANALYZE;
