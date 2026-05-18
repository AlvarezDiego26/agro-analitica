import type { SunatTopProductsResponse } from '../../../domain/sunat/entities/export-overview.entity.js';
import type { SunatExportsRepository } from '../../../domain/sunat/ports/sunat-exports.repository.js';

export class GetSunatTopProductsUseCase {
  constructor(private readonly sunatExportsRepository: SunatExportsRepository) {}

  async execute(limit?: number): Promise<SunatTopProductsResponse> {
    return this.sunatExportsRepository.getTopProducts(limit);
  }
}
