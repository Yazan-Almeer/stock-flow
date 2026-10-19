import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  userIdParamSchema,
} from './users.validation';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN, UserRole.MANAGER), UsersController.getAllUsers);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(userIdParamSchema), UsersController.getUserById);
router.post('/', authorize(UserRole.ADMIN), validate(createUserSchema), UsersController.createUser);
router.put('/:id', authorize(UserRole.ADMIN), validate(updateUserSchema), UsersController.updateUser);
router.patch('/:id/status', authorize(UserRole.ADMIN), validate(updateStatusSchema), UsersController.updateStatus);

export default router;
