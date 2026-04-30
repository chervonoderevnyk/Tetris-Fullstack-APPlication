import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import https from 'https';
import fs from 'fs';
import { Config } from './config/config';
import { authenticateToken } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { securityHeadersMiddleware } from './middlewares/security.middleware';
import { generalRateLimit } from './middlewares/rate-limit.middleware';
import authRoutes from './routes/auth.routes';
import scoresRoutes from './routes/scores.routes';
import { SecurityController } from './controllers/security.controller';
import { securityLogger } from './utils/security-logger';

// Validate configuration on startup
Config.validate();

const app = express();

// Trust proxy for proper client IP address handling (for rate limiting)
app.set('trust proxy', true);

// CORS Configuration from Config
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without origin (mobile apps, Postman, tests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list
    if (Config.CORS_ORIGINS.some(allowedOrigin => {
      // Support wildcards for subdomains
      if (allowedOrigin.includes('*')) {
        const regex = new RegExp(allowedOrigin.replace(/\*/g, '.*'));
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    })) {
      return callback(null, true);
    } else {
      // Log blocked CORS requests
      const clientIp = 'unknown'; // req not available here
      securityLogger.logCorsBlocked(origin, clientIp);
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: Config.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'], // Allow frontend to see Set-Cookie header
  maxAge: 86400, // 24 hours for preflight caching
}));

// Security headers
app.use(securityHeadersMiddleware);

// Rate limiting (general for all endpoints)
app.use(generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Middleware for parsing cookies

// Routes
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is protected', userId: (req as any).userId });
});

// API routes
app.use('/auth', authRoutes);
app.use('/scores', scoresRoutes);

// Admin routes (require authentication)
app.get('/admin/security/suspicious-users', authenticateToken, SecurityController.getSuspiciousUsers);
app.get('/admin/security/user/:userId/attempts', authenticateToken, SecurityController.getUserSuspiciousAttempts);

// Error handling middleware (must be last)
app.use(errorHandler);

// Function to create HTTPS server
function createHttpsServer() {
  if (!Config.HTTPS_ENABLED) {
    return null;
  }

  if (!Config.HTTPS_KEY_PATH || !Config.HTTPS_CERT_PATH) {
    console.warn('⚠️ HTTPS enabled but SSL key/cert paths not provided');
    return null;
  }

  try {
    if (!fs.existsSync(Config.HTTPS_KEY_PATH) || !fs.existsSync(Config.HTTPS_CERT_PATH)) {
      console.warn('⚠️ SSL certificate files not found, falling back to HTTP');
      return null;
    }

    const httpsOptions = {
      key: fs.readFileSync(Config.HTTPS_KEY_PATH),
      cert: fs.readFileSync(Config.HTTPS_CERT_PATH)
    };

    return https.createServer(httpsOptions, app);
  } catch (error) {
    console.warn('⚠️ Failed to create HTTPS server:', error);
    return null;
  }
}

// Configuration logging
Config.logConfiguration();

// Start servers
const PORT = Config.PORT;
const httpsServer = createHttpsServer();

// HTTP Server
// Test error endpoint (remove in production)
app.get('/test-error', (req: Request, res: Response) => {
  throw new Error('Test 500 error for development');
});

app.listen(PORT, () => {
  console.log(`🚀 HTTP Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${Config.NODE_ENV}`);
  console.log(`🍪 Cookies secure: ${Config.COOKIE_SECURE}`);
  console.log(`🛡️ Rate limiting: ${Config.RATE_LIMIT_MAX_REQUESTS} requests per ${Config.RATE_LIMIT_WINDOW_MS/60000} minutes`);
});

// HTTPS Server (if configured)
if (httpsServer) {
  const HTTPS_PORT = Config.HTTPS_PORT;
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`🔒 HTTPS Server running on https://localhost:${HTTPS_PORT}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
