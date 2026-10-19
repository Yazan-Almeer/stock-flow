import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    sku: z.string().min(2, 'SKU must be at least 2 characters'),
    description: z.string().optional(),
    costPrice: z.number().positive('Cost price must be positive').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
    name: z.string().min(2).optional(),
    sku: z.string().min(2).optional(),
    description: z.string().optional(),
    costPrice: z.number().positive().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    isActive: z.string().optional(),
  }),
});
