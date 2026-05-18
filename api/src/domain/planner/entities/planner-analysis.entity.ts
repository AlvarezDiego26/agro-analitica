export interface PlannerAnalysisInput {
  producto: string;
  hectareas: number;
  fechaSiembra: string;
  valle: string;
}

export interface PlannerAnalysisResult {
  riskLevel: "high" | "medium" | "low";
  estimatedRoi: number;
  averagePrice: number;
  latestPrice: number | null;
  averageVolumeTon: number | null;
  title: string;
  summary: string;
  explanation: string;
}

export interface PlannerAnalysisResponse {
  input: PlannerAnalysisInput;
  result: PlannerAnalysisResult;
}
