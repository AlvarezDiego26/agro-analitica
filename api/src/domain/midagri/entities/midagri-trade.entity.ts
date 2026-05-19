export interface MidagriTradeOverview {
  latestDate: string | null;
  totalRecords: number;
  productCount: number;
  totalUsd: number | null;
  totalNetWeightTon: number | null;
  averageUsdPerTon: number | null;
}

export interface MidagriTopProduct {
  productoKey: string;
  subpartidaNacional: string | null;
  productoNombre: string;
  totalUsd: number | null;
  totalNetWeightTon: number | null;
  averageUsdPerTon: number | null;
  recordCount: number;
}

export interface MidagriTradeTrendInput {
  productoKey: string;
  limit: number;
}

export interface MidagriTradeTrendPoint {
  fecha: string;
  subpartidaNacional: string | null;
  productoNombre: string;
  totalUsd: number | null;
  totalNetWeightTon: number | null;
  averageUsdPerTon: number | null;
  recordCount: number;
}

export interface MidagriTradeOverviewResponse {
  overview: MidagriTradeOverview;
  topProducts: MidagriTopProduct[];
}

export interface MidagriTopProductsResponse {
  items: MidagriTopProduct[];
}

export interface MidagriTradeTrendResponse {
  productoKey: string;
  subpartidaNacional: string | null;
  productoNombre: string | null;
  points: MidagriTradeTrendPoint[];
}
