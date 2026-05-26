import { readSession } from "../../auth/auth-storage";
import { apiClient } from "../../../lib/api-client";

export async function deleteCampaign(campaignId: string): Promise<void> {
  const session = readSession();

  if (!session?.token) {
    throw new Error("No hay una sesión activa.");
  }

  return apiClient({
    path: `/api/campaigns/${campaignId}`,
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${session.token}`,
    },
  });
}
