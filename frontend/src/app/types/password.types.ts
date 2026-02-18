/**
 * Password strength check result
 */
export interface PasswordStrengthResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  tips: string[];
}

/**
 * Password requirement with execution information
 */
export interface PasswordRequirement {
  met: boolean;
  text: string;
  type: 'length' | 'uppercase' | 'lowercase' | 'digit' | 'special' | 'common' | 'username';
}