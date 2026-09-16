import { Router } from 'express';
import { testDatabaseConnection } from '../lib/prisma';

const router = Router();

/**
 * GET /api/v1/health
 * Public health check endpoint with database connectivity verification
 */
router.get('/', async (_req, res) => {
  const dbHealthy = await testDatabaseConnection();
  
  res.json({
    status: 'ok',
    service: 'e-maanak-api',
    version: 'v1',
    database: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
