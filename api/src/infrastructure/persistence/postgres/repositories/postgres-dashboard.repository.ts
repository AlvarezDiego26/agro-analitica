import type {
  DashboardOverviewResponse,
  DashboardRecommendation,
  DashboardTopProduct,
  DashboardTrendPoint
} from "../../../../domain/dashboard/entities/dashboard.entity.js";
import type { DashboardRepository } from "../../../../domain/dashboard/ports/dashboard.repository.js";
import { loadEnv } from "../../../config/env.js";
import { PostgresQueryExecutor } from "../clients/postgres-query-executor.js";

type DashboardOverviewRow = {
  latest_date: string | null;
  analyzed_rows: number | string;
  product_count: number | string;
  origin_count: number | string;
  overall_average: number | null;
  total_volume_ton: number | null;
  average_volume_ton: number | null;
};

type DashboardTrendRow = {
  fecha: string;
  average_price: number | string;
};

type DashboardTopProductRow = {
  producto_nombre: string;
  average_price: number | null;
  min_price: number | null;
  max_price: number | null;
  record_count: number | string;
  total_volume_ton: number | null;
};

export class PostgresDashboardRepository implements DashboardRepository {
  private readonly schema = loadEnv().postgres.schema;

  constructor(private readonly queryExecutor: PostgresQueryExecutor) {}

  async getOverview(): Promise<DashboardOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<DashboardOverviewRow>(`
      SELECT *
      FROM ${this.schema}.dashboard_overview
      LIMIT 1
    `);

    const trendRows = await this.queryExecutor.execute<DashboardTrendRow>(`
      SELECT
        fecha,
        average_price
      FROM ${this.schema}.dashboard_trend
      ORDER BY fecha DESC
      LIMIT 10
    `);

    const topProductRows = await this.queryExecutor.execute<DashboardTopProductRow>(`
      SELECT
        producto_nombre,
        average_price,
        min_price,
        max_price,
        record_count,
        total_volume_ton
      FROM ${this.schema}.dashboard_top_products
      ORDER BY average_price DESC NULLS LAST
      LIMIT 5
    `);

    const trend = trendRows
      .map((row) => ({
        fecha: row.fecha,
        averagePrice: Number(row.average_price)
      }))
      .sort((left: DashboardTrendPoint, right: DashboardTrendPoint) => left.fecha.localeCompare(right.fecha));

    const topProducts: DashboardTopProduct[] = topProductRows.map((row) => ({
      productoNombre: row.producto_nombre,
      averagePrice: row.average_price !== null && row.average_price !== undefined ? Number(row.average_price) : null,
      minPrice: row.min_price !== null && row.min_price !== undefined ? Number(row.min_price) : null,
      maxPrice: row.max_price !== null && row.max_price !== undefined ? Number(row.max_price) : null,
      recordCount: Number(row.record_count),
      totalVolumeTon:
        row.total_volume_ton !== null && row.total_volume_ton !== undefined ? Number(row.total_volume_ton) : null
    }));

    const overallAverage =
      overviewRow?.overall_average !== null && overviewRow?.overall_average !== undefined
        ? Number(overviewRow.overall_average)
        : null;

    const totalVolumeTon =
      overviewRow?.total_volume_ton !== null && overviewRow?.total_volume_ton !== undefined
        ? Number(overviewRow.total_volume_ton)
        : null;

    const averageVolumeTon =
      overviewRow?.average_volume_ton !== null && overviewRow?.average_volume_ton !== undefined
        ? Number(overviewRow.average_volume_ton)
        : null;

    return {
      overview: {
        latestDate: overviewRow?.latest_date ?? null,
        analyzedRows: Number(overviewRow?.analyzed_rows ?? 0),
        productCount: Number(overviewRow?.product_count ?? 0),
        originCount: Number(overviewRow?.origin_count ?? 0),
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
