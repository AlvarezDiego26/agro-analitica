import type {
  PlannerAlternativeCandidate,
  PlannerPriceProjectionPoint,
  PlannerProductAnalysisSnapshot
} from "../../../../domain/planner/entities/planner-analysis.entity.js";
import type { PlannerRepository } from "../../../../domain/planner/ports/planner.repository.js";
import {
  escapeSqlLiteral,
  normalizeLookupTerm,
  toNullableNumber,
  toRequiredNumber
} from "../../shared/repository-helpers.js";
import { DuckDbQueryExecutor } from "../clients/duckdb-query-executor.js";

type DuckDbPlannerAnalysisRow = {
  producto_key?: string | null;
  averagePrice?: number | string | null;
  latestPrice?: number | string | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  averageVolumeTon?: number | string | null;
  records?: number | string | null;
  latestDate?: string | null;
  estimatedRoi?: number | string | null;
  riskLevel?: string | null;
  title?: string | null;
  summary?: string | null;
  explanation?: string | null;
};

type DuckDbPlannerProjectionRow = {
  month?: string | null;
  historicalPrice?: number | string | null;
  predictedPrice?: number | string | null;
  oversupplyZone?: boolean | null;
  isLowPoint?: boolean | null;
  predictedVolumeTon?: number | string | null;
};

type DuckDbPlannerAlternativeRow = {
  producto?: string | null;
  estimatedRoi?: number | string | null;
  riskLevel?: string | null;
  riskLabel?: string | null;
  projectedPricePen?: number | string | null;
  message?: string | null;
};

export class DuckDbPlannerRepository implements PlannerRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async findProductAnalysis(producto: string, valle: string): Promise<PlannerProductAnalysisSnapshot | null> {
    const normalizedProducto = normalizeLookupTerm(producto);
    const normalizedValle = normalizeLookupTerm(valle);

    const [row] = await this.queryExecutor.execute<DuckDbPlannerAnalysisRow>(`
      SELECT *
      FROM planner_product_cache
      WHERE producto_key LIKE '%${escapeSqlLiteral(normalizedProducto)}%'
        AND region ILIKE '%${escapeSqlLiteral(normalizedValle)}%'
      ORDER BY records DESC
      LIMIT 1
    `);

    return row ? mapPlannerAnalysisRow(row) : null;
  }

  async findPriceProjection(productoKey: string, _valle: string): Promise<PlannerPriceProjectionPoint[]> {
    const rows = await this.queryExecutor.execute<DuckDbPlannerProjectionRow>(`
      SELECT
        monthLabel AS month,
        historicalPrice,
        predictedPrice,
        oversupplyZone,
        isLowPoint,
        predictedVolumeTon
      FROM planner_price_projection_cache
      WHERE producto_key = '${escapeSqlLiteral(productoKey)}'
      ORDER BY CASE monthLabel
        WHEN 'Mar' THEN 1
        WHEN 'Abr' THEN 2
        WHEN 'May' THEN 3
        WHEN 'Jun' THEN 4
        WHEN 'Jul' THEN 5
        WHEN 'Ago' THEN 6
        WHEN 'Sep' THEN 7
        WHEN 'Oct' THEN 8
        WHEN 'Nov' THEN 9
        WHEN 'Dic' THEN 10
        WHEN 'Ene' THEN 11
        WHEN 'Feb' THEN 12
        ELSE 99
      END
    `);

    return rows.map((row) => ({
      month: row.month?.trim() || null,
      monthLabel: row.month?.trim() || null,
      historicalPrice: toNullableNumber(row.historicalPrice),
      predictedPrice: toNullableNumber(row.predictedPrice),
      oversupplyZone: row.oversupplyZone ?? null,
      isLowPoint: row.isLowPoint ?? null,
      volumeTon: toNullableNumber(row.predictedVolumeTon)
    }));
  }

  async findRecommendedAlternatives(productoKey: string, _valle: string): Promise<PlannerAlternativeCandidate[]> {
    const rows = await this.queryExecutor.execute<DuckDbPlannerAlternativeRow>(`
      SELECT
        productoNombre AS producto,
        estimatedRoi,
        riskLevel,
        riskLabel,
        projectedPricePen,
        message
      FROM planner_recommended_alternatives_cache
      WHERE source_producto_key = '${escapeSqlLiteral(productoKey)}'
      ORDER BY estimatedRoi DESC
    `);

    return rows.map(mapAlternativeRow);
  }

  async findRegionalAlternatives(valle: string): Promise<PlannerAlternativeCandidate[]> {
    const rows = await this.queryExecutor.execute<DuckDbPlannerAlternativeRow>(`
      SELECT
        productoNombre AS producto,
        estimatedRoi,
        riskLevel,
        title AS riskLabel,
        latestPrice AS projectedPricePen,
        explanation AS message
      FROM planner_product_cache
      WHERE region ILIKE '%${escapeSqlLiteral(valle)}%'
      ORDER BY estimatedRoi DESC
      LIMIT 3
    `);

    return rows.map(mapAlternativeRow);
  }
}

function mapPlannerAnalysisRow(row: DuckDbPlannerAnalysisRow): PlannerProductAnalysisSnapshot {
  return {
    productoKey: row.producto_key?.trim() || "",
    averagePrice: toNullableNumber(row.averagePrice),
    latestPrice: toNullableNumber(row.latestPrice),
    minPrice: toNullableNumber(row.minPrice),
    maxPrice: toNullableNumber(row.maxPrice),
    averageVolumeTon: toNullableNumber(row.averageVolumeTon),
    records: toRequiredNumber(row.records),
    latestDate: row.latestDate ?? null,
    estimatedRoi: toNullableNumber(row.estimatedRoi),
    riskLevel: row.riskLevel?.trim() || null,
    title: row.title?.trim() || null,
    summary: row.summary?.trim() || null,
    explanation: row.explanation?.trim() || null
  };
}

function mapAlternativeRow(row: DuckDbPlannerAlternativeRow): PlannerAlternativeCandidate {
  return {
    producto: row.producto?.trim() || "",
    estimatedRoi: toNullableNumber(row.estimatedRoi),
    riskLevel: row.riskLevel?.trim() || null,
    riskLabel: row.riskLabel?.trim() || null,
    projectedPricePen: toNullableNumber(row.projectedPricePen),
    message: row.message?.trim() || null
  };
}
