SET threads = 1;

DROP TABLE IF EXISTS dashboard_overview_cache;
CREATE TABLE dashboard_overview_cache AS
SELECT
    NULL::VARCHAR AS latestDate,
    0::INTEGER AS analyzedRows,
    0::INTEGER AS productCount,
    0::INTEGER AS originCount,
    NULL::DOUBLE AS overallAverage,
    NULL::DOUBLE AS totalVolumeTon,
    NULL::DOUBLE AS averageVolumeTon;

DROP TABLE IF EXISTS dashboard_trend_cache;
CREATE TABLE dashboard_trend_cache AS
SELECT NULL::VARCHAR AS fecha, NULL::DOUBLE AS averagePrice WHERE false;

DROP TABLE IF EXISTS sisap_product_trend_cache;
CREATE TABLE sisap_product_trend_cache AS
SELECT
    NULL::VARCHAR AS productoNombre,
    NULL::VARCHAR AS fecha,
    NULL::DOUBLE AS averagePrice,   
    NULL::DOUBLE AS totalVolumeTon
WHERE false;

DROP TABLE IF EXISTS dashboard_top_products_cache;
CREATE TABLE dashboard_top_products_cache AS
SELECT
    NULL::VARCHAR AS productoNombre,
    NULL::DOUBLE AS averagePrice,
    NULL::DOUBLE AS minPrice,
    NULL::DOUBLE AS maxPrice,
    0::INTEGER AS recordCount,
    NULL::DOUBLE AS totalVolumeTon
WHERE false;

DROP TABLE IF EXISTS sunat_overview_cache;
CREATE TABLE sunat_overview_cache AS
SELECT
    NULL::VARCHAR AS latestDate,
    0::INTEGER AS totalRecords,
    0::INTEGER AS productCount,
    0::INTEGER AS destinationCount,
    NULL::DOUBLE AS totalUsd,
    NULL::DOUBLE AS totalNetWeightKg,
    NULL::DOUBLE AS averageUsdPerKg;

DROP TABLE IF EXISTS sunat_top_products_cache;
CREATE TABLE sunat_top_products_cache AS
SELECT
    NULL::VARCHAR AS productoKey,
    NULL::VARCHAR AS productoNombre,
    NULL::VARCHAR AS categoriaProducto,
    NULL::DOUBLE AS totalUsd,
    NULL::DOUBLE AS totalNetWeightKg,
    NULL::DOUBLE AS averageUsdPerKg,
    0::INTEGER AS operationCount
WHERE false;

DROP TABLE IF EXISTS sunat_top_destinations_cache;
CREATE TABLE sunat_top_destinations_cache AS
SELECT
    NULL::VARCHAR AS destinoCodigo,
    NULL::VARCHAR AS destinoNombre,
    NULL::DOUBLE AS totalUsd,
    NULL::DOUBLE AS totalNetWeightKg,
    0::INTEGER AS operationCount
WHERE false;

DROP TABLE IF EXISTS planner_product_cache;
CREATE TABLE planner_product_cache AS
SELECT
    NULL::VARCHAR AS producto_key,
    NULL::VARCHAR AS productoNombre,
    NULL::DOUBLE AS averagePrice,
    NULL::DOUBLE AS latestPrice,
    NULL::DOUBLE AS minPrice,
    NULL::DOUBLE AS maxPrice,
    NULL::DOUBLE AS averageVolumeTon,
    0::INTEGER AS records,
    NULL::VARCHAR AS latestDate,
    NULL::DOUBLE AS estimatedRoi,
    NULL::VARCHAR AS riskLevel,
    NULL::VARCHAR AS title,
    NULL::VARCHAR AS summary,
    NULL::VARCHAR AS explanation,
    NULL::VARCHAR AS region
WHERE false;

DROP TABLE IF EXISTS planner_price_projection_cache;
CREATE TABLE planner_price_projection_cache AS
SELECT
    NULL::VARCHAR AS producto_key,
    NULL::VARCHAR AS monthLabel,
    NULL::DOUBLE AS historicalPrice,
    NULL::DOUBLE AS predictedPrice,
    false AS oversupplyZone,
    false AS isLowPoint,
    NULL::DOUBLE AS predictedVolumeTon
WHERE false;

DROP TABLE IF EXISTS planner_recommended_alternatives_cache;
CREATE TABLE planner_recommended_alternatives_cache AS
SELECT
    NULL::VARCHAR AS source_producto_key,
    NULL::VARCHAR AS producto_key,
    NULL::VARCHAR AS productoNombre,
    NULL::DOUBLE AS estimatedRoi,
    NULL::VARCHAR AS riskLevel,
    NULL::VARCHAR AS riskLabel,
    NULL::DOUBLE AS projectedPricePen,
    NULL::VARCHAR AS message
WHERE false;

DROP TABLE IF EXISTS home_summary_cache;
CREATE TABLE home_summary_cache AS
SELECT
    NULL::VARCHAR AS latestDate,
    '' AS location,
    'Sin snapshot publicado' AS alertTitle,
    'El snapshot DuckDB no contiene datos porque el refresh desde MinIO no termino correctamente.' AS alertMessage,
    'medium' AS alertSeverity,
    0.0 AS activeHectares,
    0 AS parcelCount,
    0.0 AS projectedIncomePen,
    0.0 AS projectedIncomeDeltaPct,
    'Sin datos' AS portfolioRiskTitle,
    0 AS activeAlertCount,
    'Esperando refresh de DuckDB' AS recommendationTitle,
    0.0 AS recommendationRoiPct,
    'Sin datos' AS recommendationRiskLabel,
    'Ejecuta el refresh cuando MinIO este disponible para publicar datos reales.' AS recommendationMessage;

DROP TABLE IF EXISTS home_featured_campaigns_cache;
CREATE TABLE home_featured_campaigns_cache AS
SELECT
    NULL::VARCHAR AS nombre,
    NULL::VARCHAR AS codeLabel,
    NULL::VARCHAR AS riskLabel,
    NULL::VARCHAR AS riskLevel,
    NULL::VARCHAR AS stageLabel,
    NULL::VARCHAR AS harvestWindowLabel,
    NULL::DOUBLE AS progressPct,
    NULL::DOUBLE AS projectedPricePen,
    NULL::DOUBLE AS deltaPct,
    NULL::VARCHAR AS deltaDirection
WHERE false;

DROP TABLE IF EXISTS home_price_cards_cache;
CREATE TABLE home_price_cards_cache AS
SELECT
    NULL::VARCHAR AS nombre,
    NULL::DOUBLE AS pricePen,
    NULL::DOUBLE AS deltaPct,
    NULL::VARCHAR AS deltaDirection
WHERE false;

DROP TABLE IF EXISTS home_upcoming_tasks_cache;
CREATE TABLE home_upcoming_tasks_cache AS
SELECT NULL::VARCHAR AS title, NULL::VARCHAR AS scheduleLabel, NULL::VARCHAR AS severity WHERE false;

DROP TABLE IF EXISTS market_buyer_matches_cache;
CREATE TABLE market_buyer_matches_cache AS
SELECT
    NULL::VARCHAR AS initials,
    NULL::VARCHAR AS buyerName,
    false AS verified,
    NULL::VARCHAR AS buyerType,
    NULL::VARCHAR AS productoNombre,
    NULL::VARCHAR AS volumeLabel,
    NULL::VARCHAR AS deliveryLabel,
    NULL::DOUBLE AS offeredPricePen,
    NULL::DOUBLE AS matchScorePct
WHERE false;

DROP TABLE IF EXISTS home_weather_forecast_cache;
CREATE TABLE home_weather_forecast_cache AS
SELECT NULL::VARCHAR AS dayLabel, NULL::VARCHAR AS conditionCode, NULL::INTEGER AS temperatureC WHERE false;

DROP TABLE IF EXISTS home_regional_status_cache;
CREATE TABLE home_regional_status_cache AS
SELECT NULL::VARCHAR AS label, NULL::VARCHAR AS severity WHERE false;

DROP TABLE IF EXISTS farm_profile_cache;
CREATE TABLE farm_profile_cache AS
SELECT
    NULL::VARCHAR AS farmName,
    NULL::VARCHAR AS location,
    NULL::DOUBLE AS totalHectares,
    0::INTEGER AS parcelCount,
    0::INTEGER AS activeCampaigns,
    NULL::DOUBLE AS averageRoiPct,
    0::INTEGER AS highlightedCertificationsCount,
    NULL::VARCHAR AS highlightedCertificationsLabel,
    NULL::VARCHAR AS producerName,
    false AS producerVerified,
    0::INTEGER AS producerYears,
    0::INTEGER AS closedCampaigns,
    NULL::DOUBLE AS historicalRoiPct,
    NULL::DOUBLE AS buyerRating
WHERE false;

DROP TABLE IF EXISTS farm_parcels_cache;
CREATE TABLE farm_parcels_cache AS
SELECT
    NULL::VARCHAR AS parcelName,
    NULL::VARCHAR AS cropStageLabel,
    NULL::DOUBLE AS hectares,
    NULL::VARCHAR AS riskLabel,
    NULL::VARCHAR AS riskLevel,
    NULL::DOUBLE AS progressPct
WHERE false;

DROP TABLE IF EXISTS farm_campaign_history_cache;
CREATE TABLE farm_campaign_history_cache AS
SELECT
    NULL::VARCHAR AS campaignYear,
    NULL::VARCHAR AS productoNombre,
    NULL::VARCHAR AS parcelName,
    NULL::VARCHAR AS yieldLabel,
    NULL::VARCHAR AS priceLabel,
    NULL::VARCHAR AS incomeLabel,
    NULL::VARCHAR AS roiLabel,
    NULL::VARCHAR AS roiType
WHERE false;

DROP TABLE IF EXISTS farm_certifications_cache;
CREATE TABLE farm_certifications_cache AS
SELECT NULL::VARCHAR AS certificationName, NULL::VARCHAR AS expiryLabel, NULL::VARCHAR AS severity WHERE false;
