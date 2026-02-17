/**
 * Типи подій безпеки для логування
 */
export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILED = 'REFRESH_TOKEN_FAILED',
  TOKEN_VALIDATION_FAILED = 'TOKEN_VALIDATION_FAILED',
  LOGOUT = 'LOGOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CORS_BLOCKED = 'CORS_BLOCKED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED'
}

/**
 * Подія безпеки для логування
 */
export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  userId?: number;
  username?: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}