import { prisma } from '../../db/prisma';
import { ApiError } from '../../utils/api-error';

export class CategoriesService {
  static async getAllCategories() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return category;
  }

  static async createCategory(data: { name: string; slug: string }) {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw ApiError.badRequest('Category slug already exists');
    }

    return prisma.category.create({
      data,
    });
  }

  static async updateCategory(id: string, data: { name?: string; slug?: string }) {
    await CategoriesService.getCategoryById(id);

    if (data.slug) {
      const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) {
        throw ApiError.badRequest('Category slug already exists');
      }
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: string) {
    const category = await CategoriesService.getCategoryById(id);

    if (category.products && category.products.length > 0) {
      throw ApiError.badRequest('Cannot delete category with associated products');
    }

    return prisma.category.delete({
      where: { id },
    });
  }
}
