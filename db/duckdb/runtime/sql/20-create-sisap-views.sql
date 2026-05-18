CREATE OR REPLACE VIEW sisap_precios_diarios_mercado_lima AS
SELECT *
FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/');

CREATE OR REPLACE VIEW sisap_volumen_diario_mercado_lima AS
SELECT *
FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/');
