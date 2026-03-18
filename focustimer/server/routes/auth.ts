import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { validate } from '../middleware/validate';
import { verifyToken, generateAccessToken, generateRefreshToken, verifyRefreshToken, type AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  display_name: z.string().min(1).max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /auth/register
authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, display_name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(createError(409, 'EMAIL_EXISTS', 'Email already registered'));
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password_hash, display_name },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token hash
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, display_name: user.display_name },
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deleted_at) {
      return next(createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'));
    }

    // Check account lock
    if (user.locked_until && user.locked_until > new Date()) {
      return next(createError(423, 'ACCOUNT_LOCKED', 'Account is locked. Try again later.'));
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const newCount = user.failed_login_count + 1;
      const updates: Record<string, unknown> = { failed_login_count: newCount };
      if (newCount >= 5) {
        updates.locked_until = new Date(Date.now() + 15 * 60 * 1000);
        updates.failed_login_count = 0;
      }
      await prisma.user.update({ where: { id: user.id }, data: updates });
      return next(createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'));
    }

    // Reset failed count on success
    await prisma.user.update({
      where: { id: user.id },
      data: { failed_login_count: 0, locked_until: null },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, display_name: user.display_name },
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
authRouter.post('/logout', verifyToken, async (req: AuthRequest, res, next) => {
  try {
    // Delete all refresh tokens for this user
    await prisma.refreshToken.deleteMany({ where: { user_id: req.userId! } });
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
});

// POST /auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return next(createError(400, 'MISSING_TOKEN', 'Refresh token required'));
    }

    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(refresh_token);
    } catch {
      return next(createError(401, 'INVALID_TOKEN', 'Invalid refresh token'));
    }

    const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');
    const stored = await prisma.refreshToken.findFirst({
      where: { token_hash: tokenHash, user_id: payload.userId },
    });

    if (!stored || stored.expires_at < new Date()) {
      return next(createError(401, 'TOKEN_EXPIRED', 'Refresh token expired'));
    }

    // Rotate: delete old, create new
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newAccessToken = generateAccessToken(payload.userId);
    const newRefreshToken = generateRefreshToken(payload.userId);
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    await prisma.refreshToken.create({
      data: {
        user_id: payload.userId,
        token_hash: newHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me
authRouter.get('/me', verifyToken, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, display_name: true, created_at: true },
    });
    if (!user) {
      return next(createError(404, 'USER_NOT_FOUND', 'User not found'));
    }
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});
