import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export class SecurityLogger {
  private static suspiciousAttempts = new Map<number, Array<{ 
    timestamp: Date; 
    score: number; 
    level: number; 
    reason: string 
  }>>();

  /**
   * Middleware to log suspicious score submissions
   */
  static logSuspiciousActivity = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const originalSend = res.json;
    
    res.json = function(body: any) {
      // Check if response contains validation error
      if (res.statusCode === 400 && body.error && body.error.includes('Suspicious')) {
        const userId = req.userId;
        const { score, level } = req.body;
        
        if (userId) {
          SecurityLogger.logAttempt(userId, score, level, body.error);
        }
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };

  private static logAttempt(userId: number, score: number, level: number, reason: string): void {
    const userAttempts = this.suspiciousAttempts.get(userId) || [];
    
    userAttempts.push({
      timestamp: new Date(),
      score,
      level,
      reason
    });
    
    // Keep only last 50 attempts per user
    if (userAttempts.length > 50) {
      userAttempts.splice(0, userAttempts.length - 50);
    }
    
    this.suspiciousAttempts.set(userId, userAttempts);
    
    // Log to console/file
    console.warn(`[SECURITY] Suspicious score submission:`, {
      userId,
      score,
      level,
      reason,
      timestamp: new Date().toISOString()
    });
    
    // Check for repeated offenders
    this.checkRepeatedOffender(userId, userAttempts);
  }

  private static checkRepeatedOffender(userId: number, attempts: Array<any>): void {
    const recentAttempts = attempts.filter(
      attempt => attempt.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    if (recentAttempts.length >= 10) {
      console.error(`[SECURITY ALERT] User ${userId} has ${recentAttempts.length} suspicious attempts in 24h:`, {
        userId,
        attemptsCount: recentAttempts.length,
        reasons: [...new Set(recentAttempts.map(a => a.reason))]
      });
      
      // Here you could implement additional actions:
      // - Temporarily ban user
      // - Send alert to admins
      // - Require additional verification
    }
  }

  /**
   * Get suspicious attempts for a user (for admin purposes)
   */
  static getUserSuspiciousAttempts(userId: number) {
    return this.suspiciousAttempts.get(userId) || [];
  }

  /**
   * Get all users with suspicious activity (for admin purposes)
   */
  static getAllSuspiciousUsers() {
    const result: { userId: number; attemptsCount: number; lastAttempt: Date }[] = [];
    
    for (const [userId, attempts] of this.suspiciousAttempts.entries()) {
      const recentAttempts = attempts.filter(
        attempt => attempt.timestamp.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
      );
      
      if (recentAttempts.length > 0) {
        result.push({
          userId,
          attemptsCount: recentAttempts.length,
          lastAttempt: recentAttempts[recentAttempts.length - 1].timestamp
        });
      }
    }
    
    return result.sort((a, b) => b.attemptsCount - a.attemptsCount);
  }
}