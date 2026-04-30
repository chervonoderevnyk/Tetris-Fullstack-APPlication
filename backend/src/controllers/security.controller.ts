import { Request, Response, NextFunction } from 'express';
import { SecurityLogger } from '../middlewares/security-logger.middleware';

export class SecurityController {
  // Get all users with suspicious activity (admin only)
  static async getSuspiciousUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const suspiciousUsers = SecurityLogger.getAllSuspiciousUsers();
      res.json(suspiciousUsers);
    } catch (error) {
      next(error);
    }
  }

  // Get specific user's suspicious attempts (admin only)
  static async getUserSuspiciousAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      
      if (!userId || isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const attempts = SecurityLogger.getUserSuspiciousAttempts(userId);
      res.json({ userId, attempts });
    } catch (error) {
      next(error);
    }
  }
}