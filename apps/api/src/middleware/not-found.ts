import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  throw ApiError.notFound(`Route not found - ${req.originalUrl}`);
};
