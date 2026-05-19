import type { MidagriTradeOverviewResponse } from '../../../domain/midagri/entities/midagri-trade.entity.js';
import type { MidagriTradeRepository } from '../../../domain/midagri/ports/midagri-trade.repository.js';

export class GetMidagriImportsOverviewUseCase {
  constructor(private readonly midagriTradeRepository: MidagriTradeRepository) {}

  async execute(): Promise<MidagriTradeOverviewResponse> {
    return this.midagriTradeRepository.getImportsOverview();
  }
}
