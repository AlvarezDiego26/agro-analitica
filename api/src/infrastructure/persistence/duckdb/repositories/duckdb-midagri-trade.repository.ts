import type {
  MidagriTopProduct,
  MidagriTopProductsResponse,
  MidagriTradeOverviewResponse,
  MidagriTradeTrendInput,
  MidagriTradeTrendPoint,
  MidagriTradeTrendResponse
} from "../../../../domain/midagri/entities/midagri-trade.entity.js";
import type { MidagriTradeRepository } from "../../../../domain/midagri/ports/midagri-trade.repository.js";
import { DuckDbQueryExecutor } from "../clients/duckdb-query-executor.js";

type MidagriOverviewRow = {
  latestDate: string | null;
  totalRecords: number | string;
  productCount: number | string;
  totalUsd: number | null;
  totalNetWeightTon: number | null;
  averageUsdPerTon: number | null;
};

type MidagriTopProductRow = {
  productoKey: string;
  subpartidaNacional: string | null;
  productoNombre: string;
  totalUsd: number | null;
  totalNetWeightTon: number | null;
  averageUsdPerTon: number | null;
  recordCount: number | string;
};

type MidagriTrendRow = MidagriTopProductRow & {
  fecha: string;
};

export class DuckDbMidagriTradeRepository implements MidagriTradeRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async getExportsOverview(): Promise<MidagriTradeOverviewResponse> {
    return this.loadOverview('midagri_exportaciones_overview_cache', 'midagri_exportaciones_top_products_cache');
  }

  async getExportsTopProducts(limit = 10): Promise<MidagriTopProductsResponse> {
    return { items: await this.loadTopProducts('midagri_exportaciones_top_products_cache', limit) };
  }

  async getExportsTrend(input: MidagriTradeTrendInput): Promise<MidagriTradeTrendResponse> {
    return this.loadTrend('midagri_exportaciones_trend_cache', input);
  }

  async getImportsOverview(): Promise<MidagriTradeOverviewResponse> {
    return this.loadOverview('midagri_importaciones_overview_cache', 'midagri_importaciones_top_products_cache');
  }

  async getImportsTopProducts(limit = 10): Promise<MidagriTopProductsResponse> {
    return { items: await this.loadTopProducts('midagri_importaciones_top_products_cache', limit) };
  }

  async getImportsTrend(input: MidagriTradeTrendInput): Promise<MidagriTradeTrendResponse> {
    return this.loadTrend('midagri_importaciones_trend_cache', input);
  }

  private async loadOverview(overviewTable: string, topProductsTable: string): Promise<MidagriTradeOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<MidagriOverviewRow>(`
      SELECT *
      FROM ${overviewTable}
    `);

    return {
      overview: {
        latestDate: overviewRow?.latestDate ?? null,
        totalRecords: Number(overviewRow?.totalRecords ?? 0),
        productCount: Number(overviewRow?.productCount ?? 0),
        totalUsd: overviewRow?.totalUsd !== null && overviewRow?.totalUsd !== undefined ? Number(overviewRow.totalUsd) : null,
        totalNetWeightTon:
          overviewRow?.totalNetWeightTon !== null && overviewRow?.totalNetWeightTon !== undefined
            ? Number(overviewRow.totalNetWeightTon)
            : null,
        averageUsdPerTon:
          overviewRow?.averageUsdPerTon !== null && overviewRow?.averageUsdPerTon !== undefined
            ? Number(overviewRow.averageUsdPerTon)
            : null
      },
      topProducts: await this.loadTopProducts(topProductsTable, 5)
    };
  }

  private async loadTopProducts(tableName: string, limit: number): Promise<MidagriTopProduct[]> {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const rows = await this.queryExecutor.execute<MidagriTopProductRow>(`
      SELECT
        productoKey,
        subpartidaNacional,
        productoNombre,
        totalUsd,
        totalNetWeightTon,
        averageUsdPerTon,
        recordCount
      FROM ${tableName}
      ORDER BY totalUsd DESC, totalNetWeightTon DESC
      LIMIT ${safeLimit}
    `);

    return rows.map((row) => ({
      productoKey: row.productoKey,
      subpartidaNacional: row.subpartidaNacional,
      productoNombre: row.productoNombre,
      totalUsd: row.totalUsd !== null && row.totalUsd !== undefined ? Number(row.totalUsd) : null,
      totalNetWeightTon:
        row.totalNetWeightTon !== null && row.totalNetWeightTon !== undefined ? Number(row.totalNetWeightTon) : null,
      averageUsdPerTon:
        row.averageUsdPerTon !== null && row.averageUsdPerTon !== undefined ? Number(row.averageUsdPerTon) : null,
      recordCount: Number(row.recordCount)
    }));
  }

  private async loadTrend(tableName: string, input: MidagriTradeTrendInput): Promise<MidagriTradeTrendResponse> {
    const normalizedProductoKey = input.productoKey.trim().toLowerCase().replace(/'/g, "''");
    const limit = Math.max(1, Math.min(input.limit, 36));
    const rows = await this.queryExecutor.execute<MidagriTrendRow>(`
      SELECT
        productoKey,
        fecha,
        subpartidaNacional,
        productoNombre,
        totalUsd,
        totalNetWeightTon,
        averageUsdPerTon,
        recordCount
      FROM ${tableName}
      WHERE productoKey = '${normalizedProductoKey}'
      ORDER BY fecha DESC
      LIMIT ${limit}
    `);

    const productoNombre = rows[0]?.productoNombre ?? null;
    const subpartidaNacional = rows[0]?.subpartidaNacional ?? null;
    const points: MidagriTradeTrendPoint[] = rows
      .map((row) => ({
        fecha: row.fecha,
        subpartidaNacional: row.subpartidaNacional,
        productoNombre: row.productoNombre,
        totalUsd: row.totalUsd !== null && row.totalUsd !== undefined ? Number(row.totalUsd) : null,
        totalNetWeightTon:
          row.totalNetWeightTon !== null && row.totalNetWeightTon !== undefined ? Number(row.totalNetWeightTon) : null,
        averageUsdPerTon:
          row.averageUsdPerTon !== null && row.averageUsdPerTon !== undefined ? Number(row.averageUsdPerTon) : null,
        recordCount: Number(row.recordCount)
      }))
      .sort((left, right) => left.fecha.localeCompare(right.fecha));

    return {
      productoKey: input.productoKey.trim().toLowerCase(),
      subpartidaNacional,
      productoNombre,
      points
    };
  }
}
