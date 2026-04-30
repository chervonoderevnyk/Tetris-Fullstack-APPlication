import { prisma } from '../db';
import { Score } from '../generated/prisma';

export class ScoreRepository {
  static async create(data: {
    userId: number;
    score: number;
    level: number;
  }): Promise<Score> {
    return prisma.score.create({
      data,
      include: {
        user: {
          select: {
            username: true,
            avatar: true
          }
        }
      }
    });
  }

  static async findTopScores(limit: number = 10) {
    return prisma.score.findMany({
      orderBy: [
        { score: 'desc' },
        { playedAt: 'desc' }
      ],
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            avatar: true
          }
        }
      }
    });
  }

  static async findUserBestScores(userId: number, limit: number = 5) {
    return prisma.score.findMany({
      where: { userId },
      orderBy: [
        { score: 'desc' },
        { playedAt: 'desc' }
      ],
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            avatar: true
          }
        }
      }
    });
  }

  static async findUserRecentScores(userId: number, limit: number = 10) {
    return prisma.score.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: limit,
      select: {
        score: true,
        level: true,
        playedAt: true
      }
    });
  }

  static async getUserScoreStats(userId: number) {
    const [totalGames, bestScore, averageScore, maxLevel] = await Promise.all([
      prisma.score.count({ where: { userId } }),
      prisma.score.findFirst({
        where: { userId },
        orderBy: { score: 'desc' }
      }),
      prisma.score.aggregate({
        where: { userId },
        _avg: {
          score: true,
          level: true
        }
      }),
      prisma.score.findFirst({
        where: { userId },
        orderBy: { level: 'desc' }
      })
    ]);

    return {
      totalGames,
      bestScore: bestScore?.score || 0,
      maxLevel: maxLevel?.level || 1,
      averageScore: Math.round(averageScore._avg.score || 0),
      averageLevel: Math.round(averageScore._avg.level || 1)
    };
  }

  static async getUserRanking(userId: number) {
    const userBestScore = await prisma.score.findFirst({
      where: { userId },
      orderBy: { score: 'desc' }
    });

    if (!userBestScore) {
      return null;
    }

    const betterScoresCount = await prisma.score.count({
      where: {
        score: {
          gt: userBestScore.score
        }
      }
    });

    return {
      position: betterScoresCount + 1,
      score: userBestScore.score,
      level: userBestScore.level
    };
  }
}