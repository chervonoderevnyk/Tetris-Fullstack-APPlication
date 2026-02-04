import { ScoreRepository } from '../repositories/score.repository';
import { ValidationError, NotFoundError } from '../errors/AppError';

export class ScoreService {
  // Збереження нового результату гри
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

  // Отримання топ результатів (лідерборд)
  static async getLeaderboard(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    return ScoreRepository.findTopScores(limit);
  }

  // Отримання кращих результатів користувача
  static async getUserBestScores(userId: number, limit: number = 5) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }

    return ScoreRepository.findUserBestScores(userId, limit);
  }

  // Отримання статистики користувача
  static async getUserStats(userId: number) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    return ScoreRepository.getUserScoreStats(userId);
  }

  // Отримання позиції користувача в лідерборді
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