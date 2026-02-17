import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ValidationRule } from '../types';

// Re-export for backward compatibility
export { ValidationRule };

export function validateRequest(rules: ValidationRule[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: string[] = [];
      
      for (const rule of rules) {
        const value = req.body[rule.field];
        
        // Required field check
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push(`${rule.field} is required`);
          continue;
        }
        
        // Skip further validation if field is optional and empty
        if (!rule.required && (value === undefined || value === null || value === '')) {
          continue;
        }
        
        // Type validation
        if (rule.type) {
          switch (rule.type) {
            case 'string':
              if (typeof value !== 'string') {
                errors.push(`${rule.field} must be a string`);
                continue;
              }
              break;
            case 'number':
              if (typeof value !== 'number' || isNaN(value)) {
                errors.push(`${rule.field} must be a number`);
                continue;
              }
              break;
            case 'boolean':
              if (typeof value !== 'boolean') {
                errors.push(`${rule.field} must be a boolean`);
                continue;
              }
              break;
            case 'email':
              if (typeof value !== 'string' || !/^\S+@\S+\.\S+$/.test(value)) {
                errors.push(`${rule.field} must be a valid email`);
                continue;
              }
              break;
          }
        }
        
        // String length validation
        if (rule.type === 'string' && typeof value === 'string') {
          if (rule.minLength !== undefined && value.length < rule.minLength) {
            errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
          }
          if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            errors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`);
          }
        }
        
        // Number range validation
        if (rule.type === 'number' && typeof value === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`${rule.field} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(`${rule.field} must be no more than ${rule.max}`);
          }
        }
        
        // Pattern validation
        if (rule.pattern && typeof value === 'string') {
          if (!rule.pattern.test(value)) {
            errors.push(`${rule.field} format is invalid`);
          }
        }
      }
      
      if (errors.length > 0) {
        res.status(400).json({ error: `Validation failed: ${errors.join(', ')}` });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  };
}