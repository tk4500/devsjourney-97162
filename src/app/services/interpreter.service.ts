import { Injectable, inject, signal } from '@angular/core';
import { GameplayService } from './gameplay.service'; // <-- Use the new service
import { BlocklyWorkspaceService } from './blockly-workspace.service'; // <-- Use the new service
//@ts-ignore
import Interpreter from 'js-interpreter';

@Injectable({
  providedIn: 'root'
})
export class InterpreterService {
  private gameplayService: GameplayService = inject(GameplayService);
  private blocklyService: BlocklyWorkspaceService = inject(BlocklyWorkspaceService);

  private interpreter?: Interpreter;
  isRunning = signal(false);

  init(code: string, availableBlocks: string[]): void {
    this.interpreter = new Interpreter(code, (interpreter: Interpreter, globalObject: any) => {
      this.addCustomFunctions(interpreter, globalObject, availableBlocks);
    });
  }

  private addCustomFunctions(interpreter: Interpreter, globalObject: any, availableBlocks: string[]) {
    interpreter.setProperty(globalObject, 'highlightBlock',
      interpreter.createNativeFunction((blockId: string) => {
        this.blocklyService.workspace?.highlightBlock(blockId);
      })
    );
    if (availableBlocks.includes('dev_task')) {
      interpreter.setProperty(globalObject, 'fazerTask',
        interpreter.createNativeFunction((taskId: number) => this.gameplayService.performTask(taskId))
      );
    }
    if (availableBlocks.includes('dev_coffee')) {
      interpreter.setProperty(globalObject, 'tomarCafe',
        interpreter.createNativeFunction(() => this.gameplayService.drinkCoffee())
      );
    }
    if (availableBlocks.includes('dev_stamina_check')) {
       interpreter.setProperty(globalObject, 'getStamina',
        interpreter.createNativeFunction(() => this.gameplayService.stamina())
      );
    }
  }

  run(delay = 100): void {
    if (!this.interpreter) throw new Error('Interpreter not initialized');
    this.isRunning.set(true);
    this.gameplayService.resetLevel();

    const runner = () => {
      if (this.isRunning() && this.interpreter?.step()) {
        setTimeout(runner, delay);
      } else {
        this.isRunning.set(false);
      }
    };
    runner();
  }

  stop(): void {
    this.isRunning.set(false);
  }
}
