import { GetCurrentAuthUserUseCase } from "./application/auth/use-cases/get-current-auth-user.use-case.js";
import { CreateCampaignUseCase } from "./application/campaigns/use-cases/create-campaign.use-case.js";
import { GetCurrentUserCampaignsUseCase } from "./application/campaigns/use-cases/get-current-user-campaigns.use-case.js";
import { UpdateCampaignUseCase } from "./application/campaigns/use-cases/update-campaign.use-case.js";
import { DeleteCampaignUseCase } from "./application/campaigns/use-cases/delete-campaign.use-case.js";
import { UpdateFarmUseCase } from "./application/farms/use-cases/update-farm.use-case.js";
import { DeleteFarmUseCase } from "./application/farms/use-cases/delete-farm.use-case.js";
import { LoginAuthUseCase } from "./application/auth/use-cases/login-auth.use-case.js";
import { LogoutAuthUseCase } from "./application/auth/use-cases/logout-auth.use-case.js";
import { RegisterAuthUseCase } from "./application/auth/use-cases/register-auth.use-case.js";
import { GetDashboardOverviewUseCase } from "./application/dashboard/use-cases/get-dashboard-overview.use-case.js";
import { CreateFarmUseCase } from "./application/farms/use-cases/create-farm.use-case.js";
import { GetCurrentUserFarmsUseCase } from "./application/farms/use-cases/get-current-user-farms.use-case.js";
import { AnalyzeCampaignUseCase } from "./application/planner/use-cases/analyze-campaign.use-case.js";
import { GetFarmShowcaseUseCase } from "./application/showcase/use-cases/get-farm-showcase.use-case.js";
import { GetHomeShowcaseUseCase } from "./application/showcase/use-cases/get-home-showcase.use-case.js";
import { GetMarketBuyersShowcaseUseCase } from "./application/showcase/use-cases/get-market-buyers-showcase.use-case.js";
import { GetSunatExportsOverviewUseCase } from "./application/sunat/use-cases/get-sunat-exports-overview.use-case.js";
import type { AuthRepository } from "./domain/auth/ports/auth.repository.js";
import type { DashboardRepository } from "./domain/dashboard/ports/dashboard.repository.js";
import type { FarmRepository } from "./domain/farms/ports/farm.repository.js";
import type { CampaignRepository } from "./domain/campaigns/ports/campaign.repository.js";
import type { PlannerRepository } from "./domain/planner/ports/planner.repository.js";
import type { ShowcaseRepository } from "./domain/showcase/ports/showcase.repository.js";
import type { SunatExportsRepository } from "./domain/sunat/ports/sunat-exports.repository.js";
import { loadEnv } from "./infrastructure/config/env.js";
import { DuckDbQueryExecutor } from "./infrastructure/persistence/duckdb/clients/duckdb-query-executor.js";
import { DuckDbDashboardRepository } from "./infrastructure/persistence/duckdb/repositories/duckdb-dashboard.repository.js";
import { DuckDbPlannerRepository } from "./infrastructure/persistence/duckdb/repositories/duckdb-planner.repository.js";
import { DuckDbShowcaseRepository } from "./infrastructure/persistence/duckdb/repositories/duckdb-showcase.repository.js";
import { DuckDbSunatExportsRepository } from "./infrastructure/persistence/duckdb/repositories/duckdb-sunat-exports.repository.js";
import { SupabaseRestClient } from "./infrastructure/persistence/supabase/clients/supabase-rest-client.js";
import { SupabaseAuthRepository } from "./infrastructure/persistence/supabase/repositories/supabase-auth.repository.js";
import { SupabaseFarmRepository } from "./infrastructure/persistence/supabase/repositories/supabase-farm.repository.js";
import { SupabaseCampaignRepository } from "./infrastructure/persistence/supabase/repositories/supabase-campaign.repository.js";
import { AuthController } from "./interfaces/http/controllers/auth.controller.js";
import { DashboardController } from "./interfaces/http/controllers/dashboard.controller.js";
import { FarmController } from "./interfaces/http/controllers/farm.controller.js";
import { CampaignController } from "./interfaces/http/controllers/campaign.controller.js";
import { HealthController } from "./interfaces/http/controllers/health.controller.js";
import { PlannerController } from "./interfaces/http/controllers/planner.controller.js";
import { ShowcaseController } from "./interfaces/http/controllers/showcase.controller.js";
import { SunatExportsController } from "./interfaces/http/controllers/sunat-exports.controller.js";

type RepositoryRegistry = {
  authRepository: AuthRepository;
  farmRepository: FarmRepository;
  campaignRepository: CampaignRepository;
  dashboardRepository: DashboardRepository;
  plannerRepository: PlannerRepository;
  showcaseRepository: ShowcaseRepository;
  sunatExportsRepository: SunatExportsRepository;
};

type UseCaseRegistry = ReturnType<typeof createUseCases>;

export function createContainer() {
  const env = loadEnv();
  const repositories = createRepositories();
  const useCases = createUseCases(repositories);

  return {
    env,
    controllers: createControllers(useCases)
  };
}

function createRepositories(): RepositoryRegistry {
  const duckDbQueryExecutor = new DuckDbQueryExecutor();
  const supabaseRestClient = new SupabaseRestClient();

  return {
    authRepository: new SupabaseAuthRepository(supabaseRestClient),
    farmRepository: new SupabaseFarmRepository(supabaseRestClient),
    campaignRepository: new SupabaseCampaignRepository(supabaseRestClient),
    dashboardRepository: new DuckDbDashboardRepository(duckDbQueryExecutor),
    plannerRepository: new DuckDbPlannerRepository(duckDbQueryExecutor),
    showcaseRepository: new DuckDbShowcaseRepository(duckDbQueryExecutor),
    sunatExportsRepository: new DuckDbSunatExportsRepository(duckDbQueryExecutor)
  };
}

function createUseCases(repositories: RepositoryRegistry) {
  const env = loadEnv();

  return {
    registerAuthUseCase: new RegisterAuthUseCase(repositories.authRepository, env.auth.sessionTtlDays),
    loginAuthUseCase: new LoginAuthUseCase(repositories.authRepository, env.auth.sessionTtlDays),
    getCurrentAuthUserUseCase: new GetCurrentAuthUserUseCase(repositories.authRepository),
    logoutAuthUseCase: new LogoutAuthUseCase(repositories.authRepository),
    getCurrentUserFarmsUseCase: new GetCurrentUserFarmsUseCase(repositories.authRepository, repositories.farmRepository),
    createFarmUseCase: new CreateFarmUseCase(repositories.authRepository, repositories.farmRepository),
    createCampaignUseCase: new CreateCampaignUseCase(repositories.authRepository, repositories.campaignRepository),
    getCurrentUserCampaignsUseCase: new GetCurrentUserCampaignsUseCase(repositories.authRepository, repositories.campaignRepository),
    updateCampaignUseCase: new UpdateCampaignUseCase(repositories.authRepository, repositories.campaignRepository),
    deleteCampaignUseCase: new DeleteCampaignUseCase(repositories.authRepository, repositories.campaignRepository),
    updateFarmUseCase: new UpdateFarmUseCase(repositories.authRepository, repositories.farmRepository),
    deleteFarmUseCase: new DeleteFarmUseCase(repositories.authRepository, repositories.farmRepository),
    getDashboardOverviewUseCase: new GetDashboardOverviewUseCase(repositories.dashboardRepository),
    analyzeCampaignUseCase: new AnalyzeCampaignUseCase(repositories.plannerRepository),
    getHomeShowcaseUseCase: new GetHomeShowcaseUseCase(repositories.showcaseRepository),
    getMarketBuyersShowcaseUseCase: new GetMarketBuyersShowcaseUseCase(repositories.showcaseRepository),
    getFarmShowcaseUseCase: new GetFarmShowcaseUseCase(repositories.showcaseRepository),
    getSunatExportsOverviewUseCase: new GetSunatExportsOverviewUseCase(repositories.sunatExportsRepository)
  };
}

function createControllers(useCases: UseCaseRegistry) {
  return {
    authController: new AuthController(
      useCases.registerAuthUseCase,
      useCases.loginAuthUseCase,
      useCases.getCurrentAuthUserUseCase,
      useCases.logoutAuthUseCase
    ),
    farmController: new FarmController(
      useCases.getCurrentUserFarmsUseCase,
      useCases.createFarmUseCase,
      useCases.updateFarmUseCase,
      useCases.deleteFarmUseCase
    ),
    campaignController: new CampaignController(
      useCases.createCampaignUseCase,
      useCases.getCurrentUserCampaignsUseCase,
      useCases.updateCampaignUseCase,
      useCases.deleteCampaignUseCase
    ),
    healthController: new HealthController(),
    dashboardController: new DashboardController(useCases.getDashboardOverviewUseCase),
    plannerController: new PlannerController(useCases.analyzeCampaignUseCase),
    showcaseController: new ShowcaseController(
      useCases.getHomeShowcaseUseCase,
      useCases.getMarketBuyersShowcaseUseCase,
      useCases.getFarmShowcaseUseCase
    ),
    sunatExportsController: new SunatExportsController(useCases.getSunatExportsOverviewUseCase)
  };
}
