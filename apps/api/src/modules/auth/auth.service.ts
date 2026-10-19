import { prisma } from '../../db/prisma';
import { comparePassword } from '../../utils/password';
import { generateToken } from '../../utils/tokens';
import { ApiError } from '../../utils/api-error';
import { UserStatus } from '@prisma/client';

export class AuthService {
  static async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw ApiError.forbidden('Account is disabled');
    }

    const isPasswordValid = await comparePassword(passwordPlain, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}
