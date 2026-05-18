import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  API_PREFIX: z.string().default("/api"),
  DATA_SOURCE: z.enum(["duckdb", "postgres"]).default("duckdb"),
  DUCKDB_DATABASE_PATH: z.string().optional(),
  DUCKDB_INIT_SQL_PATH: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  POSTGRES_SCHEMA: z.string().default("serving"),
  POSTGRES_SSL: z
    .string()
    .optional()
    .transform((value) => value === "true")
});

export type Env = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  apiPrefix: string;
  dataSource: "duckdb" | "postgres";
  duckdb: {
    databasePath: string;
    initSqlPath: string;
    runtimeDir: string;
  };
  postgres: {
    connectionString: string | null;
    schema: string;
    ssl: boolean;
  };
};

let cachedEnv: Env | null = null;

export function loadEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.parse(process.env);
  const runtimeDir = path.resolve(process.cwd(), "../db/duckdb/runtime");
  const postgresSchema = validateSchemaName(parsed.POSTGRES_SCHEMA);

  cachedEnv = {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    apiPrefix: parsed.API_PREFIX,
    dataSource: parsed.DATA_SOURCE,
    duckdb: {
      databasePath: parsed.DUCKDB_DATABASE_PATH ?? path.join(runtimeDir, "data", "agro.duckdb"),
      initSqlPath: parsed.DUCKDB_INIT_SQL_PATH ?? path.join(runtimeDir, "sql", "00-node-backend-init.sql"),
      runtimeDir
    },
    postgres: {
      connectionString: parsed.POSTGRES_URL ?? null,
      schema: postgresSchema,
      ssl: parsed.POSTGRES_SSL
    }
  };

  if (cachedEnv.dataSource === "postgres" && !cachedEnv.postgres.connectionString) {
    throw new Error("POSTGRES_URL es obligatorio cuando DATA_SOURCE=postgres.");
  }

  return cachedEnv;
}

function validateSchemaName(value: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`POSTGRES_SCHEMA invalido: ${value}`);
  }

  return value;
}
