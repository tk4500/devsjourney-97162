import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth, user, User } from '@angular/fire/auth';
import { Observable, BehaviorSubject, switchMap, of, take, from } from 'rxjs';
import { PlayerProgress } from '../models/player-progress.model';
import { LevelService } from './level.service'; // <-- Import LevelService

// Import encryption library
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
  constructor() {
    user(this.auth).pipe(
      switchMap(user => from(this.handleAuthChange(user)))
    ).subscribe(progress => {
      this.progressSubject.next(progress);
    });
   }
   public get currentProgress(): PlayerProgress | null {
    return this.progressSubject.value;
  }
private async handleAuthChange(user: User | null): Promise<PlayerProgress | null> {
  const guestProgress = this.getGuestProgress();
  if (user) {
    const firestoreProgress = await this.fetchFirestoreProgress(user);
     if (firestoreProgress) {
      localStorage.removeItem('guestProgress');
      return firestoreProgress;
    } else if (guestProgress) {
      console.log("Migrating guest progress to new user account...");
      const migratedProgress: PlayerProgress = {
        ...guestProgress,
          id: user.uid
        };
        await this.saveProgress(migratedProgress);
        localStorage.removeItem('guestProgress');
        return migratedProgress;
        } else {
          return this.createInitialProgress(user);
           }
           } else {
            if (guestProgress) {
        return guestProgress;
      } else {
        return this.createInitialProgress(null);
      }
    }

}

async saveProgress(progress: PlayerProgress): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      const progressDocRef = doc(this.firestore, `playerProgress/${currentUser.uid}`);
      await setDoc(progressDocRef, progress, { merge: true });
    } else {
      this.saveGuestProgress(progress);
    }
    this.progressSubject.next(progress);
  }

  async unlockLevel(levelId: string): Promise<void> {
    const currentProgress = this.progressSubject.value;
    if (!currentProgress || currentProgress.unlockedLevels.includes(levelId)) {
      return;
    }

    const newProgress: PlayerProgress = {
      ...currentProgress,
      unlockedLevels: [...currentProgress.unlockedLevels, levelId]
    };

    await this.saveProgress(newProgress);
  }

  private async fetchFirestoreProgress(user: User): Promise<PlayerProgress | null> {
    const progressDocRef = doc(this.firestore, `playerProgress/${user.uid}`);
    const docSnap = await getDoc(progressDocRef);
    return docSnap.exists() ? (docSnap.data() as PlayerProgress) : null;
  }

  private async createInitialProgress(user: User | null): Promise<PlayerProgress> {
    const firstLevel = await this.levelService.getFirstLevel();
    if (!firstLevel) {
      console.error("Could not find the first level to create initial progress!");
      return {
        id: user?.uid || 'guest',
        unlockedLevels: [],
        levelData: {}
      };
    }
    const initialProgress: PlayerProgress = {
      id: user?.uid || 'guest', // Req 2: Use 'guest' ID if not logged in
      unlockedLevels: [firstLevel.id],
      levelData: {}
    };

    // Save this initial progress immediately
    await this.saveProgress(initialProgress);
    return initialProgress;
  }

  private saveGuestProgress(progress: PlayerProgress): void {
    const progressString = JSON.stringify(progress);
    const encryptedData = CryptoJS.AES.encrypt(progressString, environment.encryptionKey).toString();
    localStorage.setItem('guestProgress', encryptedData);
  }
  private getGuestProgress(): PlayerProgress | null {
    const encryptedData = localStorage.getItem('guestProgress');
    if (!encryptedData) {
      return null;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, environment.encryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    } catch (e) {
      console.error("Failed to decrypt local progress. Clearing it.", e);
      localStorage.removeItem('guestProgress');
      return null;
    }
  }

}
