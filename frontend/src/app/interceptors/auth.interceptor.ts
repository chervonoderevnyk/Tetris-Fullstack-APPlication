import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Router } from '@angular/router';

// Global state to avoid multiple refresh requests
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const errorService = inject(ErrorService);
  const router = inject(Router);

  // Don't add token to public auth endpoints (login, register, status, refresh)
  const isAuthEndpoint = (req.url.includes('/auth/login') || 
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/status') ||
    req.url.includes('/auth/refresh'));
  
  // Add access token to request if exists and it's not a public auth endpoint
  let authReq = req;
  const token = authService.getToken();
  
  if (!isAuthEndpoint && token) {
    authReq = req.clone({
      setHeaders: { 
        Authorization: `Bearer ${token}` 
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle only 401 errors for non-auth endpoints
      if (error.status === 401 && !isAuthEndpoint && !req.url.includes('/auth/refresh')) {
        
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((response: any) => {
              isRefreshing = false;
              refreshTokenSubject.next(response.tokenA);
              
              // Retry original request with new token
              const retryReq = authReq.clone({
                setHeaders: { 
                  Authorization: `Bearer ${response.tokenA}` 
                }
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              // Refresh token invalid - logout
              isRefreshing = false;
              refreshTokenSubject.next(null);
              router.navigate(['/']);
              return throwError(() => refreshError);
            }),
            finalize(() => {
              isRefreshing = false;
            })
          );
        } else {
          // If refresh is already in progress - wait for result
          return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(token => {
              const retryReq = authReq.clone({
                setHeaders: { 
                  Authorization: `Bearer ${token}` 
                }
              });
              return next(retryReq);
            })
          );
        }
      }

      // Handle 500 Internal Server Error
      if (error.status === 500) {
        errorService.handleServerError(error);
        return throwError(() => error);
      }

      // Handle network errors (status 0 usually means network issues)
      if (error.status === 0) {
        errorService.handleServerError(error);
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};