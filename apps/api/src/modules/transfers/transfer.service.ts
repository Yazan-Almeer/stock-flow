import { prisma } from '../../db/prisma';
import { ApiError } from '../../utils/api-error';
import { InventoryService } from '../inventory/inventory.service';
import { StockTransferStatus, InventoryTransactionType } from '@prisma/client';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

export class TransferService {
  static async createTransfer(data: { sourceBranchId: string; destinationBranchId: string; userId: string; items: Array<{ productId: string; quantity: number }> }) {
    return prisma.$transaction(async (tx) => {
      const sourceBranch = await tx.branch.findUnique({ where: { id: data.sourceBranchId } });
      const destBranch = await tx.branch.findUnique({ where: { id: data.destinationBranchId } });

      if (!sourceBranch || !destBranch) {
        throw ApiError.notFound('Source or destination branch not found');
      }

      const transfer = await tx.stockTransfer.create({
        data: {
          sourceBranchId: data.sourceBranchId,
          destinationBranchId: data.destinationBranchId,
          status: StockTransferStatus.DRAFT,
          createdById: data.userId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          sourceBranch: true,
          destinationBranch: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      return transfer;
    });
  }

  static async getTransfers(query: { page?: string; limit?: string; status?: string; branchId?: string }) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.branchId) {
      where.OR = [
        { sourceBranchId: query.branchId },
        { destinationBranchId: query.branchId },
      ];
    }

    const [total, transfers] = await Promise.all([
      prisma.stockTransfer.count({ where }),
      prisma.stockTransfer.findMany({
        where,
        include: {
          sourceBranch: true,
          destinationBranch: true,
          createdBy: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return createPaginatedResponse(transfers, total, page, limit);
  }

  static async getTransferById(id: string) {
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        sourceBranch: true,
        destinationBranch: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    if (!transfer) {
      throw ApiError.notFound('Stock transfer not found');
    }

    return transfer;
  }

  static async approveTransfer(id: string) {
    const transfer = await TransferService.getTransferById(id);

    if (transfer.status !== StockTransferStatus.DRAFT) {
      throw ApiError.badRequest('Only DRAFT transfers can be approved');
    }

    return prisma.stockTransfer.update({
      where: { id },
      data: { status: StockTransferStatus.APPROVED, approvedAt: new Date() },
      include: { items: { include: { product: true } }, sourceBranch: true, destinationBranch: true },
    });
  }

  static async dispatchTransfer(id: string, userId: string) {
    const transfer = await TransferService.getTransferById(id);

    if (transfer.status !== StockTransferStatus.APPROVED) {
      throw ApiError.badRequest('Transfer must be APPROVED before dispatching');
    }

    return prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        // Deduct from source branch via InventoryService
        await InventoryService.adjustStock({
          branchId: transfer.sourceBranchId,
          productId: item.productId,
          quantityChange: -item.quantity,
          type: InventoryTransactionType.TRANSFER_OUT,
          userId,
          stockTransferId: transfer.id,
          reason: `Dispatched transfer to ${transfer.destinationBranch.name}`,
        });
      }

      return tx.stockTransfer.update({
        where: { id },
        data: { status: StockTransferStatus.DISPATCHED, dispatchedAt: new Date() },
        include: { items: { include: { product: true } }, sourceBranch: true, destinationBranch: true },
      });
    });
  }

  static async receiveTransfer(id: string, userId: string) {
    const transfer = await TransferService.getTransferById(id);

    if (transfer.status !== StockTransferStatus.DISPATCHED) {
      throw ApiError.badRequest('Transfer must be DISPATCHED before receiving');
    }

    return prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        // Add to destination branch via InventoryService
        await InventoryService.adjustStock({
          branchId: transfer.destinationBranchId,
          productId: item.productId,
          quantityChange: item.quantity,
          type: InventoryTransactionType.TRANSFER_IN,
          userId,
          stockTransferId: transfer.id,
          reason: `Received transfer from ${transfer.sourceBranch.name}`,
        });
      }

      return tx.stockTransfer.update({
        where: { id },
        data: { status: StockTransferStatus.RECEIVED, receivedAt: new Date() },
        include: { items: { include: { product: true } }, sourceBranch: true, destinationBranch: true },
      });
    });
  }

  static async cancelTransfer(id: string, userId: string) {
    const transfer = await TransferService.getTransferById(id);

    if (transfer.status === StockTransferStatus.RECEIVED || transfer.status === StockTransferStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot cancel a received or already cancelled transfer');
    }

    return prisma.$transaction(async (tx) => {
      // If already dispatched, revert stock to source branch
      if (transfer.status === StockTransferStatus.DISPATCHED) {
        for (const item of transfer.items) {
          await InventoryService.adjustStock({
            branchId: transfer.sourceBranchId,
            productId: item.productId,
            quantityChange: item.quantity,
            type: InventoryTransactionType.CORRECTION,
            userId,
            stockTransferId: transfer.id,
            reason: 'Reverted stock due to cancelled transfer',
          });
        }
      }

      return tx.stockTransfer.update({
        where: { id },
        data: { status: StockTransferStatus.CANCELLED, cancelledAt: new Date() },
        include: { items: { include: { product: true } }, sourceBranch: true, destinationBranch: true },
      });
    });
  }
}
