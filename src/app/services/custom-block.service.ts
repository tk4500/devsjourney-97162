import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import * as Blockly from 'blockly';
import { javascriptGenerator, JavascriptGenerator } from 'blockly/javascript';
import { CustomBlock } from '../models/custom-block.model';
@Injectable({
  providedIn: 'root'
})
export class CustomBlockService {
  private firestore: Firestore = inject(Firestore);
  private definedBlocks = new Set<string>(); // Keep track of already defined blocks

  constructor() {  }
 /**
   * Ensures that all requested custom blocks are defined in the Blockly engine.
   * It fetches definitions from localStorage first, then from Firestore if not found.
   * @param blockNames An array of block names required for a level (e.g., ['dev_task', 'dev_coffee']).
   */
async ensureBlocksDefined(blockNames: string[]): Promise<void> {
    // Create a list of blocks that we haven't defined yet in this session.
    const blocksToDefine = blockNames.filter(name => !this.definedBlocks.has(name));

    if (blocksToDefine.length === 0) {
      return; // All required blocks are already defined.
    }

    // Process each new block that needs to be defined.
    for (const name of blocksToDefine) {
      let data = this.loadBlockFromCache(name);

      if (!data) {
        console.log(`Fetching definition for block '${name}' from Firestore...`);
        const blockDocRef = doc(this.firestore, `customBlocks/${name}`);
        const docSnap = await getDoc(blockDocRef);

        if (docSnap.exists()) {
          data = docSnap.data() as CustomBlock;
          this.saveBlockToCache(name, data);
        } else {
          console.warn(`Block definition for '${name}' not found in Firestore.`);
          continue; // Skip to the next block
        }
      }

      this.defineBlock(name, data);
      this.definedBlocks.add(name);
    }
  }

/**
   * The core logic that teaches Blockly about a new block.
   */
private defineBlock(name: string, definition: CustomBlock): void {

  const jsonObject = JSON.parse(definition.jsonDefinition);
  // 1. Define the block's appearance (This part is correct)
  Blockly.Blocks[name] = {
    init: function() { this.jsonInit(jsonObject); }
  };

  // 2. Define the block's code generation logic (THE FIX)
  // Create the function from the string.
    const generatorFunction = new Function('block', 'generator', definition.generatorStub);
    javascriptGenerator.forBlock[name] = generatorFunction as (
      block: Blockly.Block,
      generator: JavascriptGenerator
    ) => string | [string, number] | null;
  }

private loadBlockFromCache(blockName: string): CustomBlock | null {
    const cachedData = localStorage.getItem(`block_${blockName}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }

  private saveBlockToCache(blockName: string, data: CustomBlock): void {
    try {
      localStorage.setItem(`block_${blockName}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to cache block '${blockName}'`, e);
    }
  }

  private saveToCache(blockName: string): void {
    this.definedBlocks.add(blockName);
    localStorage.setItem('blockly_custom_blocks', JSON.stringify(Array.from(this.definedBlocks)));
  }

  /**
   * Fetches, defines, and caches custom blocks from Firestore.
   * @param blockNames An array of block names to ensure are defined.
   */
  async defineBlocks(blockNames: string[]): Promise<void> {
    for (const name of blockNames) {
      if (this.definedBlocks.has(name)) {
        continue; // Skip if already defined in this session or from cache
      }

      console.log(`Fetching definition for block: ${name}`);
      const blockDocRef = doc(this.firestore, `customBlocks/${name}`);
      const docSnap = await getDoc(blockDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as CustomBlock;

        // Define the block's appearance (JSON)
        const jsonDef = JSON.parse(data.jsonDefinition);
        Blockly.Blocks[name] = {
          init: function() { this.jsonInit(jsonDef); }
        };

        // Define the block's code generation (JavaScript)
        // Using 'new Function' is a safe way to execute string-based code from a trusted source (your Firestore)
        javascriptGenerator.forBlock[name] = function(block){
          const localFunction = new Function('block', data.generatorStub);
          return localFunction(block);
        }

        this.saveToCache(name);
      } else {
        console.warn(`Block definition for '${name}' not found in Firestore.`);
      }
    }
  }
}
