import type {
  SisapOverviewResponse,
  SisapProductTrendInput,
  SisapProductTrendPoint,
  SisapProductTrendResponse,
  SisapTopProduct,
  SisapTopProductsResponse
} from "../../../../domain/sisap/entities/sisap-market.entity.js";
import type { SisapMarketRepository } from "../../../../domain/sisap/ports/sisap-market.repository.js";
import { loadEnv } from "../../../config/env.js";
import { PostgresQueryExecutor } from "../clients/postgres-query-executor.js";

type SisapOverviewRow = {
  latest_date: string | null;
  analyzed_rows: number | string;
  product_count: number | string;
  origin_count: number | string;
  overall_average: number | null;
  total_volume_ton: number | null;
  average_volume_ton: number | null;
};

type SisapTopProductRow = {
  producto_nombre: string;
  average_price: number | null;
  min_price: number | null;
  max_price: number | null;
  record_count: number | string;
  total_volume_ton: number | null;
};

type SisapTrendRow = SisapTopProductRow & {
  fecha: string;
  producto_key: string;
};

export class PostgresSisapMarketRepository implements SisapMarketRepository {
  private readonly schema = loadEnv().postgres.schema;

  constructor(private readonly queryExecutor: PostgresQueryExecutor) {}

  async getOverview(): Promise<SisapOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<SisapOverviewRow>(`
      SELECT *
      FROM ${this.schema}.sisap_overview
      LIMIT 1
    `);

    return {
      overview: {
        latestDate: overviewRow?.latest_date ?? null,
        analyzedRows: Number(overviewRow?.analyzed_rows ?? 0),
        productCount: Number(overviewRow?.product_count ?? 0),
        originCount: Number(overviewRow?.origin_count ?? 0),
        overallAverage:
          overviewRow?.overall_average !== null && overviewRow?.overall_average !== undefined
            ? Number(overviewRow.overall_average)
            : null,
        totalVolumeTon:
          overviewRow?.total_volume_ton !== null && overviewRow?.total_volume_ton !== undefined
            ? Number(overviewRow.total_volume_ton)
            : null,
        averageVolumeTon:
          overviewRow?.average_volume_ton !== null && overviewRow?.average_volume_ton !== undefined
            ? Number(overviewRow.average_volume_ton)
            : null
      },
      topProducts: await this.loadTopProducts(5)
    };
  }

  async getTopProducts(limit = 10): Promise<SisapTopProductsResponse> {
    return { items: await this.loadTopProducts(limit) };
  }

  async getProductTrend(input: SisapProductTrendInput): Promise<SisapProductTrendResponse> {
    const normalizedProductoKey = input.productoKey.trim().toLowerCase();
    const limit = Math.max(1, Math.min(input.limit, 36));

    const rows = await this.queryExecutor.execute<SisapTrendRow>(
      `
        SELECT
          producto_key,
          fecha,
          producto_nombre,
          average_price,
          min_price,
          max_price,
          record_count,
          total_volume_ton
        FROM ${this.schema}.sisap_product_trend
        WHERE producto_key = $1
        ORDER BY fecha DESC
        LIMIT $2
      `,
      [normalizedProductoKey, limit]
    );

    const productoNombre = rows[0]?.producto_nombre ?? null;
    const points: SisapProductTrendPoint[] = rows
      .map((row) => ({
        fecha: row.fecha,
        productoNombre: row.producto_nombre,
        averagePrice: row.average_price !== null && row.average_price !== undefined ? Number(row.average_price) : null,
        minPrice: row.min_price !== null && row.min_price !== undefined ? Number(row.min_price) : null,
        maxPrice: row.max_price !== null && row.max_price !== undefined ? Number(row.max_price) : null,
        recordCount: Number(row.record_count),
        totalVolumeTon:
          row.total_volume_ton !== null && row.total_volume_ton !== undefined ? Number(row.total_volume_ton) : null
      }))
      .sort((left, right) => left.fecha.localeCompare(right.fecha));

    return {
      productoKey: normalizedProductoKey,
      productoNombre,
      points
    };
  }

  private async loadTopProducts(limit: number): Promise<SisapTopProduct[]> {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const rows = await this.queryExecutor.execute<SisapTopProductRow>(
      `
        SELECT
          producto_nombre,
          average_price,
          min_price,
          max_price,
          record_count,
          total_volume_ton
        FROM ${this.schema}.sisap_top_products
        ORDER BY total_volume_ton DESC NULLS LAST, average_price DESC NULLS LAST
        LIMIT $1
      `,
      [safeLimit]
    );

    return rows.map((row) => ({
      productoNombre: row.producto_nombre,
      averagePrice: row.average_price !== null && row.average_price !== undefined ? Number(row.average_price) : null,
      minPrice: row.min_price !== null && row.min_price !== undefined ? Number(row.min_price) : null,
      maxPrice: row.max_price !== null && row.max_price !== undefined ? Number(row.max_price) : null,
      recordCount: Number(row.record_count),
      totalVolumeTon:
        row.total_volume_ton !== null && row.total_volume_ton !== undefined ? Number(row.total_volume_ton) : null
    }));
  }
}
