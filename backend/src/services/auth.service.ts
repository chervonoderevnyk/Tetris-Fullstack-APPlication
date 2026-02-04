import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { ConflictError, AuthenticationError, ValidationError } from '../errors/AppError';

const SECRET = process.env.JWT_SECRET || 'tetris_secret';

export class AuthService {
  static async register(username: string, password: string, avatar: string) {
    if (!username || !password || !avatar) {
      throw new ValidationError('Username, password and avatar are required');
    }

    const existing = await UserRepository.findByUsername(username);
    if (existing) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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

    const tokenA = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' });
    return { tokenA };
  }

  static async getUserById(userId: number) {
    return UserRepository.findById(userId);
  }
}
