SELECT
  CAST(MAX(fecha) AS VARCHAR) AS latestDate,
  COUNT(*) AS totalRecords,
  COUNT(DISTINCT producto_key) AS productCount,
  COUNT(DISTINCT codigo_pais_destino) AS destinationCount,
  ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
  ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
  ROUND(AVG(precio_fob_usd_por_kg), 4) AS averageUsdPerKg
FROM sunat_exportaciones_filtradas
WHERE fecha IS NOT NULL;
