import { Injectable, signal, WritableSignal, effect } from '@angular/core';
import { Level, LevelTask } from '../models/level.model';
import { PlayerProgressService } from './player-progress.service';
import { inject } from '@angular/core';

// This interface represents a task with its live completion state.
export interface LiveTask extends LevelTask {
  completion: WritableSignal<number>;
}

@Injectable({
  providedIn: 'root'
})
export class GameplayService {
  private playerProgressService: PlayerProgressService = inject(PlayerProgressService);

  // --- LIVE GAME STATE SIGNALS ---
  // These signals will be read by our UI components.
  public currentLevel: WritableSignal<Level | null> = signal(null);
  public stamina: WritableSignal<number> = signal(100);
  public focus: WritableSignal<number> = signal(0);
  public tasks: WritableSignal<LiveTask[]> = signal([]);
  public playerSprite: WritableSignal<string> = signal('junior-idle.jpg');
  public hasWon: WritableSignal<boolean> = signal(false);
  public hasFailed: WritableSignal<boolean> = signal(false);

  private taskFocusId: number | null = null; // For tracking consecutive task work

  constructor() {
    // This effect will automatically check for the win condition whenever a task's completion changes.
    effect(() => {
      const currentTasks = this.tasks();
      if (currentTasks.length > 0 && currentTasks.every(t => t.completion() === 100)) {
        if (this.hasWon()) { // Prevent multiple triggers
          this.handleWinCondition();
        }
      }
    });
  }

  /**
   * Sets up the service for a new level session. Called by the main GameComponent.
   */
  public setupLevel(level: Level): void {
    console.log("GameplayService: Setting up for level", level.orderId);
    this.currentLevel.set(level);
    this.stamina.set(level.initialStamina ?? 100);
    this.focus.set(level.initialFocus ?? 0);
    this.tasks.set(level.tasks.map(task => ({
      ...task,
      completion: signal(0)
    })));
    this.hasWon.set(false);
    this.hasFailed.set(false);
    this.playerSprite.set('junior-idle.jpg');
    this.taskFocusId = null;
  }

  /**
   * Resets the current level state to its initial values.
   */
  public resetLevelState(): void {
    const level = this.currentLevel();
    if (level) {
      this.setupLevel(level);
    }
  }

  // --- CORE ACTIONS (called by the InterpreterService) ---

  public performTask(taskId: number): void {
    const level = this.currentLevel();
    if (!level || this.hasWon() || this.hasFailed()) return;

    const taskToUpdate = this.tasks().find(t => t.id === taskId);
    if (taskToUpdate && taskToUpdate.completion() < 100) {

      let progressAmount = 10; // Base progress

      // Handle Focus mechanic
      if (level.usesFocus) {
        if (this.taskFocusId === taskId) {
          this.focus.update(f => Math.min(f + 10, 100)); // Increase focus
          progressAmount += this.focus(); // Add focus bonus
        } else {
          this.taskFocusId = taskId;
          this.focus.set(10); // Reset focus to base
        }
      }

      taskToUpdate.completion.update(c => Math.min(c + 100, c + progressAmount));

      if (level.usesStamina) {
        this.changeStamina(-10);
      }
    }
  }

  public drinkCoffee(): void {
    if (this.hasWon() || this.hasFailed()) return;
    this.playerSprite.set('junior-coffee.gif');
    this.focus.set(0); // Drinking coffee breaks focus
    this.taskFocusId = null;
    this.changeStamina(20);
    setTimeout(() => this.updatePlayerSpriteBasedOnStamina(), 1500); // Coffee animation duration
  }

  // --- PRIVATE STATE MANAGEMENT LOGIC ---

  private changeStamina(amount: number): void {
    this.stamina.update(s => Math.max(0, Math.min(100, s + amount)));
    if (this.stamina() === 0) {
      this.handleFailure();
    }
    this.updatePlayerSpriteBasedOnStamina();
  }

  private updatePlayerSpriteBasedOnStamina(): void {
    if (this.playerSprite() === 'junior-coffee.gif') return; // Don't interrupt coffee animation

    if (this.stamina() <= 20) {
      this.playerSprite.set('junior-tired.gif');
    } else {
      this.playerSprite.set('junior-typing.gif');
    }
  }

  private handleWinCondition(): void {
    console.log('WIN CONDITION MET!');
    this.hasWon.set(true);
    this.playerSprite.set('junior-success.jpg');
    // The GameComponent is listening for `hasWon` and will handle saving progress and moving to the next level.
  }

  private handleFailure(): void {
    if(this.hasFailed()) return; // Prevent multiple triggers
    console.log('FAILURE CONDITION MET! (Stamina depleted)');
    this.hasFailed.set(true);
    this.playerSprite.set('junior-fail.jpg');
    // We could show a "Try Again" dialog here.
  }
}
