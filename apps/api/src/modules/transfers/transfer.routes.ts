import { Router } from 'express';
import { TransferController } from './transfer.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createTransferSchema,
  transferIdParamSchema,
  dispatchTransferSchema,
  receiveTransferSchema,
  transferQuerySchema,
} from './transfer.validation';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', validate(transferQuerySchema), TransferController.getTransfers);
router.get('/:id', validate(transferIdParamSchema), TransferController.getTransferById);
router.post('/', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(createTransferSchema), TransferController.createTransfer);
router.post('/:id/approve', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(transferIdParamSchema), TransferController.approveTransfer);
router.post('/:id/dispatch', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(dispatchTransferSchema), TransferController.dispatchTransfer);
router.post('/:id/receive', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(receiveTransferSchema), TransferController.receiveTransfer);
router.post('/:id/cancel', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(transferIdParamSchema), TransferController.cancelTransfer);

export default router;
