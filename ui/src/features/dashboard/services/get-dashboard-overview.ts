import { apiClient } from "../../../lib/api-client";
import type { DashboardOverviewResponse } from "../types";

export async function getDashboardOverview(
  range: "7d" | "30d" | "3m" | "1a" = "30d"
): Promise<DashboardOverviewResponse> {
  return apiClient<DashboardOverviewResponse>({
    path: `/api/dashboard/overview?range=${range}`
  });
}
