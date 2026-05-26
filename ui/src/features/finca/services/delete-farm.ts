import { readSession } from "../../auth/auth-storage";
import { apiClient } from "../../../lib/api-client";

export async function deleteFarm(farmId: string): Promise<void> {
  const session = readSession();

  if (!session?.token) {
    throw new Error("No hay una sesión activa.");
  }

  await apiClient({
    path: `/api/farms/${farmId}`,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  });
}
