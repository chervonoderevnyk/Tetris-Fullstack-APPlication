import { Config } from '../src/config/config';

// Налаштування для тестового середовища
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/tetris_test_db';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.REFRESH_JWT_SECRET = 'test_refresh_jwt_secret';
process.env.BCRYPT_ROUNDS = '1'; // Швидше для тестів

// Глобальні налаштування для тестів
beforeAll(async () => {
  // Ініціалізація тестової бази даних
});

afterEach(() => {
  // Очищення після кожного тесту
  jest.clearAllMocks();
});

afterAll(async () => {
  // Cleanup після всіх тестів
});

// Mock console для тестів
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};