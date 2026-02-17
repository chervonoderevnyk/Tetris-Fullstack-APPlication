import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ScoreService } from '../services/score.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss']
})
export class GameOverComponent {
  finalScore: number = 0;
  finalLevel: number = 1;
  scoreSaved: boolean = false;
  saveError: string | null = null;
  saving: boolean = false;

  constructor(
    private route: ActivatedRoute,  
    private router: Router,
    private scoreService: ScoreService
  ) {
    this.route.queryParams.subscribe(params => {
      this.finalScore = +params['score'] || 0;
      this.finalLevel = +params['level'] || 1;
      
      // Automatically save result when component loads
      this.saveScore();
    });
  }

  saveScore(): void {
    if (this.finalScore > 0 && !this.scoreSaved && !this.saving) {
      this.saving = true;
      this.scoreService.saveScore(this.finalScore, this.finalLevel).subscribe({
        next: (result) => {
          this.scoreSaved = true;
          this.saving = false;
        },
        error: (error) => {
          this.saving = false;
          if (error.status === 401) {
            this.saveError = 'You need to login to save the score';
          } else {
            this.saveError = 'Error saving score';
          }
          console.error('Score save error:', error);
        }
      });
    }
  }

  restartGame(): void {
    this.router.navigate(['/base']);  // Restart game
  }

  viewLeaderboard(): void {
    this.router.navigate(['/leaderboard']);  // Navigate to leaderboard
  }
}