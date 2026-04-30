import { ValidationError } from '../errors/AppError';

export class GameValidationService {
  // Tetris scoring constants based on standard rules
  static readonly LINES_PER_LEVEL = 10;
  static readonly BASE_SCORE_SINGLE = 40;
  static readonly BASE_SCORE_DOUBLE = 100;
  static readonly BASE_SCORE_TRIPLE = 300;
  static readonly BASE_SCORE_TETRIS = 1200;

  // Security limits
  static readonly MAX_REASONABLE_SCORE = 9999999;  // 10 million max
  static readonly MAX_LEVEL = 30;                  // Level 30 is extremely hard
  static readonly MIN_GAME_DURATION_MINUTES = 1;   // Minimum 1 minute game
  static readonly MAX_GAME_DURATION_HOURS = 24;    // Maximum 24 hours

  /**
   * Validates game result for realistic Tetris scoring
   */
  static validateGameResult(score: number, level: number, gameStartTime?: Date): void {
    // Basic numeric validation
    if (!Number.isInteger(score) || !Number.isInteger(level)) {
      throw new ValidationError('Score and level must be integers');
    }

    if (score < 0) {
      throw new ValidationError('Score cannot be negative');
    }

    if (level < 1) {
      throw new ValidationError('Level must be at least 1');
    }

    // Maximum limits
    if (score > this.MAX_REASONABLE_SCORE) {
      throw new ValidationError(`Score cannot exceed ${this.MAX_REASONABLE_SCORE.toLocaleString()}`);
    }

    if (level > this.MAX_LEVEL) {
      throw new ValidationError(`Level cannot exceed ${this.MAX_LEVEL}`);
    }

    // Score-to-level ratio validation
    this.validateScoreLevelRatio(score, level);

    // Game duration validation
    if (gameStartTime) {
      this.validateGameDuration(score, level, gameStartTime);
    }
  }

  /**
   * Validates realistic score-to-level progression
   */
  private static validateScoreLevelRatio(score: number, level: number): void {
    // Calculate theoretical minimum score for reaching this level
    const minScoreForLevel = this.calculateMinScoreForLevel(level);
    
    if (score < minScoreForLevel) {
      throw new ValidationError(
        `Score ${score} is too low for level ${level}. Minimum expected: ${minScoreForLevel}`
      );
    }

    // Calculate theoretical maximum score for this level (very generous)
    const maxScoreForLevel = this.calculateMaxScoreForLevel(level);
    
    if (score > maxScoreForLevel) {
      throw new ValidationError(
        `Score ${score} is unrealistically high for level ${level}. Maximum expected: ${maxScoreForLevel}`
      );
    }
  }

  /**
   * Validates game duration makes sense for the achieved score/level
   */
  private static validateGameDuration(score: number, level: number, gameStartTime: Date): void {
    const gameEndTime = new Date();
    const gameDurationMs = gameEndTime.getTime() - gameStartTime.getTime();
    const gameDurationMinutes = gameDurationMs / (1000 * 60);

    // Minimum duration check
    if (gameDurationMinutes < this.MIN_GAME_DURATION_MINUTES) {
      throw new ValidationError(
        `Game duration ${Math.round(gameDurationMinutes * 10) / 10} minutes is too short. Minimum: ${this.MIN_GAME_DURATION_MINUTES} minute(s)`
      );
    }

    // Maximum duration check
    const maxDurationHours = this.MAX_GAME_DURATION_HOURS;
    if (gameDurationMinutes > maxDurationHours * 60) {
      throw new ValidationError(
        `Game duration ${Math.round(gameDurationMinutes / 60 * 10) / 10} hours is too long. Maximum: ${maxDurationHours} hours`
      );
    }

    // Check if score is achievable in given time
    const minTimeForScore = this.calculateMinTimeForScore(score, level);
    if (gameDurationMinutes < minTimeForScore) {
      throw new ValidationError(
        `Score ${score} at level ${level} cannot be achieved in ${Math.round(gameDurationMinutes * 10) / 10} minutes. Minimum time needed: ${Math.round(minTimeForScore * 10) / 10} minutes`
      );
    }
  }

  /**
   * Estimates minimum score needed to reach a level
   */
  private static calculateMinScoreForLevel(level: number): number {
    if (level === 1) return 0;

    // Conservative estimate: mostly single line clears to reach level
    const linesNeeded = (level - 1) * this.LINES_PER_LEVEL;
    const avgLevelMultiplier = (1 + level) / 2; // Average multiplier from level 1 to current level
    
    return Math.floor(linesNeeded * this.BASE_SCORE_SINGLE * avgLevelMultiplier * 0.7); // 70% efficiency
  }

  /**
   * Estimates maximum realistic score for a level
   */
  private static calculateMaxScoreForLevel(level: number): number {
    // Very generous estimate: assume many Tetrises (4-line clears) and perfect play
    const linesNeeded = level * this.LINES_PER_LEVEL;
    const avgLevelMultiplier = (1 + level) / 2;
    
    // Assume 50% Tetrises, 30% Triples, 20% others - very generous
    const avgScorePerLine = (
      this.BASE_SCORE_TETRIS * 0.5 +
      this.BASE_SCORE_TRIPLE * 0.3 +
      this.BASE_SCORE_DOUBLE * 0.2
    ) / 4; // Divide by 4 because Tetris is 4 lines

    return Math.floor(linesNeeded * avgScorePerLine * avgLevelMultiplier * 2); // 200% bonus for perfect play
  }

  /**
   * Estimates minimum time needed to achieve score
   */
  private static calculateMinTimeForScore(score: number, level: number): number {
    // Assume very fast play: 2 pieces per second at level 1, scaling with level
    const piecesPerSecond = Math.min(2 + (level - 1) * 0.3, 8); // Max 8 pieces/sec at higher levels
    const avgScorePerPiece = score / (level * this.LINES_PER_LEVEL * 2.5); // Rough estimate
    
    const totalPieces = score / Math.max(avgScorePerPiece, 10); // Min 10 points per piece
    const minTimeSeconds = totalPieces / piecesPerSecond;
    
    return Math.max(minTimeSeconds / 60, 0.5); // Minimum 30 seconds
  }

  /**
   * Additional security: Check for suspicious patterns
   */
  static checkSuspiciousPatterns(userId: number, recentScores: Array<{ score: number; level: number; playedAt: Date }>): void {
    if (recentScores.length < 2) return;

    // Check for identical scores (very suspicious)
    const identicalScores = recentScores.filter(s => s.score === recentScores[0].score);
    if (identicalScores.length > 2) {
      throw new ValidationError('Suspicious pattern detected: identical scores');
    }

    // Check for impossible progression (score jumps too much)
    const sortedScores = recentScores.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
    for (let i = 1; i < sortedScores.length; i++) {
      const prevScore = sortedScores[i - 1].score;
      const currScore = sortedScores[i].score;
      
      // Skip if current score is lower (player had bad game)
      if (currScore <= prevScore) continue;
      
      // Check if improvement is too dramatic (more than 10x in one game)
      if (currScore > prevScore * 10 && prevScore > 1000) {
        throw new ValidationError('Suspicious pattern detected: unrealistic score improvement');
      }
    }
  }
}