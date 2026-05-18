import { GetDashboardOverviewUseCase } from './application/dashboard/use-cases/get-dashboard-overview.use-case.js';
import { AnalyzeCampaignUseCase } from './application/planner/use-cases/analyze-campaign.use-case.js';
import { GetSunatExportsOverviewUseCase } from './application/sunat/use-cases/get-sunat-exports-overview.use-case.js';
import { GetSunatExportsTrendUseCase } from './application/sunat/use-cases/get-sunat-exports-trend.use-case.js';
import { GetSunatTopProductsUseCase } from './application/sunat/use-cases/get-sunat-top-products.use-case.js';
import type { DashboardRepository } from './domain/dashboard/ports/dashboard.repository.js';
import type { PlannerRepository } from './domain/planner/ports/planner.repository.js';
import type { SunatExportsRepository } from './domain/sunat/ports/sunat-exports.repository.js';
import { loadEnv } from './infrastructure/config/env.js';
import { DuckDbQueryExecutor } from './infrastructure/persistence/duckdb/clients/duckdb-query-executor.js';
import { DuckDbDashboardRepository } from './infrastructure/persistence/duckdb/repositories/duckdb-dashboard.repository.js';
import { DuckDbPlannerRepository } from './infrastructure/persistence/duckdb/repositories/duckdb-planner.repository.js';
import { DuckDbSunatExportsRepository } from './infrastructure/persistence/duckdb/repositories/duckdb-sunat-exports.repository.js';
import { DashboardController } from './interfaces/http/controllers/dashboard.controller.js';
import { HealthController } from './interfaces/http/controllers/health.controller.js';
import { PlannerController } from './interfaces/http/controllers/planner.controller.js';
import { SunatExportsController } from './interfaces/http/controllers/sunat-exports.controller.js';

export function createContainer() {
  const env = loadEnv();
  const { dashboardRepository, plannerRepository, sunatExportsRepository } = createRepositories();

  const getDashboardOverviewUseCase = new GetDashboardOverviewUseCase(dashboardRepository);
  const analyzeCampaignUseCase = new AnalyzeCampaignUseCase(plannerRepository);
  const getSunatExportsOverviewUseCase = new GetSunatExportsOverviewUseCase(sunatExportsRepository);
  const getSunatTopProductsUseCase = new GetSunatTopProductsUseCase(sunatExportsRepository);
  const getSunatExportsTrendUseCase = new GetSunatExportsTrendUseCase(sunatExportsRepository);

  return {
    env,
    controllers: {
      healthController: new HealthController(),
      dashboardController: new DashboardController(getDashboardOverviewUseCase),
      plannerController: new PlannerController(analyzeCampaignUseCase),
      sunatExportsController: new SunatExportsController(
        getSunatExportsOverviewUseCase,
        getSunatTopProductsUseCase,
        getSunatExportsTrendUseCase
      )
    }
  };
}

function createRepositories(): {
  dashboardRepository: DashboardRepository;
  plannerRepository: PlannerRepository;
  sunatExportsRepository: SunatExportsRepository;
} {
  const duckDbQueryExecutor = new DuckDbQueryExecutor();

  return {
    dashboardRepository: new DuckDbDashboardRepository(duckDbQueryExecutor),
    plannerRepository: new DuckDbPlannerRepository(duckDbQueryExecutor),
    sunatExportsRepository: new DuckDbSunatExportsRepository(duckDbQueryExecutor)
  };
}
