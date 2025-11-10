import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth, user, User } from '@angular/fire/auth';
import { BehaviorSubject, from, switchMap } from 'rxjs';
import { PlayerProgress, LevelProgress } from '../models/player-progress.model';
import { LevelService } from './level.service';
// Import encryption library and environment
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerProgressService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private levelService: LevelService = inject(LevelService);

  private progressSubject = new BehaviorSubject<PlayerProgress | null>(null);
  public progress$ = this.progressSubject.asObservable();

  // A simple getter to access the current value synchronously if needed.
  public get currentProgress(): PlayerProgress | null {
    return this.progressSubject.value;
  }

  constructor() {
    // This reactive stream is the heart of the service.
    // It triggers on any change in the user's login state.
    user(this.auth).pipe(
      switchMap(user => from(this.handleAuthChange(user)))
    ).subscribe(progress => {
      this.progressSubject.next(progress);
    });
  }

  /**
   * Orchestrates data loading and migration when the user logs in, logs out, or the app first loads.
   * This implements your requirements #1, #3, and #4.
   */
  private async handleAuthChange(user: User | null): Promise<PlayerProgress | null> {
    const guestProgress = this.getGuestProgress();

    if (user) {
      // --- USER IS LOGGED IN ---
      const firestoreProgress = await this.fetchFirestoreProgress(user);

      if (firestoreProgress) {
        // Requirement #4: Firestore data exists. It is the source of truth.
        console.log("Logged in. Loading progress from Firestore.");
        localStorage.removeItem('guestProgress'); // Clean up any old guest data.
        return firestoreProgress;
      } else if (guestProgress) {
        // Requirement #3: No Firestore data, but guest data exists. Migrate it.
        console.log("New user logged in. Migrating guest progress to Firestore account...");
        const migratedProgress: PlayerProgress = {
          ...guestProgress,
          id: user.uid // Update the ID to the real user ID.
        };
        await this.saveProgress(migratedProgress); // This will save to Firestore.
        localStorage.removeItem('guestProgress'); // Clean up after migration.
        return migratedProgress;
      } else {
        // Requirement #1 (for new users): No data anywhere. Create a fresh start.
        console.log("New user with no local data. Creating initial progress in Firestore.");
        return this.createInitialProgress(user);
      }
    } else {
      // --- USER IS A GUEST ---
      if (guestProgress) {
        // Guest has existing local data. Load it.
        console.log("Guest session. Loading progress from localStorage.");
        return guestProgress;
      } else {
        // Requirement #1 (for new guests): No local data. Create a fresh start.
        console.log("New guest session. Creating initial progress in localStorage.");
        return this.createInitialProgress(null);
      }
    }
  }

  /**
   * Requirement #6: A central method to save progress.
   * Intelligently saves to Firestore (if logged in) or encrypted localStorage (if guest).
   */
  async saveProgress(progress: PlayerProgress): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (currentUser) {
      console.log("Saving progress to Firestore...");
      const progressDocRef = doc(this.firestore, `playerProgress/${currentUser.uid}`);
      await setDoc(progressDocRef, progress); // Use setDoc to overwrite the whole document, ensuring consistency.
    } else {
      console.log("Saving progress to localStorage...");
      this.saveGuestProgress(progress);
    }
    // Keep the local BehaviorSubject in sync with the saved data.
    this.progressSubject.next(progress);
  }

  /**
   * A high-level method to be called when a level is successfully completed.
   */
  async completeLevel(levelId: string, starsEarned: 0 | 1 | 2 | 3): Promise<void> {
    const currentProgress = this.currentProgress;
    if (!currentProgress) return;

    const completedLevel = await this.levelService.getLevelById(levelId);
    if (!completedLevel) return;

    // Update the progress for the level that was just completed
    const newLevelData: LevelProgress = {
      completed: true,
      stars: starsEarned
      // You could add score, time, etc. here
    };

    // Unlock the next level if it exists
    const nextLevel = await this.levelService.getLevelByOrderId(completedLevel.orderId + 1);
    const newUnlockedLevels = [...currentProgress.unlockedLevels];
    if (nextLevel && !newUnlockedLevels.includes(nextLevel.id)) {
      newUnlockedLevels.push(nextLevel.id);
    }

    // Create the new, updated progress object
    const updatedProgress: PlayerProgress = {
      ...currentProgress,
      unlockedLevels: newUnlockedLevels,
      levelData: {
        ...currentProgress.levelData,
        [levelId]: newLevelData
      }
    };

    await this.saveProgress(updatedProgress);
  }


  // --- Private Helper & Encryption Methods ---

  private async fetchFirestoreProgress(user: User): Promise<PlayerProgress | null> {
    const progressDocRef = doc(this.firestore, `playerProgress/${user.uid}`);
    const docSnap = await getDoc(progressDocRef);
    return docSnap.exists() ? (docSnap.data() as PlayerProgress) : null;
  }

  /**
   * Creates the very first progress object for a new user or guest.
   * Requirement #1 & #2 are handled here.
   */
  private async createInitialProgress(user: User | null): Promise<PlayerProgress> {
    const firstLevel = await this.levelService.getFirstLevel();
    if (!firstLevel) {
      console.error("CRITICAL: Could not find level with orderId: 1 to create initial progress!");
      // Return a failsafe object to prevent the app from crashing.
      return {
        id: user?.uid || 'guest',
        unlockedLevels: [],
        levelData: {}
      };
    }

    const initialProgress: PlayerProgress = {
      id: user?.uid || 'guest', // Req #2: Use 'guest' as ID if no user.
      unlockedLevels: [firstLevel.id],
      levelData: {}
    };

    // Save this initial state immediately so it's persisted.
    await this.saveProgress(initialProgress);
    return initialProgress;
  }

  /**
   * Requirement #5: Saves guest progress to localStorage in an encrypted format.
   */
  private saveGuestProgress(progress: PlayerProgress): void {
    const progressString = JSON.stringify(progress);
    const encryptedData = CryptoJS.AES.encrypt(progressString, environment.encryptionKey).toString();
    localStorage.setItem('guestProgress', encryptedData);
  }

  /**
   * Requirement #5: Retrieves and decrypts guest progress from localStorage.
   */
  private getGuestProgress(): PlayerProgress | null {
    const encryptedData = localStorage.getItem('guestProgress');
    if (!encryptedData) return null;

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, environment.encryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedData) { // Decryption can result in an empty string if key is wrong
        throw new Error("Decryption resulted in empty string.");
      }
      return JSON.parse(decryptedData);
    } catch (e) {
      console.error("Failed to decrypt local progress, it might be corrupted. Clearing it.", e);
      localStorage.removeItem('guestProgress');
      return null;
    }
  }
}
