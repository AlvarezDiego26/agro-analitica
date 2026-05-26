import { apiClient } from "../../../lib/api-client";
import { normalizeHomeShowcase } from "../../showcase/services/normalize-showcase";
import type { HomeShowcaseResponse } from "../../showcase/types";

export async function getHomeShowcase(): Promise<HomeShowcaseResponse> {
  const response = await apiClient<HomeShowcaseResponse>({
    path: "/api/showcase/home"
  });

  return normalizeHomeShowcase(response);
}
