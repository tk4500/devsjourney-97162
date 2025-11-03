// Represents a single task within a level
export interface LevelTask {
  id: number;
  name: string;
  // We'll add a 'completion' property dynamically in the GameplayService
}

// The static definition of a level, stored in Firestore
export interface Level {
  id: string;
  orderId: number;
  name: string;
  isTutorial: boolean;
  initialStamina?: number;
  usesStamina?: boolean;
  initialFocus?: number;
  usesFocus?: boolean;
  usesTime?: boolean;
  availableBlocks: string[]; // e.g., ['dev_task', 'controls_repeat']
  tasks: LevelTask[];
}
