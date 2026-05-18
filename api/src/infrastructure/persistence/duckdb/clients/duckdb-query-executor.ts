import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import { readFile } from "node:fs/promises";
import { loadEnv } from "../../../config/env.js";

export class DuckDbQueryExecutor {
  private readonly env = loadEnv();
  private static instancePromise: Promise<DuckDBInstance> | null = null;
  private static connectionPromise: Promise<DuckDBConnection> | null = null;
  private static initialized = false;
  private executionQueue: Promise<void> = Promise.resolve();

  async execute<T>(sql: string): Promise<T[]> {
    return this.runSerialized(async () => {
      const connection = await this.getConnection();
      const reader = await connection.runAndReadAll(sql);
      return reader.getRowObjectsJson() as T[];
    });
  }

  private async runSerialized<T>(work: () => Promise<T>): Promise<T> {
    const previous = this.executionQueue;
    let release!: () => void;
    this.executionQueue = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;

    try {
      return await work();
    } finally {
      release();
    }
  }

  private async getConnection(): Promise<DuckDBConnection> {
    if (!DuckDbQueryExecutor.connectionPromise) {
      DuckDbQueryExecutor.connectionPromise = this.createConnection();
    }

    const connection = await DuckDbQueryExecutor.connectionPromise;

    if (!DuckDbQueryExecutor.initialized) {
      await this.initializeConnection(connection);
      DuckDbQueryExecutor.initialized = true;
    }

    return connection;
  }

  private async createConnection(): Promise<DuckDBConnection> {
    if (!DuckDbQueryExecutor.instancePromise) {
      DuckDbQueryExecutor.instancePromise = DuckDBInstance.create(this.env.duckdb.databasePath, {
        threads: "2",
        access_mode: "READ_ONLY"
      });
    }

    const instance = await DuckDbQueryExecutor.instancePromise;
    return instance.connect();
  }

  private async initializeConnection(connection: DuckDBConnection): Promise<void> {
    const initSql = await readFile(this.env.duckdb.initSqlPath, "utf8");
    const statements = initSql
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    for (const statement of statements) {
      await connection.run(statement);
    }
  }
}
