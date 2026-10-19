import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/tokens';
import { ApiError } from '../utils/api-error';
import { prisma } from '../db/prisma';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { status: string };
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw ApiError.unauthorized('User not found or account is disabled');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};
