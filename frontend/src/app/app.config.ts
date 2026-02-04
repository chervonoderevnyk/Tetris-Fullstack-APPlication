import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { BaseComponent } from './base/base.component';
import { GameOverComponent } from './game-over/game-over.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

const routes = [
  { path: '', component: AuthPageComponent },
  { path: 'base', component: BaseComponent },
  { path: 'game-over', component: GameOverComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: '**', redirectTo: '' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor]))
  ]
};
