import { Request } from 'express';

/**
 * Розширений Request об'єкт з додатковою інформацією про користувача
 */
export interface AuthRequest extends Request {
  userId?: number;
}