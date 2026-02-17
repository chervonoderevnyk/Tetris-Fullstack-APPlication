import { Config } from '../config/config';
import { SecurityEvent, SecurityEventType } from '../types';

// Re-export for backward compatibility
export { SecurityEvent, SecurityEventType };

class SecurityLogger {
  private static instance: SecurityLogger;
  
  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  public logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    // Format log for readability
    const logMessage = this.formatLogMessage(fullEvent);

    // In development output to console, in production can add other transports
    if (Config.NODE_ENV === 'development') {
      console.log(`🔒 [SECURITY] ${logMessage}`);
    } else {
      // In production can add:
      // - File logging
      // - Send to external logging service (Sentry, LogRocket)
      // - Database for audit trail
      console.log(`[SECURITY] ${logMessage}`);
    }

    // For critical events can add additional actions
    if (fullEvent.severity === 'critical') {
      this.handleCriticalEvent(fullEvent);
    }
  }

  private formatLogMessage(event: SecurityEvent): string {
    const parts = [
      `[${event.severity.toUpperCase()}]`,
      `[${event.type}]`,
      event.ip ? `IP: ${event.ip}` : null,
      event.userId ? `User: ${event.userId}` : null,
      event.username ? `Username: ${event.username}` : null,
      event.details ? `Details: ${JSON.stringify(event.details)}` : null
    ].filter(Boolean);

    return parts.join(' | ');
  }

  private handleCriticalEvent(event: SecurityEvent): void {
    // Here can add additional actions for critical events:
    // - Send email/SMS alerts
    // - Block IP address
    // - Integration with security monitoring systems
    console.error(`🚨 CRITICAL SECURITY EVENT: ${event.type}`, event);
  }

  // Helper methods for different event types
  public logLoginAttempt(success: boolean, ip: string, userAgent: string, username?: string, userId?: number): void {
    this.logEvent({
      type: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILED,
      ip,
      userAgent,
      username,
      userId,
      severity: success ? 'low' : 'medium'
    });
  }

  public logRefreshToken(success: boolean, ip: string, userAgent: string, userId?: number): void {
    this.logEvent({
      type: success ? SecurityEventType.REFRESH_TOKEN_SUCCESS : SecurityEventType.REFRESH_TOKEN_FAILED,
      ip,
      userAgent,
      userId,
      severity: success ? 'low' : 'medium'
    });
  }

  public logTokenValidationFailure(ip: string, userAgent: string, details?: any): void {
    this.logEvent({
      type: SecurityEventType.TOKEN_VALIDATION_FAILED,
      ip,
      userAgent,
      details,
      severity: 'medium'
    });
  }

  public logRateLimitExceeded(ip: string, userAgent: string, endpoint: string): void {
    this.logEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      ip,
      userAgent,
      details: { endpoint },
      severity: 'high'
    });
  }

  public logCorsBlocked(origin: string, ip: string): void {
    this.logEvent({
      type: SecurityEventType.CORS_BLOCKED,
      ip,
      details: { origin },
      severity: 'medium'
    });
  }

  public logLogout(userId: number, ip: string, userAgent: string): void {
    this.logEvent({
      type: SecurityEventType.LOGOUT,
      ip,
      userAgent,
      userId,
      severity: 'low'
    });
  }
}

// Singleton instance
export const securityLogger = SecurityLogger.getInstance();