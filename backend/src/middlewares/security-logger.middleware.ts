import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { SuspiciousAttemptRepository } from '../repositories/suspicious-attempt.repository';

export class SecurityLogger {
  static logSuspiciousActivity = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      if (res.statusCode === 400 && body?.error?.includes('Suspicious')) {
        const userId = req.userId;
        const { score, level } = req.body;

        if (userId) {
          SecurityLogger.persistAttempt(userId, score, level, body.error);
        }
      }

      return originalJson(body);
    };

    next();
  };

  private static persistAttempt(userId: number, score: number, level: number, reason: string): void {
    console.warn('[SECURITY] Suspicious score submission:', {
      userId,
      score,
      level,
      reason,
      timestamp: new Date().toISOString(),
    });

    SuspiciousAttemptRepository.create({ userId, score, level, reason })
      .then(() => SuspiciousAttemptRepository.countByUserId(userId, 24))
      .then((count) => {
        if (count >= 10) {
          console.error(
            `[SECURITY ALERT] User ${userId} has ${count} suspicious attempts in the last 24h`
          );
        }
      })
      .catch((err) => console.error('[SECURITY] Failed to persist suspicious attempt:', err));
  }

  static async getUserSuspiciousAttempts(userId: number) {
    return SuspiciousAttemptRepository.findByUserId(userId);
  }

  static async getAllSuspiciousUsers() {
    return SuspiciousAttemptRepository.findTopOffenders();
  }
}
