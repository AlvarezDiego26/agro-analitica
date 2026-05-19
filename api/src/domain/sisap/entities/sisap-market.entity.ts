export interface SisapOverview {
  latestDate: string | null;
  analyzedRows: number;
  productCount: number;
  originCount: number;
  overallAverage: number | null;
  totalVolumeTon: number | null;
  averageVolumeTon: number | null;
}

export interface SisapTopProduct {
  productoNombre: string;
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  recordCount: number;
  totalVolumeTon: number | null;
}

export interface SisapProductTrendInput {
  productoKey: string;
  limit: number;
}

export interface SisapProductTrendPoint {
  fecha: string;
  productoNombre: string;
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  recordCount: number;
  totalVolumeTon: number | null;
}

export interface SisapOverviewResponse {
  overview: SisapOverview;
  topProducts: SisapTopProduct[];
}

export interface SisapTopProductsResponse {
  items: SisapTopProduct[];
}

export interface SisapProductTrendResponse {
  productoKey: string;
  productoNombre: string | null;
  points: SisapProductTrendPoint[];
}
