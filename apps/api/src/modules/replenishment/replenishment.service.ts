import { prisma } from '../../db/prisma';

export class ReplenishmentService {
  /**
   * Calculates low stock and recommended transfers/replenishments across branches.
   * Threshold is set to 10 units. Suggests balancing from branches with excess stock (> 20 units).
   */
  static async getReplenishmentRecommendations() {
    // 1. Find all inventory balances where quantity <= 10 (Low Stock)
    const lowStockItems = await prisma.inventoryBalance.findMany({
      where: {
        quantity: { lte: 10 },
      },
      include: {
        branch: true,
        product: true,
      },
      orderBy: { quantity: 'asc' },
    });

    const recommendations = [];

    for (const item of lowStockItems) {
      const deficit = 15 - item.quantity; // Target level: 15 units

      // Find candidate source branches with surplus stock (> 20 units) for the same product
      const potentialSources = await prisma.inventoryBalance.findMany({
        where: {
          productId: item.productId,
          branchId: { not: item.branchId },
          quantity: { gt: 20 },
        },
        include: {
          branch: true,
        },
        orderBy: { quantity: 'desc' },
      });

      recommendations.push({
        product: {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
        },
        deficitBranch: {
          id: item.branch.id,
          name: item.branch.name,
          code: item.branch.code,
          currentStock: item.quantity,
        },
        suggestedRestockQuantity: deficit,
        potentialSources: potentialSources.map((source) => ({
          branch: {
            id: source.branch.id,
            name: source.branch.name,
            code: source.branch.code,
          },
          availableStock: source.quantity,
          recommendedTransferQuantity: Math.min(deficit, source.quantity - 10),
        })),
      });
    }

    return recommendations;
  }
}
