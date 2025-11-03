import { Component, computed, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { BlocklyService } from '../game-blockly/blockly.service';
import { CommonModule } from '@angular/common';
import { javascriptGenerator } from 'blockly/javascript';
import * as Blockly from 'blockly/core';
import { ToastModule } from 'primeng/toast';
import { InterpreterService } from './interpreter.service';
import { ExplainService } from '../game-explain/explain.service';

@Component({
  selector: 'app-game-status',
  imports: [Button, CommonModule, ProgressBar, ToastModule],
  templateUrl: './game-status.component.html',
  styleUrl: './game-status.component.css'
})
export class GameStatusComponent{
    imagem = computed(()=> this.blocklyservice.image());
    public blocklyservice = inject(BlocklyService);
    constructor(private interpreter: InterpreterService,public explain: ExplainService) {

    }

  nextLvl(){
    this.blocklyservice.nextLevel();
  }
  run() {
    const code = javascriptGenerator.workspaceToCode(
      Blockly.getMainWorkspace()
    );
    this.interpreter.init(code);
    this.interpreter.run();
  }
  pause() {
    this.interpreter.pause();
  }

  step() {
    this.interpreter.step();
  }

  reset() {
    this.interpreter.reset();
  }
}
