import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { GameBoardComponent } from "../game-board/game-board.component";
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [CommonModule, GameBoardComponent, HeaderComponent, FooterComponent],
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})


export class BaseComponent implements OnInit {
  @ViewChild(GameBoardComponent) gameBoard!: GameBoardComponent;
  
  score: number = 0;
  level: number = 1;
  userAvatar: string = '🙂';
  userName: string = 'Player';

  constructor(
    private cdr: ChangeDetectorRef, 
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      const token = this.authService.getToken();
      if (!token) {
        this.router.navigate(['/']); // Return to login page if token is absent
      } else {
        this.authService.getUserDetails().subscribe({
          next: (user) => {
            this.userAvatar = user?.avatar || '🙂'; // Get user avatar
            this.userName = user?.username || 'Player'; // Get user name
            this.cdr.detectChanges(); // Update changes in component
          },
          error: (err) => {
            console.error('User data retrieval error:', err);
            // Token invalid, redirect to login page
            this.router.navigate(['/']);
          }
        });
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      this.router.navigate(['/']);
    }
  }
  
  onScoreChange(score: number): void {
    this.score = score;
    this.cdr.detectChanges();
  }
  
  onLevelChange(level: number): void {
    this.level = level;
    this.cdr.detectChanges();
  }

  onPlayerChanged(): void {
    // This method is called on account logout
    // Logic already executed in header component (token cleanup and redirect)
  }

  navigateToLeaderboard(): void {
    // Save game state before navigation
    if (this.gameBoard) {
      this.gameBoard.prepareForNavigation();
    }
    this.router.navigate(['/leaderboard']);
  }
}


