INSTALL delta;
LOAD delta;

INSTALL httpfs;
LOAD httpfs;

SET preserve_insertion_order = false;
SET threads = 1;

-- Script de demo:
-- - no lee historicos grandes
-- - genera tablas cache pequenas con la misma forma que espera el publish
-- - sirve para poblar y validar UI/backend con datos controlados

DROP TABLE IF EXISTS dashboard_overview_cache;
CREATE TABLE dashboard_overview_cache AS
SELECT
    '2026-05-18' AS latestDate,
    88 AS analyzedRows,
    8 AS productCount,
    5 AS originCount,
    4.56 AS overallAverage,
    414.60 AS totalVolumeTon,
    25.91 AS averageVolumeTon;

DROP TABLE IF EXISTS dashboard_trend_cache;
CREATE TABLE dashboard_trend_cache AS
SELECT * FROM (
    VALUES
        ('2025-08-18', 4.02),
        ('2025-11-18', 4.11),
        ('2026-02-18', 4.23),
        ('2026-04-18', 4.36),
        ('2026-05-12', 4.39),
        ('2026-05-13', 4.43),
        ('2026-05-14', 4.46),
        ('2026-05-15', 4.48),
        ('2026-05-16', 4.50),
        ('2026-05-17', 4.53),
        ('2026-05-18', 4.56)
) AS t(fecha, averagePrice);

DROP TABLE IF EXISTS dashboard_top_products_cache;
CREATE TABLE dashboard_top_products_cache AS
SELECT * FROM (
    VALUES
        ('Palta', 7.80, 6.20, 8.28, 15, 60.90),
        ('Ajo', 6.40, 5.10, 7.24, 11, 33.60),
        ('Uva Red Globe', 6.10, 5.10, 6.60, 10, 35.40),
        ('Limón', 4.80, 3.55, 5.42, 12, 24.20),
        ('Espárrago', 3.40, 2.95, 4.30, 12, 18.00)
) AS t(productoNombre, averagePrice, minPrice, maxPrice, recordCount, totalVolumeTon);

DROP TABLE IF EXISTS planner_product_cache;
CREATE TABLE planner_product_cache AS
SELECT * FROM (
    VALUES
        (
            'esparrago verde', 'Espárrago verde', 2.80, 2.95, 2.40, 3.20, '2026-05-18', 28, 18.40, -12, 'high', 'ALTO', 'No recomendado en esta ventana',
            'Sobreoferta proyectada de Espárrago Verde por saturación de mercado regional en Pisco durante mayo-junio.', 'La Libertad'
        ),
        (
            'palta hass', 'Palta Hass', 8.20, 8.45, 7.60, 8.60, '2026-05-18', 30, 42.10, 34, 'low', 'BAJO', 'Ventana razonable segun el precio reciente',
            'Demanda internacional y precios locales estables hacen de Palta Hass una excelente opción de bajo riesgo.', 'Ica'
        ),
        (
            'uva red globe', 'Uva Red Globe', 6.50, 6.62, 6.10, 6.80, '2026-05-18', 29, 35.80, 18, 'low', 'BAJO', 'Ventana razonable segun el precio reciente',
            'Retorno estable y buen volumen proyectado para Uva Red Globe en la ventana actual.', 'Ica'
        ),
        (
            'cebolla amarilla', 'Cebolla amarilla', 1.40, 1.42, 1.18, 1.56, '2026-05-18', 31, 58.30, 9, 'medium', 'MEDIO', 'Conviene validar mas senales antes de sembrar',
            'Retorno moderado debido a un incremento proyectado de oferta de cebolla en valles vecinos.', 'Ica'
        ),
        (
            'ajo', 'Ajo', 6.42, 7.63, 4.35, 8.00, '2026-05-18', 62, 67.05, -12, 'high', 'ALTO', 'No recomendado en esta ventana',
            'Sobreoferta estacional y caída histórica de precios en los meses de cosecha proyectados.', 'Arequipa'
        ),
        (
            'limon', 'Limón', 4.80, 5.00, 3.20, 6.00, '2026-05-18', 30, 24.50, 15, 'low', 'BAJO', 'Precio estable en mercado',
            'Limón mantiene rentabilidad estable con precio promedio de S/ 4.80 e ingresos predecibles.', 'Ica'
        ),
        (
            'arandano', 'Arándano', 14.50, 15.20, 12.00, 17.50, '2026-05-18', 25, 12.30, 24, 'low', 'BAJO', 'Alta demanda internacional',
            'Arándano con proyección favorable impulsada por exportaciones a mercados norteamericanos y asiáticos.', 'La Libertad'
        ),
        (
            'mandarina', 'Mandarina', 2.30, 2.45, 1.80, 2.80, '2026-05-18', 28, 45.10, 8, 'medium', 'MEDIO', 'Oferta estacional estable',
            'Mandarina con precio promedio de S/ 2.30 y retorno moderado por competencia nacional.', 'Lima'
        ),
        (
            'mango kent', 'Mango Kent', 3.80, 4.10, 2.50, 4.80, '2026-05-18', 32, 38.60, 12, 'low', 'BAJO', 'Buena ventana de cosecha',
            'Mango Kent se proyecta favorable con precios de exportación estables.', 'Ica'
        ),
        (
            'cebolla roja', 'Cebolla Roja', 1.85, 1.95, 1.30, 2.40, '2026-05-18', 40, 62.00, 5, 'medium', 'MEDIO', 'Validar comportamiento regional',
            'Cebolla Roja con precio promedio de S/ 1.85 y volumen constante en mercado mayorista.', 'Arequipa'
        ),
        (
            'granada', 'Granada', 5.60, 5.80, 4.20, 6.50, '2026-05-18', 20, 15.80, 18, 'low', 'BAJO', 'Demanda en crecimiento',
            'Granada muestra retorno favorable con ROI proyectado de 18% para exportación.', 'Ica'
        ),
        (
            'aji amarillo', 'Ají Amarillo', 4.10, 4.30, 3.00, 5.00, '2026-05-18', 35, 18.20, -6, 'high', 'ALTO', 'Sobreoferta estacional',
            'Ají Amarillo en riesgo por picos históricos de producción local y precios volátiles.', 'Ica'
        ),
        (
            'papa unica', 'Papa Única', 1.80, 1.95, 1.20, 2.40, '2026-05-18', 45, 120.50, 15, 'low', 'BAJO', 'Ventana favorable por estabilidad de precios',
            'Precios de Papa Única se mantienen estables con demanda local constante y buen rendimiento estimado.', 'Arequipa'
        ),
        (
            'maiz amarillo duro', 'Maíz Amarillo Duro', 1.15, 1.20, 0.95, 1.35, '2026-05-18', 55, 310.20, 8, 'medium', 'MEDIO', 'Rentabilidad moderada por competencia externa',
            'El maíz amarillo duro presenta demanda constante para industria avícola, pero con margen acotado por importaciones.', 'Lima'
        ),
        (
            'maracuya', 'Maracuyá', 3.20, 3.40, 2.20, 4.10, '2026-05-18', 22, 14.80, 22, 'low', 'BAJO', 'Fuerte demanda de procesamiento agroindustrial',
            'Maracuyá muestra precios al alza impulsados por la demanda de pulpa y concentrados para exportación.', 'Lima'
        ),
        (
            'quinua', 'Quinua', 6.80, 7.20, 5.50, 8.50, '2026-05-18', 18, 9.40, 19, 'low', 'BAJO', 'Demanda internacional sostenida',
            'Quinua orgánica mantiene un precio premium estable en mercados internacionales con bajo nivel de riesgo.', 'Arequipa'
        ),
        (
            'pimiento piquillo', 'Pimiento Piquillo', 2.90, 3.10, 2.00, 3.80, '2026-05-18', 27, 16.50, 14, 'low', 'BAJO', 'Firme demanda de conservas',
            'Pimiento piquillo con buena colocación para la industria de conservas y precios estables.', 'La Libertad'
        ),
        (
            'lucuma', 'Lúcuma', 7.50, 8.20, 6.00, 9.50, '2026-05-18', 12, 5.20, 25, 'low', 'BAJO', 'Precio alto por nicho de mercado',
            'Lúcuma mantiene precios elevados debido a su producción especializada y demanda en la industria de postres.', 'Ica'
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
    explanation,
    region
);

DROP TABLE IF EXISTS sisap_product_trend_cache;
CREATE TABLE sisap_product_trend_cache AS
SELECT * FROM (
    VALUES
        ('palta', 'Palta', '2025-08-18', 6.90, 6.20, 7.45, 8, 42.00),
        ('palta', 'Palta', '2025-11-18', 7.10, 6.45, 7.70, 9, 46.50),
        ('palta', 'Palta', '2026-02-18', 7.35, 6.80, 7.90, 10, 50.10),
        ('palta', 'Palta', '2026-04-18', 7.55, 7.00, 8.00, 11, 54.80),
        ('palta', 'Palta', '2026-05-12', 7.42, 6.95, 7.88, 12, 56.20),
        ('palta', 'Palta', '2026-05-13', 7.50, 7.02, 7.96, 12, 57.10),
        ('palta', 'Palta', '2026-05-14', 7.61, 7.10, 8.02, 13, 58.00),
        ('palta', 'Palta', '2026-05-15', 7.65, 7.18, 8.08, 13, 58.90),
        ('palta', 'Palta', '2026-05-16', 7.71, 7.22, 8.15, 14, 59.60),
        ('palta', 'Palta', '2026-05-17', 7.76, 7.30, 8.21, 14, 60.20),
        ('palta', 'Palta', '2026-05-18', 7.80, 7.35, 8.28, 15, 60.90),

        ('cebolla', 'Cebolla', '2025-08-18', 1.52, 1.30, 1.72, 10, 78.20),
        ('cebolla', 'Cebolla', '2025-11-18', 1.46, 1.26, 1.65, 10, 74.10),
        ('cebolla', 'Cebolla', '2026-02-18', 1.38, 1.20, 1.56, 11, 70.50),
        ('cebolla', 'Cebolla', '2026-04-18', 1.32, 1.14, 1.50, 11, 68.20),
        ('cebolla', 'Cebolla', '2026-05-12', 1.31, 1.15, 1.49, 11, 67.30),
        ('cebolla', 'Cebolla', '2026-05-13', 1.29, 1.13, 1.47, 11, 66.80),
        ('cebolla', 'Cebolla', '2026-05-14', 1.28, 1.12, 1.46, 12, 66.10),
        ('cebolla', 'Cebolla', '2026-05-15', 1.27, 1.11, 1.44, 12, 65.90),
        ('cebolla', 'Cebolla', '2026-05-16', 1.26, 1.10, 1.42, 12, 65.30),
        ('cebolla', 'Cebolla', '2026-05-17', 1.25, 1.09, 1.40, 12, 64.80),
        ('cebolla', 'Cebolla', '2026-05-18', 1.25, 1.08, 1.39, 13, 64.20),

        ('ajo', 'Ajo', '2025-08-18', 5.85, 5.10, 6.40, 8, 24.20),
        ('ajo', 'Ajo', '2025-11-18', 6.00, 5.30, 6.62, 9, 26.50),
        ('ajo', 'Ajo', '2026-02-18', 6.15, 5.45, 6.80, 9, 28.10),
        ('ajo', 'Ajo', '2026-04-18', 6.24, 5.55, 6.95, 10, 30.20),
        ('ajo', 'Ajo', '2026-05-12', 6.18, 5.50, 6.88, 10, 31.00),
        ('ajo', 'Ajo', '2026-05-13', 6.24, 5.56, 6.95, 10, 31.80),
        ('ajo', 'Ajo', '2026-05-14', 6.31, 5.64, 7.02, 10, 32.20),
        ('ajo', 'Ajo', '2026-05-15', 6.35, 5.70, 7.10, 11, 32.90),
        ('ajo', 'Ajo', '2026-05-16', 6.39, 5.75, 7.18, 11, 33.30),
        ('ajo', 'Ajo', '2026-05-17', 6.42, 5.80, 7.24, 11, 33.90),
        ('ajo', 'Ajo', '2026-05-18', 6.40, 5.78, 7.22, 11, 33.60),

        ('limon', 'Limón', '2025-08-18', 4.05, 3.55, 4.50, 9, 18.10),
        ('limon', 'Limón', '2025-11-18', 4.20, 3.70, 4.68, 9, 19.00),
        ('limon', 'Limón', '2026-02-18', 4.38, 3.82, 4.84, 10, 20.80),
        ('limon', 'Limón', '2026-04-18', 4.55, 4.05, 5.10, 10, 22.10),
        ('limon', 'Limón', '2026-05-12', 4.52, 4.02, 5.08, 10, 22.30),
        ('limon', 'Limón', '2026-05-13', 4.58, 4.08, 5.16, 10, 22.60),
        ('limon', 'Limón', '2026-05-14', 4.64, 4.15, 5.22, 11, 22.90),
        ('limon', 'Limón', '2026-05-15', 4.70, 4.20, 5.28, 11, 23.20),
        ('limon', 'Limón', '2026-05-16', 4.75, 4.25, 5.35, 11, 23.60),
        ('limon', 'Limón', '2026-05-17', 4.79, 4.30, 5.40, 11, 24.00),
        ('limon', 'Limón', '2026-05-18', 4.80, 4.32, 5.42, 12, 24.20),

        ('uva red globe', 'Uva Red Globe', '2025-08-18', 5.62, 5.10, 6.05, 7, 26.20),
        ('uva red globe', 'Uva Red Globe', '2025-11-18', 5.78, 5.25, 6.22, 7, 28.40),
        ('uva red globe', 'Uva Red Globe', '2026-02-18', 5.92, 5.42, 6.34, 8, 30.60),
        ('uva red globe', 'Uva Red Globe', '2026-04-18', 6.00, 5.50, 6.45, 8, 32.10),
        ('uva red globe', 'Uva Red Globe', '2026-05-12', 5.96, 5.48, 6.38, 8, 32.50),
        ('uva red globe', 'Uva Red Globe', '2026-05-13', 6.00, 5.52, 6.42, 8, 33.10),
        ('uva red globe', 'Uva Red Globe', '2026-05-14', 6.04, 5.55, 6.48, 9, 33.80),
        ('uva red globe', 'Uva Red Globe', '2026-05-15', 6.06, 5.58, 6.52, 9, 34.20),
        ('uva red globe', 'Uva Red Globe', '2026-05-16', 6.08, 5.62, 6.56, 9, 34.70),
        ('uva red globe', 'Uva Red Globe', '2026-05-17', 6.09, 5.65, 6.58, 9, 35.10),
        ('uva red globe', 'Uva Red Globe', '2026-05-18', 6.10, 5.68, 6.60, 10, 35.40),

        ('esparrago verde', 'Espárrago', '2025-08-18', 3.88, 3.40, 4.30, 10, 16.20),
        ('esparrago verde', 'Espárrago', '2025-11-18', 3.74, 3.28, 4.12, 10, 17.10),
        ('esparrago verde', 'Espárrago', '2026-02-18', 3.60, 3.15, 3.96, 10, 17.90),
        ('esparrago verde', 'Espárrago', '2026-04-18', 3.48, 3.05, 3.82, 11, 18.50),
        ('esparrago verde', 'Espárrago', '2026-05-12', 3.46, 3.02, 3.80, 11, 18.70),
        ('esparrago verde', 'Espárrago', '2026-05-13', 3.44, 3.00, 3.77, 11, 18.60),
        ('esparrago verde', 'Espárrago', '2026-05-14', 3.42, 2.98, 3.74, 11, 18.55),
        ('esparrago verde', 'Espárrago', '2026-05-15', 3.41, 2.97, 3.71, 11, 18.40),
        ('esparrago verde', 'Espárrago', '2026-05-16', 3.40, 2.96, 3.68, 12, 18.20),
        ('esparrago verde', 'Espárrago', '2026-05-17', 3.40, 2.95, 3.66, 12, 18.10),
        ('esparrago verde', 'Espárrago', '2026-05-18', 3.40, 2.95, 3.64, 12, 18.00),

        ('papa unica', 'Papa', '2025-08-18', 1.58, 1.34, 1.82, 12, 92.20),
        ('papa unica', 'Papa', '2025-11-18', 1.62, 1.38, 1.88, 12, 96.40),
        ('papa unica', 'Papa', '2026-02-18', 1.70, 1.46, 1.98, 13, 101.50),
        ('papa unica', 'Papa', '2026-04-18', 1.76, 1.54, 2.02, 13, 108.20),
        ('papa unica', 'Papa', '2026-05-12', 1.78, 1.55, 2.04, 13, 110.30),
        ('papa unica', 'Papa', '2026-05-13', 1.79, 1.57, 2.06, 13, 111.20),
        ('papa unica', 'Papa', '2026-05-14', 1.81, 1.58, 2.08, 14, 112.10),
        ('papa unica', 'Papa', '2026-05-15', 1.83, 1.60, 2.11, 14, 113.20),
        ('papa unica', 'Papa', '2026-05-16', 1.86, 1.63, 2.15, 14, 114.10),
        ('papa unica', 'Papa', '2026-05-17', 1.89, 1.66, 2.18, 14, 115.40),
        ('papa unica', 'Papa', '2026-05-18', 1.92, 1.68, 2.20, 15, 116.00),

        ('maracuya', 'Maracuyá', '2025-08-18', 2.62, 2.28, 2.98, 8, 14.30),
        ('maracuya', 'Maracuyá', '2025-11-18', 2.78, 2.42, 3.16, 8, 15.20),
        ('maracuya', 'Maracuyá', '2026-02-18', 2.94, 2.56, 3.32, 9, 16.80),
        ('maracuya', 'Maracuyá', '2026-04-18', 3.06, 2.70, 3.44, 9, 17.60),
        ('maracuya', 'Maracuyá', '2026-05-12', 3.05, 2.68, 3.42, 9, 17.90),
        ('maracuya', 'Maracuyá', '2026-05-13', 3.08, 2.72, 3.46, 9, 18.10),
        ('maracuya', 'Maracuyá', '2026-05-14', 3.11, 2.75, 3.50, 9, 18.30),
        ('maracuya', 'Maracuyá', '2026-05-15', 3.14, 2.78, 3.55, 10, 18.60),
        ('maracuya', 'Maracuyá', '2026-05-16', 3.17, 2.82, 3.60, 10, 18.90),
        ('maracuya', 'Maracuyá', '2026-05-17', 3.19, 2.84, 3.63, 10, 19.20),
        ('maracuya', 'Maracuyá', '2026-05-18', 3.20, 2.86, 3.66, 10, 19.40)
) AS t(productoKey, productoNombre, fecha, averagePrice, minPrice, maxPrice, recordCount, totalVolumeTon);

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
        
        ('cebolla roja', 'mango kent', 'Mango Kent', 12, 'low', 'Riesgo bajo', 3.80, 'Precios estables y buena ventana de cosecha'),

        ('papa unica', 'maiz amarillo duro', 'Maíz Amarillo Duro', 8, 'medium', 'Riesgo medio', 1.15, 'Buena alternativa para rotación de suelo'),
        ('maiz amarillo duro', 'maracuya', 'Maracuyá', 22, 'low', 'Riesgo bajo', 3.20, 'Fuerte margen por demanda agroindustrial'),
        ('maracuya', 'lucuma', 'Lúcuma', 25, 'low', 'Riesgo bajo', 7.50, 'Excelente ROI para nichos premium'),
        ('quinua', 'pimiento piquillo', 'Pimiento Piquillo', 14, 'low', 'Riesgo bajo', 2.90, 'Precio estable y demanda industrial asegurada'),
        ('pimiento piquillo', 'esparrago verde', 'Espárrago verde', -12, 'high', 'Riesgo alto', 2.80, 'No recomendado por sobreoferta regional'),
        ('lucuma', 'maracuya', 'Maracuyá', 22, 'low', 'Riesgo bajo', 3.20, 'Ciclo de retorno rápido comparado al frutal')
) AS t(source_producto_key, producto_key, productoNombre, estimatedRoi, riskLevel, riskLabel, projectedPricePen, message);

DROP TABLE IF EXISTS home_summary_cache;
CREATE TABLE home_summary_cache AS
SELECT
    '2026-03-16' AS latestDate,
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
    'Hay sobreoferta proyectada de espárrago en tu valle. La palta muestra demanda creciente de exportación a EE.UU.' AS recommendationMessage;

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
SELECT * FROM (
    VALUES
        ('Uva', 6.10, 2.8, 'up'),
        ('Espárrago', 3.40, 4.2, 'down'),
        ('Palta', 7.80, 5.1, 'up'),
        ('Cebolla', 1.25, 1.4, 'down'),
        ('Ajo', 6.40, 3.5, 'up'),
        ('Limón', 4.80, 12.4, 'up'),
        ('Arándano', 14.50, 1.8, 'down'),
        ('Mandarina', 2.30, 6.2, 'up'),
        ('Mango Kent', 3.80, 4.5, 'up'),
        ('Cebolla Roja', 1.85, 8.2, 'down'),
        ('Granada', 5.60, 2.1, 'up'),
        ('Ají Amarillo', 4.10, 3.9, 'down')
) AS t(nombre, pricePen, deltaPct, deltaDirection);

DROP TABLE IF EXISTS home_upcoming_tasks_cache;
CREATE TABLE home_upcoming_tasks_cache AS
SELECT * FROM (
    VALUES
        ('Aplicar fertilizante NPK', 'Hoy · Parcela Norte', 'high'),
        ('Inspección plagas', 'Mar 18 · Parcela Sur', 'low'),
        ('Riego programado', 'Mar 20 · Parcela Oeste', 'low'),
        ('Cosecha Palta Hass', 'Mar 22 · Parcela Oeste', 'high')
) AS t(title, scheduleLabel, severity);

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

DROP TABLE IF EXISTS sunat_overview_cache;
CREATE TABLE sunat_overview_cache AS
SELECT
    '2026-05-18' AS latestDate,
    245 AS totalRecords,
    12 AS productCount,
    8 AS destinationCount,
    248500.75 AS totalUsd,
    90210.55 AS totalNetWeightKg,
    2.7541 AS averageUsdPerKg;

DROP TABLE IF EXISTS sunat_top_products_cache;
CREATE TABLE sunat_top_products_cache AS
SELECT * FROM (
    VALUES
        ('uva-red-globe', 'Uva Red Globe', 'Fruta fresca', 94210.20, 30210.00, 3.1180, 22),
        ('palta-hass', 'Palta Hass', 'Fruta fresca', 80115.35, 25100.12, 3.1918, 19),
        ('mango-kent', 'Mango Kent', 'Fruta fresca', 74175.20, 34900.43, 2.1253, 17)
) AS t(productoKey, productoNombre, categoriaProducto, totalUsd, totalNetWeightKg, averageUsdPerKg, operationCount);

DROP TABLE IF EXISTS sunat_top_destinations_cache;
CREATE TABLE sunat_top_destinations_cache AS
SELECT * FROM (
    VALUES
        ('US', 'Estados Unidos', 130250.55, 42110.12, 31),
        ('ES', 'Espana', 68210.10, 24400.33, 17),
        ('NL', 'Paises Bajos', 50040.10, 23700.10, 10)
) AS t(destinoCodigo, destinoNombre, totalUsd, totalNetWeightKg, operationCount);

DROP TABLE IF EXISTS sunat_product_trend_cache;
CREATE TABLE sunat_product_trend_cache AS
SELECT * FROM (
    VALUES
        ('uva-red-globe', '2026-03-01', 18210.20, 6020.00, 3.0240, 5),
        ('uva-red-globe', '2026-04-01', 35210.00, 11020.00, 3.1940, 8),
        ('uva-red-globe', '2026-05-01', 40800.00, 13170.00, 3.0980, 9),
        ('palta-hass', '2026-03-01', 21100.00, 7000.00, 3.0140, 4),
        ('palta-hass', '2026-04-01', 26100.12, 8200.12, 3.1820, 7),
        ('palta-hass', '2026-05-01', 32915.23, 9900.00, 3.3790, 8)
) AS t(productoKey, fecha, totalUsd, totalNetWeightKg, averageUsdPerKg, operationCount);

DROP TABLE IF EXISTS midagri_exportaciones_overview_cache;
CREATE TABLE midagri_exportaciones_overview_cache AS
SELECT
    '2026-05-01' AS latestDate,
    320 AS totalRecords,
    24 AS productCount,
    1488200.40 AS totalUsd,
    5120.25 AS totalNetWeightTon,
    290.65 AS averageUsdPerTon;

DROP TABLE IF EXISTS midagri_exportaciones_top_products_cache;
CREATE TABLE midagri_exportaciones_top_products_cache AS
SELECT * FROM (
    VALUES
        ('0806100000', '0806100000', 'Uvas frescas', 412500.22, 1320.10, 312.47, 18),
        ('0804400000', '0804400000', 'Paltas frescas', 358410.10, 1112.44, 322.18, 16),
        ('0804502000', '0804502000', 'Mangos frescos', 305800.55, 1230.90, 248.43, 14)
) AS t(productoKey, subpartidaNacional, productoNombre, totalUsd, totalNetWeightTon, averageUsdPerTon, recordCount);

DROP TABLE IF EXISTS midagri_exportaciones_trend_cache;
CREATE TABLE midagri_exportaciones_trend_cache AS
SELECT * FROM (
    VALUES
        ('0806100000', '2026-03-01', '0806100000', 'Uvas frescas', 120100.10, 400.20, 300.08, 6),
        ('0806100000', '2026-04-01', '0806100000', 'Uvas frescas', 140200.12, 450.00, 311.56, 6),
        ('0806100000', '2026-05-01', '0806100000', 'Uvas frescas', 152200.00, 469.90, 323.89, 6),
        ('0804400000', '2026-03-01', '0804400000', 'Paltas frescas', 101000.00, 320.50, 315.13, 5),
        ('0804400000', '2026-04-01', '0804400000', 'Paltas frescas', 118100.10, 370.44, 318.80, 5),
        ('0804400000', '2026-05-01', '0804400000', 'Paltas frescas', 139310.00, 421.50, 330.51, 6)
) AS t(productoKey, fecha, subpartidaNacional, productoNombre, totalUsd, totalNetWeightTon, averageUsdPerTon, recordCount);

DROP TABLE IF EXISTS midagri_importaciones_overview_cache;
CREATE TABLE midagri_importaciones_overview_cache AS
SELECT
    '2026-05-01' AS latestDate,
    280 AS totalRecords,
    20 AS productCount,
    980540.10 AS totalUsd,
    4220.75 AS totalNetWeightTon,
    232.31 AS averageUsdPerTon;

DROP TABLE IF EXISTS midagri_importaciones_top_products_cache;
CREATE TABLE midagri_importaciones_top_products_cache AS
SELECT * FROM (
    VALUES
        ('1005901100', '1005901100', 'Maiz amarillo duro', 280200.25, 1650.10, 169.81, 21),
        ('2304000000', '2304000000', 'Torta de soya', 240150.80, 1210.20, 198.44, 18),
        ('3102100000', '3102100000', 'Urea', 190500.55, 800.12, 238.09, 16)
) AS t(productoKey, subpartidaNacional, productoNombre, totalUsd, totalNetWeightTon, averageUsdPerTon, recordCount);

DROP TABLE IF EXISTS midagri_importaciones_trend_cache;
CREATE TABLE midagri_importaciones_trend_cache AS
SELECT * FROM (
    VALUES
        ('1005901100', '2026-03-01', '1005901100', 'Maiz amarillo duro', 82000.00, 500.00, 164.00, 7),
        ('1005901100', '2026-04-01', '1005901100', 'Maiz amarillo duro', 94000.12, 550.10, 170.88, 7),
        ('1005901100', '2026-05-01', '1005901100', 'Maiz amarillo duro', 104200.13, 600.00, 173.67, 7),
        ('2304000000', '2026-03-01', '2304000000', 'Torta de soya', 73000.00, 380.00, 192.11, 6),
        ('2304000000', '2026-04-01', '2304000000', 'Torta de soya', 81000.40, 410.10, 197.51, 6),
        ('2304000000', '2026-05-01', '2304000000', 'Torta de soya', 86150.40, 420.10, 205.07, 6)
) AS t(productoKey, fecha, subpartidaNacional, productoNombre, totalUsd, totalNetWeightTon, averageUsdPerTon, recordCount);

CHECKPOINT;
