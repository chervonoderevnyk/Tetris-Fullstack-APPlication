import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-farewell-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './farewell-modal.component.html',
  styleUrls: ['./farewell-modal.component.scss']
})
export class FarewellModalComponent {
  @Input() username: string = 'Player';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}