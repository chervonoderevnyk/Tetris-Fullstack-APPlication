import { ScoreRepository } from '../repositories/score.repository';
import { ValidationError, NotFoundError } from '../errors/AppError';
import { GameValidationService } from './game-validation.service';

export class ScoreService {
  // Save new game result with comprehensive validation
  static async saveScore(userId: number, score: number, level: number, gameStartTime?: Date) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Enhanced game result validation
    GameValidationService.validateGameResult(score, level, gameStartTime);

    // Check recent scores for suspicious patterns
    const recentScores = await ScoreRepository.findUserRecentScores(userId, 10);
    GameValidationService.checkSuspiciousPatterns(userId, recentScores);

    return ScoreRepository.create({
      userId,
      score,
      level
    });
  }

  // Get top results (leaderboard)
  static async getLeaderboard(page: number = 1, limit: number = 10) {
    if (page < 1) {
      throw new ValidationError('Page must be at least 1');
    }
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    const { data, total } = await ScoreRepository.findTopScores(page, limit);
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get user's best results
  static async getUserBestScores(userId: number, limit: number = 5) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }

    return ScoreRepository.findUserBestScores(userId, limit);
  }

  // Get user statistics
  static async getUserStats(userId: number) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    return ScoreRepository.getUserScoreStats(userId);
  }

  // Get user's position in leaderboard
  static async getUserRanking(userId: number) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const ranking = await ScoreRepository.getUserRanking(userId);
    
    if (!ranking) {
      throw new NotFoundError('No scores found for user');
    }

    return ranking;
  }
}