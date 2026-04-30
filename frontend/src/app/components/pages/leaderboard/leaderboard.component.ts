import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScoreService } from '../../../services/score.service';
import { LeaderboardEntry, UserStats } from '../../../types';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];
  userStats: UserStats | null = null;
  userRanking: any = null;
  loading = false;
  error: string | null = null;

  page = 1;
  totalPages = 1;
  total = 0;
  readonly limit = 10;

  constructor(
    private scoreService: ScoreService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLeaderboard();
    this.loadUserStats();
    this.loadUserRanking();
  }

  loadLeaderboard() {
    this.loading = true;
    this.error = null;
    this.scoreService.getLeaderboard(this.page, this.limit).subscribe({
      next: (response) => {
        this.leaderboard = response.data;
        this.total = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load leaderboard';
        this.loading = false;
      }
    });
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadLeaderboard();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadLeaderboard();
    }
  }

  loadUserStats() {
    this.scoreService.getUserStats().subscribe({
      next: (data) => { this.userStats = data; },
      error: () => {}
    });
  }

  loadUserRanking() {
    this.scoreService.getUserRanking().subscribe({
      next: (data) => { this.userRanking = data; },
      error: () => {}
    });
  }

  globalRank(index: number): number {
    return (this.page - 1) * this.limit + index + 1;
  }

  goBack() {
    this.router.navigate(['/base']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRankEmoji(index: number): string {
    const rank = this.globalRank(index);
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  }
}
