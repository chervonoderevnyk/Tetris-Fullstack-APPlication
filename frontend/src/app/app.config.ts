import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { BaseComponent } from './base/base.component';
import { GameOverComponent } from './game-over/game-over.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

const routes = [
  { path: '', component: AuthPageComponent },
  { path: 'base', component: BaseComponent, canActivate: [AuthGuard] },
  { path: 'game-over', component: GameOverComponent, canActivate: [AuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent }, // Public page
  { path: '**', redirectTo: '' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([CredentialsInterceptor, AuthInterceptor]))
  ]
};
