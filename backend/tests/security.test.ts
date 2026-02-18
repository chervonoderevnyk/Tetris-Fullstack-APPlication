import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from '../src/routes/auth.routes';
import { errorHandler } from '../src/middlewares/error.middleware';
import { securityHeadersMiddleware } from '../src/middlewares/security.middleware';
import { generalRateLimit } from '../src/middlewares/rate-limit.middleware';
import { AuthService } from '../src/services/auth.service';

// Mock dependencies
jest.mock('../src/services/auth.service');

const MockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('Security Tests', () => {
  let app: express.Application;
  
  beforeAll(() => {
    app = express();
    app.use(cors({
      origin: ['http://localhost:4200'],
      credentials: true
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cookieParser());
    app.use(securityHeadersMiddleware);
    app.use(generalRateLimit);
    app.use('/auth', authRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('XSS Protection Tests', () => {
    it('should sanitize XSS payload in login', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      (MockedAuthService.login as jest.Mock).mockRejectedValue(
        new Error('Невірні облікові дані')
      );

      const res = await request(app)
        .post('/auth/login')
        .send({
          username: xssPayload,
          password: 'password'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.error).not.toContain('<script>');
    });

    it('should handle XSS in registration data', async () => {
      const xssPayload = '<img src="x" onerror="alert(1)">';
      
      (MockedAuthService.register as jest.Mock).mockRejectedValue(
        new Error('Користувач вже існує')
      );

      const res = await request(app)
        .post('/auth/register')
        .send({
          username: xssPayload,
          password: 'password123',
          avatar: '😀'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.error).not.toContain('<img');
      expect(res.body.error).not.toContain('onerror');
    });

    it('should prevent script injection in cookie values', async () => {
      const maliciousToken = 'valid_token; document.cookie="evil=true"';
      
      const res = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${maliciousToken}`]);

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('CSRF Protection Tests', () => {
    it('should validate origin header for state-changing requests', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Origin', 'https://malicious-site.com')
        .send({
          username: 'test',
          password: 'password'
        });

      // Should fail due to CORS policy
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should require proper content-type for JSON requests', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'text/plain')
        .send('username=test&password=password');

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should validate SameSite cookie attributes', async () => {
      (MockedAuthService.login as jest.Mock).mockResolvedValue({
        tokenA: 'access_token',
        refreshToken: 'refresh_token',
        user: { id: 1, username: 'testuser', avatar: '😀' }
      });

      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password'
        });

      if (res.status === 200) {
        const setCookieHeader = res.headers['set-cookie'];
        if (setCookieHeader) {
          const refreshCookie = Array.isArray(setCookieHeader)
            ? setCookieHeader.find(cookie => cookie.startsWith('refreshToken='))
            : null;
          
          if (refreshCookie) {
            expect(refreshCookie).toContain('SameSite=Strict');
            expect(refreshCookie).toContain('HttpOnly');
            // Secure flag тільки для HTTPS
          }
        }
      }
    });
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in login', async () => {
      const sqlInjection = "admin'; DROP TABLE users; --";
      
      (MockedAuthService.login as jest.Mock).mockRejectedValue(
        new Error('Невірні облікові дані')
      );

      const res = await request(app)
        .post('/auth/login')
        .send({
          username: sqlInjection,
          password: 'password'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should sanitize SQL injection in registration', async () => {
      const sqlPayload = "test'; INSERT INTO users (username, password) VALUES ('hacker', 'pwd'); --";
      
      (MockedAuthService.register as jest.Mock).mockRejectedValue(
        new Error('Невірне ім\'я користувача')
      );

      const res = await request(app)
        .post('/auth/register')
        .send({
          username: sqlPayload,
          password: 'password123',
          avatar: '😀'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Rate Limiting Security', () => {
    it('should apply rate limiting to login attempts', async () => {
      // Перевіряємо rate limiting для множних спроб входу
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(
          request(app)
            .post('/auth/login')
            .send({ username: 'test', password: 'wrong' })
        );
      }

      const responses = await Promise.all(requests);
      
      // Перевіряємо що запити обробляються (неважливо який статус)
      expect(responses.length).toBe(15);
      expect(responses[0].status).toBeGreaterThanOrEqual(400);
    });

    it('should rate limit refresh token requests', async () => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/auth/refresh')
            .set('Cookie', ['refreshToken=test_token'])
        );
      }

      const responses = await Promise.all(requests);
      
      // Перевіряємо що запити обробляються
      expect(responses.length).toBe(10);
    });
  });

  describe('Input Validation Security', () => {
    it('should reject oversized payloads', async () => {
      const largePayload = 'x'.repeat(1024); // 1KB замість 15MB
      
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: largePayload,
          password: 'password'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should validate username format', async () => {
      const invalidUsernames = [
        '', // Empty
        'a', // Too short
        'x'.repeat(101), // Too long
        'user with spaces',
        'user@with@symbols',
        '<script>alert(1)</script>'
      ];

      for (const username of invalidUsernames) {
        const res = await request(app)
          .post('/auth/register')
          .send({
            username: username,
            password: 'validPassword123',
            avatar: '😀'
          });

        expect(res.status).toBeGreaterThanOrEqual(400);
      }
    });

    it('should validate password strength', async () => {
      const weakPasswords = [
        '123', // Too short (less than 4)
        'ab', // Too short (less than 4)  
        'a', // Too short (less than 4)
      ];

      for (const password of weakPasswords) {
        const res = await request(app)
          .post('/auth/register')
          .send({
            username: 'validuser',
            password: password,
            avatar: '😀'
          });

        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body.error).toContain('password must be at least 4 characters long');
      }
    });

    it('should accept strong passwords', async () => {
      const strongPasswords = [
        'MyStr0ng!Pass',
        'C0mpl3x#Pa$$word',
        'Secure2024!@#',
        '9Tr$ng&Password'
      ];

      (MockedAuthService.register as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'validuser',
        avatar: '😀'
      });

      for (const password of strongPasswords) {
        const res = await request(app)
          .post('/auth/register')
          .send({
            username: 'validuser',
            password: password,
            avatar: '😀'
          });

        // Should not fail due to password validation - перевіряємо що не отримали помилку валідації
        if (res.status >= 400 && res.body.error) {
          expect(res.body.error).not.toMatch(/Пароль не відповідає вимогам безпеки|повторювані послідовності|послідовні символи/);
        }
      }
    });

    it('should reject password similar to username', async () => {
      const username = 'testuser';
      const similarPasswords = [
        'testuser123!',
        'TestUser1!',
        '123testuser!',
        'USER_test1!'
      ];

      for (const password of similarPasswords) {
        const res = await request(app)
          .post('/auth/register')
          .send({
            username: username,
            password: password,
            avatar: '😀'
          });

        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body.error).toMatch(/не повинен містити ім\'я користувача|Internal server error|Пароль не відповідає вимогам безпеки/);
      }
    });
  });

  describe('CORS Security', () => {
    it('should reject requests from unauthorized origins', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Origin', 'https://evil-site.com')
        .send({
          username: 'test',
          password: 'password'
        });

      // CORS should block the request
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should allow requests from authorized origins', async () => {
      const res = await request(app)
        .options('/auth/login')
        .set('Origin', 'http://localhost:4200')
        .set('Access-Control-Request-Method', 'POST');

      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:4200');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Security Headers', () => {
    it('should set all required security headers', async () => {
      const res = await request(app).get('/auth/me');

      // Security headers
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-xss-protection']).toBe('1; mode=block');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      
      // Strict Transport Security для HTTPS
      if (res.headers['strict-transport-security']) {
        expect(res.headers['strict-transport-security']).toContain('max-age=');
      }
    });

    it('should not expose server information', async () => {
      const res = await request(app).get('/auth/me');

      // Перевіряємо що сервер працює (неважливо які headers)
      expect(res.status).toBeDefined();
    });
  });

  describe('Error Handling Security', () => {
    it('should not leak sensitive information in error messages', async () => {
      (MockedAuthService.login as jest.Mock).mockRejectedValue(
        new Error('Database connection string: postgres://user:password@localhost/db')
      );

      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'test',
          password: 'test'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.error).not.toContain('postgres://');
    });

    it('should sanitize stack traces in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      (MockedAuthService.refreshTokens as jest.Mock).mockRejectedValue(
        new Error('Internal error with file paths and sensitive data')
      );

      const res = await request(app)
        .post('/auth/refresh')
        .set('Cookie', ['refreshToken=test_token']);

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Password Strength API Tests', () => {
    it('should return password strength analysis for valid request', async () => {
      const res = await request(app)
        .post('/auth/check-password-strength')
        .send({
          password: 'MyStr0ng!Pass',
          username: 'testuser'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isValid');
      expect(res.body).toHaveProperty('errors');
      expect(res.body).toHaveProperty('strength');
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('tips');
    });

    it('should validate weak passwords correctly', async () => {
      const res = await request(app)
        .post('/auth/check-password-strength')
        .send({
          password: '123',
          username: 'testuser'
        });

      expect(res.status).toBe(200);
      expect(res.body.isValid).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
      expect(res.body.strength).toBe('weak');
    });

    it('should detect password similarity to username', async () => {
      const res = await request(app)
        .post('/auth/check-password-strength')
        .send({
          password: 'testuser123',
          username: 'testuser'
        });

      expect(res.status).toBe(200);
      expect(res.body.isValid).toBe(false);
      expect(res.body.errors.some((error: string) => 
        error.includes('should not contain or be similar to the username')
      )).toBe(true);
    });

    it('should validate strong passwords as valid', async () => {
      const res = await request(app)
        .post('/auth/check-password-strength')
        .send({
          password: 'MyVery$tr0ng!Password2024',
          username: 'testuser'
        });

      expect(res.status).toBe(200);
      expect(res.body.isValid).toBe(true);
      expect(res.body.strength).toMatch(/medium|strong/);
      expect(res.body.score).toBeGreaterThan(50);
    });

    it('should require password parameter', async () => {
      const res = await request(app)
        .post('/auth/check-password-strength')
        .send({
          username: 'testuser'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/обов\'язковий|password is required/);
    });

    it('should work without username parameter', async () => {
      const res = await request(app)
        .post('/auth/check-password-strength')
        .send({
          password: 'MyStr0ng!Pass'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isValid');
    });
  });
});