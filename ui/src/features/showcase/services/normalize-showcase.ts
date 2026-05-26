import type { HomeShowcaseResponse, MarketBuyersShowcaseResponse } from "../types";

export function normalizeMarketBuyersShowcase(
  response: MarketBuyersShowcaseResponse
): MarketBuyersShowcaseResponse {
  return {
    ...response,
    totalBuyers: toFiniteNumber(response.totalBuyers),
    buyers: response.buyers.map((buyer) => ({
      ...buyer,
      offeredPricePen: toFiniteNumber(buyer.offeredPricePen),
      matchScorePct: toFiniteNumber(buyer.matchScorePct)
    }))
  };
}

export function normalizeHomeShowcase(response: HomeShowcaseResponse): HomeShowcaseResponse {
  return {
    ...response,
    buyers: response.buyers.map((buyer) => ({
      ...buyer,
      offeredPricePen: toFiniteNumber(buyer.offeredPricePen),
      matchScorePct: toFiniteNumber(buyer.matchScorePct)
    }))
  };
}

function toFiniteNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = Number(value.trim());
    return Number.isFinite(normalized) ? normalized : 0;
  }

  return 0;
}
