import { Injectable, OnDestroy, inject } from '@angular/core';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { Level } from '../models/level.model';
import { CustomBlockService } from './custom-block.service'; // We need this to ensure blocks are defined

@Injectable({
  providedIn: 'root'
})
export class BlocklyWorkspaceService implements OnDestroy {
  public workspace: Blockly.WorkspaceSvg | null = null;
  private customBlockService = inject(CustomBlockService);

  // ngOnDestroy is useful in a service if it needs to clean up global listeners,
  // but in this case, the component will handle the workspace disposal.
  ngOnDestroy(): void {
    this.disposeWorkspace();
  }
  saveWorkspace() {
    if (!this.workspace) {
      console.warn("[BlocklyWorkspaceService] saveWorkspace called before workspace is created.");
      return;
    }
    console.log(Blockly.serialization.workspaces.save(this.workspace));
  }

  /**
   * Creates and injects a new Blockly workspace into a given DOM element.
   * This is the main entry point for the service.
   * @param elementId The ID of the div where the workspace will be rendered.
   * @param level The level data, used to configure the toolbox.
   */
  async createWorkspace(elementId: string, level: Level): Promise<void> {
    this.disposeWorkspace(); // Clear any old workspace first.

    const blocklyDiv = document.getElementById(elementId);
    if (!blocklyDiv) {
      console.error(`[BlocklyWorkspaceService] Element with ID '${elementId}' not found.`);
      return;
    }

    // 1. Ensure all custom blocks for this level are defined before creating the workspace.
    // This is crucial for the toolbox to render correctly.
    await this.customBlockService.ensureBlocksDefined(level.availableBlocks);

    // 2. Create the toolbox definition from the level data.
    const toolbox = this.createToolbox(level.availableBlocks);

    // 3. Inject the Blockly workspace.
    this.workspace = Blockly.inject(blocklyDiv, {
      toolbox,
      media: 'media/', // IMPORTANT: You must have the 'media/' folder from the blockly package in your 'src' or 'assets' folder.
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true },
      renderer: 'zelos' // A modern, nice-looking renderer.
    });

    if (level.initialWorkspace) {
      try {
        const workspaceJson = JSON.parse(level.initialWorkspace);
        Blockly.serialization.workspaces.load(workspaceJson, this.workspace);
      } catch (error) {
        console.error("[BlocklyWorkspaceService] Failed to load initial workspace:", error);
      }
    }

  }

  /**
   * Generates the JavaScript code from the current blocks in the workspace.
   * @returns A string of executable JavaScript code.
   */
  public getCode(): string {
    if (!this.workspace) {
      console.warn("[BlocklyWorkspaceService] getCode called before workspace is created.");
      return '';
    }

    // Configure the generator for our interpreter's highlighting feature.
    javascriptGenerator.INFINITE_LOOP_TRAP = null; // Important for allowing loops.
    javascriptGenerator.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    javascriptGenerator.addReservedWords('highlightBlock');

    return javascriptGenerator.workspaceToCode(this.workspace);
  }

  /**
   * Safely disposes of the current Blockly workspace to prevent memory leaks.
   */
  public disposeWorkspace(): void {
    if (this.workspace) {
      this.workspace.dispose();
      this.workspace = null;
    }
  }

  /**
   * Dynamically builds the toolbox configuration based on the list of available block names.
   */
  private createToolbox(availableBlocks: string[]): Blockly.utils.toolbox.ToolboxDefinition {
    // We can add categories later if needed. For now, a simple list is fine.
    const contents = availableBlocks.map(blockType => {

      // --- THE FIX IS HERE ---
      // If the block is our custom 'dev_task', provide a more complex
      // definition that includes a shadow block for the input.
      if (blockType === 'dev_task') {
        return {
          kind: 'block',
          type: 'dev_task',
          inputs: {
            // The key 'TASK_ID' must match the 'name' of the input_value in the block's JSON definition.
            TASK_ID: {
              shadow: {
                type: 'math_number', // The type of the default block we want.
                fields: {
                  NUM: 1 // The default value for the 'NUM' field inside the math_number block.
                }
              }
            }
          }
        };
      }

      // For all other blocks, return the simple definition as before.
      return {
        kind: 'block',
        type: blockType
      };
    });

    return {
      kind: 'flyoutToolbox',
      contents: contents
    };
  }
}
