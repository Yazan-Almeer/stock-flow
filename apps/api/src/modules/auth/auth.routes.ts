import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema } from './auth.validation';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', authenticate, AuthController.logout);

export default router;
