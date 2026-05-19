import { GetDashboardOverviewUseCase } from './application/dashboard/use-cases/get-dashboard-overview.use-case.js';
import { GetMidagriExportsOverviewUseCase } from './application/midagri/use-cases/get-midagri-exports-overview.use-case.js';
import { GetMidagriExportsTopProductsUseCase } from './application/midagri/use-cases/get-midagri-exports-top-products.use-case.js';
import { GetMidagriExportsTrendUseCase } from './application/midagri/use-cases/get-midagri-exports-trend.use-case.js';
import { GetMidagriImportsOverviewUseCase } from './application/midagri/use-cases/get-midagri-imports-overview.use-case.js';
import { GetMidagriImportsTopProductsUseCase } from './application/midagri/use-cases/get-midagri-imports-top-products.use-case.js';
import { GetMidagriImportsTrendUseCase } from './application/midagri/use-cases/get-midagri-imports-trend.use-case.js';
import { AnalyzeCampaignUseCase } from './application/planner/use-cases/analyze-campaign.use-case.js';
import { GetSisapOverviewUseCase } from './application/sisap/use-cases/get-sisap-overview.use-case.js';
import { GetSisapProductTrendUseCase } from './application/sisap/use-cases/get-sisap-product-trend.use-case.js';
import { GetSisapTopProductsUseCase } from './application/sisap/use-cases/get-sisap-top-products.use-case.js';
import { GetSunatExportsOverviewUseCase } from './application/sunat/use-cases/get-sunat-exports-overview.use-case.js';
import { GetSunatExportsTrendUseCase } from './application/sunat/use-cases/get-sunat-exports-trend.use-case.js';
import { GetSunatTopProductsUseCase } from './application/sunat/use-cases/get-sunat-top-products.use-case.js';
import type { DashboardRepository } from './domain/dashboard/ports/dashboard.repository.js';
import type { MidagriTradeRepository } from './domain/midagri/ports/midagri-trade.repository.js';
import type { PlannerRepository } from './domain/planner/ports/planner.repository.js';
import type { SisapMarketRepository } from './domain/sisap/ports/sisap-market.repository.js';
import type { SunatExportsRepository } from './domain/sunat/ports/sunat-exports.repository.js';
import { loadEnv } from './infrastructure/config/env.js';
import { DuckDbQueryExecutor } from './infrastructure/persistence/duckdb/clients/duckdb-query-executor.js';
import { DuckDbDashboardRepository } from './infrastructure/persistence/duckdb/repositories/duckdb-dashboard.repository.js';
import { DuckDbMidagriTradeRepository } from './infrastructure/persistence/duckdb/repositories/duckdb-midagri-trade.repository.js';
import { DuckDbPlannerRepository } from './infrastructure/persistence/duckdb/repositories/duckdb-planner.repository.js';
import { DuckDbSisapMarketRepository } from './infrastructure/persistence/duckdb/repositories/duckdb-sisap-market.repository.js';
import { DuckDbSunatExportsRepository } from './infrastructure/persistence/duckdb/repositories/duckdb-sunat-exports.repository.js';
import { PostgresQueryExecutor } from './infrastructure/persistence/postgres/clients/postgres-query-executor.js';
import { PostgresDashboardRepository } from './infrastructure/persistence/postgres/repositories/postgres-dashboard.repository.js';
import { PostgresMidagriTradeRepository } from './infrastructure/persistence/postgres/repositories/postgres-midagri-trade.repository.js';
import { PostgresPlannerRepository } from './infrastructure/persistence/postgres/repositories/postgres-planner.repository.js';
import { PostgresSisapMarketRepository } from './infrastructure/persistence/postgres/repositories/postgres-sisap-market.repository.js';
import { PostgresSunatExportsRepository } from './infrastructure/persistence/postgres/repositories/postgres-sunat-exports.repository.js';
import { DashboardController } from './interfaces/http/controllers/dashboard.controller.js';
import { HealthController } from './interfaces/http/controllers/health.controller.js';
import { MidagriController } from './interfaces/http/controllers/midagri.controller.js';
import { PlannerController } from './interfaces/http/controllers/planner.controller.js';
import { SisapController } from './interfaces/http/controllers/sisap.controller.js';
import { SunatExportsController } from './interfaces/http/controllers/sunat-exports.controller.js';

export function createContainer() {
  const env = loadEnv();
  const { dashboardRepository, plannerRepository, sisapMarketRepository, sunatExportsRepository, midagriTradeRepository } =
    createRepositories();

  const getDashboardOverviewUseCase = new GetDashboardOverviewUseCase(dashboardRepository);
  const analyzeCampaignUseCase = new AnalyzeCampaignUseCase(plannerRepository);
  const getSisapOverviewUseCase = new GetSisapOverviewUseCase(sisapMarketRepository);
  const getSisapTopProductsUseCase = new GetSisapTopProductsUseCase(sisapMarketRepository);
  const getSisapProductTrendUseCase = new GetSisapProductTrendUseCase(sisapMarketRepository);
  const getSunatExportsOverviewUseCase = new GetSunatExportsOverviewUseCase(sunatExportsRepository);
  const getSunatTopProductsUseCase = new GetSunatTopProductsUseCase(sunatExportsRepository);
  const getSunatExportsTrendUseCase = new GetSunatExportsTrendUseCase(sunatExportsRepository);
  const getMidagriExportsOverviewUseCase = new GetMidagriExportsOverviewUseCase(midagriTradeRepository);
  const getMidagriExportsTopProductsUseCase = new GetMidagriExportsTopProductsUseCase(midagriTradeRepository);
  const getMidagriExportsTrendUseCase = new GetMidagriExportsTrendUseCase(midagriTradeRepository);
  const getMidagriImportsOverviewUseCase = new GetMidagriImportsOverviewUseCase(midagriTradeRepository);
  const getMidagriImportsTopProductsUseCase = new GetMidagriImportsTopProductsUseCase(midagriTradeRepository);
  const getMidagriImportsTrendUseCase = new GetMidagriImportsTrendUseCase(midagriTradeRepository);

  return {
    env,
    controllers: {
      healthController: new HealthController(),
      dashboardController: new DashboardController(getDashboardOverviewUseCase),
      plannerController: new PlannerController(analyzeCampaignUseCase),
      sisapController: new SisapController(
        getSisapOverviewUseCase,
        getSisapTopProductsUseCase,
        getSisapProductTrendUseCase
      ),
      sunatExportsController: new SunatExportsController(
        getSunatExportsOverviewUseCase,
        getSunatTopProductsUseCase,
        getSunatExportsTrendUseCase
      ),
      midagriController: new MidagriController(
        getMidagriExportsOverviewUseCase,
        getMidagriExportsTopProductsUseCase,
        getMidagriExportsTrendUseCase,
        getMidagriImportsOverviewUseCase,
        getMidagriImportsTopProductsUseCase,
        getMidagriImportsTrendUseCase
      )
    }
  };
}

function createRepositories(): {
  dashboardRepository: DashboardRepository;
  plannerRepository: PlannerRepository;
  sisapMarketRepository: SisapMarketRepository;
  sunatExportsRepository: SunatExportsRepository;
  midagriTradeRepository: MidagriTradeRepository;
} {
  const env = loadEnv();

  if (env.dataSource === 'postgres') {
    const postgresQueryExecutor = new PostgresQueryExecutor();

    return {
      dashboardRepository: new PostgresDashboardRepository(postgresQueryExecutor),
      plannerRepository: new PostgresPlannerRepository(postgresQueryExecutor),
      sisapMarketRepository: new PostgresSisapMarketRepository(postgresQueryExecutor),
      sunatExportsRepository: new PostgresSunatExportsRepository(postgresQueryExecutor),
      midagriTradeRepository: new PostgresMidagriTradeRepository(postgresQueryExecutor)
    };
  }

  const duckDbQueryExecutor = new DuckDbQueryExecutor();

  return {
    dashboardRepository: new DuckDbDashboardRepository(duckDbQueryExecutor),
    plannerRepository: new DuckDbPlannerRepository(duckDbQueryExecutor),
    sisapMarketRepository: new DuckDbSisapMarketRepository(duckDbQueryExecutor),
    sunatExportsRepository: new DuckDbSunatExportsRepository(duckDbQueryExecutor),
    midagriTradeRepository: new DuckDbMidagriTradeRepository(duckDbQueryExecutor)
  };
}
