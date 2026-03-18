import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { validate } from '../middleware/validate';
import { verifyToken, type AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const tasksRouter = Router();

// All task routes require authentication
tasksRouter.use(verifyToken);

const createTaskSchema = z.object({
  name: z.string().min(1).max(100),
});

const updateTaskSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_archived: z.boolean().optional(),
});

// GET /tasks
tasksRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { archived } = req.query;
    const where: Record<string, unknown> = {
      user_id: req.userId!,
      deleted_at: null,
    };
    if (archived === 'true') {
      where.is_archived = true;
    } else if (archived === 'false' || archived === undefined) {
      where.is_archived = false;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: { tasks } });
  } catch (err) {
    next(err);
  }
});

// POST /tasks
tasksRouter.post('/', validate(createTaskSchema), async (req: AuthRequest, res, next) => {
  try {
    const { name } = req.body;
    const task = await prisma.task.create({
      data: { user_id: req.userId!, name },
    });
    res.status(201).json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
});

// PATCH /tasks/:id
tasksRouter.patch('/:id', validate(updateTaskSchema), async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.task.findFirst({
      where: { id, user_id: req.userId!, deleted_at: null },
    });
    if (!existing) {
      return next(createError(404, 'TASK_NOT_FOUND', 'Task not found'));
    }

    const task = await prisma.task.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id (soft delete)
tasksRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.task.findFirst({
      where: { id, user_id: req.userId!, deleted_at: null },
    });
    if (!existing) {
      return next(createError(404, 'TASK_NOT_FOUND', 'Task not found'));
    }

    await prisma.task.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    res.json({ success: true, data: { message: 'Task deleted' } });
  } catch (err) {
    next(err);
  }
});
