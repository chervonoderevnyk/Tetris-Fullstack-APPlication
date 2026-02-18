import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime } from 'rxjs/operators';
import { PasswordStrengthResult, PasswordRequirement } from '../types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordValidationService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Checks password strength via API
   */
  checkPasswordStrength(password: string, username?: string): Observable<PasswordStrengthResult> {
    if (!password) {
      return of({
        isValid: false,
        errors: ['Password is required'],
        strength: 'weak' as const,
        score: 0,
        tips: []
      });
    }

    const payload: any = { password };
    if (username) {
      payload.username = username;
    }

    return this.http.post<PasswordStrengthResult>(`${this.apiUrl}/check-password-strength`, payload)
      .pipe(
        catchError(error => {
          console.error('Password strength check error:', error);
          return of({
            isValid: false,
            errors: ['Error checking password strength'],
            strength: 'weak' as const,
            score: 0,
            tips: []
          });
        })
      );
  }

  /**
   * Local validation of basic requirements for quick UI feedback
   */
  validatePasswordRequirementsLocal(password: string, username?: string): PasswordRequirement[] {
    const requirements: PasswordRequirement[] = [
      {
        met: password.length >= 8,
        text: 'At least 8 characters',
        type: 'length'
      },
      {
        met: /[A-Z]/.test(password),
        text: 'At least one uppercase letter',
        type: 'uppercase'
      },
      {
        met: /[a-z]/.test(password),
        text: 'At least one lowercase letter',
        type: 'lowercase'
      },
      {
        met: /\d/.test(password),
        text: 'At least one digit',
        type: 'digit'
      },
      {
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
        text: 'At least one special character',
        type: 'special'
      }
    ];

    // Check for similarity with username
    if (username) {
      const isSimilar = password.toLowerCase().includes(username.toLowerCase()) ||
                       username.toLowerCase().includes(password.toLowerCase());
      requirements.push({
        met: !isSimilar,
        text: 'Not similar to username',
        type: 'username'
      });
    }

    // Check for common passwords
    const commonPasswords = [
      'password', 'password123', '123456', '123456789', 'qwerty',
      'abc123', 'password1', '12345678'
    ];
    const isCommon = commonPasswords.includes(password.toLowerCase());
    requirements.push({
      met: !isCommon,
      text: 'Not a common password',
      type: 'common'
    });

    return requirements;
  }

  /**
   * Receives the color of the strength indicator
   */
  getStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'strong': return '#00dd00';
      default: return '#cccccc';
    }
  }

  /**
   * Gets the text for the strength indicator
   */
  getStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return 'Unknown';
    }
  }

  /**
   * Calculates the percentage of the strength indicator
   */
  getStrengthPercentage(score: number): number {
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generates a random strong password
   */
  generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    const allChars = uppercase + lowercase + digits + special;
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Add the remaining characters randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the characters
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}