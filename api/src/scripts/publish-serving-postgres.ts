import { DuckDBInstance } from "@duckdb/node-api";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

dotenv.config();

const projectRoot = path.resolve(process.cwd(), "..");
const snapshotPath =
  process.env.DUCKDB_DATABASE_PATH ??
  path.join(projectRoot, "db", "duckdb", "runtime", "data", "agro_api_snapshot.duckdb");
const postgresUrl = process.env.POSTGRES_URL;
const postgresSchema = process.env.POSTGRES_SCHEMA ?? "serving";
const postgresSsl = process.env.POSTGRES_SSL === "true";
const migrationPath = path.join(projectRoot, "db", "migrations", "20260518_01_create_serving_schema.sql");

if (!postgresUrl) {
  throw new Error("POSTGRES_URL es obligatorio para publicar serving a PostgreSQL.");
}

const servingExports: Array<{ tableName: string; query: string }> = [
  {
    tableName: "dashboard_overview",
    query: `
      SELECT
        CAST(latestDate AS DATE) AS latest_date,
        CAST(analyzedRows AS BIGINT) AS analyzed_rows,
        CAST(productCount AS BIGINT) AS product_count,
        CAST(originCount AS BIGINT) AS origin_count,
        CAST(overallAverage AS DOUBLE) AS overall_average,
        CAST(totalVolumeTon AS DOUBLE) AS total_volume_ton,
        CAST(averageVolumeTon AS DOUBLE) AS average_volume_ton
      FROM dashboard_overview_cache
    `
  },
  {
    tableName: "dashboard_trend",
    query: `
      SELECT
        CAST(fecha AS DATE) AS fecha,
        CAST(averagePrice AS DOUBLE) AS average_price
      FROM dashboard_trend_cache
    `
  },
  {
    tableName: "dashboard_top_products",
    query: `
      SELECT
        productoNombre AS producto_nombre,
        CAST(averagePrice AS DOUBLE) AS average_price,
        CAST(minPrice AS DOUBLE) AS min_price,
        CAST(maxPrice AS DOUBLE) AS max_price,
        CAST(recordCount AS BIGINT) AS record_count,
        CAST(totalVolumeTon AS DOUBLE) AS total_volume_ton
      FROM dashboard_top_products_cache
    `
  },
  {
    tableName: "planner_product_analysis",
    query: `
      SELECT
        producto_key,
        productoNombre AS producto_nombre,
        CAST(averagePrice AS DOUBLE) AS average_price,
        CAST(latestPrice AS DOUBLE) AS latest_price,
        CAST(minPrice AS DOUBLE) AS min_price,
        CAST(maxPrice AS DOUBLE) AS max_price,
        CAST(latestDate AS DATE) AS latest_date,
        CAST(records AS BIGINT) AS records,
        CAST(averageVolumeTon AS DOUBLE) AS average_volume_ton
      FROM planner_product_cache
    `
  },
  {
    tableName: "sunat_overview",
    query: `
      SELECT
        CAST(latestDate AS DATE) AS latest_date,
        CAST(totalRecords AS BIGINT) AS total_records,
        CAST(productCount AS BIGINT) AS product_count,
        CAST(destinationCount AS BIGINT) AS destination_count,
        CAST(totalUsd AS DOUBLE) AS total_usd,
        CAST(totalNetWeightKg AS DOUBLE) AS total_net_weight_kg,
        CAST(averageUsdPerKg AS DOUBLE) AS average_usd_per_kg
      FROM sunat_overview_cache
    `
  },
  {
    tableName: "sunat_top_products",
    query: `
      SELECT
        productoKey AS producto_key,
        productoNombre AS producto_nombre,
        categoriaProducto AS categoria_producto,
        CAST(totalUsd AS DOUBLE) AS total_usd,
        CAST(totalNetWeightKg AS DOUBLE) AS total_net_weight_kg,
        CAST(averageUsdPerKg AS DOUBLE) AS average_usd_per_kg,
        CAST(operationCount AS BIGINT) AS operation_count
      FROM sunat_top_products_cache
    `
  },
  {
    tableName: "sunat_top_destinations",
    query: `
      SELECT
        destinoCodigo AS destino_codigo,
        destinoNombre AS destino_nombre,
        CAST(totalUsd AS DOUBLE) AS total_usd,
        CAST(totalNetWeightKg AS DOUBLE) AS total_net_weight_kg,
        CAST(operationCount AS BIGINT) AS operation_count
      FROM sunat_top_destinations_cache
    `
  },
  {
    tableName: "sunat_product_trend",
    query: `
      SELECT
        productoKey AS producto_key,
        CAST(fecha AS DATE) AS fecha,
        CAST(totalUsd AS DOUBLE) AS total_usd,
        CAST(totalNetWeightKg AS DOUBLE) AS total_net_weight_kg,
        CAST(averageUsdPerKg AS DOUBLE) AS average_usd_per_kg,
        CAST(operationCount AS BIGINT) AS operation_count
      FROM sunat_product_trend_cache
    `
  }
];

async function main(): Promise<void> {
  const instance = await DuckDBInstance.create(snapshotPath, {
    access_mode: "READ_ONLY",
    threads: "1"
  });
  const connection = await instance.connect();

  const pool = new Pool({
    connectionString: postgresUrl,
    ssl: postgresSsl ? { rejectUnauthorized: false } : false
  });

  const migrationSql = await readFile(migrationPath, "utf8");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(migrationSql);

    for (const exportDefinition of servingExports) {
      const reader = await connection.runAndReadAll(exportDefinition.query);
      const rows = reader.getRows();
      const columnNames = reader.columnNames();

      await client.query(`TRUNCATE TABLE ${postgresSchema}.${exportDefinition.tableName}`);

      if (rows.length > 0) {
        const placeholders = `(${columnNames.map((_, index) => `$${index + 1}`).join(", ")})`;
        const columns = columnNames.join(", ");
        const insertSql = `INSERT INTO ${postgresSchema}.${exportDefinition.tableName} (${columns}) VALUES ${placeholders}`;

        for (const row of rows) {
          await client.query(insertSql, row as unknown[]);
        }
      }

      console.log(`[serving] ${exportDefinition.tableName}: ${rows.length} filas`);
    }

    await client.query("COMMIT");
    console.log("[serving] Publicacion completada");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[serving] Error publicando a PostgreSQL", error);
  process.exitCode = 1;
});
