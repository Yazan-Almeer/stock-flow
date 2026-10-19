import { z } from 'zod';

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Branch name must be at least 2 characters'),
    code: z.string().min(2, 'Branch code must be at least 2 characters'),
    address: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateBranchSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid branch ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(2).optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const branchIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid branch ID'),
  }),
});
