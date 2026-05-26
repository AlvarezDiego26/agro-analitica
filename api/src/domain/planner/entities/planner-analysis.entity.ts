export interface PlannerAnalysisInput {
  producto: string;
  hectareas: number;
  fechaSiembra: string;
  fechaCosecha?: string;
  valle: string;
  tipoMercado?: string;
  inversionPen?: number;
}

export interface PlannerProductAnalysisSnapshot {
  productoKey: string;
  averagePrice: number | null;
  latestPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  averageVolumeTon: number | null;
  records: number;
  latestDate: string | null;
  estimatedRoi: number | null;
  riskLevel: string | null;
  title: string | null;
  summary: string | null;
  explanation: string | null;
}

export interface PlannerPriceProjectionPoint {
  month: string | null;
  monthLabel: string | null;
  historicalPrice: number | null;
  predictedPrice: number | null;
  oversupplyZone: boolean | null;
  isLowPoint: boolean | null;
  weeklyBreakdown?: { week: string; price: number }[];
  volumeTon: number | null;
}

export interface PlannerAlternativeCandidate {
  producto: string;
  estimatedRoi: number | null;
  riskLevel: string | null;
  riskLabel: string | null;
  projectedPricePen: number | null;
  message: string | null;
}

export interface PlannerAnalysisResult {
  riskLevel: "high" | "medium" | "low";
  estimatedRoi: number;
  averagePrice: number;
  latestPrice: number | null;
  usesUserInvestment?: boolean;
  sowingPrice?: number | null;
  harvestPrice?: number | null;
  windowPriceSignal?: "up" | "same" | "down";
  averageVolumeTon: number | null;
  title: string;
  summary: string;
  explanation: string;
  projectedLossPen?: number | null;
  projectedProfitPen?: number | null;
  historicalDeltaPct?: number | null;
  aiExplanation?: string;
  priceProjection?: Array<{
    month: string;
    year: number;
    historicalPrice: number | null;
    predictedPrice: number;
    oversupplyZone: boolean;
    isLowPoint: boolean;
    weeklyBreakdown?: { week: string; price: number }[];
    volumeTon: number | null;
  }>;
  recommendedAlternatives?: Array<{
    producto: string;
    estimatedRoi: number;
    riskLevel: "high" | "medium" | "low";
    riskLabel: string;
    projectedPricePen: number;
    message: string;
  }>;
}

export interface PlannerAnalysisResponse {
  input: PlannerAnalysisInput;
  result: PlannerAnalysisResult;
}
