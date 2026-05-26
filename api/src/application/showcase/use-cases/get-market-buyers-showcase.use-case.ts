import type { MarketBuyersShowcaseResponse } from "../../../domain/showcase/entities/showcase.entity.js";
import type { ShowcaseRepository } from "../../../domain/showcase/ports/showcase.repository.js";

export class GetMarketBuyersShowcaseUseCase {
  constructor(private readonly showcaseRepository: ShowcaseRepository) {}

  async execute(): Promise<MarketBuyersShowcaseResponse> {
    return this.showcaseRepository.getMarketBuyers();
  }
}
