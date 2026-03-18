import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { validate } from '../middleware/validate';
import { verifyToken, type AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const sessionsRouter = Router();

sessionsRouter.use(verifyToken);

const createSessionSchema = z.object({
  task_id: z.string().uuid().nullable().optional(),
  duration_minutes: z.number().int().min(1).max(120),
  completed_at: z.string().datetime(),
});

const bulkSyncSchema = z.object({
  sessions: z.array(z.object({
    task_id: z.string().uuid().nullable().optional(),
    duration_minutes: z.number().int().min(1).max(120),
    completed_at: z.string().datetime(),
  })).min(1).max(100),
});

// GET /sessions
sessionsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { from, to, task_id, limit = '50', offset = '0' } = req.query;
    const where: Record<string, unknown> = { user_id: req.userId! };

    if (from || to) {
      const completedAt: Record<string, Date> = {};
      if (from) completedAt.gte = new Date(from as string);
      if (to) completedAt.lte = new Date(to as string);
      where.completed_at = completedAt;
    }

    if (task_id) {
      where.task_id = task_id as string;
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        orderBy: { completed_at: 'desc' },
        take: Math.min(Number(limit), 100),
        skip: Number(offset),
        include: { task: { select: { id: true, name: true } } },
      }),
      prisma.session.count({ where }),
    ]);

    res.json({ success: true, data: { sessions, total } });
  } catch (err) {
    next(err);
  }
});

// POST /sessions
sessionsRouter.post('/', validate(createSessionSchema), async (req: AuthRequest, res, next) => {
  try {
    const { task_id, duration_minutes, completed_at } = req.body;

    if (task_id) {
      const task = await prisma.task.findFirst({
        where: { id: task_id, user_id: req.userId!, deleted_at: null },
      });
      if (!task) {
        return next(createError(404, 'TASK_NOT_FOUND', 'Task not found'));
      }
    }

    const session = await prisma.session.create({
      data: {
        user_id: req.userId!,
        task_id: task_id || null,
        duration_minutes,
        completed_at: new Date(completed_at),
      },
    });
    res.status(201).json({ success: true, data: { session } });
  } catch (err) {
    next(err);
  }
});

// POST /sessions/bulk-sync
sessionsRouter.post('/bulk-sync', validate(bulkSyncSchema), async (req: AuthRequest, res, next) => {
  try {
    const { sessions } = req.body;

    const created = await prisma.session.createMany({
      data: sessions.map((s: { task_id?: string | null; duration_minutes: number; completed_at: string }) => ({
        user_id: req.userId!,
        task_id: s.task_id || null,
        duration_minutes: s.duration_minutes,
        completed_at: new Date(s.completed_at),
      })),
    });

    res.status(201).json({ success: true, data: { count: created.count } });
  } catch (err) {
    next(err);
  }
});

// DELETE /sessions/:id
sessionsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.session.findFirst({
      where: { id, user_id: req.userId! },
    });
    if (!existing) {
      return next(createError(404, 'SESSION_NOT_FOUND', 'Session not found'));
    }

    await prisma.session.delete({ where: { id } });
    res.json({ success: true, data: { message: 'Session deleted' } });
  } catch (err) {
    next(err);
  }
});
