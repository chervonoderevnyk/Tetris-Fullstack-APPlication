import { ScoreRepository } from '../repositories/score.repository';
import { ValidationError, NotFoundError } from '../errors/AppError';

export class ScoreService {
  // Save new game result
  static async saveScore(userId: number, score: number, level: number) {
    if (!userId || score < 0 || level < 1) {
      throw new ValidationError('Invalid score data provided');
    }

    return ScoreRepository.create({
      userId,
      score,
      level
    });
  }

  // Get top results (leaderboard)
  static async getLeaderboard(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    return ScoreRepository.findTopScores(limit);
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