import type { MidagriTradeTrendInput, MidagriTradeTrendResponse } from '../../../domain/midagri/entities/midagri-trade.entity.js';
import type { MidagriTradeRepository } from '../../../domain/midagri/ports/midagri-trade.repository.js';

export class GetMidagriExportsTrendUseCase {
  constructor(private readonly midagriTradeRepository: MidagriTradeRepository) {}

  async execute(input: MidagriTradeTrendInput): Promise<MidagriTradeTrendResponse> {
    return this.midagriTradeRepository.getExportsTrend(input);
  }
}
