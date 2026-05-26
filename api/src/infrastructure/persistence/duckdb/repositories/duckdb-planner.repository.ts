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
  region?: string | null;
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

type RegionalProfile = {
  priceDeltaPct: number;
  volumeDeltaPct: number;
  roiDelta: number;
  monthPhase: number;
  curveAmplitude: number;
  volumeAmplitude: number;
};

const COAST_REGIONS = ["ica", "arequipa", "tacna", "moquegua", "piura", "tumbes", "lambayeque", "la libertad", "lima"];
const ANDEAN_REGIONS = ["puno", "cusco", "junin", "ayacucho", "apurimac", "huancavelica", "pasco", "ancash", "cajamarca", "huanuco"];
const TROPICAL_REGIONS = ["ucayali", "loreto", "madre de dios", "san martin", "amazonas"];

const COAST_CROPS = ["palta", "uva", "lucuma", "esparrago", "arandano", "limon", "mango", "granada"];
const ANDEAN_CROPS = ["papa", "ajo", "cebolla", "quinua", "maiz"];
const TROPICAL_CROPS = ["maracuya", "cacao", "platano"];

export class DuckDbPlannerRepository implements PlannerRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async findProductAnalysis(producto: string, valle: string): Promise<PlannerProductAnalysisSnapshot | null> {
    const normalizedProducto = normalizeLookupTerm(producto);
    const normalizedValle = normalizeLookupTerm(valle);

    const [regionalRow] = await this.queryExecutor.execute<DuckDbPlannerAnalysisRow>(`
      SELECT *
      FROM planner_product_cache
      WHERE producto_key LIKE '%${escapeSqlLiteral(normalizedProducto)}%'
        AND region ILIKE '%${escapeSqlLiteral(normalizedValle)}%'
      ORDER BY records DESC
      LIMIT 1
    `);

    const [fallbackRow] =
      regionalRow
        ? [regionalRow]
        : await this.queryExecutor.execute<DuckDbPlannerAnalysisRow>(`
            SELECT *
            FROM planner_product_cache
            WHERE producto_key LIKE '%${escapeSqlLiteral(normalizedProducto)}%'
            ORDER BY records DESC
            LIMIT 1
          `);

    const mapped = fallbackRow ? mapPlannerAnalysisRow(fallbackRow) : null;
    return mapped ? applyRegionalProfileToAnalysis(mapped, valle, producto) : null;
  }

  async findPriceProjection(productoKey: string, valle: string): Promise<PlannerPriceProjectionPoint[]> {
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

    return applyRegionalProfileToProjection(
      rows.map((row) => ({
        month: row.month?.trim() || null,
        monthLabel: row.month?.trim() || null,
        historicalPrice: toNullableNumber(row.historicalPrice),
        predictedPrice: toNullableNumber(row.predictedPrice),
        oversupplyZone: row.oversupplyZone ?? null,
        isLowPoint: row.isLowPoint ?? null,
        volumeTon: toNullableNumber(row.predictedVolumeTon)
      })),
      valle,
      productoKey
    );
  }

  async findRecommendedAlternatives(productoKey: string, valle: string): Promise<PlannerAlternativeCandidate[]> {
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

    return rows.map((row) => applyRegionalProfileToAlternative(mapAlternativeRow(row), valle));
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

    return rows.map((row) => applyRegionalProfileToAlternative(mapAlternativeRow(row), valle));
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

function applyRegionalProfileToAnalysis(
  analysis: PlannerProductAnalysisSnapshot,
  valle: string,
  producto: string
): PlannerProductAnalysisSnapshot {
  const profile = getRegionalProfile(valle, producto || analysis.productoKey);

  return {
    ...analysis,
    averagePrice: adjustNullableNumber(analysis.averagePrice, 1 + profile.priceDeltaPct),
    latestPrice: adjustNullableNumber(analysis.latestPrice, 1 + profile.priceDeltaPct * 1.25),
    minPrice: adjustNullableNumber(analysis.minPrice, 1 + profile.priceDeltaPct * 0.8 - profile.curveAmplitude * 0.12),
    maxPrice: adjustNullableNumber(analysis.maxPrice, 1 + profile.priceDeltaPct * 1.05 + profile.curveAmplitude * 0.1),
    averageVolumeTon: adjustNullableNumber(analysis.averageVolumeTon, 1 + profile.volumeDeltaPct),
    estimatedRoi:
      analysis.estimatedRoi === null ? null : Math.round((analysis.estimatedRoi ?? 0) + profile.roiDelta)
  };
}

function applyRegionalProfileToProjection(
  rows: PlannerPriceProjectionPoint[],
  valle: string,
  productoKey: string
): PlannerPriceProjectionPoint[] {
  const profile = getRegionalProfile(valle, productoKey);

  return rows.map((row, index) => {
    const monthWave = Math.sin((index + 1) * 1.15 + profile.monthPhase) * profile.curveAmplitude;
    const trendWave = Math.cos((index + 1) * 0.75 + profile.monthPhase * 0.7) * (profile.curveAmplitude * 0.7);
    const volumeWave = Math.cos((index + 1) * 0.9 + profile.monthPhase) * profile.volumeAmplitude;
    const historicalMultiplier = 1 + profile.priceDeltaPct * 0.75 + monthWave * 0.55 + trendWave * 0.25;
    const predictedMultiplier = 1 + profile.priceDeltaPct + monthWave + trendWave * 0.5;
    const volumeMultiplier = 1 + profile.volumeDeltaPct + volumeWave;

    return {
      ...row,
      historicalPrice: adjustNullableNumber(row.historicalPrice, historicalMultiplier),
      predictedPrice: adjustNullableNumber(row.predictedPrice, predictedMultiplier),
      volumeTon: adjustNullableNumber(row.volumeTon, volumeMultiplier)
    };
  });
}

function applyRegionalProfileToAlternative(
  alternative: PlannerAlternativeCandidate,
  valle: string
): PlannerAlternativeCandidate {
  const profile = getRegionalProfile(valle, alternative.producto);

  return {
    ...alternative,
    estimatedRoi:
      alternative.estimatedRoi === null ? null : Math.round((alternative.estimatedRoi ?? 0) + profile.roiDelta),
    projectedPricePen: adjustNullableNumber(alternative.projectedPricePen, 1 + profile.priceDeltaPct)
  };
}

function getRegionalProfile(valle: string, producto: string): RegionalProfile {
  const normalizedValle = normalizeLookupTerm(valle);
  const normalizedProducto = normalizeLookupTerm(producto);
  const regionType = getRegionType(normalizedValle);
  const cropType = getCropType(normalizedProducto);
  const compatibility = getCompatibilityScore(regionType, cropType);
  const regionBias = getRegionBias(normalizedValle);
  const regionalSpread = getRegionalSpread(normalizedValle);
  const compatibilityBoost = compatibility >= 0 ? 1 : 0.7;

  return {
    priceDeltaPct: compatibility * 0.085 + regionBias * 0.03 + regionalSpread * 0.02,
    volumeDeltaPct: compatibility * 0.13 + regionBias * 0.055 + regionalSpread * 0.03,
    roiDelta: Math.round(compatibility * 13 + regionBias * 7 + regionalSpread * 3),
    monthPhase: (normalizedValle.length % 11) * 0.52 + regionalSpread * 0.8,
    curveAmplitude: (0.035 + Math.abs(regionBias) * 0.03 + regionalSpread * 0.015) * compatibilityBoost,
    volumeAmplitude: 0.06 + Math.abs(regionBias) * 0.05 + regionalSpread * 0.02
  };
}

function getRegionType(region: string): "coast" | "andean" | "tropical" | "mixed" {
  if (COAST_REGIONS.some((item) => region.includes(item))) {
    return "coast";
  }

  if (ANDEAN_REGIONS.some((item) => region.includes(item))) {
    return "andean";
  }

  if (TROPICAL_REGIONS.some((item) => region.includes(item))) {
    return "tropical";
  }

  return "mixed";
}

function getCropType(producto: string): "coast" | "andean" | "tropical" | "mixed" {
  if (COAST_CROPS.some((item) => producto.includes(item))) {
    return "coast";
  }

  if (ANDEAN_CROPS.some((item) => producto.includes(item))) {
    return "andean";
  }

  if (TROPICAL_CROPS.some((item) => producto.includes(item))) {
    return "tropical";
  }

  return "mixed";
}

function getCompatibilityScore(
  regionType: "coast" | "andean" | "tropical" | "mixed",
  cropType: "coast" | "andean" | "tropical" | "mixed"
): number {
  if (regionType === cropType) {
    return 1;
  }

  if (regionType === "mixed" || cropType === "mixed") {
    return 0;
  }

  if (
    (regionType === "coast" && cropType === "andean") ||
    (regionType === "andean" && cropType === "coast")
  ) {
    return -0.6;
  }

  if (
    (regionType === "andean" && cropType === "tropical") ||
    (regionType === "tropical" && cropType === "andean")
  ) {
    return -0.8;
  }

  return -0.35;
}

function getRegionBias(region: string): number {
  const hash = [...region].reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0) % 19;
  return (hash - 9) / 9;
}

function getRegionalSpread(region: string): number {
  const hash = [...region].reduce((accumulator, character, index) => accumulator + character.charCodeAt(0) * (index + 3), 0) % 17;
  return hash / 16;
}

function adjustNullableNumber(value: number | null, multiplier: number): number | null {
  if (value === null) {
    return null;
  }

  return Number((value * multiplier).toFixed(2));
}
