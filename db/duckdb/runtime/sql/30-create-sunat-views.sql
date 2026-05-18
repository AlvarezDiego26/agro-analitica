CREATE OR REPLACE VIEW sunat_exportaciones_filtradas AS
SELECT *
FROM delta_scan('s3://agro-productos/Landing/sunat/exportaciones_filtradas/');
