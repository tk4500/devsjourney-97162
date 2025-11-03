export interface LevelProgress {
  score?: number;      // The best score achieved on this level
  completed: boolean; // True if the level has been completed
  stars?: 0 | 1 | 2 | 3;   // Number of stars earned (0-3)
}

export interface PlayerProgress {
  id?: string; // The Firestore document auto-ID (matches User UID)
  levelData: { [levelId: string]: LevelProgress }; // Map of level IDs to their progress
  unlockedLevels: string[]; // List of level IDs that the player has unlocked
}
