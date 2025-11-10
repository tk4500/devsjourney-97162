// Represents the player's saved data for a single level
export interface LevelProgress {
  score?: number;
  stars?: 0 | 1 | 2 | 3; // Number of stars earned
  completed: boolean;
}

// Represents the main player progress document, stored in 'playerProgress/{userId}' in Firestore
export interface PlayerProgress {
  id: string; // The player's Firebase Auth UID or 'guest'
  highestLevelCompleted?: number; // The highest orderId of a completed level
  unlockedLevels: string[];      // Array of level document IDs the player can access
  levelData: { [levelId: string]: LevelProgress }; // A map where the key is the level's document ID
}
