import { Injectable } from '@angular/core';
import { Tetromino, GameState } from '../types';

// Re-export for backward compatibility
export type { GameState };

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private savedGameState: GameState | null = null;

  constructor() {}

  saveGameState(gameState: GameState): void {
    this.savedGameState = {
      score: gameState.score,
      level: gameState.level,
      grid: gameState.grid.map(row => [...row]), // Deep copy of grid
      currentTetromino: gameState.currentTetromino ? { ...gameState.currentTetromino } : null,
      nextTetromino: gameState.nextTetromino ? { ...gameState.nextTetromino } : null,
      position: [...gameState.position] as [number, number],
      isGameRunning: gameState.isGameRunning,
      isPaused: gameState.isPaused,
      baseSpeed: gameState.baseSpeed
    };
  }

  getGameState(): GameState | null {
    return this.savedGameState;
  }

  clearGameState(): void {
    this.savedGameState = null;
  }

  hasGameState(): boolean {
    return this.savedGameState !== null;
  }
}