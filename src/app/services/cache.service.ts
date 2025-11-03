import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  // Uses sessionStorage, which is cleared when the browser tab is closed.
  // Perfect for temporary caching of static data during a game session.

  setItem<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to sessionStorage', e);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error getting from sessionStorage', e);
      return null;
    }
  }
}
