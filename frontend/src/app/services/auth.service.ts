import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3001/auth';

  constructor(private http: HttpClient) {}

register(username: string, password: string, avatar: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/register`, { username, password, avatar })
    .pipe(
      catchError(error => {
        console.error('Помилка реєстрації:', error);
        return throwError(() => error);
      })
    );
}

login(username: string, password: string): Observable<{ tokenA: string }> {
  return this.http.post<{ tokenA: string }>(`${this.apiUrl}/login`, { username, password })
    .pipe(
      catchError(error => {
        console.error('Помилка входу:', error);
        return throwError(() => error);
      })
    );
}

  saveToken(tokenA: string): void {
    localStorage.setItem('auth_tokenA', tokenA);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_tokenA');
  }

  getUserDetails(): Observable<any> {
  return this.http.get(`${this.apiUrl}/me`);
}

  logout(): void {
    localStorage.removeItem('auth_tokenA');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearToken(): void {
    localStorage.removeItem('auth_tokenA');
  }
}
