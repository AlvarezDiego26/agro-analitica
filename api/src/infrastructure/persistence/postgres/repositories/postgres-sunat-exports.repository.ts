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
import { loadEnv } from "../../../config/env.js";
import { PostgresQueryExecutor } from "../clients/postgres-query-executor.js";

type SunatOverviewRow = {
  latest_date: string | null;
  total_records: number | string;
  product_count: number | string;
  destination_count: number | string;
  total_usd: number | null;
  total_net_weight_kg: number | null;
  average_usd_per_kg: number | null;
};

type SunatTopProductRow = {
  producto_key: string;
  producto_nombre: string;
  categoria_producto: string | null;
  total_usd: number | null;
  total_net_weight_kg: number | null;
  average_usd_per_kg: number | null;
  operation_count: number | string;
};

type SunatTopDestinationRow = {
  destino_codigo: string;
  destino_nombre: string;
  total_usd: number | null;
  total_net_weight_kg: number | null;
  operation_count: number | string;
};

type SunatTrendRow = {
  fecha: string;
  total_usd: number | null;
  total_net_weight_kg: number | null;
  average_usd_per_kg: number | null;
  operation_count: number | string;
};

export class PostgresSunatExportsRepository implements SunatExportsRepository {
  private readonly schema = loadEnv().postgres.schema;

  constructor(private readonly queryExecutor: PostgresQueryExecutor) {}

  async getExportsOverview(): Promise<SunatExportsOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<SunatOverviewRow>(`
      SELECT *
      FROM ${this.schema}.sunat_overview
      LIMIT 1
    `);

    const topProducts = await this.loadTopProducts(5);

    const topDestinationRows = await this.queryExecutor.execute<SunatTopDestinationRow>(`
      SELECT
        destino_codigo,
        destino_nombre,
        total_usd,
        total_net_weight_kg,
        operation_count
      FROM ${this.schema}.sunat_top_destinations
      ORDER BY total_usd DESC NULLS LAST
      LIMIT 5
    `);

    const topDestinations: SunatTopDestination[] = topDestinationRows.map((row) => ({
      destinoCodigo: row.destino_codigo,
      destinoNombre: row.destino_nombre,
      totalUsd: row.total_usd !== null && row.total_usd !== undefined ? Number(row.total_usd) : null,
      totalNetWeightKg:
        row.total_net_weight_kg !== null && row.total_net_weight_kg !== undefined
          ? Number(row.total_net_weight_kg)
          : null,
      operationCount: Number(row.operation_count)
    }));

    return {
      overview: {
        latestDate: overviewRow?.latest_date ?? null,
        totalRecords: Number(overviewRow?.total_records ?? 0),
        productCount: Number(overviewRow?.product_count ?? 0),
        destinationCount: Number(overviewRow?.destination_count ?? 0),
        totalUsd: overviewRow?.total_usd !== null && overviewRow?.total_usd !== undefined ? Number(overviewRow.total_usd) : null,
        totalNetWeightKg:
          overviewRow?.total_net_weight_kg !== null && overviewRow?.total_net_weight_kg !== undefined
            ? Number(overviewRow.total_net_weight_kg)
            : null,
        averageUsdPerKg:
          overviewRow?.average_usd_per_kg !== null && overviewRow?.average_usd_per_kg !== undefined
            ? Number(overviewRow.average_usd_per_kg)
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

    const rows = await this.queryExecutor.execute<SunatTrendRow>(
      `
        SELECT
          fecha,
          total_usd,
          total_net_weight_kg,
          average_usd_per_kg,
          operation_count
        FROM ${this.schema}.sunat_product_trend
        WHERE producto_key = $1
        ORDER BY fecha DESC
        LIMIT $2
      `,
      [normalizedProductoKey, limit]
    );

    const points: SunatExportTrendPoint[] = rows
      .map((row) => ({
        fecha: row.fecha,
        totalUsd: row.total_usd !== null && row.total_usd !== undefined ? Number(row.total_usd) : null,
        totalNetWeightKg:
          row.total_net_weight_kg !== null && row.total_net_weight_kg !== undefined
            ? Number(row.total_net_weight_kg)
            : null,
        averageUsdPerKg:
          row.average_usd_per_kg !== null && row.average_usd_per_kg !== undefined
            ? Number(row.average_usd_per_kg)
            : null,
        operationCount: Number(row.operation_count)
      }))
      .sort((left, right) => left.fecha.localeCompare(right.fecha));

    return {
      productoKey: normalizedProductoKey,
      points
    };
  }

  private async loadTopProducts(limit: number): Promise<SunatTopExportProduct[]> {
    const safeLimit = Math.max(1, Math.min(limit, 20));

    const topProductRows = await this.queryExecutor.execute<SunatTopProductRow>(
      `
        SELECT
          producto_key,
          producto_nombre,
          categoria_producto,
          total_usd,
          total_net_weight_kg,
          average_usd_per_kg,
          operation_count
        FROM ${this.schema}.sunat_top_products
        ORDER BY total_usd DESC NULLS LAST
        LIMIT $1
      `,
      [safeLimit]
    );

    return topProductRows.map((row) => ({
      productoKey: row.producto_key,
      productoNombre: row.producto_nombre,
      categoriaProducto: row.categoria_producto,
      totalUsd: row.total_usd !== null && row.total_usd !== undefined ? Number(row.total_usd) : null,
      totalNetWeightKg:
        row.total_net_weight_kg !== null && row.total_net_weight_kg !== undefined
          ? Number(row.total_net_weight_kg)
          : null,
      averageUsdPerKg:
        row.average_usd_per_kg !== null && row.average_usd_per_kg !== undefined
          ? Number(row.average_usd_per_kg)
          : null,
      operationCount: Number(row.operation_count)
    }));
  }
}
