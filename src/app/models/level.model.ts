// Represents a single task objective within a level
export interface LevelTask {
  id: number;
  name: string;
  initialCompletion?: number; // Initial completion percentage (0-100)
}

// The static definition of a level, as stored in the 'levels' collection in Firestore
export interface Level {
  id: string;              // The Firestore document auto-ID
  orderId: number;         // The incremental integer for sorting
  name: string;            // The display name of the level (e.g., "Conhecendo as Ferramentas")
  isTutorial: boolean;     // True for official levels, false for player-made

  // Gameplay mechanic flags and initial values
  initialStamina?: number;
  usesStamina?: boolean;
  initialFocus?: number;
  usesFocus?: boolean;
  usesTime?: boolean;

  // Blockly configuration
  availableBlocks: string[]; // Array of block names (e.g., ['dev_task', 'controls_repeat'])

  // Objectives
  tasks: LevelTask[];
}
