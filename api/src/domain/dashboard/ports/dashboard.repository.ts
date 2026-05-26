import type { DashboardOverviewResponse, DashboardRange } from "../entities/dashboard.entity.js";

export interface DashboardRepository {
  getOverview(range?: DashboardRange): Promise<DashboardOverviewResponse>;
}
