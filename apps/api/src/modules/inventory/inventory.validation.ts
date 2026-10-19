import { z } from 'zod';
import { InventoryTransactionType } from '@prisma/client';

export const adjustStockSchema = z.object({
  body: z.object({
    branchId: z.string().uuid('Invalid branch ID'),
    productId: z.string().uuid('Invalid product ID'),
    quantityChange: z.number().int('Quantity change must be an integer'),
    type: z.enum([
      InventoryTransactionType.ADJUSTMENT_IN,
      InventoryTransactionType.ADJUSTMENT_OUT,
      InventoryTransactionType.CORRECTION,
    ]),
    notes: z.string().optional(),
  }),
});

export const inventoryQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    branchId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    lowStock: z.string().optional(),
  }),
});

export const transactionQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    branchId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
  }),
});
