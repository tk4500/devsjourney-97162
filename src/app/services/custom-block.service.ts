import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

interface BlockDefinition {
  jsonDefinition: string;
  generatorStub: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomBlockService {
  private firestore: Firestore = inject(Firestore);
  private definedBlocks = new Set<string>(); // Keep track of already defined blocks

  constructor() {
    this.loadCache();
  }

  private loadCache(): void {
    const cache = localStorage.getItem('blockly_custom_blocks');
    if (cache) {
      const blockNames = JSON.parse(cache);
      blockNames.forEach((name: string) => this.definedBlocks.add(name));
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
        const data = docSnap.data() as BlockDefinition;

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
