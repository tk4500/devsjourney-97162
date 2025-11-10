import { Component, inject, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorialService } from '../../services/tutorial.service';

@Component({
  selector: 'app-game-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-tutorial.component.html',
  styleUrls: ['./game-tutorial.component.css'],
})
export class GameTutorialComponent {
  // We make the service public so the template can directly access its signals.
  // This is a clean pattern for presentational components.
  public tutorialService: TutorialService = inject(TutorialService);

  constructor() {
    // This effect will run whenever the current tutorial step changes.
    effect(() => {
      const step = this.tutorialService.currentStep();
      const highlightId = step?.highlightElementId;

      const top = document.getElementById('overlay-top') as HTMLElement;
      const bottom = document.getElementById('overlay-bottom') as HTMLElement;
      const left = document.getElementById('overlay-left') as HTMLElement;
      const right = document.getElementById('overlay-right') as HTMLElement;
      const highlightBox = document.getElementById(
        'highlight-box-dynamic'
      ) as HTMLElement;

      if (!top || !bottom || !left || !right || !highlightBox) return;

      if (highlightId) {
        const targetElement = document.getElementById(highlightId);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();

          // Position the overlay panels AROUND the target element
          top.style.height = `${rect.top}px`;
          top.style.width = '100vw';

          bottom.style.top = `${rect.bottom}px`;
          bottom.style.height = `calc(100vh - ${rect.bottom}px)`;
          bottom.style.width = '100vw';

          left.style.top = `${rect.top}px`;
          left.style.height = `${rect.height}px`;
          left.style.width = `${rect.left}px`;

          right.style.top = `${rect.top}px`;
          right.style.left = `${rect.right}px`;
          right.style.height = `${rect.height}px`;
          right.style.width = `calc(100vw - ${rect.right}px)`;

          // Position the highlight box ON TOP of the target element
          highlightBox.style.top = `${rect.top}px`;
          highlightBox.style.left = `${rect.left}px`;
          highlightBox.style.width = `${rect.width}px`;
          highlightBox.style.height = `${rect.height}px`;
        }
      } else {
        // If no element is highlighted, make the top panel cover everything.
        top.style.height = '100vh';
        top.style.width = '100vw';
        bottom.style.height = '0';
        left.style.height = '0';
        right.style.height = '0';
        highlightBox.style.display = 'none';
      }
    });
  }
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.tutorialService.isTutorialActive()) return;

    if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.back();
    }
  }

  next(): void {
    const step = this.tutorialService.currentStep();
    // Only allow manual next if it's a click-based step
    if (!step?.nextOn || step.nextOn === 'click') {
      this.tutorialService.nextStep();
    }
  }

  back(): void {
    this.tutorialService.previousStep(); // We need to add this method to the service
  }

  onOverlayClick(): void {
    this.next(); // The overlay click now just calls the next() method
  }


}
