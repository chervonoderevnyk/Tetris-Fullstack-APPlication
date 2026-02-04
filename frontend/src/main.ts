import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { GameOverComponent } from './app/game-over/game-over.component';
import { BaseComponent } from './app/base/base.component';
import { AuthPageComponent } from './app/auth-page/auth-page.component';
import { LeaderboardComponent } from './app/leaderboard/leaderboard.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';

const routes: Routes = [
  { path: '', component: AuthPageComponent },
  { path: 'base', component: BaseComponent },
  { path: 'game-over', component: GameOverComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ]
}).catch(err => console.error(err));