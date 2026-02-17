# 🛡️ Security Guide - Tetris Game

> Comprehensive security configuration and best practices for production deployment

This document outlines the security measures implemented in the Tetris Game application and provides guidance for secure production deployment.

## 🔒 Security Features Overview

### ✅ Implemented Security Measures

| Feature | Status | Description |
|---------|--------|-------------|
| **JWT Authentication** | ✅ Completed | Access + Refresh token strategy |
| **Password Security** | ✅ Completed | bcrypt hashing with salt rounds |
| **Rate Limiting** | ✅ Completed | Sliding window with IP-based tracking |
| **Security Headers** | ✅ Completed | Comprehensive Helmet.js integration |
| **CORS Protection** | ✅ Completed | Configurable origins whitelist |
| **Input Validation** | ✅ Completed | Custom middleware with sanitization |
| **Security Logging** | ✅ Completed | Structured logging of security events |
| **Account Management** | ✅ Completed | Secure account deletion with verification |
| **HTTPS Support** | ✅ Completed | Production-ready SSL/TLS configuration |
| **Error Sanitization** | ✅ Completed | No sensitive data in error responses |

## 🚀 Production SSL/HTTPS Setup

### 1. SSL Certificate Configuration

#### Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificate files will be created at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### Environment Configuration

```bash
# Production .env
HTTPS_ENABLED=true
HTTPS_PORT=3443
HTTPS_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
HTTPS_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

#### Development SSL (Self-signed)

```bash
# Generate self-signed certificate for development
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Development .env
HTTPS_ENABLED=true
HTTPS_KEY_PATH=./key.pem
HTTPS_CERT_PATH=./cert.pem
```

### 2. Nginx Reverse Proxy Configuration

```nginx
# /etc/nginx/sites-available/tetris-game
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy no-referrer-when-downgrade always;
    add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline'" always;
    
    # Proxy to Node.js backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve Angular frontend
    location / {
        root /var/www/tetris-game/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🚨 Rate Limiting Configuration

### Current Settings

```typescript
// Implemented in rate-limit.middleware.ts
const generalLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: 'Too many requests from this IP'
};

const refreshTokenLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // refresh attempts per window
  skipSuccessfulRequests: true
};
```

### Production Recommendations

```bash
# Production environment variables
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=50           # Stricter for production
REFRESH_TOKEN_LIMIT=5                # Conservative refresh limit
```

### Advanced Rate Limiting

```typescript
// Enhanced rate limiting for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});
```

## 📊 Security Logging

### Logged Security Events

| Event Type | Severity | Description |
|------------|----------|-------------|
| `LOGIN_SUCCESS` | LOW | Successful user authentication |
| `LOGIN_FAILED` | MEDIUM | Failed login attempt |
| `REFRESH_TOKEN_SUCCESS` | LOW | Token refreshed successfully |
| `REFRESH_TOKEN_FAILED` | HIGH | Invalid refresh token used |
| `TOKEN_VALIDATION_FAILED` | MEDIUM | Invalid access token |
| `ACCOUNT_DELETED` | HIGH | User account deletion completed |
| `DELETE_ACCOUNT_FAILED` | HIGH | Account deletion attempt failed |
| `RATE_LIMIT_EXCEEDED` | HIGH | Rate limit violation |
| `CORS_BLOCKED` | HIGH | CORS policy violation |
| `SUSPICIOUS_ACTIVITY` | CRITICAL | Potential security threat |

### Log Format

```typescript
// Security log entry structure
interface SecurityLogEntry {
  timestamp: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  event: string;
  ip: string;
  userAgent?: string;
  userId?: number;
  details: Record<string, any>;
}

// Example log entry
🔒 [SECURITY] [HIGH] [ACCOUNT_DELETED] IP: 192.168.1.100 | User: user123 | Details: {"deletedAt":"2026-02-17T10:30:00Z"}
```

### Integration with External Services

```typescript
// Example integration with monitoring services
const securityLogger = {
  logToSentry: (entry: SecurityLogEntry) => {
    if (entry.level === 'CRITICAL') {
      Sentry.captureException(new Error(`Security Alert: ${entry.event}`), {
        tags: { security: true, severity: entry.level },
        extra: entry
      });
    }
  },
  
  logToSlack: (entry: SecurityLogEntry) => {
    if (['HIGH', 'CRITICAL'].includes(entry.level)) {
      // Send to security Slack channel
    }
  }
};
```

## 🔐 Authentication & Authorization

### JWT Token Strategy

```typescript
// Token configuration
const JWT_CONFIG = {
  accessToken: {
    expiresIn: '15m',        // Short-lived access tokens
    algorithm: 'HS256'
  },
  refreshToken: {
    expiresIn: '7d',         // Longer-lived refresh tokens
    algorithm: 'HS256',
    rotation: true           // Rotate on each refresh
  }
};
```

### Password Security

```typescript
// bcrypt configuration
const BCRYPT_CONFIG = {
  development: {
    rounds: 10              // Faster for development
  },
  production: {
    rounds: 12              // Stronger for production
  }
};
```

### Account Deletion Security

- ✅ **Password Verification**: Current password required
- ✅ **Cascade Deletion**: All user data removed
- ✅ **Audit Logging**: Deletion events logged
- ✅ **Token Invalidation**: All tokens revoked
- ✅ **Confirmation Flow**: Multi-step confirmation

## 🌐 CORS Security Configuration

### Development Configuration

```typescript
const corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Production Configuration

```typescript
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};
```

## 🔍 Security Monitoring & Alerting

### Key Metrics to Monitor

1. **Authentication Failures**: Failed login attempts per hour
2. **Rate Limit Violations**: Requests exceeding limits
3. **Token Validation Errors**: Invalid token usage patterns
4. **Account Deletions**: Unusual account deletion patterns
5. **CORS Violations**: Cross-origin request blocks
6. **SSL Certificate Expiry**: Certificate renewal monitoring

```typescript
// Example monitoring setup
const securityMetrics = {
  failedLoginAttempts: {
    threshold: 50,          // Alert if > 50 failures per hour
    window: '1h'
  },
  rateLimitViolations: {
    threshold: 100,         // Alert if > 100 violations per hour
    window: '1h'
  },
  accountDeletions: {
    threshold: 5,           // Alert if > 5 deletions per day
    window: '24h'
  }
};
```

### Health Check Endpoints

```typescript
// Health check with security status
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    security: {
      httpsEnabled: process.env.HTTPS_ENABLED === 'true',
      rateLimitActive: true,
      corsConfigured: true,
      jwtConfigured: !!process.env.JWT_SECRET
    }
  });
});
```

## 🐳 Docker Production Deployment

### Secure Dockerfile

```dockerfile
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S tetris -u 1001

# Set working directory
WORKDIR /usr/src/app

# Copy from builder
COPY --from=builder --chown=tetris:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=tetris:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=tetris:nodejs /usr/src/app/package.json ./

# Switch to non-root user
USER tetris

# Expose ports
EXPOSE 3001 3443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/index.js"]
```

### Docker Compose Production

```yaml
version: '3.8'

services:
  tetris-backend:
    build: 
      context: .
      target: production
    environment:
      - NODE_ENV=production
      - HTTPS_ENABLED=true
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REFRESH_JWT_SECRET=${REFRESH_JWT_SECRET}
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./logs:/usr/src/app/logs
    ports:
      - "3001:3001"
      - "3443:3443"
    restart: unless-stopped
    depends_on:
      - postgres
    networks:
      - tetris-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - tetris-network

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - tetris-backend
    restart: unless-stopped
    networks:
      - tetris-network

volumes:
  postgres_data:

networks:
  tetris-network:
    driver: bridge
```

## ✅ Production Security Checklist

### Infrastructure Security
- [ ] SSL/TLS certificates configured and auto-renewed
- [ ] HTTPS enforcement enabled (HTTP → HTTPS redirect)
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] Rate limiting configured for production load
- [ ] CORS origins specified (no wildcards in production)
- [ ] Firewall rules configured (only necessary ports open)
- [ ] Regular security updates scheduled

### Application Security
- [ ] JWT secrets changed to unique, strong values
- [ ] Database credentials rotated and secured
- [ ] bcrypt rounds set to 12+ for production
- [ ] Error handling configured (no sensitive data leaks)
- [ ] Input validation enabled on all endpoints  
- [ ] Security logging configured with external monitoring
- [ ] Account deletion flow tested and secured
- [ ] Refresh token rotation enabled

### Monitoring & Maintenance
- [ ] Security monitoring dashboard configured
- [ ] Alerting set up for security events
- [ ] Log rotation and archival configured
- [ ] Database backups automated and tested
- [ ] SSL certificate expiry monitoring
- [ ] Security incident response plan documented
- [ ] Regular security audits scheduled

### Development Security
- [ ] Secrets management system implemented
- [ ] Environment variables properly configured
- [ ] Dependencies regularly updated and audited
- [ ] Security linting enabled in CI/CD
- [ ] Security tests included in test suite
- [ ] Code review process includes security checks

## 📞 Security Incident Response

### Immediate Response Steps

1. **Assess the Situation**
   - Determine scope and severity
   - Check security logs for related events
   - Document initial findings

2. **Contain the Incident**
   - Block malicious IPs if necessary
   - Revoke compromised tokens
   - Scale rate limits temporarily

3. **Investigate and Remediate**
   - Analyze attack vectors
   - Apply security patches
   - Update security configurations

4. **Recovery and Post-Incident**
   - Monitor for continued attacks
   - Update security documentation
   - Conduct post-incident review

### Emergency Contacts

- **System Administrator**: [contact-info]
- **Security Team**: [security-team@company.com]
- **On-call Developer**: [on-call-phone]

---

## 📚 Additional Resources

- **[OWASP Top 10](https://owasp.org/www-project-top-ten/)** - Web application security risks
- **[Node.js Security Best Practices](https://blog.risingstack.com/node-js-security-checklist/)** - Node.js specific security
- **[Angular Security Guide](https://angular.io/guide/security)** - Frontend security practices
- **[JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)** - Token security

For questions about security configurations, please create an issue in the repository or contact the security team.

---

*Last updated: February 17, 2026*
*Security review status: ✅ Completed*
```

### 3. Security Logging ✅

#### Автоматично логуються події:

- ✅ **LOGIN_SUCCESS** / **LOGIN_FAILED** - Спроби входу
- ✅ **REFRESH_TOKEN_SUCCESS** / **REFRESH_TOKEN_FAILED** - Оновлення токенів
- ✅ **TOKEN_VALIDATION_FAILED** - Невдалі перевірки токенів
- ✅ **LOGOUT** - Вихід з системи
- ✅ **RATE_LIMIT_EXCEEDED** - Перевищення лімітів
- ✅ **CORS_BLOCKED** - Заблоковані CORS запити

#### Формат логів:

```
🔒 [SECURITY] [MEDIUM] [LOGIN_FAILED] IP: 192.168.1.100 | Username: user123
🔒 [SECURITY] [HIGH] [RATE_LIMIT_EXCEEDED] IP: 192.168.1.100 | Details: {"endpoint":"POST /auth/refresh"}
```

#### Рівні серйозності:

- **LOW**: Успішні дії (логін, logout)
- **MEDIUM**: Невдалі спроби, невалідні токени
- **HIGH**: Rate limit exceeded, підозрілі дії
- **CRITICAL**: Критичні загрози безпеці

### 4. Production Deployment

#### Налаштування Nginx (reverse proxy):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    location / {
        proxy_pass http://localhost:3001;  # HTTP backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Docker Production:

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001 3443
CMD ["npm", "start"]
```

```yaml
# docker-compose.prod.yml
services:
  tetris-backend:
    build: .
    environment:
      - NODE_ENV=production
      - HTTPS_ENABLED=true
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    ports:
      - "3001:3001"
      - "3443:3443"
```

### 5. Моніторинг та Алерти

#### Логування в Production:

Додайте до `security-logger.ts` інтеграцію з:
- **Sentry** для error tracking
- **LogRocket** для session replay
- **ELK Stack** для централізованого логування
- **PagerDuty** для критичних алертів

#### Метрики для моніторингу:

- Rate limit violations per minute
- Failed login attempts per hour
- Token validation failures
- CORS violations
- SSL certificate expiry dates

### 6. Checklist для Production

- [ ] SSL сертифікати налаштовані
- [ ] HTTPS_ENABLED=true у production .env
- [ ] Rate limits налаштовані для production навантаження
- [ ] Security headers активовані
- [ ] CORS origins вказані точно (без wildcards)
- [ ] JWT secrets змінені на унікальні значення
- [ ] BCRYPT_ROUNDS=12 для production
- [ ] Логування налаштовано в external service
- [ ] Backup стратегія для SSL сертифікатів
- [ ] Monitoring та alerting активовані

## Безпекові Заходи

### Автоматично Реалізовано:

✅ **HttpOnly Secure SameSite cookies** для refresh tokens  
✅ **JWT access tokens** з коротким терміном (15хв)  
✅ **Rate limiting** для всіх endpoints  
✅ **Security headers** (HSTS, CSP, XSS Protection)  
✅ **CORS захист** з whitelist доменів  
✅ **Security event logging**  
✅ **Token validation** з автоматичним refresh  
✅ **Graceful error handling** без розкриття sensitive info  
✅ **IP-based rate limiting** з automatic cleanup  
✅ **Production-ready HTTPS** підтримка  

### Рекомендації:

1. **Регулярно оновлюйте SSL сертифікати**
2. **Моніторьте security logs** на підозрілі активності
3. **Налаштуйте alerting** для критичних security events
4. **Проводьте security audits** коду та залежностей
5. **Використовуйте WAF** (Web Application Firewall) в production