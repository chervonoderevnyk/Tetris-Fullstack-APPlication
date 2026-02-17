import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NetworkService } from './network.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorModalVisibleSubject = new BehaviorSubject<boolean>(false);
  private errorMessageSubject = new BehaviorSubject<string>('');
  private offlineModalVisibleSubject = new BehaviorSubject<boolean>(false);
  private wasOffline = false;

  errorModalVisible$ = this.errorModalVisibleSubject.asObservable();
  errorMessage$ = this.errorMessageSubject.asObservable();
  offlineModalVisible$ = this.offlineModalVisibleSubject.asObservable();

  constructor(
    private networkService: NetworkService,
    private toastService: ToastService
  ) {
    // Show offline modal when connection is lost
    this.networkService.online$.subscribe(isOnline => {
      if (!isOnline) {
        this.wasOffline = true;
        this.showOfflineModal();
        this.hideError(); // Hide error modal if offline modal is shown
      } else {
        this.hideOfflineModal();
        // Show success toast when connection is restored
        if (this.wasOffline) {
          this.toastService.showToast('🌐 Connection restored!', 'success', 4000);
          this.wasOffline = false;
        }
      }
    });
  }

  showError(message: string): void {
    // Don't show error modal if offline
    if (this.networkService.isOffline) {
      this.showOfflineModal();
      return;
    }

    this.errorMessageSubject.next(message);
    this.errorModalVisibleSubject.next(true);
  }

  hideError(): void {
    this.errorModalVisibleSubject.next(false);
    this.errorMessageSubject.next('');
  }

  showOfflineModal(): void {
    this.offlineModalVisibleSubject.next(true);
  }

  hideOfflineModal(): void {
    this.offlineModalVisibleSubject.next(false);
  }

  handleServerError(error: any): void {
    // Check if it's a network error
    if (!this.networkService.isOnline || this.isNetworkError(error)) {
      this.showOfflineModal();
      return;
    }

    let message = 'Server error occurred';
    
    if (error?.error?.error) {
      message = error.error.error;
    } else if (error?.message) {
      message = error.message;
    }
    
    this.showError(message);
  }

  private isNetworkError(error: any): boolean {
    return error.status === 0 || 
           error.name === 'NetworkError' ||
           error.message?.includes('Failed to fetch') ||
           error.message?.includes('Network request failed');
  }
}