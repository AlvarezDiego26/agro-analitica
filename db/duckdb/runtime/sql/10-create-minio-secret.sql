-- Estos valores corresponden al archivo .env del runtime:
-- MINIO_ACCESS_KEY -> KEY_ID
-- MINIO_SECRET_KEY -> SECRET
-- MINIO_ENDPOINT   -> ENDPOINT
-- MINIO_REGION     -> REGION

CREATE OR REPLACE SECRET minio_secret (
    TYPE S3,
    KEY_ID 'oX3JYQssZtFM5rGC0xhK',
    SECRET 'xYsQ0Ty3CIAVmqfn7Uaob123uKN13gxQUviY5mSl',
    ENDPOINT '38.210.246.165:30090',
    URL_STYLE 'path',
    USE_SSL false,
    REGION 'us-east-1'
);

SELECT * FROM duckdb_secrets();
