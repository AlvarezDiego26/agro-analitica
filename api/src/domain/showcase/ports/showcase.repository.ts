import type {
  FarmShowcaseResponse,
  HomeShowcaseResponse,
  MarketBuyersShowcaseResponse
} from "../entities/showcase.entity.js";

export interface ShowcaseRepository {
  getHome(): Promise<HomeShowcaseResponse>;
  getMarketBuyers(): Promise<MarketBuyersShowcaseResponse>;
  getFarm(): Promise<FarmShowcaseResponse>;
}
