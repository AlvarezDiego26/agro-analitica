import type { SunatExportsOverviewResponse } from "../entities/export-overview.entity.js";

export interface SunatExportsRepository {
  getExportsOverview(): Promise<SunatExportsOverviewResponse>;
}
