import { Component, Input, OnInit, OnDestroy, OnChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PasswordValidationService } from '../../../services/password-validation.service';
import { PasswordStrengthResult, PasswordRequirement } from '../../../types';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-strength.component.html',
  styleUrls: ['./password-strength.component.scss']
})
export class PasswordStrengthComponent implements OnInit, OnDestroy, OnChanges {
  @Input() password: string = '';
  @Input() username: string = '';
  @Input() showTips: boolean = true;
  @Input() showGenerator: boolean = true;
  @Output() passwordGenerated = new EventEmitter<string>();

  localRequirements: PasswordRequirement[] = [];
  serverResult: PasswordStrengthResult | null = null;
  strengthColor: string = '#cccccc';
  strengthText: string = '';
  strengthPercentage: number = 0;
  tipsExpanded: boolean = false;
  generatedPassword: string = '';

  private passwordSubject = new Subject<string>();
  private subscription: Subscription | null = null;

  constructor(private passwordValidationService: PasswordValidationService) {}

  ngOnInit() {
    // Subscription to password changes with debounce for API calls
    this.subscription = this.passwordSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((password) => {
      if (password) {
        this.passwordValidationService.checkPasswordStrength(password, this.username)
          .subscribe(result => {
            this.serverResult = result;
            this.updateStrengthIndicator();
          });
      }
    });

    this.updateLocalValidation();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnChanges() {
    this.updateLocalValidation();
    if (this.password) {
      this.passwordSubject.next(this.password);
    } else {
      this.serverResult = null;
      this.updateStrengthIndicator();
    }
  }

  private updateLocalValidation() {
    this.localRequirements = this.passwordValidationService
      .validatePasswordRequirementsLocal(this.password, this.username);
  }

  private updateStrengthIndicator() {
    if (this.serverResult) {
      this.strengthColor = this.passwordValidationService.getStrengthColor(this.serverResult.strength);
      this.strengthText = this.passwordValidationService.getStrengthText(this.serverResult.strength);
      this.strengthPercentage = this.passwordValidationService.getStrengthPercentage(this.serverResult.score);
    } else {
      this.strengthColor = '#cccccc';
      this.strengthText = '';
      this.strengthPercentage = 0;
    }
  }

  toggleTips() {
    this.tipsExpanded = !this.tipsExpanded;
  }

  generatePassword() {
    this.generatedPassword = this.passwordValidationService.generateSecurePassword(12);
  }

  copyPassword(input: HTMLInputElement) {
    input.select();
    document.execCommand('copy');
    
    // Show a short message
    const originalText = input.value;
    input.value = 'Copied!';
    setTimeout(() => {
      input.value = originalText;
    }, 1000);
  }

  useGeneratedPassword() {
    if (this.generatedPassword) {
      this.passwordGenerated.emit(this.generatedPassword);
      this.generatedPassword = '';
    }
  }
}