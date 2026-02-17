import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../errors/AppError';
import { CookieMiddleware } from './cookie.middleware';
import { Config } from '../config/config';
import { securityLogger } from '../utils/security-logger';
import { AuthRequest } from '../types';

// Re-export for backward compatibility
export { AuthRequest };

// Validates access token from Authorization header
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'];
  
    const accessToken = authHeader && authHeader.split(' ')[1];
    if (!accessToken) {
      throw new AuthenticationError('No access token provided');
    }
  
    jwt.verify(accessToken, Config.JWT_SECRET, (err, payload: any) => {
      if (err) {
        // Log failed token validation
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        securityLogger.logTokenValidationFailure(clientIp, userAgent, { error: err.message });
        
        next(new AuthorizationError('Invalid or expired access token'));
        return;
      }
  
      req.userId = payload.userId;
      next();
    });
  } catch (error) {
    next(error);
  }
}

// Validates refresh token from HttpOnly cookies
export function authenticateRefreshToken(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const refreshToken = CookieMiddleware.getRefreshTokenFromCookie(req);
    if (!refreshToken) {
      throw new AuthenticationError('No refresh token provided');
    }
  
    jwt.verify(refreshToken, Config.REFRESH_JWT_SECRET, (err, payload: any) => {
      if (err) {
        // Clear invalid cookie
        CookieMiddleware.clearRefreshTokenCookie(res);
        next(new AuthorizationError('Invalid or expired refresh token'));
        return;
      }
  
      req.userId = payload.userId;
      // Store refresh token for future use
      (req as any).refreshToken = refreshToken;
      next();
    });
  } catch (error) {
    next(error);
  }
}

// Tries to use access token, if fails - returns 401 for refresh attempt
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];
    
    if (!accessToken) {
      // No token - continue without authentication
      next();
      return;
    }
  
    jwt.verify(accessToken, Config.JWT_SECRET, (err, payload: any) => {
      if (err) {
        // Access token invalid - client should use refresh
        next();
        return;
      }
  
      req.userId = payload.userId;
      next();
    });
  } catch (error) {
    next();
  }
}