import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(UserRole),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});
