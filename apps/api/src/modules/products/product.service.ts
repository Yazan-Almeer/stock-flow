import { prisma } from '../../db/prisma';
import { ApiError } from '../../utils/api-error';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductService {
  static async getAllProducts(query: { page?: string; limit?: string; search?: string; categoryId?: string; isActive?: string }) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
          balances: {
            include: {
              branch: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return createPaginatedResponse(products, total, page, limit);
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        balances: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  static async createProduct(data: { categoryId?: string | null; name: string; sku: string; description?: string; costPrice?: number | null; isActive?: boolean }) {
    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing) {
      throw ApiError.badRequest('Product SKU already exists');
    }

    return prisma.product.create({
      data: {
        ...data,
        costPrice: data.costPrice !== undefined && data.costPrice !== null ? new Decimal(data.costPrice) : null,
      },
      include: {
        category: true,
      },
    });
  }

  static async updateProduct(id: string, data: { categoryId?: string | null; name?: string; sku?: string; description?: string; costPrice?: number | null; isActive?: boolean }) {
    await ProductService.getProductById(id);

    if (data.sku) {
      const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existing && existing.id !== id) {
        throw ApiError.badRequest('Product SKU already exists');
      }
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        costPrice: data.costPrice !== undefined && data.costPrice !== null ? new Decimal(data.costPrice) : undefined,
      },
      include: {
        category: true,
      },
    });
  }

  static async deleteProduct(id: string) {
    await ProductService.getProductById(id);

    // Check if product has non-zero stock balances
    const balances = await prisma.inventoryBalance.findMany({ where: { productId: id, quantity: { gt: 0 } } });
    if (balances.length > 0) {
      throw ApiError.badRequest('Cannot delete product with remaining stock in branches');
    }

    return prisma.product.delete({
      where: { id },
    });
  }
}
