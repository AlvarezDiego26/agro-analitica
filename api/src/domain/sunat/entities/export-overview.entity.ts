export interface SunatExportsOverview {
  latestDate: string | null;
  totalRecords: number;
  productCount: number;
  destinationCount: number;
  totalUsd: number | null;
  totalNetWeightKg: number | null;
  averageUsdPerKg: number | null;
}

export interface SunatTopExportProduct {
  productoKey: string;
  productoNombre: string;
  categoriaProducto: string | null;
  totalUsd: number | null;
  totalNetWeightKg: number | null;
  averageUsdPerKg: number | null;
  operationCount: number;
}

export interface SunatTopDestination {
  destinoCodigo: string;
  destinoNombre: string;
  totalUsd: number | null;
  totalNetWeightKg: number | null;
  operationCount: number;
}

export interface SunatExportTrendInput {
  productoKey: string;
  limit: number;
}

export interface SunatExportTrendPoint {
  fecha: string;
  totalUsd: number | null;
  totalNetWeightKg: number | null;
  averageUsdPerKg: number | null;
  operationCount: number;
}

export interface SunatExportsOverviewResponse {
  overview: SunatExportsOverview;
  topProducts: SunatTopExportProduct[];
  topDestinations: SunatTopDestination[];
}

export interface SunatTopProductsResponse {
  items: SunatTopExportProduct[];
}

export interface SunatExportTrendResponse {
  productoKey: string;
  points: SunatExportTrendPoint[];
}
