import type {
  SunatExportTrendInput,
  SunatExportTrendPoint,
  SunatExportTrendResponse,
  SunatExportsOverviewResponse,
  SunatTopDestination,
  SunatTopExportProduct,
  SunatTopProductsResponse
} from "../../../../domain/sunat/entities/export-overview.entity.js";
import type { SunatExportsRepository } from "../../../../domain/sunat/ports/sunat-exports.repository.js";
import { DuckDbQueryExecutor } from "../clients/duckdb-query-executor.js";

type SunatOverviewRow = {
  latestDate: string | null;
  totalRecords: number | string;
  productCount: number | string;
  destinationCount: number | string;
  totalUsd: number | null;
  totalNetWeightKg: number | null;
  averageUsdPerKg: number | null;
};

type SunatTopProductRow = {
  productoKey: string;
  productoNombre: string;
  categoriaProducto: string | null;
  totalUsd: number | null;
  totalNetWeightKg: number | null;
  averageUsdPerKg: number | null;
  operationCount: number | string;
};

type SunatTopDestinationRow = {
  destinoCodigo: string;
  destinoNombre: string;
  totalUsd: number | null;
  totalNetWeightKg: number | null;
  operationCount: number | string;
};

type SunatTrendRow = {
  fecha: string;
  totalUsd: number | null;
  totalNetWeightKg: number | null;
  averageUsdPerKg: number | null;
  operationCount: number | string;
};

export class DuckDbSunatExportsRepository implements SunatExportsRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async getExportsOverview(): Promise<SunatExportsOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<SunatOverviewRow>(`
      SELECT *
      FROM sunat_overview_cache
    `);

    const topProducts = await this.loadTopProducts(5);

    const topDestinationRows = await this.queryExecutor.execute<SunatTopDestinationRow>(`
      SELECT
        destinoCodigo,
        destinoNombre,
        totalUsd,
        totalNetWeightKg,
        operationCount
      FROM sunat_top_destinations_cache
      ORDER BY totalUsd DESC
      LIMIT 5
    `);

    const topDestinations: SunatTopDestination[] = topDestinationRows.map((row) => ({
      destinoCodigo: row.destinoCodigo,
      destinoNombre: row.destinoNombre,
      totalUsd: row.totalUsd !== null && row.totalUsd !== undefined ? Number(row.totalUsd) : null,
      totalNetWeightKg:
        row.totalNetWeightKg !== null && row.totalNetWeightKg !== undefined ? Number(row.totalNetWeightKg) : null,
      operationCount: Number(row.operationCount)
    }));

    return {
      overview: {
        latestDate: overviewRow?.latestDate ?? null,
        totalRecords: Number(overviewRow?.totalRecords ?? 0),
        productCount: Number(overviewRow?.productCount ?? 0),
        destinationCount: Number(overviewRow?.destinationCount ?? 0),
        totalUsd: overviewRow?.totalUsd !== null && overviewRow?.totalUsd !== undefined ? Number(overviewRow.totalUsd) : null,
        totalNetWeightKg:
          overviewRow?.totalNetWeightKg !== null && overviewRow?.totalNetWeightKg !== undefined
            ? Number(overviewRow.totalNetWeightKg)
            : null,
        averageUsdPerKg:
          overviewRow?.averageUsdPerKg !== null && overviewRow?.averageUsdPerKg !== undefined
            ? Number(overviewRow.averageUsdPerKg)
            : null
      },
      topProducts,
      topDestinations
    };
  }

  async getTopProducts(limit = 5): Promise<SunatTopProductsResponse> {
    return {
      items: await this.loadTopProducts(limit)
    };
  }

  async getExportsTrend(input: SunatExportTrendInput): Promise<SunatExportTrendResponse> {
    const normalizedProductoKey = input.productoKey.trim().toLowerCase();
    const limit = Math.max(1, Math.min(input.limit, 36));

    const rows = await this.queryExecutor.execute<SunatTrendRow>(`
      SELECT
        fecha,
        totalUsd,
        totalNetWeightKg,
        averageUsdPerKg,
        operationCount
      FROM sunat_product_trend_cache
      WHERE productoKey = '${normalizedProductoKey}'
      ORDER BY fecha DESC
      LIMIT ${limit}
    `);

    const points: SunatExportTrendPoint[] = rows
      .map((row) => ({
        fecha: row.fecha,
        totalUsd: row.totalUsd !== null && row.totalUsd !== undefined ? Number(row.totalUsd) : null,
        totalNetWeightKg:
          row.totalNetWeightKg !== null && row.totalNetWeightKg !== undefined ? Number(row.totalNetWeightKg) : null,
        averageUsdPerKg:
          row.averageUsdPerKg !== null && row.averageUsdPerKg !== undefined ? Number(row.averageUsdPerKg) : null,
        operationCount: Number(row.operationCount)
      }))
      .sort((left, right) => left.fecha.localeCompare(right.fecha));

    return {
      productoKey: normalizedProductoKey,
      points
    };
  }

  private async loadTopProducts(limit: number): Promise<SunatTopExportProduct[]> {
    const safeLimit = Math.max(1, Math.min(limit, 20));

    const topProductRows = await this.queryExecutor.execute<SunatTopProductRow>(`
      SELECT
        productoKey,
        productoNombre,
        categoriaProducto,
        totalUsd,
        totalNetWeightKg,
        averageUsdPerKg,
        operationCount
      FROM sunat_top_products_cache
      ORDER BY totalUsd DESC
      LIMIT ${safeLimit}
    `);

    return topProductRows.map((row) => ({
      productoKey: row.productoKey,
      productoNombre: row.productoNombre,
      categoriaProducto: row.categoriaProducto,
      totalUsd: row.totalUsd !== null && row.totalUsd !== undefined ? Number(row.totalUsd) : null,
      totalNetWeightKg:
        row.totalNetWeightKg !== null && row.totalNetWeightKg !== undefined ? Number(row.totalNetWeightKg) : null,
      averageUsdPerKg:
        row.averageUsdPerKg !== null && row.averageUsdPerKg !== undefined ? Number(row.averageUsdPerKg) : null,
      operationCount: Number(row.operationCount)
    }));
  }
}
