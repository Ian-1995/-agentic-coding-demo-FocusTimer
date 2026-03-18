import { type Request, type Response, type NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const error = Object.assign(new Error('Validation failed'), {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: err.issues.map((e) => `${(e.path as (string | number)[]).join('.')}: ${e.message}`).join(', '),
        });
        return next(error);
      }
      next(err);
    }
  };
}
