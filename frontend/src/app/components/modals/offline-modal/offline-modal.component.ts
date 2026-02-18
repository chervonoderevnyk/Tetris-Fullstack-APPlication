import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-offline-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline-modal.component.html',
  styleUrls: ['./offline-modal.component.scss']
})
export class OfflineModalComponent {
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}