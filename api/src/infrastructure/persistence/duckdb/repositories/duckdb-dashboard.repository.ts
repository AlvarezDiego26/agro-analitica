import type {
  DashboardMarketCard,
  DashboardOverviewResponse,
  DashboardRange,
  DashboardRecommendation,
  DashboardTopProduct,
  DashboardTrendPoint
} from "../../../../domain/dashboard/entities/dashboard.entity.js";
import type { DashboardRepository } from "../../../../domain/dashboard/ports/dashboard.repository.js";
import { sortByFechaAsc, toNullableNumber, toRequiredNumber } from "../../shared/repository-helpers.js";
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

type DashboardMarketCardRow = {
  productoNombre: string;
  fecha: string;
  averagePrice: number | string;
  totalVolumeTon?: number | null;
};

const DEFAULT_RANGE: DashboardRange = "30d";

export class DuckDbDashboardRepository implements DashboardRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async getOverview(range: DashboardRange = DEFAULT_RANGE): Promise<DashboardOverviewResponse> {
    const [overviewRow] = await this.queryExecutor.execute<DashboardOverviewRow>(`
      SELECT *
      FROM dashboard_overview_cache
    `);

    const trendRows = await this.queryExecutor.execute<DashboardTrendRow>(`
      WITH latest_date AS (
        SELECT MAX(CAST(fecha AS DATE)) AS latest_date
        FROM dashboard_trend_cache
      )
      SELECT
        CAST(fecha AS VARCHAR) AS fecha,
        averagePrice
      FROM dashboard_trend_cache, latest_date
      WHERE CAST(fecha AS DATE) >= ${getRangeLowerBoundSql("latest_date.latest_date", range)}
      ORDER BY fecha ASC
    `);

    const marketCardRows = await this.queryExecutor.execute<DashboardMarketCardRow>(`
      WITH latest_date AS (
        SELECT MAX(CAST(fecha AS DATE)) AS latest_date
        FROM sisap_product_trend_cache
      )
      SELECT
        productoNombre,
        CAST(fecha AS VARCHAR) AS fecha,
        AVG(averagePrice) AS averagePrice,
        SUM(totalVolumeTon) AS totalVolumeTon
      FROM sisap_product_trend_cache, latest_date
      WHERE CAST(fecha AS DATE) >= ${getRangeLowerBoundSql("latest_date.latest_date", range)}
      GROUP BY productoNombre, CAST(fecha AS VARCHAR)
      ORDER BY productoNombre ASC, fecha ASC
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

    const trend = sortByFechaAsc(
      trendRows.map((row) => ({
        fecha: row.fecha,
        averagePrice: toRequiredNumber(row.averagePrice)
      }))
    ) as DashboardTrendPoint[];

    const marketCards = buildMarketCards(marketCardRows);

    const topProducts: DashboardTopProduct[] = topProductRows.map((row) => ({
      productoNombre: row.productoNombre,
      averagePrice: toNullableNumber(row.averagePrice),
      minPrice: toNullableNumber(row.minPrice),
      maxPrice: toNullableNumber(row.maxPrice),
      recordCount: toRequiredNumber(row.recordCount),
      totalVolumeTon: toNullableNumber(row.totalVolumeTon)
    }));

    const overallAverage = toNullableNumber(overviewRow?.overallAverage);
    const totalVolumeTon = toNullableNumber(overviewRow?.totalVolumeTon);
    const averageVolumeTon = toNullableNumber(overviewRow?.averageVolumeTon);

    return {
      range,
      overview: {
        latestDate: overviewRow?.latestDate ?? null,
        analyzedRows: toRequiredNumber(overviewRow?.analyzedRows),
        productCount: toRequiredNumber(overviewRow?.productCount),
        originCount: toRequiredNumber(overviewRow?.originCount),
        overallAverage,
        totalVolumeTon,
        averageVolumeTon
      },
      trend,
      marketCards,
      topProducts,
      recommendation: buildRecommendation(trend, overallAverage, totalVolumeTon, averageVolumeTon),
      alerts: []
    };
  }
}

function buildMarketCards(rows: DashboardMarketCardRow[]): DashboardMarketCard[] {
  const grouped = new Map<string, DashboardMarketCardRow[]>();

  for (const row of rows) {
    const entries = grouped.get(row.productoNombre) ?? [];
    entries.push(row);
    grouped.set(row.productoNombre, entries);
  }

  return Array.from(grouped.entries())
    .map(([productoNombre, entries]) => {
      const orderedEntries = [...entries].sort((left, right) => left.fecha.localeCompare(right.fecha));
      const firstPrice = toRequiredNumber(orderedEntries[0]?.averagePrice);
      const latestEntry = orderedEntries[orderedEntries.length - 1];
      const latestPrice = toRequiredNumber(latestEntry?.averagePrice);
      const deltaPct = firstPrice > 0 ? ((latestPrice - firstPrice) / firstPrice) * 100 : 0;
      const deltaDirection = latestPrice > firstPrice ? "up" : latestPrice < firstPrice ? "down" : "none";

      return {
        productoNombre,
        latestPrice,
        deltaPct: Math.abs(deltaPct),
        deltaDirection,
        series: orderedEntries.map((entry) => ({
          fecha: entry.fecha,
          averagePrice: toRequiredNumber(entry.averagePrice),
          totalVolumeTon: toNullableNumber(entry.totalVolumeTon) ?? 0
        })),
        latestDate: latestEntry?.fecha ?? ""
      } satisfies DashboardMarketCard;
    })
    .sort((left, right) => right.latestPrice - left.latestPrice)
    .slice(0, 12);
}

function getRangeLowerBoundSql(latestDateSql: string, range: DashboardRange): string {
  switch (range) {
    case "7d":
      return `${latestDateSql} - INTERVAL 6 DAY`;
    case "30d":
      return `${latestDateSql} - INTERVAL 29 DAY`;
    case "3m":
      return `${latestDateSql} - INTERVAL 3 MONTH`;
    case "1a":
      return `${latestDateSql} - INTERVAL 1 YEAR`;
    default:
      return `${latestDateSql} - INTERVAL 29 DAY`;
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
