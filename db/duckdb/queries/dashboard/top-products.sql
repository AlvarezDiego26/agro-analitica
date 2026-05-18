WITH volumen_por_producto AS (
  SELECT
    LOWER(v.producto_nombre) AS producto_key,
    ROUND(SUM(v.volumen_ton), 2) AS totalVolumeTon
  FROM sisap_volumen_diario_mercado_lima v
  WHERE v.volumen_ton IS NOT NULL
    AND v.fecha >= current_date - INTERVAL 30 DAY
  GROUP BY LOWER(v.producto_nombre)
)
SELECT
  p.producto_nombre AS productoNombre,
  ROUND(AVG(p.precio_prom), 2) AS averagePrice,
  ROUND(MIN(p.precio_prom), 2) AS minPrice,
  ROUND(MAX(p.precio_prom), 2) AS maxPrice,
  COUNT(*) AS recordCount,
  COALESCE(v.totalVolumeTon, 0) AS totalVolumeTon
FROM sisap_precios_diarios_mercado_lima p
LEFT JOIN volumen_por_producto v
  ON v.producto_key = LOWER(p.producto_nombre)
WHERE p.precio_prom IS NOT NULL
  AND p.fecha >= current_date - INTERVAL 30 DAY
GROUP BY p.producto_nombre, v.totalVolumeTon
ORDER BY averagePrice DESC
LIMIT 5;
