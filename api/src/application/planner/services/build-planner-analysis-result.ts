import type {
  PlannerAlternativeCandidate,
  PlannerAnalysisInput,
  PlannerPriceProjectionPoint,
  PlannerProductAnalysisSnapshot,
  PlannerAnalysisResponse
} from "../../../domain/planner/entities/planner-analysis.entity.js";

const CROP_DURATIONS_MONTHS: Record<string, number> = {
  "esparrago": 4,
  "esparrago verde": 4,
  "papa": 5,
  "cebolla": 4,
  "arandano": 8,
  "palta": 12,
  "uva": 6,
  "maiz": 5,
  "default": 4
};

const ANDEAN_REGIONS = ["puno", "cusco", "huancavelica", "pasco", "apurimac", "ayacucho", "ancash", "junin"];
const COASTAL_WARM_CROPS = ["lucuma", "mango", "limon", "esparrago", "uva", "arandano", "maracuya"];
const TROPICAL_REGIONS = ["loreto", "ucayali", "madre de dios", "san martin", "piura", "tumbes"];
const COLD_CLIMATE_CROPS = ["papa", "quinua"];

export function buildPlannerAnalysisResult(
  input: PlannerAnalysisInput,
  row?: PlannerProductAnalysisSnapshot | null,
  extras?: {
    projectedLossPen?: number | null;
    historicalDeltaPct?: number | null;
    aiExplanation?: string | null;
    priceProjection?: PlannerPriceProjectionPoint[];
    recommendedAlternatives?: PlannerAlternativeCandidate[];
  }
): PlannerAnalysisResponse {
  const baseAveragePrice = row?.averagePrice ?? 0;
  const maxPrice = row?.maxPrice ?? null;
  const averageVolumeTon = row?.averageVolumeTon ?? null;
  const records = row?.records ?? 0;

  const prodKey = row?.productoKey?.toLowerCase() || input.producto.toLowerCase();
  const duration = CROP_DURATIONS_MONTHS[prodKey] || CROP_DURATIONS_MONTHS["default"];

  const sowingDateObj = input.fechaSiembra ? new Date(input.fechaSiembra) : new Date();
  const harvestDateObj = input.fechaCosecha ? new Date(input.fechaCosecha) : new Date(sowingDateObj);
  if (!input.fechaCosecha || Number.isNaN(harvestDateObj.getTime())) {
    harvestDateObj.setMonth(sowingDateObj.getMonth() + duration);
  }

  const harvestMonthIndex = harvestDateObj.getMonth();
  const sowingMonthIndex = sowingDateObj.getMonth();
  const allMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const harvestMonthLabel = allMonths[harvestMonthIndex];
  const sowingMonthLabel = allMonths[sowingMonthIndex];

  let harvestPrice = baseAveragePrice;
  let sowingPrice = baseAveragePrice;
  if (extras?.priceProjection && extras.priceProjection.length > 0) {
    const sowingRow = extras.priceProjection.find(
      (projection) =>
        projection.month?.substring(0, 3) === sowingMonthLabel ||
        projection.monthLabel?.substring(0, 3) === sowingMonthLabel
    );
    const harvestRow = extras.priceProjection.find(
      (projection) =>
        projection.month?.substring(0, 3) === harvestMonthLabel ||
        projection.monthLabel?.substring(0, 3) === harvestMonthLabel
    );

    if (sowingRow) {
      sowingPrice = toNullableNumber(sowingRow.predictedPrice) ?? sowingPrice;
    }

    if (harvestRow) {
      harvestPrice = toNullableNumber(harvestRow.predictedPrice) ?? harvestPrice;
    }
  }

  const averagePrice = computeWindowAveragePrice(
    extras?.priceProjection,
    sowingDateObj,
    harvestDateObj,
    sowingPrice,
    harvestPrice,
    baseAveragePrice
  );
  const latestPrice = harvestPrice;
  const windowPriceSignal = computeWindowPriceSignal(sowingPrice, harvestPrice);
  const cachedRoi = row?.estimatedRoi ?? null;
  const hasUserInvestment = typeof input.inversionPen === "number" && input.inversionPen > 0;
  const estimatedInvestmentPen = getEstimatedCampaignInvestment(input.hectareas, input.producto, input.tipoMercado);
  const estimatedRoi = computeScaleAwareRoi(
    cachedRoi,
    sowingPrice,
    harvestPrice,
    averagePrice,
    maxPrice,
    input.hectareas,
    input.tipoMercado,
    input.producto,
    input.valle,
    input.inversionPen,
    estimatedInvestmentPen
  );
  const riskLevel = normalizeRiskLevel(estimatedRoi);
  const cachedRiskLevel = normalizeStoredRiskLevel(row?.riskLevel);
  const canReuseStoredRiskCopy = cachedRiskLevel === riskLevel;
  const title = canReuseStoredRiskCopy ? row?.title?.trim() || toRiskTitle(riskLevel) : toRiskTitle(riskLevel);
  const summary = canReuseStoredRiskCopy ? row?.summary?.trim() || toRiskSummary(riskLevel) : toRiskSummary(riskLevel);
  const explanation =
    row?.explanation?.trim() ||
    `DuckDB consolida ${records} registros recientes para ${input.producto}. El precio promedio del periodo es S/ ${averagePrice.toFixed(
      2
    )}, con siembra alrededor de S/ ${sowingPrice.toFixed(2)} y proyeccion de cosecha en S/ ${harvestPrice.toFixed(2)} para ${harvestMonthLabel}.`;

  const historicalDeltaPct = extras?.historicalDeltaPct ?? computeHistoricalDeltaPct(averagePrice, maxPrice);
  const projectedLossPen = hasUserInvestment ? computeProjectedLossPen(estimatedRoi, input.inversionPen ?? 0) : null;
  const projectedProfitPen = hasUserInvestment ? computeProjectedProfitPen(estimatedRoi, input.inversionPen ?? 0) : null;
  const baseExplanation = extras?.aiExplanation?.trim() || explanation;
  const aiExplanation = buildSmartExplanation(
    baseExplanation,
    input.tipoMercado,
    input.hectareas,
    harvestMonthLabel,
    duration,
    estimatedRoi,
    riskLevel,
    windowPriceSignal,
    input.valle,
    input.producto,
    input.inversionPen,
    estimatedInvestmentPen
  );
  const priceProjection = normalizePriceProjection(extras?.priceProjection, input.fechaSiembra);
  const recommendedAlternatives = normalizeRecommendedAlternatives(extras?.recommendedAlternatives, input.valle);

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
      windowPriceSignal,
      averageVolumeTon,
      title,
      summary,
      explanation,
      projectedLossPen,
      projectedProfitPen,
      historicalDeltaPct,
      aiExplanation,
      priceProjection,
      recommendedAlternatives
    }
  };
}

function computeScaleAwareRoi(
  baseCachedRoi: number | null,
  sowingPrice: number,
  harvestPrice: number,
  averagePrice: number,
  maxHistoricalPrice: number | null,
  hectareas: number,
  tipoMercado: string | undefined,
  producto: string,
  valle: string,
  inversionPen?: number,
  estimatedInvestmentPen?: number
): number {
  const mkt = (tipoMercado || "exportacion").toLowerCase();
  const prod = normalizeText(producto);
  const region = normalizeText(valle);

  let roi = baseCachedRoi !== null ? baseCachedRoi * getCachedRoiWeight(mkt) : 10;

  if (averagePrice > 0) {
    const priceRatio = (harvestPrice - averagePrice) / averagePrice;
    roi += priceRatio * 180;
  }

  if (maxHistoricalPrice && maxHistoricalPrice > 0) {
    const historicalPressure = (averagePrice - maxHistoricalPrice) / maxHistoricalPrice;
    roi += historicalPressure * 90;
  }

  if (sowingPrice > 0) {
    const windowRatio = (harvestPrice - sowingPrice) / sowingPrice;
    roi += windowRatio * 180;
  }

  if (hasAndeanWarmCropMismatch(region, prod)) {
    roi -= 80;
  }

  if (hasTropicalColdCropMismatch(region, prod)) {
    roi -= 50;
  }

  const exportProducts = ["esparrago", "arandano", "palta", "uva", "pimiento", "lucuma", "granada"];
  const isExportFriendly = exportProducts.some((item) => prod.includes(item));

  if (mkt === "exportacion") {
    if (!isExportFriendly) {
      roi -= 10;
    }
    roi += getScaleAdjustment(hectareas, "exportacion");
  } else if (mkt === "industrial") {
    roi += getScaleAdjustment(hectareas, "industrial");
  } else {
    if (isExportFriendly) {
      roi -= 5;
    }
    roi += getScaleAdjustment(hectareas, "local");
  }

  roi += getWindowScalePenalty(hectareas, mkt, sowingPrice, harvestPrice);
  roi += getHistoricalRealityPenalty(mkt, averagePrice, maxHistoricalPrice, hectareas);
  roi += getCapitalCoveragePenalty(inversionPen, estimatedInvestmentPen, hectareas);

  return clampRoi(roi);
}

function buildSmartExplanation(
  base: string,
  tipoMercado: string | undefined,
  hectareas: number,
  harvestMonthLabel: string,
  duration: number,
  roi: number,
  riskLevel: string,
  windowPriceSignal: "up" | "same" | "down",
  valle: string,
  producto: string,
  inversionPen?: number,
  effectiveInvestmentPen?: number
): string {
  const mkt = (tipoMercado || "exportacion").toLowerCase();
  const region = normalizeText(valle);
  const prod = normalizeText(producto);

  let climateWarning = "";
  if (hasAndeanWarmCropMismatch(region, prod)) {
    climateWarning = ` Alerta climatica: ${producto} no es apto para el clima de altitud de ${valle}. Se proyecta alta mortalidad del cultivo.`;
  } else if (hasTropicalColdCropMismatch(region, prod)) {
    climateWarning = ` Alerta climatica: ${producto} requiere climas mas frios y no se recomienda para ${valle}.`;
  }

  let scaleWarning = "";
  if (mkt === "local" && hectareas > 10) {
    scaleWarning = ` Sembrar ${hectareas} ha. para mercado local genera alto riesgo de sobreoferta. Sugerimos buscar contratos industriales o exportar.`;
  } else if (mkt === "exportacion" && hectareas < 5) {
    scaleWarning = ` Para solo ${hectareas} ha., los costos logisticos fijos de exportacion penalizan el margen.`;
  } else if (mkt === "exportacion" && hectareas >= 15) {
    scaleWarning = ` Excelente volumen de ${hectareas} ha. para exportacion, logrando buena economia de escala.`;
  }

  let investmentWarning = "";
  if (inversionPen && effectiveInvestmentPen && inversionPen < effectiveInvestmentPen) {
    investmentWarning = ` La inversion ingresada parece baja para ${hectareas} ha.; el modelo usa una base estimada de S/ ${Math.round(effectiveInvestmentPen).toLocaleString("es-PE")} para no subestimar la perdida o ganancia.`;
  }

  const timeWarning = ` Cosecha estimada en ${harvestMonthLabel} (${duration} meses).`;
  const windowSuffix =
    windowPriceSignal === "up"
      ? " Ventana favorable."
      : windowPriceSignal === "same"
        ? " Ventana de precio estable."
        : " Ventana de precio debil; revisar fecha de cosecha.";
  const riskSuffix: Record<string, string> = {
    low: "",
    medium: " Validar senales del SISAP antes de sembrar.",
    high: " Considera retrasar o diversificar cultivo."
  };

  const riskContext =
    roi <= 0 && riskLevel === "high"
      ? " El ROI proyectado ya incorpora esta penalizacion."
      : "";

  return base + climateWarning + riskContext + timeWarning + scaleWarning + investmentWarning + windowSuffix + (riskSuffix[riskLevel] || "");
}

function normalizeRiskLevel(estimatedRoi: number): PlannerAnalysisResponse["result"]["riskLevel"] {
  return estimatedRoi <= 0 ? "high" : estimatedRoi <= 10 ? "medium" : "low";
}

function normalizeStoredRiskLevel(value: string | null | undefined): PlannerAnalysisResponse["result"]["riskLevel"] | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }

  if (normalized === "alto") {
    return "high";
  }

  if (normalized === "medio") {
    return "medium";
  }

  if (normalized === "bajo") {
    return "low";
  }

  return null;
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

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function computeProjectedLossPen(estimatedRoi: number, effectiveInvestmentPen: number): number | null {
  if (estimatedRoi >= 0) {
    return null;
  }

  return Number(((estimatedRoi / 100) * effectiveInvestmentPen).toFixed(0));
}

function computeProjectedProfitPen(estimatedRoi: number, effectiveInvestmentPen: number): number | null {
  if (estimatedRoi <= 0) {
    return null;
  }

  return Number(((estimatedRoi / 100) * effectiveInvestmentPen).toFixed(0));
}

function computeHistoricalDeltaPct(averagePrice: number, maxPrice: number | null): number | null {
  if (!maxPrice || maxPrice <= 0) {
    return null;
  }

  return Number((((averagePrice - maxPrice) / maxPrice) * 100).toFixed(0));
}

function computeWindowAveragePrice(
  rows: PlannerPriceProjectionPoint[] | undefined,
  sowingDateObj: Date,
  harvestDateObj: Date,
  sowingPrice: number,
  harvestPrice: number,
  fallbackAveragePrice: number
): number {
  if (!rows || rows.length === 0) {
    return Number((((sowingPrice || fallbackAveragePrice) + (harvestPrice || fallbackAveragePrice)) / 2).toFixed(2));
  }

  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const sowingIndex = sowingDateObj.getMonth();
  const harvestIndex = harvestDateObj.getMonth();
  const span = getForwardMonthSpan(sowingIndex, harvestIndex);

  const prices = rows
    .map((row) => {
      const label = (row.monthLabel || row.month || "").trim().toLowerCase().slice(0, 3);
      const monthIndex = months.findIndex((item) => item === label);
      const predictedPrice = toNullableNumber(row.predictedPrice);

      if (monthIndex < 0 || predictedPrice === null) {
        return null;
      }

      const offset = getForwardMonthSpan(sowingIndex, monthIndex);
      return offset <= span ? predictedPrice : null;
    })
    .filter((value): value is number => value !== null);

  if (prices.length === 0) {
    return Number((((sowingPrice || fallbackAveragePrice) + (harvestPrice || fallbackAveragePrice)) / 2).toFixed(2));
  }

  return Number((prices.reduce((sum, value) => sum + value, 0) / prices.length).toFixed(2));
}

function computeWindowPriceSignal(sowingPrice: number, harvestPrice: number): "up" | "same" | "down" {
  const diff = harvestPrice - sowingPrice;
  const tolerance = Math.max(0.01, sowingPrice * 0.01);

  if (diff > tolerance) {
    return "up";
  }

  if (Math.abs(diff) <= tolerance) {
    return "same";
  }

  return "down";
}

function getForwardMonthSpan(startMonthIndex: number, endMonthIndex: number): number {
  return (endMonthIndex - startMonthIndex + 12) % 12;
}

function getEstimatedCampaignInvestment(hectareas: number, producto: string, tipoMercado: string | undefined): number {
  return hectareas * getEstimatedInvestmentPerHectare(producto, tipoMercado);
}

function getEstimatedInvestmentPerHectare(producto: string, tipoMercado: string | undefined): number {
  const prod = normalizeText(producto);
  const mkt = (tipoMercado || "exportacion").toLowerCase();

  if (prod.includes("arandano") || prod.includes("palta")) {
    return 24000;
  }

  if (prod.includes("uva") || prod.includes("esparrago")) {
    return 21000;
  }

  if (prod.includes("ajo") || prod.includes("cebolla") || prod.includes("papa") || prod.includes("maiz")) {
    return mkt === "exportacion" ? 17000 : 14500;
  }

  return mkt === "exportacion" ? 17500 : 15000;
}

function getCachedRoiWeight(market: string): number {
  if (market === "exportacion") {
    return 0.45;
  }

  if (market === "industrial") {
    return 0.5;
  }

  return 0.55;
}

function getScaleAdjustment(hectareas: number, market: "local" | "exportacion" | "industrial"): number {
  if (market === "exportacion") {
    if (hectareas < 3) return -22;
    if (hectareas < 5) return -14;
    if (hectareas < 10) return -6;
    if (hectareas < 20) return 2;
    if (hectareas < 50) return 6;
    if (hectareas < 100) return 8;
    if (hectareas < 300) return 9;
    return 8;
  }

  if (market === "industrial") {
    if (hectareas < 5) return -12;
    if (hectareas < 15) return -2;
    if (hectareas < 40) return 4;
    if (hectareas < 100) return 7;
    return 8;
  }

  if (hectareas < 3) return 4;
  if (hectareas < 10) return 0;
  if (hectareas < 20) return -8;
  if (hectareas < 50) return -16;
  if (hectareas < 100) return -24;
  return -30;
}

function getWindowScalePenalty(
  hectareas: number,
  market: string,
  sowingPrice: number,
  harvestPrice: number
): number {
  if (sowingPrice <= 0) {
    return 0;
  }

  const ratio = (harvestPrice - sowingPrice) / sowingPrice;

  if (market === "exportacion") {
    if (ratio <= -0.05) {
      if (hectareas >= 300) return -14;
      if (hectareas >= 100) return -10;
      if (hectareas >= 50) return -6;
    }

    if (ratio <= 0.02) {
      if (hectareas >= 300) return -10;
      if (hectareas >= 100) return -7;
      if (hectareas >= 50) return -4;
    }
  }

  if (market === "industrial") {
    if (ratio <= -0.05 && hectareas >= 100) {
      return -6;
    }
  }

  if (market === "local") {
    if (ratio <= 0.02 && hectareas >= 20) {
      return -6;
    }
  }

  return 0;
}

function getHistoricalRealityPenalty(
  market: string,
  averagePrice: number,
  maxHistoricalPrice: number | null,
  hectareas: number
): number {
  if (!maxHistoricalPrice || maxHistoricalPrice <= 0 || averagePrice <= 0) {
    return 0;
  }

  const historicalGap = (averagePrice - maxHistoricalPrice) / maxHistoricalPrice;

  if (market === "exportacion") {
    if (historicalGap <= -0.2) {
      if (hectareas >= 40) return -10;
      if (hectareas >= 15) return -6;
    }

    if (historicalGap <= -0.1) {
      if (hectareas >= 40) return -6;
      if (hectareas >= 15) return -4;
    }
  }

  if (market === "local" && historicalGap <= -0.15 && hectareas >= 20) {
    return -6;
  }

  return 0;
}

function getCapitalCoveragePenalty(
  inversionPen: number | undefined,
  estimatedInvestmentPen: number | undefined,
  hectareas: number
): number {
  if (!inversionPen || !estimatedInvestmentPen || estimatedInvestmentPen <= 0) {
    return 0;
  }

  const coverage = inversionPen / estimatedInvestmentPen;

  if (coverage >= 1) {
    return 0;
  }

  if (coverage >= 0.75) {
    return -3;
  }

  if (coverage >= 0.5) {
    return -7;
  }

  if (coverage >= 0.35) {
    return -12;
  }

  if (hectareas >= 10) {
    return -18;
  }

  return -14;
}

function normalizePriceProjection(
  rows: PlannerPriceProjectionPoint[] | undefined,
  fechaSiembra?: string
): PlannerAnalysisResponse["result"]["priceProjection"] {
  if (!rows || rows.length === 0) {
    return undefined;
  }

  const allMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  let startMonthIndex = new Date().getMonth();
  let currentYear = new Date().getUTCFullYear();

  if (fechaSiembra) {
    const siembraDate = new Date(fechaSiembra);
    if (!isNaN(siembraDate.getTime())) {
      startMonthIndex = siembraDate.getUTCMonth();
      currentYear = siembraDate.getUTCFullYear();
    }
  }

  // Back up 4 months to provide historical context before siembra
  if (startMonthIndex < 4) {
    currentYear--;
  }
  startMonthIndex = (startMonthIndex - 4 + 12) % 12;

  // Find where our startMonthIndex is in the 'rows' array
  const cacheStartLabel = rows[0].month?.trim() || rows[0].monthLabel?.trim() || "Ene";
  const cacheStartIndex = allMonths.findIndex(
    (month) => month.toLowerCase() === cacheStartLabel.toLowerCase().substring(0, 3)
  );

  let rotationOffset = 0;
  if (cacheStartIndex >= 0) {
    rotationOffset = (startMonthIndex - cacheStartIndex + 12) % 12;
  }

  const rotated12 = rotationOffset > 0 ? [...rows.slice(rotationOffset), ...rows.slice(0, rotationOffset)] : rows;

  const expandedRows: NonNullable<PlannerAnalysisResponse["result"]["priceProjection"]> = [];
  for (let i = 0; i < 24; i++) {
    const row = rotated12[i % 12];
    const monthIndex = (startMonthIndex + i) % 12;

    if (i > 0 && monthIndex === 0) {
      currentYear++;
    }

    const basePrice = row.predictedPrice ?? 0;
    
    // Generamos un pequeño desnivel para que se vea orgánico en el tooltip
    const weeklyBreakdown = [
      { week: "Sem 1", price: Number((basePrice * 1.015).toFixed(2)) },
      { week: "Sem 2", price: Number((basePrice * 1.005).toFixed(2)) },
      { week: "Sem 3", price: Number((basePrice * 0.995).toFixed(2)) },
      { week: "Sem 4", price: Number((basePrice * 0.985).toFixed(2)) }
    ];

    // Volumen deterministico con oscilacion suave para no meter ruido aleatorio.
    const baseVolume = row.volumeTon ?? (basePrice > 0 ? Math.round(800 + (15000 / basePrice)) : 1000);
    const seasonalityFactor = 1 + Math.sin((i + 1) * 0.7) * 0.06;
    const volumeTon = Math.max(1, Math.round(baseVolume * seasonalityFactor));

    expandedRows.push({
      month: allMonths[monthIndex],
      year: currentYear,
      historicalPrice: row.historicalPrice ?? null,
      predictedPrice: basePrice,
      oversupplyZone: Boolean(row.oversupplyZone),
      isLowPoint: Boolean(row.isLowPoint),
      weeklyBreakdown,
      volumeTon
    });
  }

  return expandedRows;
}

function normalizeRecommendedAlternatives(
  rows: PlannerAlternativeCandidate[] | undefined,
  valle: string
): PlannerAnalysisResponse["result"]["recommendedAlternatives"] {
  if (!rows || rows.length === 0) {
    return undefined;
  }

  const region = normalizeText(valle);
  const normalizedRows = rows
    .map((row) => {
      const producto = row.producto.trim();
      const normalizedProducto = normalizeText(producto);
      const baseRoi = Math.round(row.estimatedRoi ?? 0);
      const adjustedRoi = applyClimatePenalty(baseRoi, region, normalizedProducto);
      const riskLevel = normalizeRiskLevel(adjustedRoi);
      const hasMismatch = adjustedRoi < baseRoi;

      return {
        producto,
        estimatedRoi: adjustedRoi,
        riskLevel,
        riskLabel: hasMismatch
          ? "Riesgo alto por clima"
          : row.riskLabel?.trim() || toRiskBadgeLabel(riskLevel),
        projectedPricePen: row.projectedPricePen ?? 0,
        message: hasMismatch
          ? `No recomendado para ${valle} por incompatibilidad climatica.`
          : row.message?.trim() || ""
      };
    })
    .filter((row) => row.riskLevel !== "high");

  return normalizedRows.length > 0 ? normalizedRows : undefined;
}

function toRiskBadgeLabel(riskLevel: PlannerAnalysisResponse["result"]["riskLevel"]): string {
  return riskLevel === "high" ? "Riesgo alto" : riskLevel === "medium" ? "Riesgo medio" : "Riesgo bajo";
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function hasAndeanWarmCropMismatch(region: string, producto: string): boolean {
  return ANDEAN_REGIONS.some((item) => region.includes(item)) && COASTAL_WARM_CROPS.some((item) => producto.includes(item));
}

function hasTropicalColdCropMismatch(region: string, producto: string): boolean {
  return TROPICAL_REGIONS.some((item) => region.includes(item)) && COLD_CLIMATE_CROPS.some((item) => producto.includes(item));
}

function applyClimatePenalty(baseRoi: number, region: string, producto: string): number {
  if (hasAndeanWarmCropMismatch(region, producto)) {
    return clampRoi(baseRoi - 80);
  }

  if (hasTropicalColdCropMismatch(region, producto)) {
    return clampRoi(baseRoi - 50);
  }

  return clampRoi(baseRoi);
}

function clampRoi(value: number): number {
  return Math.max(-80, Math.min(120, Math.round(value)));
}
