import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";

interface ScoreData {
  score: number;
  level: number;
}

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

interface UserRanking {
  position: number;
  score: number;
  level: number;
}

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private apiUrl = 'http://localhost:3001/scores';

  constructor(private http: HttpClient) {}

  // Збереження результату гри
  saveScore(score: number, level: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, { score, level })
      .pipe(
        catchError(error => {
          console.error('Помилка збереження результату:', error);
          return throwError(() => error);
        })
      );
  }

  // Отримання лідерборду
  getLeaderboard(limit: number = 10): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/leaderboard?limit=${limit}`)
      .pipe(
        catchError(error => {
          console.error('Помилка завантаження лідерборду:', error);
          return throwError(() => error);
        })
      );
  }

  // Отримання кращих результатів користувача
  getUserBestScores(limit: number = 5): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/my-scores?limit=${limit}`)
      .pipe(
        catchError(error => {
          console.error('Помилка завантаження результатів користувача:', error);
          return throwError(() => error);
        })
      );
  }

  // Отримання статистики користувача
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/my-stats`)
      .pipe(
        catchError(error => {
          console.error('Помилка завантаження статистики користувача:', error);
          return throwError(() => error);
        })
      );
  }

  // Отримання позиції користувача в рейтингу
  getUserRanking(): Observable<UserRanking> {
    return this.http.get<UserRanking>(`${this.apiUrl}/my-ranking`)
      .pipe(
        catchError(error => {
          console.error('Помилка завантаження рейтингу користувача:', error);
          return throwError(() => error);
        })
      );
  }
}