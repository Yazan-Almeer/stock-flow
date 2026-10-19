import { prisma } from '../../db/prisma';
import { ApiError } from '../../utils/api-error';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';
import { InventoryTransactionType } from '@prisma/client';

export class InventoryService {
  /**
   * STRICT INVENTORY CONSISTENCY RULE:
   * ONLY InventoryService is allowed to mutate inventory_balances.quantity.
   * Every stock change MUST run inside prisma.$transaction, block negative stock (quantity < 0),
   * update inventory_balances, and insert an immutable inventory_transactions record atomically.
   */
  static async adjustStock(data: {
    branchId: string;
    productId: string;
    quantityChange: number;
    type: InventoryTransactionType;
    userId: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch or initialize inventory balance with locking/read
      let balance = await tx.inventoryBalance.findUnique({
        where: {
          branchId_productId: {
            branchId: data.branchId,
            productId: data.productId,
          },
        },
      });

      const previousQuantity = balance ? balance.quantity : 0;
      const newQuantity = previousQuantity + data.quantityChange;

      // 2. Block negative stock constraint
      if (newQuantity < 0) {
        throw ApiError.badRequest(
          `Insufficient stock. Current quantity: ${previousQuantity}, requested change: ${data.quantityChange}`
        );
      }

      // 3. Upsert inventory balance
      if (balance) {
        balance = await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: newQuantity },
        });
      } else {
        balance = await tx.inventoryBalance.create({
          data: {
            branchId: data.branchId,
            productId: data.productId,
            quantity: newQuantity,
          },
        });
      }

      // 4. Insert immutable inventory transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          branchId: data.branchId,
          productId: data.productId,
          userId: data.userId,
          type: data.type,
          quantityChange: data.quantityChange,
          previousQuantity,
          newQuantity,
          referenceType: data.referenceType || 'MANUAL_ADJUSTMENT',
          referenceId: data.referenceId || null,
          notes: data.notes || null,
        },
      });

      return {
        balance,
        transaction,
      };
    });
  }

  static async getBalances(query: { page?: string; limit?: string; branchId?: string; productId?: string; lowStock?: string }) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: any = {};

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.lowStock === 'true') {
      where.quantity = { lte: 10 }; // Low stock threshold definition
    }

    const [total, balances] = await Promise.all([
      prisma.inventoryBalance.count({ where }),
      prisma.inventoryBalance.findMany({
        where,
        include: {
          branch: true,
          product: {
            include: { category: true },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return createPaginatedResponse(balances, total, page, limit);
  }

  static async getTransactions(query: { page?: string; limit?: string; branchId?: string; productId?: string }) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: any = {};

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.productId) {
      where.productId = query.productId;
    }

    const [total, transactions] = await Promise.all([
      prisma.inventoryTransaction.count({ where }),
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          branch: true,
          product: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return createPaginatedResponse(transactions, total, page, limit);
  }
}
