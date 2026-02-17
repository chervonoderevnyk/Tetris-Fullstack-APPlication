# 🎮 Tetris Game - Full Stack Application

> Modern web-based Tetris game with comprehensive user management and leaderboards

[![Angular](https://img.shields.io/badge/Angular-19-red.svg)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** 18+ and npm 9+
- **PostgreSQL** 15+ database
- **Angular CLI** 19+ globally installed

### ⚡ One-Command Setup

```bash
# Clone the repository
git clone https://github.com/your-username/tetris-game.git
cd tetris-game

# Setup backend
cd backend
npm install
cp .env.example .env  # Configure your environment
npx prisma migrate dev
npm run dev &

# Setup frontend (in new terminal)
cd ../frontend
npm install
ng serve
```

Navigate to `http://localhost:4200` to start playing!

## 📊 Project Overview

| Component | Technology | Port | Status |
|-----------|------------|------|---------|
| **Frontend** | Angular 19 + TypeScript | 4200 | ✅ Production Ready |
| **Backend** | Node.js + Express + TypeScript | 3001 | ✅ Production Ready |
| **Database** | PostgreSQL + Prisma ORM | 5432 | ✅ Optimized Schema |

## ✨ Key Features

### 🎮 Game Features
- **Classic Tetris Gameplay** with all standard pieces
- **Progressive Difficulty** with increasing levels
- **Responsive Design** for desktop and mobile
- **Real-time Score Tracking** with persistent storage

### 👤 User Management  
- **Secure Authentication** with JWT + refresh tokens
- **Custom Avatar System** with emoji selection
- **Complete Account Management** including secure deletion
- **Personal Statistics** and gameplay history

### 🏆 Competitive Features
- **Global Leaderboards** with real-time updates
- **Personal Best Tracking** across all games
- **Ranking System** with position tracking
- **Detailed Statistics** for performance analysis

### 🛡️ Advanced Features
- **Professional Error Handling** with modal system
- **Offline Detection** and network status monitoring
- **Toast Notifications** for user feedback
- **Security-First Design** with comprehensive validation
- **Repository Pattern** for clean data access
- **Comprehensive Testing** with full coverage

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend (Angular 19)"
        A[Auth Page] --> B[Game Board]
        B --> C[Leaderboard]
        B --> D[Game Over]
        E[Modal System] --> F[Error Handling]
        E --> G[Toast Notifications]
        H[Services] --> I[HTTP Interceptors]
    end
    
    subgraph "Backend (Node.js + Express)"
        J[Auth Routes] --> K[JWT Middleware]
        L[Score Routes] --> M[Validation Middleware]
        N[Controllers] --> O[Services]
        O --> P[Repositories]
        P --> Q[Prisma Client]
    end
    
    subgraph "Database (PostgreSQL)"
        R[(Users)] --> S[(Scores)]
        T[Migrations] --> U[Indexes]
    end
    
    A -.->|HTTP/HTTPS| J
    C -.->|HTTP/HTTPS| L
    Q --> R
```

## 📁 Project Structure

```
tetris-game/
├── 🎨 frontend/           # Angular 19 application
│   ├── src/app/
│   │   ├── modals/        # Professional modal system
│   │   ├── services/      # Business logic services
│   │   ├── guards/        # Route protection
│   │   └── interceptors/  # HTTP interceptors
│   └── 📖 README.md       # Frontend documentation
├── ⚙️ backend/            # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Request controllers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── middlewares/   # Express middlewares
│   │   └── types/         # TypeScript definitions
│   ├── prisma/            # Database schema & migrations
│   └── 📖 README.md       # Backend documentation
├── 🔐 .env.example        # Environment template
├── 🔒 .gitignore          # Git ignore rules
└── 📋 README.md          # This file
```

## 🔧 Development

### Frontend Development
```bash
cd frontend
ng serve --open    # http://localhost:4200
ng test           # Run unit tests
ng build --prod   # Production build
```

### Backend Development
```bash
cd backend
npm run dev       # Development server with hot reload
npm test         # Run test suite
npm run build    # TypeScript compilation
```

### Database Management
```bash
cd backend
npx prisma studio         # Database GUI
npx prisma migrate dev    # Apply migrations
npx prisma generate       # Regenerate client
```

## 🛡️ Security Features

- ✅ **JWT Authentication** with refresh token rotation
- ✅ **Password Verification** for sensitive operations
- ✅ **Rate Limiting** with sliding window algorithm
- ✅ **Input Validation** and sanitization
- ✅ **Security Headers** with Helmet.js
- ✅ **CORS Configuration** for cross-origin requests
- ✅ **Error Sanitization** preventing information leaks

## 🚀 Deployment

### Production Environment Variables

```bash
# Backend (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/tetris_prod"
JWT_SECRET="your-super-secure-secret"
REFRESH_JWT_SECRET="your-refresh-token-secret"
NODE_ENV="production"

# Frontend (environments/environment.prod.ts)
apiUrl: 'https://yourdomain.com/api'
```

### Docker Deployment
```bash
# Build and run with Docker Compose (coming soon)
docker-compose up --build
```

## 📈 Performance

- **Optimized Bundle Size**: Tree shaking and lazy loading
- **Database Indexes**: Strategic indexing for leaderboard queries
- **Caching Strategy**: Efficient data caching and retrieval
- **Async Operations**: Non-blocking database operations

## 📚 Documentation

- **[Frontend docs](frontend/README.md)** - Angular application details
- **[Backend docs](backend/README.md)** - API server documentation  
- **[Security Guide](SECURITY.md)** - Security best practices
- **[API Reference](backend/README.md#api-documentation)** - Complete API documentation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ihor Chornyi** - *Full Stack Development* - [GitHub Profile](https://github.com/your-username)

## 🙏 Acknowledgments

- Tetris creators for the timeless game concept
- Angular and Node.js communities for excellent tooling
- Open source community for inspiration and support

---

<div align="center">
  
**[🎮 Start Playing](http://localhost:4200)** • **[📖 Documentation](frontend/README.md)** • **[🐛 Report Bug](https://github.com/your-username/tetris-game/issues)** • **[💡 Request Feature](https://github.com/your-username/tetris-game/issues)**

*Built with ❤️ using modern web technologies*

</div>