import { Injectable } from '@angular/core';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { Level } from '../models/level.model';

@Injectable({
  providedIn: 'root'
})
export class BlocklyWorkspaceService {
  public workspace: Blockly.WorkspaceSvg | null = null;

  public injectWorkspace(elementId: string, level: Level): void {
    // Clear any previous workspace
    if (this.workspace) {
      this.workspace.dispose();
    }

    const blocklyDiv = document.getElementById(elementId);
    if (!blocklyDiv) {
      console.error(`Element with ID '${elementId}' not found for Blockly.`);
      return;
    }

    const toolbox = this.createToolbox(level.availableBlocks);

    this.workspace = Blockly.inject(blocklyDiv, {
      toolbox,
      media: 'media/', // Make sure you have the media folder from Blockly in your assets
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true },
    });
  }

  private createToolbox(availableBlocks: string[]): Blockly.utils.toolbox.ToolboxDefinition {
    const contents = availableBlocks.map(blockType => ({
      kind: 'block',
      type: blockType
    }));

    return {
      kind: 'flyoutToolbox',
      contents: contents
    };
  }

  public getCode(): string {
    if (!this.workspace) return '';

    // Configure the generator for highlighting
    javascriptGenerator.INFINITE_LOOP_TRAP = null;
    javascriptGenerator.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    javascriptGenerator.addReservedWords('highlightBlock');

    const code = javascriptGenerator.workspaceToCode(this.workspace);
    return code;
  }
}
