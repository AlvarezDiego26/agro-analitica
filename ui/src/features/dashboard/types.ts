type DashboardAlert = {
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
};

export type DashboardOverviewResponse = {
  range: "7d" | "30d" | "3m" | "1a";
  overview: {
    latestDate: string;
    analyzedRows: number;
    productCount: number;
    originCount: number;
    overallAverage: number;
    totalVolumeTon: number;
    averageVolumeTon: number;
  };
  trend: Array<{
    fecha: string;
    averagePrice: number;
  }>;
  marketCards: Array<{
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
  }>;
  topProducts: Array<{
    productoNombre: string;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    recordCount: number;
    totalVolumeTon: number;
  }>;
  recommendation: {
    title: string;
    message: string;
    tone: "good" | "warn" | "neutral";
  };
  alerts: DashboardAlert[];
};
