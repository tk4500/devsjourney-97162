import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { TutorialStep } from '../models/tutorial.model';
import { CacheService } from './cache.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private firestore: Firestore = inject(Firestore);
  private cacheService: CacheService = inject(CacheService);

  // --- Live State Signals ---
  public currentStep = signal<TutorialStep | null>(null);
  public isTutorialActive = signal<boolean>(false);

  // --- Event Bus for Triggers ---
  // Components can emit events here, and the service will listen.
  public tutorialEvents$ = new Subject<string>();

  private steps: TutorialStep[] = [];
  public currentStepIndex = 0;

  constructor() {
    // Listen for events that can advance the tutorial
    this.tutorialEvents$.subscribe(eventName => {
      const step = this.currentStep();
      if (this.isTutorialActive() && step && step.nextOn === eventName) {
        console.log(`[TutorialService] Event '${eventName}' matched. Advancing tutorial.`);
        this.nextStep();
      }
    });
  }

  public skipTutorial(): void {
    console.log("[TutorialService] Tutorial skipped.");
    this.endTutorial();
  }

  async loadTutorialForLevel(levelId: string): Promise<void> {
    const cacheKey = `tutorial_${levelId}`;
    let tutorialData = this.cacheService.getItem<{ steps: TutorialStep[] }>(cacheKey);

    if (!tutorialData) {
      const tutorialDocRef = doc(this.firestore, `tutorials/${levelId}`);
      const docSnap = await getDoc(tutorialDocRef);
      if (docSnap.exists()) {
        tutorialData = docSnap.data() as { steps: TutorialStep[] };
        this.cacheService.setItem(cacheKey, tutorialData);
      }
    }

    this.steps = tutorialData?.steps || [];
    if (this.steps.length > 0) {
      this.currentStepIndex = 0;
      this.currentStep.set(this.steps[this.currentStepIndex]);
      this.isTutorialActive.set(true);
    } else {
      this.endTutorial(); // No tutorial for this level
    }
  }

  public nextStep(): void {
    if (this.isTutorialActive() && this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.currentStep.set(this.steps[this.currentStepIndex]);
    } else {
      this.endTutorial();
    }
  }

  public previousStep(): void {
    if (this.isTutorialActive() && this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.currentStep.set(this.steps[this.currentStepIndex]);
    }
  }

  public endTutorial(): void {
    this.isTutorialActive.set(false);
    this.currentStep.set(null);
    this.steps = [];
    this.currentStepIndex = 0;
  }
}
