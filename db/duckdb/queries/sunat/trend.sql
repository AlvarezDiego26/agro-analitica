-- Reemplazar {{producto_key}} y {{limit}} por los valores reales antes de ejecutar.

SELECT
  CAST(fecha AS VARCHAR) AS fecha,
  ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
  ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
  ROUND(AVG(precio_fob_usd_por_kg), 4) AS averageUsdPerKg,
  COUNT(*) AS operationCount
FROM sunat_exportaciones_filtradas
WHERE fecha IS NOT NULL
  AND LOWER(producto_key) = LOWER('{{producto_key}}')
GROUP BY fecha
ORDER BY fecha DESC
LIMIT {{limit}};
