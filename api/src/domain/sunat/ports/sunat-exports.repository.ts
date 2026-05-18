import type {
  SunatExportTrendInput,
  SunatExportTrendResponse,
  SunatExportsOverviewResponse,
  SunatTopProductsResponse
} from '../entities/export-overview.entity.js';

export interface SunatExportsRepository {
  getExportsOverview(): Promise<SunatExportsOverviewResponse>;
  getTopProducts(limit?: number): Promise<SunatTopProductsResponse>;
  getExportsTrend(input: SunatExportTrendInput): Promise<SunatExportTrendResponse>;
}
