import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PlayerProgress } from '../../models/player-progress.model';
import { AudioService } from '../../services/audio.service';
export type SaveChoice = 'local' | 'cloud';
@Component({
selector: 'app-save-conflict-dialog',
standalone: true,
imports: [CommonModule, DialogModule, ButtonModule],
templateUrl: './save-conflict-dialog.component.html',
styleUrls: ['./save-conflict-dialog.component.css']
})
export class SaveConflictDialogComponent {
@Input() localProgress: PlayerProgress | null = null;
@Input() cloudProgress: PlayerProgress | null = null;
@Input() isVisible: boolean = false;
@Output() resolve = new EventEmitter<SaveChoice>();
protected audioService: AudioService = inject(AudioService);
// Helper to get a summary of a progress file
getSummary(progress: PlayerProgress | null): string {
if (!progress) return 'No data';
const levelsUnlocked = progress.unlockedLevels?.length || 0;
const tasksCompleted = Object.keys(progress.levelData).length;
return `${levelsUnlocked} levels unlocked, ${tasksCompleted} tasks completed.`;
}
}
