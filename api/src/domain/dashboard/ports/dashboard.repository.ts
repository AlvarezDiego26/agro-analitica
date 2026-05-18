import type { DashboardOverviewResponse } from "../entities/dashboard.entity.js";

export interface DashboardRepository {
  getOverview(): Promise<DashboardOverviewResponse>;
}
