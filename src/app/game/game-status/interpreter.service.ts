import { BlocklyService } from '../game-blockly/blockly.service';
import { Injectable, signal } from '@angular/core';
//@ts-ignore
import Interpreter from 'js-interpreter';
@Injectable({
  providedIn: 'root',
})
export class InterpreterService {
  constructor(private blocklyService: BlocklyService) {}
  private interpreter?: Interpreter;
  private runner?: any;
  isRunning = signal(false);
  currentStep = signal(0);

  init(code: string): void {
    this.currentStep.set(0);
    this.isRunning.set(false);
    this.interpreter = new Interpreter(
      code,
      (interpreter: Interpreter, globalObject: Interpreter.NativeObject) => {
        this.addCustomFunctions(interpreter, globalObject);
      }
    );
  }
  addCustomFunctions(
    interpreter: Interpreter,
    globalObject: Interpreter.NativeObject
  ) {
    interpreter.setProperty(
      globalObject,
      'getStamina',
      interpreter.createNativeFunction(() => {
        return this.blocklyService.stamina;
      })
    );
    interpreter.setProperty(
      globalObject,
      'fazerTask',
      interpreter.createNativeFunction((task: number) => {
        this.blocklyService.fazerTask(task);
      })
    );
    interpreter.setProperty(
      globalObject,
      'tomarCafe',
      interpreter.createNativeFunction(() => {
        this.blocklyService.tomarCafe();
      })
    );
    interpreter.setProperty(
      globalObject,
      'highlightBlock',
      interpreter.createNativeFunction((blockId: Interpreter.Primitive) => {
        const id = blockId.toString();
        this.blocklyService.workspace!.highlightBlock(id);
      })
    );
  }

  step() {
    if (!this.interpreter) {
      throw new Error('Interpreter not initialized');
    }
    const ok = this.interpreter.step();
    this.currentStep.update((v) => v + 1);
    if (!ok) {
      this.isRunning.set(false);
    }
    return ok;
  }

  run(delay = 20) {
    if (!this.interpreter) {
      throw new Error('Interpreter not initialized');
    }

    this.isRunning.set(true);

    const runner = () => {
      if (this.isRunning() && this.step()) {
        setTimeout(runner, delay);
      } else {
        this.isRunning.set(false);
      }
    };
    this.blocklyService.won = false;
    this.blocklyService.resetGame();
    runner();
  }
  pause() {
    this.isRunning.set(false);
  }
  reset() {
    this.interpreter = undefined;
    this.runner = undefined;
    this.isRunning.set(false);
    this.currentStep.set(0);
  }
}
