import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-account-modal.component.html',
  styleUrls: ['./delete-account-modal.component.scss']
})
export class DeleteAccountModalComponent {
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  password: string = '';
  isLoading: boolean = false;

  onConfirm(): void {
    if (!this.password.trim()) {
      return;
    }
    this.isLoading = true;
    this.confirm.emit(this.password);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.password = target.value;
  }
}