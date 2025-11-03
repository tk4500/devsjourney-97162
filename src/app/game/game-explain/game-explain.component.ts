import { Component, computed, effect, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExplainService } from './explain.service';

@Component({
  selector: 'app-game-explain',
  imports: [],
  templateUrl: './game-explain.component.html',
  styleUrl: './game-explain.component.css'
})
export class GameExplainComponent implements OnDestroy {
  isFoward: boolean = false;
  isBack: boolean = false;
  base: Explain = {
    isExplanation: false,
    isHidden: true,
    explanation: '',
    sergioImage: 'SergioNeutro.png',
    isSergio: false,
    sergioX: 0,
    sergioY: 0,
    explanationX: 0,
    explanationY: 0,
  };
  levelExplain: Explain[] = [];
  currentPosition: number = 0;
  constructor(public service: ExplainService, private route: ActivatedRoute) {}
  private actionEffect = effect(() => {
    const id = computed(() => this.service.id());
    if (id()) {
      this.startLevel(id());
    }
  });
  ngOnDestroy() {
    this.actionEffect.destroy();
  }

  startLevel(arg0: number) {
    console.log('Starting level:', arg0);
    this.service.getExplain(arg0).subscribe((data: Explain[]) => {
      this.levelExplain = data;
      if (this.levelExplain.length > 0) {
        this.base = this.levelExplain[0];
        this.isBack = false;
        this.isFoward = true;
        this.currentPosition = 0;
        for (let i = 1; i < this.levelExplain.length; i++) {
          const previous = this.levelExplain[i - 1];
          this.levelExplain[i].isExplanation =
            this.levelExplain[i].isExplanation ?? previous.isExplanation;
          this.levelExplain[i].isHidden =
            this.levelExplain[i].isHidden ?? previous.isHidden;
          this.levelExplain[i].sergioImage =
            this.levelExplain[i].sergioImage ?? previous.sergioImage;
          this.levelExplain[i].isSergio =
            this.levelExplain[i].isSergio ?? previous.isSergio;
          this.levelExplain[i].sergioX =
            this.levelExplain[i].sergioX ?? previous.sergioX;
          this.levelExplain[i].sergioY =
            this.levelExplain[i].sergioY ?? previous.sergioY;
          this.levelExplain[i].explanationX =
            this.levelExplain[i].explanationX ?? previous.explanationX;
          this.levelExplain[i].explanationY =
            this.levelExplain[i].explanationY ?? previous.explanationY;
          this.levelExplain[i].sergioMirror =
            this.levelExplain[i].sergioMirror ?? previous.sergioMirror;
          this.levelExplain[i].isOver =
            this.levelExplain[i].isOver ?? previous.isOver;
          this.levelExplain[i].isRun =
            this.levelExplain[i].isRun ?? previous.isRun;
          this.levelExplain[i].isTask =
            this.levelExplain[i].isTask ?? previous.isTask;
        }
      } else {
        console.error('No explanations found for level:', arg0);
      }
      console.log('Level explanations:', this.levelExplain);
    });
  }

  next() {
    if (this.levelExplain.length > 0) {
      this.currentPosition++;
      if (this.currentPosition >= this.levelExplain.length) {
        this.isFoward = false;
        this.isBack = false;
        this.base = {
          isExplanation: false,
          isHidden: true,
          explanation: '',
          sergioImage: 'SergioNeutro.png',
          isSergio: false,
          sergioX: 0,
          sergioY: 0,
          explanationX: 0,
          explanationY: 0,
        };
        this.levelExplain = [];
      } else {
        this.isBack = true;
        this.base = this.levelExplain[this.currentPosition];
      }
    }
    this.service.run = this.base.isRun ?? false;
    this.service.task = this.base.isTask ?? false;
  }
  back() {
    if(this.currentPosition > 0) {
    if (this.levelExplain.length > 0) {
      this.currentPosition--;
      this.base = this.levelExplain[this.currentPosition];
      if (this.currentPosition <= 0) {
        this.isBack = false;
      }
    }
    this.service.run = this.base.isRun ?? false;
    this.service.task = this.base.isTask ?? false;
  }
  }
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'd') {
      this.next();
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
      this.back();
    }
  }
}
export interface Explain {
  isExplanation?: boolean;
  isHidden?: boolean;
  explanation: string;
  sergioImage?: string;
  isSergio?: boolean;
  sergioX?: number;
  sergioY?: number;
  explanationX?: number;
  explanationY?: number;
  sergioMirror?: boolean;
  isOver?: boolean;
  isRun?: boolean;
  isTask?: boolean;
}
