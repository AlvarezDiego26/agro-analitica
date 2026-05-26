import { readSession } from "../../auth/auth-storage";
import { apiClient } from "../../../lib/api-client";

export type UpdateCampaignPayload = {
  cropName?: string;
  sowingDate?: string;
  hectares?: number;
  campaignStatus?: "draft" | "planned" | "active" | "completed" | "cancelled";
  estimatedInvestmentPen?: number | null;
};

export async function updateCampaign(campaignId: string, payload: UpdateCampaignPayload): Promise<any> {
  const session = readSession();

  if (!session?.token) {
    throw new Error("No hay una sesión activa.");
  }

  return apiClient({
    path: `/api/campaigns/${campaignId}`,
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${session.token}`,
    },
    body: payload,
  });
}
