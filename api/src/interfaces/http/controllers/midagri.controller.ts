import type { Request, Response } from 'express';
import { GetMidagriExportsOverviewUseCase } from '../../../application/midagri/use-cases/get-midagri-exports-overview.use-case.js';
import { GetMidagriExportsTopProductsUseCase } from '../../../application/midagri/use-cases/get-midagri-exports-top-products.use-case.js';
import { GetMidagriExportsTrendUseCase } from '../../../application/midagri/use-cases/get-midagri-exports-trend.use-case.js';
import { GetMidagriImportsOverviewUseCase } from '../../../application/midagri/use-cases/get-midagri-imports-overview.use-case.js';
import { GetMidagriImportsTopProductsUseCase } from '../../../application/midagri/use-cases/get-midagri-imports-top-products.use-case.js';
import { GetMidagriImportsTrendUseCase } from '../../../application/midagri/use-cases/get-midagri-imports-trend.use-case.js';
import type { GetMidagriTopProductsQueryDto } from '../dtos/midagri/get-midagri-top-products.query.js';
import type { GetMidagriTrendQueryDto } from '../dtos/midagri/get-midagri-trend.query.js';

export class MidagriController {
  constructor(
    private readonly getMidagriExportsOverviewUseCase: GetMidagriExportsOverviewUseCase,
    private readonly getMidagriExportsTopProductsUseCase: GetMidagriExportsTopProductsUseCase,
    private readonly getMidagriExportsTrendUseCase: GetMidagriExportsTrendUseCase,
    private readonly getMidagriImportsOverviewUseCase: GetMidagriImportsOverviewUseCase,
    private readonly getMidagriImportsTopProductsUseCase: GetMidagriImportsTopProductsUseCase,
    private readonly getMidagriImportsTrendUseCase: GetMidagriImportsTrendUseCase
  ) {}

  async getExportsOverview(_request: Request, response: Response): Promise<void> {
    const overview = await this.getMidagriExportsOverviewUseCase.execute();
    response.json(overview);
  }

  async getExportsTopProducts(request: Request, response: Response): Promise<void> {
    const query = request.validatedQuery as GetMidagriTopProductsQueryDto;
    const data = await this.getMidagriExportsTopProductsUseCase.execute(query.limit);
    response.json(data);
  }

  async getExportsTrend(request: Request, response: Response): Promise<void> {
    const query = request.validatedQuery as GetMidagriTrendQueryDto;
    const data = await this.getMidagriExportsTrendUseCase.execute(query);
    response.json(data);
  }

  async getImportsOverview(_request: Request, response: Response): Promise<void> {
    const overview = await this.getMidagriImportsOverviewUseCase.execute();
    response.json(overview);
  }

  async getImportsTopProducts(request: Request, response: Response): Promise<void> {
    const query = request.validatedQuery as GetMidagriTopProductsQueryDto;
    const data = await this.getMidagriImportsTopProductsUseCase.execute(query.limit);
    response.json(data);
  }

  async getImportsTrend(request: Request, response: Response): Promise<void> {
    const query = request.validatedQuery as GetMidagriTrendQueryDto;
    const data = await this.getMidagriImportsTrendUseCase.execute(query);
    response.json(data);
  }
}
