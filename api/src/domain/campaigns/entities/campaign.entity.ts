export type Campaign = {
  id: string;
  farmId: string | null;
  parcelId: string | null;
  cropName: string;
  sowingDate: string;
  estimatedHarvestDate: string | null;
  hectares: number;
  marketType: "local" | "exportacion" | "industrial";
  campaignStatus: "draft" | "planned" | "active" | "completed" | "cancelled";
  estimatedRoiPct: number | null;
  estimatedInvestmentPen: number | null;
  plannerRiskLevel: "low" | "medium" | "high" | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCampaignInput = {
  cropName: string;
  sowingDate: string;
  hectares: number;
  marketType?: "local" | "exportacion" | "industrial";
  campaignStatus?: "draft" | "planned" | "active" | "completed" | "cancelled";
  estimatedRoiPct?: number | null;
  estimatedInvestmentPen?: number | null;
  plannerRiskLevel?: "low" | "medium" | "high" | null;
  farmId?: string | null;
  parcelId?: string | null;
};
