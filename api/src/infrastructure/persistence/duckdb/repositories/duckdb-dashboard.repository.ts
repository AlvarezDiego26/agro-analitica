import type {
  DashboardOverviewResponse,
  DashboardRecommendation,
  DashboardTopProduct,
  DashboardTrendPoint
} from "../../../../domain/dashboard/entities/dashboard.entity.js";
import type { DashboardRepository } from "../../../../domain/dashboard/ports/dashboard.repository.js";
import { DuckDbQueryExecutor } from "../clients/duckdb-query-executor.js";

type DashboardOverviewRow = {
  latestDate: string | null;
  analyzedRows: number | string;
  productCount: number | string;
  originCount: number | string;
  overallAverage: number | null;
  totalVolumeTon?: number | null;
  averageVolumeTon?: number | null;
};

type DashboardTrendRow = {
  fecha: string;
  averagePrice: number | string;
};

type DashboardTopProductRow = {
  productoNombre: string;
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  recordCount: number | string;
  totalVolumeTon?: number | null;
};

export class DuckDbDashboardRepository implements DashboardRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async getOverview(): Promise<DashboardOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<DashboardOverviewRow>(`
      SELECT *
      FROM dashboard_overview_cache
    `);

    const trendRows = await this.queryExecutor.execute<DashboardTrendRow>(`
      SELECT
        fecha,
        averagePrice
      FROM dashboard_trend_cache
      ORDER BY fecha DESC
      LIMIT 10
    `);

    const topProductRows = await this.queryExecutor.execute<DashboardTopProductRow>(`
      SELECT
        productoNombre,
        averagePrice,
        minPrice,
        maxPrice,
        recordCount,
        totalVolumeTon
      FROM dashboard_top_products_cache
      ORDER BY averagePrice DESC
      LIMIT 5
    `);

    const trend = trendRows
      .map((row) => ({
        fecha: row.fecha,
        averagePrice: Number(row.averagePrice)
      }))
      .sort((left: DashboardTrendPoint, right: DashboardTrendPoint) => left.fecha.localeCompare(right.fecha));

    const topProducts: DashboardTopProduct[] = topProductRows.map((row) => ({
      productoNombre: row.productoNombre,
      averagePrice: row.averagePrice !== null ? Number(row.averagePrice) : null,
      minPrice: row.minPrice !== null ? Number(row.minPrice) : null,
      maxPrice: row.maxPrice !== null ? Number(row.maxPrice) : null,
      recordCount: Number(row.recordCount),
      totalVolumeTon: row.totalVolumeTon !== null && row.totalVolumeTon !== undefined ? Number(row.totalVolumeTon) : null
    }));

    const overallAverage =
      overviewRow?.overallAverage !== null && overviewRow?.overallAverage !== undefined
        ? Number(overviewRow.overallAverage)
        : null;

    const totalVolumeTon =
      overviewRow?.totalVolumeTon !== null && overviewRow?.totalVolumeTon !== undefined
        ? Number(overviewRow.totalVolumeTon)
        : null;

    const averageVolumeTon =
      overviewRow?.averageVolumeTon !== null && overviewRow?.averageVolumeTon !== undefined
        ? Number(overviewRow.averageVolumeTon)
        : null;

    return {
      overview: {
        latestDate: overviewRow?.latestDate ?? null,
        analyzedRows: Number(overviewRow?.analyzedRows ?? 0),
        productCount: Number(overviewRow?.productCount ?? 0),
        originCount: Number(overviewRow?.originCount ?? 0),
        overallAverage,
        totalVolumeTon,
        averageVolumeTon
      },
      trend,
      topProducts,
      recommendation: buildRecommendation(trend, overallAverage, totalVolumeTon, averageVolumeTon)
    };
  }
}

function buildRecommendation(
  trend: DashboardTrendPoint[],
  overallAverage: number | null,
  totalVolumeTon: number | null,
  averageVolumeTon: number | null
): DashboardRecommendation {
  const latestPoint = trend[trend.length - 1];

  if (!latestPoint || overallAverage === null) {
    return {
      title: "Sin senal clara aun",
      message: "Faltan datos suficientes para interpretar una tendencia util en la ventana analizada.",
      tone: "neutral"
    };
  }

  const hasStrongVolume =
    totalVolumeTon !== null && averageVolumeTon !== null && totalVolumeTon >= averageVolumeTon * 10;

  if (latestPoint.averagePrice >= overallAverage * 1.08 && hasStrongVolume) {
    return {
      title: "Senal favorable con buen movimiento",
      message:
        "El precio reciente esta por encima del promedio del periodo y el volumen acumulado confirma una actividad sana de mercado.",
      tone: "good"
    };
  }

  if (latestPoint.averagePrice <= overallAverage * 0.92) {
    return {
      title: "Precio presionado",
      message:
        "El promedio reciente esta por debajo del promedio del periodo. Conviene comparar mas fechas, procedencias y revisar el volumen antes de decidir.",
      tone: "warn"
    };
  }

  return {
    title: "Mercado relativamente estable",
    message:
      "El promedio reciente se mantiene cerca del promedio del periodo observado. Usa el volumen como complemento para ver si el mercado esta realmente activo.",
    tone: "neutral"
  };
}
