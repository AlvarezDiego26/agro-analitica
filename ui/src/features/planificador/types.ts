export type PlannerAnalysis = {
  input: {
    producto: string;
    hectareas: number;
    fechaSiembra: string;
    valle: string;
  };
  result: {
    riskLevel: "high" | "medium" | "low";
    estimatedRoi: number;
    averagePrice: number;
    latestPrice: number | null;
    averageVolumeTon: number | null;
    title: string;
    summary: string;
    explanation: string;
  };
};
