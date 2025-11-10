import { Injectable, inject, signal } from '@angular/core';
import { GameplayService } from './gameplay.service';
import { BlocklyWorkspaceService } from './blockly-workspace.service';

// The 'js-interpreter' library may not have modern TypeScript types.
// Using '@ts-ignore' is a common and acceptable way to handle this for older libraries.
// @ts-ignore
import Interpreter from 'js-interpreter';

@Injectable({
  providedIn: 'root'
})
export class InterpreterService {
  private gameplayService: GameplayService = inject(GameplayService);
  private blocklyWorkspaceService: BlocklyWorkspaceService = inject(BlocklyWorkspaceService);

  private interpreter: any | null = null; // The interpreter instance
  public isRunning = signal(false);

  /**
   * Initializes the interpreter with new code and the available functions for the level.
   * @param code The JavaScript code generated from Blockly.
   * @param availableBlocks The list of blocks used to determine which functions to expose.
   */
  public init(code: string, availableBlocks: string[]): void {
    this.stop(); // Stop any previous execution
    this.interpreter = new Interpreter(code, (interpreter: any, globalObject: any) => {
      this.addApiToInterpreter(interpreter, globalObject, availableBlocks);
    });
  }

  /**
   * Attaches our game's functions to the interpreter's global scope.
   * This is how blocks like "fazerTask" can call our Angular service methods.
   */
  private addApiToInterpreter(interpreter: any, globalObject: any, availableBlocks: string[]): void {
    // --- MANDATORY FUNCTION for highlighting ---
    const highlightWrapper = (blockId: string) => {
      // The interpreter runs outside Angular's zone, so we can't directly
      // interact with Blockly here. We just store the ID. A separate process will handle highlighting.
      // For now, highlighting directly is often okay.
      const id = blockId ? blockId.toString() : '';
      this.blocklyWorkspaceService.workspace?.highlightBlock(id);
    };
    interpreter.setProperty(globalObject, 'highlightBlock', interpreter.createNativeFunction(highlightWrapper));

    // --- DYNAMIC GAMEPLAY FUNCTIONS ---
    // Only add functions to the interpreter if the level uses the corresponding block.
    if (availableBlocks.includes('dev_task')) {
      console.log("Adding 'fazerTask' function to interpreter.");
      const taskWrapper = (taskId: number) => this.gameplayService.performTask(taskId);
      interpreter.setProperty(globalObject, 'fazerTask', interpreter.createNativeFunction(taskWrapper));
    }

    if (availableBlocks.includes('dev_coffee')) {
      console.log("Adding 'tomarCafe' function to interpreter.");
      const coffeeWrapper = () => this.gameplayService.drinkCoffee();
      interpreter.setProperty(globalObject, 'tomarCafe', interpreter.createNativeFunction(coffeeWrapper));
    }

    if (availableBlocks.includes('dev_stamina_check')) {
      console.log("Adding 'getStamina' function to interpreter.");
      const staminaWrapper = () => this.gameplayService.stamina();
      interpreter.setProperty(globalObject, 'getStamina', interpreter.createNativeFunction(staminaWrapper));
    }
  }

  /**
   * Starts the step-by-step execution of the loaded code.
   * @param delay The delay in milliseconds between each step.
   */
  public run(delay: number = 20): void {
    if (!this.interpreter) {
      console.error("Interpreter not initialized. Call init() before run().");
      return;
    }

    if (this.isRunning()) {
      return; // Already running
    }

    // CRITICAL: Reset the gameplay state before every run.
    this.gameplayService.resetLevelState();
    this.isRunning.set(true);
    this.gameplayService.setExecutionTime(0);
    const executeStep = () => {
      this.gameplayService.addExecutionTime(delay);
      if (!this.isRunning() || !this.interpreter) {
        return; // Execution was stopped
      }

      try {
        // Execute one step of the code
        const hasMoreCode = this.interpreter.step();
        if (hasMoreCode) {
          // If there's more code, schedule the next step
          setTimeout(executeStep, delay);
        } else {
          // Code finished executing
          console.log("Interpreter finished execution.");
          this.isRunning.set(false);
          // The GameplayService's effect will automatically detect the win/loss state.
        }
      } catch (e) {
        console.error("Error during interpreter execution:", e);
        this.isRunning.set(false);
      }
    };

    executeStep();
  }

  /**
   * Stops the current execution loop.
   */
  public stop(): void {
    this.isRunning.set(false);
    this.interpreter = null;
  }
}
