import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/valuation', authorize(UserRole.ADMIN, UserRole.MANAGER), ReportsController.getInventoryValuation);
router.get('/audit-logs', authorize(UserRole.ADMIN), ReportsController.getAuditLogs);

export default router;
