-- Reemplazar {{producto}} por el valor real antes de ejecutar.

SELECT
  ROUND(AVG(p.precio_prom), 2) AS averagePrice,
  arg_max(p.precio_prom, p.fecha) AS latestPrice,
  ROUND(MIN(p.precio_prom), 2) AS minPrice,
  ROUND(MAX(p.precio_prom), 2) AS maxPrice,
  (
    SELECT ROUND(AVG(v.volumen_ton), 2)
    FROM sisap_volumen_diario_mercado_lima v
    WHERE v.volumen_ton IS NOT NULL
      AND v.fecha >= current_date - INTERVAL 30 DAY
      AND LOWER(v.producto_nombre) LIKE LOWER('%{{producto}}%')
  ) AS averageVolumeTon,
  COUNT(*) AS records,
  CAST(MAX(p.fecha) AS VARCHAR) AS latestDate
FROM sisap_precios_diarios_mercado_lima p
WHERE p.precio_prom IS NOT NULL
  AND p.fecha >= current_date - INTERVAL 30 DAY
  AND LOWER(p.producto_nombre) LIKE LOWER('%{{producto}}%');
