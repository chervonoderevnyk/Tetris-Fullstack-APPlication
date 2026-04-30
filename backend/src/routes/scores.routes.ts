import { Router } from 'express';
import { ScoreController } from '../controllers/score.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { GameRateLimitMiddleware } from '../middlewares/game-rate-limit.middleware';
import { SecurityLogger } from '../middlewares/security-logger.middleware';

const router = Router();

const saveScoreValidation = validateRequest([
  { field: 'score', required: true, type: 'number', min: 0, max: 9999999 },
  { field: 'level', required: true, type: 'number', min: 1, max: 30 },
  { field: 'gameStartTime', required: false, type: 'string' } // ISO date string
]);

// Public route for leaderboard
router.get('/leaderboard', ScoreController.getLeaderboard);

// Protected routes (authentication required)
router.post('/save', 
  authenticateToken, 
  SecurityLogger.logSuspiciousActivity,  // Log suspicious attempts
  GameRateLimitMiddleware.scoreSubmissionLimit(3, 5), // Max 3 submissions per 5 minutes
  saveScoreValidation, 
  ScoreController.saveScore
);
router.get('/my-scores', authenticateToken, ScoreController.getUserBestScores);
router.get('/my-stats', authenticateToken, ScoreController.getUserStats);
router.get('/my-ranking', authenticateToken, ScoreController.getUserRanking);

export default router;