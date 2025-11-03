import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore, limit, orderBy, query, startAfter, where } from '@angular/fire/firestore';
import { Level } from '../models/level.model';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class LevelService {
  private firestore: Firestore = inject(Firestore);
  public selectedLevelSubject = new BehaviorSubject<Level | null>(null);
  public selectedLevel$ = this.selectedLevelSubject.asObservable();

  public selectLevel(level: Level): void {
    this.selectedLevelSubject.next(level);
  }
  constructor(private cacheService: CacheService) {}

  getTutorialLevels(pageSize: number, lastOrderId?: number): Observable<Level[]> {
    const levelsCollection = collection(this.firestore, 'levels');

    // Base query
    let q = query(
      levelsCollection,
      where('isTutorial', '==', true),
      orderBy('orderId'),
      limit(pageSize)
    );

    // If we have a lastOrderId, add the startAfter constraint for pagination
    if (lastOrderId) {
      q = query(q, startAfter(lastOrderId));
    }

    return collectionData(q, { idField: 'id' }) as Observable<Level[]>;
  }

  async getFirstLevel(): Promise<Level | null> {
    const levelsCollection = collection(this.firestore, 'levels');
    const firstLevelQuery = query(
      levelsCollection,
      where('orderId', '==', 1),
      limit(1)
    );

    const levels$ = collectionData(firstLevelQuery, { idField: 'id' }) as Observable<Level[]>;
    const levels = await firstValueFrom(levels$); // Convert Observable to Promise to get the value once

    return levels.length > 0 ? levels[0] : null;
  }
}
