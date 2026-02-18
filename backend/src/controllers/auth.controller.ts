import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest, SecurityEventType } from '../types';
import { CookieMiddleware } from '../middlewares/cookie.middleware';
import { securityLogger } from '../utils/security-logger';
import { PasswordValidator } from '../utils/password-validator';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password, avatar } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      const user = await AuthService.register(username, password, avatar);
      
      // Automatically log in user after registration
      const tokens = AuthService.generateTokens(user.id);
      
      // Save refresh token in database
      await AuthService.updateRefreshToken(user.id, tokens.refreshToken);
      
      // Set refresh token in HttpOnly cookie
      CookieMiddleware.setRefreshTokenCookie(res, tokens.refreshToken);
      
      // Log successful registration
      securityLogger.logLoginAttempt(true, clientIp, userAgent, username, user.id);
      
      res.status(201).json({ 
        message: 'User registered and logged in successfully',
        tokenA: tokens.accessToken,
        user: { id: user.id, username: user.username, avatar: user.avatar }
      });
    } catch (error) {
      // Log failed registration
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      securityLogger.logLoginAttempt(false, clientIp, userAgent, req.body.username);
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      const result = await AuthService.login(username, password);
      
      // Set refresh token in HttpOnly cookie
      CookieMiddleware.setRefreshTokenCookie(res, result.refreshToken);
      
      // Log successful login
      securityLogger.logLoginAttempt(true, clientIp, userAgent, username, result.user.id);
      
      // Return only access token and user info (without refresh token)
      res.json({ 
        tokenA: result.tokenA,
        user: result.user
      });
    } catch (error) {
      // Log failed login
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      securityLogger.logLoginAttempt(false, clientIp, userAgent, req.body.username);
      next(error);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getUserById(req.userId!);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json({ id: user.id, username: user.username, avatar: user.avatar });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      const refreshToken = CookieMiddleware.getRefreshTokenFromCookie(req);
      if (!refreshToken) {
        securityLogger.logRefreshToken(false, clientIp, userAgent);
        res.status(401).json({ error: 'No refresh token provided' });
        return;
      }

      const result = await AuthService.refreshTokens(refreshToken);
      
      // Set new refresh token in cookie
      CookieMiddleware.setRefreshTokenCookie(res, result.refreshToken);
      
      // Log successful token refresh
      securityLogger.logRefreshToken(true, clientIp, userAgent, result.user.id);
      
      // Return new access token and user info
      res.json({ 
        tokenA: result.tokenA,
        user: result.user
      });
    } catch (error) {
      // Log failed token refresh
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      securityLogger.logRefreshToken(false, clientIp, userAgent);
      
      // Clear cookie on any refresh token error
      CookieMiddleware.clearRefreshTokenCookie(res);
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      // Revoke refresh token from database
      await AuthService.revokeRefreshToken(userId);
      
      // Clear cookie
      CookieMiddleware.clearRefreshTokenCookie(res);
      
      // Log logout
      securityLogger.logLogout(userId, clientIp, userAgent);
      
      res.json({ message: 'Successfully logged out' });
    } catch (error) {
      next(error);
    }
  }

  // Check authentication status (will try to use refresh token if available)
  static async status(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = CookieMiddleware.getRefreshTokenFromCookie(req);
      
      if (!refreshToken) {
        res.json({ authenticated: false });
        return;
      }

      // Try to get user through refresh token
      const result = await AuthService.refreshTokens(refreshToken);
      
      // Set new refresh token
      CookieMiddleware.setRefreshTokenCookie(res, result.refreshToken);
      
      res.json({ 
        authenticated: true,
        tokenA: result.tokenA,
        user: result.user
      });
    } catch (error) {
      // If refresh token is invalid - clear cookie
      CookieMiddleware.clearRefreshTokenCookie(res);
      res.json({ authenticated: false });
    }
  }

  // Delete user account with password confirmation
  static async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { password } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      if (!password) {
        res.status(400).json({ error: 'Password is required to delete account' });
        return;
      }

      const deletedUser = await AuthService.deleteAccount(userId, password);
      
      // Clear refresh token cookie
      CookieMiddleware.clearRefreshTokenCookie(res);
      
      // Log account deletion for security audit
      securityLogger.logEvent({
        type: SecurityEventType.ACCOUNT_DELETED,
        ip: clientIp,
        userAgent,
        userId,
        username: deletedUser.username,
        severity: 'medium'
      });

      res.json({ 
        message: 'Account deleted successfully',
        user: { 
          id: deletedUser.id, 
          username: deletedUser.username 
        }
      });

    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Password strength check (public endpoint)
  static async checkPasswordStrength(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password, username } = req.body;
      
      if (!password) {
        res.status(400).json({ error: 'Password is required for validation' });
        return;
      }

      const validation = PasswordValidator.validate(password);
      const isSimilarToUsername = username ? PasswordValidator.isPasswordSimilarToUsername(password, username) : false;
      
      // Add username similarity error if needed
      if (isSimilarToUsername) {
        validation.errors.push('Password should not contain or be similar to the username');
        validation.isValid = false;
      }

      res.json({
        isValid: validation.isValid,
        errors: validation.errors,
        strength: validation.strength,
        score: validation.score,
        tips: PasswordValidator.generatePasswordTips()
      });

    } catch (error: any) {
      console.error('Password strength check error:', error);
      res.status(500).json({ error: 'Error checking password strength' });
    }
  }
}