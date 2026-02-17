import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  constructor(private toastService: ToastService) {}

  get toasts$() {
    return this.toastService.toasts$;
  }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  getToastIcon(type: Toast['type']): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': 
      default: return 'ℹ️';
    }
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }
}