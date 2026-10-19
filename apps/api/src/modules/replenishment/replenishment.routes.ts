import { Router } from 'express';
import { ReplenishmentController } from './replenishment.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/recommendations', authorize(UserRole.ADMIN, UserRole.MANAGER), ReplenishmentController.getRecommendations);

export default router;
