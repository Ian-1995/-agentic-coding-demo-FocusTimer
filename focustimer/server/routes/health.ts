import { Router } from 'express';
import { prisma } from '../utils/prisma';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        status: 'healthy',
        db: 'connected',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        db: 'disconnected',
        timestamp: new Date().toISOString(),
      },
    });
  }
});
