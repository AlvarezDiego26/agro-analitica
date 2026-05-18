import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  API_PREFIX: z.string().default("/api"),
  DUCKDB_DATABASE_PATH: z.string().optional(),
  DUCKDB_INIT_SQL_PATH: z.string().optional()
});

export type Env = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  apiPrefix: string;
  duckdb: {
    databasePath: string;
    initSqlPath: string;
    runtimeDir: string;
  };
};

let cachedEnv: Env | null = null;

export function loadEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.parse(process.env);
  const runtimeDir = path.resolve(process.cwd(), "../db/duckdb/runtime");

  cachedEnv = {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    apiPrefix: parsed.API_PREFIX,
    duckdb: {
      databasePath: parsed.DUCKDB_DATABASE_PATH ?? path.join(runtimeDir, "data", "agro.duckdb"),
      initSqlPath: parsed.DUCKDB_INIT_SQL_PATH ?? path.join(runtimeDir, "sql", "00-node-backend-init.sql"),
      runtimeDir
    }
  };

  return cachedEnv;
}
