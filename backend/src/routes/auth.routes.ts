import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();

const registerValidation = validateRequest([
  { field: 'username', required: true, type: 'string', minLength: 3, maxLength: 50 },
  { field: 'password', required: true, type: 'string', minLength: 6, maxLength: 100 },
  { field: 'avatar', required: true, type: 'string', minLength: 1 }
]);

const loginValidation = validateRequest([
  { field: 'username', required: true, type: 'string' },
  { field: 'password', required: true, type: 'string' }
]);

router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.get('/me', authenticateToken, AuthController.me);

export default router;
