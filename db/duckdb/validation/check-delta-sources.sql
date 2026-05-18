LOAD delta;
LOAD httpfs;

SELECT COUNT(*) AS total_precios
FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/');

SELECT COUNT(*) AS total_volumen
FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/');

SELECT COUNT(*) AS total_exportaciones
FROM delta_scan('s3://agro-productos/Landing/sunat/exportaciones_filtradas/');
