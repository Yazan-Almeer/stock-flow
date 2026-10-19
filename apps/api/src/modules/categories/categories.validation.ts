import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    slug: z.string().min(2, 'Category slug must be at least 2 characters'),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
  }),
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});
