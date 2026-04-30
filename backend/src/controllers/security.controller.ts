import { Request, Response, NextFunction } from 'express';
import { SecurityLogger } from '../middlewares/security-logger.middleware';

export class SecurityController {
  static async getSuspiciousUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const suspiciousUsers = await SecurityLogger.getAllSuspiciousUsers();
      res.json(suspiciousUsers);
    } catch (error) {
      next(error);
    }
  }

  static async getUserSuspiciousAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);

      if (!userId || isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const attempts = await SecurityLogger.getUserSuspiciousAttempts(userId);
      res.json({ userId, attempts });
    } catch (error) {
      next(error);
    }
  }
}
