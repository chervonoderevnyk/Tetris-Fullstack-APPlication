import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnChanges {
  @Input() score!: number;
  @Input() level!: number;
  @Input() avatar: string = '🙂';
  @Input() userName: string = 'Гравець';
  @Output() playerChanged = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
  }

  logout(): void {
    this.authService.logout();
    this.playerChanged.emit();
    this.router.navigate(['/']);
  }

  goToLeaderboard(): void {
    this.router.navigate(['/leaderboard']);
  }
}
