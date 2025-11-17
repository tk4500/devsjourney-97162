import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-game-fail-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './game-fail-modal.component.html',
  styleUrls: ['./game-fail-modal.component.css']
})
export class GameFailModalComponent {
  @Input() isVisible: boolean = false;
  @Output() tryAgain = new EventEmitter<void>();

  public audioService = inject(AudioService);
}
