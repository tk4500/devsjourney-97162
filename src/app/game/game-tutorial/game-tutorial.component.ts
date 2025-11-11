import { Component, inject, effect, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorialService } from '../../services/tutorial.service';

@Component({
  selector: 'app-game-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-tutorial.component.html',
  styleUrls: ['./game-tutorial.component.css'],
})
export class GameTutorialComponent implements OnDestroy{
  // We make the service public so the template can directly access its signals.
  // This is a clean pattern for presentational components.
  public tutorialService: TutorialService = inject(TutorialService);
 private animationFrameId: number | null = null;
  constructor() {
    // This effect will run whenever the current tutorial step changes.
    effect(() => {
      const step = this.tutorialService.currentStep();
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      // Use requestAnimationFrame to safely interact with the DOM
      this.animationFrameId = requestAnimationFrame(() => {
        this.updateHighlight(step?.highlightElementId);
      });
    });
  }

  updateHighlight(highlightId: string | undefined): void {
    const highlightBox = document.getElementById('highlight-box-dynamic') as HTMLElement;
    if (!highlightBox) return;

    if (highlightId) {
      const targetElement = document.getElementById(highlightId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        highlightBox.style.display = 'block';
        highlightBox.style.top = `${rect.top}px`;
        highlightBox.style.left = `${rect.left}px`;
        highlightBox.style.width = `${rect.width}px`;
        highlightBox.style.height = `${rect.height}px`;
      } else {
        highlightBox.style.display = 'none';
      }
    } else {
      highlightBox.style.display = 'none';
    }
  }

@HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.tutorialService.isTutorialActive()) return;
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.back();
  }

  next(): void {
    this.tutorialService.nextStep();
  }

  back(): void {
    this.tutorialService.previousStep();
  }

  skip(): void {
    this.tutorialService.skipTutorial();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }


}
