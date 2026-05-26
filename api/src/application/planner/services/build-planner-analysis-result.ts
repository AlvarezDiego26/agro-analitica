import type {
  PlannerAlternativeCandidate,
  PlannerAnalysisInput,
  PlannerAnalysisResponse,
  PlannerPriceProjectionPoint,
  PlannerProductAnalysisSnapshot
} from "../../../domain/planner/entities/planner-analysis.entity.js";

export function buildPlannerAnalysisResult(
  input: PlannerAnalysisInput,
  row?: PlannerProductAnalysisSnapshot | null,
  extras?: {
    priceProjection?: PlannerPriceProjectionPoint[];
    recommendedAlternatives?: PlannerAlternativeCandidate[];
  }
): PlannerAnalysisResponse {
  const averagePrice = row?.averagePrice ?? 0;
  const latestPrice = row?.latestPrice ?? averagePrice;
  const estimatedRoi = normalizeRoi(row?.estimatedRoi);
  const riskLevel = normalizeRiskLevel(row?.riskLevel, estimatedRoi);
  const priceProjection = normalizePriceProjection(extras?.priceProjection, input.fechaSiembra, {
    fallbackPrice: latestPrice || averagePrice,
    fallbackVolumeTon: row?.averageVolumeTon ?? null
  });
  const sowingPrice = findProjectionPrice(priceProjection, input.fechaSiembra) ?? latestPrice;
  const harvestPrice = findProjectionPrice(priceProjection, input.fechaCosecha) ?? latestPrice;
  const hasUserInvestment = typeof input.inversionPen === "number" && input.inversionPen > 0;

  return {
    input,
    result: {
      riskLevel,
      estimatedRoi,
      averagePrice,
      latestPrice,
      usesUserInvestment: hasUserInvestment,
      sowingPrice,
      harvestPrice,
      windowPriceSignal: computeWindowPriceSignal(sowingPrice, harvestPrice),
      averageVolumeTon: row?.averageVolumeTon ?? null,
      title: row?.title?.trim() || toRiskTitle(riskLevel),
      summary: row?.summary?.trim() || toRiskSummary(riskLevel),
      explanation: row?.explanation?.trim() || "No hay explicacion analitica disponible en el snapshot DuckDB.",
      projectedLossPen: computeProjectedAmount(estimatedRoi, input.inversionPen, "loss"),
      projectedProfitPen: computeProjectedAmount(estimatedRoi, input.inversionPen, "profit"),
      historicalDeltaPct: computeHistoricalDeltaPct(averagePrice, row?.maxPrice ?? null),
      aiExplanation: row?.explanation?.trim(),
      priceProjection,
      recommendedAlternatives: normalizeRecommendedAlternatives(extras?.recommendedAlternatives)
    }
  };
}

function normalizeRoi(value: number | null | undefined): number {
  return clampRoi(value ?? 0);
}

function normalizeRiskLevel(
  value: string | null | undefined,
  estimatedRoi: number
): PlannerAnalysisResponse["result"]["riskLevel"] {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "high" || normalized === "alto") {
    return "high";
  }

  if (normalized === "medium" || normalized === "medio") {
    return "medium";
  }

  if (normalized === "low" || normalized === "bajo") {
    return "low";
  }

  return estimatedRoi <= 0 ? "high" : estimatedRoi <= 10 ? "medium" : "low";
}

function toRiskTitle(riskLevel: PlannerAnalysisResponse["result"]["riskLevel"]): string {
  return riskLevel === "high" ? "ALTO" : riskLevel === "medium" ? "MEDIO" : "BAJO";
}

function toRiskSummary(riskLevel: PlannerAnalysisResponse["result"]["riskLevel"]): string {
  return riskLevel === "high"
    ? "No recomendado en esta ventana"
    : riskLevel === "medium"
      ? "Conviene validar mas senales antes de sembrar"
      : "Ventana razonable segun el precio reciente";
}

function normalizePriceProjection(
  rows: PlannerPriceProjectionPoint[] | undefined,
  fechaSiembra: string | undefined,
  fallback: { fallbackPrice: number; fallbackVolumeTon: number | null }
): PlannerAnalysisResponse["result"]["priceProjection"] {
  if ((!rows || rows.length === 0) && fallback.fallbackPrice <= 0) {
    return undefined;
  }

  const allMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const baseDate = fechaSiembra ? new Date(fechaSiembra) : new Date();
  const baseYear = Number.isNaN(baseDate.getTime()) ? new Date().getUTCFullYear() : baseDate.getUTCFullYear();
  const baseMonth = Number.isNaN(baseDate.getTime()) ? new Date().getUTCMonth() : baseDate.getUTCMonth();
  const sourceRows =
    rows && rows.length > 1
      ? rows
      : buildCarryForwardProjectionRows(rows?.[0], baseMonth, fallback.fallbackPrice, fallback.fallbackVolumeTon);

  return sourceRows
    .filter((row) => row.predictedPrice !== null)
    .map((row, index) => {
      const label = row.month?.trim() || row.monthLabel?.trim() || allMonths[(baseMonth + index) % 12];
      const monthIndex = allMonths.findIndex(
        (month) => month.toLowerCase() === label.toLowerCase().substring(0, 3)
      );
      const resolvedMonthIndex = monthIndex >= 0 ? monthIndex : (baseMonth + index) % 12;
      const year = resolvedMonthIndex < baseMonth ? baseYear + 1 : baseYear;

      return {
        month: allMonths[resolvedMonthIndex],
        year,
        historicalPrice: row.historicalPrice ?? null,
        predictedPrice: row.predictedPrice ?? 0,
        oversupplyZone: Boolean(row.oversupplyZone),
        isLowPoint: Boolean(row.isLowPoint),
        weeklyBreakdown: row.weeklyBreakdown,
        volumeTon: row.volumeTon ?? null
      };
    });
}

function buildCarryForwardProjectionRows(
  row: PlannerPriceProjectionPoint | undefined,
  baseMonth: number,
  fallbackPrice: number,
  fallbackVolumeTon: number | null
): PlannerPriceProjectionPoint[] {
  const price = row?.predictedPrice ?? row?.historicalPrice ?? fallbackPrice;

  if (price <= 0) {
    return [];
  }

  const allMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const startMonth = baseMonth;

  return Array.from({ length: 8 }, (_, index) => {
    const monthLabel = allMonths[(startMonth + index) % 12];

    return {
      month: monthLabel,
      monthLabel,
      historicalPrice: row?.historicalPrice ?? price,
      predictedPrice: price,
      oversupplyZone: false,
      isLowPoint: false,
      volumeTon: row?.volumeTon ?? fallbackVolumeTon
    };
  });
}

function normalizeRecommendedAlternatives(
  rows: PlannerAlternativeCandidate[] | undefined
): PlannerAnalysisResponse["result"]["recommendedAlternatives"] {
  if (!rows || rows.length === 0) {
    return undefined;
  }

  const normalizedRows = rows
    .filter((row) => row.producto.trim().length > 0)
    .map((row) => {
      const estimatedRoi = clampRoi(row.estimatedRoi ?? 0);
      const riskLevel = normalizeRiskLevel(row.riskLevel, estimatedRoi);

      return {
        producto: row.producto.trim(),
        estimatedRoi,
        riskLevel,
        riskLabel: row.riskLabel?.trim() || toRiskBadgeLabel(riskLevel),
        projectedPricePen: row.projectedPricePen ?? 0,
        message: row.message?.trim() || ""
      };
    });

  return normalizedRows.length > 0 ? normalizedRows : undefined;
}

function findProjectionPrice(
  rows: PlannerAnalysisResponse["result"]["priceProjection"],
  dateValue?: string
): number | null {
  if (!rows || !dateValue) {
    return null;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const allMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const month = allMonths[date.getUTCMonth()];
  return rows.find((row) => row.month === month)?.predictedPrice ?? null;
}

function computeWindowPriceSignal(sowingPrice: number | null, harvestPrice: number | null): "up" | "same" | "down" {
  if (sowingPrice === null || harvestPrice === null) {
    return "same";
  }

  const diff = harvestPrice - sowingPrice;
  const tolerance = Math.max(0.01, Math.abs(sowingPrice) * 0.01);

  if (diff > tolerance) {
    return "up";
  }

  if (Math.abs(diff) <= tolerance) {
    return "same";
  }

  return "down";
}

function computeProjectedAmount(
  estimatedRoi: number,
  investment: number | undefined,
  type: "loss" | "profit"
): number | null {
  if (!investment || investment <= 0) {
    return null;
  }

  if (type === "loss" && estimatedRoi >= 0) {
    return null;
  }

  if (type === "profit" && estimatedRoi <= 0) {
    return null;
  }

  return Number(((estimatedRoi / 100) * investment).toFixed(0));
}

function computeHistoricalDeltaPct(averagePrice: number, maxPrice: number | null): number | null {
  if (!maxPrice || maxPrice <= 0) {
    return null;
  }

  return Number((((averagePrice - maxPrice) / maxPrice) * 100).toFixed(0));
}

function toRiskBadgeLabel(riskLevel: PlannerAnalysisResponse["result"]["riskLevel"]): string {
  return riskLevel === "high" ? "Riesgo alto" : riskLevel === "medium" ? "Riesgo medio" : "Riesgo bajo";
}

function clampRoi(value: number): number {
  return Math.max(-80, Math.min(120, Math.round(value)));
}
