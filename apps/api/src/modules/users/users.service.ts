import { prisma } from '../../db/prisma';
import { hashPassword } from '../../utils/password';
import { ApiError } from '../../utils/api-error';
import { UserRole, UserStatus } from '@prisma/client';

export class UsersService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
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

  static async createUser(data: { name: string; email: string; password: string; role: UserRole }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw ApiError.badRequest('Email already in use');
    }

    const passwordHash = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  static async updateUser(id: string, data: { name?: string; email?: string; role?: UserRole }) {
    await UsersService.getUserById(id);

    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw ApiError.badRequest('Email already in use by another user');
      }
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  static async updateStatus(id: string, status: UserStatus) {
    await UsersService.getUserById(id);

    return prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }
}
