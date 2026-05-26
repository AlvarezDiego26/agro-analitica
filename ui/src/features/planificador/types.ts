export type PlannerAnalysisRequest = {
  producto: string;
  hectareas: number;
  fechaSiembra: string;
  fechaCosecha?: string;
  valle: string;
  tipoMercado: string;
  inversionPen?: number;
};

export type PlannerProjectionPoint = {
  month: string;
  year: number;
  historicalPrice: number | null;
  predictedPrice: number;
  oversupplyZone: boolean;
  isLowPoint: boolean;
  weeklyBreakdown?: { week: string; price: number }[];
  volumeTon: number | null;
};

export type PlannerAlternative = {
  producto: string;
  estimatedRoi: number;
  riskLevel: "high" | "medium" | "low";
  riskLabel: string;
  projectedPricePen: number;
  message: string;
};

export type PlannerAnalysis = {
  input: PlannerAnalysisRequest;
  result: {
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
    priceProjection?: PlannerProjectionPoint[];
    recommendedAlternatives?: PlannerAlternative[];
  };
};
