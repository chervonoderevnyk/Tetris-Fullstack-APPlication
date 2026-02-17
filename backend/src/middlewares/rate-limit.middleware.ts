import { Request, Response, NextFunction } from 'express';
import { Config } from '../config/config';
import { securityLogger } from '../utils/security-logger';
import { RateLimitStore } from '../types';

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean old records every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  isAllowed(identifier: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const record = this.store[identifier];

    if (!record || record.resetTime < now) {
      // Create new record or update old one
      this.store[identifier] = {
        requests: 1,
        resetTime: now + this.windowMs
      };
      return { allowed: true };
    }

    if (record.requests >= this.maxRequests) {
      return { allowed: false, resetTime: record.resetTime };
    }

    record.requests++;
    return { allowed: true };
  }
}

// Rate limiters for different request types
const refreshTokenLimiter = new RateLimiter(
  Config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  Math.floor(Config.RATE_LIMIT_MAX_REQUESTS / 10) // 10 refresh requests per 15 minutes
);

const generalLimiter = new RateLimiter(
  Config.RATE_LIMIT_WINDOW_MS, // 15 minutes 
  Config.RATE_LIMIT_MAX_REQUESTS // 100 requests per 15 minutes
);

// Middleware for rate limiting refresh token endpoint
export function refreshTokenRateLimit(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const identifier = `refresh_${clientIp}`;
  
  const result = refreshTokenLimiter.isAllowed(identifier);
  
  if (!result.allowed) {
    const retryAfter = result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : 900;
    
    // Log rate limit exceeded
    securityLogger.logRateLimitExceeded(clientIp, userAgent, 'POST /auth/refresh');
    
    res.set({
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Limit': Math.floor(Config.RATE_LIMIT_MAX_REQUESTS / 10).toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': result.resetTime ? new Date(result.resetTime).toISOString() : ''
    });
    
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded for refresh token requests',
      retryAfter
    });
    return;
  }
  
  next();
}

// General rate limiting middleware
export function generalRateLimit(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const identifier = `general_${clientIp}`;
  
  const result = generalLimiter.isAllowed(identifier);
  
  if (!result.allowed) {
    const retryAfter = result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : 900;
    
    // Log rate limit exceeded
    securityLogger.logRateLimitExceeded(clientIp, userAgent, `${req.method} ${req.path}`);
    
    res.set({
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Limit': Config.RATE_LIMIT_MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': result.resetTime ? new Date(result.resetTime).toISOString() : ''
    });
    
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
      retryAfter
    });
    return;
  }
  
  next();
}