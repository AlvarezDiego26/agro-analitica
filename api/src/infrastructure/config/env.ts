import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  API_PREFIX: z.string().default("/api"),
  DUCKDB_DATABASE_PATH: z.string().optional(),
  DUCKDB_INIT_SQL_PATH: z.string().optional(),
  DUCKDB_ACCESS_MODE: z.enum(["READ_ONLY", "READ_WRITE"]).default("READ_ONLY"),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  AUTH_SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30)
});

export type Env = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  apiPrefix: string;
  duckdb: {
    databasePath: string;
    initSqlPath: string;
    runtimeDir: string;
    accessMode: "READ_ONLY" | "READ_WRITE";
  };
  supabase: {
    url: string | null;
    serviceRoleKey: string | null;
  };
  auth: {
    sessionTtlDays: number;
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
      runtimeDir,
      accessMode: parsed.DUCKDB_ACCESS_MODE
    },
    supabase: {
      url: parsed.SUPABASE_URL ?? null,
      serviceRoleKey: parsed.SUPABASE_SECRET_KEY ?? parsed.SUPABASE_SERVICE_ROLE_KEY ?? null
    },
    auth: {
      sessionTtlDays: parsed.AUTH_SESSION_TTL_DAYS
    }
  };

  return cachedEnv;
}
