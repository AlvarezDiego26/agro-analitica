SELECT
  CAST(MAX(p.fecha) AS VARCHAR) AS latestDate,
  COUNT(*) AS analyzedRows,
  COUNT(DISTINCT p.producto_nombre) AS productCount,
  COUNT(DISTINCT p.procedencia) AS originCount,
  ROUND(AVG(p.precio_prom), 2) AS overallAverage,
  (
    SELECT ROUND(SUM(v.volumen_ton), 2)
    FROM sisap_volumen_diario_mercado_lima v
    WHERE v.volumen_ton IS NOT NULL
      AND v.fecha >= current_date - INTERVAL 30 DAY
  ) AS totalVolumeTon,
  (
    SELECT ROUND(AVG(v.volumen_ton), 2)
    FROM sisap_volumen_diario_mercado_lima v
    WHERE v.volumen_ton IS NOT NULL
      AND v.fecha >= current_date - INTERVAL 30 DAY
  ) AS averageVolumeTon
FROM sisap_precios_diarios_mercado_lima p
WHERE p.precio_prom IS NOT NULL
  AND p.fecha >= current_date - INTERVAL 30 DAY;
