-- Reemplazar {{limit}} por el valor real antes de ejecutar si hace falta.

SELECT
  codigo_pais_destino AS destinoCodigo,
  codigo_pais_destino AS destinoNombre,
  ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
  ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
  COUNT(*) AS operationCount
FROM sunat_exportaciones_filtradas
WHERE fecha IS NOT NULL
  AND codigo_pais_destino IS NOT NULL
GROUP BY codigo_pais_destino
ORDER BY totalUsd DESC
LIMIT {{limit}};
