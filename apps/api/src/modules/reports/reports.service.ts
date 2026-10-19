import { prisma } from '../../db/prisma';

export class ReportsService {
  static async getInventoryValuation() {
    const balances = await prisma.inventoryBalance.findMany({
      include: {
        branch: true,
        product: true,
      },
    });

    const valuationByBranch: Record<string, { branchName: string; totalItems: number; totalValue: number }> = {};
    let grandTotalValue = 0;
    let grandTotalItems = 0;

    for (const b of balances) {
      const costPrice = b.product.costPrice ? Number(b.product.costPrice) : 0;
      const totalValue = b.quantity * costPrice;

      grandTotalValue += totalValue;
      grandTotalItems += b.quantity;

      if (!valuationByBranch[b.branchId]) {
        valuationByBranch[b.branchId] = {
          branchName: b.branch.name,
          totalItems: 0,
          totalValue: 0,
        };
      }

      valuationByBranch[b.branchId].totalItems += b.quantity;
      valuationByBranch[b.branchId].totalValue += totalValue;
    }

    return {
      grandTotalItems,
      grandTotalValue,
      valuationByBranch: Object.values(valuationByBranch),
    };
  }

  static async getAuditLogs(query: { page?: string; limit?: string; userId?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.userId) {
      where.userId = query.userId;
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
