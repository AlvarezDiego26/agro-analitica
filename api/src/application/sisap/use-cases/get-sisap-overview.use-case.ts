import type { SisapOverviewResponse } from '../../../domain/sisap/entities/sisap-market.entity.js';
import type { SisapMarketRepository } from '../../../domain/sisap/ports/sisap-market.repository.js';

export class GetSisapOverviewUseCase {
  constructor(private readonly sisapMarketRepository: SisapMarketRepository) {}

  async execute(): Promise<SisapOverviewResponse> {
    return this.sisapMarketRepository.getOverview();
  }
}
