import type { Request, Response } from 'express';
import { GetDashboardOverviewUseCase } from '../../../application/dashboard/use-cases/get-dashboard-overview.use-case.js';

export class DashboardController {
  constructor(private readonly getDashboardOverviewUseCase: GetDashboardOverviewUseCase) {}

  async getOverview(_request: Request, response: Response): Promise<void> {
    const dashboard = await this.getDashboardOverviewUseCase.execute();
    response.json(dashboard);
  }
}
