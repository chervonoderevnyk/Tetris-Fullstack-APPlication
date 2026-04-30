import { Request, Response, NextFunction } from 'express';
import { ScoreService } from '../services/score.service';
import { AuthRequest } from '../types';

export class ScoreController {
  // Save game result (requires authentication)
  static async saveScore(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { score, level, gameStartTime } = req.body;
      const userId = req.userId!;

      // Convert gameStartTime string to Date if provided
      const startTime = gameStartTime ? new Date(gameStartTime) : undefined;

      const savedScore = await ScoreService.saveScore(userId, score, level, startTime);
      res.status(201).json(savedScore);
    } catch (error) {
      next(error);
    }
  }

  // Get leaderboard (public access)
  static async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await ScoreService.getLeaderboard(page, limit);
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  }

  // Get user's best scores
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

  // Get user statistics
  static async getUserStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const stats = await ScoreService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // Get user's ranking position
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