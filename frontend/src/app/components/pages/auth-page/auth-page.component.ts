import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { PasswordValidationService } from '../../../services/password-validation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { availableAvatars } from '../../../../assets/emoji-avatars';
import { PasswordStrengthComponent } from '../../shared/password-strength/password-strength.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordStrengthComponent],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent implements OnInit {
  username: string = '';
  password: string = '';
  selectedAvatar: string = availableAvatars[0]; // Default selected avatar
  isLoginMode: boolean = true;
  message: string = '';
  avatars = availableAvatars; // List of available avatars
  showPassword: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private passwordValidationService: PasswordValidationService
  ) {}

  ngOnInit(): void {
    // Check authentication status
    this.authService.checkAuthenticationStatus().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/base']);
        }
      },
      error: () => {
        // User not authenticated - stay on login page
      }
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.message = '';
  }

  onSubmit(): void {
    if (this.isLoginMode) {
      this.authService.login(this.username, this.password).subscribe({
        next: (response) => {
          this.router.navigate(['/base']);
        },
        error: (err) => {
          this.message = 'Login error. Please check your credentials.';
        }
      });
    } else {
      this.authService.register(this.username, this.password, this.selectedAvatar).subscribe({
        next: (response) => {
          this.router.navigate(['/base']);
        },
        error: (err) => {
          this.message = err?.error?.error || 'Registration error. Please try again.';
        }
      });
    }
  }

  onPasswordGenerated(generatedPassword: string): void {
    this.password = generatedPassword;
  }

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}