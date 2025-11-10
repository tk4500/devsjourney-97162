import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor() { }

  /**
   * Retrieves an item from sessionStorage and parses it as JSON.
   * @param key The key of the item to retrieve.
   * @returns The stored item as a typed object, or null if not found or if parsing fails.
   */
  getItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return null;
    } catch (e) {
      console.error(`Error getting item '${key}' from sessionStorage`, e);
      // In case of parsing error, it's good practice to remove the corrupted item.
      sessionStorage.removeItem(key);
      return null;
    }
  }

  /**
   * Converts a value to a JSON string and saves it to sessionStorage.
   * @param key The key under which to store the item.
   * @param value The object or value to store.
   */
  setItem(key: string, value: any): void {
    try {
      if (value === null || value === undefined) {
        // Don't store null/undefined, just remove the key.
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.error(`Error saving item '${key}' to sessionStorage`, e);
    }
  }

  /**
   * Removes an item from sessionStorage.
   * @param key The key of the item to remove.
   */
  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   * Clears all items from sessionStorage for this domain.
   */
  clear(): void {
    sessionStorage.clear();
  }
}
