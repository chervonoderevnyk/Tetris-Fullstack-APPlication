import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

interface RateLimitEntry {
  count: number;
  lastRequest: Date;
}

export class GameRateLimitMiddleware {
  private static scoreSubmissions = new Map<number, RateLimitEntry>();

  // Rate limiting for score submissions
  static scoreSubmissionLimit = (
    maxSubmissions: number = 3,        // Max 3 submissions
    windowMinutes: number = 5          // Per 5 minutes
  ) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const now = new Date();
      const windowMs = windowMinutes * 60 * 1000;
      
      const userEntry = this.scoreSubmissions.get(userId);
      
      if (!userEntry) {
        // First submission
        this.scoreSubmissions.set(userId, {
          count: 1,
          lastRequest: now
        });
        next();
        return;
      }

      const timeSinceLastRequest = now.getTime() - userEntry.lastRequest.getTime();
      
      if (timeSinceLastRequest > windowMs) {
        // Window expired, reset counter
        this.scoreSubmissions.set(userId, {
          count: 1,
          lastRequest: now
        });
        next();
        return;
      }

      if (userEntry.count >= maxSubmissions) {
        const remainingTimeMs = windowMs - timeSinceLastRequest;
        const remainingMinutes = Math.ceil(remainingTimeMs / (60 * 1000));
        
        res.status(429).json({ 
          error: `Too many score submissions. Try again in ${remainingMinutes} minute(s).`,
          retryAfter: remainingTimeMs
        });
        return;
      }

      // Increment counter
      userEntry.count++;
      userEntry.lastRequest = now;
      
      next();
    };
  };

  // Clean up old entries periodically
  static cleanup(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [userId, entry] of this.scoreSubmissions.entries()) {
      if (now.getTime() - entry.lastRequest.getTime() > maxAge) {
        this.scoreSubmissions.delete(userId);
      }
    }
  }
}

// Clean up every hour
setInterval(() => {
  GameRateLimitMiddleware.cleanup();
}, 60 * 60 * 1000);