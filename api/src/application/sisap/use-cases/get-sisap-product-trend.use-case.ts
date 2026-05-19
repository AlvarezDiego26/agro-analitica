import type { SisapProductTrendInput, SisapProductTrendResponse } from '../../../domain/sisap/entities/sisap-market.entity.js';
import type { SisapMarketRepository } from '../../../domain/sisap/ports/sisap-market.repository.js';

export class GetSisapProductTrendUseCase {
  constructor(private readonly sisapMarketRepository: SisapMarketRepository) {}

  async execute(input: SisapProductTrendInput): Promise<SisapProductTrendResponse> {
    return this.sisapMarketRepository.getProductTrend(input);
  }
}
