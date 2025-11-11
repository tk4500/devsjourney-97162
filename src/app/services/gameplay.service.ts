import { Injectable, signal, WritableSignal, effect } from '@angular/core';
import { Level, LevelTask } from '../models/level.model';
import { inject } from '@angular/core';
import { BlocklyWorkspaceService } from './blockly-workspace.service';
import { AudioService } from './audio.service';
// This interface represents a task with its live completion state.
export interface LiveTask extends LevelTask {
  completion: WritableSignal<number>;
}

export interface LevelResult {
  score: number;
  stars: 0 | 1 | 2 | 3;
}
@Injectable({
  providedIn: 'root',
})
export class GameplayService {
  private blocklyWorkspaceService: BlocklyWorkspaceService = inject(
    BlocklyWorkspaceService
  );
  private audioService: AudioService = inject(AudioService);
  private executionTime: number = 0;
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
      if (
        currentTasks.length > 0 &&
        currentTasks.every((t) => t.completion() >= 100)
      ) {
        if (!this.hasWon()) {
          // Prevent multiple triggers
          this.handleWinCondition();
        }
      }
    });
  }

  /**
   * Sets up the service for a new level session. Called by the main GameComponent.
   */
  public setupLevel(level: Level): void {
    this.executionTime = 0;
    console.log('GameplayService: Setting up for level', level.orderId);
    this.currentLevel.set(level);
    this.stamina.set(level.initialStamina ?? 100);
    this.focus.set(level.initialFocus ?? 0);
    this.tasks.set(
      level.tasks.map((task) => ({
        ...task,
        completion: signal(task.initialCompletion ?? 0),
      }))
    );
    this.hasWon.set(false);
    this.hasFailed.set(false);
    this.playerSprite.set('junior-idle.jpg');
    this.taskFocusId = null;
    console.log('GameplayService: Level setup complete.', {
      stamina: this.stamina(),
      focus: this.focus(),
      tasks: this.tasks().map((t) => ({
        id: t.id,
        completion: t.completion(),
      })),
    });
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

  public setExecutionTime(timeMs: number): void {
    this.executionTime = timeMs;
  }
  public addExecutionTime(deltaMs: number): void {
    this.executionTime += deltaMs;
  }

  // --- CORE ACTIONS (called by the InterpreterService) ---

  public performTask(taskId: number): void {
    const level = this.currentLevel();
    if (!level || this.hasWon() || this.hasFailed()) return;

    const taskToUpdate = this.tasks().find((t) => t.id === taskId);
    if (taskToUpdate && taskToUpdate.completion() < 100) {
      this.audioService.playSfx('keyboard_tick');

      let progressAmount = 10; // Base progress

      // Handle Focus mechanic
      if (level.usesFocus) {
        if (this.taskFocusId === taskId) {
          this.focus.update((f) => Math.min(f + 10, 100)); // Increase focus
          progressAmount += this.focus(); // Add focus bonus
          if (level.orderId >= 8) {
            if (Math.random() < 0.25) {
              console.log('--- INTERRUPTION! --- Focus has been reset.');
              this.audioService.playSfx('focus_break');
              alert('Oh no! You got interrupted and lost your focus!');
              this.focus.set(0);
              this.taskFocusId = null;
              progressAmount = 10;
              // In the future, we could trigger a sound effect or visual alert here.
            }
          }
        } else {
          this.taskFocusId = taskId;
          this.focus.set(10); // Reset focus to base
        }
      }

      taskToUpdate.completion.update((c) =>
        Math.min(c + 100, c + progressAmount)
      );
      if (taskToUpdate.completion() >= 100) {
        this.audioService.playSfx('task_complete');
      }

      if (level.usesStamina) {
        this.changeStamina(-10);
      }
    }
  }

  public calculateScore(): LevelResult | null {
    const level = this.currentLevel();
    if (!level) return null;
    const workspace = this.blocklyWorkspaceService.workspace;
    if (!workspace) return null;
    console.log('Calculating score for level', level.orderId);
    const actualBlockCount = workspace.getAllBlocks(false).length;
    const weights = level.scoreWeights || {
      blocks: 60,
      time: 40,
    };
    const ideal = level.scoreObjectives || {
      blocks: 10,
      time: 5000,
    };
    let totalWeightedScore = 0;
    let totalWeight = 0;
    console.log('Weights:', weights, 'Ideal:', ideal);

    // 1. Block Count Score
    if (weights.blocks) {
      const actualBlockCount = workspace.getAllBlocks(false).length;
      // Score is 100% if you use the ideal number or fewer, and decreases as you use more.
      const blockScore =
        Math.max(
          0,
          1 - (actualBlockCount - ideal.blocks) / (2 * ideal.blocks)
        ) * 100;

      totalWeightedScore += blockScore * weights.blocks;
      totalWeight += weights.blocks;
      console.log(
        `Block Score: ${blockScore} (Actual: ${actualBlockCount}, Ideal: ${ideal.blocks})`
      );
    }

    // 2. Final Stamina Score
    if (weights.stamina && level.usesStamina) {
      const staminaScore = this.stamina(); // Final stamina is a direct 0-100 score
      totalWeightedScore += staminaScore * weights.stamina;
      totalWeight += weights.stamina;
      console.log(
        `Stamina Score: ${staminaScore} (Final Stamina: ${this.stamina()})`
      );
    }

    // 3. Code Size Score
    if (weights.codeSize && ideal.codeSize) {
      const actualCodeSize = this.blocklyWorkspaceService.getCode().length;
      const codeSizeScore =
        Math.max(0, 1 - (actualCodeSize - ideal.codeSize) / ideal.codeSize) *
        100;
      totalWeightedScore += codeSizeScore * weights.codeSize;
      totalWeight += weights.codeSize;
      console.log(
        `Code Size Score: ${codeSizeScore} (Actual: ${actualCodeSize}, Ideal: ${ideal.codeSize})`
      );
    }

    // 4. Execution Time Score
    if (weights.time && ideal.time && this.executionTime > 0) {
      const timeScore =
        Math.max(0, 1 - (this.executionTime - ideal.time) / ideal.time) * 100;
      totalWeightedScore += timeScore * weights.time;
      totalWeight += weights.time;
      console.log(
        `Time Score: ${timeScore} (Actual: ${this.executionTime}ms, Ideal: ${ideal.time}ms)`
      );
    }

    // Calculate final score (normalized to a max of 10000)
    const finalScore =
      totalWeight > 0
        ? Math.floor((totalWeightedScore / totalWeight) * 100)
        : 0;
    console.log(`Final Score: ${finalScore}`);

    // Calculate Stars
    let stars: 0 | 1 | 2 | 3 = 0;
    if (level.scoreObjectives?.blocks) {
      stars = Math.min(
        Math.max(0, level.scoreObjectives.blocks - actualBlockCount + 3),
        3
      ) as 0 | 1 | 2 | 3;
      console.log(`Stars (based on scoreObjectives.blocks): ${stars}`);
    } else {
      stars = Math.min(Math.max(0, ideal.blocks - actualBlockCount + 3), 3) as
        | 0
        | 1
        | 2
        | 3;
      console.log(`Stars (based on ideal.blocks): ${stars}`);
    }
    return { score: finalScore, stars };
  }

  public drinkCoffee(): void {
    if (this.hasWon() || this.hasFailed()) return;
    this.audioService.playSfx('drink_coffee');
    this.playerSprite.set('junior-coffee.gif');
    this.focus.set(0); // Drinking coffee breaks focus
    this.taskFocusId = null;
    this.changeStamina(20);
    setTimeout(() => this.updatePlayerSpriteBasedOnStamina(), 1500); // Coffee animation duration
  }

  // --- PRIVATE STATE MANAGEMENT LOGIC ---

  private changeStamina(amount: number): void {
    this.stamina.update((s) => Math.max(0, Math.min(100, s + amount)));
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
    if (this.hasWon()) return;
    console.log('WIN CONDITION MET!');
    this.audioService.stopMusic(); // Stop the gameplay music
    this.audioService.playMusic('win');

    this.hasWon.set(true);
    this.playerSprite.set('junior-success.jpg');
    // The GameComponent is listening for `hasWon` and will handle saving progress and moving to the next level.
  }

  private handleFailure(): void {
    if(this.hasFailed()) return;
    console.log('FAILURE CONDITION MET!');

    this.audioService.playSfx('level_fail');

    this.hasFailed.set(true);
    this.playerSprite.set('junior-fail.jpg');
  }
}
