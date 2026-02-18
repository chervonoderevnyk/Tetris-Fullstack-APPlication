import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { refreshTokenRateLimit } from '../middlewares/rate-limit.middleware';

const router = Router();

const registerValidation = validateRequest([
  { field: 'username', required: true, type: 'string', minLength: 3, maxLength: 50 },
  { field: 'password', required: true, type: 'string', minLength: 8, maxLength: 100 },
  { field: 'avatar', required: true, type: 'string', minLength: 1 }
]);

const loginValidation = validateRequest([
  { field: 'username', required: true, type: 'string' },
  { field: 'password', required: true, type: 'string' }
]);

const deleteAccountValidation = validateRequest([
  { field: 'password', required: true, type: 'string' }
]);

const passwordStrengthValidation = validateRequest([
  { field: 'password', required: true, type: 'string' },
  { field: 'username', required: false, type: 'string' }
]);

router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/refresh', refreshTokenRateLimit, AuthController.refresh); // With rate limiting
router.post('/logout', authenticateToken, AuthController.logout); // Protected logout
router.get('/status', AuthController.status); // Authentication status check
router.get('/me', authenticateToken, AuthController.me);
router.delete('/delete-account', authenticateToken, deleteAccountValidation, AuthController.deleteAccount); // Protected account deletion with validation
router.post('/check-password-strength', passwordStrengthValidation, AuthController.checkPasswordStrength); // Public password strength checker

export default router;
