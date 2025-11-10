import { Component, inject, OnInit, OnDestroy, HostListener, effect } from '@angular/core'; // <-- Import effect
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; // We still use this for the levelService subscription

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
import { TopbarComponent } from "../shared/topbar/topbar.component";

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [ CommonModule, GameStatusComponent, GameBlocklyComponent, GameTutorialComponent, TopbarComponent ],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  // Inject all necessary services
  private levelService: LevelService = inject(LevelService);
  public gameplayService: GameplayService = inject(GameplayService);
  private playerProgressService: PlayerProgressService = inject(PlayerProgressService);
  private tutorialService: TutorialService = inject(TutorialService);
  private router: Router = inject(Router);

  private levelSubscription: Subscription | undefined;
  public currentLevel: Level | null = null;

  constructor() {
    // --- THE FIX ---
    // Create an effect to react to the hasWon signal.
    // This will automatically run whenever gameplayService.hasWon() changes.
    effect(() => {
      if (this.gameplayService.hasWon()) {
        console.log("[GameComponent] Win condition detected via effect. Handling level completion...");
        this.handleLevelCompletion();
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to the selected level from the LevelService's BehaviorSubject
    this.levelSubscription = this.levelService.selectedLevel$.subscribe(level => {
      if (level) {
        this.currentLevel = level;
        console.log(`[GameComponent] Initializing for Level ${level.orderId}: ${level.name}`);
        // Tell all services to set themselves up for this level
        this.gameplayService.setupLevel(level);
        this.tutorialService.loadTutorialForLevel(level.id);
      } else {
        // If no level is selected, go back to level select screen
        console.warn("[GameComponent] No level selected. Redirecting to /levels.");
        this.router.navigate(['/levels']);
      }
    });
  }

  async handleLevelCompletion(): Promise<void> {
    if (!this.currentLevel) return;

    // A. Save the player's progress
    await this.playerProgressService.completeLevel(this.currentLevel.id, 3); // Assume 3 stars for now

    // B. Find the next level
    const nextLevelOrderId = this.currentLevel.orderId + 1;
    const nextLevel = await this.levelService.getLevelByOrderId(nextLevelOrderId);

    // C. Navigate
    if (nextLevel) {
      console.log(`[GameComponent] Moving to next level: ${nextLevel.name}`);
      // Show a success modal/animation for a moment before transitioning
      setTimeout(() => {
        this.levelService.selectLevel(nextLevel);
      }, 2000); // 2-second delay for celebration
    } else {
      console.log("[GameComponent] Final level completed! Returning to level select.");
      setTimeout(() => {
        this.router.navigate(['/levels']);
      }, 2000);
    }
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
  }
}
