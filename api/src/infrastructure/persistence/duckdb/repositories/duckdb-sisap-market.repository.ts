import type {
  SisapOverviewResponse,
  SisapProductTrendInput,
  SisapProductTrendPoint,
  SisapProductTrendResponse,
  SisapTopProduct,
  SisapTopProductsResponse
} from "../../../../domain/sisap/entities/sisap-market.entity.js";
import type { SisapMarketRepository } from "../../../../domain/sisap/ports/sisap-market.repository.js";
import { DuckDbQueryExecutor } from "../clients/duckdb-query-executor.js";

type SisapOverviewRow = {
  latestDate: string | null;
  analyzedRows: number | string;
  productCount: number | string;
  originCount: number | string;
  overallAverage: number | null;
  totalVolumeTon: number | null;
  averageVolumeTon: number | null;
};

type SisapTopProductRow = {
  productoNombre: string;
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  recordCount: number | string;
  totalVolumeTon: number | null;
};

type SisapTrendRow = SisapTopProductRow & {
  fecha: string;
  productoKey: string;
};

export class DuckDbSisapMarketRepository implements SisapMarketRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async getOverview(): Promise<SisapOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<SisapOverviewRow>(`
      SELECT *
      FROM dashboard_overview_cache
    `);

    return {
      overview: {
        latestDate: overviewRow?.latestDate ?? null,
        analyzedRows: Number(overviewRow?.analyzedRows ?? 0),
        productCount: Number(overviewRow?.productCount ?? 0),
        originCount: Number(overviewRow?.originCount ?? 0),
        overallAverage:
          overviewRow?.overallAverage !== null && overviewRow?.overallAverage !== undefined
            ? Number(overviewRow.overallAverage)
            : null,
        totalVolumeTon:
          overviewRow?.totalVolumeTon !== null && overviewRow?.totalVolumeTon !== undefined
            ? Number(overviewRow.totalVolumeTon)
            : null,
        averageVolumeTon:
          overviewRow?.averageVolumeTon !== null && overviewRow?.averageVolumeTon !== undefined
            ? Number(overviewRow.averageVolumeTon)
            : null
      },
      topProducts: await this.loadTopProducts(5)
    };
  }

  async getTopProducts(limit = 10): Promise<SisapTopProductsResponse> {
    return { items: await this.loadTopProducts(limit) };
  }

  async getProductTrend(input: SisapProductTrendInput): Promise<SisapProductTrendResponse> {
    const normalizedProductoKey = input.productoKey.trim().toLowerCase().replace(/'/g, "''");
    const limit = Math.max(1, Math.min(input.limit, 36));

    const rows = await this.queryExecutor.execute<SisapTrendRow>(`
      SELECT
        productoKey,
        fecha,
        productoNombre,
        averagePrice,
        minPrice,
        maxPrice,
        recordCount,
        totalVolumeTon
      FROM sisap_product_trend_cache
      WHERE productoKey = '${normalizedProductoKey}'
      ORDER BY fecha DESC
      LIMIT ${limit}
    `);

    const productoNombre = rows[0]?.productoNombre ?? null;
    const points: SisapProductTrendPoint[] = rows
      .map((row) => ({
        fecha: row.fecha,
        productoNombre: row.productoNombre,
        averagePrice: row.averagePrice !== null && row.averagePrice !== undefined ? Number(row.averagePrice) : null,
        minPrice: row.minPrice !== null && row.minPrice !== undefined ? Number(row.minPrice) : null,
        maxPrice: row.maxPrice !== null && row.maxPrice !== undefined ? Number(row.maxPrice) : null,
        recordCount: Number(row.recordCount),
        totalVolumeTon:
          row.totalVolumeTon !== null && row.totalVolumeTon !== undefined ? Number(row.totalVolumeTon) : null
      }))
      .sort((left, right) => left.fecha.localeCompare(right.fecha));

    return {
      productoKey: input.productoKey.trim().toLowerCase(),
      productoNombre,
      points
    };
  }

  private async loadTopProducts(limit: number): Promise<SisapTopProduct[]> {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const rows = await this.queryExecutor.execute<SisapTopProductRow>(`
      SELECT
        productoNombre,
        averagePrice,
        minPrice,
        maxPrice,
        recordCount,
        totalVolumeTon
      FROM dashboard_top_products_cache
      ORDER BY totalVolumeTon DESC, averagePrice DESC
      LIMIT ${safeLimit}
    `);

    return rows.map((row) => ({
      productoNombre: row.productoNombre,
      averagePrice: row.averagePrice !== null && row.averagePrice !== undefined ? Number(row.averagePrice) : null,
      minPrice: row.minPrice !== null && row.minPrice !== undefined ? Number(row.minPrice) : null,
      maxPrice: row.maxPrice !== null && row.maxPrice !== undefined ? Number(row.maxPrice) : null,
      recordCount: Number(row.recordCount),
      totalVolumeTon: row.totalVolumeTon !== null && row.totalVolumeTon !== undefined ? Number(row.totalVolumeTon) : null
    }));
  }
}
