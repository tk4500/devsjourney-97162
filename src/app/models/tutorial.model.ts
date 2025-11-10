// Represents a single step in a tutorial sequence, stored in 'tutorials/{levelId}'
export interface TutorialStep {
  explanation: string; // The text Sérgio will say

  // An ID of an HTML element to highlight (e.g., '#run-button', '#blockly-toolbox')
  highlightElementId?: string;

  // Configuration for displaying Sérgio Sênior
  sergio?: {
    image: string; // Filename of the sprite (e.g., 'SergioPointing.png')
    // CSS position properties for flexible placement
    position: {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    };
    mirrored?: boolean; // If true, we'll flip the image with CSS `transform: scaleX(-1)`
  };
  dialoguePosition?: { [key: string]: string };

  // The event that will trigger the tutorial to advance to the next step
  // 'click' is the default and means the user just clicks to continue.
  nextOn?: 'click' | 'blockPlaced' | 'codeRun' | string; // Can be a custom event name
}
