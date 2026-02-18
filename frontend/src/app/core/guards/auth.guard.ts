import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Check if access token exists in memory
    if (this.authService.isAuthenticated) {
      return of(true);
    }

    // Try to use refresh token
    return this.authService.checkAuthenticationStatus().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}