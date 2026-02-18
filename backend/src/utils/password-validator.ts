/**
 * Utility for password strength validation
 */

import { PasswordValidationResult } from '../types';

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 100;
  
  // List of common weak passwords
  private static readonly COMMON_PASSWORDS = [
    'password', 'password123', '123456', '123456789', 'qwerty',
    'abc123', 'password1', '12345678', '111111', '123123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon',
    'pass', 'mustang', 'master', '666666', 'shadow',
    'qwertyuiop', 'asdfgh', 'zxcvbn', '1234567890'
  ];

  /**
   * Validates password by all criteria
   */
  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Length validation
    if (!password || password.length < this.MIN_LENGTH) {
      errors.push(`Password must contain at least ${this.MIN_LENGTH} characters`);
    } else if (password.length >= this.MIN_LENGTH) {
      score += 20;
    }

    if (password && password.length > this.MAX_LENGTH) {
      errors.push(`Password cannot contain more than ${this.MAX_LENGTH} characters`);
    }

    // If password is empty, return immediately
    if (!password) {
      return {
        isValid: false,
        errors,
        strength: 'weak',
        score: 0
      };
    }

    // Check for uppercase letters (REQUIRED)
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 15;
    }

    // Check for lowercase letters (REQUIRED)
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 15;
    }

    // Check for digits (REQUIRED)
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one digit');
    } else {
      score += 15;
    }

    // Check for special characters (REQUIRED)
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 15;
    }

    // Check for common passwords
    if (this.COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('This password is too common, choose another one');
      score = Math.min(score, 30);
    }

    // Additional complexity bonuses
    if (password.length >= 10) {
      score += 10; // Length bonus
    }
    if (password.length >= 14) {
      score += 5; // Additional bonus
    }

    // Check for repeating patterns and sequential characters
    if (password.length >= 8) {
      if (this.hasRepeatingPatterns(password)) {
        errors.push('Password should not contain repeating sequences');
        score -= 10;
      }

      if (this.hasSequentialChars(password)) {
        errors.push('Password should not contain sequential characters (123, abc)');
        score -= 10;
      }
    }

    // Bonus for character diversity
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) {
      score += 10;
    }

    // Rating normalization
    score = Math.max(0, Math.min(100, score));

    const strength = this.calculateStrength(score, errors.length);

    return {
      isValid: errors.length === 0,
      errors,
      strength,
      score
    };
  }

  /**
   * Checks for repeating patterns (aaa, 111)
   */
  private static hasRepeatingPatterns(password: string): boolean {
    const repeatingPattern = /(.)\1{2,}/;
    return repeatingPattern.test(password);
  }

  /**
   * Checks for sequential characters (123, abc)
   */
  private static hasSequentialChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculates password strength level
   */
  private static calculateStrength(score: number, errorsCount: number): 'weak' | 'medium' | 'strong' {
    if (errorsCount > 0 || score < 40) {
      return 'weak';
    } else if (score < 70) {
      return 'medium';
    } else {
      return 'strong';
    }
  }

  /**
   * Generates password improvement tips
   */
  static generatePasswordTips(): string[] {
    return [
      'Use at least 8 characters',
      'Include at least one uppercase letter (A-Z)',
      'Include at least one lowercase letter (a-z)',
      'Include at least one digit (0-9)',
      'Include at least one special character (!@#$%^&*)',
      'Avoid common passwords like "password" or "123456"',
      'Avoid repeating sequences (aaa, 111)',
      'Avoid sequential characters (123, abc)',
      'Longer passwords are more secure'
    ];
  }

  /**
   * Checks if password is too similar to username
   */
  static isPasswordSimilarToUsername(password: string, username: string): boolean {
    if (!username || !password) return false;
    
    const normalizedPassword = password.toLowerCase();
    const normalizedUsername = username.toLowerCase();
    
    // Checks if password contains username
    return normalizedPassword.includes(normalizedUsername) || 
           normalizedUsername.includes(normalizedPassword);
  }
}