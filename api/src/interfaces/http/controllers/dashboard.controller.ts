import type { Request, Response } from "express";
import { GetDashboardOverviewUseCase } from "../../../application/dashboard/use-cases/get-dashboard-overview.use-case.js";
import type { DashboardRange } from "../../../domain/dashboard/entities/dashboard.entity.js";

const DASHBOARD_RANGES: DashboardRange[] = ["7d", "30d", "3m", "1a"];

export class DashboardController {
  constructor(private readonly getDashboardOverviewUseCase: GetDashboardOverviewUseCase) {}

  async getOverview(request: Request, response: Response): Promise<void> {
    const dashboard = await this.getDashboardOverviewUseCase.execute(this.parseRange(request.query.range));
    response.json(dashboard);
  }

  private parseRange(value: unknown): DashboardRange | undefined {
    if (typeof value !== "string") return undefined;
    return DASHBOARD_RANGES.find((range) => range === value);
  }
}
