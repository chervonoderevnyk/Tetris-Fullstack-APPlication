import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { ScoreData, LeaderboardEntry, UserStats, UserRanking } from '../types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private apiUrl = `${environment.apiUrl}/scores`;

  constructor(private http: HttpClient) {}

  // Save game result
  saveScore(score: number, level: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, { score, level })
      .pipe(
        catchError(error => {
          console.error('Score save error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get leaderboard
  getLeaderboard(limit: number = 10): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/leaderboard?limit=${limit}`)
      .pipe(
        catchError(error => {
          console.error('Leaderboard loading error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get user's best scores
  getUserBestScores(limit: number = 5): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/my-scores?limit=${limit}`)
      .pipe(
        catchError(error => {
          console.error('User scores loading error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get user statistics
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/my-stats`)
      .pipe(
        catchError(error => {
          console.error('User statistics loading error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get user's ranking position
  getUserRanking(): Observable<UserRanking> {
    return this.http.get<UserRanking>(`${this.apiUrl}/my-ranking`)
      .pipe(
        catchError(error => {
          console.error('User ranking loading error:', error);
          return throwError(() => error);
        })
      );
  }
}