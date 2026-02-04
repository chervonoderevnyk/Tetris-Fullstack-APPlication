import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GameBoardComponent } from "../game-board/game-board.component";
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [CommonModule, GameBoardComponent, HeaderComponent, FooterComponent],
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})


export class BaseComponent implements OnInit {
  score: number = 0;
  level: number = 1;
  userAvatar: string = '🙂';
  userName: string = 'Гравець';

  constructor(
    private cdr: ChangeDetectorRef, 
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      const token = this.authService.getToken();
      if (!token) {
        this.router.navigate(['/']); // Повернення на сторінку входу, якщо токен відсутній
      } else {
        this.authService.getUserDetails().subscribe({
          next: (user) => {
            this.userAvatar = user?.avatar || '🙂'; // Отримуємо аватарку користувача
            this.userName = user?.username || 'Гравець'; // Отримуємо ім'я користувача
            this.cdr.detectChanges(); // Оновлюємо зміни в компоненті
          },
          error: (err) => {
            console.error('Помилка отримання даних користувача:', err);
            this.router.navigate(['/']);
          }
        });
      }
    } catch (error) {
      console.error('Помилка отримання даних користувача:', error);
      this.router.navigate(['/']);
    }
  }
  
  onScoreChange(score: number): void {
    this.score = score;
    this.cdr.detectChanges();
  }
  
  onLevelChange(level: number): void {
    this.level = level;
    this.cdr.detectChanges();
  }

  onPlayerChanged(): void {
    // Цей метод викликається при виході з акаунту
    // Логіка вже виконана в header компоненті (очищення токену та перенаправлення)
  }
}


