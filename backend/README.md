# 🚀 Tetris Game - Backend API

> High-performance RESTful API for Tetris game built with Node.js, Express, and TypeScript

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.7-2D3748.svg)](https://prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

- **🔐 Secure Authentication** - JWT-based auth with refresh tokens and rotation
- **🏆 Score Management** - Personal and global leaderboards with advanced statistics
- **📊 User Statistics** - Detailed gameplay analytics and ranking system
- **👤 Account Management** - Complete user management with secure account deletion
- **🛡️ Advanced Security** - Rate limiting, CORS, input validation, security headers
- **🗄️ Database ORM** - Type-safe database operations with Prisma and custom client location
- **🔄 Auto-migrations** - Database schema versioning with cascading deletes
- **📝 Comprehensive Logging** - Security event logging with structured logging
- **📁 Repository Pattern** - Clean data access layer with repository abstraction
- **🛠️ Type Safety** - Centralized TypeScript types with organized exports
- **⚡ High Performance** - Optimized queries, indexing, and caching strategies
- **🧪 Full Test Coverage** - Unit, integration, and security tests
- **🚀 Production Ready** - HTTPS support, environment configs, comprehensive error handling

## 🛠 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.1
- **Language:** TypeScript 5.0
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 6.7 (Custom client location)
- **Authentication:** JWT + Refresh tokens
- **Validation:** Custom middleware
- **Security:** bcryptjs, CORS, rate limiting
- **Testing:** Jest + Supertest
- **Development:** ts-node-dev with hot reload

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 15+

### Installation

1. **Clone and navigate:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`.

### Database Setup

```bash
# Create PostgreSQL database
createdb tetris_db

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# (Optional) Open Prisma Studio
npx prisma studio
```

## 📁 Project Structure

```
src/
├── config/
│   └── config.ts           # App configuration
├── controllers/
│   ├── auth.controller.ts  # Authentication logic with account deletion
│   └── score.controller.ts # Score management with advanced statistics
├── errors/
│   └── AppError.ts         # Custom error classes
├── generated/
│   └── prisma/             # Generated Prisma client (custom location)
├── middlewares/
│   ├── auth.middleware.ts  # JWT authentication with refresh token support
│   ├── cookie.middleware.ts # Cookie management for refresh tokens
│   ├── error.middleware.ts # Global error handling with sanitization
│   ├── rate-limit.middleware.ts # Advanced rate limiting
│   ├── security.middleware.ts # Security headers (CORS, Helmet)
│   └── validation.middleware.ts # Comprehensive request validation
├── repositories/
│   ├── score.repository.ts # Score data access with optimized queries
│   └── user.repository.ts  # User data access with cascade operations
├── routes/
│   ├── auth.routes.ts      # Authentication endpoints with account management
│   └── scores.routes.ts    # Score endpoints with leaderboard features
├── services/
│   ├── auth.service.ts     # Authentication business logic with account deletion
│   └── score.service.ts    # Score business logic with ranking calculations
├── types/
│   ├── auth.types.ts       # Authentication and user types
│   ├── middleware.types.ts # Middleware and request types  
│   ├── security.types.ts   # Security and logging types
│   ├── validation.types.ts # Validation and error types
│   └── index.ts           # Centralized type exports
├── utils/
│   └── security-logger.ts  # Security event logging with structured format
├── db.ts                   # Database connection with Prisma client
└── index.ts                # Application entry point with middleware setup
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/refresh` | Refresh access token | 🍪 |
| GET | `/auth/me` | Get current user | ✅ |
| GET | `/auth/status` | Check auth status | 🍪 |
| POST | `/auth/logout` | User logout | 🍪 |
| DELETE | `/auth/delete-account` | Delete user account | ✅ |

### Score Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/scores/save` | Save game score | ✅ |
| GET | `/scores/leaderboard` | Get top 10 players | ❌ |
| GET | `/scores/my-scores` | Get user's best scores | ✅ |
| GET | `/scores/my-stats` | Get user statistics | ✅ |
| GET | `/scores/my-ranking` | Get user ranking | ✅ |

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database

    C->>S: POST /auth/login
    S->>DB: Verify credentials
    DB-->>S: User data
    S-->>C: Access + Refresh tokens
    
    C->>S: API Request + Access Token
    S-->>C: Protected resource
    
    Note over C,S: Access token expires
    C->>S: POST /auth/refresh + Refresh token
    S-->>C: New access token
```

### Request/Response Examples

#### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "player1",
  "password": "securepass123",
  "avatar": "🎮"
}
```

```json
{
  "tokenA": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "player1",
    "avatar": "🎮"
  }
}
```

#### Save Score
```bash
POST /scores/save
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "score": 1500,
  "level": 5
}
```

```json
{
  "id": 42,
  "score": 1500,
  "level": 5,
  "playedAt": "2026-02-16T10:30:00.000Z"
}
```

#### Delete Account
```bash
DELETE /auth/delete-account
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "password": "currentPassword123"
}
```

```json
{
  "message": "Account successfully deleted"
}
```

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  password     String   // bcrypt hashed
  avatar       String   // emoji avatar
  refreshToken String?  // JWT refresh token
  createdAt    DateTime @default(now())
  scores       Score[]  // One-to-many relation
}
```

### Score Model
```prisma
model Score {
  id       Int      @id @default(autoincrement())
  userId   Int
  score    Int      // Game score
  level    Int      // Achieved level
  playedAt DateTime @default(now())
  user     User     @relation(fields: [userId], references: [id])
  
  @@index([userId])  // Performance optimization
  @@index([score])   // Leaderboard queries
}
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name description

# Apply pending migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

## 🔐 Authentication

### JWT Token Strategy

- **Access Tokens** (`tokenA`): Short-lived (15 minutes), in-memory storage
- **Refresh Tokens**: Long-lived (7 days), HTTP-only cookies
- **Security**: bcrypt password hashing, secure cookie settings

### Middleware Flow

```typescript
// Protected route example
app.get('/auth/me', authenticateToken, (req, res) => {
  // req.user populated by middleware
  res.json(req.user);
});
```

### Security Features

- **Rate Limiting**: 100 requests/15 minutes per IP with sliding window
- **CORS Configuration**: Configurable origins with credentials support
- **Security Headers**: Comprehensive Helmet.js integration
- **Input Validation**: Custom validation middleware with sanitization
- **Error Sanitization**: No sensitive data leaks in error responses
- **Account Security**: Secure account deletion with password verification
- **Refresh Token Rotation**: Automatic refresh token rotation for enhanced security
- **Cascade Deletions**: Proper cleanup of user data on account deletion
- **Security Logging**: Detailed logging of security events and suspicious activities
- **Password Hashing**: bcrypt with salt rounds for password security

## 🌍 Environment Variables

### Development (.env)
```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tetris_db"

# JWT
JWT_SECRET=your_secret_key
REFRESH_JWT_SECRET=your_refresh_secret

# CORS
CORS_ORIGIN=http://localhost:4200
CORS_CREDENTIALS=true

# Cookies
COOKIE_MAX_AGE_DAYS=7
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
```

### Production (.env.production.example)
```bash
# Enable HTTPS
HTTPS_ENABLED=true
HTTPS_PORT=3443
HTTPS_KEY_PATH=/path/to/key.pem
HTTPS_CERT_PATH=/path/to/cert.pem

# Secure cookies
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
```

## 💻 Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Production start
npm start

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Database
npx prisma studio       # Database GUI
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate client
```

### Development Workflow

1. **Start services:**
   ```bash
   # PostgreSQL (via Docker)
   docker run --name tetris-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
   
   # Backend development
   npm run dev
   ```

2. **Make changes:**
   - TypeScript auto-compiles
   - Server auto-restarts
   - Database changes via Prisma

3. **Testing:**
   ```bash
   npm run test:watch
   ```

### Code Quality

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript strict mode**: Type safety
- **Jest**: Unit and integration testing

## 🧪 Testing

### Test Categories

- **Unit Tests**: Service and utility functions
- **Integration Tests**: API endpoints with database interactions
- **Security Tests**: Authentication, authorization, and account deletion
- **Database Tests**: Repository layer with cascade operations
- **Authentication Tests**: JWT token handling and refresh token rotation
- **Validation Tests**: Input validation and error handling
- **Performance Tests**: Query optimization and rate limiting

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- auth.test.ts
```

### Test Structure

```typescript
// Example test
describe('AuthService', () => {
  describe('register', () => {
    it('should create user with hashed password', async () => {
      const result = await authService.register({
        username: 'test',
        password: 'password123',
        avatar: '🎮'
      });
      
      expect(result.user.username).toBe('test');
      expect(result.tokenA).toBeDefined();
    });
  });
});
```

## 🚀 Deployment

### Production Build

```bash
# Install dependencies
npm ci --production

# Build application
npm run build

# Run migrations
npx prisma migrate deploy

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup

1. **Database**: PostgreSQL 15+ with connection pooling
2. **SSL/TLS**: HTTPS in production
3. **Process Manager**: PM2 or similar
4. **Logging**: Structured logging with log rotation
5. **Monitoring**: Health checks and metrics

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Logging configured with security events
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Health check endpoints implemented
- [ ] Error monitoring setup
- [ ] Refresh token rotation enabled
- [ ] Account deletion functionality tested
- [ ] Network connectivity monitoring
- [ ] Backup and recovery procedures in place
- [ ] Performance optimization applied
- [ ] Security audit completed

## 🔍 Monitoring & Logging

### Security Logging
All security events are logged in `server.log`:
- Authentication attempts
- Authorization failures
- Rate limit violations
- Suspicious activities

### Performance Monitoring
- Request/response times
- Database query performance
- Memory and CPU usage
- Error rates

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes:**
   - Follow TypeScript best practices
   - Write tests for new features
   - Update documentation

4. **Test changes:**
   ```bash
   npm test
   npm run test:coverage
   ```

5. **Commit and push:**
   ```bash
   git commit -m 'feat: add amazing feature'
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**

### Code Style Guidelines

- Use TypeScript strict mode
- Follow Airbnb style guide
- Write meaningful variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Write tests for all new features
- Use repository pattern for data access
- Implement proper error handling
- Follow security best practices
- Use centralized type definitions
- Implement comprehensive logging
- Add cascade operations for data consistency

### Commit Message Format

```
type(scope): description

feat(auth): add refresh token rotation
fix(scores): handle edge case in ranking calculation
docs(readme): update API documentation
test(auth): add integration tests for login
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 👥 Authors

- **Ihor Chornyi** - *Initial work* - [GitHub](https://github.com/your-username)

## 🙏 Acknowledgments

- Express.js team for the robust web framework
- Prisma team for the excellent ORM
- PostgreSQL community for reliable database
- Open source community for inspiration and tools

---

## 🔗 Related Projects

- [Frontend Application](../frontend/README.md) - Angular 19 frontend
- [Database Schema](./prisma/schema.prisma) - Prisma database models

## 📞 Support

For questions and support:
- Create an issue in the repository
- Check the [API Documentation](#api-documentation)
- Review the [troubleshooting guide](./docs/troubleshooting.md)

For more information, visit the [project repository](https://github.com/your-username/tetris-game).