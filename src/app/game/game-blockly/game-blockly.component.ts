import { Component, inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlocklyWorkspaceService } from '../../services/blockly-workspace.service';
import { Level } from '../../models/level.model';
import { TutorialService } from '../../services/tutorial.service'; // For tutorial triggers

@Component({
  selector: 'app-game-blockly',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-blockly.component.html',
  styleUrls: ['./game-blockly.component.css']
})
export class GameBlocklyComponent implements OnChanges, OnDestroy {
  @Input() level: Level | null = null;

  private blocklyWorkspaceService = inject(BlocklyWorkspaceService);
  private tutorialService = inject(TutorialService); // For event emitting

  private readonly WORKSPACE_DIV_ID = 'blocklyDiv';

  // We need a listener to detect when the user places a block, for tutorial triggers.
  private onBlocklyEvent: ((event: any) => void) | null = null;

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    // This lifecycle hook runs whenever an @Input() property changes.
    // It's perfect for reacting when a new level is loaded.
    if (changes['level'] && this.level) {
      await this.setupWorkspaceForLevel(this.level);
    }
  }

  private async setupWorkspaceForLevel(level: Level): Promise<void> {
    // Delegate all the complex work to our service.
    await this.blocklyWorkspaceService.createWorkspace(this.WORKSPACE_DIV_ID, level);

    // After the workspace is created, attach our event listener.
    this.addBlocklyEventListener();
  }

  private addBlocklyEventListener(): void {
    if (this.blocklyWorkspaceService.workspace) {
      this.onBlocklyEvent = (event: any) => {
        // Check for an event that signifies a block was created/placed by the user
        if (event.type === 'create' && event.blockId) {
          // A new block was dragged from the toolbox or duplicated
          const block = this.blocklyWorkspaceService.workspace?.getBlockById(event.blockId);
          if (block) {
            // Emit a generic event and a specific one with the block type
            this.tutorialService.tutorialEvents$.next('blockPlaced');
            this.tutorialService.tutorialEvents$.next(`blockPlaced:${block.type}`);
          }
        }
      };
      this.blocklyWorkspaceService.workspace.addChangeListener(this.onBlocklyEvent);
    }
  }

  ngOnDestroy(): void {
    // CRITICAL: Clean up the workspace and the event listener to prevent memory leaks.
    if (this.blocklyWorkspaceService.workspace && this.onBlocklyEvent) {
      this.blocklyWorkspaceService.workspace.removeChangeListener(this.onBlocklyEvent);
    }
    this.blocklyWorkspaceService.disposeWorkspace();
  }
}
