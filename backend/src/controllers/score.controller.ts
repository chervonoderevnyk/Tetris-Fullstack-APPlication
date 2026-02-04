import { Request, Response, NextFunction } from 'express';
import { ScoreService } from '../services/score.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ScoreController {
  // Збереження результату гри (потребує аутентифікації)
  static async saveScore(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { score, level } = req.body;
      const userId = req.userId!;

      const savedScore = await ScoreService.saveScore(userId, score, level);
      res.status(201).json(savedScore);
    } catch (error) {
      next(error);
    }
  }

  // Отримання лідерборду (публічний доступ)
  static async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await ScoreService.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  }

  // Отримання кращих результатів користувача
  static async getUserBestScores(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const userScores = await ScoreService.getUserBestScores(userId, limit);
      res.json(userScores);
    } catch (error) {
      next(error);
    }
  }

  // Отримання статистики користувача
  static async getUserStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const stats = await ScoreService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // Отримання позиції користувача в рейтингу
  static async getUserRanking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const ranking = await ScoreService.getUserRanking(userId);
      res.json(ranking);
    } catch (error) {
      next(error);
    }
  }
}