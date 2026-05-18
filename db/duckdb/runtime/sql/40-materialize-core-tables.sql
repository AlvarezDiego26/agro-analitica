INSTALL delta;
LOAD delta;

INSTALL httpfs;
LOAD httpfs;

CREATE OR REPLACE SECRET minio_secret (
    TYPE S3,
    KEY_ID 'oX3JYQssZtFM5rGC0xhK',
    SECRET 'xYsQ0Ty3CIAVmqfn7Uaob123uKN13gxQUviY5mSl',
    ENDPOINT '38.210.246.165:30090',
    URL_STYLE 'path',
    USE_SSL false,
    REGION 'us-east-1'
);

DROP VIEW IF EXISTS sisap_precios_diarios_mercado_lima;
DROP VIEW IF EXISTS sisap_volumen_diario_mercado_lima;
DROP VIEW IF EXISTS sunat_exportaciones_filtradas;

DROP TABLE IF EXISTS sisap_precios_diarios_mercado_lima;
DROP TABLE IF EXISTS sisap_volumen_diario_mercado_lima;
DROP TABLE IF EXISTS sunat_exportaciones_filtradas;

CREATE TABLE sisap_precios_diarios_mercado_lima AS
SELECT *
FROM delta_scan('s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/');

CREATE TABLE sisap_volumen_diario_mercado_lima AS
SELECT *
FROM delta_scan('s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/');

CREATE TABLE sunat_exportaciones_filtradas AS
SELECT *
FROM delta_scan('s3://agro-productos/Landing/sunat/exportaciones_filtradas/');
