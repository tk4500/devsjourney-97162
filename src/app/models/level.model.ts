// Represents a single task objective within a level
export interface LevelTask {
  id: number;
  name: string;
  initialCompletion?: number; // Initial completion percentage (0-100)
}

export interface ScoreObjectives {
  blocks: number;     // Weight for the number of blocks used
  focus?: number;      // Weight for average focus (more complex, for later)
  time?: number;       // Weight for time taken
  codeSize?: number;   // Weight for the generated code's string length
}

export interface ScoreWeights {
  blocks?: number;     // Weight for the number of blocks used
  stamina?: number;    // Weight for final stamina
  focus?: number;      // Weight for average focus (more complex, for later)
  time?: number;       // Weight for time taken
  codeSize?: number;   // Weight for the generated code's string length
}
export interface Level {
  id: string;              // The Firestore document auto-ID
  orderId: number;         // The incremental integer for sorting
  name: string;            // The display name of the level (e.g., "Conhecendo as Ferramentas")
  isTutorial: boolean;     // True for official levels, false for player-made

  // Gameplay mechanic flags and initial values
  initialWorkspace?: string;
  initialStamina?: number;
  usesStamina?: boolean;
  initialFocus?: number;
  usesFocus?: boolean;
  usesTime?: boolean;

  // Blockly configuration
  availableBlocks: string[]; // Array of block names (e.g., ['dev_task', 'controls_repeat'])
  scoreWeights?: ScoreWeights;
  scoreObjectives?: ScoreObjectives;

  // Objectives
  tasks: LevelTask[];
}
