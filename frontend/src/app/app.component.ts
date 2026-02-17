import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModalComponent, OfflineModalComponent, ToastComponent } from './modals';
import { ErrorService } from './services/error.service';
import { NetworkService } from './services/network.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ErrorModalComponent, OfflineModalComponent, ToastComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private errorService: ErrorService,
    private networkService: NetworkService
  ) {}

  get errorModalVisible$() {
    return this.errorService.errorModalVisible$;
  }

  get errorMessage$() {
    return this.errorService.errorMessage$;
  }

  get offlineModalVisible$() {
    return this.errorService.offlineModalVisible$;
  }

  get isOnline$() {
    return this.networkService.online$;
  }

  onCloseError(): void {
    this.errorService.hideError();
  }

  onRetryError(): void {
    this.errorService.hideError();
    // Refresh the page to retry
    window.location.reload();
  }

  onRetryConnection(): void {
    // Check connection manually by making a test request
    if (navigator.onLine) {
      this.errorService.hideOfflineModal();
      // Optional: could refresh page or retry last failed request
      window.location.reload();
    }
  }
}
