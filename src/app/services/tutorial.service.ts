import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { TutorialStep } from '../models/tutorial.model';
import { CacheService } from './cache.service'; // We'll create this next

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private firestore: Firestore = inject(Firestore);
  private cacheService: CacheService = inject(CacheService);

  // Live state of the tutorial
  currentSteps = signal<TutorialStep[]>([]);
  currentStepIndex = signal<number>(0);
  isTutorialActive = signal<boolean>(false);

  async loadTutorialForLevel(levelId: string): Promise<void> {
    const cacheKey = `tutorial_${levelId}`;
    let steps = this.cacheService.getItem<TutorialStep[]>(cacheKey);

    if (!steps) {
      console.log(`Fetching tutorial for level ${levelId} from Firestore...`);
      const tutorialDocRef = doc(this.firestore, `tutorials/${levelId}`);
      // Using a Promise-based approach for one-time fetch
      const docSnap = await docData(tutorialDocRef).toPromise();
      steps = (docSnap as { steps: TutorialStep[] })?.steps || [];
      this.cacheService.setItem(cacheKey, steps);
    }

    if (steps.length > 0) {
      this.currentSteps.set(steps);
      this.currentStepIndex.set(0);
      this.isTutorialActive.set(true);
    } else {
      this.endTutorial();
    }
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.currentSteps().length - 1) {
      this.currentStepIndex.update(i => i + 1);
    } else {
      this.endTutorial();
    }
  }

  endTutorial(): void {
    this.isTutorialActive.set(false);
    this.currentSteps.set([]);
    this.currentStepIndex.set(0);
  }
}
