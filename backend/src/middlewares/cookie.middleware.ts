import { Response } from 'express';
import { Config } from '../config/config';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export class CookieMiddleware {
  // Sets HttpOnly Secure SameSite cookie for refresh token
  static setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: Config.COOKIE_HTTP_ONLY,  // Cookie not accessible via JavaScript
      secure: Config.COOKIE_SECURE,       // HTTPS in production
      sameSite: Config.COOKIE_SAME_SITE,  // CSRF protection
      maxAge: Config.COOKIE_MAX_AGE_MS,   // TTL from config
      path: Config.COOKIE_PATH,           // Path from config
      domain: Config.COOKIE_DOMAIN,       // Domain if needed
    });
    
    console.log(`Setting cookie: secure=${Config.COOKIE_SECURE}, sameSite=${Config.COOKIE_SAME_SITE}, maxAge=${Config.COOKIE_MAX_AGE_MS}ms`);
  }

  // Clears refresh token cookie
  static clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: Config.COOKIE_HTTP_ONLY,
      secure: Config.COOKIE_SECURE,
      sameSite: Config.COOKIE_SAME_SITE,
      path: Config.COOKIE_PATH,
      domain: Config.COOKIE_DOMAIN,
    });
    
    console.log('Refresh token cookie cleared');
  }

  // Gets refresh token from cookie
  static getRefreshTokenFromCookie(req: any): string | null {
    return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || null;
  }
}