import type { SunatExportsOverviewResponse } from '../../../domain/sunat/entities/export-overview.entity.js';
import type { SunatExportsRepository } from '../../../domain/sunat/ports/sunat-exports.repository.js';

export class GetSunatExportsOverviewUseCase {
  constructor(private readonly sunatExportsRepository: SunatExportsRepository) {}

  async execute(): Promise<SunatExportsOverviewResponse> {
    return this.sunatExportsRepository.getExportsOverview();
  }
}
