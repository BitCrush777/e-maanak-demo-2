import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/v1/health
 * Public health check endpoint
 */
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
