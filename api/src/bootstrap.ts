import { createApp } from './app.js';
import { createContainer } from './container.js';
import { errorHandler } from './interfaces/http/middlewares/error-handler.middleware.js';
import { notFoundHandler } from './interfaces/http/middlewares/not-found.middleware.js';
import { registerRoutes } from './interfaces/http/routes/register-routes.js';

export function bootstrap() {
  const app = createApp();
  const { env, controllers } = createContainer();

  registerRoutes({
    app,
    env,
    healthController: controllers.healthController,
    dashboardController: controllers.dashboardController,
    plannerController: controllers.plannerController,
    sunatExportsController: controllers.sunatExportsController
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, env };
}
