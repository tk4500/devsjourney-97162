import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { LevelResult } from '../../services/gameplay.service';

@Component({
  selector: 'app-level-complete-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  templateUrl: './level-complete-modal.component.html',
  styleUrls: ['./level-complete-modal.component.css']
})
export class LevelCompleteModalComponent {
  @Input() result: LevelResult | null = null;
  @Input() isVisible: boolean = false;
  @Input() hasNextLevel: boolean = false;

  @Output() playAgain = new EventEmitter<void>();
  @Output() nextLevel = new EventEmitter<void>();
  @Output() backToMenu = new EventEmitter<void>();

  // Helper to create an array for the *ngFor to render stars
  get starsArray(): number[] {
    return this.result ? Array(3).fill(0) : [];
  }
}
