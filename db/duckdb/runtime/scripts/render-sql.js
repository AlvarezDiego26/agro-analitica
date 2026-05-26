const fs = require("fs");

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error("Uso: node render-sql.js <entrada.sql> <salida.sql>");
  process.exit(1);
}

const requiredEnv = [
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_ENDPOINT",
  "MINIO_REGION",
];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Faltan variables requeridas: ${missing.join(", ")}`);
  process.exit(1);
}

const escapeSqlString = (value) => value.replace(/'/g, "''");

const replacements = {
  "{minio_access_key}": escapeSqlString(process.env.MINIO_ACCESS_KEY),
  "{minio_secret_key}": escapeSqlString(process.env.MINIO_SECRET_KEY),
  "{duckdb_minio_endpoint}": escapeSqlString(process.env.MINIO_ENDPOINT),
  "{minio_region}": escapeSqlString(process.env.MINIO_REGION),
  "{sisap_precios_parquet_glob}": escapeSqlString(
    process.env.SISAP_PRECIOS_PARQUET_GLOB ??
      "s3://agro-productos/Landing/sisap/precios_diarios_mercado_lima/fecha_particion=2024-11-30/part-*.parquet"
  ),
  "{sisap_volumen_parquet_glob}": escapeSqlString(
    process.env.SISAP_VOLUMEN_PARQUET_GLOB ??
      "s3://agro-productos/Landing/sisap/volumen_diario_mercado_lima/fecha_particion=2025-05-31/part-*.parquet"
  ),
};

let sql = fs.readFileSync(inputPath, "utf8");

for (const [placeholder, value] of Object.entries(replacements)) {
  sql = sql.split(placeholder).join(value);
}

fs.writeFileSync(outputPath, sql);
