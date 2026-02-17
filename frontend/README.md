# 🎮 Tetris Game - Frontend

> Modern web-based Tetris game built with Angular 19 and TypeScript

[![Angular](https://img.shields.io/badge/Angular-19-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Game Controls](#game-controls)
- [API Integration](#api-integration)
- [Development](#development)
- [Building](#building)
- [Testing](#testing)
- [Contributing](#contributing)

## ✨ Features

- **Classic Tetris Gameplay** - Full-featured Tetris with all standard pieces
- **User Authentication** - Secure login/register with JWT tokens and refresh tokens
- **Score System** - Track personal scores and compete with others
- **Leaderboard** - Global rankings with player statistics
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Updates** - Live score updates and game state management
- **Persisted Game State** - Resume games after interruption
- **Avatar System** - Customizable emoji avatars
- **Multiple Levels** - Increasing difficulty as you progress
- **Account Management** - Full user profile with secure account deletion
- **Advanced Error Handling** - Professional error modals and offline detection
- **Toast Notifications** - Beautiful toast system for user feedback
- **Network Status** - Automatic offline/online detection
- **Security Features** - Comprehensive authentication guards and interceptors

## 🛠 Tech Stack

- **Frontend Framework:** Angular 19 (Standalone Components)
- **Language:** TypeScript 5.0+
- **Styling:** SCSS with responsive design
- **HTTP Client:** Angular HTTP Client with interceptors
- **Authentication:** JWT-based auth with refresh tokens
- **State Management:** Angular Services with RxJS
- **Routing:** Angular Router with guards
- **Build Tool:** Angular CLI & Webpack

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI 19+

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   ng serve
   ```

3. **Open browser:**
   Navigate to `http://localhost:4200`

### Environment Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001' // Backend API URL
};
```

## 📁 Project Structure

```
src/
├── app/
│   ├── auth-page/          # Authentication components
│   ├── base/               # Main game container
│   ├── game-board/         # Core Tetris game logic
│   ├── game-over/          # Game completion screen
│   ├── header/             # App header with navigation
│   ├── footer/             # App footer
│   ├── leaderboard/        # Score rankings
│   ├── modals/             # Modal components (Error, Offline, Delete Account, etc.)
│   │   ├── error-modal/    # Error display modal
│   │   ├── offline-modal/  # Network offline modal
│   │   ├── delete-account-modal/ # Account deletion modal
│   │   ├── farewell-modal/ # Farewell message modal
│   │   └── toast/         # Toast notification component
│   ├── guards/             # Route protection
│   ├── interceptors/       # HTTP interceptors (auth, credentials)
│   ├── services/           # Business logic services
│   │   ├── auth.service.ts    # Authentication & user management
│   │   ├── score.service.ts   # Score management
│   │   ├── error.service.ts   # Error handling
│   │   ├── toast.service.ts   # Toast notifications
│   │   ├── network.service.ts # Network status detection
│   │   └── game-state.service.ts # Game state management
│   ├── types/              # TypeScript type definitions
│   └── app.config.ts       # App configuration
├── assets/                 # Static assets
├── environments/           # Environment configurations
└── styles.scss            # Global styles
```

## 🎮 Game Controls

| Key | Action |
|-----|--------|
| `←` | Move piece left |
| `→` | Move piece right |
| `↓` | Move piece down |
| `Space` | Rotate piece |
| `R` | Restart game |

## 🔌 API Integration

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `DELETE /auth/delete-account` - Delete user account (with password verification)

### Game Endpoints
- `POST /scores/save` - Save game score
- `GET /scores/leaderboard` - Get top players
- `GET /scores/my-stats` - Get user statistics
- `GET /scores/my-scores` - Get user's best scores
- `GET /scores/my-ranking` - Get user's leaderboard ranking

### Advanced Features
- **Error Handling:** Professional modal system for errors and offline states
- **Toast System:** Beautiful notifications for user feedback
- **Network Detection:** Automatic offline/online status monitoring
- **Account Management:** Secure account deletion with password confirmation

### Interceptors
- **Auth Interceptor:** Automatically adds JWT tokens to requests
- **Credentials Interceptor:** Handles cookies for authentication

## 💻 Development

### Development Server
```bash
ng serve
```
Navigate to `http://localhost:4200`. Auto-reloads on file changes.

### Code Generation
```bash
# Generate component
ng generate component component-name

# Generate service
ng generate service service-name

# Generate guard
ng generate guard guard-name
```

### Code Quality
```bash
# Lint code
ng lint

# Format code
npm run format
```

## 🏗 Building

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --configuration production
```

Build artifacts stored in `dist/frontend/`.

### Build Optimization
- Tree shaking for smaller bundles
- Lazy loading for better performance
- AOT compilation for faster rendering

## 🧪 Testing

### Unit Tests
```bash
ng test
```
Uses [Jasmine](https://jasmine.github.io/) and [Karma](https://karma-runner.github.io).

### End-to-End Tests
```bash
ng e2e
```

### Test Coverage
```bash
ng test --code-coverage
```

## 📱 Responsive Design

The game is fully responsive and supports:
- **Desktop:** Full keyboard controls
- **Tablet:** Touch-friendly interface
- **Mobile:** Optimized layout and controls

## 🔧 Configuration

### Game Settings
Configure game parameters in `game-board.component.ts`:
```typescript
private baseSpeed = 1000; // Base drop speed (ms)
private rows = 20;        // Game board height
private cols = 10;        // Game board width
```

### Modal System
The application includes a comprehensive modal system:
- **ErrorModalComponent**: Professional error display with animations
- **OfflineModalComponent**: Network connectivity notifications
- **DeleteAccountModalComponent**: Secure account deletion with password confirmation
- **FarewellModalComponent**: Goodbye message after account deletion
- **ToastComponent**: Non-intrusive notifications

### Services Configuration
- **ErrorService**: Centralized error handling with modal integration
- **NetworkService**: Real-time network status monitoring
- **ToastService**: Toast notification management
- **GameStateService**: Game state persistence and management

### Styling
Customize colors in `game-board.component.scss`:
```scss
.cell.cyan { background-color: #a8d5e2; }
.cell.yellow { background-color: #fff4b2; }
// ... other piece colors
```

## 🚀 Deployment

### Production Deployment
1. **Build for production:**
   ```bash
   ng build --configuration production
   ```

2. **Deploy to web server:**
   Upload `dist/frontend/` contents to your web server.

3. **Configure server:**
   Set up URL rewriting for Angular routing.

### Environment Variables
Configure production environment in `src/environments/environment.prod.ts`.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- Use TypeScript strict mode
- Follow Angular style guide
- Write unit tests for new features
- Use semantic commit messages
- Organize components in feature modules
- Use standalone components architecture
- Implement proper error handling
- Add toast notifications for user feedback
- Ensure offline functionality where possible
- Follow security best practices

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 👥 Authors

- **Ihor Chornyi** - *Initial work* - [GitHub](https://github.com/your-username)

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Tetris creators for the classic game concept
- Open source community for inspiration

---

## 🔗 Related Projects

- [Backend API](../backend/README.md) - Node.js/Express backend
- [Game Rules](./src/assets/docs/rules.md) - Detailed game mechanics

For more information, visit the [project repository](https://github.com/your-username/tetris-game).
