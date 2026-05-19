import type {
  MidagriTopProductsResponse,
  MidagriTradeOverviewResponse,
  MidagriTradeTrendInput,
  MidagriTradeTrendResponse
} from '../entities/midagri-trade.entity.js';

export interface MidagriTradeRepository {
  getExportsOverview(): Promise<MidagriTradeOverviewResponse>;
  getExportsTopProducts(limit?: number): Promise<MidagriTopProductsResponse>;
  getExportsTrend(input: MidagriTradeTrendInput): Promise<MidagriTradeTrendResponse>;
  getImportsOverview(): Promise<MidagriTradeOverviewResponse>;
  getImportsTopProducts(limit?: number): Promise<MidagriTopProductsResponse>;
  getImportsTrend(input: MidagriTradeTrendInput): Promise<MidagriTradeTrendResponse>;
}
