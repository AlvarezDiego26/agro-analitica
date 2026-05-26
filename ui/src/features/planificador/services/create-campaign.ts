import { readSession } from "../../auth/auth-storage";
import { apiClient } from "../../../lib/api-client";

export type CreateCampaignInput = {
  cropName: string;
  sowingDate: string;
  hectares: number;
  marketType: "local" | "exportacion" | "industrial";
  campaignStatus?: "draft" | "planned" | "active" | "completed" | "cancelled";
  estimatedRoiPct?: number | null;
  estimatedInvestmentPen?: number | null;
  plannerRiskLevel?: "low" | "medium" | "high" | null;
  farmId?: string | null;
  parcelId?: string | null;
};

export async function createCampaign(input: CreateCampaignInput) {
  const session = readSession();

  if (!session?.token) {
    throw new Error("No hay una sesión activa.");
  }

  return apiClient({
    path: "/api/campaigns",
    method: "POST",
    body: input,
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  });
}
