import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { ConflictError, AuthenticationError, ValidationError } from '../errors/AppError';
import { Config } from '../config/config';
import { prisma } from '../db';

export class AuthService {
  // Generate access and refresh token pair
  static generateTokens(userId: number) {
    const accessToken = jwt.sign(
      { userId },
      Config.JWT_SECRET,
      { expiresIn: Config.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId, tokenId: crypto.randomUUID() },
      Config.REFRESH_JWT_SECRET,
      { expiresIn: Config.REFRESH_TOKEN_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  static async register(username: string, password: string, avatar: string) {
    if (!username || !password || !avatar) {
      throw new ValidationError('Username, password and avatar are required');
    }

    const existing = await UserRepository.findByUsername(username);
    if (existing) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, Config.BCRYPT_ROUNDS);
    const user = await UserRepository.create({
      username,
      password: hashedPassword,
      avatar
    });

    return { id: user.id, username: user.username, avatar: user.avatar };
  }

  static async login(username: string, password: string) {
    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    const user = await UserRepository.findByUsername(username);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate new tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);
    
    // Save refresh token in database
    await UserRepository.update(user.id, { refreshToken });

    return { 
      tokenA: accessToken, 
      refreshToken,
      user: { id: user.id, username: user.username, avatar: user.avatar }
    };
  }

  // Refresh tokens using refresh token
  static async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, Config.REFRESH_JWT_SECRET);
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const user = await UserRepository.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = this.generateTokens(user.id);
    
    // Update refresh token in database
    await UserRepository.update(user.id, { refreshToken: tokens.refreshToken });

    return {
      tokenA: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user.id, username: user.username, avatar: user.avatar }
    };
  }

  // Revoke refresh token (logout)
  static async revokeRefreshToken(userId: number) {
    await UserRepository.update(userId, { refreshToken: null });
  }

  // Update refresh token for user
  static async updateRefreshToken(userId: number, refreshToken: string) {
    await UserRepository.update(userId, { refreshToken });
  }

  static async getUserById(userId: number) {
    return UserRepository.findById(userId);
  }

  // Delete user account and all associated data with password verification
  static async deleteAccount(userId: number, password: string) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    if (!password) {
      throw new ValidationError('Password is required');
    }

    // First check if user exists
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Invalid password');
    }

    // Delete all user's scores first (since we couldn't add cascade delete)
    await prisma.score.deleteMany({
      where: { userId }
    });

    // Then delete user
    return UserRepository.delete(userId);
  }
}
