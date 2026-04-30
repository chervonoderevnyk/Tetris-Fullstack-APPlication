import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { CredentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthService } from './services/auth.service';
import { AuthPageComponent } from './components/pages/auth-page/auth-page.component';
import { BaseComponent } from './components/pages/base/base.component';
import { GameOverComponent } from './components/pages/game-over/game-over.component';
import { LeaderboardComponent } from './components/pages/leaderboard/leaderboard.component';
const routes = [
  { path: '', component: AuthPageComponent },
  { path: 'base', component: BaseComponent, canActivate: [AuthGuard] },
  { path: 'game-over', component: GameOverComponent, canActivate: [AuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: '**', redirectTo: '' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([CredentialsInterceptor, AuthInterceptor])),
    provideAppInitializer(async () => {
      const authService = inject(AuthService);
      try {
        await firstValueFrom(authService.checkAuthStatus());
      } catch {
        // No valid session — app starts unauthenticated
      }
    })
  ]
};
