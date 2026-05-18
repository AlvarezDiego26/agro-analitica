-- Reemplazar {{limit}} por el valor real antes de ejecutar si hace falta.

SELECT
  producto_key AS productoKey,
  producto_nombre_catalogo AS productoNombre,
  categoria_producto AS categoriaProducto,
  ROUND(SUM(valor_fob_usd), 2) AS totalUsd,
  ROUND(SUM(peso_neto_kg), 2) AS totalNetWeightKg,
  ROUND(AVG(precio_fob_usd_por_kg), 4) AS averageUsdPerKg,
  COUNT(*) AS operationCount
FROM sunat_exportaciones_filtradas
WHERE fecha IS NOT NULL
  AND producto_key IS NOT NULL
GROUP BY producto_key, producto_nombre_catalogo, categoria_producto
ORDER BY totalUsd DESC
LIMIT {{limit}};
