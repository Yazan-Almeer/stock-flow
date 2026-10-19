import { Router } from 'express';
import { BranchesController } from './branches.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createBranchSchema,
  updateBranchSchema,
  branchIdParamSchema,
} from './brances.validation';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', BranchesController.getAllBranches);
router.get('/:id', validate(branchIdParamSchema), BranchesController.getBranchById);
router.post('/', authorize(UserRole.ADMIN), validate(createBranchSchema), BranchesController.createBranch);
router.put('/:id', authorize(UserRole.ADMIN), validate(updateBranchSchema), BranchesController.updateBranch);
router.delete('/:id', authorize(UserRole.ADMIN), validate(branchIdParamSchema), BranchesController.deleteBranch);

export default router;
