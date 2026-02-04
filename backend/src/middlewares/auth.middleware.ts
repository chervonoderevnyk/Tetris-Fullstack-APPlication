import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../errors/AppError';

const SECRET = process.env.JWT_SECRET || 'tetris_secret';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);
  
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      throw new AuthenticationError('No token provided');
    }
  
    jwt.verify(token, SECRET, (err, payload: any) => {
      if (err) {
        console.log('Token error:', err.message);
        next(new AuthorizationError('Invalid or expired token'));
        return;
      }
  
      req.userId = payload.userId;
      next();
    });
  } catch (error) {
    next(error);
  }
}