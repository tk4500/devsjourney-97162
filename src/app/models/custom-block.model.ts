export interface CustomBlock {
  id: string; // The block type, e.g., "dev_task"

  // Part 1: The visual definition for Blockly
  blocklyJson: {
    type: string;
    message0: string;
    args0?: any[];
    previousStatement: boolean | null;
    nextStatement: boolean | null;
    output?: string | null;
    colour: number;
    tooltip: string;
    helpUrl?: string;
  };

  // Part 2: The behavior (code generation and interpreter function)
  generatorStub: string; // The JavaScript code the block generates
  interpreterFunctionName: string; // The global function name the stub calls
}
