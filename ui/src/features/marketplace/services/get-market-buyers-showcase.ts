import { apiClient } from "../../../lib/api-client";
import { normalizeMarketBuyersShowcase } from "../../showcase/services/normalize-showcase";
import type { MarketBuyersShowcaseResponse } from "../../showcase/types";

export async function getMarketBuyersShowcase(): Promise<MarketBuyersShowcaseResponse> {
  const response = await apiClient<MarketBuyersShowcaseResponse>({
    path: "/api/showcase/market-buyers"
  });

  return normalizeMarketBuyersShowcase(response);
}
