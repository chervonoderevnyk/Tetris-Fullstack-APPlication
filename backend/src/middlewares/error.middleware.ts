import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Якщо це наша кастомна помилка
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
    return;
  }

  // Prisma помилки
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    
    // Унікальне обмеження
    if (prismaErr.code === 'P2002') {
      res.status(409).json({ 
        error: 'Resource already exists',
        field: prismaErr.meta?.target 
      });
      return;
    }
    
    // Запис не знайдено
    if (prismaErr.code === 'P2025') {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
  }

  // JWT помилки
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expired' });
    return;
  }

  // Загальні помилки валідації
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  // Непередбачені помилки
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      message: err.message, 
      stack: err.stack 
    })
  });
};