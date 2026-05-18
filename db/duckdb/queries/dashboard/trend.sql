SELECT
  CAST(p.fecha AS VARCHAR) AS fecha,
  ROUND(AVG(p.precio_prom), 2) AS averagePrice
FROM sisap_precios_diarios_mercado_lima p
WHERE p.precio_prom IS NOT NULL
  AND p.fecha >= current_date - INTERVAL 30 DAY
GROUP BY p.fecha
ORDER BY p.fecha DESC
LIMIT 10;
