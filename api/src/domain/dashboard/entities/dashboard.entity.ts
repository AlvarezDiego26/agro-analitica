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

export type DashboardRange = "7d" | "30d" | "3m" | "1a";

export interface DashboardMarketCard {
  productoNombre: string;
  latestPrice: number;
  deltaPct: number;
  deltaDirection: "up" | "down" | "none";
  series: Array<{
    fecha: string;
    averagePrice: number;
    totalVolumeTon: number;
    prediction?: number;
  }>;
  latestDate: string;
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

export interface DashboardAlert {
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
}

export interface DashboardOverviewResponse {
  range: DashboardRange;
  overview: DashboardOverview;
  trend: DashboardTrendPoint[];
  marketCards: DashboardMarketCard[];
  topProducts: DashboardTopProduct[];
  recommendation: DashboardRecommendation;
  alerts: DashboardAlert[];
}
