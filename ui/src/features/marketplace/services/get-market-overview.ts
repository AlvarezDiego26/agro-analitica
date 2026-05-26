import { apiClient } from "../../../lib/api-client";
import type { MarketOverview } from "../types";

export async function getMarketOverview(): Promise<MarketOverview> {
  return apiClient<MarketOverview>({
    path: "/api/sunat/exports/overview"
  });
}
