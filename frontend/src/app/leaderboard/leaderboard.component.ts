import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScoreService } from '../services/score.service';

interface LeaderboardEntry {
  id: number;
  score: number;
  level: number;
  playedAt: Date;
  user: {
    username: string;
    avatar: string;
  };
}

interface UserStats {
  totalGames: number;
  bestScore: number;
  maxLevel: number;
  averageScore: number;
  averageLevel: number;
}

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
    this.scoreService.getLeaderboard().subscribe({
      next: (data) => {
        this.leaderboard = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Помилка завантаження лідерборду:', err);
        this.error = 'Не вдалося завантажити лідерборд';
        this.loading = false;
      }
    });
  }

  loadUserStats() {
    this.scoreService.getUserStats().subscribe({
      next: (data) => {
        this.userStats = data;
      },
      error: (err) => {
        console.error('Помилка завантаження статистики:', err);
      }
    });
  }

  loadUserRanking() {
    this.scoreService.getUserRanking().subscribe({
      next: (data) => {
        this.userRanking = data;
      },
      error: (err) => {
        console.error('Помилка завантаження рейтингу:', err);
      }
    });
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
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  }
}