import { inject, Injectable } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore, getDoc, limit, orderBy, query, startAfter, where } from '@angular/fire/firestore';
import { Level } from '../models/level.model';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class LevelService {
  private firestore: Firestore = inject(Firestore);
  private cacheService: CacheService = inject(CacheService);

  // This state is for navigating from LevelSelect -> Game screen.
  public selectedLevelSubject = new BehaviorSubject<Level | null>(null);
  public selectedLevel$ = this.selectedLevelSubject.asObservable();

  public selectLevel(level: Level): void {
    this.selectedLevelSubject.next(level);
  }

  /**
   * Fetches a single level by its Firestore Document ID.
   * Uses session cache to avoid repeated Firestore reads.
   */
  async getLevelById(id: string): Promise<Level | null> {
    const cacheKey = `level_${id}`;
    const cachedLevel = this.cacheService.getItem<Level>(cacheKey);
    if (cachedLevel) {
      console.log(`Level ${id} loaded from cache.`);
      return cachedLevel;
    }

    console.log(`Fetching level ${id} from Firestore...`);
    const levelDocRef = doc(this.firestore, `levels/${id}`);
    const docSnap = await getDoc(levelDocRef);

    if (docSnap.exists()) {
      const levelData = { id: docSnap.id, ...docSnap.data() } as Level;
      this.cacheService.setItem(cacheKey, levelData);
      return levelData;
    } else {
      console.error(`Level with id ${id} not found.`);
      return null;
    }
  }

  /**
   * Fetches a single level by its 'orderId' field.
   * Useful for finding the "next" level.
   */
  async getLevelByOrderId(orderId: number): Promise<Level | null> {
    const levelsCollection = collection(this.firestore, 'levels');
    const q = query(
      levelsCollection,
      where('orderId', '==', orderId),
      limit(1)
    );

    const levels$ = collectionData(q, { idField: 'id' }) as Observable<Level[]>;
    const levels = await firstValueFrom(levels$);
    return levels.length > 0 ? levels[0] : null;
  }

  /**
   * Fetches the very first tutorial level (orderId: 1).
   * Needed for initializing new player progress.
   */
  async getFirstLevel(): Promise<Level | null> {
    return this.getLevelByOrderId(1);
  }

  /**
   * Fetches a paginated set of tutorial levels for the LevelSelect screen.
   * This does not use caching, as it's a list that might change.
   */
  getTutorialLevels(pageSize: number, lastOrderId?: number): Observable<Level[]> {
    const levelsCollection = collection(this.firestore, 'levels');
    let q = query(
      levelsCollection,
      where('isTutorial', '==', true),
      orderBy('orderId'),
      limit(pageSize)
    );

    if (lastOrderId) {
      q = query(q, startAfter(lastOrderId));
    }

    return collectionData(q, { idField: 'id' }) as Observable<Level[]>;
  }
}
