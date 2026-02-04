import { prisma } from '../db';
import { User } from '../generated/prisma';

export class UserRepository {
  static async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  static async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  static async create(data: {
    username: string;
    password: string;
    avatar: string;
  }): Promise<User> {
    return prisma.user.create({
      data
    });
  }

  static async update(id: number, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id }
    });
  }
}