import type { SunatExportTrendInput, SunatExportTrendResponse } from '../../../domain/sunat/entities/export-overview.entity.js';
import type { SunatExportsRepository } from '../../../domain/sunat/ports/sunat-exports.repository.js';

export class GetSunatExportsTrendUseCase {
  constructor(private readonly sunatExportsRepository: SunatExportsRepository) {}

  async execute(input: SunatExportTrendInput): Promise<SunatExportTrendResponse> {
    return this.sunatExportsRepository.getExportsTrend(input);
  }
}
