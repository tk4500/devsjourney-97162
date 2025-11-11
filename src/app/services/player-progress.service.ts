import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, query, orderBy, limit, startAfter, collectionData, DocumentData, getDocs } from '@angular/fire/firestore';
import { Auth, user, User } from '@angular/fire/auth';
import { BehaviorSubject, from, Observable, switchMap } from 'rxjs';
import { PlayerProgress, LevelProgress } from '../models/player-progress.model';
import { LevelService } from './level.service';
// Import encryption library and environment
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';
export type LeaderboardSort = 'totalScore' | 'totalStars';
export interface SaveConflict {
  local: PlayerProgress;
  cloud: PlayerProgress;
  resolve: (choice: 'local' | 'cloud') => void;
}


@Injectable({
  providedIn: 'root'
})
export class PlayerProgressService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private levelService: LevelService = inject(LevelService);

  public saveConflict = new BehaviorSubject<SaveConflict | null>(null);

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

   // --- NEW: Method to fetch leaderboard data ---
  getLeaderboard(sortBy: LeaderboardSort, pageSize: number, lastDoc?: DocumentData): Observable<PlayerProgress[]> {
    const progressCollection = collection(this.firestore, 'playerProgress');

    let q = query(
      progressCollection,
      orderBy(sortBy, 'desc'), // Sort by the chosen field, descending
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    // Use collectionData to get a reactive list of leaderboard entries
    return collectionData(q) as Observable<PlayerProgress[]>;
  }

  /**
   * Finds the rank of a specific player on the leaderboard.
   * @param userId The ID of the user to find.
   * @param sortBy The metric to sort the leaderboard by.
   * @returns The user's rank, or null if not found within the search limit.
   */
  async getPlayerRank(userId: string, sortBy: LeaderboardSort): Promise<number | null> {
    const progressCollection = collection(this.firestore, 'playerProgress');
    const PAGE_SIZE = 100; // Search in larger chunks to be faster
    let rank = 1;
    let lastDoc: DocumentData | undefined = undefined;
    const MAX_PAGES_TO_SEARCH = 10; // Stop searching after 1000 players to prevent huge reads

    for (let i = 0; i < MAX_PAGES_TO_SEARCH; i++) {
      let q = query(
        progressCollection,
        orderBy(sortBy, 'desc'),
        limit(PAGE_SIZE)
      );
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null; // Reached the end of the leaderboard
      }

      const players = querySnapshot.docs;
      for (const playerDoc of players) {
        if (playerDoc.id === userId) {
          return rank; // Found the player!
        }
        rank++;
      }

      lastDoc = players[players.length - 1];
    }

    // If the user wasn't in the top 1000, return null
    console.warn(`Player rank for ${userId} not found within the top ${PAGE_SIZE * MAX_PAGES_TO_SEARCH}.`);
    return null;
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

      if (firestoreProgress && guestProgress) {
      console.log("Conflict detected between guest and cloud progress.");
        return new Promise(resolve => {
          this.saveConflict.next({
            local: guestProgress,
            cloud: firestoreProgress,
            resolve: async (choice) => {
              this.saveConflict.next(null); // Hide the dialog
              if (choice === 'local') {
                console.log("User chose local save. Overwriting cloud...");
                const migratedProgress = { ...guestProgress, id: user.uid };
                await this.saveProgress(migratedProgress);
                localStorage.removeItem('guestProgress');
                resolve(migratedProgress);
              } else {
                console.log("User chose cloud save.");
                localStorage.removeItem('guestProgress');
                resolve(firestoreProgress);
              }
            }
          });
        });
      }

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
   * Calculates the total number of stars the player has earned across all levels.
   */
  public getTotalStars(progress: PlayerProgress | null): number {
    if (!progress?.levelData) return 0;

    return Object.values(progress.levelData).reduce((total, level) => {
      return total + (level.stars || 0);
    }, 0);
  }

    /**
   * Calculates the total score by summing up the scores from all completed levels.
   */
  public getTotalScore(progress: PlayerProgress | null): number {
    if (!progress?.levelData) return 0;

    return Object.values(progress.levelData).reduce((total, level) => {
      return total + (level.score || 0);
    }, 0);
  }

  /**
   * Gets a sorted list of the player's top scores.
   * @param count The number of top scores to return.
   */
  public getTopScores(progress: PlayerProgress | null, count: number): { levelName: string, score: number }[] {
    if (!progress?.levelData) return [];

    // This is a bit more complex as we need the level names.
    // For now, we will return a simpler version. A full version would need to join with LevelService data.
    return Object.entries(progress.levelData)
      .map(([levelId, levelProgress]) => ({
        levelName: `Level ${levelId.substring(6)}`, // Simple name for now
        score: levelProgress.score || 0
      }))
      .sort((a, b) => b.score - a.score) // Sort descending
      .slice(0, count);
  }

  /**
   * Requirement #6: A central method to save progress.
   * Intelligently saves to Firestore (if logged in) or encrypted localStorage (if guest).
   */
  async saveProgress(progress: PlayerProgress): Promise<void> {

    const totalScore = this.getTotalScore(progress);
    const totalStars = this.getTotalStars(progress);
    progress.totalScore = totalScore;
    progress.totalStars = totalStars;
    console.log("Saving progress to localStorage...");
    this.saveGuestProgress(progress);
    const currentUser = this.auth.currentUser;

    if (currentUser) {
      console.log("Saving progress to Firestore...");
      const progressDocRef = doc(this.firestore, `playerProgress/${currentUser.uid}`);
      await setDoc(progressDocRef, progress); // Use setDoc to overwrite the whole document, ensuring consistency.
    }
    // Keep the local BehaviorSubject in sync with the saved data.
    this.progressSubject.next(progress);
  }

  /**
   * A high-level method to be called when a level is successfully completed.
   */
  async completeLevel(levelId: string, starsEarned: 0 | 1 | 2 | 3, score: number): Promise<void> {
    const currentProgress = this.currentProgress;
    if (!currentProgress) return;

    const completedLevel = await this.levelService.getLevelById(levelId);
    if (!completedLevel) return;
    const existingScore = currentProgress.levelData[levelId]?.score || 0;
    const newScore = Math.max(score, existingScore);
    const existingStars = currentProgress.levelData[levelId]?.stars || 0;
    const newStars = Math.max(starsEarned, existingStars) as 0 | 1 | 2 | 3;
    // Update the progress for the level that was just completed
    const newLevelData: LevelProgress = {
      completed: true,
      stars: newStars,
      score: newScore
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
        displayName: user?.displayName || 'Guest',
        photoURL: user?.photoURL || '',
        totalScore: 0,
        totalStars: 0,
        unlockedLevels: [],
        levelData: {}
      };
    }

    const initialProgress: PlayerProgress = {
      id: user?.uid || 'guest', // Req #2: Use 'guest' as ID if no user.
      displayName: user?.displayName || 'Guest',
      photoURL: user?.photoURL || '',
      totalScore: 0,
      totalStars: 0,
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
