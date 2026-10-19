import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productQuerySchema,
} from './product.validation';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', validate(productQuerySchema), ProductController.getAllProducts);
router.get('/:id', validate(productIdParamSchema), ProductController.getProductById);
router.post('/', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(createProductSchema), ProductController.createProduct);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.MANAGER), validate(updateProductSchema), ProductController.updateProduct);
router.delete('/:id', authorize(UserRole.ADMIN), validate(productIdParamSchema), ProductController.deleteProduct);

export default router;
