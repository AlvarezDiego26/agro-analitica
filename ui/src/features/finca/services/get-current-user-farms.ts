import { readSession } from "../../auth/auth-storage";
import { apiClient } from "../../../lib/api-client";
import type { UserFarmsResponse } from "../types";

export async function getCurrentUserFarms() {
  const session = readSession();

  if (!session?.token) {
    throw new Error("No hay una sesion activa.");
  }

  return apiClient<UserFarmsResponse>({
    path: "/api/farms",
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  });
}
