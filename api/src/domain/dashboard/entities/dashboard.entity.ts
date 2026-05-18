export interface DashboardOverview {
  latestDate: string | null;
  analyzedRows: number;
  productCount: number;
  originCount: number;
  overallAverage: number | null;
  totalVolumeTon: number | null;
  averageVolumeTon: number | null;
}

export interface DashboardTrendPoint {
  fecha: string;
  averagePrice: number;
}

export interface DashboardTopProduct {
  productoNombre: string;
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  recordCount: number;
  totalVolumeTon: number | null;
}

export interface DashboardRecommendation {
  title: string;
  message: string;
  tone: "good" | "warn" | "neutral";
}

export interface DashboardOverviewResponse {
  overview: DashboardOverview;
  trend: DashboardTrendPoint[];
  topProducts: DashboardTopProduct[];
  recommendation: DashboardRecommendation;
}
