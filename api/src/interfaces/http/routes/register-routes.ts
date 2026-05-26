import type { Express } from "express";
import type { Env } from "../../../infrastructure/config/env.js";
import { AuthController } from "../controllers/auth.controller.js";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { FarmController } from "../controllers/farm.controller.js";
import { HealthController } from "../controllers/health.controller.js";
import { PlannerController } from "../controllers/planner.controller.js";
import { ShowcaseController } from "../controllers/showcase.controller.js";
import { SunatExportsController } from "../controllers/sunat-exports.controller.js";
import { CampaignController } from "../controllers/campaign.controller.js";
import { loginAuthBodySchema } from "../dtos/auth/login-auth.body.js";
import { registerAuthBodySchema } from "../dtos/auth/register-auth.body.js";
import { createCampaignBodySchema } from "../dtos/campaigns/create-campaign.body.js";
import { createFarmBodySchema } from "../dtos/farms/create-farm.body.js";
import { analyzeCampaignQuerySchema } from "../dtos/planner/analyze-campaign.query.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { requireAuthToken } from "../middlewares/require-auth-token.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";

type RegisterRoutesDependencies = {
  app: Express;
  env: Env;
  authController: AuthController;
  farmController: FarmController;
  healthController: HealthController;
  dashboardController: DashboardController;
  plannerController: PlannerController;
  showcaseController: ShowcaseController;
  sunatExportsController: SunatExportsController;
  campaignController: CampaignController;
};

export function registerRoutes({
  app,
  env,
  authController,
  farmController,
  healthController,
  dashboardController,
  plannerController,
  showcaseController,
  sunatExportsController,
  campaignController
}: RegisterRoutesDependencies): void {
  app.post(
    `${env.apiPrefix}/auth/register`,
    validateRequest("body", registerAuthBodySchema),
    asyncHandler(authController.register.bind(authController))
  );
  app.post(
    `${env.apiPrefix}/auth/login`,
    validateRequest("body", loginAuthBodySchema),
    asyncHandler(authController.login.bind(authController))
  );
  app.get(
    `${env.apiPrefix}/auth/me`,
    requireAuthToken,
    asyncHandler(authController.me.bind(authController))
  );
  app.post(
    `${env.apiPrefix}/auth/logout`,
    requireAuthToken,
    asyncHandler(authController.logout.bind(authController))
  );
  app.get(
    `${env.apiPrefix}/farms`,
    requireAuthToken,
    asyncHandler(farmController.listCurrentUserFarms.bind(farmController))
  );
  app.post(
    `${env.apiPrefix}/farms`,
    requireAuthToken,
    validateRequest("body", createFarmBodySchema),
    asyncHandler(farmController.createFarm.bind(farmController))
  );
  app.patch(
    `${env.apiPrefix}/farms/:id`,
    requireAuthToken,
    asyncHandler(farmController.updateFarm.bind(farmController))
  );
  app.delete(
    `${env.apiPrefix}/farms/:id`,
    requireAuthToken,
    asyncHandler(farmController.deleteFarm.bind(farmController))
  );
  app.get(`${env.apiPrefix}/health`, healthController.getStatus.bind(healthController));
  app.get(`${env.apiPrefix}/dashboard/overview`, asyncHandler(dashboardController.getOverview.bind(dashboardController)));
  app.get(`${env.apiPrefix}/showcase/home`, asyncHandler(showcaseController.getHome.bind(showcaseController)));
  app.get(
    `${env.apiPrefix}/showcase/market-buyers`,
    asyncHandler(showcaseController.getMarketBuyers.bind(showcaseController))
  );
  app.get(`${env.apiPrefix}/showcase/farm`, asyncHandler(showcaseController.getFarm.bind(showcaseController)));
  app.get(
    `${env.apiPrefix}/planner/analysis`,
    validateRequest("query", analyzeCampaignQuerySchema),
    asyncHandler(plannerController.analyzeCampaign.bind(plannerController))
  );
  app.post(
    `${env.apiPrefix}/campaigns`,
    requireAuthToken,
    validateRequest("body", createCampaignBodySchema),
    asyncHandler(campaignController.createCampaign.bind(campaignController))
  );
  app.get(
    `${env.apiPrefix}/campaigns`,
    requireAuthToken,
    asyncHandler(campaignController.listCurrentUserCampaigns.bind(campaignController))
  );
  app.patch(
    `${env.apiPrefix}/campaigns/:id`,
    requireAuthToken,
    asyncHandler(campaignController.updateCampaign.bind(campaignController))
  );
  app.delete(
    `${env.apiPrefix}/campaigns/:id`,
    requireAuthToken,
    asyncHandler(campaignController.deleteCampaign.bind(campaignController))
  );
  app.get(`${env.apiPrefix}/sunat/exports/overview`, asyncHandler(sunatExportsController.getOverview.bind(sunatExportsController)));
}
