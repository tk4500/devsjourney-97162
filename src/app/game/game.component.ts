import { Component, effect, HostListener, inject, OnInit } from '@angular/core';
import { PlayerProgressService } from '../services/player-progress.service';
import { GameplayService } from '../services/gameplay.service';
import { LevelService } from '../services/level.service';
import { GameStatusComponent } from './game-status/game-status.component';
import { GameBlocklyComponent } from './game-blockly/game-blockly.component';
import { GameExplainComponent } from './game-explain/game-explain.component';

@Component({
  selector: 'app-game',
  imports: [
    GameStatusComponent,
    GameBlocklyComponent,
    GameExplainComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit{
  gameplayService: GameplayService = inject(GameplayService);
  playerProgressService: PlayerProgressService = inject(PlayerProgressService);
  levelService: LevelService = inject(LevelService);
constructor() {
  // When the game ends (win or lose), save progress.
  effect(() => {
    if (this.gameplayService.hasWon()) {
      // Logic to calculate score, stars, etc.
      // ...
      this.saveCurrentProgress();
    }
  });
}
  ngOnInit(): void {
    console.log("GameComponent initialized");
    const level = this.levelService.selectedLevelSubject.value;
    if (level){
      console.log("Loaded level:", level);
    }else{
      console.log("No level selected.");
    }

  }

// When the user leaves the page, save progress.
@HostListener('window:beforeunload', ['$event'])
unloadNotification($event: any): void {
  // This is a good place to trigger a save, but it's not 100% reliable.
  const currentProgress = this.playerProgressService.currentProgress;
  if (currentProgress) {
    this.playerProgressService.saveProgress(currentProgress);
  }
}

async saveCurrentProgress() {
  const currentProgress = this.playerProgressService.currentProgress;
  const currentLevel = this.gameplayService.currentLevel();
  if (currentProgress && currentLevel) {
    // Update the levelData map
    const newLevelData = {
      ...currentProgress.levelData,
      [currentLevel.id]: {
        completed: true,
        stars: 3 as const // Calculate this based on performance
      }
    };
    // Unlock the next level (this logic would need to be more robust)
    const newUnlockedLevels = [...currentProgress.unlockedLevels, `next_level_id`];

    await this.playerProgressService.saveProgress({
      ...currentProgress,
      levelData: newLevelData,
      unlockedLevels: newUnlockedLevels
    });
  }
}
}
