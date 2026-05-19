import type {
  SisapOverviewResponse,
  SisapProductTrendInput,
  SisapProductTrendResponse,
  SisapTopProductsResponse
} from '../entities/sisap-market.entity.js';

export interface SisapMarketRepository {
  getOverview(): Promise<SisapOverviewResponse>;
  getTopProducts(limit?: number): Promise<SisapTopProductsResponse>;
  getProductTrend(input: SisapProductTrendInput): Promise<SisapProductTrendResponse>;
}
