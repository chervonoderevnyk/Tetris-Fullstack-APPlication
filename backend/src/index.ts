import express from 'express';
import cors from 'cors';
import { AuthController } from './controllers/auth.controller';
import { authenticateToken } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import scoresRoutes from './routes/scores.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is protected', userId: (req as any).userId });
});

// API routes
app.use('/auth', authRoutes);
app.use('/scores', scoresRoutes);

// Error handling middleware (має бути останнім)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
