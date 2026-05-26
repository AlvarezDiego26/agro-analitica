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

DROP TABLE IF EXISTS planner_product_cache;
CREATE TABLE planner_product_cache AS
SELECT * FROM (
    VALUES
        (
            'esparrago verde', 'Espárrago verde', 2.80, 2.95, 2.40, 3.20, '2026-05-18', 28, 18.40, -12, 'high', 'ALTO', 'No recomendado en esta ventana',
            'Sobreoferta proyectada de Espárrago Verde por saturación de mercado regional en Pisco durante mayo-junio.'
        ),
        (
            'palta hass', 'Palta Hass', 8.20, 8.45, 7.60, 8.60, '2026-05-18', 30, 42.10, 34, 'low', 'BAJO', 'Ventana razonable segun el precio reciente',
            'Demanda internacional y precios locales estables hacen de Palta Hass una excelente opción de bajo riesgo.'
        ),
        (
            'uva red globe', 'Uva Red Globe', 6.50, 6.62, 6.10, 6.80, '2026-05-18', 29, 35.80, 18, 'low', 'BAJO', 'Ventana razonable segun el precio reciente',
            'Retorno estable y buen volumen proyectado para Uva Red Globe en la ventana actual.'
        ),
        (
            'cebolla amarilla', 'Cebolla amarilla', 1.40, 1.42, 1.18, 1.56, '2026-05-18', 31, 58.30, 9, 'medium', 'MEDIO', 'Conviene validar mas senales antes de sembrar',
            'Retorno moderado debido a un incremento proyectado de oferta de cebolla en valles vecinos.'
        ),
        (
            'ajo', 'Ajo', 6.42, 7.63, 4.35, 8.00, '2026-05-18', 62, 67.05, -12, 'high', 'ALTO', 'No recomendado en esta ventana',
            'Sobreoferta estacional y caída histórica de precios en los meses de cosecha proyectados.'
        ),
        (
            'limon', 'Limón', 4.80, 5.00, 3.20, 6.00, '2026-05-18', 30, 24.50, 15, 'low', 'BAJO', 'Precio estable en mercado',
            'Limón mantiene rentabilidad estable con precio promedio de S/ 4.80 e ingresos predecibles.'
        ),
        (
            'arandano', 'Arándano', 14.50, 15.20, 12.00, 17.50, '2026-05-18', 25, 12.30, 24, 'low', 'BAJO', 'Alta demanda internacional',
            'Arándano con proyección favorable impulsada por exportaciones a mercados norteamericanos y asiáticos.'
        ),
        (
            'mandarina', 'Mandarina', 2.30, 2.45, 1.80, 2.80, '2026-05-18', 28, 45.10, 8, 'medium', 'MEDIO', 'Oferta estacional estable',
            'Mandarina con precio promedio de S/ 2.30 y retorno moderado por competencia nacional.'
        ),
        (
            'mango kent', 'Mango Kent', 3.80, 4.10, 2.50, 4.80, '2026-05-18', 32, 38.60, 12, 'low', 'BAJO', 'Buena ventana de cosecha',
            'Mango Kent se proyecta favorable con precios de exportación estables.'
        ),
        (
            'cebolla roja', 'Cebolla Roja', 1.85, 1.95, 1.30, 2.40, '2026-05-18', 40, 62.00, 5, 'medium', 'MEDIO', 'Validar comportamiento regional',
            'Cebolla Roja con precio promedio de S/ 1.85 y volumen constante en mercado mayorista.'
        ),
        (
            'granada', 'Granada', 5.60, 5.80, 4.20, 6.50, '2026-05-18', 20, 15.80, 18, 'low', 'BAJO', 'Demanda en crecimiento',
            'Granada muestra retorno favorable con ROI proyectado de 18% para exportación.'
        ),
        (
            'aji amarillo', 'Ají Amarillo', 4.10, 4.30, 3.00, 5.00, '2026-05-18', 35, 18.20, -6, 'high', 'ALTO', 'Sobreoferta estacional',
            'Ají Amarillo en riesgo por picos históricos de producción local y precios volátiles.'
        )
) AS t(
    producto_key,
    productoNombre,
    averagePrice,
    latestPrice,
    minPrice,
    maxPrice,
    latestDate,
    records,
    averageVolumeTon,
    estimatedRoi,
    riskLevel,
    title,
    summary,
    explanation
);

DROP TABLE IF EXISTS planner_price_projection_cache;
CREATE TABLE planner_price_projection_cache AS
SELECT * FROM (
    VALUES
        ('esparrago verde', 'Mar', 2.96, 2.97, false, false, 46.37),
        ('esparrago verde', 'Abr', 2.93, 2.93, false, false, 49.02),
        ('esparrago verde', 'May', 2.95, 2.95, false, false, 47.15),
        ('esparrago verde', 'Jun', 2.94, 2.95, false, false, 48.30),
        ('esparrago verde', 'Jul', 2.94, 2.95, false, false, 47.58),
        ('esparrago verde', 'Ago', 2.98, 2.96, false, false, 46.81),
        ('esparrago verde', 'Sep', 2.94, 2.94, false, false, 47.33),
        ('esparrago verde', 'Oct', 2.97, 2.96, false, false, 47.78),
        ('esparrago verde', 'Nov', 3.00, 3.00, false, false, 45.00),
        ('esparrago verde', 'Dic', 3.02, 3.01, false, false, 45.18),
        ('esparrago verde', 'Ene', 3.03, 3.01, false, false, 44.86),
        ('esparrago verde', 'Feb', 3.00, 3.01, false, false, 45.54),
        ('palta hass', 'Mar', 7.78, 7.78, false, false, 81.75),
        ('palta hass', 'Abr', 7.84, 7.83, false, false, 79.56),
        ('palta hass', 'May', 7.86, 7.87, false, false, 78.81),
        ('palta hass', 'Jun', 7.89, 7.89, false, false, 77.98),
        ('palta hass', 'Jul', 7.88, 7.87, false, false, 77.13),
        ('palta hass', 'Ago', 7.86, 7.87, false, false, 76.69),
        ('palta hass', 'Sep', 7.88, 7.87, false, false, 76.38),
        ('palta hass', 'Oct', 7.89, 7.90, false, false, 76.48),
        ('palta hass', 'Nov', 7.90, 7.90, false, false, 78.48),
        ('palta hass', 'Dic', 7.89, 7.90, false, false, 75.40),
        ('palta hass', 'Ene', 7.86, 7.86, false, false, 76.97),
        ('palta hass', 'Feb', 7.88, 7.87, false, false, 77.72),
        ('uva red globe', 'Mar', 6.36, 6.35, false, false, 63.76),
        ('uva red globe', 'Abr', 6.37, 6.38, false, false, 63.55),
        ('uva red globe', 'May', 6.36, 6.37, false, false, 62.22),
        ('uva red globe', 'Jun', 6.38, 6.38, false, false, 61.45),
        ('uva red globe', 'Jul', 6.44, 6.42, false, false, 61.67),
        ('uva red globe', 'Ago', 6.42, 6.41, false, false, 60.46),
        ('uva red globe', 'Sep', 6.41, 6.39, false, false, 62.80),
        ('uva red globe', 'Oct', 6.45, 6.44, false, false, 60.97),
        ('uva red globe', 'Nov', 6.47, 6.49, false, false, 59.82),
        ('uva red globe', 'Dic', 6.43, 6.42, false, false, 61.04),
        ('uva red globe', 'Ene', 6.45, 6.44, false, false, 60.73),
        ('uva red globe', 'Feb', 6.45, 6.45, false, false, 58.78),
        ('cebolla amarilla', 'Mar', 1.29, 1.30, false, false, 129.45),
        ('cebolla amarilla', 'Abr', 1.30, 1.30, false, false, 135.82),
        ('cebolla amarilla', 'May', 1.28, 1.27, false, false, 140.00),
        ('cebolla amarilla', 'Jun', 1.26, 1.25, false, false, 148.91),
        ('cebolla amarilla', 'Jul', 1.28, 1.27, false, false, 140.36),
        ('cebolla amarilla', 'Ago', 1.26, 1.25, false, false, 145.68),
        ('cebolla amarilla', 'Sep', 1.26, 1.24, false, false, 147.49),
        ('cebolla amarilla', 'Oct', 1.22, 1.20, false, false, 159.15),
        ('cebolla amarilla', 'Nov', 1.19, 1.20, false, false, 161.07),
        ('cebolla amarilla', 'Dic', 1.30, 1.29, false, false, 136.18),
        ('cebolla amarilla', 'Ene', 1.27, 1.27, false, false, 143.92),
        ('cebolla amarilla', 'Feb', 1.23, 1.22, false, false, 154.79),
        ('ajo', 'Mar', 6.53, 6.54, false, false, 23.94),
        ('ajo', 'Abr', 6.52, 6.51, false, false, 25.15),
        ('ajo', 'May', 6.46, 6.47, false, false, 24.76),
        ('ajo', 'Jun', 6.50, 6.50, false, false, 25.05),
        ('ajo', 'Jul', 6.52, 6.52, false, false, 24.79),
        ('ajo', 'Ago', 6.51, 6.49, false, false, 24.98),
        ('ajo', 'Sep', 6.54, 6.53, false, false, 25.24),
        ('ajo', 'Oct', 6.52, 6.53, false, false, 25.11),
        ('ajo', 'Nov', 6.56, 6.58, false, false, 23.57),
        ('ajo', 'Dic', 6.60, 6.60, false, false, 24.27),
        ('ajo', 'Ene', 6.66, 6.65, false, false, 23.28),
        ('ajo', 'Feb', 6.64, 6.64, false, false, 23.46),
        ('limon', 'Mar', 4.81, 4.82, false, false, 54.72),
        ('limon', 'Abr', 4.80, 4.79, false, false, 54.92),
        ('limon', 'May', 4.80, 4.78, false, false, 54.96),
        ('limon', 'Jun', 4.75, 4.74, false, false, 57.80),
        ('limon', 'Jul', 4.70, 4.71, false, false, 58.59),
        ('limon', 'Ago', 4.71, 4.73, false, false, 57.61),
        ('limon', 'Sep', 4.72, 4.72, false, false, 58.52),
        ('limon', 'Oct', 4.76, 4.75, false, false, 56.63),
        ('limon', 'Nov', 4.73, 4.72, false, false, 58.59),
        ('limon', 'Dic', 4.73, 4.72, false, false, 58.65),
        ('limon', 'Ene', 4.69, 4.68, false, false, 59.96),
        ('limon', 'Feb', 4.64, 4.65, false, false, 60.43),
        ('arandano', 'Mar', 14.49, 14.49, false, false, 30.77),
        ('arandano', 'Abr', 14.53, 14.54, false, false, 29.05),
        ('arandano', 'May', 14.58, 14.59, false, false, 28.93),
        ('arandano', 'Jun', 14.58, 14.59, false, false, 29.58),
        ('arandano', 'Jul', 14.53, 14.55, false, false, 30.33),
        ('arandano', 'Ago', 14.55, 14.55, false, false, 30.28),
        ('arandano', 'Sep', 14.59, 14.60, false, false, 29.17),
        ('arandano', 'Oct', 14.59, 14.58, false, false, 29.81),
        ('arandano', 'Nov', 14.58, 14.57, false, false, 30.28),
        ('arandano', 'Dic', 14.52, 14.53, false, false, 30.51),
        ('arandano', 'Ene', 14.49, 14.48, false, false, 29.54),
        ('arandano', 'Feb', 14.46, 14.46, false, false, 30.14),
        ('mandarina', 'Mar', 2.30, 2.31, false, false, 86.95),
        ('mandarina', 'Abr', 2.33, 2.35, false, false, 83.35),
        ('mandarina', 'May', 2.37, 2.39, false, false, 79.19),
        ('mandarina', 'Jun', 2.33, 2.35, false, false, 84.71),
        ('mandarina', 'Jul', 2.36, 2.36, false, false, 80.74),
        ('mandarina', 'Ago', 2.33, 2.34, false, false, 83.22),
        ('mandarina', 'Sep', 2.35, 2.34, false, false, 86.90),
        ('mandarina', 'Oct', 2.33, 2.32, false, false, 88.62),
        ('mandarina', 'Nov', 2.29, 2.31, false, false, 91.09),
        ('mandarina', 'Dic', 2.26, 2.26, false, false, 95.06),
        ('mandarina', 'Ene', 2.30, 2.31, false, false, 87.65),
        ('mandarina', 'Feb', 2.30, 2.32, false, false, 88.17),
        ('mango kent', 'Mar', 3.59, 3.57, false, false, 77.00),
        ('mango kent', 'Abr', 3.62, 3.60, false, false, 74.84),
        ('mango kent', 'May', 3.64, 3.62, false, false, 72.39),
        ('mango kent', 'Jun', 3.67, 3.66, false, false, 71.16),
        ('mango kent', 'Jul', 3.64, 3.65, false, false, 73.87),
        ('mango kent', 'Ago', 3.64, 3.64, false, false, 70.84),
        ('mango kent', 'Sep', 3.62, 3.60, false, false, 73.37),
        ('mango kent', 'Oct', 3.59, 3.58, false, false, 74.57),
        ('mango kent', 'Nov', 3.55, 3.57, false, false, 75.72),
        ('mango kent', 'Dic', 3.61, 3.61, false, false, 75.76),
        ('mango kent', 'Ene', 3.58, 3.59, false, false, 76.37),
        ('mango kent', 'Feb', 3.56, 3.58, false, false, 74.71),
        ('cebolla roja', 'Mar', 1.87, 1.87, false, false, 104.84),
        ('cebolla roja', 'Abr', 1.84, 1.82, false, false, 117.24),
        ('cebolla roja', 'May', 1.82, 1.84, false, false, 111.57),
        ('cebolla roja', 'Jun', 1.81, 1.80, false, false, 116.40),
        ('cebolla roja', 'Jul', 1.74, 1.76, false, false, 125.76),
        ('cebolla roja', 'Ago', 1.73, 1.72, false, false, 132.67),
        ('cebolla roja', 'Sep', 1.78, 1.77, false, false, 122.46),
        ('cebolla roja', 'Oct', 1.80, 1.78, false, false, 123.39),
        ('cebolla roja', 'Nov', 1.78, 1.79, false, false, 119.86),
        ('cebolla roja', 'Dic', 1.82, 1.83, false, false, 112.59),
        ('cebolla roja', 'Ene', 1.86, 1.85, false, false, 109.03),
        ('cebolla roja', 'Feb', 1.83, 1.84, false, false, 110.04),
        ('granada', 'Mar', 5.40, 5.38, false, false, 20.48),
        ('granada', 'Abr', 5.35, 5.37, false, false, 20.31),
        ('granada', 'May', 5.40, 5.39, false, false, 20.15),
        ('granada', 'Jun', 5.37, 5.38, false, false, 20.60),
        ('granada', 'Jul', 5.35, 5.35, false, false, 20.30),
        ('granada', 'Ago', 5.32, 5.30, false, false, 20.89),
        ('granada', 'Sep', 5.28, 5.29, false, false, 21.36),
        ('granada', 'Oct', 5.29, 5.28, false, false, 21.38),
        ('granada', 'Nov', 5.31, 5.32, false, false, 21.32),
        ('granada', 'Dic', 5.28, 5.27, false, false, 21.03),
        ('granada', 'Ene', 5.28, 5.28, false, false, 21.37),
        ('granada', 'Feb', 5.31, 5.31, false, false, 21.36),
        ('aji amarillo', 'Mar', 3.91, 3.90, false, false, 40.36),
        ('aji amarillo', 'Abr', 3.89, 3.87, false, false, 39.82),
        ('aji amarillo', 'May', 3.85, 3.83, false, false, 42.43),
        ('aji amarillo', 'Jun', 3.83, 3.83, false, false, 42.00),
        ('aji amarillo', 'Jul', 3.79, 3.81, false, false, 42.89),
        ('aji amarillo', 'Ago', 3.85, 3.84, false, false, 41.30),
        ('aji amarillo', 'Sep', 3.85, 3.86, false, false, 40.71),
        ('aji amarillo', 'Oct', 3.82, 3.83, false, false, 41.47),
        ('aji amarillo', 'Nov', 3.81, 3.79, false, false, 43.88),
        ('aji amarillo', 'Dic', 3.81, 3.82, false, false, 42.55),
        ('aji amarillo', 'Ene', 3.78, 3.77, false, false, 44.34),
        ('aji amarillo', 'Feb', 3.75, 3.77, false, false, 43.82),
        ('papa unica', 'Mar', 1.76, 1.75, false, false, 187.11),
        ('papa unica', 'Abr', 1.70, 1.71, false, false, 196.22),
        ('papa unica', 'May', 1.70, 1.71, false, false, 191.82),
        ('papa unica', 'Jun', 1.72, 1.72, false, false, 196.63),
        ('papa unica', 'Jul', 1.71, 1.71, false, false, 193.65),
        ('papa unica', 'Ago', 1.73, 1.74, false, false, 190.89),
        ('papa unica', 'Sep', 1.70, 1.71, false, false, 194.51),
        ('papa unica', 'Oct', 1.72, 1.71, false, false, 190.95),
        ('papa unica', 'Nov', 1.71, 1.73, false, false, 190.11),
        ('papa unica', 'Dic', 1.69, 1.70, false, false, 195.11),
        ('papa unica', 'Ene', 1.74, 1.74, false, false, 188.42),
        ('papa unica', 'Feb', 1.71, 1.71, false, false, 199.84),
        ('maiz amarillo duro', 'Mar', 1.20, 1.20, false, false, 266.21),
        ('maiz amarillo duro', 'Abr', 1.15, 1.16, false, false, 292.98),
        ('maiz amarillo duro', 'May', 1.19, 1.18, false, false, 271.63),
        ('maiz amarillo duro', 'Jun', 1.19, 1.18, false, false, 267.76),
        ('maiz amarillo duro', 'Jul', 1.22, 1.21, false, false, 251.86),
        ('maiz amarillo duro', 'Ago', 1.25, 1.24, false, false, 231.20),
        ('maiz amarillo duro', 'Sep', 1.22, 1.23, false, false, 236.77),
        ('maiz amarillo duro', 'Oct', 1.18, 1.18, false, false, 277.43),
        ('maiz amarillo duro', 'Nov', 1.16, 1.15, false, false, 297.80),
        ('maiz amarillo duro', 'Dic', 1.13, 1.12, false, false, 327.58),
        ('maiz amarillo duro', 'Ene', 1.13, 1.14, false, false, 307.39),
        ('maiz amarillo duro', 'Feb', 1.18, 1.18, false, false, 276.79),
        ('maracuya', 'Mar', 3.21, 3.20, false, false, 34.49),
        ('maracuya', 'Abr', 3.20, 3.19, false, false, 34.74),
        ('maracuya', 'May', 3.16, 3.17, false, false, 36.74),
        ('maracuya', 'Jun', 3.15, 3.16, false, false, 36.24),
        ('maracuya', 'Jul', 3.20, 3.18, false, false, 36.25),
        ('maracuya', 'Ago', 3.20, 3.18, false, false, 35.23),
        ('maracuya', 'Sep', 3.16, 3.14, false, false, 37.57),
        ('maracuya', 'Oct', 3.14, 3.14, false, false, 37.24),
        ('maracuya', 'Nov', 3.15, 3.15, false, false, 36.89),
        ('maracuya', 'Dic', 3.13, 3.11, false, false, 38.25),
        ('maracuya', 'Ene', 3.08, 3.09, false, false, 37.69),
        ('maracuya', 'Feb', 3.09, 3.10, false, false, 38.71),
        ('quinua', 'Mar', 6.74, 6.76, false, false, 15.60),
        ('quinua', 'Abr', 6.79, 6.79, false, false, 15.26),
        ('quinua', 'May', 6.80, 6.80, false, false, 15.01),
        ('quinua', 'Jun', 6.82, 6.84, false, false, 14.57),
        ('quinua', 'Jul', 6.82, 6.80, false, false, 14.63),
        ('quinua', 'Ago', 6.80, 6.82, false, false, 14.89),
        ('quinua', 'Sep', 6.82, 6.83, false, false, 15.05),
        ('quinua', 'Oct', 6.87, 6.85, false, false, 14.50),
        ('quinua', 'Nov', 6.88, 6.86, false, false, 14.25),
        ('quinua', 'Dic', 6.82, 6.83, false, false, 15.02),
        ('quinua', 'Ene', 6.85, 6.85, false, false, 14.37),
        ('quinua', 'Feb', 6.86, 6.87, false, false, 14.42),
        ('pimiento piquillo', 'Mar', 2.93, 2.91, false, false, 49.50),
        ('pimiento piquillo', 'Abr', 2.93, 2.95, false, false, 48.43),
        ('pimiento piquillo', 'May', 2.95, 2.94, false, false, 48.79),
        ('pimiento piquillo', 'Jun', 2.93, 2.93, false, false, 48.19),
        ('pimiento piquillo', 'Jul', 2.90, 2.92, false, false, 49.32),
        ('pimiento piquillo', 'Ago', 2.97, 2.96, false, false, 46.38),
        ('pimiento piquillo', 'Sep', 2.99, 2.97, false, false, 47.12),
        ('pimiento piquillo', 'Oct', 2.94, 2.93, false, false, 47.14),
        ('pimiento piquillo', 'Nov', 2.95, 2.95, false, false, 46.53),
        ('pimiento piquillo', 'Dic', 2.98, 2.98, false, false, 46.91),
        ('pimiento piquillo', 'Ene', 2.98, 2.98, false, false, 45.20),
        ('pimiento piquillo', 'Feb', 2.99, 2.99, false, false, 44.64),
        ('lucuma', 'Mar', 7.55, 7.54, false, false, 17.55),
        ('lucuma', 'Abr', 7.54, 7.53, false, false, 17.62),
        ('lucuma', 'May', 7.58, 7.58, false, false, 17.51),
        ('lucuma', 'Jun', 7.55, 7.56, false, false, 17.48),
        ('lucuma', 'Jul', 7.53, 7.55, false, false, 17.61),
        ('lucuma', 'Ago', 7.58, 7.56, false, false, 17.47),
        ('lucuma', 'Sep', 7.54, 7.52, false, false, 17.49),
        ('lucuma', 'Oct', 7.54, 7.54, false, false, 17.52),
        ('lucuma', 'Nov', 7.54, 7.54, false, false, 17.39),
        ('lucuma', 'Dic', 7.51, 7.50, false, false, 17.98),
        ('lucuma', 'Ene', 7.56, 7.54, false, false, 17.71),
        ('lucuma', 'Feb', 7.51, 7.51, false, false, 17.65)
) AS t(producto_key, monthLabel, historicalPrice, predictedPrice, oversupplyZone, isLowPoint, predictedVolumeTon);

DROP TABLE IF EXISTS planner_recommended_alternatives_cache;
CREATE TABLE planner_recommended_alternatives_cache AS
SELECT * FROM (
    VALUES
        ('esparrago verde', 'palta hass', 'Palta Hass', 34, 'low', 'Riesgo bajo', 7.80, 'Demanda exportación EE.UU. en alza'),
        ('esparrago verde', 'uva red globe', 'Uva Red Globe', 18, 'low', 'Riesgo bajo', 6.10, 'Ventana de cosecha sin saturación'),
        ('esparrago verde', 'cebolla amarilla', 'Cebolla amarilla', 9, 'medium', 'Riesgo medio', 1.25, 'Precio estable, ciclo más corto'),
        
        ('ajo', 'palta hass', 'Palta Hass', 34, 'low', 'Riesgo bajo', 8.20, 'Alternativa altamente rentable y estable'),
        ('ajo', 'limon', 'Limón', 15, 'low', 'Riesgo bajo', 4.80, 'Estabilidad de precio anual asegurada'),
        
        ('aji amarillo', 'granada', 'Granada', 18, 'low', 'Riesgo bajo', 5.60, 'Excelente ROI proyectado de exportación'),
        ('aji amarillo', 'arandano', 'Arándano', 24, 'low', 'Riesgo bajo', 14.50, 'Fuerte rentabilidad internacional'),
        
        ('cebolla roja', 'mango kent', 'Mango Kent', 12, 'low', 'Riesgo bajo', 3.80, 'Precios estables y buena ventana de cosecha')
) AS t(source_producto_key, producto_key, productoNombre, estimatedRoi, riskLevel, riskLabel, projectedPricePen, message);

DROP TABLE IF EXISTS home_summary_cache;
CREATE TABLE home_summary_cache AS
SELECT
    CAST(MAX(fecha) AS VARCHAR) AS latestDate,
    'Ica' AS location,
    'Riesgo ALTO de sobreoferta de Espárrago en Pisco — marzo' AS alertTitle,
    '+38% de intenciones de siembra vs. campaña anterior · SISAP' AS alertMessage,
    'high' AS alertSeverity,
    14.7 AS activeHectares,
    3 AS parcelCount,
    182000.0 AS projectedIncomePen,
    6.4 AS projectedIncomeDeltaPct,
    'Medio' AS portfolioRiskTitle,
    1 AS activeAlertCount,
    'Considera sembrar Palta Hass en lugar de Espárrago este abril.' AS recommendationTitle,
    34 AS recommendationRoiPct,
    'Bajo' AS recommendationRiskLabel,
    'Hay sobreoferta proyectada de espárrago en tu valle. La palta muestra demanda creciente de exportación a EE.UU.' AS recommendationMessage
FROM sisap_precios_recent_cache;

DROP TABLE IF EXISTS home_featured_campaigns_cache;
CREATE TABLE home_featured_campaigns_cache AS
SELECT * FROM (
    VALUES
        ('Espárrago verde', 'UC-157 · 8.5 ha', 'Riesgo Medio', 'medium', 'CRECIMIENTO', '48D A COSECHA', 60, 3.40, 4.2, 'down'),
        ('Uva Red Globe', 'Floración · 4 ha', 'Riesgo Bajo', 'low', 'FLORACIÓN', '120D A COSECHA', 30, 6.10, 2.8, 'up'),
        ('Palta Hass', 'Pre-cosecha · 2.2 ha', 'Riesgo Bajo', 'low', 'PRE-COSECHA', '18D A COSECHA', 90, 7.80, 5.1, 'up')
) AS t(nombre, codeLabel, riskLabel, riskLevel, stageLabel, harvestWindowLabel, progressPct, projectedPricePen, deltaPct, deltaDirection);

DROP TABLE IF EXISTS home_price_cards_cache;
CREATE TABLE home_price_cards_cache AS
WITH product_stats AS (
    SELECT
        producto_nombre AS nombre,
        arg_max(precio_prom, fecha) AS pricePen,
        ROUND(AVG(precio_prom), 2) AS avgPrice
    FROM sisap_precios_recent_cache
    GROUP BY producto_nombre
)
SELECT
    nombre,
    ROUND(pricePen, 2) AS pricePen,
    ROUND(ABS(
        CASE
            WHEN avgPrice = 0 THEN 0
            ELSE ((pricePen - avgPrice) / avgPrice) * 100
        END
    ), 1) AS deltaPct,
    CASE
        WHEN pricePen > avgPrice THEN 'up'
        WHEN pricePen < avgPrice THEN 'down'
        ELSE 'none'
    END AS deltaDirection
FROM product_stats
ORDER BY pricePen DESC;

DROP TABLE IF EXISTS home_upcoming_tasks_cache;
CREATE TABLE home_upcoming_tasks_cache AS
SELECT * FROM (
    VALUES
        ('Aplicar fertilizante NPK', 'Hoy · Parcela Norte', 'high'),
        ('Inspección plagas', 'Mar 18 · Parcela Sur', 'low'),
        ('Riego programado', 'Mar 20 · Parcela Oeste', 'low'),
        ('Cosecha Palta Hass', 'Mar 22 · Parcela Oeste', 'high')
) AS t(title, scheduleLabel, severity);

DROP TABLE IF EXISTS home_weather_forecast_cache;
CREATE TABLE home_weather_forecast_cache AS
SELECT * FROM (
    VALUES
        ('Lun', 'sun', 24),
        ('Mar', 'sun', 25),
        ('Mié', 'cloud', 22),
        ('Jue', 'rain', 21),
        ('Vie', 'sun', 23)
) AS t(dayLabel, conditionCode, temperatureC);

DROP TABLE IF EXISTS home_regional_status_cache;
CREATE TABLE home_regional_status_cache AS
SELECT * FROM (
    VALUES
        ('Espárrago: sobreoferta', 'high'),
        ('Palta: demanda alta', 'low'),
        ('Uva: estable', 'medium')
) AS t(label, severity);

DROP TABLE IF EXISTS farm_profile_cache;
CREATE TABLE farm_profile_cache AS
SELECT
    'Fundo San Juan' AS farmName,
    'Ica' AS location,
    14.7 AS totalHectares,
    3 AS parcelCount,
    3 AS activeCampaigns,
    18 AS averageRoiPct,
    2 AS highlightedCertificationsCount,
    'Global G.A.P. · SENASA' AS highlightedCertificationsLabel,
    'Manuel Quispe' AS producerName,
    true AS producerVerified,
    4 AS producerYears,
    12 AS closedCampaigns,
    14.8 AS historicalRoiPct,
    4.8 AS buyerRating;

DROP TABLE IF EXISTS farm_parcels_cache;
CREATE TABLE farm_parcels_cache AS
SELECT * FROM (
    VALUES
        ('Parcela Norte', 'Espárrago verde · Crecimiento', 8.5, 'Riesgo Medio', 'medium', 62),
        ('Parcela Sur', 'Uva Red Globe · Floración', 4.0, 'Riesgo Bajo', 'low', 34),
        ('Parcela Oeste', 'Palta Hass · Pre-cosecha', 2.2, 'Riesgo Bajo', 'low', 88)
) AS t(parcelName, cropStageLabel, hectares, riskLabel, riskLevel, progressPct);

DROP TABLE IF EXISTS farm_campaign_history_cache;
CREATE TABLE farm_campaign_history_cache AS
SELECT * FROM (
    VALUES
        ('2025', 'Espárrago verde', 'Norte', '12.4 t/ha', 'S/ 3.85', 'S/ 41,200', '+18%', 'positive'),
        ('2024', 'Cebolla amarilla', 'Norte', '38 t/ha', 'S/ 1.40', 'S/ 18,090', '-8%', 'negative'),
        ('2024', 'Uva Red Globe', 'Sur', '18 t/ha', 'S/ 5.90', 'S/ 42,480', '+22%', 'positive'),
        ('2023', 'Espárrago verde', 'Norte', '10.8 t/ha', 'S/ 3.20', 'S/ 20,376', '+4%', 'positive'),
        ('2023', 'Palta Hass', 'Oeste', '9.2 t/ha', 'S/ 7.10', 'S/ 14,375', '+28%', 'positive')
) AS t(campaignYear, productoNombre, parcelName, yieldLabel, priceLabel, incomeLabel, roiLabel, roiType);

DROP TABLE IF EXISTS farm_certifications_cache;
CREATE TABLE farm_certifications_cache AS
SELECT * FROM (
    VALUES
        ('Global G.A.P.', 'Vence Nov 2026', 'low'),
        ('SENASA - Buenas Prácticas', 'Vence Feb 2027', 'low'),
        ('Comercio Justo', 'Vence May 2026', 'medium')
) AS t(certificationName, expiryLabel, severity);

DROP TABLE IF EXISTS market_buyer_matches_cache;
CREATE TABLE market_buyer_matches_cache AS
SELECT * FROM (
    VALUES
        ('AP', 'AgroExport Perú SAC', true, 'Exportación - EE.UU.', 'Palta Hass', '15 ton', 'Cosecha mayo 2026', 8.20, 96),
        ('C', 'Camposol', true, 'Calidad premium', 'Espárrago verde', '8 ton', 'Entrega abril', 3.90, 88),
        ('Fd', 'Frutícola del Sur', false, 'Mercado local', 'Uva Red Globe', '20 ton', 'Cosecha junio', 6.50, 74),
        ('Bd', 'Beta del Pacífico', true, 'Exportación - China', 'Arándano', '2 ton', 'Cosecha agosto', 18.40, 42),
        ('PI', 'Procesadora Ica', true, 'Industrial', 'Cebolla amarilla', '40 ton', 'Continuo', 1.40, 68)
) AS t(initials, buyerName, verified, buyerType, productoNombre, volumeLabel, deliveryLabel, offeredPricePen, matchScorePct);

ANALYZE;
