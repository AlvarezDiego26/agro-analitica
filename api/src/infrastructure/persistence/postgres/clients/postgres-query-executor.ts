import { Pool } from "pg";
import { loadEnv } from "../../../config/env.js";

export class PostgresQueryExecutor {
  private readonly env = loadEnv();
  private static pool: Pool | null = null;

  async execute<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const pool = this.getPool();
    const result = await pool.query(sql, params);
    return result.rows as T[];
  }

  private getPool(): Pool {
    if (!PostgresQueryExecutor.pool) {
      if (!this.env.postgres.connectionString) {
        throw new Error("POSTGRES_URL no esta configurado.");
      }

      PostgresQueryExecutor.pool = new Pool({
        connectionString: this.env.postgres.connectionString,
        ssl: this.env.postgres.ssl ? { rejectUnauthorized: false } : false
      });
    }

    return PostgresQueryExecutor.pool;
  }
}
