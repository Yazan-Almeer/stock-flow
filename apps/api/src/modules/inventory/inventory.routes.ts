import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  adjustStockSchema,
  inventoryQuerySchema,
  transactionQuerySchema,
} from './inventory.validation';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/balances', validate(inventoryQuerySchema), InventoryController.getBalances);
router.post('/adjust', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(adjustStockSchema), InventoryController.adjustStock);
router.get('/transactions', validate(transactionQuerySchema), InventoryController.getTransactions);

export default router;
