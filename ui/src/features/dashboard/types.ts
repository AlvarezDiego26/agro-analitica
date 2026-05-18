export type DashboardAlert = {
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
};

export type DashboardOverviewResponse = {
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
    tone: "info" | "success" | "warn";
  };
};
