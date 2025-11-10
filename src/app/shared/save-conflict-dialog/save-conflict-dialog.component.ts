import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PlayerProgress } from '../../models/player-progress.model';
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
// Helper to get a summary of a progress file
getSummary(progress: PlayerProgress | null): string {
if (!progress) return 'No data';
const levelsUnlocked = progress.unlockedLevels?.length || 0;
const tasksCompleted = Object.keys(progress.levelData).length;
return `${levelsUnlocked} levels unlocked, ${tasksCompleted} tasks completed.`;
}
}
