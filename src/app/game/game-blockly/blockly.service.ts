import { Injectable, signal } from '@angular/core';
import { javascriptGenerator } from 'blockly/javascript';
import * as Blockly from 'blockly/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BlocklyService {
  workspace: Blockly.WorkspaceSvg | null = null;
  image = signal<string>('JuniorAnimatedNormal.gif');
  level = signal<number>(1);
  task_focus: number = 0;
  task: Task[] = [];
  stamina: number = 100;
  focus: number = 0;
  time: number = 0;
  isStamina: boolean = false;
  isFocus: boolean = false;
  isTime: boolean = false;
  won: boolean = false;
  getLevel(): number {
    return this.level();
  }

  constructor(private router: Router) {}
  resetGame() {
    this.stamina = 100;
    this.focus = 0;
    this.time = 0;
    this.getTaskByLevel(this.getLevel());
  }
  updateLevel(lvl: number) {
    console.log('Updating level to:', lvl);
    this.level.set(lvl);
  }
  gameOver() {
    console.log('Game Over');
    this.resetGame();
  }
  nextLevel() {
    let currentLevel: number = this.getLevel();
    currentLevel++;
    this.level.set(currentLevel);
    this.router.navigate(['/gameroute', this.getLevel()]);
  }
  changeImg(img: string) {
    this.image.set(img);
  }
  getImg(): string {
    return this.image();
  }

  changeStamina(amount: number) {
    this.stamina += amount;
    if (this.stamina < 0) {
      this.stamina = 0;
      this.gameOver();
    } else if (this.stamina > 100) {
      this.stamina = 100;
    }
    console.log('Stamina changed:', this.stamina);
    if (this.getImg() === 'JuniorAnimatedCoffee.gif') {
      setTimeout(() => {
        if (this.stamina < 20) {
          this.changeImg('JuniorAnimatedTired.gif');
        } else {
          this.changeImg('JuniorAnimatedNormal.gif');
        }
      }, 1000);
    } else {
      if (this.stamina < 20) {
        this.changeImg('JuniorAnimatedTired.gif');
      } else {
        this.changeImg('JuniorAnimatedNormal.gif');
      }
    }
  }

  fazerTask(task_id: number) {
    console.log(`Fazendo task: ${task_id}`);
    this.task.forEach((task) => {
      if (task.id == task_id) {
        console.log(`Task found: ${task.name}`);
        if(this.isFocus){
          if(this.task_focus == task_id){
            task.conclusion += 10 + this.focus;
            this.focus += 10;
          }else{
            this.focus == 10;
            this.task_focus = task_id;
            task.conclusion += 10;
          }
        }else{
          task.conclusion += 10;
        }
        if(this.isStamina){
          this.changeStamina(-10);
        }
        if (task.conclusion >= 100) {
          task.conclusion = 100;
          console.log(`Task ${task.name} completed!`);
          this.task_focus = 0;
          if (this.task.every(t => t.conclusion >= 100)) {
            this.won = true;
            console.log('All tasks completed! You won!');
          }
        }
      }
    });
  }

  tomarCafe() {
    this.changeImg('JuniorAnimatedCoffee.gif');
    this.focus = 0;
    this.changeStamina(20);
  }

  getStamina(): number {
    return this.stamina;
  }
  getTime(): number {
    return this.time;
  }
  getFocus(): number {
    return this.focus;
  }

  getContentByLevel(level: number): contents[] {
    const contents: contents[] = [];
    if (level >= 1) {
      contents.push({
        kind: 'block',
        type: 'dev_task',
      });
    }
    if (level >= 2) {
      contents.push({
        kind: 'block',
        type: 'controls_repeat',
      });
    }
    if (level >= 3) {
      contents.push({
        kind: 'block',
        type: 'dev_coffee',
      });
    }
    if (level >= 4) {
      contents.push({
        kind: 'block',
        type: 'controls_if',
      });
    }
    if (level >= 4) {
      contents.push({
        kind: 'block',
        type: 'dev_stamina_check',
      });
    }

    this.isTime = level >= 9;
    this.isStamina = level >= 3;
    this.isFocus = level >= 6;

    this.getTaskByLevel(level);

    return contents;
  }

  getTask(): Task[] {
    return this.task;
  }

  getTaskByLevel(level: number) {
    console.log('Getting tasks for level:', level);
    this.task = [];
    this.task.push({ id: level, name: `Task ${level}`, conclusion: 0 });
    if (level == 1){
      this.task[0].conclusion = 70;
    }
    if (level >= 6) {
      this.task.push({
        id: level - 1,
        name: `Task ${level - 1}`,
        conclusion: 0,
      });
    }
    if (level >= 10) {
      this.task.push({
        id: level - 2,
        name: `Task ${level - 2}`,
        conclusion: 0,
      });
    }
  }
}

export interface contents {
  kind: string;
  type: string;
}

export interface Task {
  id: number;
  name: string;
  conclusion: number;
}
