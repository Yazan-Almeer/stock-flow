import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/api-error';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return next(ApiError.badRequest('Validation Error', errors));
    }
    next(error);
  }
};
