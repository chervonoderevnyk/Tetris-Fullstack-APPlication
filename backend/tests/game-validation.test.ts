import { describe, test, expect, beforeEach } from '@jest/globals';
import { GameValidationService } from '../src/services/game-validation.service';

describe('GameValidationService', () => {
  describe('validateGameResult', () => {
    test('should accept valid game results', () => {
      expect(() => {
        GameValidationService.validateGameResult(1000, 2);
      }).not.toThrow();
    });

    test('should reject negative scores', () => {
      expect(() => {
        GameValidationService.validateGameResult(-100, 1);
      }).toThrow('Score cannot be negative');
    });

    test('should reject scores that are too high', () => {
      expect(() => {
        GameValidationService.validateGameResult(99999999, 1);
      }).toThrow('Score cannot exceed');
    });

    test('should reject levels that are too high', () => {
      expect(() => {
        GameValidationService.validateGameResult(1000, 50);
      }).toThrow('Level cannot exceed');
    });

    test('should reject unrealistic score-level combinations', () => {
      // Very low score for high level should fail
      expect(() => {
        GameValidationService.validateGameResult(100, 20);
      }).toThrow('Score 100 is too low for level 20');
      
      // Extremely high score for low level should fail
      expect(() => {
        GameValidationService.validateGameResult(5000000, 2);
      }).toThrow('Score 5000000 is unrealistically high for level 2');
    });

    test('should reject games that are too short', () => {
      const fiveSecondsAgo = new Date(Date.now() - 5000);
      
      expect(() => {
        GameValidationService.validateGameResult(10000, 5, fiveSecondsAgo);
      }).toThrow('Game duration');
    });

    test('should reject games that are too long', () => {
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      
      expect(() => {
        GameValidationService.validateGameResult(10000, 5, twentyFiveHoursAgo);
      }).toThrow('Game duration');
    });

    test('should reject games with impossible time-score ratio', () => {
      const thirtySecondsAgo = new Date(Date.now() - 30000);
      
      expect(() => {
        GameValidationService.validateGameResult(100000, 10, thirtySecondsAgo);
      }).toThrow('cannot be achieved in');
    });
  });

  describe('checkSuspiciousPatterns', () => {
    test('should detect identical scores', () => {
      const recentScores = [
        { score: 1000, level: 5, playedAt: new Date() },
        { score: 1000, level: 5, playedAt: new Date() },
        { score: 1000, level: 5, playedAt: new Date() }
      ];

      expect(() => {
        GameValidationService.checkSuspiciousPatterns(1, recentScores);
      }).toThrow('Suspicious pattern detected: identical scores');
    });

    test('should detect impossible score improvements', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const recentScores = [
        { score: 5000, level: 3, playedAt: fiveMinutesAgo },
        { score: 100000, level: 8, playedAt: now } // 20x improvement is suspicious
      ];

      expect(() => {
        GameValidationService.checkSuspiciousPatterns(1, recentScores);
      }).toThrow('Suspicious pattern detected: unrealistic score improvement');
    });

    test('should allow reasonable score progressions', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const recentScores = [
        { score: 5000, level: 3, playedAt: fiveMinutesAgo },
        { score: 8000, level: 4, playedAt: now } // Reasonable improvement
      ];

      expect(() => {
        GameValidationService.checkSuspiciousPatterns(1, recentScores);
      }).not.toThrow();
    });
  });
});