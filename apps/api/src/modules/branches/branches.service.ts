import { prisma } from '../../db/prisma';
import { ApiError } from '../../utils/api-error';

export class BranchesService {
  static async getAllBranches() {
    return prisma.branch.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getBranchById(id: string) {
    const branch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    return branch;
  }

  static async createBranch(data: { name: string; code: string; address?: string; isActive?: boolean }) {
    const existing = await prisma.branch.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw ApiError.badRequest('Branch code already exists');
    }

    return prisma.branch.create({
      data: {
        name: data.name,
        code: data.code,
        address: data.address,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async updateBranch(id: string, data: { name?: string; code?: string; address?: string; isActive?: boolean }) {
    await BranchesService.getBranchById(id);

    if (data.code) {
      const existing = await prisma.branch.findUnique({ where: { code: data.code } });
      if (existing && existing.id !== id) {
        throw ApiError.badRequest('Branch code already exists');
      }
    }

    return prisma.branch.update({
      where: { id },
      data,
    });
  }

  static async deleteBranch(id: string) {
    await BranchesService.getBranchById(id);

    // Check if branch has inventory balances or transfers
    const balanceCount = await prisma.inventoryBalance.count({ where: { branchId: id, quantity: { gt: 0 } } });
    if (balanceCount > 0) {
      throw ApiError.badRequest('Cannot delete branch with active stock balances');
    }

    return prisma.branch.delete({
      where: { id },
    });
  }
}
