import type { Request, Response } from 'express';
import { GetSisapOverviewUseCase } from '../../../application/sisap/use-cases/get-sisap-overview.use-case.js';
import { GetSisapProductTrendUseCase } from '../../../application/sisap/use-cases/get-sisap-product-trend.use-case.js';
import { GetSisapTopProductsUseCase } from '../../../application/sisap/use-cases/get-sisap-top-products.use-case.js';
import type { GetSisapProductTrendQueryDto } from '../dtos/sisap/get-sisap-product-trend.query.js';
import type { GetSisapTopProductsQueryDto } from '../dtos/sisap/get-sisap-top-products.query.js';

export class SisapController {
  constructor(
    private readonly getSisapOverviewUseCase: GetSisapOverviewUseCase,
    private readonly getSisapTopProductsUseCase: GetSisapTopProductsUseCase,
    private readonly getSisapProductTrendUseCase: GetSisapProductTrendUseCase
  ) {}

  async getOverview(_request: Request, response: Response): Promise<void> {
    const overview = await this.getSisapOverviewUseCase.execute();
    response.json(overview);
  }

  async getTopProducts(request: Request, response: Response): Promise<void> {
    const query = request.validatedQuery as GetSisapTopProductsQueryDto;
    const data = await this.getSisapTopProductsUseCase.execute(query.limit);
    response.json(data);
  }

  async getTrend(request: Request, response: Response): Promise<void> {
    const query = request.validatedQuery as GetSisapProductTrendQueryDto;
    const data = await this.getSisapProductTrendUseCase.execute(query);
    response.json(data);
  }
}
