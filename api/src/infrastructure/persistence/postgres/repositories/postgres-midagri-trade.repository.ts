import type {
  MidagriTopProduct,
  MidagriTopProductsResponse,
  MidagriTradeOverviewResponse,
  MidagriTradeTrendInput,
  MidagriTradeTrendPoint,
  MidagriTradeTrendResponse
} from "../../../../domain/midagri/entities/midagri-trade.entity.js";
import type { MidagriTradeRepository } from "../../../../domain/midagri/ports/midagri-trade.repository.js";
import { loadEnv } from "../../../config/env.js";
import { PostgresQueryExecutor } from "../clients/postgres-query-executor.js";

type MidagriOverviewRow = {
  latest_date: string | null;
  total_records: number | string;
  product_count: number | string;
  total_usd: number | null;
  total_net_weight_ton: number | null;
  average_usd_per_ton: number | null;
};

type MidagriTopProductRow = {
  producto_key: string;
  subpartida_nacional: string | null;
  producto_nombre: string;
  total_usd: number | null;
  total_net_weight_ton: number | null;
  average_usd_per_ton: number | null;
  record_count: number | string;
};

type MidagriTrendRow = MidagriTopProductRow & {
  fecha: string;
};

export class PostgresMidagriTradeRepository implements MidagriTradeRepository {
  private readonly schema = loadEnv().postgres.schema;

  constructor(private readonly queryExecutor: PostgresQueryExecutor) {}

  async getExportsOverview(): Promise<MidagriTradeOverviewResponse> {
    return this.loadOverview('midagri_exports_overview', 'midagri_exports_top_products');
  }

  async getExportsTopProducts(limit = 10): Promise<MidagriTopProductsResponse> {
    return { items: await this.loadTopProducts('midagri_exports_top_products', limit) };
  }

  async getExportsTrend(input: MidagriTradeTrendInput): Promise<MidagriTradeTrendResponse> {
    return this.loadTrend('midagri_exports_trend', input);
  }

  async getImportsOverview(): Promise<MidagriTradeOverviewResponse> {
    return this.loadOverview('midagri_imports_overview', 'midagri_imports_top_products');
  }

  async getImportsTopProducts(limit = 10): Promise<MidagriTopProductsResponse> {
    return { items: await this.loadTopProducts('midagri_imports_top_products', limit) };
  }

  async getImportsTrend(input: MidagriTradeTrendInput): Promise<MidagriTradeTrendResponse> {
    return this.loadTrend('midagri_imports_trend', input);
  }

  private async loadOverview(overviewTable: string, topProductsTable: string): Promise<MidagriTradeOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<MidagriOverviewRow>(`
      SELECT *
      FROM ${this.schema}.${overviewTable}
      LIMIT 1
    `);

    return {
      overview: {
        latestDate: overviewRow?.latest_date ?? null,
        totalRecords: Number(overviewRow?.total_records ?? 0),
        productCount: Number(overviewRow?.product_count ?? 0),
        totalUsd: overviewRow?.total_usd !== null && overviewRow?.total_usd !== undefined ? Number(overviewRow.total_usd) : null,
        totalNetWeightTon:
          overviewRow?.total_net_weight_ton !== null && overviewRow?.total_net_weight_ton !== undefined
            ? Number(overviewRow.total_net_weight_ton)
            : null,
        averageUsdPerTon:
          overviewRow?.average_usd_per_ton !== null && overviewRow?.average_usd_per_ton !== undefined
            ? Number(overviewRow.average_usd_per_ton)
            : null
      },
      topProducts: await this.loadTopProducts(topProductsTable, 5)
    };
  }

  private async loadTopProducts(tableName: string, limit: number): Promise<MidagriTopProduct[]> {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const rows = await this.queryExecutor.execute<MidagriTopProductRow>(
      `
        SELECT
          producto_key,
          subpartida_nacional,
          producto_nombre,
          total_usd,
          total_net_weight_ton,
          average_usd_per_ton,
          record_count
        FROM ${this.schema}.${tableName}
        ORDER BY total_usd DESC NULLS LAST, total_net_weight_ton DESC NULLS LAST
        LIMIT $1
      `,
      [safeLimit]
    );

    return rows.map((row) => ({
      productoKey: row.producto_key,
      subpartidaNacional: row.subpartida_nacional,
      productoNombre: row.producto_nombre,
      totalUsd: row.total_usd !== null && row.total_usd !== undefined ? Number(row.total_usd) : null,
      totalNetWeightTon:
        row.total_net_weight_ton !== null && row.total_net_weight_ton !== undefined ? Number(row.total_net_weight_ton) : null,
      averageUsdPerTon:
        row.average_usd_per_ton !== null && row.average_usd_per_ton !== undefined ? Number(row.average_usd_per_ton) : null,
      recordCount: Number(row.record_count)
    }));
  }

  private async loadTrend(tableName: string, input: MidagriTradeTrendInput): Promise<MidagriTradeTrendResponse> {
    const normalizedProductoKey = input.productoKey.trim().toLowerCase();
    const limit = Math.max(1, Math.min(input.limit, 36));
    const rows = await this.queryExecutor.execute<MidagriTrendRow>(
      `
        SELECT
          producto_key,
          fecha,
          subpartida_nacional,
          producto_nombre,
          total_usd,
          total_net_weight_ton,
          average_usd_per_ton,
          record_count
        FROM ${this.schema}.${tableName}
        WHERE producto_key = $1
        ORDER BY fecha DESC
        LIMIT $2
      `,
      [normalizedProductoKey, limit]
    );

    const productoNombre = rows[0]?.producto_nombre ?? null;
    const subpartidaNacional = rows[0]?.subpartida_nacional ?? null;
    const points: MidagriTradeTrendPoint[] = rows
      .map((row) => ({
        fecha: row.fecha,
        subpartidaNacional: row.subpartida_nacional,
        productoNombre: row.producto_nombre,
        totalUsd: row.total_usd !== null && row.total_usd !== undefined ? Number(row.total_usd) : null,
        totalNetWeightTon:
          row.total_net_weight_ton !== null && row.total_net_weight_ton !== undefined ? Number(row.total_net_weight_ton) : null,
        averageUsdPerTon:
          row.average_usd_per_ton !== null && row.average_usd_per_ton !== undefined ? Number(row.average_usd_per_ton) : null,
        recordCount: Number(row.record_count)
      }))
      .sort((left, right) => left.fecha.localeCompare(right.fecha));

    return {
      productoKey: normalizedProductoKey,
      subpartidaNacional,
      productoNombre,
      points
    };
  }
}
