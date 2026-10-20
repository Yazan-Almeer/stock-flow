import { PrismaClient, UserRole, UserStatus, StockTransferStatus, InventoryTransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.stockTransferItem.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryBalance.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database data.');

  // 1. Create Admin User
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@stockflow.com',
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: 'Branch Manager',
      email: 'manager@stockflow.com',
      passwordHash,
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('👤 Created users: Admin and Manager.');

  // 2. Create 3 Branches (Damascus, Aleppo, Homs)
  const damascus = await prisma.branch.create({
    data: {
      name: 'Damascus Central',
      code: 'DAM-01',
      address: 'Umayyad Square, Damascus',
      isActive: true,
    },
  });

  const aleppo = await prisma.branch.create({
    data: {
      name: 'Aleppo Warehouse',
      code: 'ALP-01',
      address: 'Baghdad Street, Aleppo',
      isActive: true,
    },
  });

  const homs = await prisma.branch.create({
    data: {
      name: 'Homs Hub',
      code: 'HMS-01',
      address: 'Cairo Street, Homs',
      isActive: true,
    },
  });

  console.log('🏢 Created branches: Damascus, Aleppo, Homs.');

  // 3. Create Categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
    },
  });

  const office = await prisma.category.create({
    data: {
      name: 'Office Supplies',
      slug: 'office-supplies',
    },
  });

  console.log('📂 Created categories.');

  // 4. Create Sample Products
  const laptop = await prisma.product.create({
    data: {
      categoryId: electronics.id,
      name: 'Pro Laptop 15"',
      sku: 'ELEC-LAP-015',
      description: 'High performance laptop for professionals',
      costPrice: 1200.00,
      isActive: true,
    },
  });

  const monitor = await prisma.product.create({
    data: {
      categoryId: electronics.id,
      name: '4K Ultra Monitor 27"',
      sku: 'ELEC-MON-027',
      description: 'Crystal clear 4K IPS monitor',
      costPrice: 350.00,
      isActive: true,
    },
  });

  const chair = await prisma.product.create({
    data: {
      categoryId: office.id,
      name: 'Ergonomic Office Chair',
      sku: 'OFF-CHR-001',
      description: 'Comfortable mesh office chair with lumbar support',
      costPrice: 150.00,
      isActive: true,
    },
  });

  console.log('📦 Created sample products.');

  // 5. Initial Balances
  const products = [laptop, monitor, chair];
  const branches = [damascus, aleppo, homs];

  for (const branch of branches) {
    for (const prod of products) {
      const initialQty = Math.floor(Math.random() * 50) + 10;
      
      await prisma.inventoryBalance.create({
        data: {
          branchId: branch.id,
          productId: prod.id,
          quantity: initialQty,
          reorderPoint: 10,
          targetStock: 50,
        },
      });

      await prisma.inventoryTransaction.create({
        data: {
          branchId: branch.id,
          productId: prod.id,
          performedById: adminUser.id,
          type: InventoryTransactionType.INITIAL_STOCK,
          quantityDelta: initialQty,
          quantityAfter: initialQty,
          reason: 'Initial opening stock seed',
        },
      });
    }
  }

  console.log('📊 Initialized inventory balances and transactions.');

  // 6. Sample Stock Transfer
  const transfer = await prisma.stockTransfer.create({
    data: {
      sourceBranchId: damascus.id,
      destinationBranchId: aleppo.id,
      status: StockTransferStatus.APPROVED,
      createdById: adminUser.id,
      items: {
        create: [
          {
            productId: laptop.id,
            quantity: 5,
          },
          {
            productId: chair.id,
            quantity: 10,
          },
        ],
      },
    },
  });

  console.log(`🚚 Created sample transfer from Damascus to Aleppo: ${transfer.id}`);
  console.log('✅ Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
