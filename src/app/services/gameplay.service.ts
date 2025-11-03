import { Injectable, signal, WritableSignal } from '@angular/core';
import { Level, LevelTask } from '../models/level.model';

// The live, dynamic state of a task during gameplay
export interface LiveTask extends LevelTask {
  completion: WritableSignal<number>;
}

@Injectable({
  providedIn: 'root'
})
export class GameplayService {
  // --- Live Game State ---
  currentLevel: WritableSignal<Level | null> = signal(null);
  stamina: WritableSignal<number> = signal(100);
  focus: WritableSignal<number> = signal(0);
  tasks: WritableSignal<LiveTask[]> = signal([]);

  playerSprite: WritableSignal<string> = signal('JuniorAnimatedNormal.gif');

  hasWon: WritableSignal<boolean> = signal(false);

  // --- Methods to manage the game session ---

  public setupLevel(level: Level): void {
    this.currentLevel.set(level);
    this.stamina.set(level.initialStamina ?? 100);
    this.focus.set(level.initialFocus ?? 0);
    this.tasks.set(level.tasks.map(task => ({
      ...task,
      completion: signal(0) // Initialize completion as a signal
    })));
    this.hasWon.set(false);
    this.playerSprite.set('JuniorAnimatedNormal.gif');
  }

  public resetLevel(): void {
    const level = this.currentLevel();
    if (level) {
      this.setupLevel(level);
    }
  }

  // --- Core Gameplay Actions (called by the interpreter) ---

  public performTask(taskId: number): void {
    const level = this.currentLevel();
    if (!level) return;

    const taskToUpdate = this.tasks().find(t => t.id === taskId);
    if (taskToUpdate && taskToUpdate.completion() < 100) {
      taskToUpdate.completion.update(c => Math.min(c + 10, 100)); // Update the signal

      if (level.usesStamina) {
        this.changeStamina(-10);
      }

      console.log(`Task '${taskToUpdate.name}' progress: ${taskToUpdate.completion()}%`);
      this.checkWinCondition();
    }
  }

  public drinkCoffee(): void {
    this.playerSprite.set('JuniorAnimatedCoffee.gif');
    this.changeStamina(20);
    setTimeout(() => this.updatePlayerSpriteBasedOnStamina(), 1000);
  }

  private changeStamina(amount: number): void {
    this.stamina.update(s => {
      const newStamina = Math.max(0, Math.min(100, s + amount));
      if (newStamina === 0) {
        this.gameOver();
      }
      return newStamina;
    });
    this.updatePlayerSpriteBasedOnStamina();
  }

  private updatePlayerSpriteBasedOnStamina(): void {
    if (this.playerSprite() === 'JuniorAnimatedCoffee.gif') return;

    if (this.stamina() < 20) {
      this.playerSprite.set('JuniorAnimatedTired.gif');
    } else {
      this.playerSprite.set('JuniorAnimatedNormal.gif');
    }
  }

  private checkWinCondition(): void {
    if (this.tasks().every(t => t.completion() === 100)) {
      this.hasWon.set(true);
      console.log('Level Complete!');
      // Here you would also call PlayerProgressService to save the data
    }
  }

  private gameOver(): void {
    console.log('Game Over - Ran out of stamina!');
    // Handle game over logic (e.g., show a dialog)
  }
}
