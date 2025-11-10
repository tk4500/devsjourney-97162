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

  /**
   * Called when the "Run Code" button is clicked.
   */
  runCode(): void {
    const level = this.gameplay.currentLevel();
    if (!level || this.interpreterService.isRunning()) return;

    // 1. Get the code from the workspace
    const code = this.blocklyWorkspaceService.getCode();

    // 2. Initialize the interpreter with the code and available blocks
    this.interpreterService.init(code, level.availableBlocks);

    // 3. Run the interpreter
    this.interpreterService.run();
  }

  /**
   * Called when the "Try Again" button is clicked after failing a level.
   */
  tryAgain(): void {
    // Simply tell the gameplay service to reset its state.
    this.gameplay.resetLevelState();
  }
}
