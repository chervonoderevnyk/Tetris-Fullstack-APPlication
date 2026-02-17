import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent {
  @Input() isVisible: boolean = false;
  @Input() errorMessage: string = 'Something went wrong';
  @Output() retry = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}