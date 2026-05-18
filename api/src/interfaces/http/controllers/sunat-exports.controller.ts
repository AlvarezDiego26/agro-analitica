import type { Request, Response } from 'express';
import { GetSunatExportsOverviewUseCase } from '../../../application/sunat/use-cases/get-sunat-exports-overview.use-case.js';
import { GetSunatExportsTrendUseCase } from '../../../application/sunat/use-cases/get-sunat-exports-trend.use-case.js';
import { GetSunatTopProductsUseCase } from '../../../application/sunat/use-cases/get-sunat-top-products.use-case.js';
import type { GetSunatExportsTrendQueryDto } from '../dtos/sunat/get-sunat-exports-trend.query.js';
import type { GetSunatTopProductsQueryDto } from '../dtos/sunat/get-sunat-top-products.query.js';

export class SunatExportsController {
  constructor(
    private readonly getSunatExportsOverviewUseCase: GetSunatExportsOverviewUseCase,
    private readonly getSunatTopProductsUseCase: GetSunatTopProductsUseCase,
    private readonly getSunatExportsTrendUseCase: GetSunatExportsTrendUseCase
  ) {}

  async getOverview(_request: Request, response: Response): Promise<void> {
    const overview = await this.getSunatExportsOverviewUseCase.execute();
    response.json(overview);
  }

  async getTopProducts(request: Request, response: Response): Promise<void> {
    const query = request.validatedQuery as GetSunatTopProductsQueryDto;
    const data = await this.getSunatTopProductsUseCase.execute(query.limit);
    response.json(data);
  }

  async getTrend(request: Request, response: Response): Promise<void> {
    const query = request.validatedQuery as GetSunatExportsTrendQueryDto;
    const data = await this.getSunatExportsTrendUseCase.execute(query);
    response.json(data);
  }
}
