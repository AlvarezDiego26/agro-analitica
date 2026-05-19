import type { SisapTopProductsResponse } from '../../../domain/sisap/entities/sisap-market.entity.js';
import type { SisapMarketRepository } from '../../../domain/sisap/ports/sisap-market.repository.js';

export class GetSisapTopProductsUseCase {
  constructor(private readonly sisapMarketRepository: SisapMarketRepository) {}

  async execute(limit?: number): Promise<SisapTopProductsResponse> {
    return this.sisapMarketRepository.getTopProducts(limit);
  }
}
