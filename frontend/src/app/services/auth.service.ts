import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError, tap, BehaviorSubject, switchMap } from "rxjs";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private accessToken: string | null = null; // Store access token in memory
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check authentication status on initialization (async)
    // Use longer timeout to avoid conflict with auth-page
    setTimeout(() => {
        if (!this.accessToken) { // Only if there's no token in memory
        this.checkAuthStatus().subscribe({
          next: () => console.log('Auth status checked on app init'),
          error: () => console.log('No valid session found on app init')
        });
      }
    }, 200);
  }

register(username: string, password: string, avatar: string): Observable<any> {
  return this.http.post<{ tokenA: string; user: any }>(`${this.apiUrl}/register`, 
    { username, password, avatar }
  ).pipe(
    tap(response => {
      if (response.tokenA) {
        this.setAccessToken(response.tokenA);
      }
    }),
    catchError(error => {
      console.error('Registration error:', error);
      return throwError(() => error);
    })
  );
}

login(username: string, password: string): Observable<{ tokenA: string; user: any }> {
  return this.http.post<{ tokenA: string; user: any }>(`${this.apiUrl}/login`, 
    { username, password }
  ).pipe(
    tap(response => {
      if (response.tokenA) {
        this.setAccessToken(response.tokenA);
      }
    }),
    catchError(error => {
      console.error('Login error:', error);
      return throwError(() => error);
    })
  );
}

  // Memory storage methods for access token
  private setAccessToken(token: string): void {
    this.accessToken = token;
    this.isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    return this.accessToken;
  }

  // Checks authentication status via refresh token
  checkAuthStatus(): Observable<any> {
    return this.http.get<{ authenticated: boolean; tokenA?: string; user?: any }>(`${this.apiUrl}/status`
    ).pipe(
      tap(response => {
        if (response.authenticated && response.tokenA) {
          this.setAccessToken(response.tokenA);
        } else {
          this.clearAccessToken();
        }
      }),
      catchError(error => {
        this.clearAccessToken();
        return throwError(() => error);
      })
    );
  }

  // Refreshes access token via refresh token
  refreshToken(): Observable<any> {
    return this.http.post<{ tokenA: string; user: any }>(`${this.apiUrl}/refresh`, {}
    ).pipe(
      tap(response => {
        if (response.tokenA) {
          this.setAccessToken(response.tokenA);
        }
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.clearAccessToken();
        return throwError(() => error);
      })
    );
  }

  getUserDetails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`)
      .pipe(
        catchError(error => {
          // Don't auto-refresh here, let interceptor handle 401
          console.error('Error getting user data:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    // Call logout endpoint to clear refresh token
    this.http.post(`${this.apiUrl}/logout`, {})
      .subscribe({
        next: () => {},
        error: () => {}
      });
    
    this.clearAccessToken();
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  // Check if user is authenticated (synchronously)
  get isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Check status and return Observable for subscription
  checkAuthenticationStatus(): Observable<boolean> {
    if (this.accessToken) {
      // If token already exists, return true
      return new BehaviorSubject(true).asObservable();
    }
    
    // Try refresh token
    return this.checkAuthStatus().pipe(
      tap(() => {}), // checkAuthStatus sets state itself
      catchError(() => {
        this.clearAccessToken();
        return throwError(() => false);
      }),
      // Return authentication result
      switchMap(() => new BehaviorSubject(!!this.accessToken).asObservable())
    );
  }

  private clearAccessToken(): void {
    this.accessToken = null;
    this.isAuthenticatedSubject.next(false);
  }

  // Delete user account with password confirmation
  deleteAccount(password: string): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/delete-account`, {
      body: { password }
    }).pipe(
      tap(() => {
        this.clearAccessToken();
      }),
      catchError(error => {
        console.error('Error deleting account:', error);
        return throwError(() => error);
      })
    );
  }

  // Method for complete authentication clearing
  forceLogout(): void {
    this.logout();
    window.location.href = '/';
  }
}
