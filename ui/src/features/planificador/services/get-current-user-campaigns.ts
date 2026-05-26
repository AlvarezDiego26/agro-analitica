import { readSession } from "../../auth/auth-storage";
import { apiClient } from "../../../lib/api-client";


export type UserCampaign = {
  id: string;
  farmId: string | null;
  parcelId: string | null;
  cropName: string;
  sowingDate: string;
  estimatedHarvestDate: string | null;
  hectares: number;
  marketType: string;
  campaignStatus: string;
  estimatedRoiPct: number | null;
  estimatedInvestmentPen: number | null;
  plannerRiskLevel: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getCurrentUserCampaigns(): Promise<{ campaigns: UserCampaign[] }> {
  const session = readSession();

  if (!session?.token) {
    throw new Error("No hay una sesión activa.");
  }

  return apiClient({
    path: "/api/campaigns",
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  });
}
