import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Modules for UI
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

// Our Game Services
import { GameplayService } from '../../services/gameplay.service';
import { InterpreterService } from '../../services/interpreter.service';
import { BlocklyWorkspaceService } from '../../services/blockly-workspace.service';
import { TutorialService } from '../../services/tutorial.service';

@Component({
  selector: 'app-game-status',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressBarModule, TooltipModule],
  templateUrl: './game-status.component.html',
  styleUrls: ['./game-status.component.css']
})
export class GameStatusComponent {
  // Receives the live game state from the parent GameComponent.
  @Input({ required: true }) gameplay!: GameplayService;

  // Injects services needed for actions.
  public interpreterService = inject(InterpreterService); // Public to check isRunning in template
  private blocklyWorkspaceService = inject(BlocklyWorkspaceService);
  private tutorialService = inject(TutorialService);

  /**
   * Called when the "Run Code" button is clicked.
   */
  runCode(): void {
    this.blocklyWorkspaceService.saveWorkspace();
    const level = this.gameplay.currentLevel();
    if (!level || this.interpreterService.isRunning()) return;

    // --- EMIT THE EVENT ---
    console.log("[GameStatusComponent] Emitting 'codeRun' event.");
    this.tutorialService.tutorialEvents$.next('codeRun');

    // 1. Get the code from the workspace
    const code = this.blocklyWorkspaceService.getCode();

    // 2. Initialize the interpreter with the code and available blocks
    this.interpreterService.init(code, level.availableBlocks);

setTimeout(() => {
      // 3. Start executing the code
      this.interpreterService.run();
    }, 100); // Slight delay to ensure UI updates

  }

  stopCode(): void {
    this.interpreterService.stop();
  }

}
