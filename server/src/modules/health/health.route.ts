import { HealthController } from './health.controller';
import { Router } from 'express';
import { Request, Response } from 'express';

const healthController = new HealthController();

export function healthRoutes(): Router {
  const router = Router();
  router.get(
    '/health',
    async (req: Request, res: Response) =>
      await healthController.check(req, res),
  );
  return router;
}
