import type { Express } from 'express';
import type { Env } from '../../../infrastructure/config/env.js';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { HealthController } from '../controllers/health.controller.js';
import { MidagriController } from '../controllers/midagri.controller.js';
import { PlannerController } from '../controllers/planner.controller.js';
import { SisapController } from '../controllers/sisap.controller.js';
import { SunatExportsController } from '../controllers/sunat-exports.controller.js';
import { getMidagriTopProductsQuerySchema } from '../dtos/midagri/get-midagri-top-products.query.js';
import { getMidagriTrendQuerySchema } from '../dtos/midagri/get-midagri-trend.query.js';
import { analyzeCampaignQuerySchema } from '../dtos/planner/analyze-campaign.query.js';
import { getSisapProductTrendQuerySchema } from '../dtos/sisap/get-sisap-product-trend.query.js';
import { getSisapTopProductsQuerySchema } from '../dtos/sisap/get-sisap-top-products.query.js';
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
  sisapController: SisapController;
  sunatExportsController: SunatExportsController;
  midagriController: MidagriController;
};

export function registerRoutes({
  app,
  env,
  healthController,
  dashboardController,
  plannerController,
  sisapController,
  sunatExportsController,
  midagriController
}: RegisterRoutesDependencies): void {
  app.get(`${env.apiPrefix}/health`, healthController.getStatus.bind(healthController));
  app.get(`${env.apiPrefix}/dashboard/overview`, asyncHandler(dashboardController.getOverview.bind(dashboardController)));
  app.get(
    `${env.apiPrefix}/planner/analysis`,
    validateRequest('query', analyzeCampaignQuerySchema),
    asyncHandler(plannerController.analyzeCampaign.bind(plannerController))
  );
  app.get(`${env.apiPrefix}/sisap/overview`, asyncHandler(sisapController.getOverview.bind(sisapController)));
  app.get(
    `${env.apiPrefix}/sisap/top-products`,
    validateRequest('query', getSisapTopProductsQuerySchema),
    asyncHandler(sisapController.getTopProducts.bind(sisapController))
  );
  app.get(
    `${env.apiPrefix}/sisap/trend`,
    validateRequest('query', getSisapProductTrendQuerySchema),
    asyncHandler(sisapController.getTrend.bind(sisapController))
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
  app.get(`${env.apiPrefix}/midagri/exports/overview`, asyncHandler(midagriController.getExportsOverview.bind(midagriController)));
  app.get(
    `${env.apiPrefix}/midagri/exports/top-products`,
    validateRequest('query', getMidagriTopProductsQuerySchema),
    asyncHandler(midagriController.getExportsTopProducts.bind(midagriController))
  );
  app.get(
    `${env.apiPrefix}/midagri/exports/trend`,
    validateRequest('query', getMidagriTrendQuerySchema),
    asyncHandler(midagriController.getExportsTrend.bind(midagriController))
  );
  app.get(`${env.apiPrefix}/midagri/imports/overview`, asyncHandler(midagriController.getImportsOverview.bind(midagriController)));
  app.get(
    `${env.apiPrefix}/midagri/imports/top-products`,
    validateRequest('query', getMidagriTopProductsQuerySchema),
    asyncHandler(midagriController.getImportsTopProducts.bind(midagriController))
  );
  app.get(
    `${env.apiPrefix}/midagri/imports/trend`,
    validateRequest('query', getMidagriTrendQuerySchema),
    asyncHandler(midagriController.getImportsTrend.bind(midagriController))
  );
}
