import { readSession } from "../../auth/auth-storage";
import { apiClient } from "../../../lib/api-client";
import type { CreateFarmInput, CreateFarmResponse } from "../types";

export async function createFarm(input: CreateFarmInput) {
  const session = readSession();

  if (!session?.token) {
    throw new Error("No hay una sesion activa.");
  }

  return apiClient<CreateFarmResponse>({
    path: "/api/farms",
    method: "POST",
    body: input,
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  });
}
