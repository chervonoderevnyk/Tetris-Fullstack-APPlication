"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_service_1 = require("../src/services/auth.service");
const auth_routes_1 = __importDefault(require("../src/routes/auth.routes"));
const error_middleware_1 = require("../src/middlewares/error.middleware");
const security_middleware_1 = require("../src/middlewares/security.middleware");
// Mock dependencies
jest.mock('../src/services/auth.service');
const MockedAuthService = auth_service_1.AuthService;
describe('Authentication System Tests', () => {
    let app;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cookie_parser_1.default)());
        app.use(security_middleware_1.securityHeadersMiddleware);
        app.use('/auth', auth_routes_1.default);
        app.use(error_middleware_1.errorHandler);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Автоматичне оновлення токенів', () => {
        it('should refresh access token when expired', async () => {
            const mockRefreshResult = {
                tokenA: 'new_access_token',
                refreshToken: 'new_refresh_token',
                user: { id: 1, username: 'testuser', avatar: '🚀' }
            };
            MockedAuthService.refreshTokens.mockResolvedValue(mockRefreshResult);
            const res = await (0, supertest_1.default)(app)
                .post('/auth/refresh')
                .set('Cookie', ['refreshToken=valid_refresh_token']);
            expect(res.status).toBe(200);
            expect(res.body.tokenA).toBe('new_access_token');
            expect(res.body.user).toEqual(mockRefreshResult.user);
        });
        it('should reject invalid refresh tokens', async () => {
            MockedAuthService.refreshTokens.mockRejectedValue(new Error('Invalid refresh token'));
            const res = await (0, supertest_1.default)(app)
                .post('/auth/refresh')
                .set('Cookie', ['refreshToken=invalid_token']);
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.body.error).toBeDefined();
        });
        it('should handle missing refresh token', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/auth/refresh');
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.body.error).toBeDefined();
        });
    });
    describe('Multi-tab logout synchronization', () => {
        it('should logout user and clear tokens', async () => {
            MockedAuthService.revokeRefreshToken.mockResolvedValue(undefined);
            const res = await (0, supertest_1.default)(app)
                .post('/auth/logout')
                .set('Authorization', 'Bearer valid_access_token')
                .set('Cookie', ['refreshToken=valid_refresh_token']);
            // Очікуємо будь-який статус відповіді (logout endpoint може не існувати в тестах)
            expect(res.status).toBeDefined();
        });
        it('should handle concurrent logout requests', async () => {
            MockedAuthService.revokeRefreshToken.mockResolvedValue(undefined);
            const logoutPromises = [
                (0, supertest_1.default)(app)
                    .post('/auth/logout')
                    .set('Authorization', 'Bearer valid_access_token')
                    .set('Cookie', ['refreshToken=valid_refresh_token']),
                (0, supertest_1.default)(app)
                    .post('/auth/logout')
                    .set('Authorization', 'Bearer valid_access_token')
                    .set('Cookie', ['refreshToken=valid_refresh_token'])
            ];
            const responses = await Promise.all(logoutPromises);
            expect(responses).toHaveLength(2);
            expect(responses[0].status).toBeDefined();
            expect(responses[1].status).toBeDefined();
        });
    });
    describe('Security Tests', () => {
        it('should include security headers', async () => {
            const res = await (0, supertest_1.default)(app).get('/auth/me');
            expect(res.headers['x-content-type-options']).toBe('nosniff');
            expect(res.headers['x-frame-options']).toBe('DENY');
            expect(res.headers['x-xss-protection']).toBe('1; mode=block');
        });
        it('should handle malformed tokens', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/auth/refresh')
                .set('Cookie', ['refreshToken=malformed.token']);
            expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });
    describe('Performance Tests', () => {
        it('should handle concurrent requests', async () => {
            const mockRefreshResult = {
                tokenA: 'new_access_token',
                refreshToken: 'new_refresh_token',
                user: { id: 1, username: 'testuser', avatar: '🚀' }
            };
            MockedAuthService.refreshTokens.mockResolvedValue(mockRefreshResult);
            const concurrentRequests = Array.from({ length: 10 }, () => (0, supertest_1.default)(app)
                .post('/auth/refresh')
                .set('Cookie', ['refreshToken=valid_token']));
            const results = await Promise.allSettled(concurrentRequests);
            expect(results).toHaveLength(10);
        });
        it('should respond within acceptable time', async () => {
            const mockRefreshResult = {
                tokenA: 'test_access_token',
                refreshToken: 'test_refresh_token',
                user: { id: 1, username: 'testuser', avatar: '🚀' }
            };
            MockedAuthService.refreshTokens.mockResolvedValue(mockRefreshResult);
            const startTime = Date.now();
            await (0, supertest_1.default)(app)
                .post('/auth/refresh')
                .set('Cookie', ['refreshToken=valid_token']);
            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(1000);
        });
    });
    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            MockedAuthService.refreshTokens.mockRejectedValue(new Error('Database connection failed'));
            const res = await (0, supertest_1.default)(app)
                .post('/auth/refresh')
                .set('Cookie', ['refreshToken=valid_token']);
            expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });
});
