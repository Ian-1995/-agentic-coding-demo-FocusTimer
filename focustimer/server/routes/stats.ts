import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { verifyToken, type AuthRequest } from '../middleware/auth';

export const statsRouter = Router();

statsRouter.use(verifyToken);

// GET /stats/summary
statsRouter.get('/summary', async (req: AuthRequest, res, next) => {
  try {
    const { from, to } = req.query;
    const where: Record<string, unknown> = { user_id: req.userId! };

    if (from || to) {
      const completedAt: Record<string, Date> = {};
      if (from) completedAt.gte = new Date(from as string);
      if (to) completedAt.lte = new Date(to as string);
      where.completed_at = completedAt;
    }

    const sessions = await prisma.session.findMany({ where });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum: number, s: { duration_minutes: number }) => sum + s.duration_minutes, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // Daily average (based on distinct days with sessions)
    const uniqueDays = new Set(
      sessions.map((s: { completed_at: Date }) => s.completed_at.toISOString().split('T')[0])
    );
    const avgSessionsPerDay = uniqueDays.size > 0
      ? Math.round((totalSessions / uniqueDays.size) * 10) / 10
      : 0;
    const avgMinutesPerDay = uniqueDays.size > 0
      ? Math.round((totalMinutes / uniqueDays.size) * 10) / 10
      : 0;

    res.json({
      success: true,
      data: {
        total_sessions: totalSessions,
        total_minutes: totalMinutes,
        total_hours: totalHours,
        avg_sessions_per_day: avgSessionsPerDay,
        avg_minutes_per_day: avgMinutesPerDay,
        active_days: uniqueDays.size,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /stats/by-task
statsRouter.get('/by-task', async (req: AuthRequest, res, next) => {
  try {
    const { from, to } = req.query;
    const where: Record<string, unknown> = { user_id: req.userId! };

    if (from || to) {
      const completedAt: Record<string, Date> = {};
      if (from) completedAt.gte = new Date(from as string);
      if (to) completedAt.lte = new Date(to as string);
      where.completed_at = completedAt;
    }

    const sessions = await prisma.session.findMany({
      where,
      include: { task: { select: { id: true, name: true } } },
    });

    const taskMap = new Map<string, { task_id: string | null; task_name: string; total_sessions: number; total_minutes: number }>();

    for (const s of sessions) {
      const key = s.task_id || '__no_task__';
      const existing = taskMap.get(key);
      if (existing) {
        existing.total_sessions += 1;
        existing.total_minutes += s.duration_minutes;
      } else {
        taskMap.set(key, {
          task_id: s.task_id,
          task_name: s.task?.name || 'No Task',
          total_sessions: 1,
          total_minutes: s.duration_minutes,
        });
      }
    }

    const byTask = Array.from(taskMap.values()).sort((a, b) => b.total_minutes - a.total_minutes);

    res.json({ success: true, data: { by_task: byTask } });
  } catch (err) {
    next(err);
  }
});

// GET /stats/daily
statsRouter.get('/daily', async (req: AuthRequest, res, next) => {
  try {
    const { from, to } = req.query;
    const where: Record<string, unknown> = { user_id: req.userId! };

    if (from || to) {
      const completedAt: Record<string, Date> = {};
      if (from) completedAt.gte = new Date(from as string);
      if (to) completedAt.lte = new Date(to as string);
      where.completed_at = completedAt;
    }

    const sessions = await prisma.session.findMany({
      where,
      orderBy: { completed_at: 'asc' },
    });

    const dailyMap = new Map<string, { date: string; sessions: number; minutes: number }>();

    for (const s of sessions) {
      const date = s.completed_at.toISOString().split('T')[0];
      const existing = dailyMap.get(date);
      if (existing) {
        existing.sessions += 1;
        existing.minutes += s.duration_minutes;
      } else {
        dailyMap.set(date, { date, sessions: 1, minutes: s.duration_minutes });
      }
    }

    const daily = Array.from(dailyMap.values());

    res.json({ success: true, data: { daily } });
  } catch (err) {
    next(err);
  }
});
