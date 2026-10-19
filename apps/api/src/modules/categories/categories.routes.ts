import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from './categories.validation';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', CategoriesController.getAllCategories);
router.get('/:id', validate(categoryIdParamSchema), CategoriesController.getCategoryById);
router.post('/', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(createCategorySchema), CategoriesController.createCategory);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(updateCategorySchema), CategoriesController.updateCategory);
router.delete('/:id', authorize(UserRole.ADMIN), validate(categoryIdParamSchema), CategoriesController.deleteCategory);

export default router;
