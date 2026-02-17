import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DeleteAccountModalComponent, FarewellModalComponent } from '../modals';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, DeleteAccountModalComponent, FarewellModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnChanges {
  @Input() score!: number;
  @Input() level!: number;
  @Input() avatar: string = '🙂';
  @Input() userName: string = 'Player';
  @Output() playerChanged = new EventEmitter<void>();
  @Output() leaderboardNavigation = new EventEmitter<void>();

  showDeleteModal: boolean = false;
  showFarewellModal: boolean = false;
  deletedUsername: string = '';

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

  deleteAccount(): void {
    this.showDeleteModal = true;
  }

  onDeleteConfirm(password: string): void {
    this.authService.deleteAccount(password).subscribe({
      next: (response) => {
        this.showDeleteModal = false;
        this.deletedUsername = response.user?.username || 'Player';
        this.showFarewellModal = true;
      },
      error: (error) => {
        this.showDeleteModal = false;
        console.error('Error deleting account:', error);
        const errorMessage = error.error?.error || 'Failed to delete account. Please try again.';
        alert(errorMessage);
      }
    });
  }

  onDeleteCancel(): void {
    this.showDeleteModal = false;
  }

  onFarewellClose(): void {
    this.showFarewellModal = false;
    this.playerChanged.emit();
    this.router.navigate(['/']);
  }

  goToLeaderboard(): void {
    this.leaderboardNavigation.emit();
  }
}
