/**
 * Types for Tetris game
 */

export type Point = [number, number]; // [row, column]

/**
 * Interface for tetromino (game pieces)
 */
export interface Tetromino {
  shape: Point[]; // Coordinates relative to center
  color: string;
  isRotatable?: boolean; // Flag for rotation
}

/**
 * Game state
 */
export interface GameState {
  score: number;
  level: number;
  grid: string[][];
  currentTetromino: Tetromino | null;
  nextTetromino: Tetromino | null;
  position: [number, number];
  isGameRunning: boolean;
  isPaused: boolean;
  baseSpeed: number;
}