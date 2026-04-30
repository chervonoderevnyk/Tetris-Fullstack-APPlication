import { prisma } from '../db';

export class SuspiciousAttemptRepository {
  static async create(data: {
    userId: number;
    score: number;
    level: number;
    reason: string;
  }) {
    return prisma.suspiciousAttempt.create({ data });
  }

  static async findByUserId(userId: number, withinHours = 24) {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000);
    return prisma.suspiciousAttempt.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async countByUserId(userId: number, withinHours = 24) {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000);
    return prisma.suspiciousAttempt.count({
      where: { userId, createdAt: { gte: since } },
    });
  }

  static async findTopOffenders(withinHours = 168) {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000);

    const groups = await prisma.suspiciousAttempt.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      _max: { createdAt: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return groups.map((g) => ({
      userId: g.userId,
      attemptsCount: g._count.id,
      lastAttempt: g._max.createdAt as Date,
    }));
  }
}
