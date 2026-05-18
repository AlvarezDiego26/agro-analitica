import type { Express } from 'express';
import type { Env } from '../../../infrastructure/config/env.js';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { HealthController } from '../controllers/health.controller.js';
import { PlannerController } from '../controllers/planner.controller.js';
import { SunatExportsController } from '../controllers/sunat-exports.controller.js';
import { analyzeCampaignQuerySchema } from '../dtos/planner/analyze-campaign.query.js';
import { getSunatExportsTrendQuerySchema } from '../dtos/sunat/get-sunat-exports-trend.query.js';
import { getSunatTopProductsQuerySchema } from '../dtos/sunat/get-sunat-top-products.query.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import { validateRequest } from '../middlewares/validate-request.middleware.js';

type RegisterRoutesDependencies = {
  app: Express;
  env: Env;
  healthController: HealthController;
  dashboardController: DashboardController;
  plannerController: PlannerController;
  sunatExportsController: SunatExportsController;
};

export function registerRoutes({
  app,
  env,
  healthController,
  dashboardController,
  plannerController,
  sunatExportsController
}: RegisterRoutesDependencies): void {
  app.get(`${env.apiPrefix}/health`, healthController.getStatus.bind(healthController));
  app.get(`${env.apiPrefix}/dashboard/overview`, asyncHandler(dashboardController.getOverview.bind(dashboardController)));
  app.get(
    `${env.apiPrefix}/planner/analysis`,
    validateRequest('query', analyzeCampaignQuerySchema),
    asyncHandler(plannerController.analyzeCampaign.bind(plannerController))
  );
  app.get(`${env.apiPrefix}/sunat/exports/overview`, asyncHandler(sunatExportsController.getOverview.bind(sunatExportsController)));
  app.get(
    `${env.apiPrefix}/sunat/exports/top-products`,
    validateRequest('query', getSunatTopProductsQuerySchema),
    asyncHandler(sunatExportsController.getTopProducts.bind(sunatExportsController))
  );
  app.get(
    `${env.apiPrefix}/sunat/exports/trend`,
    validateRequest('query', getSunatExportsTrendQuerySchema),
    asyncHandler(sunatExportsController.getTrend.bind(sunatExportsController))
  );
}
