import { Router } from 'express';
import { ScoreController } from '../controllers/score.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();

const saveScoreValidation = validateRequest([
  { field: 'score', required: true, type: 'number', min: 0 },
  { field: 'level', required: true, type: 'number', min: 1 }
]);

// Публічний маршрут для лідерборду
router.get('/leaderboard', ScoreController.getLeaderboard);

// Захищені маршрути (потрібна аутентифікація)
router.post('/save', authenticateToken, saveScoreValidation, ScoreController.saveScore);
router.get('/my-scores', authenticateToken, ScoreController.getUserBestScores);
router.get('/my-stats', authenticateToken, ScoreController.getUserStats);
router.get('/my-ranking', authenticateToken, ScoreController.getUserRanking);

export default router;