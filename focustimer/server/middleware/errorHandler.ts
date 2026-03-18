import { type Request, type Response, type NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  console.error(`[Error] ${code}: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode === 500 ? 'Internal server error' : err.message,
    },
  });
}

export function createError(statusCode: number, code: string, message: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
