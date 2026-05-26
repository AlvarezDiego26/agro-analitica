import { readSession } from "../../auth/auth-storage";
import { apiClient } from "../../../lib/api-client";
import type { UserFarm } from "../types";

export type UpdateFarmInput = Partial<{
  farmName: string;
  regionCode: string;
  provinceName: string | null;
  districtName: string | null;
  locationLabel: string | null;
  totalHectares: number;
  waterSource: string | null;
}>;

export async function updateFarm(farmId: string, input: UpdateFarmInput): Promise<{ farm: UserFarm }> {
  const session = readSession();

  if (!session?.token) {
    throw new Error("No hay una sesión activa.");
  }

  return apiClient<{ farm: UserFarm }>({
    path: `/api/farms/${farmId}`,
    method: "PATCH",
    body: input,
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  });
}
