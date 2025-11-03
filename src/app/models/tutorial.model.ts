export interface TutorialStep {
  explanation: string;

  // REFINED: Use a string ID to highlight ANY element on the page.
  // We'll add corresponding #ids to our HTML elements.
  highlightElementId?: string;

  // REFINED: Flexible positioning for Sérgio.
  sergio?: {
    image: string;
    // Use CSS properties directly for ultimate flexibility.
    // e.g., { top: '50%', left: '20%' } or { bottom: '10px', right: '10px' }
    position: { [key: string]: string };
    mirrored?: boolean;
  };

  // REFINED: The `nextOn` trigger is now a generic string.
  // The TutorialComponent will listen for events with this name.
  nextOn?: string; // e.g., 'blockPlaced:dev_task', 'codeRun'
}
