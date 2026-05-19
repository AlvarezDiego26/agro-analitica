import type { MidagriTopProductsResponse } from '../../../domain/midagri/entities/midagri-trade.entity.js';
import type { MidagriTradeRepository } from '../../../domain/midagri/ports/midagri-trade.repository.js';

export class GetMidagriExportsTopProductsUseCase {
  constructor(private readonly midagriTradeRepository: MidagriTradeRepository) {}

  async execute(limit?: number): Promise<MidagriTopProductsResponse> {
    return this.midagriTradeRepository.getExportsTopProducts(limit);
  }
}
