import type {
  SunatExportsOverviewResponse,
  SunatTopDestination,
  SunatTopExportProduct
} from "../../../../domain/sunat/entities/export-overview.entity.js";
import type { SunatExportsRepository } from "../../../../domain/sunat/ports/sunat-exports.repository.js";
import { toNullableNumber, toRequiredNumber } from "../../shared/repository-helpers.js";
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

export class DuckDbSunatExportsRepository implements SunatExportsRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async getExportsOverview(): Promise<SunatExportsOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<SunatOverviewRow>(`
      SELECT *
      FROM sunat_overview_cache
    `);

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
      LIMIT 5
    `);

    const topProducts: SunatTopExportProduct[] = topProductRows.map((row) => ({
      productoKey: row.productoKey,
      productoNombre: row.productoNombre,
      categoriaProducto: row.categoriaProducto,
      totalUsd: toNullableNumber(row.totalUsd),
      totalNetWeightKg: toNullableNumber(row.totalNetWeightKg),
      averageUsdPerKg: toNullableNumber(row.averageUsdPerKg),
      operationCount: toRequiredNumber(row.operationCount)
    }));

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
      totalUsd: toNullableNumber(row.totalUsd),
      totalNetWeightKg: toNullableNumber(row.totalNetWeightKg),
      operationCount: toRequiredNumber(row.operationCount)
    }));

    return {
      overview: {
        latestDate: overviewRow?.latestDate ?? null,
        totalRecords: toRequiredNumber(overviewRow?.totalRecords),
        productCount: toRequiredNumber(overviewRow?.productCount),
        destinationCount: toRequiredNumber(overviewRow?.destinationCount),
        totalUsd: toNullableNumber(overviewRow?.totalUsd),
        totalNetWeightKg: toNullableNumber(overviewRow?.totalNetWeightKg),
        averageUsdPerKg: toNullableNumber(overviewRow?.averageUsdPerKg)
      },
      topProducts,
      topDestinations
    };
  }
}
