import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  effect,
} from '@angular/core'; // <-- Import effect
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; // We still use this for the levelService subscription
import { AudioService } from '../services/audio.service';
// --- Our Services ---
import { GameplayService } from '../services/gameplay.service';
import { PlayerProgressService } from '../services/player-progress.service';
import { LevelService } from '../services/level.service';
import { TutorialService } from '../services/tutorial.service';
import { Level } from '../models/level.model';

// --- Child Components ---
import { GameStatusComponent } from './game-status/game-status.component';
import { GameBlocklyComponent } from './game-blockly/game-blockly.component';
import { GameTutorialComponent } from './game-tutorial/game-tutorial.component';
import { TopbarComponent } from '../shared/topbar/topbar.component';

import { LevelResult } from '../services/gameplay.service'; // <-- Import the interface
import { LevelCompleteModalComponent } from './level-complete-modal/level-complete-modal.component';
import { GameFailModalComponent } from './game-fail-modal/game-fail-modal.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    GameStatusComponent,
    GameBlocklyComponent,
    GameTutorialComponent,
    TopbarComponent,
    LevelCompleteModalComponent,
    GameFailModalComponent
  ],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, OnDestroy {
  // Inject all necessary services
  private levelService: LevelService = inject(LevelService);
  public gameplayService: GameplayService = inject(GameplayService);
  private playerProgressService: PlayerProgressService = inject(
    PlayerProgressService
  );
  private tutorialService: TutorialService = inject(TutorialService);
  private router: Router = inject(Router);
  private audioService: AudioService = inject(AudioService);
  private levelSubscription: Subscription | undefined;
  public currentLevel: Level | null = null;
  public isGameFailVisible = false;

  public levelResult: LevelResult | null = null;
  public isLevelCompleteVisible = false;
  public hasNextLevel = false;

  constructor() {
    // --- THE FIX ---
    // Create an effect to react to the hasWon signal.
    // This will automatically run whenever gameplayService.hasWon() changes.
    effect(() => {
      if (this.gameplayService.hasWon()) {
        console.log(
          '[GameComponent] Win condition detected via effect. Handling level completion...'
        );
        this.handleLevelCompletion();
      }
    });
    effect(() => {
      if (this.gameplayService.hasFailed()) {
        console.log("[GameComponent] Failure condition detected. Showing fail modal.");
        this.isGameFailVisible = true;
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to the selected level from the LevelService's BehaviorSubject
    this.levelSubscription = this.levelService.selectedLevel$.subscribe(
      (level) => {
        if (level) {
          this.currentLevel = level;
          console.log(
            `[GameComponent] Initializing for Level ${level.orderId}: ${level.name}`
          );
          // Tell all services to set themselves up for this level
          this.gameplayService.setupLevel(level);
          this.tutorialService.loadTutorialForLevel(level.id);
          this.audioService.playMusic('gameplay');
        } else {
          // If no level is selected, go back to level select screen
          console.warn(
            '[GameComponent] No level selected. Redirecting to /levels.'
          );
          this.router.navigate(['/levels']);
        }
      }
    );
  }

    onTryAgain(): void {
    this.isGameFailVisible = false;
    // We need a slight delay to allow the dialog to close before resetting state,
    // which prevents a visual "flicker".
    setTimeout(() => {
      this.gameplayService.resetLevelState();
    }, 200);
  }

  async handleLevelCompletion(): Promise<void> {
    if (!this.currentLevel) return;

    this.levelResult = this.gameplayService.calculateScore();
    if (!this.levelResult) return;
    console.log(
      `[GameComponent] Level Completed! Score: ${this.levelResult.score}, Stars: ${this.levelResult.stars}`
    );
    this.isLevelCompleteVisible = true;

    // A. Save the player's progress
    await this.playerProgressService.completeLevel(
      this.currentLevel.id,
      this.levelResult.stars,
      this.levelResult.score
    );
    // B. Find the next level
    const nextLevelOrderId = this.currentLevel.orderId + 1;
    const nextLevel = await this.levelService.getLevelByOrderId(
      nextLevelOrderId
    );
    this.hasNextLevel = !!nextLevel;
  }

  onPlayAgain(): void {
    this.audioService.playMusic('gameplay');
    this.isLevelCompleteVisible = false;
    this.gameplayService.resetLevelState();
  }

  async onNextLevel(): Promise<void> {
    this.audioService.playSfx('ui_confirm');
    this.isLevelCompleteVisible = false;
    if (!this.currentLevel) return;

    const nextLevelOrderId = this.currentLevel.orderId + 1;
    const nextLevel = await this.levelService.getLevelByOrderId(
      nextLevelOrderId
    );
    if (nextLevel) {
      this.levelService.selectLevel(nextLevel);
    } else {
      this.onBackToMenu(); // Failsafe
    }
  }

  onBackToMenu(): void {
    this.audioService.playSfx('ui_click');
    this.isLevelCompleteVisible = false;
    this.router.navigate(['/levels']);
  }

  // Requirement: Save progress when the user leaves the page.
  @HostListener('window:beforeunload')
  saveOnClose(): void {
    const progress = this.playerProgressService.currentProgress;
    if (progress) {
      this.playerProgressService.saveProgress(progress);
    }
  }

  ngOnDestroy(): void {
    // This is crucial to prevent memory leaks.
    this.levelSubscription?.unsubscribe();
    this.audioService.stopMusic();
  }
}
