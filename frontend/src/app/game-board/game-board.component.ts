import { Component, OnInit, HostListener, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tetromino } from '../types';
import { TETROMINOES } from './tetris/tetromino';
import { Router, RouterModule } from '@angular/router';
import { GameStateService } from '../services/game-state.service';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit {

  @Output() scoreChange = new EventEmitter<number>();
  @Output() levelChange = new EventEmitter<number>();

  rows = 20;
  cols = 10;
  grid: string[][] = [];
  currentTetromino!: Tetromino;
  nextTetromino!: Tetromino; // Variable for next piece
  position: [number, number] = [0, 4];
  intervalId: any;
  score: number = 0; // Variable for score counting
  level: number = 1; // Variable for level
  baseSpeed: number = 900; // Base speed (ms)
  isGameRunning: boolean = false; // Game state
  isPaused: boolean = false; // Pause state


  constructor(private router: Router, private gameStateService: GameStateService) {}

  ngOnInit(): void {
    // Check if there's saved game state
    if (this.gameStateService.hasGameState()) {
      this.restoreGameState();
    } else {
      this.resetGrid();
      this.nextTetromino = this.getRandomTetromino(); // Initialize next piece
    }
  }


  startGame(): void {
    if (this.isGameRunning) return; // If game is already running, do nothing
  
    // Clear saved state when starting new game
    this.gameStateService.clearGameState();
    
    this.isGameRunning = true;
    this.isPaused = false; // Remove pause
    this.score = 0; // Reset score
    this.level = 1; // Reset level
    this.resetGrid(); // Reset grid
    this.spawnTetromino(); // Spawn new piece
    this.startGameLoop(); // Start game loop
  }

  togglePause(): void {
    if (!this.isGameRunning) return; // If game is not running, do nothing

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      clearInterval(this.intervalId); // Stop timer
    } else {
      this.updateGameSpeed(); // Restore timer
    }
  }

  resetGrid(): void {
    this.grid = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill('')
    );
  }

  saveGameState(): void {
    this.clearTetromino(); // Clear current piece before saving
    this.gameStateService.saveGameState({
      score: this.score,
      level: this.level,
      grid: this.grid,
      currentTetromino: this.currentTetromino,
      nextTetromino: this.nextTetromino,
      position: this.position,
      isGameRunning: this.isGameRunning,
      isPaused: true, // Always set to pause on save
      baseSpeed: this.baseSpeed
    });
  }

  restoreGameState(): void {
    const gameState = this.gameStateService.getGameState();
    if (!gameState) return;

    this.score = gameState.score;
    this.level = gameState.level;
    this.grid = gameState.grid;
    this.currentTetromino = gameState.currentTetromino!;
    this.nextTetromino = gameState.nextTetromino!;
    this.position = gameState.position;
    this.isGameRunning = gameState.isGameRunning;
    this.isPaused = gameState.isPaused;
    this.baseSpeed = gameState.baseSpeed;

    // Emit changes for parent component
    this.scoreChange.emit(this.score);
    this.levelChange.emit(this.level);

    // Draw restored piece
    if (this.currentTetromino) {
      this.drawTetromino();
    }

    // Clear saved state after restoration
    this.gameStateService.clearGameState();
  }

 getRandomTetromino(): Tetromino {
    const index = Math.floor(Math.random() * TETROMINOES.length);
    return TETROMINOES[index];
  }

  spawnTetromino(): void {
    this.currentTetromino = this.nextTetromino; // Current piece becomes next
    this.position = [0, 4]; // Initial piece position
    this.nextTetromino = this.getRandomTetromino(); // Generate new next piece
  
    // Check if new piece can be placed
    const canPlace = this.currentTetromino.shape.every(([dy, dx]) => {
      const y = this.position[0] + dy;
      const x = this.position[1] + dx;
  
      if (y < 0) return true; // Allow if part of piece extends above top border
      return (
        y >= 0 &&
        y < this.rows &&
        x >= 0 &&
        x < this.cols &&
        this.grid[y][x] === '' // Check if cell is empty
      );
    });
  
      // If piece can't be placed, end game
    if (!canPlace) {
      clearInterval(this.intervalId); // Stop game loop
      this.isGameRunning = false; // Set game state as ended
      this.gameStateService.clearGameState(); // Clear saved state on game end
      this.router.navigate(['/game-over'], {
        queryParams: { score: this.score, level: this.level } // Pass score and level
      });
      return;
    }
  
    this.drawTetromino(); // Draw piece on board
  }

  getNextTetrominoCell(row: number, col: number): string {
    if (!this.nextTetromino) return '';
    return this.nextTetromino.shape.some(([dy, dx]) => dy + 1 === row && dx + 1 === col)
      ? this.nextTetromino.color // Use piece color
      : '';
  }

  drawTetromino(): void {
    this.currentTetromino.shape.forEach(([dy, dx]) => {
      const y = this.position[0] + dy;
      const x = this.position[1] + dx;
      if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
        this.grid[y][x] = this.currentTetromino.color;
      }
    });
  }

  clearTetromino(): void {
    this.currentTetromino.shape.forEach(([dy, dx]) => {
      const y = this.position[0] + dy;
      const x = this.position[1] + dx;
      if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
        this.grid[y][x] = '';
      }
    });
  }

  canMoveTo(offsetY: number, offsetX: number): boolean {
    return this.currentTetromino.shape.every(([dy, dx]) => {
      const y = this.position[0] + dy + offsetY;
      const x = this.position[1] + dx + offsetX;
  
      // allow if part of piece extends above top border
      if (y < 0) return true;
  
      return (
        y >= 0 &&
        y < this.rows &&
        x >= 0 &&
        x < this.cols &&
        this.grid[y][x] === '' // important! check that cell is empty
      );
    });
  }

  moveDown(): void {
    this.clearTetromino(); // important!
  
    if (this.canMoveTo(1, 0)) {
      this.position[0]++;
      this.drawTetromino();
    } else {
      this.drawTetromino(); // put back in place
      this.fixTetromino();
      this.spawnTetromino();
    }
  }
  
  startGameLoop(): void {
    this.updateGameSpeed(); // Update game speed based on level
  }

  updateGameSpeed(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Stop previous timer
    }

    if (!this.isPaused) {
      const speed = Math.max(this.baseSpeed - (this.level - 1) * 100, 100); // Decrease speed with each level
      this.intervalId = setInterval(() => {
        this.moveDown();
      }, speed);
    }
  }

  updateScore(rowsCleared: number): void {
    let points = 0;
  
    switch (rowsCleared) {
      case 1:
        points = 10;
        break;
      case 2:
        points = 30;
        break;
      case 3:
        points = 40;
        break;
      case 4:
        points = 60;
        break;
      default:
        points = 0;
    }
  
    this.score += points;
  
    const newLevel = Math.floor(this.score / 30) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.updateGameSpeed();
    }
    
    this.scoreChange.emit(this.score);
    this.levelChange.emit(this.level);
  }

  @HostListener('window:keydown', ['$event'])
handleKey(event: KeyboardEvent): void {
  let offsetY = 0;
  let offsetX = 0;

  if (event.key === 'ArrowLeft') {
    offsetX = -1;
  } else if (event.key === 'ArrowRight') {
    offsetX = 1;
  } else if (event.key === 'ArrowDown') {
    offsetY = 1;
  } else if (event.key === ' ') {
    // Check if game is running and not paused before rotating piece
    if (this.isGameRunning && !this.isPaused) {
      this.rotateTetromino();
    }
    event.preventDefault(); // Prevent any other actions for space key
    return;
  } else {
    return; // Ignore other keys
  }

  // If game is paused, ignore other actions
  if (this.isPaused) {
    return;
  }

  this.clearTetromino();

  if (this.canMoveTo(offsetY, offsetX)) {
    this.position = [this.position[0] + offsetY, this.position[1] + offsetX];
  }

  this.drawTetromino();
}
  
  rotateTetromino(): void {
    if (!this.currentTetromino.isRotatable) {
      return; // If piece doesn't rotate, just exit
    }
  
    this.clearTetromino(); // Clear current piece from grid
  
    // Save old shape for rollback if rotation is impossible
    const oldShape = [...this.currentTetromino.shape];
  
    // Calculate new shape (clockwise rotation)
    const newShape: [number, number][] = this.currentTetromino.shape.map(([dy, dx]) => [-dx, dy]);
  
    // Check if rotation is possible
    const canRotate = newShape.every(([dy, dx]) => {
      const y = this.position[0] + dy;
      const x = this.position[1] + dx;
  
      return (
        y >= 0 &&
        y < this.rows &&
        x >= 0 &&
        x < this.cols &&
        this.grid[y][x] === '' // Check if cell is empty
      );
    });
  
    if (canRotate) {
      this.currentTetromino.shape = newShape; // Apply new shape
    } else {
      this.currentTetromino.shape = oldShape; // Rollback to old shape
    }
  
    this.drawTetromino(); // Draw piece with new (or old) shape
  }
  
  fixTetromino(): void {
    this.currentTetromino.shape.forEach(([dy, dx]) => {
      const y = this.position[0] + dy;
      const x = this.position[1] + dx;
      if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
        this.grid[y][x] = this.currentTetromino.color;
      }
    });

    const rowsCleared = this.clearFullRows(); // Check and clear filled rows
    this.updateScore(rowsCleared); // Update score
  }

  clearFullRows(): number {
    const rowsToClear: number[] = [];

    // Find filled rows
    this.grid.forEach((row, rowIndex) => {
      if (row.every(cell => cell !== '')) {
        rowsToClear.push(rowIndex);
      }
    });

    if (rowsToClear.length > 0) {
      // Remove filled rows
      const newGrid = this.grid.filter((_, rowIndex) => !rowsToClear.includes(rowIndex));

      // Add empty rows at the top
      while (newGrid.length < this.rows) {
        newGrid.unshift(Array(this.cols).fill(''));
      }

      this.grid = newGrid; // Update grid
    }

    return rowsToClear.length; // Return number of cleared rows
  }

  // Method to save state before navigation
  prepareForNavigation(): void {
    if (this.isGameRunning && !this.isPaused) {
      this.togglePause(); // Pause the game
    }
    if (this.isGameRunning) {
      this.saveGameState(); // Save game state
    }
  }
}

