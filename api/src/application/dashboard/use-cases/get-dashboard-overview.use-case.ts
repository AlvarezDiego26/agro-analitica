import type { DashboardOverviewResponse } from "../../../domain/dashboard/entities/dashboard.entity.js";
import type { DashboardRepository } from "../../../domain/dashboard/ports/dashboard.repository.js";

export class GetDashboardOverviewUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(): Promise<DashboardOverviewResponse> {
    return this.dashboardRepository.getOverview();
  }
}
