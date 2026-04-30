/**
 * Types for game results and leaderboard
 */

/**
 * Game result data
 */
export interface ScoreData {
  score: number;
  level: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  id: number;
  score: number;
  level: number;
  playedAt: Date;
  user: {
    username: string;
    avatar: string;
  };
}

/**
 * User statistics
 */
export interface UserStats {
  totalGames: number;
  bestScore: number;
  maxLevel: number;
  averageScore: number;
  averageLevel: number;
}

/**
 * User position in ranking
 */
export interface UserRanking {
  position: number;
  score: number;
  level: number;
}

/**
 * Paginated leaderboard response
 */
export interface LeaderboardPage {
  data: LeaderboardEntry[];
  total: number;
  page: number;
  totalPages: number;
}