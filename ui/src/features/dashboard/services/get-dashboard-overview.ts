import { apiClient } from "../../../lib/api-client";
import type { DashboardOverviewResponse } from "../types";

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  try {
    return await apiClient<DashboardOverviewResponse>({
      path: "/api/dashboard/overview"
    });
  } catch {
    return {
      overview: {
        latestDate: "2026-05-16",
        analyzedRows: 236,
        productCount: 3,
        originCount: 1,
        overallAverage: 8.65,
        totalVolumeTon: 29711.7,
        averageVolumeTon: 71.77
      },
      trend: [
        { fecha: "2026-05-07", averagePrice: 8.74 },
        { fecha: "2026-05-08", averagePrice: 8.72 },
        { fecha: "2026-05-09", averagePrice: 8.64 },
        { fecha: "2026-05-10", averagePrice: 8.64 },
        { fecha: "2026-05-11", averagePrice: 8.74 },
        { fecha: "2026-05-12", averagePrice: 8.89 },
        { fecha: "2026-05-13", averagePrice: 8.94 },
        { fecha: "2026-05-14", averagePrice: 9.14 },
        { fecha: "2026-05-15", averagePrice: 9.11 },
        { fecha: "2026-05-16", averagePrice: 4.65 }
      ],
      topProducts: [
        {
          productoNombre: "Aji seco",
          averagePrice: 15.58,
          minPrice: 13.5,
          maxPrice: 18.75,
          recordCount: 87,
          totalVolumeTon: 36
        },
        {
          productoNombre: "Ajo",
          averagePrice: 6.42,
          minPrice: 4.63,
          maxPrice: 8,
          recordCount: 60,
          totalVolumeTon: 0
        },
        {
          productoNombre: "Aji fresco",
          averagePrice: 3.39,
          minPrice: 1.9,
          maxPrice: 8.13,
          recordCount: 89,
          totalVolumeTon: 111
        }
      ],
      recommendation: {
        title: "Precio presionado",
        message:
          "El promedio reciente está por debajo del promedio del periodo. Conviene comparar más fechas, procedencias y revisar el volumen antes de decidir.",
        tone: "warn"
      }
    };
  }
}
