import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { validate } from '../middleware/validate';
import { verifyToken, type AuthRequest } from '../middleware/auth';

export const settingsRouter = Router();

settingsRouter.use(verifyToken);

const updateSettingsSchema = z.object({
  work_duration: z.number().int().min(1).max(120).optional(),
  short_break_duration: z.number().int().min(1).max(60).optional(),
  long_break_duration: z.number().int().min(1).max(60).optional(),
  long_break_interval: z.number().int().min(1).max(10).optional(),
  sound_enabled: z.boolean().optional(),
  notification_enabled: z.boolean().optional(),
});

// GET /settings
settingsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { user_id: req.userId! },
    });

    if (!settings) {
      // Return defaults without creating a record
      settings = {
        id: '',
        user_id: req.userId!,
        work_duration: 25,
        short_break_duration: 5,
        long_break_duration: 15,
        long_break_interval: 4,
        sound_enabled: true,
        notification_enabled: true,
      };
    }

    const { id: _, ...data } = settings;
    res.json({ success: true, data: { settings: data } });
  } catch (err) {
    next(err);
  }
});

// PUT /settings (UPSERT)
settingsRouter.put('/', validate(updateSettingsSchema), async (req: AuthRequest, res, next) => {
  try {
    const settings = await prisma.settings.upsert({
      where: { user_id: req.userId! },
      create: {
        user_id: req.userId!,
        ...req.body,
      },
      update: req.body,
    });

    const { id: _, ...data } = settings;
    res.json({ success: true, data: { settings: data } });
  } catch (err) {
    next(err);
  }
});
