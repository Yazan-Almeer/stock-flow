import { z } from 'zod';

export const createTransferSchema = z.object({
  body: z.object({
    sourceBranchId: z.string().uuid('Invalid source branch ID'),
    destinationBranchId: z.string().uuid('Invalid destination branch ID'),
    items: z.array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        requestedQuantity: z.number().int().positive('Requested quantity must be positive'),
      })
    ).min(1, 'Transfer must contain at least one item'),
  }).refine((data) => data.sourceBranchId !== data.destinationBranchId, {
    message: 'Source and destination branches cannot be the same',
    path: ['destinationBranchId'],
  }),
});

export const transferIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transfer ID'),
  }),
});

export const dispatchTransferSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transfer ID'),
  }),
  body: z.object({
    items: z.array(
      z.object({
        itemId: z.string().uuid('Invalid item ID'),
        dispatchedQuantity: z.number().int().nonnegative('Dispatched quantity cannot be negative'),
      })
    ).min(1, 'At least one item must be dispatched'),
  }),
});

export const receiveTransferSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transfer ID'),
  }),
  body: z.object({
    items: z.array(
      z.object({
        itemId: z.string().uuid('Invalid item ID'),
        receivedQuantity: z.number().int().nonnegative('Received quantity cannot be negative'),
      })
    ).min(1, 'At least one item must be received'),
  }),
});

export const transferQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    branchId: z.string().uuid().optional(),
  }),
});
